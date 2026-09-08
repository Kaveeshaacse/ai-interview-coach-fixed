-- Store the exact interview question evaluated with each answer.
alter table if exists communication_attempts
  add column if not exists question text default '';