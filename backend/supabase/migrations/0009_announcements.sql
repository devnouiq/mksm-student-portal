-- 0009_announcements
-- Announcements + "Message from MK". `source` routes where it surfaces on the
-- student side ('mahesh_kale' -> Message from MK, may carry media). Audience is
-- one of: all / a custom group / a batch / a single student / all teachers.
-- Admin "Remove" is a soft delete. Per-user read state drives unread counts.
-- Rollback: drop table announcement_reads, announcements, announcement_audience_groups.

create table announcement_audience_groups (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,
  filter      jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger announcement_audience_groups_set_updated_at
  before update on announcement_audience_groups
  for each row execute function extensions.moddatetime (updated_at);

create table announcements (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  body                text not null,
  source              announcement_source not null default 'admin',
  author_id           uuid references profiles (id) on delete set null,
  is_important        boolean not null default false,
  attachment_file_id  uuid,
  audience            announcement_audience not null default 'all',
  audience_group_id   uuid references announcement_audience_groups (id) on delete set null,
  audience_batch_id   uuid references batches (id) on delete cascade,
  audience_student_id uuid references profiles (id) on delete cascade,
  media_kind          mk_media_kind,
  media_url           text,
  published_at        timestamptz not null default now(),
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint announcement_audience_target check (
    (audience = 'custom_group' and audience_group_id   is not null) or
    (audience = 'batch'        and audience_batch_id   is not null) or
    (audience = 'student'      and audience_student_id is not null) or
    (audience in ('all', 'teachers'))
  )
);

create index announcements_source_idx    on announcements (source);
create index announcements_published_idx on announcements (published_at desc);
create index announcements_audience_idx  on announcements (audience);
create index announcements_live_idx      on announcements (published_at desc) where deleted_at is null;

create trigger announcements_set_updated_at
  before update on announcements
  for each row execute function extensions.moddatetime (updated_at);

create table announcement_reads (
  announcement_id uuid not null references announcements (id) on delete cascade,
  profile_id      uuid not null references profiles (id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (announcement_id, profile_id)
);

create index announcement_reads_profile_idx on announcement_reads (profile_id);
