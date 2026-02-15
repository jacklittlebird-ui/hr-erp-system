import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  station: string;
  amount: number;
  installments: number;
  monthlyPayment: number;
  paidInstallments: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  status: 'active' | 'completed' | 'pending';
  notes: string;
  calculationMethod: 'auto' | 'manual';
}

export interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  station: string;
  amount: number;
  requestDate: string;
  deductionMonth: string;
  status: 'pending' | 'approved' | 'rejected' | 'deducted';
  reason: string;
}

interface LoanDataContextType {
  loans: Loan[];
  advances: Advance[];
  setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
  setAdvances: React.Dispatch<React.SetStateAction<Advance[]>>;
  getEmployeeActiveLoans: (employeeId: string) => Loan[];
  getEmployeeMonthlyLoanPayment: (employeeId: string) => number;
  getEmployeeAdvanceForMonth: (employeeId: string, month: string) => number;
}

const LoanDataContext = createContext<LoanDataContextType | undefined>(undefined);

const initialLoans: Loan[] = [
  {
    id: 'LN001', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', station: 'capital',
    amount: 30000, installments: 12, monthlyPayment: 2500, paidInstallments: 2,
    paidAmount: 5000, remainingAmount: 25000, startDate: '2025-12', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN002', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', station: 'cairo',
    amount: 24000, installments: 12, monthlyPayment: 2000, paidInstallments: 2,
    paidAmount: 4000, remainingAmount: 20000, startDate: '2025-11', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
];

const initialAdvances: Advance[] = [
  { id: 'ADV001', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', station: 'capital', amount: 3000, requestDate: '2026-02-01', deductionMonth: '2026-03', status: 'approved', reason: 'مصاريف طارئة' },
  { id: 'ADV002', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', station: 'cairo', amount: 2000, requestDate: '2026-02-03', deductionMonth: '2026-02', status: 'approved', reason: 'احتياجات شخصية' },
];

export const LoanDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [advances, setAdvances] = useState<Advance[]>(initialAdvances);

  const getEmployeeActiveLoans = useCallback((employeeId: string) => {
    return loans.filter(l => l.employeeId === employeeId && l.status === 'active');
  }, [loans]);

  const getEmployeeMonthlyLoanPayment = useCallback((employeeId: string) => {
    return loans
      .filter(l => l.employeeId === employeeId && l.status === 'active')
      .reduce((sum, l) => sum + l.monthlyPayment, 0);
  }, [loans]);

  const getEmployeeAdvanceForMonth = useCallback((employeeId: string, month: string) => {
    return advances
      .filter(a => a.employeeId === employeeId && a.deductionMonth === month && a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
  }, [advances]);

  return (
    <LoanDataContext.Provider value={{ loans, advances, setLoans, setAdvances, getEmployeeActiveLoans, getEmployeeMonthlyLoanPayment, getEmployeeAdvanceForMonth }}>
      {children}
    </LoanDataContext.Provider>
  );
};

export const useLoanData = () => {
  const ctx = useContext(LoanDataContext);
  if (!ctx) throw new Error('useLoanData must be used within LoanDataProvider');
  return ctx;
};
