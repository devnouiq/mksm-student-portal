-- 0016_rls_policies
-- Enable + FORCE row-level security on every public table. Policies are written
-- for the `authenticated` role (a signed-in Supabase user). `service_role`
-- (used by the backend server) has BYPASSRLS, so the server enforces RBAC in
-- its service layer and RLS is defence-in-depth for any direct client access.
-- Rollback: `alter table ... disable row level security` + drop policies.

-- Convenience: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_profile_role() = 'admin', false);
$$;

-- Does the current user teach this batch?
create or replace function public.teaches_batch(p_batch_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.batches b where b.id = p_batch_id and b.teacher_id = auth.uid());
$$;

-- Is the current user enrolled in this batch?
create or replace function public.enrolled_in_batch(p_batch_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments e
    where e.batch_id = p_batch_id and e.student_id = auth.uid() and e.status <> 'de_enrolled'
  );
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','student_details','teacher_details','courses','batches','enrollments',
    'class_sessions','attendance_records','homework_submissions','homework_attachments',
    'homework_feedback','practice_materials','practice_material_shares','announcements',
    'announcement_audience_groups','announcement_reads','sankalp_logs','sankalp_targets',
    'subscriptions','subscription_payments','ragas','holidays','help_tutorials','help_faqs',
    'whatsapp_templates','integration_settings','class_logs','de_enrollment_alerts',
    'recording_requests','file_objects','support_requests','audit_log','notification_log'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;

-- --- profiles ---------------------------------------------------------
create policy profiles_self_select on profiles for select to authenticated
  using (id = auth.uid() or public.is_admin()
         or exists (
           select 1 from enrollments e
           join batches b on b.id = e.batch_id
           where e.student_id = profiles.id and b.teacher_id = auth.uid()
         ));
create policy profiles_self_update on profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_admin_insert on profiles for insert to authenticated
  with check (public.is_admin());

-- --- student_details / teacher_details ------------------------------
create policy student_details_rw on student_details for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy teacher_details_rw on teacher_details for all to authenticated
  using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

-- --- reference data: readable by all authenticated, writable by admin -
do $$
declare t text;
begin
  foreach t in array array['courses','ragas','holidays','help_tutorials','help_faqs',
                           'whatsapp_templates','announcement_audience_groups']
  loop
    execute format('create policy %1$s_read on public.%1$s for select to authenticated using (true);', t);
    execute format('create policy %1$s_admin_write on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- --- batches --------------------------------------------------------
create policy batches_read on batches for select to authenticated
  using (true);
create policy batches_admin_write on batches for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- enrollments --------------------------------------------------
create policy enrollments_read on enrollments for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.teaches_batch(batch_id));
create policy enrollments_admin_write on enrollments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- class_sessions --------------------------------------------
create policy class_sessions_read on class_sessions for select to authenticated
  using (public.is_admin() or public.teaches_batch(batch_id) or public.enrolled_in_batch(batch_id));
create policy class_sessions_staff_write on class_sessions for all to authenticated
  using (public.is_admin() or public.teaches_batch(batch_id))
  with check (public.is_admin() or public.teaches_batch(batch_id));

-- --- attendance_records --------------------------------------
create policy attendance_read on attendance_records for select to authenticated
  using (student_id = auth.uid() or public.is_admin()
         or exists (select 1 from class_sessions cs where cs.id = class_session_id and public.teaches_batch(cs.batch_id)));
create policy attendance_staff_write on attendance_records for all to authenticated
  using (public.is_admin()
         or exists (select 1 from class_sessions cs where cs.id = class_session_id and public.teaches_batch(cs.batch_id)))
  with check (public.is_admin()
         or exists (select 1 from class_sessions cs where cs.id = class_session_id and public.teaches_batch(cs.batch_id)));

-- --- homework -----------------------------------------------
create policy homework_read on homework_submissions for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.teaches_batch(batch_id));
create policy homework_student_insert on homework_submissions for insert to authenticated
  with check (student_id = auth.uid() and public.enrolled_in_batch(batch_id));
create policy homework_staff_update on homework_submissions for update to authenticated
  using (public.is_admin() or public.teaches_batch(batch_id))
  with check (public.is_admin() or public.teaches_batch(batch_id));

create policy homework_attachments_read on homework_attachments for select to authenticated
  using (exists (select 1 from homework_submissions h where h.id = submission_id
                 and (h.student_id = auth.uid() or public.is_admin() or public.teaches_batch(h.batch_id))));
create policy homework_attachments_student_insert on homework_attachments for insert to authenticated
  with check (exists (select 1 from homework_submissions h where h.id = submission_id and h.student_id = auth.uid()));

create policy homework_feedback_read on homework_feedback for select to authenticated
  using (exists (select 1 from homework_submissions h where h.id = submission_id
                 and (h.student_id = auth.uid() or public.is_admin() or public.teaches_batch(h.batch_id))));
create policy homework_feedback_teacher_write on homework_feedback for all to authenticated
  using (public.is_admin() or exists (select 1 from homework_submissions h where h.id = submission_id and public.teaches_batch(h.batch_id)))
  with check (public.is_admin() or exists (select 1 from homework_submissions h where h.id = submission_id and public.teaches_batch(h.batch_id)));

