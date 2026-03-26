-- Drop the old SELECT-only HR policy on user_roles (superseded by the new ALL policy)
DROP POLICY IF EXISTS "hr_read_user_roles" ON public.user_roles;