import React, { createContext, useContext, useState, useCallback } from 'react';

// ===== LEAVES =====
export interface LeaveBalance {
  typeAr: string;
  typeEn: string;
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: string;
  typeAr: string;
  typeEn: string;
  from: string;
  to: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
}

// ===== LOANS =====
export interface Loan {
  id: number;
  employeeId: string;
  typeAr: string;
  typeEn: string;
  amount: number;
  paid: number;
  remaining: number;
  installment: number;
  status: 'active' | 'paid';
}

// ===== EVALUATIONS =====
export interface Evaluation {
  id: number;
  employeeId: string;
  period: string;
  score: number;
  maxScore: number;
  reviewerAr: string;
  reviewerEn: string;
  status: 'completed' | 'pending';
  notesAr: string;
  notesEn: string;
}

// ===== TRAINING =====
export interface TrainingCourse {
  id: number;
  employeeId: string;
  nameAr: string;
  nameEn: string;
  progress: number;
  status: 'in-progress' | 'completed' | 'planned';
  startDate: string;
  endDate: string;
}

// ===== MISSIONS =====
export interface Mission {
  id: number;
  employeeId: string;
  destAr: string;
  destEn: string;
  from: string;
  to: string;
  purposeAr: string;
  purposeEn: string;
  status: 'approved' | 'pending' | 'rejected';
}

// ===== VIOLATIONS =====
export interface Violation {
  id: number;
  employeeId: string;
  date: string;
  typeAr: string;
  typeEn: string;
  penaltyAr: string;
  penaltyEn: string;
  status: 'open' | 'closed';
}

