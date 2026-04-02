
-- Composite indexes for payroll_entries (most queried table)
CREATE INDEX IF NOT EXISTS idx_payroll_emp_period ON public.payroll_entries (employee_id, year DESC, month DESC);

-- Salary records index
CREATE INDEX IF NOT EXISTS idx_salary_records_emp_year ON public.salary_records (employee_id, year DESC);

-- Loan installments: queried by due_date + status for payroll hydration
CREATE INDEX IF NOT EXISTS idx_loan_installments_due_status ON public.loan_installments (due_date, status);
CREATE INDEX IF NOT EXISTS idx_loan_installments_loan ON public.loan_installments (loan_id, status, installment_number);

-- Loans: queried by status
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans (status);
CREATE INDEX IF NOT EXISTS idx_loans_emp ON public.loans (employee_id);

-- Leave requests: queried by status and employee
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp ON public.leave_requests (employee_id);

-- Attendance records: open checkout query
CREATE INDEX IF NOT EXISTS idx_attendance_emp_checkout ON public.attendance_records (employee_id, check_out) WHERE check_out IS NULL;

-- Mobile bills: queried by deduction_month for payroll hydration
CREATE INDEX IF NOT EXISTS idx_mobile_bills_month ON public.mobile_bills (deduction_month);

-- Advances: queried by deduction_month + status for payroll hydration
CREATE INDEX IF NOT EXISTS idx_advances_month_status ON public.advances (deduction_month, status);

-- Training records
CREATE INDEX IF NOT EXISTS idx_training_records_emp ON public.training_records (employee_id);

-- Performance reviews
CREATE INDEX IF NOT EXISTS idx_perf_reviews_year ON public.performance_reviews (year);
