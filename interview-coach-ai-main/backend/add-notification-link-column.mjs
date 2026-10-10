#!/usr/bin/env node
// Adds a `link` column to student_notifications so clicking a notification
// can take the student directly to the relevant page (e.g. straight to a
// specific coding problem). Safe to re-run — "if not exists".
//
// Run from interview-coach-ai-main/backend/:
//   DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-notification-link-column.mjs
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL first, e.g.:');
  console.error('  DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-notification-link-column.mjs');
  process.exit(1);
}

const sql = `
alter table student_notifications add column if not exists link text;
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('Connected.\n');
  process.stdout.write('[1/1] student_notifications.link column ... ');
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
  console.log('\nDone. Notifications can now carry a link.');
}

main();
