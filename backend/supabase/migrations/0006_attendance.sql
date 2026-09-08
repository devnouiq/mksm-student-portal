-- 0006_attendance
-- One row per (class session, student). Auto-marked Present (Online) when the
-- student opens Zoom via "Join Now" on the class day (PRD 8.8); the teacher can
-- review and adjust. `mode` must be set whenever `present` is true.
-- Rollback: drop table attendance_records.

create table attendance_records (
  id                   uuid primary key default gen_random_uuid(),
  class_session_id     uuid not null references class_sessions (id) on delete cascade,
  student_id           uuid not null references profiles (id) on delete cascade,
  present              boolean not null default false,
  mode                 attendance_mode,
  source               attendance_source not null default 'teacher',
  joined_via_zoom_at   timestamptz,
  marked_by_profile_id uuid references profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (class_session_id, student_id),
  constraint attendance_mode_required_when_present
    check (present = false or mode is not null)
);

create index attendance_session_idx on attendance_records (class_session_id);
create index attendance_student_present_idx on attendance_records (student_id, present);

create trigger attendance_records_set_updated_at
  before update on attendance_records
  for each row execute function extensions.moddatetime (updated_at);
