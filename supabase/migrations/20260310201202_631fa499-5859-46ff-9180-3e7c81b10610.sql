
CREATE TABLE public.eid_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  bonus_number integer NOT NULL CHECK (bonus_number BETWEEN 1 AND 4),
  year text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  job_level text,
  employee_name text,
  employee_code text,
  station_name text,
  department_name text,
  job_title text,
  hire_date date,
  bank_account_number text,
  bank_id_number text,
  bank_name text,
  bank_account_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, bonus_number, year)
);

ALTER TABLE public.eid_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_eid_bonuses" ON public.eid_bonuses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_eid_bonuses" ON public.eid_bonuses FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "emp_eid_bonuses" ON public.eid_bonuses FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));
