import React, { createContext, useContext, useState, useCallback } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { mockEmployees } from '@/data/mockEmployees';

export type UserRole = 'admin' | 'employee' | 'station_manager';

export interface AuthUser {
  id: string;
  name: string;
  nameAr: string;
  email?: string;
  employeeId?: string;
  role: UserRole;
  station?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: { type: UserRole; identifier: string; password: string }) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

// Default credentials for demo
const defaultAdminCredentials = [
  { email: 'admin@hr.com', password: 'admin123', name: 'System Admin', nameAr: 'مدير النظام', id: 'admin-1' },
];

const defaultStationManagers = [
  { email: 'cairo@hr.com', password: 'manager123', name: 'Cairo Station Manager', nameAr: 'مدير محطة القاهرة', id: 'sm-1', station: 'cairo' },
  { email: 'alex@hr.com', password: 'manager123', name: 'Alexandria Station Manager', nameAr: 'مدير محطة الإسكندرية', id: 'sm-2', station: 'alex' },
  { email: 'luxor@hr.com', password: 'manager123', name: 'Luxor Station Manager', nameAr: 'مدير محطة الأقصر', id: 'sm-3', station: 'luxor' },
  { email: 'sharm@hr.com', password: 'manager123', name: 'Sharm Station Manager', nameAr: 'مدير محطة شرم الشيخ', id: 'sm-4', station: 'sharm' },
  { email: 'hurghada@hr.com', password: 'manager123', name: 'Hurghada Station Manager', nameAr: 'مدير محطة الغردقة', id: 'sm-5', station: 'hurghada' },
  { email: 'aswan@hr.com', password: 'manager123', name: 'Aswan Station Manager', nameAr: 'مدير محطة أسوان', id: 'sm-6', station: 'aswan' },
];

// Default employee password
const DEFAULT_EMPLOYEE_PASSWORD = '123456';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = usePersistedState<AuthUser | null>('hr_auth_user', null);

  const login = useCallback(({ type, identifier, password }: { type: UserRole; identifier: string; password: string }) => {
    if (type === 'admin') {
      const admin = defaultAdminCredentials.find(a => a.email === identifier && a.password === password);
      if (admin) {
        setUser({ id: admin.id, name: admin.name, nameAr: admin.nameAr, email: admin.email, role: 'admin' });
        return { success: true };
      }
      return { success: false, error: 'invalid_credentials' };
    }

    if (type === 'employee') {
      // Check employee ID from localStorage first, fallback to mockEmployees
      let employees: any[] = mockEmployees;
      const stored = localStorage.getItem('hr_employees');
      if (stored) {
        try { employees = JSON.parse(stored); } catch {}
      }
      const emp = employees.find((e: any) => e.employeeId === identifier);
      if (emp && password === DEFAULT_EMPLOYEE_PASSWORD) {
        setUser({ id: emp.id, name: emp.nameEn, nameAr: emp.nameAr, employeeId: emp.employeeId, role: 'employee' });
        return { success: true };
      }
      return { success: false, error: 'invalid_credentials' };
    }

    if (type === 'station_manager') {
      const manager = defaultStationManagers.find(m => m.email === identifier && m.password === password);
      if (manager) {
        setUser({ id: manager.id, name: manager.name, nameAr: manager.nameAr, email: manager.email, role: 'station_manager', station: manager.station });
        return { success: true };
      }
      return { success: false, error: 'invalid_credentials' };
    }

    return { success: false, error: 'invalid_type' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
