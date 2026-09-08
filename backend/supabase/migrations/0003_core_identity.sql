-- 0003_core_identity
-- People in the system. `profiles` is 1:1 with `auth.users` (Supabase Auth owns
-- credentials). Role-specific attributes live in child tables to avoid a wide
-- nullable table. `full_name` is maintained by a trigger (see 0015).
-- Rollback: drop table teacher_details, student_details, profiles.

create table profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              user_role      not null,
  mksm_no           text           not null unique
                      constraint profiles_mksm_no_format check (mksm_no ~ '^[0-9]{6}$'),
  first_name        text           not null default '',
  last_name         text           not null default '',
  full_name         text           not null default '',
  email             citext         not null unique,
  phone             text,
  country           text,
  city              text,
  postal_address    text,
  pincode           text,
  date_of_birth     date,
  gender            gender,
  avatar_file_id    uuid,
  status            profile_status not null default 'active',
  created_at        timestamptz    not null default now(),
  updated_at        timestamptz    not null default now()
);

create index profiles_role_idx   on profiles (role);
create index profiles_status_idx on profiles (status);
create index profiles_full_name_trgm_idx on profiles using gin (full_name gin_trgm_ops);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function extensions.moddatetime (updated_at);

create table student_details (
  profile_id        uuid primary key references profiles (id) on delete cascade,
  years_experience  int check (years_experience is null or years_experience >= 0),
  additional_info   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger student_details_set_updated_at
  before update on student_details
  for each row execute function extensions.moddatetime (updated_at);

create table teacher_details (
  profile_id        uuid primary key references profiles (id) on delete cascade,
  access_level      teacher_access_level not null default 'standard',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger teacher_details_set_updated_at
  before update on teacher_details
  for each row execute function extensions.moddatetime (updated_at);
