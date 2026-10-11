// ─────────────────────────────────────────────────────────────────────────────
// Question Bank Bridge
//
// The admin "Question Bank" (the `questions` table, managed from
// /admin/questions) used to be completely disconnected from everything
// students actually see — Aptitude, Technical Interview, Coding Practice and
// Behavioural Interview all draw their questions from static files in
// backend/utils/*.js, not from that table.
//
// This file merges the two: every function below returns the existing
// built-in question set PLUS any active admin-added questions of the
// matching type, adapted to whatever shape that module already expects.
// Nothing about the built-in sets changes, and if the admin fetch fails for
// any reason (e.g. Supabase hiccup) we silently fall back to built-in only —
// a broken admin fetch must never break a student's test.
// ─────────────────────────────────────────────────────────────────────────────

import { adminQuestionsRepository } from '../repositories/adminQuestions.repository.js';
import { getQuestionsByCategory, getAllQuestions } from '../utils/aptitudeQuestions.js';
import { getTechnicalQuestionsByRole, getSkillsForRole } from '../utils/roleSkillsMap.js';
import { getBehaviouralQuestions, BEHAVIOURAL_TOPICS } from '../utils/behaviouralQuestions.js';
import { codingProblems, getProblemById } from '../utils/codingProblems.js';
import { getCommunicationPrompts } from '../utils/communicationQuestions.js';

async function safeActiveAdminQuestions(type) {
  try {
    const rows = await adminQuestionsRepository.list({ type, isActive: true });
    // The `questions` table was originally bulk-seeded with a 1:1 copy of
    // every built-in question (source: 'seed') so the admin panel had
    // something to manage from day one. Those rows are the exact same
    // questions already included directly from the built-in files below —
    // merging them in too would show every one of them twice. Only rows a
    // staff member actually created through the admin panel should merge in.
    return rows.filter((row) => row.source !== 'seed');
  } catch {
    return [];
  }
}

// ── Aptitude ─────────────────────────────────────────────────────────────────
// Hardcoded questions use exactly one of these three category labels. Admin
// staff type a free-text category (e.g. "Numbers", "Logical Reasoning"), so we
// bucket it into the nearest of the three by keyword before merging — this
// keeps weak-area tallying (Skill Gaps) consistent instead of fragmenting.

function bucketAptitudeCategory(raw = '') {
  const c = (raw || '').toLowerCase();
  if (c.includes('logic') || c.includes('reason')) return { bucket: 'logical', label: 'Logical Reasoning' };
  if (c.includes('verbal') || c.includes('english') || c.includes('grammar') || c.includes('vocab')) {
    return { bucket: 'verbal', label: 'Verbal Ability' };
  }
  return { bucket: 'quantitative', label: 'Quantitative Aptitude' };
}

export async function getMergedAptitudeQuestions(category = 'quantitative') {
  const cat = (category || 'quantitative').toLowerCase();
  const base = getQuestionsByCategory(cat);
  const rows = await safeActiveAdminQuestions('aptitude');

  let nextId = Math.max(0, ...getAllQuestions().map((q) => q.id)) + 1;
  const adapted = rows
    .map((row) => {
      const options = Array.isArray(row.payload?.options) ? row.payload.options : [];
      const correctAnswer = row.payload?.correctAnswer;
      if (options.length < 2 || !correctAnswer) return null; // skip malformed rows rather than crash a test
      const { bucket, label } = bucketAptitudeCategory(row.category);
      return {
        id: nextId++,
        question: row.question_text,
        options,
        correctAnswer,
        category: label,
        explanation: row.payload?.explanation || '',
        _bucket: bucket,
      };
    })
    .filter(Boolean)
    .filter((q) => cat === 'all' || q._bucket === cat)
    .map(({ _bucket, ...q }) => q);

  return [...base, ...adapted];
}

// ── Technical Interview ─────────────────────────────────────────────────────
// Student side picks a ROLE (e.g. "Frontend Developer"); admin side enters a
// free-text TECHNOLOGY (e.g. "JavaScript"). We match an admin question in if
// its technology text overlaps with that role's topic list. Admin matches are
// placed first so they're guaranteed to show up (up to `count`) rather than
// only showing up by random luck alongside the built-in bank.

