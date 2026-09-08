-- 0004_courses_batches
-- Courses (also the "Explore Other Courses" catalog) and Batches (a course
-- delivered on a weekly slot by one teacher). `start_time` + `timezone` replace
-- the frontend's free-text "6:00 PM IST"; the API formats the display string.
-- Rollback: drop table batches, courses.

create table courses (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  description         text not null default '',
  level               course_level not null,
  language            class_language not null,
  price_label         text not null default '',
  is_catalog_visible  boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index courses_name_trgm_idx on courses using gin (name gin_trgm_ops);
create index courses_catalog_idx on courses (is_catalog_visible);

create trigger courses_set_updated_at
  before update on courses
  for each row execute function extensions.moddatetime (updated_at);

create table batches (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  course_id     uuid not null references courses (id) on delete restrict,
  teacher_id    uuid references profiles (id) on delete set null,
  day_of_week   day_of_week not null,
  start_time    time,
  timezone      text not null default 'Asia/Kolkata',
  pitch         pitch_variant not null,
  level         course_level not null,
  language      class_language not null,
  student_type  batch_student_type not null default 'adults',
  gender_mix    batch_gender_mix not null default 'mix',
  region        batch_region not null default 'india',
  zoom_link     text constraint batches_zoom_link_https
                  check (zoom_link is null or zoom_link ~* '^https://'),
  is_ongoing    boolean not null default false,
  status        text not null default 'active' check (status in ('active', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index batches_course_idx  on batches (course_id);
create index batches_teacher_idx on batches (teacher_id);
create index batches_status_idx  on batches (status);

create trigger batches_set_updated_at
  before update on batches
  for each row execute function extensions.moddatetime (updated_at);
