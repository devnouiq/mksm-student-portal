-- seed.sql — demo data mirroring frontend/src/data/mock/*.
-- PRECONDITION: `scripts/seed.ts` has already created the Supabase Auth users
-- (and therefore public.profiles rows) for these MKSM numbers:
--   900001 admin  · 500112 teacher (Guru Deshpande) · 520044 teacher (Anjali Rao)
--   100428 Melody · 100511 Rohan · 100522 Sneha · 100604 Arjun · 100612 Kavya · 100538 Vivek
-- Safe to re-run: every statement is ON CONFLICT-guarded on a natural key.

begin;

-- --- profile detail backfill ---------------------------------------------
update profiles set first_name='Melody', last_name='Kulkarni', country='India',
  phone='+91 98200 11223' where mksm_no='100428';
update profiles set first_name='Guru', last_name='Deshpande', country='India' where mksm_no='500112';
update profiles set first_name='Anjali', last_name='Rao', country='India' where mksm_no='520044';
update profiles set first_name='Admin', last_name='Office' where mksm_no='900001';
update profiles set first_name='Rohan', last_name='Shinde', country='India', phone='+91 99870 55221' where mksm_no='100511';
update profiles set first_name='Sneha', last_name='Joshi', country='India', phone='+91 90040 88112' where mksm_no='100522';
update profiles set first_name='Arjun', last_name='Menon', country='USA', phone='+1 (415) 555-0142' where mksm_no='100604';
update profiles set first_name='Kavya', last_name='Iyer', country='UK', phone='+44 7700 900123' where mksm_no='100612';
update profiles set first_name='Vivek', last_name='Rao', country='India', phone='+91 90210 44556', date_of_birth='2009-05-01' where mksm_no='100538';

insert into student_details (profile_id, years_experience)
select id, 3 from profiles where role='student'
on conflict (profile_id) do nothing;
insert into teacher_details (profile_id, access_level)
select id, 'standard' from profiles where role='teacher'
on conflict (profile_id) do nothing;

-- --- courses ------------------------------------------------------------
insert into courses (slug, name, description, level, language, price_label, is_catalog_visible) values
  ('hindustani-classical-vocal','Hindustani Classical Vocal','Foundations through intermediate raga work.','intermediate','marathi','Enrolled',true),
  ('light-music-bhajan','Light Music & Bhajan','Melodic Marathi/Hindi light-classical repertoire and expression.','beginner','hindi','₹1,800 / month',true),
  ('harmonium-foundations','Harmonium Foundations','Sur, alankars and basic accompaniment.','beginner','hindi','₹1,500 / month',true),
  ('tabla-rhythm-foundations','Tabla — Rhythm Foundations','Theka, kaida and basic compositions in Teentaal and Dadra.','beginner','hindi','₹1,500 / month',true),
  ('sugam-sangeet-marathi-bhavgeet','Sugam Sangeet — Marathi Bhavgeet','Melodic Marathi light-classical repertoire and expression.','intermediate','marathi','₹1,800 / month',true),
  ('advanced-khayal-gayaki','Advanced Khayal Gayaki','Vistaar, bol-taan and layakari for advanced vocalists.','advance','hindi','₹2,400 / month',true)
on conflict (slug) do nothing;

-- --- batches ----------------------------------------------------------
insert into batches (name, course_id, teacher_id, day_of_week, start_time, pitch, level, language, student_type, gender_mix, region, zoom_link, is_ongoing)
select v.name, c.id, t.id, v.day::day_of_week, v.start_time::time, v.pitch::pitch_variant,
       v.level::course_level, v.language::class_language, v.student_type::batch_student_type,
       'mix'::batch_gender_mix, v.region::batch_region, v.zoom_link, v.is_ongoing
from (values
  ('Dhun Batch','hindustani-classical-vocal','500112','mon','18:00','c_sharp','intermediate','marathi','adults','india','https://zoom.us/j/000-dhun-batch',true),
  ('Swatva Batch','light-music-bhajan','520044','thu','19:30','g_sharp','beginner','hindi','adults','india','https://zoom.us/j/000-swatva-batch',false),
  ('Surel Batch','harmonium-foundations','520044','sat','10:00','b_sharp','beginner','hindi','youth','india','https://zoom.us/j/000-surel-batch',false),
  ('Taan Batch','advanced-khayal-gayaki','500112','wed','20:00','g_sharp','advance','english','adults','international','https://zoom.us/j/000-taan-batch',false)
) as v(name, course_slug, teacher_mksm, day, start_time, pitch, level, language, student_type, region, zoom_link, is_ongoing)
join courses c on c.slug = v.course_slug
join profiles t on t.mksm_no = v.teacher_mksm
on conflict (name) do nothing;

-- --- enrollments (progress values from the fixtures) ----------------
insert into enrollments (student_id, batch_id, status, progress)
select s.id, b.id, 'active', v.progress
from (values
  ('100428','Dhun Batch',0.62),
  ('100428','Swatva Batch',0.34),
  ('100428','Surel Batch',0.12),
  ('100511','Dhun Batch',0.55),
  ('100522','Swatva Batch',0.40),
  ('100604','Taan Batch',0.71),
  ('100612','Surel Batch',0.20),
  ('100538','Surel Batch',0.30)
) as v(student_mksm, batch_name, progress)
join profiles s on s.mksm_no = v.student_mksm
join batches b on b.name = v.batch_name
on conflict (student_id, batch_id) do nothing;

-- --- class sessions: one per batch each of the last 14 / next 14 days on the batch weekday
insert into class_sessions (batch_id, scheduled_date, scheduled_start, status)
select b.id, d::date,
       (d::date + coalesce(b.start_time, time '18:00')) at time zone b.timezone,
       (case when d::date < current_date then 'held' else 'scheduled' end)::class_session_status
from batches b
cross join generate_series(current_date - 21, current_date + 14, interval '1 day') as g(d)
where extract(isodow from d) = (array_position(array['mon','tue','wed','thu','fri','sat','sun'], b.day_of_week::text))
on conflict (batch_id, scheduled_date) do nothing;

-- --- attendance for held Dhun sessions ------------------------------
insert into attendance_records (class_session_id, student_id, present, mode, source)
select cs.id, e.student_id, true, 'online', 'system'
from class_sessions cs
join batches b on b.id = cs.batch_id and b.name = 'Dhun Batch'
join enrollments e on e.batch_id = b.id
where cs.status = 'held'
on conflict (class_session_id, student_id) do nothing;

-- --- homework submissions ----------------------------------------
insert into homework_submissions (student_id, batch_id, class_session_id, title, description, status, is_late, submitted_at)
select s.id, b.id, cs.id, v.title, v.descr, v.status::homework_status, v.is_late,
       cs.scheduled_start - interval '2 days'
from (values
  ('100511','Dhun Batch','Raag Yaman — aaroh/avaroh','Three cycles at slow tempo.','review_pending',false),
  ('100522','Swatva Batch','Bhajan — first antara','First antara with harmonium.','submitted',true),
  ('100538','Surel Batch','Alankar set 4','All six alankars in B#.','reviewed',false)
) as v(student_mksm, batch_name, title, descr, status, is_late)
join profiles s on s.mksm_no = v.student_mksm
join batches b on b.name = v.batch_name
join lateral (
  select id, scheduled_start from class_sessions c
  where c.batch_id = b.id and c.scheduled_date >= current_date order by c.scheduled_date limit 1
) cs on true
on conflict (student_id, class_session_id) do nothing;

insert into homework_feedback (submission_id, teacher_id, feedback_text)
select h.id, b.teacher_id,
  'Good sur on the aaroh. Watch the komal ni on the way down — steady the breath before it.'
from homework_submissions h
join batches b on b.id = h.batch_id
where h.status = 'reviewed'
on conflict (submission_id) do nothing;

-- --- practice materials (admin master library + one teacher upload) --
insert into practice_materials (title, kind, pitch, owner_role, owner_profile_id, notes, meta)
select v.title, v.kind::material_kind, v.pitch::pitch_variant, 'admin', a.id, v.notes, v.meta
from (values
  ('Alankar pack — C# / G# / B#','audio','c_sharp','Standard alankar reference for all beginner batches.','12 tracks'),
  ('Raag Yaman — masterclass','video',null,'Full masterclass recording.','42:10'),
  ('Swar & taal theory handbook','pdf',null,'Foundational theory shared with all teachers.','2.4 MB')
) as v(title, kind, pitch, notes, meta)
join profiles a on a.mksm_no = '900001'
on conflict do nothing;

insert into practice_materials (title, kind, pitch, owner_role, owner_profile_id, notes, meta)
select 'Yaman — my reference recording','audio'::material_kind,'c_sharp'::pitch_variant,'teacher'::material_owner_role, t.id,'Sing along after the second cycle.','5:48'
from profiles t where t.mksm_no = '500112'
on conflict do nothing;

-- share the admin library to everyone
insert into practice_material_shares (material_id, target, shared_by_profile_id)
select m.id, 'all', a.id
from practice_materials m
join profiles a on a.mksm_no = '900001'
where m.owner_role = 'admin'
on conflict do nothing;

-- teacher shares own upload to Dhun Batch
insert into practice_material_shares (material_id, target, target_batch_id, shared_by_profile_id)
select m.id, 'batch', b.id, t.id
from practice_materials m
join profiles t on t.id = m.owner_profile_id and t.mksm_no = '500112'
join batches b on b.name = 'Dhun Batch'
where m.owner_role = 'teacher'
on conflict do nothing;

-- --- announcements ----------------------------------------------
insert into announcements (title, body, source, author_id, is_important, audience, published_at)
select v.title, v.body, v.source::announcement_source, a.id, v.important, 'all', now() - v.age
from (values
  ('Guru Purnima special session','A special masterclass is scheduled this Sunday. Details in Class Schedule.','admin',true, interval '1 day'),
  ('New practice material added','Fresh alankar audio (C#, G#, B#) is now available under Practice Material.','community',false, interval '3 days'),
  ('Holiday notice','The school will be closed on 15 August for Independence Day.','admin',true, interval '6 days'),
  ('Diwali break schedule published','Classes pause **8-12 Nov**. Shared with _all students and teachers_.','admin',false, interval '2 days')
) as v(title, body, source, important, age)
join profiles a on a.mksm_no = '900001'
on conflict do nothing;

insert into announcements (title, body, source, author_id, audience, media_kind, media_url, published_at)
select 'A note on riyaz before the festival season',
  'Keep your morning alankars steady this month — consistency over intensity.',
  'mahesh_kale', a.id, 'all', 'video', 'https://www.youtube.com/embed/OMUeE5F_jSs', now() - interval '2 days'
from profiles a where a.mksm_no = '900001'
on conflict do nothing;

-- --- sankalp logs + targets -----------------------------------
insert into sankalp_logs (student_id, mksm_no, minutes, logged_for_date, submitted_at, source)
select s.id, s.mksm_no, g.mins, current_date - g.d, now() - (g.d || ' days')::interval, 'portal'
from profiles s
cross join (values (60,1),(45,3),(90,5),(75,8),(60,12)) as g(mins, d)
where s.role = 'student'
on conflict do nothing;

insert into sankalp_targets (scope, period, target_hours) values ('school','all-time',50000)
on conflict do nothing;
insert into sankalp_targets (scope, scope_teacher_id, period, target_hours)
select 'teacher', t.id, 'all-time', 6000 from profiles t where t.role = 'teacher'
on conflict do nothing;

-- --- subscriptions (read-only mirror) + payments -------------
insert into subscriptions (student_id, provider, external_subscription_id, status, active_cycle, paid_cycle, start_date, next_due_date, synced_at)
select s.id, v.provider::subscription_provider, v.ext_id, v.status::subscription_status,
       v.active_cycle, v.paid_cycle, current_date - v.start_off, v.next_due, now()
from (values
  ('100428','razorpay','sub_MZ8x21Kd','active',8,8,240,(current_date + 12)),
  ('100511','razorpay','sub_MZ7p04La','halted',5,4,150,(current_date - 3)),
  ('100604','paypal','I-8HG7KD02LP','active',11,11,330,(current_date + 20)),
  ('100612','paypal','I-9KL2MN71QR','suspended',3,3,95,null),
  ('100538','one_time','otp_44219','one_time',1,1,40,null)
) as v(student_mksm, provider, ext_id, status, active_cycle, paid_cycle, start_off, next_due)
join profiles s on s.mksm_no = v.student_mksm
on conflict (provider, external_subscription_id) do nothing;

insert into subscription_payments (subscription_id, external_payment_id, amount_minor, currency, paid_at)
select sub.id, sub.external_subscription_id || '-p' || g.n, 150000, 'INR', now() - (g.n || ' months')::interval
from subscriptions sub
cross join generate_series(1, 3) as g(n)
on conflict (external_payment_id) do nothing;

-- --- ragas / holidays / help / whatsapp / audience groups ----
insert into ragas (name, sort_order) values
  ('Yaman',1),('Bhairav',2),('Bhupali',3),('Todi',4),('Malkauns',5),('Desh',6),('Kafi',7),('Bageshri',8)
on conflict (name) do nothing;

insert into holidays (holiday_date, name, kind) values
  ('2026-01-26','Republic Day','national'),
  ('2026-03-04','Holi','festival'),
  ('2026-08-15','Independence Day','national'),
  ('2026-08-26','Ganesh Chaturthi','festival'),
  ('2026-10-02','Gandhi Jayanti','national'),
  ('2026-10-20','Dussehra','festival'),
  ('2026-11-08','Diwali','festival'),
  ('2026-12-25','Winter Break begins','break')
on conflict (holiday_date, name) do nothing;

insert into help_tutorials (title, description, duration_label, sort_order) values
  ('Getting started with the MKSM portal','A quick tour of your dashboard, courses and Sankalp.','4:20',1),
  ('How to submit homework','Pick a class date, add a recording and submit before the cutoff.','3:05',2),
  ('Requesting a class recording','Raise a recording request from My Courses.','2:15',3),
  ('Understanding your subscription','Reading your subscription status and renewing on time.','3:40',4)
on conflict do nothing;

insert into help_faqs (question, answer, sort_order) values
  ('How are my Sankalp hours counted?','Sankalp hours are self-reported and keyed to your 6-digit MKSM number. They roll up into the school-wide pledge shown on your Overview.',1),
  ('What happens if I submit homework late?','Late submissions are still accepted — they are simply tagged "Late Submission" for your teacher.',2),
  ('How do I join my online class?','On a class day, use "Join Now" on My Courses. It opens Zoom and marks your attendance as Present (Online).',3),
  ('How do I change my payment method?','Open Payment & Fees and choose "Change payment method". Subscription status is read-only in the portal.',4)
on conflict do nothing;

insert into whatsapp_templates (name, description, status, trigger_event) values
  ('Welcome / onboarding','Sent when a new student is added.','approved','student_created'),
  ('Class reminder','Sent before each scheduled class.','approved','class_reminder'),
  ('Fee / renewal reminder','Sent when a subscription is due.','pending','subscription_due'),
  ('Homework feedback ready','Sent when a teacher shares feedback.','pending','feedback_ready')
on conflict (name) do nothing;

insert into announcement_audience_groups (label) values
  ('All Beginner Students'),('All Intermediate Students'),('All Advanced Students'),
  ('All Kids Students'),('All Adult Students'),('All International Kids'),('All India Kids'),
  ('All International Adults'),('All India Adults'),('All Teachers')
on conflict (label) do nothing;

insert into integration_settings (key, value) values
  ('whatsapp_connection', '{"status":"awaiting_verification","provider":null,"businessAccountId":null}'::jsonb),
  ('voices_of_mksm', '{"youtubeUrl":"https://www.youtube.com/embed/OMUeE5F_jSs","title":"Voices of MKSM — Monthly Showcase","month":"August 2026"}'::jsonb)
on conflict (key) do nothing;

-- --- DEA alerts + one recording request ----------------------
insert into de_enrollment_alerts (code, sequence, student_id, batch_id, teacher_id, status, created_by)
select v.code, v.seq, s.id, b.id, b.teacher_id, 'open', a.id
from (values ('DEA-3',3,'100511','Dhun Batch'), ('DEA-1',1,'100612','Surel Batch')) as v(code, seq, student_mksm, batch_name)
join profiles s on s.mksm_no = v.student_mksm
join batches b on b.name = v.batch_name
join profiles a on a.mksm_no = '900001'
on conflict do nothing;

insert into recording_requests (student_id, enrollment_id, status, note)
select e.student_id, e.id, 'requested', 'Missed the Swatva class — please share the recording.'
from enrollments e
join profiles s on s.id = e.student_id and s.mksm_no = '100428'
join batches b on b.id = e.batch_id and b.name = 'Swatva Batch'
on conflict do nothing;

-- --- class logs ---------------------------------------------
insert into class_logs (batch_id, class_date, teacher_id, raga_id, what_covered, comments)
select b.id, current_date - v.days_ago, b.teacher_id, r.id, v.covered, v.comments
from (values
  ('Dhun Batch',1,'Yaman','Vistaar in mandra and madhya saptak.','Strong batch, moving to bandish next week.'),
  ('Swatva Batch',2,'Bhupali','Sargam geet and simple bandish.',null),
  ('Surel Batch',3,'Bhairav','Aaroh/avaroh with harmonium.','Two students need extra alankar practice.')
) as v(batch_name, days_ago, raga, covered, comments)
join batches b on b.name = v.batch_name
join ragas r on r.name = v.raga
on conflict (batch_id, class_date) do nothing;

commit;
