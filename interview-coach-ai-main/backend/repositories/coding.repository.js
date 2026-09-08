import { getSupabase } from '../config/supabase.js';

export const codingRepository = {

  async create(userId, attemptData) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('coding_attempts')
      .insert({
        user_id:           userId,
        problem_id:        attemptData.problemId,
        problem_title:     attemptData.problemTitle,
        difficulty:        attemptData.difficulty,
        category:          attemptData.category,
        language:          attemptData.language,
        code:              attemptData.code,
        status:            attemptData.status,
        score:             attemptData.score             || 0,
        passed_test_cases: attemptData.passedTestCases  || 0,
        total_test_cases:  attemptData.totalTestCases   || 0,
        execution_time_ms: attemptData.executionTimeMs  || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findByUser(userId, limit = 30) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('coding_attempts')
      .select('id, problem_id, problem_title, difficulty, language, score, status, passed_test_cases, total_test_cases, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async findByProblem(userId, problemId) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('coding_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getUserProblemStatusMap(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('coding_attempts')
      .select('problem_id, status, passed_test_cases, total_test_cases')
      .eq('user_id', userId);
    const map = {};
    for (const row of (data || [])) {
      const pid = row.problem_id;
      if (!map[pid]) {
        map[pid] = { status: row.status, passedCount: row.passed_test_cases, totalCount: row.total_test_cases };
      }
      if (row.status === 'Accepted' || row.status === 'PASSED') {
        map[pid] = { status: 'PASSED', passedCount: row.total_test_cases, totalCount: row.total_test_cases };
      }
    }
    return map;
  },

  async getAverageScore(userId) {
    const sb = getSupabase();
    const { data } = await sb
      .from('coding_attempts')
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
      .from('coding_attempts')
      .select('score, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data || null;
  },
};
