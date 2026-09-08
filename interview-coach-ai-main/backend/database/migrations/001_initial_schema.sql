-- ─────────────────────────────────────────────────────────────────────────────
-- AI Interview Coach — PostgreSQL Schema (Supabase)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── USERS ──────────────────────────────────────────────────────────────────
create table if not exists users (
  id               uuid primary key default gen_random_uuid(),
  email            text unique not null,
  password_hash    text not null,
  name             text not null,
  college          text default '',
  degree           text default '',
  branch           text default '',
  graduation_year  text default '',
  phone            text default '',
  location         text default '',
  bio              text default '',
  linkedin_url     text default '',
  github_url       text default '',
  portfolio_url    text default '',
  resume_url       text default '',
  job_preference   text default 'Software Engineer',
  total_sessions   int  default 0,
  last_login_at    timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists users_email_idx on users(email);

-- ── USER SKILLS ─────────────────────────────────────────────────────────────
create table if not exists user_skills (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade not null,
  skill_name text not null,
  level      int  default 0 check (level >= 0 and level <= 100),
  category   text default 'General',
  created_at timestamptz default now()
);
create index if not exists user_skills_user_id_idx on user_skills(user_id);

-- ── USER SCORE AVERAGES ─────────────────────────────────────────────────────
create table if not exists user_score_averages (
  user_id             uuid primary key references users(id) on delete cascade,
  resume_score        numeric default 0,
  ats_score           numeric default 0,
  interview_score     numeric default 0,
  communication_score numeric default 0,
  coding_score        numeric default 0,
  aptitude_score      numeric default 0,
  overall_score       numeric default 0,
  updated_at          timestamptz default now()
);

-- ── WEEKLY PROGRESS ─────────────────────────────────────────────────────────
create table if not exists weekly_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade not null,
  day_label     text    not null,
  score         numeric default 0,
  recorded_date date    default current_date,
  unique (user_id, recorded_date)
);
create index if not exists weekly_progress_user_idx on weekly_progress(user_id, recorded_date desc);

-- ── RESUMES ─────────────────────────────────────────────────────────────────
create table if not exists resumes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete cascade not null,
  file_name      text not null,
  file_url       text,
  file_size      int,
  mime_type      text,
  extracted_text text,
  overall_score  numeric default 0,
  ats_score      numeric default 0,
  target_role    text default 'Software Engineer',
  version        int  default 1,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
create index if not exists resumes_user_id_created_idx on resumes(user_id, created_at desc);

-- ── RESUME EXTRACTED INFO ───────────────────────────────────────────────────
create table if not exists resume_extracted_info (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid unique references resumes(id) on delete cascade,
  candidate_name  text,
  email           text,
  phone           text,
  location        text,
  linkedin_url    text,
  github_url      text,
  education       text[],
  experience      text[],
  certifications  text[],
  projects        text[],
  skills          text[],
  languages       text[],
  word_count      int,
  estimated_pages int
);

-- ── RESUME SECTION SCORES ───────────────────────────────────────────────────
create table if not exists resume_section_scores (
  id               uuid primary key default gen_random_uuid(),
  resume_id        uuid unique references resumes(id) on delete cascade,
  ats_compatibility numeric default 0,
  skills           numeric default 0,
  keywords         numeric default 0,
  education        numeric default 0,
  experience       numeric default 0,
  projects         numeric default 0,
  certifications   numeric default 0,
  formatting       numeric default 0,
  content_quality  numeric default 0,
  job_relevance    numeric default 0
);

-- ── RESUME HEALTH ───────────────────────────────────────────────────────────
create table if not exists resume_health (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid unique references resumes(id) on delete cascade,
  good_points     text[],
  improvements    text[],
  missing_items   text[],
  recommendations text[]
);

-- ── RESUME KEYWORDS ─────────────────────────────────────────────────────────
create table if not exists resume_keywords (
  id             uuid primary key default gen_random_uuid(),
  resume_id      uuid references resumes(id) on delete cascade not null,
  keyword        text not null,
  status         text check (status in ('found', 'missing', 'needs_improvement')) not null,
  frequency      int  default 0,
  importance     text check (importance in ('high', 'medium', 'low')),
  suggestion     text,
  recommendation text
);
create index if not exists resume_keywords_resume_status_idx on resume_keywords(resume_id, status);

