-- 0014_files_audit
-- File metadata (objects live in Supabase Storage buckets), support requests,
-- and the cross-cutting audit + notification logs. Also wires the deferred FKs
-- from earlier tables to `file_objects`.
-- Rollback: drop table notification_log, audit_log, support_requests, file_objects
--           (after dropping the added FKs).

create table file_objects (
  id                     uuid primary key default gen_random_uuid(),
  bucket                 text not null check (bucket in
                           ('homework', 'feedback-audio', 'practice-material', 'announcements', 'avatars')),
  path                   text not null,
  original_name          text not null default '',
  mime_type              text not null default 'application/octet-stream',
  size_bytes             bigint not null default 0 check (size_bytes >= 0),
  uploaded_by_profile_id uuid references profiles (id) on delete set null,
  created_at             timestamptz not null default now(),
  unique (bucket, path)
);

create index file_objects_uploader_idx on file_objects (uploaded_by_profile_id);

-- Deferred FKs to file_objects.
alter table profiles
  add constraint profiles_avatar_file_fk
  foreign key (avatar_file_id) references file_objects (id) on delete set null;

alter table practice_materials
  add constraint practice_materials_file_fk
  foreign key (file_id) references file_objects (id) on delete set null;

alter table homework_attachments
  add constraint homework_attachments_file_fk
  foreign key (file_id) references file_objects (id) on delete restrict;

alter table homework_feedback
  add constraint homework_feedback_audio_file_fk
  foreign key (feedback_audio_file_id) references file_objects (id) on delete set null;

alter table announcements
  add constraint announcements_attachment_file_fk
  foreign key (attachment_file_id) references file_objects (id) on delete set null;

create table support_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles (id) on delete cascade,
  subject      text not null,
  message      text not null,
  status       support_status not null default 'open',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index support_requests_requester_idx on support_requests (requester_id);
create index support_requests_status_idx    on support_requests (status);

create trigger support_requests_set_updated_at
  before update on support_requests for each row execute function extensions.moddatetime (updated_at);

create table audit_log (
  id                uuid primary key default gen_random_uuid(),
  actor_profile_id  uuid references profiles (id) on delete set null,
  action            text not null,
  entity_type       text not null,
  entity_id         uuid,
  before            jsonb,
  after             jsonb,
  correlation_id    text,
  created_at        timestamptz not null default now()
);

create index audit_log_entity_idx  on audit_log (entity_type, entity_id);
create index audit_log_actor_idx   on audit_log (actor_profile_id);
create index audit_log_created_idx on audit_log (created_at desc);

create table notification_log (
  id                    uuid primary key default gen_random_uuid(),
  channel               notification_channel not null,
  template              text not null,
  recipient_profile_id  uuid references profiles (id) on delete set null,
  payload               jsonb,
  status                text not null default 'queued',
  error                 text,
  sent_at               timestamptz,
  created_at            timestamptz not null default now()
);

create index notification_log_recipient_idx on notification_log (recipient_profile_id);
create index notification_log_status_idx    on notification_log (status);
