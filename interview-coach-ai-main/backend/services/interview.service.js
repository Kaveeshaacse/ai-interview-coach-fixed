import { interviewRepository } from '../repositories/interview.repository.js';
import { generateInterviewQuestions, evaluateInterviewAnswer,
         generateTechnicalQuestions, evaluateTechnicalAnswer } from './aiService.js';
import { BEHAVIOURAL_TOPICS } from '../utils/behaviouralQuestions.js';
import { getSkillsForRole, ALL_TECHNICAL_ROLES } from '../utils/roleSkillsMap.js';
import { getMergedBehaviouralQuestions, getMergedTechnicalQuestions } from './questionBankBridge.service.js';
import { recordActivity } from './activity.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// Interview Service — business logic for mock + technical interviews
// ─────────────────────────────────────────────────────────────────────────────

// ── Mock Behavioural Interview ──────────────────────────────────────────────

export async function startMockInterview(userId, {
  behaviouralTopic = 'General Behavioural',
  difficulty       = 'Medium',
  count            = 5,
}) {
  // Validate topic
  const topic = BEHAVIOURAL_TOPICS.includes(behaviouralTopic)
    ? behaviouralTopic
    : 'General Behavioural';

  // Get topic-specific behavioural questions (built-in bank + any active admin-added ones)
  const questions = await getMergedBehaviouralQuestions(topic, difficulty, count);

  if (!questions || questions.length === 0) {
    throw Object.assign(
      new Error(`No questions available for topic "${topic}" at difficulty "${difficulty}"`),
      { statusCode: 400 }
    );
  }

  // Create session in DB
  const session = await interviewRepository.create(userId, {
    role:       `Behavioural — ${topic}`,
    type:       'Behavioral',
    technology: topic,
    difficulty,
  });

  await interviewRepository.saveQuestions(session.id, questions);

  return {
    sessionId:       session.id,
    behaviouralTopic: topic,
    difficulty,
    totalQuestions:  questions.length,
    questions,
  };
}

export async function getInterviewQuestion(userId, sessionId, questionIndex) {
  const session = await interviewRepository.findById(sessionId);
  if (!session) {
    throw Object.assign(new Error('Interview session not found'), { statusCode: 404 });
  }
  if (session.user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
  }

  const question = session.questions[questionIndex] || session.questions[0];
  return {
    questionIndex:  questionIndex,
    totalQuestions: session.questions.length,
    question: {
      question:   question.question_text,
      topic:      question.topic,
      category:   question.category,
      difficulty: question.difficulty,
    },
  };
}

export async function submitAnswer(userId, sessionId, { questionIndex = 0, question = '', answer = '', role = 'Software Engineer' }) {
  if (!answer || !answer.trim()) {
    throw Object.assign(new Error('Please provide an answer'), { statusCode: 400 });
  }

  const session = await interviewRepository.findById(sessionId);
  let questionText = question;
  let questionId   = null;

  if (session) {
    if (session.user_id !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }
    const dbQ = session.questions[questionIndex];
    if (dbQ) {
      questionText = dbQ.question_text;
      questionId   = dbQ.id;
    }
  }

  if (!questionText) questionText = 'Tell me about yourself and your background.';

  // Evaluate with AI
  const evaluation = await evaluateInterviewAnswer(questionText, answer, session?.role || role);

  // Save answer to DB
  if (session) {
    await interviewRepository.saveAnswer(session.id, questionId, questionIndex, {
      question:        questionText,
      userAnswer:      answer,
      score:           evaluation.score,
      clarityScore:    evaluation.clarityScore,
      grammarScore:    evaluation.grammarScore,
      confidenceScore: evaluation.confidenceScore,
      technicalScore:  evaluation.technicalScore,
      feedback:        evaluation.feedback,
      strengths:       evaluation.strengths,
      weaknesses:      evaluation.weaknesses,
      improvedAnswer:  evaluation.improvedAnswer,
    });

    // Recalculate running average score
    await interviewRepository.recalculateAndUpdateScore(session.id);
  }

  // Record activity
  recordActivity(userId, 'interview', {
    role:       session?.role || role,
    type:       session?.type || 'Mock Interview',
    difficulty: session?.difficulty || 'Medium',
    score:      evaluation.score || 0,
  }).catch(() => {});

  return { questionIndex, ...evaluation };
}

