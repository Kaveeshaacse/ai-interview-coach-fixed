import { userRepository } from '../repositories/user.repository.js';

// ─────────────────────────────────────────────────────────────────────────────
// Activity Service
// Replaces the old in-memory activityStore.
// Persists weekly progress to Supabase asynchronously.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a user activity and update weekly progress in Supabase.
 * Designed to be called fire-and-forget (caller should .catch(() => {})).
 */
export async function recordActivity(userId, type, payload) {
  if (!userId || String(userId).startsWith('demo')) return;

  const score = payload.score || payload.overallScore || payload.resumeScore || payload.atsScore || 0;
  if (score <= 0) return;

  const days    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayLabel = days[new Date().getDay()];

  // Upsert today's score for this user
  await userRepository.upsertWeeklyProgress(userId, dayLabel, score);
}
