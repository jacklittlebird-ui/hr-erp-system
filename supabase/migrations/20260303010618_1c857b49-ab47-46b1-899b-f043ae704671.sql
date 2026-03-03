
-- Create a restricted view for station managers with only operational columns
-- Excludes: national_id, bank details, salary, insurance numbers, addresses, etc.
CREATE OR REPLACE VIEW public.employee_limited_view AS
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

-- Grant access to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.employee_limited_view TO authenticated;
