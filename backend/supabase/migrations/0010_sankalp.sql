-- 0010_sankalp
-- Self-reported practice hours, keyed to the 6-digit MKSM number (PRD 8.1).
-- Historical rows migrate from the Google Sheet with source='google_form' and an
-- external_ref for idempotency. Targets are configured; achieved is derived (0017).
-- Rollback: drop table sankalp_targets, sankalp_logs.

create table sankalp_logs (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references profiles (id) on delete cascade,
  mksm_no         text not null constraint sankalp_mksm_no_format check (mksm_no ~ '^[0-9]{6}$'),
  minutes         integer not null check (minutes > 0),
  hours           numeric(8,2) generated always as (minutes / 60.0) stored,
  logged_for_date date not null,
  submitted_at    timestamptz not null default now(),
  source          sankalp_log_source not null default 'portal',
  external_ref    text,
  created_at      timestamptz not null default now()
);

create index sankalp_logs_student_idx    on sankalp_logs (student_id);
create index sankalp_logs_logged_for_idx on sankalp_logs (logged_for_date);
create index sankalp_logs_submitted_idx  on sankalp_logs (submitted_at);
create unique index sankalp_logs_external_ref_uniq
  on sankalp_logs (source, external_ref) where external_ref is not null;

create table sankalp_targets (
  id               uuid primary key default gen_random_uuid(),
  scope            sankalp_scope not null,
  scope_teacher_id uuid references profiles (id) on delete cascade,
  period           text not null default 'all-time',
  target_hours     numeric(12,2) not null check (target_hours >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint sankalp_target_scope_shape check (
    (scope = 'school'  and scope_teacher_id is null) or
    (scope = 'teacher' and scope_teacher_id is not null)
  )
);

create unique index sankalp_targets_uniq
  on sankalp_targets (scope, coalesce(scope_teacher_id, '00000000-0000-0000-0000-000000000000'::uuid), period);

create trigger sankalp_targets_set_updated_at
  before update on sankalp_targets
  for each row execute function extensions.moddatetime (updated_at);
