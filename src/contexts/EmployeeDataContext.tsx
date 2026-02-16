import React, { createContext, useContext, useCallback } from 'react';
import { Employee } from '@/types/employee';
import { mockEmployees as initialEmployees } from '@/data/mockEmployees';
import { usePersistedState } from '@/hooks/usePersistedState';

interface EmployeeDataContextType {
  employees: Employee[];
  getEmployee: (id: string) => Employee | undefined;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addEmployee: (employee: Employee) => void;
}

const EmployeeDataContext = createContext<EmployeeDataContextType | undefined>(undefined);

export const EmployeeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = usePersistedState<Employee[]>('hr_employees', initialEmployees);

  const getEmployee = useCallback((id: string) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  const getEmployeeById = useCallback((employeeId: string) => {
    return employees.find(e => e.employeeId === employeeId);
  }, [employees]);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  }, []);

  return (
    <EmployeeDataContext.Provider value={{ employees, getEmployee, getEmployeeById, updateEmployee, addEmployee }}>
      {children}
    </EmployeeDataContext.Provider>
  );
};

export const useEmployeeData = () => {
  const ctx = useContext(EmployeeDataContext);
  if (!ctx) throw new Error('useEmployeeData must be used within EmployeeDataProvider');
  return ctx;
};
