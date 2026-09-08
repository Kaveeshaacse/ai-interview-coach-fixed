-- Structured, explainable Job Match results.
alter table if exists job_description_matches
  add column if not exists requirements jsonb default '[]'::jsonb,
  add column if not exists responsibilities jsonb default '[]'::jsonb,
  add column if not exists categories jsonb default '{}'::jsonb,
  add column if not exists confidence numeric default 0,
  add column if not exists missing_required_skills text[] default '{}',
  add column if not exists missing_preferred_skills text[] default '{}';