// Seeds the new `questions` table from the existing hardcoded question banks
// (aptitude, technical, coding, behavioural) so the Admin Question Bank has
// something to manage from day one. Safe to re-run: it only ever replaces
// rows it created itself (source = 'seed'); anything an admin adds later
// (source = 'admin') is never touched.
//
// Save this file INSIDE interview-coach-ai-main/backend/ and run from there:
//   node seed-questions.mjs
// (requires backend/.env to have SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { aptitudeQuestions } = await import('./utils/aptitudeQuestions.js');
const { QUESTION_BANK } = await import('./utils/interviewQuestions.js');
const { codingProblems } = await import('./utils/codingProblems.js');
const { BEHAVIOURAL_QUESTIONS } = await import('./utils/behaviouralQuestions.js');

const rows = [];

// ── Aptitude ──────────────────────────────────────────────────────────────
for (const [category, list] of Object.entries(aptitudeQuestions)) {
  for (const q of list) {
    rows.push({
      type: 'aptitude',
      category,
      difficulty: 'Medium',
      title: q.question.slice(0, 80),
      question_text: q.question,
      payload: { legacy_id: q.id, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation, category: q.category },
      is_active: true,
      source: 'seed',
    });
  }
}

// ── Technical ─────────────────────────────────────────────────────────────
for (const [technology, list] of Object.entries(QUESTION_BANK)) {
  for (const q of list) {
    rows.push({
      type: 'technical',
      category: technology,
      difficulty: q.difficulty || 'Medium',
      title: q.question.slice(0, 80),
      question_text: q.question,
      payload: { legacy_id: q.id, technology: q.technology, category: q.category, expectedConcepts: q.expectedConcepts || [] },
      is_active: true,
      source: 'seed',
    });
  }
}

// ── Coding ────────────────────────────────────────────────────────────────
for (const p of codingProblems) {
  rows.push({
    type: 'coding',
    category: p.category || '',
    difficulty: p.difficulty || 'Medium',
    title: p.title,
    question_text: p.description || p.title,
    payload: {
      legacy_id: p.id, title: p.title, acceptance: p.acceptance,
      description: p.description, inputFormat: p.inputFormat, outputFormat: p.outputFormat,
      examples: p.examples || [], templates: p.templates || {}, testCases: p.testCases || [],
    },
    is_active: true,
    source: 'seed',
  });
}

// ── Behavioural ───────────────────────────────────────────────────────────
for (const [topic, byDifficulty] of Object.entries(BEHAVIOURAL_QUESTIONS)) {
  for (const [difficulty, list] of Object.entries(byDifficulty)) {
    for (const q of list) {
      rows.push({
        type: 'behavioural',
        category: topic,
        difficulty,
        title: q.question.slice(0, 80),
        question_text: q.question,
        payload: { legacy_id: q.id, topic: q.topic || topic },
        is_active: true,
        source: 'seed',
      });
    }
  }
}

console.log(`Prepared ${rows.length} questions to seed (aptitude/technical/coding/behavioural).`);

// Replace any previous seed rows (never touches admin-added rows).
const { error: delErr } = await sb.from('questions').delete().eq('source', 'seed');
if (delErr) { console.error('Delete old seed rows failed:', delErr.message); process.exit(1); }

// Insert in batches.
const BATCH = 200;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await sb.from('questions').insert(batch);
  if (error) { console.error('Insert failed at batch', i, ':', error.message); process.exit(1); }
  inserted += batch.length;
  console.log(`Inserted ${inserted}/${rows.length}...`);
}

console.log(`\nDone. Seeded ${inserted} questions into the 'questions' table.`);