export async function getInterviewResults(userId, sessionId) {
  const session = await interviewRepository.findById(sessionId);
  if (!session) {
    throw Object.assign(new Error('Interview session not found'), { statusCode: 404 });
  }
  if (session.user_id !== userId) {
    throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
  }

  if (session.status !== 'completed') {
    await interviewRepository.markCompleted(sessionId);
  }

  const recommendedTopics = [
    ...new Set(session.answers.flatMap(a => a.weaknesses || [])),
  ].slice(0, 5);

  return {
    sessionId:       session.id,
    role:            session.role,
    type:            session.type,
    difficulty:      session.difficulty,
    totalScore:      session.total_score,
    strengths:       session.strengths,
    weaknesses:      session.weaknesses,
    overallFeedback: session.overall_feedback,
    recommendedTopics,
    answersCount:    session.answers.length,
    answers:         session.answers.map(formatAnswer),
    completedAt:     session.completed_at,
  };
}

export async function getInterviewHistory(userId) {
  const records = await interviewRepository.findByUser(userId, { status: null });
  return records.map(r => ({
    id:         r.id,
    date:       new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    role:       r.role,
    type:       r.type,
    difficulty: r.difficulty,
    score:      r.total_score || 0,
    status:     r.status,
    duration:   `${r.duration_minutes || 15} min`,
  }));
}

// ── Technical Interview ─────────────────────────────────────────────────────

export async function startTechnicalInterview(userId, {
  role       = 'Software Engineer',
  difficulty = 'Medium',
  count      = 5,
}) {
  // Validate role
  const validRole = ALL_TECHNICAL_ROLES.includes(role) ? role : 'Software Engineer';

  // Get role-specific technical questions (built-in bank + any active admin-added ones)
  let questions = await getMergedTechnicalQuestions(validRole, difficulty, count);

  // Fallback: use AI if question bank is empty for this role/difficulty
  if (!questions || questions.length === 0) {
    const skills = getSkillsForRole(validRole).join(', ');
    const aiRes  = await generateTechnicalQuestions(validRole, skills, difficulty);
    questions    = (aiRes.questions || []).map((q, i) => ({
      id: `ai_${i}`, question: q.question, topic: q.topic || 'Technical', difficulty,
    }));
  }

  const session = await interviewRepository.create(userId, {
    role:       validRole,
    type:       'Technical',
    technology: getSkillsForRole(validRole).slice(0, 3).join(', '),
    difficulty,
  });

  await interviewRepository.saveQuestions(session.id, questions);

  return {
    sessionId:    session.id,
    role:         validRole,
    skillTopics:  getSkillsForRole(validRole),
    difficulty,
    totalQuestions: questions.length,
    questions,
  };
}

export async function submitTechnicalAnswer(userId, { sessionId, questionIndex = 0, question = '', answer = '', role = 'Software Engineer', technology = 'General' }) {
  if (!answer || !answer.trim()) {
    throw Object.assign(new Error('Please provide an answer'), { statusCode: 400 });
  }

  let session      = null;
  let questionText = question;
  let questionId   = null;

  if (sessionId) {
    session = await interviewRepository.findById(sessionId);
    if (session && session.user_id !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }
    const dbQ = session?.questions?.[questionIndex];
    if (dbQ) {
      questionText = dbQ.question_text;
      questionId   = dbQ.id;
    }
  }

  if (!questionText) questionText = question || 'Explain a key technical concept.';

  const evaluation = await evaluateTechnicalAnswer(
    questionText, answer, session?.role || role, technology
  );

  if (session) {
    await interviewRepository.saveAnswer(session.id, questionId, questionIndex, {
      question:       questionText,
      userAnswer:     answer,
      score:          evaluation.score,
      technicalScore: evaluation.score,
      feedback:       evaluation.feedback,
      strengths:      evaluation.strengths || [],
      weaknesses:     evaluation.improvements || [],
    });
    await interviewRepository.recalculateAndUpdateScore(session.id);
  }

  recordActivity(userId, 'interview', {
    role:       session?.role || role,
    type:       'Technical',
    difficulty: session?.difficulty || 'Medium',
    score:      evaluation.score || 0,
  }).catch(() => {});

  return { questionIndex, ...evaluation };
}

export async function getTechnicalHistory(userId) {
  const records = await interviewRepository.findByUser(userId, { type: 'Technical' });
  return records.map(r => ({
    id:         r.id,
    date:       new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    role:       r.role,
    technology: r.technology || '',
    difficulty: r.difficulty,
    score:      r.total_score || 0,
    status:     r.status,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatAnswer(a) {
  return {
    questionOrder:   a.question_order,
    question:        a.question_text,
    userAnswer:      a.user_answer,
    score:           a.score,
    clarityScore:    a.clarity_score,
    grammarScore:    a.grammar_score,
    confidenceScore: a.confidence_score,
    technicalScore:  a.technical_score,
    feedback:        a.feedback,
    strengths:       a.strengths,
    weaknesses:      a.weaknesses,
    improvedAnswer:  a.improved_answer,
  };
}
