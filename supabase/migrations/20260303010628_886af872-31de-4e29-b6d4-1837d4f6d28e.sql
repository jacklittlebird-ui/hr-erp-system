
-- Fix: Make the view use SECURITY INVOKER (the default, but explicit is better)
-- This ensures RLS on the employees table still applies to queries through this view
DROP VIEW IF EXISTS public.employee_limited_view;

CREATE VIEW public.employee_limited_view
WITH (security_invoker = true)
AS
SELECT
  id,
  employee_code,
  name_ar,
  name_en,
  first_name,
  father_name,
  family_name,
  station_id,
  department_id,
  dept_code,
  job_title_ar,
  job_title_en,
  job_level,
  job_degree,
  phone,
  email,
  gender,
  status,
  hire_date,
  contract_type,
  employment_status,
  resigned,
  resignation_date,
  avatar,
  user_id,
  created_at,
  updated_at
FROM public.employees;

GRANT SELECT ON public.employee_limited_view TO authenticated;
