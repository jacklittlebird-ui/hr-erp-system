
CREATE TABLE public.leave_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year integer NOT NULL,
  annual_total numeric NOT NULL DEFAULT 21,
  annual_used numeric NOT NULL DEFAULT 0,
  sick_total numeric NOT NULL DEFAULT 15,
  sick_used numeric NOT NULL DEFAULT 0,
  casual_total numeric NOT NULL DEFAULT 7,
  casual_used numeric NOT NULL DEFAULT 0,
  permissions_total numeric NOT NULL DEFAULT 24,
  permissions_used numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_leave_balances" ON public.leave_balances FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "emp_leave_balances" ON public.leave_balances FOR SELECT
  USING (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));
