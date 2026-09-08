-- 0015_functions_triggers
-- Helper functions + triggers: keep profiles.full_name in sync, provision a
-- public.profiles row when Supabase Auth creates a user, RLS identity helpers,
-- MKSM number allocation, and the homework late-cutoff rule (PRD 8.7).
-- Rollback: drop the functions + triggers created here.

-- --- profiles.full_name ---------------------------------------------------
create or replace function public.sync_profile_full_name()
returns trigger
language plpgsql
as $$
begin
  new.full_name := coalesce(
    nullif(btrim(coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, '')), ''),
    new.full_name
  );
  return new;
end;
$$;

create trigger profiles_sync_full_name
  before insert or update of first_name, last_name on public.profiles
  for each row execute function public.sync_profile_full_name();

-- --- RLS identity helpers ----------------------------------------------
-- profiles.id == auth.users.id, so the current profile id is just auth.uid().
create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.current_profile_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- --- MKSM number allocation (PRD 12.14 — assumption) -------------------
-- Banded by role to match existing data: student 1xxxxx, teacher 5xxxxx,
-- admin 9xxxxx. Retries on collision.
create or replace function public.allocate_mksm_no(p_role user_role)
returns text
language plpgsql
as $$
declare
  v_lo int;
  v_hi int;
  v_candidate text;
  v_attempts int := 0;
begin
  if p_role = 'student' then v_lo := 100000; v_hi := 199999;
  elsif p_role = 'teacher' then v_lo := 500000; v_hi := 599999;
  else v_lo := 900000; v_hi := 999999;
  end if;

  loop
    v_attempts := v_attempts + 1;
    v_candidate := lpad((v_lo + floor(random() * (v_hi - v_lo + 1)))::int::text, 6, '0');
    exit when not exists (select 1 from public.profiles where mksm_no = v_candidate);
    if v_attempts > 50 then
      raise exception 'could not allocate a free MKSM number for role % after 50 attempts', p_role;
    end if;
  end loop;

  return v_candidate;
end;
$$;

-- --- provision public.profiles on auth user creation -----------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role user_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student');
  v_mksm text := nullif(new.raw_user_meta_data ->> 'mksm_no', '');
begin
  if v_mksm is null then
    v_mksm := public.allocate_mksm_no(v_role);
  end if;

  insert into public.profiles (
    id, role, mksm_no, first_name, last_name, full_name, email, phone,
    country, city, postal_address, pincode, date_of_birth, gender, status
  )
  values (
    new.id,
    v_role,
    v_mksm,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), ''),
    new.email,
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'postal_address',
    new.raw_user_meta_data ->> 'pincode',
    (new.raw_user_meta_data ->> 'date_of_birth')::date,
    (new.raw_user_meta_data ->> 'gender')::gender,
    'active'
  )
  on conflict (id) do nothing;

  if v_role = 'student' then
    insert into public.student_details (profile_id) values (new.id) on conflict do nothing;
  elsif v_role = 'teacher' then
    insert into public.teacher_details (profile_id) values (new.id) on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- --- homework late cutoff (PRD 8.7) ---------------------------------
create or replace function public.compute_homework_is_late(
  p_class_session_id uuid,
  p_submitted_at timestamptz,
  p_cutoff_days int
)
returns boolean
language plpgsql
stable
as $$
declare
  v_start timestamptz;
begin
  select scheduled_start into v_start from public.class_sessions where id = p_class_session_id;
  if v_start is null then
    return false;
  end if;
  -- Late when the submission lands within `cutoff_days` before the class.
  return p_submitted_at > (v_start - make_interval(days => p_cutoff_days));
end;
$$;
