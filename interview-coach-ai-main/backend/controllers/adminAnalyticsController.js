import { getSupabase } from '../config/supabase.js';

function average(nums) {
  const valid = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n));
  if (valid.length === 0) return 0;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function tallyTopN(arraysOfStrings, n = 10) {
  const counts = new Map();
  for (const arr of arraysOfStrings) {
    for (const item of arr || []) {
      if (!item) continue;
      counts.set(item, (counts.get(item) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

export const getAnalytics = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const [{ data: scoreRows, error: e1 }, { data: aptitudeRows, error: e2 }, { data: interviewRows, error: e3 }] = await Promise.all([
      sb.from('user_score_averages').select('resume_score, ats_score, interview_score, communication_score, coding_score, aptitude_score'),
      sb.from('aptitude_attempts').select('weak_areas'),
      sb.from('interviews').select('weaknesses').eq('status', 'completed'),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    if (e3) throw e3;

    const rows = scoreRows || [];
    const averageByCategory = {
      resume: average(rows.map((r) => r.resume_score)),
      ats: average(rows.map((r) => r.ats_score)),
      interview: average(rows.map((r) => r.interview_score)),
      communication: average(rows.map((r) => r.communication_score)),
      coding: average(rows.map((r) => r.coding_score)),
      aptitude: average(rows.map((r) => r.aptitude_score)),
    };
    const weakestCategory = Object.entries(averageByCategory).sort((a, b) => a[1] - b[1])[0]?.[0] || null;

    const topAptitudeWeakAreas = tallyTopN((aptitudeRows || []).map((r) => r.weak_areas));
    const topInterviewWeaknesses = tallyTopN((interviewRows || []).map((r) => r.weaknesses));

    res.json({
      success: true,
      analytics: {
        averageByCategory,
        weakestCategory,
        topAptitudeWeakAreas,
        topInterviewWeaknesses,
        studentsCounted: rows.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Which students actually have a given weak area / weakness — drill-down
// for the Skill Gaps page, so staff can see names, not just a count.
export const getWeakAreaStudents = async (req, res, next) => {
  try {
    const { type, label } = req.query;
    if (!label || !['aptitude', 'interview'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type (aptitude|interview) and label are required' });
    }
    const sb = getSupabase();

    let userIds = [];
    if (type === 'aptitude') {
      const { data, error } = await sb.from('aptitude_attempts').select('user_id, category, accuracy, created_at').contains('weak_areas', [label]);
      if (error) throw error;
      userIds = (data || []).map((r) => r.user_id);
      var detailByUser = (data || []).reduce((acc, r) => {
        if (!acc[r.user_id] || new Date(r.created_at) > new Date(acc[r.user_id].created_at)) acc[r.user_id] = r;
        return acc;
      }, {});
    } else {
      const { data, error } = await sb.from('interviews').select('user_id, role, total_score, completed_at').eq('status', 'completed').contains('weaknesses', [label]);
      if (error) throw error;
      userIds = (data || []).map((r) => r.user_id);
      var detailByUser2 = (data || []).reduce((acc, r) => {
        if (!acc[r.user_id] || new Date(r.completed_at) > new Date(acc[r.user_id].completed_at)) acc[r.user_id] = r;
        return acc;
      }, {});
    }

    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return res.json({ success: true, students: [] });

    const { data: users, error: uErr } = await sb.from('users').select('id, name, email').in('id', uniqueIds);
    if (uErr) throw uErr;

    const students = (users || []).map((u) => {
      const detail = type === 'aptitude' ? detailByUser[u.id] : detailByUser2[u.id];
      return type === 'aptitude'
        ? { id: u.id, name: u.name, email: u.email, category: detail?.category, accuracy: detail?.accuracy, lastAttempt: detail?.created_at }
        : { id: u.id, name: u.name, email: u.email, role: detail?.role, score: detail?.total_score, lastInterview: detail?.completed_at };
    });

    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
};

export default { getAnalytics, getWeakAreaStudents };
