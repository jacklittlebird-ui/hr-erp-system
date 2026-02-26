
-- Remove duplicate triggers (keep only the trg_ prefixed ones)
DROP TRIGGER IF EXISTS trg_calculate_work_hours ON public.attendance_records;
DROP TRIGGER IF EXISTS set_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS trg_mission_attendance ON public.missions;
DROP TRIGGER IF EXISTS trg_calculate_payroll ON public.payroll_entries;
DROP TRIGGER IF EXISTS trg_uniform_total ON public.uniforms;
