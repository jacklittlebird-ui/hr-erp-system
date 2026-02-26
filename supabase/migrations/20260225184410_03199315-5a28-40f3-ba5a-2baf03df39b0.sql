
-- Drop and recreate triggers to ensure they're properly attached
DROP TRIGGER IF EXISTS trg_calc_work_hours ON public.attendance_records;
DROP TRIGGER IF EXISTS trg_generate_installments ON public.loans;
DROP TRIGGER IF EXISTS trg_calc_payroll ON public.payroll_entries;
DROP TRIGGER IF EXISTS trg_auto_attendance_mission ON public.missions;
DROP TRIGGER IF EXISTS trg_calc_uniform_total ON public.uniforms;
DROP TRIGGER IF EXISTS trg_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER trg_calc_work_hours
  BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.calculate_work_hours();

CREATE TRIGGER trg_generate_installments
  AFTER INSERT ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.generate_loan_installments();

CREATE TRIGGER trg_calc_payroll
  BEFORE INSERT OR UPDATE ON public.payroll_entries
  FOR EACH ROW EXECUTE FUNCTION public.calculate_payroll_net();

CREATE TRIGGER trg_auto_attendance_mission
  AFTER UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.auto_attendance_on_mission();

CREATE TRIGGER trg_calc_uniform_total
  BEFORE INSERT OR UPDATE ON public.uniforms
  FOR EACH ROW EXECUTE FUNCTION public.calculate_uniform_total();

CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance_records (employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records (date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records (status);
CREATE INDEX IF NOT EXISTS idx_employees_station ON public.employees (station_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees (department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees (status);
CREATE INDEX IF NOT EXISTS idx_employees_code ON public.employees (employee_code);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON public.leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON public.leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_missions_employee ON public.missions (employee_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions (status);
CREATE INDEX IF NOT EXISTS idx_permissions_employee ON public.permission_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_employee ON public.overtime_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_month ON public.payroll_entries (employee_id, month, year);
CREATE INDEX IF NOT EXISTS idx_loans_employee ON public.loans (employee_id);
CREATE INDEX IF NOT EXISTS idx_installments_loan ON public.loan_installments (loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_employee ON public.loan_installments (employee_id);
CREATE INDEX IF NOT EXISTS idx_violations_employee ON public.violations (employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_station ON public.user_roles (station_id);
CREATE INDEX IF NOT EXISTS idx_training_employee ON public.training_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_uniforms_employee ON public.uniforms (employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_employee ON public.employee_documents (employee_id);
CREATE INDEX IF NOT EXISTS idx_bills_employee ON public.mobile_bills (employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_employee ON public.salary_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_perf_employee ON public.performance_reviews (employee_id);

-- Unique constraints for data integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON public.attendance_records (employee_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_unique ON public.salary_records (employee_id, year);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_unique ON public.payroll_entries (employee_id, month, year);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mobile_bill_unique ON public.mobile_bills (employee_id, deduction_month);
