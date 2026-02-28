import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns the current portal employee's UUID (from user_roles.employee_id).
 * All portal components should use this instead of hardcoding.
 */
export const usePortalEmployee = () => {
  const { user } = useAuth();
  return user?.employeeUuid || '';
};
