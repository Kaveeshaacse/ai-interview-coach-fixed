import { adminStatsRepository } from '../repositories/adminStats.repository.js';
import { adminSettingsRepository } from '../repositories/adminSettings.repository.js';

const INACTIVITY_DAYS = 14;

// ─────────────────────────────────────────────────────────────────────────────
// Admin Alerts — computed fresh from real data every call, nothing cached or
// hardcoded. Two kinds: low overall score (threshold comes from the
// Evaluation settings an admin can actually change) and no login activity
// in INACTIVITY_DAYS. Deactivated students are excluded — nothing to alert
// staff about for an account that's already locked out.
// ─────────────────────────────────────────────────────────────────────────────

export async function getAlerts() {
  const [students, evaluationSettings] = await Promise.all([
    adminStatsRepository.getStudentsWithScores(),
    adminSettingsRepository.get('evaluation'),
  ]);
  const threshold = Number(evaluationSettings?.attentionThreshold);
  const effectiveThreshold = Number.isFinite(threshold) ? threshold : 50;

  const now = Date.now();
  const inactivityCutoff = now - INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

  const alerts = [];
  for (const s of students) {
    if (!s.isActive) continue;

    if (s.overallScore !== null && s.overallScore < effectiveThreshold) {
      alerts.push({
        type: 'low_score',
        severity: 'high',
        studentId: s.id,
        name: s.name,
        email: s.email,
        college: s.college,
        detail: `Overall score ${s.overallScore}/100 is below the ${effectiveThreshold} threshold`,
      });
    }

    const lastActiveMs = s.lastActiveAt ? new Date(s.lastActiveAt).getTime() : null;
    if (lastActiveMs && lastActiveMs < inactivityCutoff) {
      const days = Math.floor((now - lastActiveMs) / (24 * 60 * 60 * 1000));
      alerts.push({
        type: 'inactive',
        severity: 'medium',
        studentId: s.id,
        name: s.name,
        email: s.email,
        college: s.college,
        detail: `No login activity in ${days} days`,
      });
    }
  }

  const severityRank = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  return alerts;
}

export default { getAlerts };
