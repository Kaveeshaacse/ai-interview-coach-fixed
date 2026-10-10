import { getSupabase } from '../config/supabase.js';

export const adminStudentsRepository = {

  async listStudents() {
    const sb = getSupabase();
    const [{ data: users, error: e1 }, { data: interviews, error: e2 }] = await Promise.all([
      sb.from('users').select('id, name, email, college, last_login_at, is_active, created_at, user_score_averages(overall_score)'),
      sb.from('interviews').select('id, user_id'),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;

    const interviewCounts = new Map();
    for (const iv of interviews || []) {
      interviewCounts.set(iv.user_id, (interviewCounts.get(iv.user_id) || 0) + 1);
    }

    return (users || []).map((u) => {
      const avgRow = Array.isArray(u.user_score_averages) ? u.user_score_averages[0] : u.user_score_averages;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        college: u.college,
        interviews: interviewCounts.get(u.id) || 0,
        averageScore: avgRow?.overall_score ?? null,
        lastActiveAt: u.last_login_at,
        isActive: u.is_active !== false,
        joinedAt: u.created_at,
      };
    });
  },

  async getStudentDetail(userId) {
    const sb = getSupabase();
    const [
      { data: user, error: e1 },
      { data: scores },
      { data: interviews },
      { data: aptitude },
      { data: coding },
      { data: communication },
    ] = await Promise.all([
      sb.from('users').select('*').eq('id', userId).single(),
      sb.from('user_score_averages').select('*').eq('user_id', userId).single(),
      sb.from('interviews').select('id, type, role, total_score, status, completed_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      sb.from('aptitude_attempts').select('id, category, score, accuracy, submitted_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      sb.from('coding_attempts').select('id, problem_title, difficulty, score, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      sb.from('communication_attempts').select('id, overall_score, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);
    if (e1) throw e1;
    if (!user) return null;

    const { password_hash, ...safeUser } = user;
    return {
      ...safeUser,
      scores: scores || null,
      recentInterviews: interviews || [],
      recentAptitude: aptitude || [],
      recentCoding: coding || [],
      recentCommunication: communication || [],
    };
  },

  async setActive(userId, isActive) {
    const sb = getSupabase();
    const { error } = await sb.from('users').update({ is_active: isActive }).eq('id', userId);
    if (error) throw error;
  },
};

export default adminStudentsRepository;
