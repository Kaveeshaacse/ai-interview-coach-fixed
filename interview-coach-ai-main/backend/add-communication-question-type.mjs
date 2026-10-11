#!/usr/bin/env node
// Lets the admin Question Bank store "communication" type questions. The
// `questions` table has a check constraint that only allowed
// ('aptitude', 'technical', 'coding', 'behavioural') — this widens it to
// also allow 'communication'. Safe to re-run (drops + re-adds the same
// constraint, "if exists").
//
// Run from interview-coach-ai-main/backend/:
//   DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-communication-question-type.mjs
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL first, e.g.:');
  console.error('  DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-communication-question-type.mjs');
  process.exit(1);
}

const sql = `
alter table questions drop constraint if exists questions_type_check;
alter table questions add constraint questions_type_check
  check (type in ('aptitude', 'technical', 'coding', 'behavioural', 'communication'));
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('Connected.\n');
  process.stdout.write('[1/1] questions.type constraint (+communication) ... ');
  try {
    await client.query(sql);
    console.log('OK');
  } catch (err) {
    console.log('FAILED');
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
  await client.end();
  console.log('\nDone. The admin Question Bank can now store Communication questions.');
}

main();
