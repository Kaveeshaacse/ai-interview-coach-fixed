import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// User Repository — all database operations for users
// Controllers/services must NEVER call getSupabase() directly.
// ─────────────────────────────────────────────────────────────────────────────

export const userRepository = {

  async findByEmail(email) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = row not found
    return data || null;
  },

  async findById(id) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(userData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .insert({
        email:           userData.email.toLowerCase().trim(),
        password_hash:   userData.passwordHash,
        name:            userData.name.trim(),
        college:         userData.college        || '',
        degree:          userData.degree         || '',
        branch:          userData.branch         || '',
        graduation_year: userData.graduationYear || '',
        phone:           userData.phone          || '',
        location:        userData.location       || '',
        job_preference:  userData.jobPreference  || 'Software Engineer',
        last_login_at:   new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, fields) {
    const sb = getSupabase();
    // Map camelCase from frontend to DB snake_case
    const camelToSnake = {
      name:           'name',
      phone:          'phone',
      location:       'location',
      college:        'college',
      degree:         'degree',
      branch:         'branch',
      graduationYear: 'graduation_year',
      bio:            'bio',
      linkedIn:       'linkedin_url',
      github:         'github_url',
      portfolio:      'portfolio_url',
      resumeUrl:      'resume_url',
      jobPreference:  'job_preference',
    };
    const payload = { updated_at: new Date().toISOString() };
    for (const [camel, snake] of Object.entries(camelToSnake)) {
      if (fields[camel] !== undefined) payload[snake] = fields[camel];
    }
    const { data, error } = await sb
      .from('users')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePasswordHash(id, newHash) {
    const sb = getSupabase();
    const { error } = await sb
      .from('users')
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async recordLogin(id) {
    const sb = getSupabase();
    const { data: user } = await sb.from('users').select('total_sessions').eq('id', id).single();
    await sb.from('users').update({
      total_sessions: (user?.total_sessions || 0) + 1,
      last_login_at:  new Date().toISOString(),
    }).eq('id', id);
  },

  // ── Skills ─────────────────────────────────────────────────────────────────

  async getUserSkills(userId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('user_skills')
      .select('skill_name, level, category')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => ({ name: r.skill_name, level: r.level, category: r.category }));
  },

  async replaceUserSkills(userId, skills) {
    const sb = getSupabase();
    await sb.from('user_skills').delete().eq('user_id', userId);
    if (!skills || skills.length === 0) return [];
    const rows = skills.map(s => ({
      user_id:    userId,
      skill_name: s.name,
      level:      s.level || 0,
      category:   s.category || 'General',
    }));
    const { data, error } = await sb.from('user_skills').insert(rows).select();
    if (error) throw error;
    return data;
  },

  // ── Score averages ──────────────────────────────────────────────────────────

  async upsertScoreAverages(userId, scores) {
    const sb = getSupabase();
    const { error } = await sb.from('user_score_averages').upsert({
      user_id:             userId,
      resume_score:        scores.resumeScore        || 0,
      ats_score:           scores.atsScore           || 0,
      interview_score:     scores.interviewScore     || 0,
      communication_score: scores.communicationScore || 0,
      coding_score:        scores.codingScore        || 0,
      aptitude_score:      scores.aptitudeScore      || 0,
      overall_score:       scores.overallScore       || 0,
      updated_at:          new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
  },

  async getScoreAverages(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('user_score_averages')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data || null;
  },

  // ── Weekly progress ─────────────────────────────────────────────────────────

  async upsertWeeklyProgress(userId, dayLabel, score) {
    const sb = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    const { error } = await sb.from('weekly_progress').upsert({
      user_id:       userId,
      day_label:     dayLabel,
      score,
      recorded_date: today,
    }, { onConflict: 'user_id,recorded_date' });
    if (error) throw error;
  },

  async getWeeklyProgress(userId) {
    const sb = getSupabase();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data } = await sb
      .from('weekly_progress')
      .select('day_label, score, recorded_date')
      .eq('user_id', userId)
      .gte('recorded_date', sevenDaysAgo)
      .order('recorded_date', { ascending: true });
    return data || [];
  },
};
