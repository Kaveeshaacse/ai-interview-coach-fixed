import { getSupabase } from '../config/supabase.js';

export const aptitudeRepository = {

  async create(userId, attemptData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('aptitude_attempts')
      .insert({
        user_id:         userId,
        category:        attemptData.category,
        total_questions: attemptData.totalQuestions,
        correct_answers: attemptData.correctAnswers || 0,
        wrong_answers:   attemptData.wrongAnswers   || 0,
        unanswered:      attemptData.unanswered     || 0,
        score:           attemptData.score          || 0,
        accuracy:        attemptData.accuracy       || 0,
        time_taken:      attemptData.timeTaken      || '',
        weak_areas:      attemptData.weakAreas      || [],
        category_scores: attemptData.categoryScores || {},
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async saveAnswers(attemptId, answers) {
    const sb = getSupabase();
    if (!answers || answers.length === 0) return;
    const rows = answers.map(a => ({
      attempt_id:      attemptId,
      question_id:     a.questionId || a.id || null,
      question_text:   a.question,
      category:        a.category,
      options:         a.options || [],
      selected_answer: a.selectedAnswer || null,
      correct_answer:  a.correctAnswer,
      is_correct:      a.isCorrect,
      status:          a.status,
      explanation:     a.explanation || '',
    }));
    const { error } = await sb.from('aptitude_answers').insert(rows);
    if (error) throw error;
  },

  async findByUser(userId, limit = 20) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('aptitude_attempts')
      .select('id, category, score, accuracy, time_taken, total_questions, correct_answers, weak_areas, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async getAverageScore(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('aptitude_attempts')
      .select('score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!data || data.length === 0) return null;
    const scores = data.map(r => r.score || 0).filter(s => s > 0);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  async getLatestByUser(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('aptitude_attempts')
      .select('score, category, weak_areas, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },
};
