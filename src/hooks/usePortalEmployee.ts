import { useAuth } from '@/contexts/AuthContext';

/**
 * Returns the current portal employee's employee_code (e.g. 'Emp001').
 * All portal components should use this instead of hardcoding.
 */
export const usePortalEmployee = () => {
  const { user } = useAuth();
  return user?.employeeId || '';
};
