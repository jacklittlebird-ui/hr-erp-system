
-- Add syllabus fields to training_courses
ALTER TABLE public.training_courses
  ADD COLUMN IF NOT EXISTS provider text DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_code text DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_duration text DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_objective text DEFAULT '',
  ADD COLUMN IF NOT EXISTS course_administration text DEFAULT '',
  ADD COLUMN IF NOT EXISTS exercises text DEFAULT '',
  ADD COLUMN IF NOT EXISTS basic_topics text DEFAULT '',
  ADD COLUMN IF NOT EXISTS intermediate_topics text DEFAULT '',
  ADD COLUMN IF NOT EXISTS advanced_topics text DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_material text DEFAULT '',
  ADD COLUMN IF NOT EXISTS examination text DEFAULT '',
  ADD COLUMN IF NOT EXISTS edited_by text DEFAULT '';

-- Create planned_courses table for Training Plan
CREATE TABLE IF NOT EXISTS public.planned_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.training_courses(id) ON DELETE SET NULL,
  course_code text NOT NULL DEFAULT '',
  course_name text NOT NULL DEFAULT '',
  provider text DEFAULT '',
  planned_date date,
  duration text DEFAULT '',
  participants integer DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  trainer text DEFAULT '',
  location text DEFAULT '',
  cost numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.planned_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_planned_courses" ON public.planned_courses FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "read_planned_courses" ON public.planned_courses FOR SELECT USING (true);

-- Create planned_course_assignments for employee assignments
CREATE TABLE IF NOT EXISTS public.planned_course_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planned_course_id uuid NOT NULL REFERENCES public.planned_courses(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  actual_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(planned_course_id, employee_id)
);

ALTER TABLE public.planned_course_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_assignments" ON public.planned_course_assignments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "read_assignments" ON public.planned_course_assignments FOR SELECT USING (true);

-- Create training_debts table
CREATE TABLE IF NOT EXISTS public.training_debts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  actual_date date NOT NULL,
  expiry_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.training_debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_debts" ON public.training_debts FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "emp_debts" ON public.training_debts FOR SELECT USING (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));
