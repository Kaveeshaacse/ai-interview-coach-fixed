import { getSupabase } from '../config/supabase.js';

export const communicationRepository = {

  async create(userId, attemptData) {
    const sb = getSupabase();
    const payload = {
        user_id:         userId,
        input_text:      attemptData.inputText,
        word_count:      attemptData.wordCount      || 0,
        grammar_score:   attemptData.grammarScore   || 0,
        clarity_score:   attemptData.clarityScore   || 0,
        vocabulary_score:attemptData.vocabularyScore|| 0,
        confidence_score:attemptData.confidenceScore|| 0,
        relevance_score: attemptData.relevanceScore || 0,
        overall_score:   attemptData.overallScore   || 0,
        mistakes:        attemptData.mistakes       || [],
        improved_answer: attemptData.improvedAnswer || '',
      };
    const structuredPayload = { ...payload, question: attemptData.question || '' };
    let { data, error } = await sb
      .from('communication_attempts')
      .insert(structuredPayload)
      .select()
      .single();
    if (error && /schema cache|column .* (not found|does not exist)|could not find/i.test(error.message || '')) {
      ({ data, error } = await sb.from('communication_attempts').insert(payload).select().single());
    }
    if (error) throw error;
    return data;
  },

  async findByUser(userId, limit = 20) {
    const sb = getSupabase();
    let { data, error } = await sb
      .from('communication_attempts')
      .select('id, question, input_text, grammar_score, clarity_score, vocabulary_score, confidence_score, relevance_score, overall_score, word_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error && /schema cache|column .* (not found|does not exist)|could not find/i.test(error.message || '')) {
      ({ data, error } = await sb
        .from('communication_attempts')
        .select('id, input_text, grammar_score, clarity_score, vocabulary_score, confidence_score, relevance_score, overall_score, word_count, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit));
    }
    if (error) throw error;
    return data || [];
  },

  async getAverageScore(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('communication_attempts')
      .select('overall_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!data || data.length === 0) return null;
    const scores = data.map(r => r.overall_score || 0).filter(s => s > 0);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  async getLatestByUser(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('communication_attempts')
      .select('overall_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },
};
