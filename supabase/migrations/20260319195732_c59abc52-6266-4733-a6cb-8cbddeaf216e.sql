
-- Attendance Rules table
CREATE TABLE public.attendance_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text NOT NULL,
  description text DEFAULT '',
  description_ar text DEFAULT '',
  schedule_type text NOT NULL DEFAULT 'fixed',
  is_active boolean NOT NULL DEFAULT true,
  fixed_schedule jsonb,
  flexible_schedule jsonb,
  fully_flexible_schedule jsonb,
  shift_schedule jsonb,
  weekend_days jsonb DEFAULT '[5,6]'::jsonb,
  working_days_per_week integer DEFAULT 5,
  max_overtime_hours_daily numeric DEFAULT 4,
  max_overtime_hours_weekly numeric DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.attendance_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_attendance_rules" ON public.attendance_rules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_attendance_rules" ON public.attendance_rules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "read_attendance_rules" ON public.attendance_rules FOR SELECT TO authenticated
  USING (true);

-- Attendance Assignments table
CREATE TABLE public.attendance_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  rule_id uuid NOT NULL REFERENCES public.attendance_rules(id) ON DELETE CASCADE,
  station_id uuid REFERENCES public.stations(id),
  shift_id text,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, is_active) 
);

ALTER TABLE public.attendance_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_attendance_assignments" ON public.attendance_assignments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_attendance_assignments" ON public.attendance_assignments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "sm_attendance_assignments_select" ON public.attendance_assignments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'station_manager'::app_role) AND employee_id IN (
    SELECT id FROM employees WHERE station_id = get_user_station_id(auth.uid())
  ));

CREATE POLICY "am_attendance_assignments_select" ON public.attendance_assignments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'area_manager'::app_role) AND employee_id IN (
    SELECT id FROM employees WHERE station_id IN (SELECT get_area_manager_station_ids(auth.uid()))
  ));

CREATE POLICY "emp_attendance_assignments_select" ON public.attendance_assignments FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));
