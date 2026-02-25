
-- ============================================
-- RLS Policies for ALL Module Tables
-- Pattern: Admin full, Station Manager station-scoped, Employee self-only
-- ============================================

-- Helper: check if employee belongs to user's station
-- Used in policies for employee-linked tables

-- ATTENDANCE_RECORDS
CREATE POLICY "admin_attendance" ON public.attendance_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sm_attendance_select" ON public.attendance_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())));
CREATE POLICY "sm_attendance_insert" ON public.attendance_records FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())));
CREATE POLICY "emp_attendance" ON public.attendance_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- SALARY_RECORDS
CREATE POLICY "admin_salary" ON public.salary_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_salary" ON public.salary_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- PAYROLL_ENTRIES
CREATE POLICY "admin_payroll" ON public.payroll_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_payroll" ON public.payroll_entries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- LOANS
CREATE POLICY "admin_loans" ON public.loans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_loans" ON public.loans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- LOAN_INSTALLMENTS
CREATE POLICY "admin_installments" ON public.loan_installments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_installments" ON public.loan_installments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- ADVANCES
CREATE POLICY "admin_advances" ON public.advances FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_advances" ON public.advances FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- PERFORMANCE_REVIEWS
CREATE POLICY "admin_perf" ON public.performance_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sm_perf_all" ON public.performance_reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())));
CREATE POLICY "emp_perf" ON public.performance_reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- TRAINING_COURSES (read by all authenticated)
CREATE POLICY "read_courses" ON public.training_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_courses" ON public.training_courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TRAINING_RECORDS
CREATE POLICY "admin_training" ON public.training_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_training" ON public.training_records FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- MISSIONS
CREATE POLICY "admin_missions" ON public.missions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_missions_select" ON public.missions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));
CREATE POLICY "emp_missions_insert" ON public.missions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- VIOLATIONS
CREATE POLICY "admin_violations" ON public.violations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sm_violations_all" ON public.violations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(), 'station_manager') AND employee_id IN (SELECT id FROM public.employees WHERE station_id = public.get_user_station_id(auth.uid())));
CREATE POLICY "emp_violations" ON public.violations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- MOBILE_BILLS
CREATE POLICY "admin_bills" ON public.mobile_bills FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- LEAVE_REQUESTS
CREATE POLICY "admin_leaves" ON public.leave_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_leaves_select" ON public.leave_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));
CREATE POLICY "emp_leaves_insert" ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- PERMISSION_REQUESTS
CREATE POLICY "admin_permissions" ON public.permission_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_permissions_select" ON public.permission_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));
CREATE POLICY "emp_permissions_insert" ON public.permission_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- OVERTIME_REQUESTS
CREATE POLICY "admin_overtime" ON public.overtime_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_overtime_select" ON public.overtime_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));
CREATE POLICY "emp_overtime_insert" ON public.overtime_requests FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- UNIFORMS
CREATE POLICY "admin_uniforms" ON public.uniforms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_uniforms" ON public.uniforms FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- EMPLOYEE_DOCUMENTS
CREATE POLICY "admin_docs" ON public.employee_documents FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "emp_docs" ON public.employee_documents FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'employee') AND employee_id = public.get_user_employee_id(auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "admin_notifs" ON public.notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_own_notifs" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "user_update_notifs" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ASSETS
CREATE POLICY "admin_assets" ON public.assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "read_assets" ON public.assets FOR SELECT TO authenticated USING (true);
