-- 0012_reference_data
-- Admin-editable lookup lists + class logs + WhatsApp config. These are TABLES
-- (not enums) because admins manage them: ragas (Class Log dropdown), the 2026
-- holiday calendar, Help tutorials/FAQs, WhatsApp templates, and a generic
-- key/value settings table (holds the WhatsApp connection row, "Voices of MKSM"
-- YouTube link, etc.).
-- Rollback: drop table class_logs, whatsapp_templates, help_faqs, help_tutorials,
--           holidays, ragas, integration_settings.

create table ragas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  season      text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger ragas_set_updated_at
  before update on ragas for each row execute function extensions.moddatetime (updated_at);

create table holidays (
  id            uuid primary key default gen_random_uuid(),
  holiday_date  date not null,
  name          text not null,
  kind          holiday_kind not null,
  year          integer generated always as (extract(year from holiday_date)::int) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (holiday_date, name)
);

create index holidays_year_idx on holidays (year);

create trigger holidays_set_updated_at
  before update on holidays for each row execute function extensions.moddatetime (updated_at);

create table help_tutorials (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null default '',
  duration_label  text not null default '',
  video_url       text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger help_tutorials_set_updated_at
  before update on help_tutorials for each row execute function extensions.moddatetime (updated_at);

create table help_faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null,
  answer      text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger help_faqs_set_updated_at
  before update on help_faqs for each row execute function extensions.moddatetime (updated_at);

create table whatsapp_templates (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null unique,
  description           text not null default '',
  status                whatsapp_template_status not null default 'pending',
  body                  text,
  trigger_event         text,
  provider_template_id  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger whatsapp_templates_set_updated_at
  before update on whatsapp_templates for each row execute function extensions.moddatetime (updated_at);

create table integration_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger integration_settings_set_updated_at
  before update on integration_settings for each row execute function extensions.moddatetime (updated_at);

create table class_logs (
  id                uuid primary key default gen_random_uuid(),
  batch_id          uuid not null references batches (id) on delete cascade,
  class_session_id  uuid references class_sessions (id) on delete set null,
  class_date        date not null,
  teacher_id        uuid not null references profiles (id) on delete restrict,
  raga_id           uuid references ragas (id) on delete set null,
  what_covered      text not null,
  comments          text,
  edited_by         uuid references profiles (id) on delete set null,
  edited_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (batch_id, class_date)
);

create index class_logs_teacher_idx on class_logs (teacher_id);
create index class_logs_batch_idx   on class_logs (batch_id);
create index class_logs_date_idx    on class_logs (class_date);

create trigger class_logs_set_updated_at
  before update on class_logs for each row execute function extensions.moddatetime (updated_at);
