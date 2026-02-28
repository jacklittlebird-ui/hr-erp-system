
-- Permission profiles (named templates for module access)
CREATE TABLE public.permission_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  description_ar text,
  description_en text,
  modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.permission_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_permission_profiles" ON public.permission_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "read_permission_profiles" ON public.permission_profiles
  FOR SELECT USING (true);

-- User module permissions (links user to a profile or custom modules)
CREATE TABLE public.user_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.permission_profiles(id) ON DELETE SET NULL,
  custom_modules jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_user_module_permissions" ON public.user_module_permissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "user_own_permissions" ON public.user_module_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Insert default permission profiles
INSERT INTO public.permission_profiles (name_ar, name_en, description_ar, description_en, modules, is_system) VALUES
(
  'مدير النظام',
  'System Admin',
  'صلاحيات كاملة على جميع أقسام النظام',
  'Full access to all system modules',
  '["dashboard","employee-portal","employees","departments","attendance","leaves","salaries","salary-reports","loans","recruitment","performance","assets","uniforms","documents","reports","training","users","settings"]'::jsonb,
  true
),
(
  'الموارد البشرية',
  'HR Manager',
  'إدارة شؤون الموظفين والحضور والإجازات',
  'Manage employees, attendance, and leaves',
  '["dashboard","employees","departments","attendance","leaves","salaries","salary-reports","loans","performance","uniforms","documents","reports","training"]'::jsonb,
  false
),
(
  'مدير محطة',
  'Station Manager',
  'إدارة موظفي المحطة والحضور',
  'Manage station employees and attendance',
  '["dashboard","employees","attendance","leaves","reports"]'::jsonb,
  false
),
(
  'موظف',
  'Employee',
  'عرض البيانات الشخصية فقط',
  'View personal data only',
  '["dashboard","employee-portal"]'::jsonb,
  false
);
