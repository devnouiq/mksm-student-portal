-- 0017_views
-- Read models that back the frontend's *View / *Overview shapes. Kept as plain
-- (non-materialized) views so they are always fresh; the underlying columns are
-- indexed. Business rules mirror frontend/src/domain/*.
-- Rollback: drop view for each below.

-- Per-enrollment course card data. `display_progress` mirrors
-- frontend/src/domain/course.ts (an ongoing batch always shows 100%).
create or replace view v_enrollment_progress as
select
  e.id                as enrollment_id,
  e.student_id,
  e.batch_id,
  b.course_id,
  c.name              as course_name,
  b.name              as batch_name,
  tp.full_name        as teacher_name,
  e.progress          as raw_progress,
  case when b.is_ongoing then 1.0 else e.progress end as display_progress,
  b.is_ongoing        as ongoing,
  b.day_of_week,
  b.start_time,
  b.timezone,
  b.pitch,
  b.level,
  b.zoom_link,
  (
    select min(cs.scheduled_start)
    from class_sessions cs
    where cs.batch_id = b.id and cs.scheduled_start >= now() and cs.status <> 'cancelled'
  ) as next_class_at,
  exists (
    select 1 from class_sessions cs
    where cs.batch_id = b.id
      and cs.scheduled_date = (now() at time zone b.timezone)::date
      and cs.status <> 'cancelled'
  ) as is_class_day,
  coalesce((
    select avg(case when ar.present then 1.0 else 0.0 end)
    from attendance_records ar
    join class_sessions cs on cs.id = ar.class_session_id
    where cs.batch_id = b.id and ar.student_id = e.student_id
  ), 0)::numeric(4,3) as attendance_pct
from enrollments e
join batches b on b.id = e.batch_id
join courses c on c.id = b.course_id
left join profiles tp on tp.id = b.teacher_id
where e.status <> 'de_enrolled';

-- Active Students directory aggregates (classes in last 30 / 90 days, last attended).
create or replace view v_student_attendance_stats as
select
  p.id as student_id,
  count(*) filter (where ar.present and cs.scheduled_date >= current_date - 30) as classes_30d,
  count(*) filter (where ar.present and cs.scheduled_date >= current_date - 90) as classes_90d,
  max(cs.scheduled_date) filter (where ar.present) as last_attended
from profiles p
left join attendance_records ar on ar.student_id = p.id
left join class_sessions cs on cs.id = ar.class_session_id
where p.role = 'student'
group by p.id;

-- Sankalp per-student totals (all-time) + last submission.
create or replace view v_sankalp_student_totals as
select
  l.student_id,
  l.mksm_no,
  p.full_name as student_name,
  (
    select b.name from enrollments e join batches b on b.id = e.batch_id
    where e.student_id = l.student_id and e.status = 'active'
    order by e.enrolled_at desc limit 1
  ) as batch_name,
  round(sum(l.hours), 2) as cumulative_hours,
  count(*) as submission_count,
  max(l.submitted_at) as last_submitted_at,
  (array_agg(l.minutes order by l.submitted_at desc))[1] as last_submitted_mins,
  max(l.logged_for_date) as last_submitted_date
from sankalp_logs l
join profiles p on p.id = l.student_id
group by l.student_id, l.mksm_no, p.full_name;

-- Sankalp per-batch totals.
create or replace view v_sankalp_batch_totals as
select
  b.id as batch_id,
  b.name as batch_name,
  count(distinct e.student_id) as student_count,
  round(coalesce(sum(l.hours), 0), 2) as cumulative_hours,
  round(coalesce(sum(l.hours), 0) / nullif(count(distinct e.student_id), 0), 2) as avg_hours_per_student
from batches b
left join enrollments e on e.batch_id = b.id and e.status = 'active'
left join sankalp_logs l on l.student_id = e.student_id
group by b.id, b.name;

-- Subscription payment counts (this calendar year, trailing 3 months).
create or replace view v_subscription_payment_counts as
select
  s.id as subscription_id,
  count(pmt.*) filter (where pmt.paid_at >= date_trunc('year', now())) as payments_this_year,
  count(pmt.*) filter (where pmt.paid_at >= now() - interval '3 months') as payments_last_3_months
from subscriptions s
left join subscription_payments pmt on pmt.subscription_id = s.id
group by s.id;

-- Teacher homework queue stats (per teacher, across their batches).
create or replace view v_teacher_homework_stats as
select
  b.teacher_id,
  count(*) filter (where h.status = 'submitted') as submitted,
  count(*) filter (where h.status = 'reviewed') as reviewed,
  count(*) filter (where h.status = 'review_pending') as review_pending,
  count(*) filter (where h.status = 'homework_pending') as homework_pending
from homework_submissions h
join batches b on b.id = h.batch_id
group by b.teacher_id;

-- Previous-day class sessions that were held but have no class log (PRD 8.12).
create or replace view v_pending_class_logs as
select
  cs.id as class_session_id,
  cs.batch_id,
  b.name as batch_name,
  b.teacher_id,
  cs.scheduled_date as class_date
from class_sessions cs
join batches b on b.id = cs.batch_id
where cs.status in ('held', 'scheduled')
  and cs.scheduled_date < current_date
  and cs.scheduled_date >= current_date - 7
  and not exists (
    select 1 from class_logs cl where cl.batch_id = cs.batch_id and cl.class_date = cs.scheduled_date
  );
