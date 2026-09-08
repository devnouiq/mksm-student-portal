-- 0002_enums
-- Native Postgres enums for stable, code-controlled value sets. Admin-editable
-- lists (ragas, holidays, help content, whatsapp templates, audience groups)
-- are lookup TABLES instead — see 0012.
-- Rollback: DROP TYPE for each type below.

do $$
begin
  create type user_role as enum ('student', 'teacher', 'admin');
  create type profile_status as enum ('active', 'inactive', 'de_enrolled');
  create type gender as enum ('female', 'male', 'undisclosed');
  create type teacher_access_level as enum ('standard', 'senior', 'read_only');

  create type course_level as enum ('beginner', 'intermediate', 'advance');
  create type class_language as enum ('marathi', 'hindi', 'english');
  create type pitch_variant as enum ('c_sharp', 'g_sharp', 'b_sharp');
  create type day_of_week as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  create type batch_student_type as enum ('kids', 'youth', 'adults');
  create type batch_gender_mix as enum ('male', 'female', 'mix');
  create type batch_region as enum ('india', 'international');

  create type enrollment_status as enum ('active', 'completed', 'de_enrolled');
  create type class_session_status as enum ('scheduled', 'held', 'cancelled');
  create type attendance_mode as enum ('online', 'offline');
  create type attendance_source as enum ('system', 'teacher', 'admin');

  create type homework_status as enum ('homework_pending', 'submitted', 'review_pending', 'reviewed');

  create type material_kind as enum ('audio', 'video', 'pdf');
  create type material_owner_role as enum ('admin', 'teacher');
  create type material_share_target as enum ('teacher', 'batch', 'all');

  create type announcement_source as enum ('admin', 'mahesh_kale', 'community');
  create type announcement_audience as enum ('all', 'custom_group', 'batch', 'student', 'teachers');
  create type mk_media_kind as enum ('video', 'audio', 'text');

  create type subscription_provider as enum ('razorpay', 'paypal', 'one_time');
  create type subscription_status as enum ('active', 'cancelled', 'halted', 'suspended', 'one_time');

  create type sankalp_log_source as enum ('google_form', 'portal');
  create type sankalp_scope as enum ('school', 'teacher');

  create type holiday_kind as enum ('festival', 'national', 'break');
  create type dea_status as enum ('open', 'acknowledged', 'resolved');
  create type recording_request_status as enum ('requested', 'in_progress', 'fulfilled', 'declined');
  create type whatsapp_template_status as enum ('approved', 'pending', 'rejected');
  create type support_status as enum ('open', 'closed');
  create type notification_channel as enum ('whatsapp', 'email');
exception
  when duplicate_object then null;
end $$;
