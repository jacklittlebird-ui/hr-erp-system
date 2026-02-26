
-- =====================================================
-- PRODUCTION-READY TRIGGERS, INDEXES & CONSTRAINTS
-- =====================================================

-- 1. ATTACH ALL TRIGGERS (idempotent - drop if exists first)

DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_calc_work_hours ON public.attendance_records;
CREATE TRIGGER trg_calc_work_hours
  BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.calculate_work_hours();

DROP TRIGGER IF EXISTS trg_generate_installments ON public.loans;
CREATE TRIGGER trg_generate_installments
  AFTER INSERT ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.generate_loan_installments();

DROP TRIGGER IF EXISTS trg_calc_payroll ON public.payroll_entries;
CREATE TRIGGER trg_calc_payroll
  BEFORE INSERT OR UPDATE ON public.payroll_entries
  FOR EACH ROW EXECUTE FUNCTION public.calculate_payroll_net();

DROP TRIGGER IF EXISTS trg_auto_attendance_mission ON public.missions;
CREATE TRIGGER trg_auto_attendance_mission
  AFTER INSERT OR UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.auto_attendance_on_mission();

DROP TRIGGER IF EXISTS trg_calc_uniform_total ON public.uniforms;
CREATE TRIGGER trg_calc_uniform_total
  BEFORE INSERT OR UPDATE ON public.uniforms
  FOR EACH ROW EXECUTE FUNCTION public.calculate_uniform_total();

-- 2. UNIQUE CONSTRAINTS (idempotent)

DO $$ BEGIN
  ALTER TABLE public.attendance_records ADD CONSTRAINT uq_attendance_emp_date UNIQUE (employee_id, date);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.payroll_entries ADD CONSTRAINT uq_payroll_emp_month_year UNIQUE (employee_id, month, year);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.salary_records ADD CONSTRAINT uq_salary_emp_year UNIQUE (employee_id, year);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.mobile_bills ADD CONSTRAINT uq_mobile_bill_emp_month UNIQUE (employee_id, deduction_month);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.employees ADD CONSTRAINT uq_employee_code UNIQUE (employee_code);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.stations ADD CONSTRAINT uq_station_code UNIQUE (code);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. PERFORMANCE INDEXES

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records (date);
CREATE INDEX IF NOT EXISTS idx_attendance_emp ON public.attendance_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON public.leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON public.leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month_year ON public.payroll_entries (year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_emp ON public.payroll_entries (employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_emp ON public.loans (employee_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans (status);
CREATE INDEX IF NOT EXISTS idx_installments_loan ON public.loan_installments (loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_due ON public.loan_installments (due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.loan_installments (status);
CREATE INDEX IF NOT EXISTS idx_missions_emp ON public.missions (employee_id);
CREATE INDEX IF NOT EXISTS idx_missions_date ON public.missions (date);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions (status);
CREATE INDEX IF NOT EXISTS idx_violations_emp ON public.violations (employee_id);
CREATE INDEX IF NOT EXISTS idx_violations_date ON public.violations (date);
CREATE INDEX IF NOT EXISTS idx_perf_emp ON public.performance_reviews (employee_id);
CREATE INDEX IF NOT EXISTS idx_perf_year_quarter ON public.performance_reviews (year, quarter);
CREATE INDEX IF NOT EXISTS idx_training_emp ON public.training_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_training_course ON public.training_records (course_id);
CREATE INDEX IF NOT EXISTS idx_overtime_emp ON public.overtime_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_permissions_emp ON public.permission_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_advances_emp ON public.advances (employee_id);
CREATE INDEX IF NOT EXISTS idx_mobile_bills_emp ON public.mobile_bills (employee_id);
CREATE INDEX IF NOT EXISTS idx_mobile_bills_month ON public.mobile_bills (deduction_month);
CREATE INDEX IF NOT EXISTS idx_notifs_user ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifs_emp ON public.notifications (employee_id);
CREATE INDEX IF NOT EXISTS idx_notifs_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_emp_station ON public.employees (station_id);
CREATE INDEX IF NOT EXISTS idx_emp_dept ON public.employees (department_id);
CREATE INDEX IF NOT EXISTS idx_emp_status ON public.employees (status);
CREATE INDEX IF NOT EXISTS idx_emp_user ON public.employees (user_id);
CREATE INDEX IF NOT EXISTS idx_uniforms_emp ON public.uniforms (employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_assigned ON public.assets (assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets (status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_station ON public.user_roles (station_id);
