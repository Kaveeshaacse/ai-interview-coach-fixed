// ─────────────────────────────────────────────────────────────────────────────
// Centralized Activity & Performance Tracker
//
// Architecture:
//   - Writes to in-memory Map IMMEDIATELY (zero-latency dashboard updates)
//   - Asynchronously mirrors activities into MongoDB User.weeklyProgress
//   - On server restart, in-memory store is empty but DB remains the source of truth
//   - getDynamicDashboardMetrics merges in-memory + DB data seamlessly
// ─────────────────────────────────────────────────────────────────────────────

/** @type {Map<string, {aptitude: [], coding: [], interview: [], communication: [], resume: []}>} */
const userActivities = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// Record an activity for a user (immediate in-memory + async DB persist)
// ─────────────────────────────────────────────────────────────────────────────
export function recordUserActivity(userId = 'default', type, payload) {
  const uid = String(userId);

  if (!userActivities.has(uid)) {
    userActivities.set(uid, {
      aptitude:      [],
      coding:        [],
      interview:     [],
      communication: [],
      resume:        [],
    });
  }

  const store  = userActivities.get(uid);
  const record = {
    id:        `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(),
    dateStr:   new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    timeAgo:   'Just now',
    ...payload,
  };

  if (store[type]) {
    store[type].unshift(record);
    // Cap each bucket to 20 entries in memory
    if (store[type].length > 20) store[type].length = 20;
  }

  // Async persist weekly progress snapshot to User document (fire-and-forget)
  if (uid !== 'default' && uid.match(/^[0-9a-fA-F]{24}$/)) {
    _persistWeeklySnapshot(uid).catch(() => {});
  }

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Asynchronously update the User.weeklyProgress field in MongoDB
// ─────────────────────────────────────────────────────────────────────────────
async function _persistWeeklySnapshot(userId) {
  try {
    // Lazy import to avoid circular dependency at module load time
    const { default: User } = await import('../models/User.js');
    const mongoose = await import('mongoose');

    if (mongoose.connection.readyState !== 1) return; // Not connected

    const store   = userActivities.get(userId);
    if (!store) return;

    const days    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today   = days[new Date().getDay()];
    const scores  = [];

    // Gather all scores from today's activities
    ['aptitude', 'coding', 'interview', 'communication', 'resume'].forEach((type) => {
      (store[type] || []).forEach((a) => {
        const s = a.score || a.overallScore || a.totalScore || a.atsScore || a.resumeScore;
        if (s && s > 0) scores.push(s);
      });
    });

    if (scores.length === 0) return;

    const todayAvg = Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length);

    const user = await User.findById(userId);
    if (!user) return;

    // Update or insert today's entry
    const existing = user.weeklyProgress || [];
    const idx      = existing.findIndex((e) => e.day === today);
    if (idx >= 0) {
      existing[idx].score = todayAvg;
    } else {
      existing.push({ day: today, score: todayAvg });
    }

    // Keep only last 7 distinct days
    const unique = [];
    const seen   = new Set();
    for (const e of existing.slice(-7)) {
      if (!seen.has(e.day)) { seen.add(e.day); unique.push(e); }
    }

    user.weeklyProgress = unique;
    await user.save();
  } catch (_) {
    // Silently swallow — this is a background sync operation
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get activities for a user + type from in-memory store
// ─────────────────────────────────────────────────────────────────────────────
export function getUserActivities(userId = 'default', type) {
  const uid   = String(userId);
  const store = userActivities.get(uid);
  return store?.[type] || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute dashboard metrics by merging in-memory store + DB documents
// ─────────────────────────────────────────────────────────────────────────────
export function getDynamicDashboardMetrics(userId = 'default', dbData = {}) {
  const uid   = String(userId);
  const store = userActivities.get(uid) || {
    aptitude: [], coding: [], interview: [], communication: [], resume: [],
  };

  // Prefer most recent in-memory record; fall back to DB document
  const latestApt  = store.aptitude[0]      || dbData.latestAptitude;
  const latestCode = store.coding[0]         || dbData.latestCoding;
  const latestInt  = store.interview[0]      || dbData.latestInterview;
  const latestComm = store.communication[0]  || dbData.latestComm;
  const latestRes  = store.resume[0]         || dbData.latestResume;

  const aptitudeScore      = latestApt?.score        ?? dbData.latestAptitude?.score         ?? 0;
  const codingScore        = latestCode?.score        ?? dbData.latestCoding?.score           ?? 0;
  const interviewScore     = latestInt?.score         ?? latestInt?.totalScore
                          ?? dbData.latestInterview?.totalScore                              ?? 0;
  const communicationScore = latestComm?.overallScore ?? latestComm?.score
                          ?? dbData.latestComm?.overallScore                                 ?? 0;
  const resumeScore        = latestRes?.resumeScore   ?? dbData.latestResume?.resumeScore     ?? 0;
  const atsScore           = latestRes?.atsScore      ?? dbData.latestResume?.atsScore        ?? 0;

  // Weighted overall
  const weights     = { resume: 0.15, ats: 0.10, interview: 0.25, communication: 0.15, coding: 0.20, aptitude: 0.15 };
  const overallScore = Math.round(
    resumeScore        * weights.resume        +
    atsScore           * weights.ats           +
    interviewScore     * weights.interview     +
    communicationScore * weights.communication +
    codingScore        * weights.coding        +
    aptitudeScore      * weights.aptitude
  );

  // ── Build recent activities feed ─────────────────────────────────────────
  const allEvents = [];

  store.aptitude.forEach((a) => allEvents.push({
    type:      'aptitude',
    text:      `${(a.category || 'Quantitative').toUpperCase()} Aptitude Test Completed`,
    time:      a.timeAgo || 'Recently',
    score:     a.score,
    timestamp: new Date(a.timestamp || Date.now()),
  }));

  store.coding.forEach((c) => allEvents.push({
    type:      'coding',
    text:      `${c.status === 'Accepted' || c.status === 'PASSED' ? 'Solved' : 'Attempted'} "${c.problemTitle || 'Coding Problem'}" — ${c.language || 'Java'}`,
    time:      c.timeAgo || 'Recently',
    score:     c.score,
    timestamp: new Date(c.timestamp || Date.now()),
  }));

  store.interview.forEach((i) => allEvents.push({
    type:      'interview',
    text:      `Mock Interview — ${i.role || 'Software Engineer'} (${i.type || 'Technical'})`,
    time:      i.timeAgo || 'Recently',
    score:     i.score || i.totalScore || 0,
    timestamp: new Date(i.timestamp || Date.now()),
  }));

  store.communication.forEach((c) => allEvents.push({
    type:      'communication',
    text:      'Communication Evaluation Completed',
    time:      c.timeAgo || 'Recently',
    score:     c.overallScore || c.score,
    timestamp: new Date(c.timestamp || Date.now()),
  }));

  store.resume.forEach((r) => allEvents.push({
    type:      'resume',
    text:      `Resume Analyzed — ${r.fileName || 'resume.pdf'}`,
    time:      r.timeAgo || 'Recently',
    score:     r.atsScore || r.resumeScore,
    timestamp: new Date(r.timestamp || Date.now()),
  }));

  allEvents.sort((a, b) => b.timestamp - a.timestamp);

  return {
    overallScore,
    resumeScore,
    atsScore,
    interviewScore,
    communicationScore,
    codingScore,
    aptitudeScore,
    recentActivities: allEvents.slice(0, 6),
  };
}

export default {
  recordUserActivity,
  getUserActivities,
  getDynamicDashboardMetrics,
};
