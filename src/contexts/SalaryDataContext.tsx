import React, { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

export interface SalaryRecord {
  year: string;
  employeeId: string;
  stationLocation: string;
  basicSalary: number;
  transportAllowance: number;
  incentives: number;
  livingAllowance: number;
  stationAllowance: number;
  mobileAllowance: number;
  employeeInsurance: number;
  employerSocialInsurance: number;
  healthInsurance: number;
  incomeTax: number;
}

/** Gross = basic + transport + incentives + station + mobile (livingAllowance excluded - entered monthly) */
export const calcGross = (r: Omit<SalaryRecord, 'year' | 'employeeId' | 'stationLocation'>) =>
  r.basicSalary + r.transportAllowance + r.incentives + r.stationAllowance + r.mobileAllowance;

/** Gross including living allowance (for display in salary record) */
export const calcFullGross = (r: Omit<SalaryRecord, 'year' | 'employeeId' | 'stationLocation'>) =>
  r.basicSalary + r.transportAllowance + r.incentives + r.livingAllowance + r.stationAllowance + r.mobileAllowance;

export const calcNet = (r: Omit<SalaryRecord, 'year' | 'employeeId' | 'stationLocation'>) =>
  calcFullGross(r) - r.employeeInsurance;

interface SalaryDataContextType {
  salaryRecords: SalaryRecord[];
  getSalaryRecord: (employeeId: string, year: string) => SalaryRecord | undefined;
  getLatestSalaryRecord: (employeeId: string) => SalaryRecord | undefined;
  saveSalaryRecord: (record: SalaryRecord) => void;
  deleteSalaryRecord: (employeeId: string, year: string) => void;
}

const SalaryDataContext = createContext<SalaryDataContextType | undefined>(undefined);

const initialSalaryRecords: SalaryRecord[] = [
  {
    year: '2026', employeeId: 'Emp001', stationLocation: 'capital',
    basicSalary: 8500, transportAllowance: 500, incentives: 1000, livingAllowance: 800, stationAllowance: 600, mobileAllowance: 400,
    employeeInsurance: 950, employerSocialInsurance: 1200, healthInsurance: 300, incomeTax: 500,
  },
  {
    year: '2026', employeeId: 'Emp002', stationLocation: 'cairo',
    basicSalary: 7200, transportAllowance: 400, incentives: 800, livingAllowance: 600, stationAllowance: 500, mobileAllowance: 300,
    employeeInsurance: 800, employerSocialInsurance: 1000, healthInsurance: 250, incomeTax: 400,
  },
  {
    year: '2026', employeeId: 'Emp003', stationLocation: 'cairo',
    basicSalary: 9000, transportAllowance: 600, incentives: 1200, livingAllowance: 900, stationAllowance: 700, mobileAllowance: 500,
    employeeInsurance: 1100, employerSocialInsurance: 1400, healthInsurance: 350, incomeTax: 600,
  },
  {
    year: '2026', employeeId: 'Emp004', stationLocation: 'alex',
    basicSalary: 6800, transportAllowance: 350, incentives: 700, livingAllowance: 500, stationAllowance: 400, mobileAllowance: 250,
    employeeInsurance: 750, employerSocialInsurance: 900, healthInsurance: 200, incomeTax: 350,
  },
];

export const SalaryDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salaryRecords, setSalaryRecords] = usePersistedState<SalaryRecord[]>('hr_salary_records', initialSalaryRecords);

  const getSalaryRecord = useCallback((employeeId: string, year: string) => {
    return salaryRecords.find(r => r.employeeId === employeeId && r.year === year);
  }, [salaryRecords]);

  const getLatestSalaryRecord = useCallback((employeeId: string) => {
    const records = salaryRecords.filter(r => r.employeeId === employeeId).sort((a, b) => b.year.localeCompare(a.year));
    return records[0];
  }, [salaryRecords]);

  const saveSalaryRecord = useCallback((record: SalaryRecord) => {
    setSalaryRecords(prev => {
      const idx = prev.findIndex(r => r.employeeId === record.employeeId && r.year === record.year);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [...prev, record];
    });
  }, []);

  const deleteSalaryRecord = useCallback((employeeId: string, year: string) => {
    setSalaryRecords(prev => prev.filter(r => !(r.employeeId === employeeId && r.year === year)));
  }, []);

  return (
    <SalaryDataContext.Provider value={{ salaryRecords, getSalaryRecord, getLatestSalaryRecord, saveSalaryRecord, deleteSalaryRecord }}>
      {children}
    </SalaryDataContext.Provider>
  );
};

export const useSalaryData = () => {
  const ctx = useContext(SalaryDataContext);
  if (!ctx) throw new Error('useSalaryData must be used within SalaryDataProvider');
  return ctx;
};
