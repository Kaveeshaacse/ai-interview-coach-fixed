import { getSupabase } from '../config/supabase.js';

export const adminQuestionsRepository = {

  async list({ type, difficulty, category, isActive } = {}) {
    const sb = getSupabase();
    let query = sb.from('questions').select('*').order('created_at', { ascending: false });
    if (type) query = query.eq('type', type);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (category) query = query.eq('category', category);
    if (isActive !== undefined) query = query.eq('is_active', isActive);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findById(id) {
    const sb = getSupabase();
    const { data, error } = await sb.from('questions').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(q, adminId) {
    const sb = getSupabase();
    const { data, error } = await sb.from('questions').insert({
      type: q.type,
      category: q.category || '',
      difficulty: q.difficulty || 'Medium',
      title: q.title || (q.questionText || '').slice(0, 80),
      question_text: q.questionText,
      payload: q.payload || {},
      is_active: true,
      source: 'admin',
      created_by: adminId,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const sb = getSupabase();
    const updatePayload = { updated_at: new Date().toISOString() };
    if (fields.category !== undefined) updatePayload.category = fields.category;
    if (fields.difficulty !== undefined) updatePayload.difficulty = fields.difficulty;
    if (fields.title !== undefined) updatePayload.title = fields.title;
    if (fields.questionText !== undefined) updatePayload.question_text = fields.questionText;
    if (fields.payload !== undefined) updatePayload.payload = fields.payload;
    const { data, error } = await sb.from('questions').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async setActive(id, isActive) {
    const sb = getSupabase();
    const { error } = await sb.from('questions').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

export default adminQuestionsRepository;
