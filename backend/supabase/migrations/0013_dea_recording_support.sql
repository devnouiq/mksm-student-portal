-- 0013_dea_recording_support
-- De-Enrollment Alerts (manual admin action; routed to the student's batch
-- teacher; teachers see only their own batches — PRD 8.2/8.3) and Recording
-- Requests (raised by the student from My Courses; fulfilled manually — PRD 8.4).
-- Rollback: drop table recording_requests, de_enrollment_alerts.

create table de_enrollment_alerts (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  sequence    integer not null default 1,
  student_id  uuid not null references profiles (id) on delete cascade,
  batch_id    uuid not null references batches (id) on delete cascade,
  teacher_id  uuid references profiles (id) on delete set null,
  reason      text,
  status      dea_status not null default 'open',
  created_by  uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index dea_teacher_idx on de_enrollment_alerts (teacher_id);
create index dea_student_idx on de_enrollment_alerts (student_id);
create index dea_status_idx  on de_enrollment_alerts (status);

create trigger dea_set_updated_at
  before update on de_enrollment_alerts for each row execute function extensions.moddatetime (updated_at);

create table recording_requests (
  id                     uuid primary key default gen_random_uuid(),
  student_id             uuid not null references profiles (id) on delete cascade,
  enrollment_id          uuid not null references enrollments (id) on delete cascade,
  class_session_id       uuid references class_sessions (id) on delete set null,
  status                 recording_request_status not null default 'requested',
  note                   text,
  requested_at           timestamptz not null default now(),
  fulfilled_at           timestamptz,
  fulfilled_by_profile_id uuid references profiles (id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index recording_requests_student_idx    on recording_requests (student_id);
create index recording_requests_enrollment_idx on recording_requests (enrollment_id);
create index recording_requests_status_idx     on recording_requests (status);

create trigger recording_requests_set_updated_at
  before update on recording_requests for each row execute function extensions.moddatetime (updated_at);
