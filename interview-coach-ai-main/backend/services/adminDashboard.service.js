import { adminStatsRepository } from '../repositories/adminStats.repository.js';
import { adminSettingsRepository } from '../repositories/adminSettings.repository.js';

const FALLBACK_ATTENTION_THRESHOLD = 50; // used only if the settings row can't be read

function dayLabel(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats() {
  const [studentCounts, activeQuestions, completedInterviews, students, evaluationSettings] = await Promise.all([
    adminStatsRepository.getStudentCounts(),
    adminStatsRepository.getActiveQuestionCount(),
    adminStatsRepository.getCompletedInterviews(),
    adminStatsRepository.getStudentsWithScores(),
    adminSettingsRepository.get('evaluation'),
  ]);
  // Reads the live Evaluation setting an admin can change — not a hardcoded
  // constant, so editing it on the Settings page actually changes who shows
  // up here, not just what the Settings page displays.
  const attentionThresholdNum = Number(evaluationSettings?.attentionThreshold);
  const ATTENTION_THRESHOLD = Number.isFinite(attentionThresholdNum) ? attentionThresholdNum : FALLBACK_ATTENTION_THRESHOLD;

  const interviewsCompleted = completedInterviews.length;
  const avgInterviewScore = interviewsCompleted > 0
    ? Math.round((completedInterviews.reduce((sum, i) => sum + (Number(i.total_score) || 0), 0) / interviewsCompleted) * 10) / 10
    : 0;

  // ── 30-day average score trend (by day) ──────────────────────────────────
  const now = new Date();
  const since30 = new Date(now);
  since30.setUTCDate(since30.getUTCDate() - 29);
  since30.setUTCHours(0, 0, 0, 0);

  const byDay = new Map(); // dayLabel -> { sum, count }
  for (const iv of completedInterviews) {
    if (!iv.completed_at) continue;
    const d = new Date(iv.completed_at);
    if (d < since30) continue;
    const key = dayLabel(d);
    const bucket = byDay.get(key) || { sum: 0, count: 0 };
    bucket.sum += Number(iv.total_score) || 0;
    bucket.count += 1;
    byDay.set(key, bucket);
  }
  const performanceTrend = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since30);
    d.setUTCDate(d.getUTCDate() + i);
    const key = dayLabel(d);
    const bucket = byDay.get(key);
    performanceTrend.push({
      date: key,
      averageScore: bucket ? Math.round((bucket.sum / bucket.count) * 10) / 10 : null,
    });
  }

  // ── Interviews completed per week (last 8 weeks) ─────────────────────────
  const since8Weeks = new Date(now);
  since8Weeks.setUTCDate(since8Weeks.getUTCDate() - 7 * 8);
  const byWeek = new Map();
  for (const iv of completedInterviews) {
    if (!iv.completed_at) continue;
    const d = new Date(iv.completed_at);
    if (d < since8Weeks) continue;
    const weekStart = startOfWeek(d);
    const key = dayLabel(weekStart);
    byWeek.set(key, (byWeek.get(key) || 0) + 1);
  }
  const weeklyInterviews = [];
  for (let i = 7; i >= 0; i--) {
    const d = startOfWeek(now);
    d.setUTCDate(d.getUTCDate() - 7 * i);
    const key = dayLabel(d);
    weeklyInterviews.push({ weekStarting: key, interviews: byWeek.get(key) || 0 });
  }

  // ── Students needing attention ────────────────────────────────────────────
  const studentsNeedingAttention = students
    .filter((s) => s.isActive && s.overallScore !== null && s.overallScore < ATTENTION_THRESHOLD)
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 20)
    .map((s) => ({ id: s.id, name: s.name, email: s.email, college: s.college, overallScore: s.overallScore }));

  return {
    totalStudents: studentCounts.total,
    activeStudents: studentCounts.active,
    interviewsCompleted,
    averageInterviewScore: avgInterviewScore,
    activeQuestions,
    performanceTrend,
    weeklyInterviews,
    studentsNeedingAttention,
    attentionThreshold: ATTENTION_THRESHOLD,
  };
}

export default { getDashboardStats };
