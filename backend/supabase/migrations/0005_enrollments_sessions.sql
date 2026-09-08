-- 0005_enrollments_sessions
-- A student's place in a batch (with progress), and concrete class occurrences.
-- `class_sessions` are the anchor for attendance, homework and class logs.
-- Rollback: drop table class_sessions, enrollments.

create table enrollments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references profiles (id) on delete cascade,
  batch_id     uuid not null references batches (id) on delete restrict,
  status       enrollment_status not null default 'active',
  progress     numeric(4,3) not null default 0 check (progress >= 0 and progress <= 1),
  enrolled_at  date not null default current_date,
  ended_at     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (student_id, batch_id)
);

create index enrollments_batch_idx   on enrollments (batch_id);
create index enrollments_student_idx on enrollments (student_id);
create index enrollments_status_idx  on enrollments (status);

create trigger enrollments_set_updated_at
  before update on enrollments
  for each row execute function extensions.moddatetime (updated_at);

create table class_sessions (
  id              uuid primary key default gen_random_uuid(),
  batch_id        uuid not null references batches (id) on delete cascade,
  scheduled_date  date not null,
  scheduled_start timestamptz not null,
  status          class_session_status not null default 'scheduled',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (batch_id, scheduled_date)
);

create index class_sessions_batch_idx  on class_sessions (batch_id);
create index class_sessions_start_idx  on class_sessions (scheduled_start);
create index class_sessions_date_idx   on class_sessions (scheduled_date);

create trigger class_sessions_set_updated_at
  before update on class_sessions
  for each row execute function extensions.moddatetime (updated_at);