-- ── IMPROVEMENT SUGGESTIONS ─────────────────────────────────────────────────
-- Structured table — NOT strings. Each suggestion is a proper relational row.
create table if not exists resume_improvement_suggestions (
  id              uuid primary key default gen_random_uuid(),
  resume_id       uuid references resumes(id) on delete cascade not null,
  section_name    text not null,
  suggestion_type text check (suggestion_type in ('missing', 'weak', 'improvement')),
  current_text    text,
  improved_text   text,
  reason          text,
  created_at      timestamptz default now()
);
create index if not exists improvement_suggestions_resume_idx on resume_improvement_suggestions(resume_id);

-- ── ATS SCORES ──────────────────────────────────────────────────────────────
create table if not exists ats_scores (
  id                       uuid primary key default gen_random_uuid(),
  resume_id                uuid references resumes(id) on delete cascade not null,
  target_role              text    not null,
  overall_score            numeric not null,
  status_label             text,
  keyword_match_score      numeric,
  experience_project_score numeric,
  section_score            numeric,
  structure_score          numeric,
  terminology_score        numeric,
  contact_score            numeric,
  role_matched_keywords    text[],
  missing_keywords         text[],
  role_improvements        text[],
  created_at               timestamptz default now()
);
create index if not exists ats_scores_resume_idx on ats_scores(resume_id, created_at desc);

-- ── JOB DESCRIPTION MATCHES ─────────────────────────────────────────────────
create table if not exists job_description_matches (
  id                        uuid primary key default gen_random_uuid(),
  resume_id                 uuid references resumes(id) on delete cascade not null,
  job_description_text      text,
  match_score               numeric,
  matching_skills           text[],
  missing_skills            text[],
  matching_keywords         text[],
  missing_keywords          text[],
  recommendations           text[],
  summary                   text,
  required_experience       int,
  education_requirements    text[],
  certification_requirements text[],
  created_at                timestamptz default now()
);
create index if not exists job_match_resume_idx on job_description_matches(resume_id, created_at desc);

-- ── INTERVIEWS ──────────────────────────────────────────────────────────────
create table if not exists interviews (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references users(id) on delete cascade not null,
  role              text not null,
  type              text check (type in ('Behavioral', 'Technical', 'HR', 'Case Study')) default 'Behavioral',
  technology        text default '',
  difficulty        text check (difficulty in ('Easy', 'Medium', 'Hard')) default 'Medium',
  total_score       numeric  default 0,
  overall_feedback  text     default '',
  strengths         text[],
  weaknesses        text[],
  recommended_topics text[],
  status            text check (status in ('in-progress', 'completed')) default 'in-progress',
  duration_minutes  int      default 15,
  completed_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists interviews_user_id_created_idx on interviews(user_id, created_at desc);
create index if not exists interviews_user_id_status_idx  on interviews(user_id, status);
create index if not exists interviews_user_id_type_idx    on interviews(user_id, type);

-- ── INTERVIEW QUESTIONS ─────────────────────────────────────────────────────
create table if not exists interview_questions (
  id             uuid primary key default gen_random_uuid(),
  interview_id   uuid references interviews(id) on delete cascade not null,
  question_order int  not null,
  question_text  text not null,
  topic          text,
  category       text,
  difficulty     text,
  technology     text
);
create index if not exists interview_questions_interview_idx on interview_questions(interview_id, question_order);

-- ── INTERVIEW ANSWERS ───────────────────────────────────────────────────────
create table if not exists interview_answers (
  id              uuid primary key default gen_random_uuid(),
  interview_id    uuid references interviews(id) on delete cascade not null,
  question_id     uuid references interview_questions(id),
  question_order  int,
  question_text   text,
  user_answer     text,
  score           numeric default 0,
  clarity_score   numeric default 0,
  grammar_score   numeric default 0,
  confidence_score numeric default 0,
  technical_score numeric default 0,
  feedback        text,
  strengths       text[],
  weaknesses      text[],
  improved_answer text,
  evaluated_at    timestamptz default now()
);
create index if not exists interview_answers_interview_idx on interview_answers(interview_id);

-- ── APTITUDE ATTEMPTS ───────────────────────────────────────────────────────
create table if not exists aptitude_attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete cascade not null,
  category        text    not null,
  total_questions int     not null,
  correct_answers int     default 0,
  wrong_answers   int     default 0,
  unanswered      int     default 0,
  score           numeric default 0,
  accuracy        numeric default 0,
  time_taken      text,
  weak_areas      text[],
  category_scores jsonb   default '{}',
  submitted_at    timestamptz default now(),
  created_at      timestamptz default now()
);
create index if not exists aptitude_attempts_user_idx on aptitude_attempts(user_id, created_at desc);