// ===== REQUESTS =====
export interface EmployeeRequest {
  id: number;
  employeeId: string;
  typeAr: string;
  typeEn: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

// Initial data for Emp001
const initialLeaveBalances: Record<string, LeaveBalance[]> = {
  'Emp001': [
    { typeAr: 'سنوية', typeEn: 'Annual', total: 21, used: 6, remaining: 15 },
    { typeAr: 'مرضية', typeEn: 'Sick', total: 14, used: 2, remaining: 12 },
    { typeAr: 'عارضة', typeEn: 'Casual', total: 7, used: 3, remaining: 4 },
  ],
  'Emp002': [
    { typeAr: 'سنوية', typeEn: 'Annual', total: 21, used: 10, remaining: 11 },
    { typeAr: 'مرضية', typeEn: 'Sick', total: 14, used: 5, remaining: 9 },
    { typeAr: 'عارضة', typeEn: 'Casual', total: 7, used: 1, remaining: 6 },
  ],
};

const initialLeaveRequests: LeaveRequest[] = [
  { id: 1, employeeId: 'Emp001', typeAr: 'سنوية', typeEn: 'Annual', from: '2026-01-10', to: '2026-01-12', days: 3, status: 'approved' },
  { id: 2, employeeId: 'Emp001', typeAr: 'مرضية', typeEn: 'Sick', from: '2026-01-20', to: '2026-01-21', days: 2, status: 'approved' },
  { id: 3, employeeId: 'Emp001', typeAr: 'سنوية', typeEn: 'Annual', from: '2026-02-15', to: '2026-02-17', days: 3, status: 'pending' },
  { id: 4, employeeId: 'Emp002', typeAr: 'سنوية', typeEn: 'Annual', from: '2026-01-05', to: '2026-01-09', days: 5, status: 'approved' },
];

const initialLoans: Loan[] = [
  { id: 1, employeeId: 'Emp001', typeAr: 'قرض شخصي', typeEn: 'Personal Loan', amount: 30000, paid: 5000, remaining: 25000, installment: 2500, status: 'active' },
  { id: 2, employeeId: 'Emp001', typeAr: 'سلفة', typeEn: 'Advance', amount: 2000, paid: 2000, remaining: 0, installment: 2000, status: 'paid' },
  { id: 3, employeeId: 'Emp002', typeAr: 'قرض شخصي', typeEn: 'Personal Loan', amount: 24000, paid: 4000, remaining: 20000, installment: 2000, status: 'active' },
];

const initialEvaluations: Evaluation[] = [
  { id: 1, employeeId: 'Emp001', period: 'Q4 2025', score: 4.2, maxScore: 5, reviewerAr: 'محمد أحمد', reviewerEn: 'Mohamed Ahmed', status: 'completed', notesAr: 'أداء ممتاز في المشاريع', notesEn: 'Excellent project performance' },
  { id: 2, employeeId: 'Emp001', period: 'Q3 2025', score: 3.8, maxScore: 5, reviewerAr: 'محمد أحمد', reviewerEn: 'Mohamed Ahmed', status: 'completed', notesAr: 'جيد مع مجال للتحسين', notesEn: 'Good with room for improvement' },
  { id: 3, employeeId: 'Emp002', period: 'Q4 2025', score: 4.5, maxScore: 5, reviewerAr: 'علي حسن', reviewerEn: 'Ali Hassan', status: 'completed', notesAr: 'أداء متميز', notesEn: 'Outstanding performance' },
];

const initialTraining: TrainingCourse[] = [
  { id: 1, employeeId: 'Emp001', nameAr: 'دورة القيادة المتقدمة', nameEn: 'Advanced Leadership', progress: 75, status: 'in-progress', startDate: '2026-01-01', endDate: '2026-03-01' },
  { id: 2, employeeId: 'Emp001', nameAr: 'إدارة المشاريع PMP', nameEn: 'PMP Project Management', progress: 100, status: 'completed', startDate: '2025-09-01', endDate: '2025-11-30' },
  { id: 3, employeeId: 'Emp001', nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity Basics', progress: 30, status: 'in-progress', startDate: '2026-02-01', endDate: '2026-04-01' },
  { id: 4, employeeId: 'Emp002', nameAr: 'تحليل البيانات', nameEn: 'Data Analysis', progress: 50, status: 'in-progress', startDate: '2026-01-15', endDate: '2026-03-15' },
];

const initialMissions: Mission[] = [
  { id: 1, employeeId: 'Emp001', destAr: 'الإسكندرية', destEn: 'Alexandria', from: '2026-01-15', to: '2026-01-17', purposeAr: 'اجتماع عمل', purposeEn: 'Business Meeting', status: 'approved' },
  { id: 2, employeeId: 'Emp001', destAr: 'أسوان', destEn: 'Aswan', from: '2026-02-20', to: '2026-02-22', purposeAr: 'تدريب ميداني', purposeEn: 'Field Training', status: 'pending' },
  { id: 3, employeeId: 'Emp002', destAr: 'الأقصر', destEn: 'Luxor', from: '2026-01-25', to: '2026-01-27', purposeAr: 'زيارة عميل', purposeEn: 'Client Visit', status: 'approved' },
];

const initialViolations: Violation[] = [
  { id: 1, employeeId: 'Emp001', date: '2025-11-05', typeAr: 'تأخر متكرر', typeEn: 'Repeated Lateness', penaltyAr: 'إنذار شفهي', penaltyEn: 'Verbal Warning', status: 'closed' },
  { id: 2, employeeId: 'Emp001', date: '2025-08-20', typeAr: 'غياب بدون إذن', typeEn: 'Unauthorized Absence', penaltyAr: 'خصم يوم', penaltyEn: '1 Day Deduction', status: 'closed' },
];

const initialRequests: EmployeeRequest[] = [
  { id: 1, employeeId: 'Emp001', typeAr: 'خطاب تعريف', typeEn: 'Intro Letter', date: '2026-01-20', status: 'approved' },
  { id: 2, employeeId: 'Emp001', typeAr: 'شهادة خبرة', typeEn: 'Experience Cert', date: '2026-02-01', status: 'pending' },
  { id: 3, employeeId: 'Emp001', typeAr: 'تعديل بيانات', typeEn: 'Data Update', date: '2025-12-15', status: 'rejected' },
];

interface PortalDataContextType {
  getLeaveBalances: (employeeId: string) => LeaveBalance[];
  getLeaveRequests: (employeeId: string) => LeaveRequest[];
  getLoans: (employeeId: string) => Loan[];
  getEvaluations: (employeeId: string) => Evaluation[];
  getTraining: (employeeId: string) => TrainingCourse[];
  getMissions: (employeeId: string) => Mission[];
  getViolations: (employeeId: string) => Violation[];
  getRequests: (employeeId: string) => EmployeeRequest[];
}

const PortalDataContext = createContext<PortalDataContextType | undefined>(undefined);

export const PortalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveBalances] = useState(initialLeaveBalances);
  const [leaveRequests] = useState(initialLeaveRequests);
  const [loans] = useState(initialLoans);
  const [evaluations] = useState(initialEvaluations);
  const [training] = useState(initialTraining);
  const [missions] = useState(initialMissions);
  const [violations] = useState(initialViolations);
  const [requests] = useState(initialRequests);

  const getLeaveBalances = useCallback((empId: string) => leaveBalances[empId] || [], [leaveBalances]);
  const getLeaveRequests = useCallback((empId: string) => leaveRequests.filter(r => r.employeeId === empId), [leaveRequests]);
  const getLoans = useCallback((empId: string) => loans.filter(l => l.employeeId === empId), [loans]);
  const getEvaluations = useCallback((empId: string) => evaluations.filter(e => e.employeeId === empId), [evaluations]);
  const getTraining = useCallback((empId: string) => training.filter(t => t.employeeId === empId), [training]);
  const getMissions = useCallback((empId: string) => missions.filter(m => m.employeeId === empId), [missions]);
  const getViolations = useCallback((empId: string) => violations.filter(v => v.employeeId === empId), [violations]);
  const getRequests = useCallback((empId: string) => requests.filter(r => r.employeeId === empId), [requests]);

  return (
    <PortalDataContext.Provider value={{ getLeaveBalances, getLeaveRequests, getLoans, getEvaluations, getTraining, getMissions, getViolations, getRequests }}>
      {children}
    </PortalDataContext.Provider>
  );
};

export const usePortalData = () => {
  const ctx = useContext(PortalDataContext);
  if (!ctx) throw new Error('usePortalData must be used within PortalDataProvider');
  return ctx;
};
