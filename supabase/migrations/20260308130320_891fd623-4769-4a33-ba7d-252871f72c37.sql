
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self" ON public.profiles;

-- Recreate as PERMISSIVE (default) so they are ORed
CREATE POLICY "profiles_select_self"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_admin_read"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
