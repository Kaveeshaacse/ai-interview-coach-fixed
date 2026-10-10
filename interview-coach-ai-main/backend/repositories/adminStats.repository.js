import { getSupabase } from '../config/supabase.js';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Stats Repository — read-only aggregate queries for the Admin
// Dashboard. Aggregation is done in JS after a scoped fetch (fine at
// student-project scale); if this ever needs to run at real scale, these
// should become Postgres RPC functions instead.
// ─────────────────────────────────────────────────────────────────────────────

export const adminStatsRepository = {

  async getStudentCounts() {
    const sb = getSupabase();
    const { count: total, error: e1 } = await sb.from('users').select('*', { count: 'exact', head: true });
    if (e1) throw e1;
    const { count: active, error: e2 } = await sb.from('users').select('*', { count: 'exact', head: true }).neq('is_active', false);
    if (e2) throw e2;
    return { total: total || 0, active: active || 0 };
  },

  async getActiveQuestionCount() {
    const sb = getSupabase();
    const { count, error } = await sb.from('questions').select('*', { count: 'exact', head: true }).eq('is_active', true);
    if (error) throw error;
    return count || 0;
  },

  async getCompletedInterviews() {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('interviews')
      .select('id, total_score, completed_at')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(2000); // generous cap for a student-project dataset
    if (error) throw error;
    return data || [];
  },

  async getStudentsWithScores() {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('users')
      .select('id, name, email, college, last_login_at, is_active, user_score_averages(overall_score)');
    if (error) throw error;
    return (data || []).map((u) => {
      // Supabase can return an embedded to-one relation as an object or a
      // single-element array depending on how the FK constraint is read —
      // handle both so this never silently breaks.
      const avgRow = Array.isArray(u.user_score_averages) ? u.user_score_averages[0] : u.user_score_averages;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        college: u.college,
        lastActiveAt: u.last_login_at,
        isActive: u.is_active !== false,
        overallScore: avgRow?.overall_score ?? null,
      };
    });
  },
};

export default adminStatsRepository;
