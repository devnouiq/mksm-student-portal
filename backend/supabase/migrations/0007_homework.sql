-- 0007_homework
-- Weekly homework tied to a class session (PRD 8.7). A student submits against a
-- class date; `is_late` is frozen at submit time (>= 2 days before the class).
-- `homework_pending` is a virtual status (no row) surfaced by the API, never
-- stored. Feedback is 1:1 with a submission.
-- Rollback: drop table homework_feedback, homework_attachments, homework_submissions.

create table homework_submissions (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references profiles (id) on delete cascade,
  batch_id          uuid not null references batches (id) on delete restrict,
  class_session_id  uuid not null references class_sessions (id) on delete restrict,
  title             text not null,
  description       text not null default '',
  status            homework_status not null default 'submitted',
  is_late           boolean not null default false,
  submitted_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (student_id, class_session_id)
);

create index homework_batch_status_idx on homework_submissions (batch_id, status);
create index homework_student_idx      on homework_submissions (student_id);
create index homework_session_idx      on homework_submissions (class_session_id);
create index homework_submitted_at_idx on homework_submissions (submitted_at);

create trigger homework_submissions_set_updated_at
  before update on homework_submissions
  for each row execute function extensions.moddatetime (updated_at);

create table homework_attachments (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references homework_submissions (id) on delete cascade,
  file_id        uuid not null,
  kind           material_kind not null,
  created_at     timestamptz not null default now()
);

create index homework_attachments_submission_idx on homework_attachments (submission_id);

create table homework_feedback (
  id                     uuid primary key default gen_random_uuid(),
  submission_id          uuid not null unique references homework_submissions (id) on delete cascade,
  teacher_id             uuid not null references profiles (id) on delete restrict,
  feedback_text          text not null default '',
  feedback_audio_file_id uuid,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index homework_feedback_teacher_idx on homework_feedback (teacher_id);

create trigger homework_feedback_set_updated_at
  before update on homework_feedback
  for each row execute function extensions.moddatetime (updated_at);