export async function getMergedTechnicalQuestions(role, difficulty = 'Medium', count = 5) {
  const base = getTechnicalQuestionsByRole(role, difficulty, count);
  const rows = await safeActiveAdminQuestions('technical');
  const topics = getSkillsForRole(role).map((t) => t.toLowerCase());

  const matching = rows
    .filter((row) => !row.difficulty || row.difficulty === difficulty)
    .filter((row) => {
      const tech = (row.category || row.payload?.technology || '').toLowerCase();
      if (!tech) return true; // no technology specified — treat as broadly applicable
      return topics.some((t) => tech.includes(t) || t.includes(tech));
    })
    .map((row) => ({
      id: `admin_${row.id}`,
      question: row.question_text,
      topic: row.category || row.payload?.technology || 'Technical',
      difficulty: row.difficulty || difficulty,
      expectedConcepts: Array.isArray(row.payload?.expectedConcepts) ? row.payload.expectedConcepts : [],
    }));

  return [...matching, ...base].slice(0, count);
}

// ── Behavioural Interview ───────────────────────────────────────────────────
// Student side and admin side both use a "topic", but admin's is free text
// and must land on one of the 10 canonical BEHAVIOURAL_TOPICS to be found —
// bucket it the same way aptitude categories are bucketed.

function bucketBehaviouralTopic(raw = '') {
  const c = (raw || '').trim().toLowerCase();
  const match = BEHAVIOURAL_TOPICS.find(
    (t) => t.toLowerCase() === c || c.includes(t.toLowerCase()) || t.toLowerCase().includes(c)
  );
  return match || 'General Behavioural';
}

export async function getMergedBehaviouralQuestions(topic = 'General Behavioural', difficulty = 'Medium', count = 5) {
  const base = getBehaviouralQuestions(topic, difficulty, count);
  const rows = await safeActiveAdminQuestions('behavioural');

  const matching = rows
    .filter((row) => !row.difficulty || row.difficulty === difficulty)
    .filter((row) => bucketBehaviouralTopic(row.category || row.payload?.topic) === topic)
    .map((row) => ({
      id: `admin_${row.id}`,
      question: row.question_text,
      topic,
      difficulty: row.difficulty || difficulty,
      idealAnswerNotes: row.payload?.idealAnswerNotes || '',
    }));

  return [...matching, ...base].slice(0, count);
}

// ── Coding Practice ──────────────────────────────────────────────────────────
// The real code-execution judge pipes `input` to the student's program's
// stdin and compares its stdout (trimmed) against `expected`. Admin test
// cases must be written as raw stdin/stdout text to actually grade correctly
// — not pseudocode like "nums=[2,7,11,15], target=9".

export function adminCodingNumericId(row) {
  // Deterministic id derived from the row's own uuid, so Run -> Submit ->
  // submission history all agree on the same number across requests. Offset
  // well clear of the built-in problems' 1..N numbering.
  let hash = 0;
  for (const ch of String(row.id)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return 500000 + (hash % 100000);
}

function adaptAdminCodingRow(row) {
  const testCases = Array.isArray(row.payload?.testCases) ? row.payload.testCases : [];
  const visibleTestCases = testCases.map((tc, i) => ({
    id: i + 1,
    input: tc.input || '',
    expected: tc.expectedOutput || '',
  }));
  return {
    id: adminCodingNumericId(row),
    title: row.title || (row.question_text || '').slice(0, 80) || 'Untitled Problem',
    difficulty: row.difficulty || 'Medium',
    category: row.category || 'General',
    acceptance: '—',
    description: row.question_text || '',
    inputFormat: row.payload?.constraints || '',
    outputFormat: '',
    examples: visibleTestCases.slice(0, 2).map((v) => ({ input: v.input, output: v.expected })),
    templates: {},
    visibleTestCases,
    hiddenTestCases: [],
  };
}

export async function getMergedCodingProblems() {
  const rows = await safeActiveAdminQuestions('coding');
  return [...codingProblems, ...rows.map(adaptAdminCodingRow)];
}

export async function getMergedCodingProblemById(id) {
  const builtIn = getProblemById(id);
  if (builtIn) return builtIn;
  const rows = await safeActiveAdminQuestions('coding');
  const numId = Number(id);
  return rows.map(adaptAdminCodingRow).find((p) => p.id === numId) || null;
}

// ── Communication Evaluator ─────────────────────────────────────────────────
// Student side just picks a prompt from a list (no category selector), so no
// bucketing is needed — admin-added prompts are appended as-is, tagged with
// whatever topic the admin typed (shown under the prompt, "General" if blank).

export async function getMergedCommunicationQuestions() {
  const base = getCommunicationPrompts();
  const rows = await safeActiveAdminQuestions('communication');

  const adapted = rows.map((row) => ({
    id: `admin_${row.id}`,
    question: row.question_text,
    topic: row.category || 'General',
  }));

  return [...base, ...adapted];
}

export default {
  getMergedAptitudeQuestions,
  getMergedTechnicalQuestions,
  getMergedBehaviouralQuestions,
  getMergedCodingProblems,
  getMergedCodingProblemById,
  getMergedCommunicationQuestions,
  adminCodingNumericId,
};
