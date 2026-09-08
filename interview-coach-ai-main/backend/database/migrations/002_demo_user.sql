-- Insert the demo user so demo tokens work in development
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

insert into users (
  id,
  email,
  password_hash,
  name,
  job_preference
) values (
  '00000000-0000-0000-0000-000000000001',
  'demo@interviewcoach.ai',
  '$2a$10$demohashdemohashdemohashdemohashdemohashdemo',
  'Demo Student',
  'Software Engineer'
) on conflict (id) do nothing;

insert into user_score_averages (user_id) 
values ('00000000-0000-0000-0000-000000000001')
on conflict (user_id) do nothing;
