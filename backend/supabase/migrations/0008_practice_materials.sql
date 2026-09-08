-- 0008_practice_materials
-- Admin owns the master library and shares items to teachers, to batches, or to
-- everyone. A teacher may re-share an admin item to their own batches (a new
-- share row, shared_by = teacher) and may upload their own items shareable only
-- to their own batches (PRD 8.10). Admin items stay admin-owned.
-- Rollback: drop table practice_material_shares, practice_materials.

create table practice_materials (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  kind              material_kind not null,
  pitch             pitch_variant,
  owner_role        material_owner_role not null,
  owner_profile_id  uuid not null references profiles (id) on delete restrict,
  notes             text,
  file_id           uuid,
  external_url      text check (external_url is null or external_url ~* '^https?://'),
  meta              text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index practice_materials_owner_idx on practice_materials (owner_profile_id);
create index practice_materials_kind_idx  on practice_materials (kind);

create trigger practice_materials_set_updated_at
  before update on practice_materials
  for each row execute function extensions.moddatetime (updated_at);

create table practice_material_shares (
  id                  uuid primary key default gen_random_uuid(),
  material_id          uuid not null references practice_materials (id) on delete cascade,
  target               material_share_target not null,
  target_teacher_id    uuid references profiles (id) on delete cascade,
  target_batch_id      uuid references batches (id) on delete cascade,
  shared_by_profile_id uuid not null references profiles (id) on delete restrict,
  created_at           timestamptz not null default now(),
  constraint share_target_columns_match check (
    (target = 'teacher' and target_teacher_id is not null and target_batch_id is null) or
    (target = 'batch'   and target_batch_id   is not null and target_teacher_id is null) or
    (target = 'all'     and target_teacher_id is null     and target_batch_id   is null)
  )
);

create index practice_shares_material_idx on practice_material_shares (material_id);
create index practice_shares_teacher_idx  on practice_material_shares (target_teacher_id);
create index practice_shares_batch_idx    on practice_material_shares (target_batch_id);

create unique index practice_shares_unique_teacher
  on practice_material_shares (material_id, target_teacher_id) where target = 'teacher';
create unique index practice_shares_unique_batch
  on practice_material_shares (material_id, target_batch_id) where target = 'batch';
create unique index practice_shares_unique_all
  on practice_material_shares (material_id) where target = 'all';
