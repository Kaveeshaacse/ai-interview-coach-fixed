import { getSupabase } from '../config/supabase.js';

export const skillRepository = {

  async createAssessment(userId, assessmentData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('skill_assessments')
      .insert({
        user_id:         userId,
        current_skills:  assessmentData.currentSkills  || [],
        skill_gaps:      assessmentData.skillGaps      || [],
        recommendations: assessmentData.recommendations || [],
        score_snapshot:  assessmentData.scoreSnapshot  || {},
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAssessment(id, assessmentData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('skill_assessments')
      .update({
        current_skills:  assessmentData.currentSkills  || [],
        skill_gaps:      assessmentData.skillGaps      || [],
        recommendations: assessmentData.recommendations || [],
        score_snapshot:  assessmentData.scoreSnapshot  || {},
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findLatestByUser(userId, sinceDate = null) {
    const sb = getSupabase();
    let query = sb
      .from('skill_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    if (sinceDate) query = query.gte('created_at', sinceDate);
    const { data } = await query.single();
    return data || null;
  },

  async findByUser(userId, limit = 10) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('skill_assessments')
      .select('id, score_snapshot, skill_gaps, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
};
