import { getSupabase } from '../config/supabase.js';

export const interviewRepository = {

  async create(userId, sessionData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('interviews')
      .insert({
        user_id:    userId,
        role:       sessionData.role,
        type:       sessionData.type       || 'Behavioral',
        technology: sessionData.technology || '',
        difficulty: sessionData.difficulty || 'Medium',
        status:     'in-progress',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveQuestions(interviewId, questions) {
    const sb = getSupabase();
    if (!questions || questions.length === 0) return [];
    const rows = questions.map((q, idx) => ({
      interview_id:   interviewId,
      question_order: idx,
      question_text:  q.question,
      topic:          q.topic      || '',
      category:       q.category   || '',
      difficulty:     q.difficulty || 'Medium',
      technology:     q.technology || '',
    }));
    const { data, error } = await sb.from('interview_questions').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const sb = getSupabase();
    const [interviewRes, questionsRes, answersRes] = await Promise.all([
      sb.from('interviews').select('*').eq('id', id).single(),
      sb.from('interview_questions').select('*').eq('interview_id', id).order('question_order'),
      sb.from('interview_answers').select('*').eq('interview_id', id).order('question_order'),
    ]);
    if (!interviewRes.data) return null;
    return {
      ...interviewRes.data,
      questions: questionsRes.data || [],
      answers:   answersRes.data   || [],
    };
  },

  async getQuestionByOrder(interviewId, order) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interviewId)
      .eq('question_order', order)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async saveAnswer(interviewId, questionId, questionOrder, answerData) {
    const sb = getSupabase();
    const { data, error } = await sb.from('interview_answers').insert({
      interview_id:    interviewId,
      question_id:     questionId || null,
      question_order:  questionOrder,
      question_text:   answerData.question,
      user_answer:     answerData.userAnswer,
      score:           answerData.score           || 0,
      clarity_score:   answerData.clarityScore    || 0,
      grammar_score:   answerData.grammarScore    || 0,
      confidence_score:answerData.confidenceScore || 0,
      technical_score: answerData.technicalScore  || 0,
      feedback:        answerData.feedback        || '',
      strengths:       answerData.strengths       || [],
      weaknesses:      answerData.weaknesses      || [],
      improved_answer: answerData.improvedAnswer  || '',
    }).select().single();
    if (error) throw error;
    return data;
  },

  async recalculateAndUpdateScore(interviewId) {
    const sb = getSupabase();
    const { data: answers } = await sb
      .from('interview_answers')
      .select('score, strengths, weaknesses')
      .eq('interview_id', interviewId);
    if (!answers || answers.length === 0) return;

    const scores = answers.map(a => a.score || 0);
    const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const strengths  = [...new Set(answers.flatMap(a => a.strengths  || []))].slice(0, 5);
    const weaknesses = [...new Set(answers.flatMap(a => a.weaknesses || []))].slice(0, 5);

    await sb.from('interviews').update({
      total_score: totalScore,
      strengths,
      weaknesses,
      updated_at:  new Date().toISOString(),
    }).eq('id', interviewId);

    return totalScore;
  },

  async updateFeedback(interviewId, feedback, strengths, weaknesses) {
    const sb = getSupabase();
    const { error } = await sb.from('interviews').update({
      overall_feedback: feedback   || '',
      strengths:        strengths  || [],
      weaknesses:       weaknesses || [],
      updated_at:       new Date().toISOString(),
    }).eq('id', interviewId);
    if (error) throw error;
  },

  async markCompleted(interviewId) {
    const sb = getSupabase();
    const { error } = await sb.from('interviews').update({
      status:       'completed',
      completed_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }).eq('id', interviewId);
    if (error) throw error;
  },

  async findByUser(userId, options = {}) {
    const sb = getSupabase();
    let query = sb
      .from('interviews')
      .select('id, role, type, technology, difficulty, total_score, status, duration_minutes, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 20);
    if (options.type)   query = query.eq('type', options.type);
    if (options.status) query = query.eq('status', options.status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAverageScore(userId, options = {}) {
    const sb = getSupabase();
    let query = sb
      .from('interviews')
      .select('total_score')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .limit(10);
    if (options.type) query = query.eq('type', options.type);
    const { data } = await query;
    if (!data || data.length === 0) return null;
    const scores = data.map(r => r.total_score || 0).filter(s => s > 0);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  async getLatestByUser(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('interviews')
      .select('total_score, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },
};
