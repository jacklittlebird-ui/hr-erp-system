
-- ============================================
-- PHASE 2: Module Tables
-- ============================================

-- Attendance Records
CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in timestamptz,
  check_out timestamptz,
  work_hours numeric(5,2) DEFAULT 0,
  work_minutes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'present',
  is_late boolean DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Salary Records
CREATE TABLE public.salary_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year text NOT NULL,
  basic_salary numeric(12,2) DEFAULT 0,
  transport_allowance numeric(12,2) DEFAULT 0,
  incentives numeric(12,2) DEFAULT 0,
  living_allowance numeric(12,2) DEFAULT 0,
  station_allowance numeric(12,2) DEFAULT 0,
  mobile_allowance numeric(12,2) DEFAULT 0,
  employee_insurance numeric(12,2) DEFAULT 0,
  employer_social_insurance numeric(12,2) DEFAULT 0,
  health_insurance numeric(12,2) DEFAULT 0,
  income_tax numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;

-- Payroll Entries
CREATE TABLE public.payroll_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month text NOT NULL,
  year text NOT NULL,
  basic_salary numeric(12,2) DEFAULT 0,
  transport_allowance numeric(12,2) DEFAULT 0,
  incentives numeric(12,2) DEFAULT 0,
  station_allowance numeric(12,2) DEFAULT 0,
  mobile_allowance numeric(12,2) DEFAULT 0,
  living_allowance numeric(12,2) DEFAULT 0,
  overtime_pay numeric(12,2) DEFAULT 0,
  bonus_type text DEFAULT 'amount',
  bonus_value numeric(12,2) DEFAULT 0,
  bonus_amount numeric(12,2) DEFAULT 0,
  gross numeric(12,2) DEFAULT 0,
  employee_insurance numeric(12,2) DEFAULT 0,
  loan_payment numeric(12,2) DEFAULT 0,
  advance_amount numeric(12,2) DEFAULT 0,
  mobile_bill numeric(12,2) DEFAULT 0,
  leave_days numeric(5,1) DEFAULT 0,
  leave_deduction numeric(12,2) DEFAULT 0,
  penalty_type text DEFAULT 'amount',
  penalty_value numeric(12,2) DEFAULT 0,
  penalty_amount numeric(12,2) DEFAULT 0,
  total_deductions numeric(12,2) DEFAULT 0,
  net_salary numeric(12,2) DEFAULT 0,
  employer_social_insurance numeric(12,2) DEFAULT 0,
  health_insurance numeric(12,2) DEFAULT 0,
  income_tax numeric(12,2) DEFAULT 0,
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, month, year)
);
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;

-- Loans
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  monthly_installment numeric(12,2) DEFAULT 0,
  installments_count integer NOT NULL DEFAULT 1,
  paid_count integer DEFAULT 0,
  remaining numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  reason text,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Loan Installments
CREATE TABLE public.loan_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;

-- Advances
CREATE TABLE public.advances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  deduction_month text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

-- Performance Reviews
CREATE TABLE public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  quarter text NOT NULL,
  year text NOT NULL,
  score numeric(4,1) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  criteria jsonb DEFAULT '[]'::jsonb,
  strengths text,
  improvements text,
  goals text,
  manager_comments text,
  review_date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- Training Courses
CREATE TABLE public.training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description text,
  duration_hours integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Training Records
CREATE TABLE public.training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.training_courses(id),
  status text NOT NULL DEFAULT 'enrolled',
  start_date date,
  end_date date,
  score numeric(4,1),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;

-- Missions
CREATE TABLE public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  mission_type text NOT NULL DEFAULT 'full_day',
  destination text,
  reason text,
  date date NOT NULL,
  check_in time,
  check_out time,
  hours numeric(4,1) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Violations
CREATE TABLE public.violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  type text NOT NULL,
  description text,
  penalty text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Mobile Bills
CREATE TABLE public.mobile_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  deduction_month text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(employee_id, deduction_month)
);
ALTER TABLE public.mobile_bills ENABLE ROW LEVEL SECURITY;

-- Leave Requests
CREATE TABLE public.leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer NOT NULL DEFAULT 1,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Permission Requests
CREATE TABLE public.permission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  permission_type text NOT NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  hours numeric(4,1) DEFAULT 0,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Overtime Requests
CREATE TABLE public.overtime_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours numeric(4,1) NOT NULL DEFAULT 0,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;

-- Uniforms
CREATE TABLE public.uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type_ar text NOT NULL,
  type_en text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) DEFAULT 0,
  total_price numeric(12,2) DEFAULT 0,
  delivery_date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.uniforms ENABLE ROW LEVEL SECURITY;

-- Employee Documents
CREATE TABLE public.employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  file_url text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  desc_ar text,
  desc_en text,
  type text NOT NULL DEFAULT 'info',
  module text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Assets
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  purchase_price numeric(12,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  condition text DEFAULT 'good',
  location text,
  assigned_to uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
