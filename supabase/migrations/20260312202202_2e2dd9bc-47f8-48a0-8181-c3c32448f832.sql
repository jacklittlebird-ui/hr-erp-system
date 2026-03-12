
CREATE TABLE public.uniform_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uniform_id uuid NOT NULL REFERENCES public.uniforms(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (uniform_id, employee_id)
);

ALTER TABLE public.uniform_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_uniform_ack" ON public.uniform_acknowledgments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "hr_uniform_ack" ON public.uniform_acknowledgments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'hr'::app_role))
  WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

CREATE POLICY "emp_uniform_ack_select" ON public.uniform_acknowledgments
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "emp_uniform_ack_insert" ON public.uniform_acknowledgments
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'employee'::app_role) AND employee_id = get_user_employee_id(auth.uid()));
