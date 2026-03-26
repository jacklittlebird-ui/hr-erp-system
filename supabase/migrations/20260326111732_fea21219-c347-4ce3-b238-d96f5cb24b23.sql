-- Give HR full access to user_module_permissions
CREATE POLICY "hr_user_module_permissions"
ON public.user_module_permissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role))
WITH CHECK (has_role(auth.uid(), 'hr'::app_role));

-- Give HR full management of user_roles (create, update, delete)
CREATE POLICY "hr_manage_user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'hr'::app_role))
WITH CHECK (has_role(auth.uid(), 'hr'::app_role));