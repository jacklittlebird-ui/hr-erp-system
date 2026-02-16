import React, { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

export interface ProcessedPayroll {
  employeeId: string;
  employeeName: string;
  employeeNameEn: string;
  department: string;
  stationLocation: string;
  month: string;
  year: string;
  // Earnings from salary record
  basicSalary: number;
  transportAllowance: number;
  incentives: number;
  stationAllowance: number;
  mobileAllowance: number;
  // Monthly manual entries
  livingAllowance: number;
  overtimePay: number;
  // Bonus
  bonusType: 'amount' | 'percentage';
  bonusValue: number;
  bonusAmount: number;
  // Gross
  gross: number;
  // Deductions
  employeeInsurance: number;
  loanPayment: number;
  advanceAmount: number;
  mobileBill: number;
  leaveDays: number;
  leaveDeduction: number;
  penaltyType: 'amount' | 'days' | 'percentage';
  penaltyValue: number;
  penaltyAmount: number;
  totalDeductions: number;
  // Net
  netSalary: number;
  // Employer contributions
  employerSocialInsurance: number;
  healthInsurance: number;
  incomeTax: number;
  // Meta
  processedAt: string;
}

interface PayrollDataContextType {
  payrollEntries: ProcessedPayroll[];
  savePayrollEntry: (entry: ProcessedPayroll) => void;
  savePayrollEntries: (entries: ProcessedPayroll[]) => void;
  getPayrollEntry: (employeeId: string, month: string, year: string) => ProcessedPayroll | undefined;
  getMonthlyPayroll: (month: string, year: string) => ProcessedPayroll[];
  getEmployeePayroll: (employeeId: string) => ProcessedPayroll[];
}

const PayrollDataContext = createContext<PayrollDataContextType | undefined>(undefined);

// Pre-populated with some data
const initialPayroll: ProcessedPayroll[] = [
  {
    employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', employeeNameEn: 'Galal AbdelRazek AbdelHaliem',
    department: 'الإدارة', stationLocation: 'capital', month: '01', year: '2026',
    basicSalary: 8500, transportAllowance: 500, incentives: 1000, stationAllowance: 600, mobileAllowance: 400,
    livingAllowance: 800, overtimePay: 0,
    bonusType: 'amount', bonusValue: 500, bonusAmount: 500,
    gross: 11800, employeeInsurance: 950, loanPayment: 2500, advanceAmount: 0, mobileBill: 350,
    leaveDays: 0, leaveDeduction: 0, penaltyType: 'amount', penaltyValue: 0, penaltyAmount: 0,
    totalDeductions: 3800, netSalary: 8500,
    employerSocialInsurance: 1200, healthInsurance: 300, incomeTax: 500,
    processedAt: '2026-01-28',
  },
  {
    employeeId: 'Emp002', employeeName: 'أحمد محمد علي', employeeNameEn: 'Ahmed Mohamed Ali',
    department: 'تقنية المعلومات', stationLocation: 'cairo', month: '01', year: '2026',
    basicSalary: 7200, transportAllowance: 400, incentives: 800, stationAllowance: 500, mobileAllowance: 300,
    livingAllowance: 600, overtimePay: 200,
    bonusType: 'amount', bonusValue: 0, bonusAmount: 0,
    gross: 10000, employeeInsurance: 800, loanPayment: 2000, advanceAmount: 0, mobileBill: 280,
    leaveDays: 2, leaveDeduction: 667, penaltyType: 'amount', penaltyValue: 0, penaltyAmount: 0,
    totalDeductions: 3747, netSalary: 6253,
    employerSocialInsurance: 1000, healthInsurance: 250, incomeTax: 400,
    processedAt: '2026-01-28',
  },
];

export const PayrollDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payrollEntries, setPayrollEntries] = usePersistedState<ProcessedPayroll[]>('hr_payroll', initialPayroll);

  const savePayrollEntry = useCallback((entry: ProcessedPayroll) => {
    setPayrollEntries(prev => {
      const idx = prev.findIndex(e => e.employeeId === entry.employeeId && e.month === entry.month && e.year === entry.year);
      if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
  }, []);

  const savePayrollEntries = useCallback((entries: ProcessedPayroll[]) => {
    setPayrollEntries(prev => {
      const updated = [...prev];
      entries.forEach(entry => {
        const idx = updated.findIndex(e => e.employeeId === entry.employeeId && e.month === entry.month && e.year === entry.year);
        if (idx >= 0) updated[idx] = entry;
        else updated.push(entry);
      });
      return updated;
    });
  }, []);

  const getPayrollEntry = useCallback((employeeId: string, month: string, year: string) => {
    return payrollEntries.find(e => e.employeeId === employeeId && e.month === month && e.year === year);
  }, [payrollEntries]);

  const getMonthlyPayroll = useCallback((month: string, year: string) => {
    return payrollEntries.filter(e => e.month === month && e.year === year);
  }, [payrollEntries]);

  const getEmployeePayroll = useCallback((employeeId: string) => {
    return payrollEntries.filter(e => e.employeeId === employeeId).sort((a, b) => `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`));
  }, [payrollEntries]);

  return (
    <PayrollDataContext.Provider value={{ payrollEntries, savePayrollEntry, savePayrollEntries, getPayrollEntry, getMonthlyPayroll, getEmployeePayroll }}>
      {children}
    </PayrollDataContext.Provider>
  );
};

export const usePayrollData = () => {
  const ctx = useContext(PayrollDataContext);
  if (!ctx) throw new Error('usePayrollData must be used within PayrollDataProvider');
  return ctx;
};