-- --- practice materials ------------------------------------
create policy practice_materials_read on practice_materials for select to authenticated
  using (
    public.is_admin()
    or owner_profile_id = auth.uid()
    or exists (
      select 1 from practice_material_shares s
      where s.material_id = practice_materials.id
        and (
          s.target = 'all'
          or (s.target = 'teacher' and s.target_teacher_id = auth.uid())
          or (s.target = 'batch' and (public.teaches_batch(s.target_batch_id) or public.enrolled_in_batch(s.target_batch_id)))
        )
    )
  );
create policy practice_materials_owner_write on practice_materials for all to authenticated
  using (public.is_admin() or owner_profile_id = auth.uid())
  with check (public.is_admin() or (owner_profile_id = auth.uid() and owner_role = 'teacher'));

create policy practice_shares_read on practice_material_shares for select to authenticated
  using (
    public.is_admin()
    or shared_by_profile_id = auth.uid()
    or (target = 'teacher' and target_teacher_id = auth.uid())
    or (target = 'batch' and (public.teaches_batch(target_batch_id) or public.enrolled_in_batch(target_batch_id)))
    or target = 'all'
  );
create policy practice_shares_write on practice_material_shares for all to authenticated
  using (
    public.is_admin()
    or (shared_by_profile_id = auth.uid()
        and (target <> 'batch' or public.teaches_batch(target_batch_id)))
  )
  with check (
    public.is_admin()
    or (shared_by_profile_id = auth.uid()
        and (target <> 'batch' or public.teaches_batch(target_batch_id)))
  );

-- --- announcements ---------------------------------------
create policy announcements_read on announcements for select to authenticated
  using (
    deleted_at is null and (
      public.is_admin()
      or author_id = auth.uid()
      or audience = 'all'
      or (audience = 'teachers' and public.current_profile_role() = 'teacher')
      or (audience = 'student' and audience_student_id = auth.uid())
      or (audience = 'batch' and (public.teaches_batch(audience_batch_id) or public.enrolled_in_batch(audience_batch_id)))
      or audience = 'custom_group'
    )
  );
create policy announcements_admin_write on announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy announcement_reads_self on announcement_reads for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- --- sankalp --------------------------------------------
create policy sankalp_logs_read on sankalp_logs for select to authenticated
  using (
    student_id = auth.uid() or public.is_admin()
    or exists (select 1 from enrollments e where e.student_id = sankalp_logs.student_id and public.teaches_batch(e.batch_id))
  );
create policy sankalp_logs_student_insert on sankalp_logs for insert to authenticated
  with check (student_id = auth.uid());
create policy sankalp_logs_admin_write on sankalp_logs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy sankalp_targets_read on sankalp_targets for select to authenticated using (true);
create policy sankalp_targets_admin_write on sankalp_targets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- subscriptions (read-only to clients) --------------
create policy subscriptions_read on subscriptions for select to authenticated
  using (student_id = auth.uid() or public.is_admin());
create policy subscription_payments_read on subscription_payments for select to authenticated
  using (exists (select 1 from subscriptions s where s.id = subscription_id and (s.student_id = auth.uid() or public.is_admin())));
-- No client insert/update/delete: only service_role writes (sync endpoint).

-- --- integration_settings ------------------------------
create policy integration_settings_read on integration_settings for select to authenticated using (true);
create policy integration_settings_admin_write on integration_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- class_logs ---------------------------------------
create policy class_logs_read on class_logs for select to authenticated
  using (public.is_admin() or teacher_id = auth.uid() or public.teaches_batch(batch_id));
create policy class_logs_teacher_insert on class_logs for insert to authenticated
  with check (teacher_id = auth.uid() and public.teaches_batch(batch_id));
create policy class_logs_update on class_logs for update to authenticated
  using (public.is_admin() or teacher_id = auth.uid())
  with check (public.is_admin() or teacher_id = auth.uid());

-- --- DEA alerts --------------------------------------
create policy dea_read on de_enrollment_alerts for select to authenticated
  using (public.is_admin() or teacher_id = auth.uid());
create policy dea_admin_write on de_enrollment_alerts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy dea_teacher_update on de_enrollment_alerts for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- --- recording requests -----------------------------
create policy recording_read on recording_requests for select to authenticated
  using (student_id = auth.uid() or public.is_admin()
         or exists (select 1 from enrollments e where e.id = enrollment_id and public.teaches_batch(e.batch_id)));
create policy recording_student_insert on recording_requests for insert to authenticated
  with check (student_id = auth.uid());
create policy recording_staff_update on recording_requests for update to authenticated
  using (public.is_admin() or exists (select 1 from enrollments e where e.id = enrollment_id and public.teaches_batch(e.batch_id)))
  with check (public.is_admin() or exists (select 1 from enrollments e where e.id = enrollment_id and public.teaches_batch(e.batch_id)));

-- --- file_objects -----------------------------------
create policy file_objects_read on file_objects for select to authenticated
  using (uploaded_by_profile_id = auth.uid() or public.is_admin());
create policy file_objects_insert on file_objects for insert to authenticated
  with check (uploaded_by_profile_id = auth.uid());

-- --- support requests -------------------------------
create policy support_self on support_requests for select to authenticated
  using (requester_id = auth.uid() or public.is_admin());
create policy support_insert on support_requests for insert to authenticated
  with check (requester_id = auth.uid());
create policy support_admin_update on support_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- audit_log / notification_log: no client access -------
-- (RLS enabled with zero policies => authenticated sees nothing; service_role bypasses.)
