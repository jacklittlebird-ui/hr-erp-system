CREATE POLICY "emp_attendance_insert"
ON public.attendance_records
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'employee'::app_role)
  AND employee_id = get_user_employee_id(auth.uid())
);

CREATE POLICY "emp_attendance_update"
ON public.attendance_records
FOR UPDATE
USING (
  has_role(auth.uid(), 'employee'::app_role)
  AND employee_id = get_user_employee_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'employee'::app_role)
  AND employee_id = get_user_employee_id(auth.uid())
);