-- ── APTITUDE ANSWERS ────────────────────────────────────────────────────────
create table if not exists aptitude_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid references aptitude_attempts(id) on delete cascade not null,
  question_id     int,
  question_text   text,
  category        text,
  options         text[],
  selected_answer text,
  correct_answer  text,
  is_correct      boolean default false,
  status          text check (status in ('correct', 'wrong', 'unanswered')),
  explanation     text
);
create index if not exists aptitude_answers_attempt_idx on aptitude_answers(attempt_id);

-- ── CODING ATTEMPTS ─────────────────────────────────────────────────────────
create table if not exists coding_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references users(id) on delete cascade not null,
  problem_id       int  not null,
  problem_title    text not null,
  difficulty       text,
  category         text,
  language         text,
  code             text,
  status           text,
  score            numeric default 0,
  passed_test_cases int   default 0,
  total_test_cases  int   default 0,
  execution_time_ms int   default 0,
  created_at       timestamptz default now()
);
create index if not exists coding_attempts_user_idx    on coding_attempts(user_id, created_at desc);
create index if not exists coding_attempts_problem_idx on coding_attempts(user_id, problem_id);

-- ── COMMUNICATION ATTEMPTS ──────────────────────────────────────────────────
create table if not exists communication_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references users(id) on delete cascade not null,
  input_text       text    not null,
  word_count       int     default 0,
  grammar_score    numeric default 0,
  clarity_score    numeric default 0,
  vocabulary_score numeric default 0,
  confidence_score numeric default 0,
  relevance_score  numeric default 0,
  overall_score    numeric default 0,
  mistakes         jsonb   default '[]',
  improved_answer  text,
  created_at       timestamptz default now()
);
create index if not exists communication_attempts_user_idx on communication_attempts(user_id, created_at desc);

-- ── LEARNING PATHS ──────────────────────────────────────────────────────────
create table if not exists learning_paths (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade not null,
  path_key      text    not null,
  title         text    not null,
  description   text,
  reason        text,
  icon          text,
  color         text,
  level         text,
  priority      text,
  trigger_score numeric,
  progress      numeric default 0,
  started       boolean default false,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz default now(),
  unique (user_id, path_key)
);
create index if not exists learning_paths_user_idx on learning_paths(user_id);

-- ── LEARNING PATH TOPICS ────────────────────────────────────────────────────
create table if not exists learning_path_topics (
  id                 uuid primary key default gen_random_uuid(),
  path_id            uuid references learning_paths(id) on delete cascade not null,
  topic_key          text,
  title              text not null,
  description        text,
  resources          jsonb   default '[]',
  practice_questions text[],
  completed          boolean default false,
  completed_at       timestamptz,
  sort_order         int     default 0
);
create index if not exists learning_path_topics_path_idx on learning_path_topics(path_id, sort_order);

-- ── SKILL ASSESSMENTS ───────────────────────────────────────────────────────
create table if not exists skill_assessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete cascade not null,
  current_skills jsonb default '[]',
  skill_gaps     jsonb default '[]',
  recommendations jsonb default '[]',
  score_snapshot jsonb default '{}',
  created_at     timestamptz default now()
);
create index if not exists skill_assessments_user_idx on skill_assessments(user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- End of migration 001
-- ─────────────────────────────────────────────────────────────────────────────
