#!/usr/bin/env node
// Adds the two tables the new student notification bell needs, directly via
// Postgres (same approach as push-schema-pg.mjs). Safe to re-run — every
// statement is "if not exists". Does not touch any existing table's data.
//
// Run from interview-coach-ai-main/backend/:
//   DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-student-notifications.mjs
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL first, e.g.:');
  console.error('  DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" node add-student-notifications.mjs');
  process.exit(1);
}

const sql = `
-- ── STUDENT NOTIFICATIONS ────────────────────────────────────────────────────
-- Broadcast feed shown via the bell icon in the student portal header.
-- Unlike admin_notifications (one shared is_read flag — fine for a small
-- staff team), read-state here is tracked per student in a separate table,
-- since one student reading a notification must not mark it read for
-- everyone else.
create table if not exists student_notifications (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  message    text not null,
  type       text check (type in ('info', 'warning', 'action')) default 'info',
  created_at timestamptz default now()
);
create index if not exists student_notifications_created_idx on student_notifications(created_at desc);

create table if not exists student_notification_reads (
  notification_id uuid references student_notifications(id) on delete cascade not null,
  user_id          uuid references users(id) on delete cascade not null,
  read_at          timestamptz default now(),
  primary key (notification_id, user_id)
);
create index if not exists student_notification_reads_user_idx on student_notification_reads(user_id);
`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log('Connected.\n');
  process.stdout.write('[1/1] Student notifications (student_notifications, student_notification_reads) ... ');
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
  console.log('\nDone. Student notifications tables are ready.');
}

main();
