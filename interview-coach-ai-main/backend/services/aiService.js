import axios from 'axios';

const isLiveAIEnabled = () => {
  return process.env.USE_MOCK_AI === 'false' && Boolean(process.env.AI_API_KEY);
};

/**
 * Generic helper to invoke LLM API with structured prompt
 */
const callLLM = async (systemPrompt, userPrompt) => {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const response = await axios.post(
    apiUrl,
    {
      model,
      messages: [
        { role: 'system', content: `${systemPrompt}\nReturn ONLY valid JSON matching the requested structure without markdown backticks.` },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 25000,
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty response from LLM');
  return JSON.parse(raw);
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. RESUME ANALYZER
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeResume = async (resumeText = '') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Analyze this resume and provide structured feedback:
"${resumeText.slice(0, 3000)}"

Return JSON with format:
{
  "score": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "suggestions": [string],
  "missingSections": [string],
  "skills": [string],
  "sectionScores": [
    { "label": "Contact Info", "score": number },
    { "label": "Summary", "score": number },
    { "label": "Experience", "score": number },
    { "label": "Education", "score": number },
    { "label": "Skills", "score": number },
    { "label": "Projects", "score": number }
  ]
}`;
      return await callLLM('You are an expert technical recruiter and resume reviewer.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for resume analysis, using heuristic engine:', err.message);
    }
  }

  // Heuristic Analysis Engine
  const textLower = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

  const hasSummary = textLower.includes('summary') || textLower.includes('objective') || textLower.includes('about');
  const hasExperience = textLower.includes('experience') || textLower.includes('work') || textLower.includes('employment') || textLower.includes('internship');
  const hasEducation = textLower.includes('education') || textLower.includes('bachelor') || textLower.includes('b.tech') || textLower.includes('university') || textLower.includes('college');
  const hasProjects = textLower.includes('projects') || textLower.includes('project');
  const hasSkills = textLower.includes('skills') || textLower.includes('technologies') || textLower.includes('competencies');
  const hasCertifications = textLower.includes('certification') || textLower.includes('certified') || textLower.includes('certificate');
  const hasLinks = textLower.includes('github') || textLower.includes('linkedin') || textLower.includes('http');
  const hasMetrics = /\d+[\s%kKmM+]|\$\d+/.test(resumeText);

  let score = 50;
  if (hasSummary) score += 8;
  if (hasExperience) score += 12;
  if (hasEducation) score += 8;
  if (hasProjects) score += 10;
  if (hasSkills) score += 8;
  if (hasCertifications) score += 4;
  if (hasLinks) score += 5;
  if (hasMetrics) score += 5;
  if (wordCount >= 200 && wordCount <= 700) score += 5;

  score = Math.min(95, Math.max(45, score));

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const missingSections = [];

  if (hasSkills) strengths.push('Identified distinct technical skills section');
  if (hasExperience) strengths.push('Structured experience / internship history present');
  if (hasEducation) strengths.push('Clear educational background listed');
  if (hasLinks) strengths.push('Included professional links (GitHub / LinkedIn)');
  if (hasMetrics) strengths.push('Included quantifiable results and metrics');
  if (strengths.length < 3) strengths.push('Clean layout and readable formatting');

  if (!hasLinks) {
    weaknesses.push('Missing direct links to GitHub or LinkedIn profile');
    suggestions.push('Add active links to your GitHub profile and live project demos');
  }
  if (!hasMetrics) {
    weaknesses.push('Lacks quantifiable accomplishments in work/project descriptions');
    suggestions.push('Use the X-Y-Z formula: Accomplished [X], measured by [Y], by doing [Z]');
  }
  if (!hasCertifications) {
    missingSections.push('Certifications');
    suggestions.push('Add relevant industry certifications (e.g. AWS, Meta, Coursera)');
  }
  if (!hasProjects) {
    missingSections.push('Key Projects');
    suggestions.push('Highlight 2-3 substantial projects detailing tech stack and outcomes');
  }
  if (!hasSummary) {
    missingSections.push('Professional Summary');
    suggestions.push('Add a 2-sentence impact summary targeting your ideal job role');
  }

  suggestions.push('Ensure consistent bullet point verbs (Architected, Implemented, Streamlined)');

  return {
    score,
    strengths,
    weaknesses: weaknesses.length ? weaknesses : ['Could benefit from more domain-specific keywords'],
    suggestions,
    missingSections: missingSections.length ? missingSections : ['Certifications'],
    skills: ['JavaScript', 'React', 'Node.js', 'Data Structures', 'Git', 'Problem Solving'],
    sectionScores: [
      { label: 'Contact Info', score: hasLinks ? 95 : 75 },
      { label: 'Summary', score: hasSummary ? 85 : 50 },
      { label: 'Experience', score: hasExperience ? 80 : 55 },
      { label: 'Education', score: hasEducation ? 85 : 60 },
      { label: 'Skills', score: hasSkills ? 88 : 60 },
      { label: 'Projects', score: hasProjects ? 80 : 45 },
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ATS OPTIMIZATION MODULE
// ─────────────────────────────────────────────────────────────────────────────
const roleKeywordsMap = {
  'Software Engineer': ['Data Structures', 'Algorithms', 'Java', 'Python', 'Git', 'System Design', 'REST API', 'Unit Testing', 'CI/CD', 'Docker', 'SQL', 'Agile'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind', 'Redux', 'Responsive Design', 'REST API', 'Webpack', 'Performance', 'Git'],
  'Backend Developer': ['Node.js', 'Express', 'Python', 'Java', 'SQL', 'MongoDB', 'PostgreSQL', 'Microservices', 'Redis', 'Docker', 'REST API', 'AWS', 'Security'],
  'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL', 'REST API', 'Docker', 'AWS', 'Git', 'HTML/CSS', 'System Design'],
  'Data Scientist': ['Python', 'R', 'Pandas', 'NumPy', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'SQL', 'Data Visualization', 'Machine Learning', 'Statistics', 'NLP'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Jenkins', 'Monitoring', 'Git', 'Bash', 'Networking', 'Security'],
};

export const calculateATS = async (resumeText = '', targetRole = 'Software Engineer') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Analyze this resume against the target role "${targetRole}":
Resume Text: "${resumeText.slice(0, 3000)}"

Return JSON:
{
  "atsScore": number (0-100),
  "keywordMatch": number (0-100),
  "skillMatch": number (0-100),
  "matchingKeywords": [string],
  "missingKeywords": [string],
  "matchingSkills": [string],
  "missingSkills": [string],
  "suggestions": [string]
}`;
      return await callLLM('You are an expert ATS (Applicant Tracking System) scanner.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for ATS calculation, using heuristic engine:', err.message);
    }
  }

  const textLower = resumeText.toLowerCase();
  const targetKeywords = roleKeywordsMap[targetRole] || roleKeywordsMap['Software Engineer'];

  const matchingKeywords = [];
  const missingKeywords = [];

  targetKeywords.forEach((kw) => {
    if (textLower.includes(kw.toLowerCase())) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatch = Math.round((matchingKeywords.length / targetKeywords.length) * 100) || 50;
  const skillMatch = Math.min(100, keywordMatch + 5);
  const atsScore = Math.round(keywordMatch * 0.6 + skillMatch * 0.4);

  return {
    atsScore,
    keywordMatch,
    skillMatch,
    matchingKeywords,
    missingKeywords,
    matchingSkills: matchingKeywords.slice(0, 4),
    missingSkills: missingKeywords.slice(0, 4),
    suggestions: [
      `Add key missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`,
      `Tailor your summary to specifically mention the "${targetRole}" title`,
      `Quantify achievements in projects that used ${matchingKeywords[0] || 'relevant tools'}`,
      'Use standard ATS-compliant fonts and clean section headers',
      'Avoid tables or multi-column layouts that may confuse parsers',
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MOCK INTERVIEW MODULE
// ─────────────────────────────────────────────────────────────────────────────
export const generateInterviewQuestions = async (role = 'Software Engineer', type = 'Behavioral', difficulty = 'Medium') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Generate 5 interview questions for a ${difficulty} level ${type} interview for the role of ${role}.
Return JSON:
{
  "questions": [
    { "id": 1, "question": string, "topic": string }
  ]
}`;
      return await callLLM('You are an expert hiring manager and interviewer.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for interview question generation:', err.message);
    }
  }

  const roleQuestions = {
    Behavioral: [
      { id: 1, question: 'Tell me about yourself and what attracted you to this role.', topic: 'Introduction' },
      { id: 2, question: 'Describe a challenging engineering situation you faced and how you resolved it.', topic: 'Problem Solving' },
      { id: 3, question: 'How do you handle disagreements on technical design within a team?', topic: 'Collaboration' },
      { id: 4, question: 'Tell me about a time you had to adapt quickly to unexpected project requirement changes.', topic: 'Adaptability' },
      { id: 5, question: 'Where do you see your technical trajectory over the next 3 to 5 years?', topic: 'Career Vision' },
    ],
    Technical: [
      { id: 1, question: `What are the key architectural tradeoffs when choosing microservices vs monolith for a ${role} system?`, topic: 'Architecture' },
      { id: 2, question: 'Explain how you optimize database query latency and handle indexing on high-throughput tables.', topic: 'Databases' },
      { id: 3, question: 'How do you approach caching and consistency in distributed environments?', topic: 'System Design' },
      { id: 4, question: 'What security best practices do you incorporate when developing REST / GraphQL APIs?', topic: 'API Security' },
      { id: 5, question: 'How do you design a CI/CD pipeline to ensure zero-downtime deployments?', topic: 'DevOps' },
    ],
    HR: [
      { id: 1, question: 'Why do you want to join our organization specifically?', topic: 'Company Fit' },
      { id: 2, question: 'How do you maintain productivity and manage work-life balance during high-pressure sprint deadlines?', topic: 'Work Ethic' },
      { id: 3, question: 'What are your salary expectations and relocation preferences?', topic: 'Expectations' },
      { id: 4, question: 'Describe your ideal manager and work environment.', topic: 'Culture' },
      { id: 5, question: 'Do you have any questions for us about the company or the team?', topic: 'Curiosity' },
    ],
  };

  return {
    questions: roleQuestions[type] || roleQuestions.Behavioral,
  };
};

export const evaluateInterviewAnswer = async (question = '', userAnswer = '', role = 'Software Engineer') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Evaluate this interview answer for the role of ${role}:
Question: "${question}"
Candidate's Answer: "${userAnswer}"

Return JSON:
{
  "score": number (0-100),
  "clarityScore": number (0-100),
  "grammarScore": number (0-100),
  "confidenceScore": number (0-100),
  "technicalScore": number (0-100),
  "overallScore": number (0-100),
  "strengths": [string],
  "weaknesses": [string],
  "feedback": string,
  "improvedAnswer": string
}`;
      return await callLLM('You are a senior tech lead evaluating interview answers.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for interview evaluation:', err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HEURISTIC EVALUATION ENGINE
  // Scores based on ACTUAL answer content — not hardcoded values.
  // Different answers WILL produce different scores.
  // ─────────────────────────────────────────────────────────────────────────

  const answer     = userAnswer.trim();
  const wordCount  = answer.split(/\s+/).filter(Boolean).length;
  const sentences  = answer.split(/[.!?]+/).filter(s => s.trim().length > 3).length;

  // ── STAR Framework detection ──────────────────────────────────────────────
  const hasSituation  = /\b(when|during|while|in my|at my|working on|we were|i was|project|team|college|semester|internship|previous|last year|situation|context)\b/i.test(answer);
  const hasTask       = /\b(responsible|task|goal|objective|assigned|needed to|had to|required|challenge|problem|issue|deadline)\b/i.test(answer);
  const hasAction     = /\b(i (did|worked|created|built|implemented|developed|decided|chose|talked|communicated|led|organised|fixed|resolved|designed|wrote|started|finished|helped|managed|improved|analysed|investigated)|so i|first i|then i|finally i|my approach|my solution|i took)\b/i.test(answer);
  const hasResult     = /\b(result|outcome|achieved|successfully|completed|improved|reduced|increased|saved|delivered|finished|on time|ahead of|percent|%|days|hours|feedback|recognised|promoted|learned|led to|as a result|consequently|in the end)\b/i.test(answer);

  const starScore = (hasSituation ? 1 : 0) + (hasTask ? 1 : 0) + (hasAction ? 1 : 0) + (hasResult ? 1 : 0);

  // ── Specificity signals ──────────────────────────────────────────────────
  const hasNumbers     = /\d+/.test(answer);
  const hasMetrics     = /\d+\s*(%|percent|hours|days|weeks|members|people|users|requests|errors|bugs|features|ms|seconds|minutes)/i.test(answer);
  const hasSpecifics   = /\b(specifically|in particular|for example|for instance|such as|namely|including|especially)\b/i.test(answer);
  const hasPersonal    = /\b(i |my |me |myself)\b/i.test(answer);
  const hasLearning    = /\b(learned|realised|understood|taught me|takeaway|reflection|growth|improved|now i|since then|going forward)\b/i.test(answer);

  // ── Negative signals ─────────────────────────────────────────────────────
  const hasFillers     = (answer.match(/\b(um|uh|like,|you know|kind of|sort of|basically|literally|obviously|stuff|things|etc)\b/gi) || []).length;
  const isVague        = !hasSituation && !hasTask && !hasAction;
  const isOneWord      = wordCount <= 3;
  const isTooShort     = wordCount < 15;
  const isBareMinimum  = wordCount < 30 && starScore <= 1;

  // ── LENGTH scoring (0–20 pts) ─────────────────────────────────────────────
  let lengthScore = 0;
  if      (wordCount <= 3)   lengthScore = 0;
  else if (wordCount <= 10)  lengthScore = 5;
  else if (wordCount <= 25)  lengthScore = 10;
  else if (wordCount <= 50)  lengthScore = 14;
  else if (wordCount <= 100) lengthScore = 17;
  else if (wordCount <= 200) lengthScore = 20;
  else                       lengthScore = 18; // too long, slight deduction

  // ── STAR scoring (0–40 pts) ───────────────────────────────────────────────
  const starPoints = starScore * 10; // 10 per element, max 40

  // ── SPECIFICITY scoring (0–20 pts) ───────────────────────────────────────
  let specificityScore = 0;
  if (hasPersonal)   specificityScore += 4;
  if (hasSpecifics)  specificityScore += 4;
  if (hasNumbers)    specificityScore += 5;
  if (hasMetrics)    specificityScore += 5;
  if (hasLearning)   specificityScore += 2;

  // ── QUALITY penalties ─────────────────────────────────────────────────────
  let penalty = 0;
  if (isOneWord)    penalty += 30;
  if (isTooShort)   penalty += 15;
  if (isBareMinimum) penalty += 10;
  if (isVague)      penalty += 10;
  penalty += Math.min(10, hasFillers * 2);

  // ── COMMUNICATION bonus (0–20 pts) ───────────────────────────────────────
  let commBonus = 0;
  if (sentences >= 2)  commBonus += 5;
  if (sentences >= 4)  commBonus += 5;
  if (sentences >= 6)  commBonus += 5;
  if (wordCount > 50 && sentences >= 3) commBonus += 5;

  // ── FINAL SCORE ───────────────────────────────────────────────────────────
  const rawScore = lengthScore + starPoints + specificityScore + commBonus - penalty;
  const score    = Math.min(97, Math.max(5, Math.round(rawScore)));

  // ── Sub-scores derived from the same signals ──────────────────────────────
  const clarityScore    = Math.min(95, Math.max(10, Math.round(
    (lengthScore * 1.5) + (sentences >= 2 ? 20 : 5) + (hasSpecifics ? 15 : 0) + commBonus - (hasFillers * 3) - (isOneWord ? 40 : 0)
  )));
  const grammarScore    = Math.min(95, Math.max(20, Math.round(
    80 - (hasFillers * 5) - (isTooShort ? 20 : 0) - (isOneWord ? 40 : 0)
  )));
  const confidenceScore = Math.min(95, Math.max(10, Math.round(
    (hasPersonal ? 20 : 5) + (hasAction ? 25 : 5) + (hasMetrics ? 15 : 0) + (wordCount > 50 ? 20 : 5) - (hasFillers * 4) - (isOneWord ? 50 : 0)
  )));
  const technicalScore  = score; // same as overall for behavioural

  // ── Dynamic strengths ─────────────────────────────────────────────────────
  const strengths = [];
  if (hasSituation && hasTask)           strengths.push('Good context setting — you described the situation and the challenge clearly.');
  if (hasAction && hasPersonal)          strengths.push('Clear personal ownership — you explained what YOU specifically did.');
  if (hasResult)                         strengths.push('Strong result articulation — you described the outcome.');
  if (hasMetrics)                        strengths.push('Excellent use of quantifiable metrics to demonstrate impact.');
  if (hasLearning)                       strengths.push('You demonstrated self-awareness by sharing what you learned.');
  if (sentences >= 4 && wordCount > 60)  strengths.push('Well-structured and appropriately detailed response.');
  if (strengths.length === 0)            strengths.push('Answer was received and processed.');

  // ── Dynamic weaknesses ────────────────────────────────────────────────────
  const weaknesses = [];
  if (isOneWord || isTooShort)           weaknesses.push('Answer is too brief — provide a complete example with context and outcome.');
  if (!hasSituation)                     weaknesses.push('Missing situational context — describe when and where this happened.');
  if (!hasTask)                          weaknesses.push('Missing task or challenge — what were you responsible for solving?');
  if (!hasAction)                        weaknesses.push('Missing personal action — explain specifically what YOU did, not what the team did.');
  if (!hasResult)                        weaknesses.push('Missing result — always conclude with what was achieved or what changed.');
  if (!hasMetrics && wordCount > 30)     weaknesses.push('Add measurable outcomes — numbers and metrics make your answer significantly more convincing.');
  if (hasFillers > 2)                    weaknesses.push('Reduce filler words (um, uh, like, basically) for a more confident delivery.');
  if (weaknesses.length === 0 && score < 80) weaknesses.push('Expand your answer with more specific details and measurable outcomes.');

  // ── Dynamic feedback ─────────────────────────────────────────────────────
  let feedback = '';
  if (score >= 85) {
    feedback = `Strong answer. You clearly described the situation, your personal contribution, and the outcome. ${hasMetrics ? 'Your use of specific metrics is excellent.' : 'Consider adding measurable results next time.'}`;
  } else if (score >= 65) {
    feedback = `Good answer with reasonable structure. ${hasAction ? 'Your personal actions are clear.' : 'Focus more on what you personally did.'} ${hasResult ? '' : 'Always conclude with a specific result — what changed because of your actions?'}`;
  } else if (score >= 40) {
    feedback = `Your answer addresses the question but lacks depth. Use the STAR method: describe the Situation, your Task, the Action you personally took, and the Result. More detail and specific examples will significantly improve your score.`;
  } else {
    feedback = `This answer is too brief or too vague to demonstrate your experience clearly. Provide a complete example: describe the context, what you were responsible for, what you personally did step by step, and what the outcome was. Aim for at least 80–120 words.`;
  }

  return {
    score,
    clarityScore,
    grammarScore,
    confidenceScore,
    technicalScore,
    overallScore:   score,
    strengths:      strengths.slice(0, 4),
    weaknesses:     weaknesses.slice(0, 3),
    feedback,
    improvedAnswer: _buildImprovedAnswerHint(hasSituation, hasTask, hasAction, hasResult, role),
  };
};

function _buildImprovedAnswerHint(hasSituation, hasTask, hasAction, hasResult, role) {
  const missing = [];
  if (!hasSituation) missing.push('start with the situation ("During my final-year project...")');
  if (!hasTask)      missing.push('describe what you were responsible for ("I was tasked with...")');
  if (!hasAction)    missing.push('explain what you personally did ("I decided to... I implemented...")');
  if (!hasResult)    missing.push('conclude with the result ("As a result, we... which led to...")');

  if (missing.length === 0) {
    return `Consider adding specific metrics or numbers to quantify your impact. For example: "This reduced processing time by 40%" or "The team delivered 3 days ahead of schedule."`;
  }
  return `To improve your answer, ${missing.join(', ')}. Use the STAR format: Situation → Task → Action → Result.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COMMUNICATION & GRAMMAR EVALUATION
// ─────────────────────────────────────────────────────────────────────────────
const COMMUNICATION_EXPECTATIONS = [
  { test: /tell me about yourself|introduce yourself/i, terms: [/background|student|experience|education/i, /skill|technology|built|worked/i, /goal|interest|career|seeking/i] },
  { test: /challenging project|difficult project/i, terms: [/project|system|application/i, /challenge|problem|difficult/i, /i (built|created|implemented|worked|designed|developed|led)/i, /result|outcome|learned|improved/i] },
  { test: /why should we hire|why hire/i, terms: [/skill|strength|experience/i, /example|built|achieved|delivered/i, /value|contribute|help|impact/i] },
  { test: /strengths and weaknesses/i, terms: [/strength/i, /weakness|improve|working on/i, /example|situation|result/i] },
  { test: /where do you see yourself|five years/i, terms: [/goal|career|learn|grow/i, /role|responsibility|lead/i, /company|team|contribute/i] },
];

function clampScore(value) { return Math.max(0, Math.min(100, Math.round(value))); }
function wordsOf(value) { return value.toLowerCase().match(/[a-z][a-z'-]*/g) || []; }
function questionExpectations(question) {
  return COMMUNICATION_EXPECTATIONS.find(item => item.test.test(question))?.terms || [/answer|explain|describe/i];
}
function analyzeCommunicationDeterministically(question = '', text = '') {
  const answer = text.trim();
  const words = wordsOf(answer);
  const sentences = answer.split(/[.!?]+/).map(value => value.trim()).filter(Boolean);
  const expectations = questionExpectations(question);
  const shortYesNo = /^(yes|no|okay|ok)$/i.test(answer);
  const matchedExpectations = expectations.filter(pattern => pattern.test(answer)).length;
  const hasPersonalContribution = /\b(i|my|me|myself|we|our)\b/i.test(answer) && /\b(built|created|implemented|designed|developed|led|managed|solved|worked|focused|responsible)\b/i.test(answer);
  const hasSpecificEvidence = /\b\d+(?:%|\+|\s*(?:users?|requests?|ms|seconds?|days?|weeks?|months?|years?))\b|\b(using|with|through|by|implemented|built|developed|created|designed)\s+[A-Za-z][\w.+#-]*/i.test(answer);
  const hasResult = /\b(result|outcome|achieved|improved|reduced|increased|delivered|learned|successfully|impact)\b/i.test(answer);
  const fillerCount = (answer.match(/\b(um|uh|you know|kind of|sort of|basically|literally)\b/gi) || []).length;
  const uniqueRatio = words.length ? new Set(words).size / words.length : 0;
  const repeatedPhrase = /(\b\w+\b(?:\s+\b\w+\b){1,4})[,.!?\s]+\1/i.test(answer);
  const grammarPenalty = (/(\balot\b|should of|could of|would of)/i.test(answer) ? 15 : 0) + fillerCount * 3;

  // A "weak" answer is one that doesn't substantively engage with the
  // question at all (a blank/near-blank answer, "I don't know", or any
  // short answer that matches none of the question's expected themes and
  // shows no personal contribution, evidence, or result). Every sub-score
  // must drop together for these — not just relevance/content — otherwise
  // a non-answer like "I don't know why you should hire me" still scores
  // 68/78/75 on clarity/professionalism/conciseness just for being
  // grammatically well-formed.
  const isWeakAnswer = shortYesNo
    || words.length < 6
    || /\b(don'?t know|do\s+not\s+know|no\s+idea|not\s+sure)\b/i.test(answer)
    || (words.length <= 20 && matchedExpectations === 0 && !hasPersonalContribution && !hasSpecificEvidence && !hasResult);

  const relevance = isWeakAnswer ? 5 : clampScore((matchedExpectations / Math.max(1, expectations.length)) * 75 + (hasPersonalContribution ? 15 : 0) + (hasResult ? 10 : 0));
  const content = isWeakAnswer ? 5 : clampScore(Math.min(100, words.length / 45 * 65 + matchedExpectations / Math.max(1, expectations.length) * 35));
  const clarity = isWeakAnswer ? 15 : clampScore(45 + Math.min(35, sentences.length * 8) + (uniqueRatio >= 0.55 ? 15 : 0) - grammarPenalty - (sentences.length === 1 && words.length > 35 ? 10 : 0));
  const specificity = isWeakAnswer ? 5 : clampScore((hasSpecificEvidence ? 45 : 10) + (hasPersonalContribution ? 30 : 0) + (hasResult ? 25 : 0));
  const structure = isWeakAnswer ? 10 : clampScore((sentences.length >= 2 ? 35 : 10) + (matchedExpectations >= 2 ? 20 : 5) + (hasPersonalContribution ? 25 : 0) + (hasResult ? 20 : 0));
  const professionalism = isWeakAnswer ? clampScore(20 - grammarPenalty) : clampScore(78 - grammarPenalty + (hasPersonalContribution ? 12 : 0));
  const conciseness = isWeakAnswer ? (words.length === 0 ? 0 : 20) : clampScore(75 - (words.length > 120 ? 20 : 0) - (repeatedPhrase ? 25 : 0) - fillerCount * 5);
  const evaluation = {
    relevance: { score: relevance, reason: relevance >= 70 ? 'The answer addresses the selected question directly.' : 'The answer does not cover enough of what the selected question asks.' },
    content: { score: content, reason: content >= 70 ? 'The answer provides sufficient supporting information.' : 'The answer needs more useful details to be complete.' },
    clarity: { score: clarity, reason: clarity >= 70 ? 'The ideas are understandable and reasonably easy to follow.' : 'The ideas need clearer sentences or transitions.' },
    specificity: { score: specificity, reason: specificity >= 70 ? 'The answer includes concrete actions, evidence, or outcomes.' : 'Add a concrete example and explain what you personally did.' },
    structure: { score: structure, reason: structure >= 70 ? 'The answer follows a logical progression.' : 'Organize the response into context, action, and result where appropriate.' },
    professionalism: { score: professionalism, reason: professionalism >= 70 ? 'The tone is suitable for an interview.' : 'Use a more complete, professional response.' },
    conciseness: { score: conciseness, reason: conciseness >= 70 ? 'The answer is focused without significant repetition.' : 'Remove repetition and keep each sentence useful.' },
  };
  const overallScore = clampScore(relevance * 0.30 + content * 0.20 + clarity * 0.15 + specificity * 0.15 + structure * 0.10 + professionalism * 0.05 + conciseness * 0.05);
  const strengths = [];
  if (relevance >= 70) strengths.push('Directly addressed the selected question');
  if (hasPersonalContribution) strengths.push('Explained personal contribution');
  if (hasSpecificEvidence) strengths.push('Included concrete evidence or implementation detail');
  if (hasResult) strengths.push('Described an outcome or learning');
  if (clarity >= 70) strengths.push('Communicated the main ideas clearly');
  const improvements = [];
  if (relevance < 70) improvements.push('Answer the selected question more directly');
  if (content < 70) improvements.push('Add useful supporting details');
  if (!hasPersonalContribution) improvements.push('Explain your individual contribution and actions');
  if (!hasSpecificEvidence) improvements.push('Add one specific example, technology, metric, or observable detail');
  if (!hasResult && /project|challenge|hire|strength|weakness/i.test(question)) improvements.push('Explain the result, impact, or learning');
  if (repeatedPhrase || conciseness < 70) improvements.push('Remove repeated or unnecessary wording');
  const mistakes = improvements.map(textValue => ({ text: textValue, type: 'Improvement', severity: overallScore < 45 ? 'high' : 'medium' }));
  return {
    question, answer,
    evaluation, overallScore, relevanceScore: relevance,
    grammarScore: clarity, clarityScore: clarity,
    vocabularyScore: clampScore(uniqueRatio * 100), confidenceScore: professionalism,
    strengths: strengths.length ? strengths.slice(0, 5) : ['The answer provides a starting point for improvement'],
    improvements: improvements.length ? improvements : ['Add measurable impact to make this strong answer even more specific'],
    mistakes: mistakes.length ? mistakes : [{ text: 'No major answer-specific issue detected.', type: 'Tip', severity: 'low' }],
    overallFeedback: overallScore >= 80 ? 'This answer is relevant, specific, and well supported for the selected question.' : overallScore >= 60 ? `This answer is understandable, but it can improve by ${improvements.slice(0, 2).join(' and ').toLowerCase()}.` : `This answer needs more question-specific evidence. ${improvements.slice(0, 2).join('. ')}.`,
    improvedAnswer: improvements.length ? `To strengthen this answer: ${improvements.join('; ')}.` : 'Add a measurable result to make the answer more persuasive.',
  };
}

export const analyzeCommunication = async (question = '', text = '') => analyzeCommunicationDeterministically(question, text);

// ─────────────────────────────────────────────────────────────────────────────
// 5. TECHNICAL INTERVIEW MODULE
// ─────────────────────────────────────────────────────────────────────────────
export const generateTechnicalQuestions = async (role = 'Software Engineer', technology = 'JavaScript', difficulty = 'Medium') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Generate 5 technical interview questions for a ${difficulty} level ${role} specializing in ${technology}.
Return JSON:
{
  "questions": [
    { "id": 1, "question": string, "topic": string }
  ]
}`;
      return await callLLM('You are a Principal Software Architect conducting a technical interview.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for technical question generation:', err.message);
    }
  }

  const techQuestionsMap = {
    JavaScript: [
      { id: 1, question: 'Explain the Event Loop, microtasks, and macrotasks in JavaScript with execution order.', topic: 'Asynchronous JS' },
      { id: 2, question: 'What is the difference between Prototypal Inheritance and Classical Inheritance in JavaScript?', topic: 'OOP / Prototypes' },
      { id: 3, question: 'How do Closures work under the hood and what are common real-world use cases?', topic: 'Scope & Memory' },
      { id: 4, question: 'Compare WeakMap / WeakSet with standard Map / Set in terms of garbage collection.', topic: 'Data Structures' },
      { id: 5, question: 'How do you prevent memory leaks when dealing with closures, event listeners, and timers in single page apps?', topic: 'Performance' },
    ],
    React: [
      { id: 1, question: 'How does React Fiber architecture work and what problem does it solve over the legacy stack reconciler?', topic: 'Reconciliation' },
      { id: 2, question: 'Explain the difference between useMemo, useCallback, and React.memo, including their performance overheads.', topic: 'Optimization' },
      { id: 3, question: 'How would you architect a global state management solution using Context API without unnecessary re-renders?', topic: 'State Management' },
      { id: 4, question: 'What are Server Components (RSC) and how do they differ from traditional Client Side Rendering (CSR) and SSR?', topic: 'Architecture' },
      { id: 5, question: 'Describe how React manages batching in synthetic events and asynchronous promises.', topic: 'Core React' },
    ],
    'Node.js': [
      { id: 1, question: 'How does Node.js handle I/O multiplexing using libuv and the thread pool?', topic: 'Internals' },
      { id: 2, question: 'Explain backpressure in Node.js Streams and how to handle it properly.', topic: 'Streams' },
      { id: 3, question: 'What strategies do you use for clustering and scaling Node.js applications across multi-core CPUs?', topic: 'Scaling' },
      { id: 4, question: 'How do you secure Node.js APIs against ReDoS, injection, and prototype pollution?', topic: 'Security' },
      { id: 5, question: 'Compare Worker Threads vs Child Processes in Node.js with ideal use cases.', topic: 'Concurrency' },
    ],
    Python: [
      { id: 1, question: 'Explain the Global Interpreter Lock (GIL) and its implications on multi-threading in CPython.', topic: 'Concurrency' },
      { id: 2, question: 'What are Generators and Coroutines in Python? How do they differ in memory footprint from lists?', topic: 'Memory' },
      { id: 3, question: 'How do Metaclasses work in Python and when is it appropriate to use them?', topic: 'Metaprogramming' },
      { id: 4, question: 'Explain how Python manages memory, reference counting, and cyclic garbage collection.', topic: 'Internals' },
      { id: 5, question: 'What are decorators and how do you write a parameterized decorator preserving function metadata?', topic: 'Functional' },
    ],
    Java: [
      { id: 1, question: 'Explain the Java Memory Model (Heap, Stack, Metaspace) and Garbage Collection algorithms (G1, ZGC).', topic: 'JVM Internals' },
      { id: 2, question: 'How does ConcurrentHashMap achieve high throughput compared to Hashtable and Collections.synchronizedMap?', topic: 'Concurrency' },
      { id: 3, question: 'Explain the difference between optimistic and pessimistic locking in JPA / Hibernate.', topic: 'Database' },
      { id: 4, question: 'What are Java Virtual Threads (Project Loom) and how do they differ from platform threads?', topic: 'Modern Java' },
      { id: 5, question: 'How do you design a thread-safe singleton in Java resisting reflection and serialization attacks?', topic: 'Design Patterns' },
    ],
  };

  return {
    questions: techQuestionsMap[technology] || techQuestionsMap.JavaScript,
  };
};

export const evaluateTechnicalAnswer = async (question = '', userAnswer = '', role = 'Software Engineer', technology = 'General') => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Evaluate this technical answer for a ${role} regarding ${technology}:
Question: "${question}"
User's Answer: "${userAnswer}"

Return JSON:
{
  "score": number (0-100),
  "feedback": string,
  "strengths": [string],
  "improvements": [string]
}`;
      return await callLLM('You are a technical evaluation engine.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for technical answer evaluation:', err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC TECHNICAL EVALUATION ENGINE
  // Scores based on actual answer content — different answers = different scores
  // ─────────────────────────────────────────────────────────────────────────

  const answer    = userAnswer.trim();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 3).length;

  // ── Depth signals ─────────────────────────────────────────────────────────
  const hasExplanation  = /\b(because|therefore|this means|which allows|as a result|the reason|this enables|this causes|in other words)\b/i.test(answer);
  const hasExample      = /\b(for example|for instance|such as|consider|imagine|suppose|in practice|e\.g\.|i\.e\.)\b/i.test(answer);
  const hasTradeoffs    = /\b(trade-off|disadvantage|downside|limitation|however|on the other hand|alternatively|compared to|instead|whereas)\b/i.test(answer);
  const hasComplexity   = /\b(o\(|time complexity|space complexity|big.?o|performance|efficient|optimis|bottleneck)\b/i.test(answer);
  const hasTechnical    = /\b(algorithm|data structure|memory|thread|async|synchron|hash|stack|queue|tree|graph|sort|index|cache|api|database|query|schema|function|class|object|method|interface|inherit|polymor)\b/i.test(answer);
  const hasImplementation = /\b(implement|code|syntax|method|function|class|variable|parameter|return|loop|recursive|iteration)\b/i.test(answer);
  const hasProduction   = /\b(production|scalab|high.availab|fault.toleran|monitor|log|deploy|cloud|microservice|container|load.balanc)\b/i.test(answer);

  // ── Negative signals ──────────────────────────────────────────────────────
  const isOneWord   = wordCount <= 3;
  const isTooShort  = wordCount < 15;
  const isVague     = !hasTechnical && !hasImplementation && wordCount < 30;

  // ── LENGTH scoring (0–20) ─────────────────────────────────────────────────
  let lengthScore = 0;
  if      (wordCount <= 3)   lengthScore = 0;
  else if (wordCount <= 10)  lengthScore = 5;
  else if (wordCount <= 25)  lengthScore = 10;
  else if (wordCount <= 60)  lengthScore = 15;
  else if (wordCount <= 150) lengthScore = 20;
  else                       lengthScore = 18;

  // ── DEPTH scoring (0–45) ──────────────────────────────────────────────────
  let depthScore = 0;
  if (hasTechnical)      depthScore += 12;
  if (hasExplanation)    depthScore += 10;
  if (hasExample)        depthScore += 8;
  if (hasTradeoffs)      depthScore += 8;
  if (hasComplexity)     depthScore += 5;
  if (hasImplementation) depthScore += 5;
  if (hasProduction)     depthScore += 7;

  // ── STRUCTURE scoring (0–20) ──────────────────────────────────────────────
  let structureScore = 0;
  if (sentences >= 2) structureScore += 8;
  if (sentences >= 4) structureScore += 7;
  if (sentences >= 6) structureScore += 5;

  // ── PENALTIES ─────────────────────────────────────────────────────────────
  let penalty = 0;
  if (isOneWord)  penalty += 35;
  if (isTooShort) penalty += 20;
  if (isVague)    penalty += 15;

  // ── FINAL SCORE ───────────────────────────────────────────────────────────
  const rawScore = lengthScore + depthScore + structureScore - penalty;
  const score    = Math.min(97, Math.max(5, Math.round(rawScore)));

  // ── Dynamic strengths ─────────────────────────────────────────────────────
  const strengths = [];
  if (hasTechnical && wordCount > 20) strengths.push('Demonstrated technical knowledge and domain vocabulary.');
  if (hasExplanation)                 strengths.push('Explained the reasoning behind concepts clearly.');
  if (hasExample)                     strengths.push('Used a concrete example to illustrate the concept.');
  if (hasTradeoffs)                   strengths.push('Discussed trade-offs or alternative approaches.');
  if (hasComplexity)                  strengths.push('Addressed performance or complexity considerations.');
  if (strengths.length === 0)         strengths.push('Answer provided and received.');

  // ── Dynamic improvements ──────────────────────────────────────────────────
  const improvements = [];
  if (isOneWord || isTooShort)    improvements.push('Your answer is too brief — explain the concept fully with reasoning and examples.');
  if (!hasTechnical && !isOneWord) improvements.push('Use relevant technical terminology to demonstrate domain knowledge.');
  if (!hasExplanation)             improvements.push('Explain WHY — not just WHAT. "X works because..." significantly improves your score.');
  if (!hasExample)                 improvements.push('Give a concrete example or use case to demonstrate understanding.');
  if (!hasTradeoffs && wordCount > 40) improvements.push('Mention trade-offs or limitations to show deeper understanding.');
  if (improvements.length === 0)  improvements.push('Excellent answer. Consider adding production considerations or edge cases.');

  // ── Dynamic feedback ──────────────────────────────────────────────────────
  let feedback;
  if (score >= 82) {
    feedback = `Strong technical answer. You covered the core concept with good depth${hasTradeoffs ? ', discussed trade-offs' : ''} ${hasExample ? 'and provided a practical example' : ''}. ${!hasProduction ? 'Consider mentioning production or scaling implications for a complete response.' : ''}`;
  } else if (score >= 60) {
    feedback = `Good foundation. Your answer covers the basics${hasTechnical ? ' with relevant terminology' : ''}. To score higher: ${!hasExplanation ? 'explain the "why" behind the concept; ' : ''}${!hasExample ? 'give a specific example; ' : ''}${!hasTradeoffs ? 'discuss trade-offs or limitations.' : ''}`;
  } else if (score >= 35) {
    feedback = `Your answer is on the right track but needs more depth. Explain the concept thoroughly, use technical terminology, give an example, and discuss any trade-offs or limitations.`;
  } else {
    feedback = `This answer is too brief or vague to demonstrate technical understanding. For "${question.slice(0, 50)}...", explain the concept clearly, give an example, and discuss any relevant trade-offs. Aim for at least 60–100 words.`;
  }

  return { score, feedback, strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3) };
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SKILL RECOMMENDATIONS — driven by real userMetrics
// ─────────────────────────────────────────────────────────────────────────────
export const generateSkillRecommendations = async (userMetrics = {}) => {
  if (isLiveAIEnabled()) {
    try {
      const prompt = `Based on these performance metrics generate personalised skill recommendations:
${JSON.stringify(userMetrics, null, 2)}

Return JSON:
{
  "currentSkills": [{ "name": string, "level": number, "category": string }],
  "skillGaps": [{ "name": string, "priority": "high"|"medium"|"low", "reason": string, "currentLevel": number }],
  "recommendations": [{ "skill": string, "priority": "high"|"medium"|"low", "reason": string, "topics": [string], "resources": [{ "title": string, "url": string }], "estimatedTime": string }]
}`;
      return await callLLM('You are a senior engineering career coach.', prompt);
    } catch (err) {
      console.warn('Live LLM failed for skill recommendations:', err.message);
    }
  }

  // ── Heuristic engine: map low scores → specific skill gaps ────────────────
  const {
    codingScore        = null,
    aptitudeScore      = null,
    interviewScore     = null,
    communicationScore = null,
    resumeScore        = null,
    atsScore           = null,
  } = userMetrics;

  const skillGaps      = [];
  const recommendations = [];

  // Coding weak
  if (codingScore !== null && codingScore < 65) {
    skillGaps.push({ name: 'Data Structures & Algorithms', priority: 'high', reason: `Coding score is ${codingScore}% — DSA is the foundation of technical interviews.`, currentLevel: codingScore });
    recommendations.push({
      skill: 'Data Structures & Algorithms',
      priority: 'high',
      reason: 'Improving DSA skills directly increases your coding interview pass rate.',
      topics: ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching'],
      resources: [
        { title: 'LeetCode Top 150 Interview Questions', url: 'https://leetcode.com/studyplan/top-interview-150/' },
        { title: 'GeeksforGeeks DSA Self Paced Course', url: 'https://www.geeksforgeeks.org/dsa-self-paced-course/' },
      ],
      estimatedTime: '4–6 weeks',
    });
  }

  // Interview weak
  if (interviewScore !== null && interviewScore < 65) {
    skillGaps.push({ name: 'System Design', priority: 'high', reason: `Interview score is ${interviewScore}% — system design knowledge is tested in most mid/senior interviews.`, currentLevel: interviewScore });
    recommendations.push({
      skill: 'System Design',
      priority: 'high',
      reason: 'Mastering distributed systems separates top candidates in technical rounds.',
      topics: ['Load Balancing', 'Caching', 'Database Design', 'Microservices', 'API Design'],
      resources: [
        { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'Grokking System Design', url: 'https://www.educative.io/courses/grokking-the-system-design-interview' },
      ],
      estimatedTime: '4–6 weeks',
    });
  }

  // Always recommend TypeScript + Docker for engineers
  skillGaps.push({ name: 'TypeScript', priority: 'high', reason: 'Required in 80% of frontend & fullstack job descriptions.', currentLevel: 15 });
  skillGaps.push({ name: 'Docker', priority: 'medium', reason: 'Containerization is expected in modern engineering stacks.', currentLevel: 10 });

  recommendations.push({
    skill: 'TypeScript',
    priority: 'high',
    reason: 'TypeScript is now the industry standard for large-scale React & Node.js codebases.',
    topics: ['Types & Interfaces', 'Generics', 'Utility Types', 'Type Narrowing', 'React with TypeScript'],
    resources: [
      { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/' },
      { title: 'Total TypeScript', url: 'https://www.totaltypescript.com/' },
    ],
    estimatedTime: '2–3 weeks',
  });

  recommendations.push({
    skill: 'Docker & Containerization',
    priority: 'medium',
    reason: 'Knowing Docker is expected for any backend or full-stack role today.',
    topics: ['Docker CLI', 'Dockerfile', 'Docker Compose', 'Volumes & Networks'],
    resources: [
      { title: 'Docker Official Getting Started', url: 'https://docs.docker.com/get-started/' },
    ],
    estimatedTime: '1–2 weeks',
  });

  if (atsScore !== null && atsScore < 65) {
    skillGaps.push({ name: 'ATS-Optimised Resume Writing', priority: 'high', reason: `ATS score is ${atsScore}% — resume keyword gaps reduce interview call-backs.`, currentLevel: atsScore });
    recommendations.push({
      skill: 'Resume & ATS Optimisation',
      priority: 'high',
      reason: 'A well-optimised resume is the first filter before any technical round.',
      topics: ['Keyword Matching', 'Quantifiable Achievements', 'ATS Formatting', 'Action Verbs'],
      resources: [
        { title: 'Jobscan ATS Resume Guide', url: 'https://www.jobscan.co/blog/ats-resume-guide/' },
        { title: 'Harvard Resume Guide', url: 'https://exts.harvard.edu/wp-content/uploads/sites/8/2020/08/hes-resume-cover-letter-guide.pdf' },
      ],
      estimatedTime: '1 week',
    });
  }

  recommendations.push({
    skill: 'AWS Cloud Fundamentals',
    priority: 'medium',
    reason: 'Cloud experience is a strong differentiator across all engineering roles.',
    topics: ['EC2 & S3', 'Lambda & API Gateway', 'IAM', 'RDS & DynamoDB'],
    resources: [{ title: 'AWS Free Tier & Workshops', url: 'https://aws.amazon.com/free/' }],
    estimatedTime: '3–4 weeks',
  });

  // Current skills baseline (use actual metrics where available)
  const currentSkills = [
    { name: 'JavaScript',      level: codingScore        || 70, category: 'Language' },
    { name: 'Python',          level: codingScore        || 65, category: 'Language' },
    { name: 'React',           level: (codingScore || 70) - 5,  category: 'Framework' },
    { name: 'Node.js',         level: (codingScore || 70) - 8,  category: 'Backend' },
    { name: 'Data Structures', level: codingScore        || 68, category: 'CS Fundamentals' },
    { name: 'SQL',             level: (codingScore || 60) - 5,  category: 'Database' },
    { name: 'Git',             level: 80,                       category: 'Tool' },
    { name: 'Communication',   level: communicationScore  || 70, category: 'Soft Skills' },
  ].map((s) => ({ ...s, level: Math.max(10, Math.min(95, s.level)) }));

  return { currentSkills, skillGaps, recommendations };
};

export default {
  analyzeResume,
  calculateATS,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  analyzeCommunication,
  generateTechnicalQuestions,
  evaluateTechnicalAnswer,
  generateSkillRecommendations,
};
