
-- ============================================
-- PHASE 1: Enums and Core Tables
-- ============================================

-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'station_manager', 'employee');

-- Employee status enum
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'suspended');

-- ============================================
-- Stations
-- ============================================
CREATE TABLE public.stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  timezone text NOT NULL DEFAULT 'Africa/Cairo',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Departments
-- ============================================
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles (mirrors auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- User Roles
-- ============================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  station_id uuid REFERENCES public.stations(id),
  employee_id uuid, -- FK added after employees table
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Security Definer Functions (no RLS recursion)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_station_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT station_id FROM public.user_roles
  WHERE user_id = _user_id AND role = 'station_manager'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employee_id FROM public.user_roles
  WHERE user_id = _user_id AND role = 'employee'
  LIMIT 1
$$;

-- ============================================
-- Employees
-- ============================================
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code text UNIQUE NOT NULL,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  station_id uuid REFERENCES public.stations(id),
  department_id uuid REFERENCES public.departments(id),
  job_title_ar text DEFAULT '',
  job_title_en text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  status public.employee_status NOT NULL DEFAULT 'active',
  hire_date date,
  birth_date date,
  birth_place text,
  gender text,
  religion text,
  nationality text,
  marital_status text,
  children_count integer DEFAULT 0,
  education_ar text,
  graduation_year text,
  national_id text,
  id_issue_date date,
  id_expiry_date date,
  issuing_authority text,
  address text,
  city text,
  governorate text,
  military_status text,
  job_level text,
  job_degree text,
  contract_type text,
  employment_status text DEFAULT 'active',
  resignation_date date,
  resignation_reason text,
  social_insurance_no text,
  social_insurance_start_date date,
  social_insurance_end_date date,
  health_insurance_card_no text,
  has_health_insurance boolean DEFAULT false,
  has_social_insurance boolean DEFAULT false,
  basic_salary numeric(12,2) DEFAULT 0,
  bank_name text,
  bank_account_number text,
  bank_id_number text,
  bank_account_type text,
  annual_leave_balance numeric(5,1) DEFAULT 21,
  sick_leave_balance numeric(5,1) DEFAULT 7,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Add FK from user_roles to employees
ALTER TABLE public.user_roles 
  ADD CONSTRAINT fk_user_roles_employee 
  FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- RLS Policies for Core Tables
-- ============================================

-- Stations: everyone authenticated can read
CREATE POLICY "Authenticated can read stations"
  ON public.stations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage stations"
  ON public.stations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Departments: everyone authenticated can read
CREATE POLICY "Authenticated can read departments"
  ON public.departments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins manage departments"
  ON public.departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles: users can read all, update own
CREATE POLICY "Users can read profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- User roles: admins manage, users read own
CREATE POLICY "Admins manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Employees: admin full, station_manager own station, employee self
CREATE POLICY "Admins manage employees"
  ON public.employees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Station managers read own station employees"
  ON public.employees FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'station_manager')
    AND station_id = public.get_user_station_id(auth.uid())
  );

CREATE POLICY "Employees read own record"
  ON public.employees FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'employee')
    AND id = public.get_user_employee_id(auth.uid())
  );
