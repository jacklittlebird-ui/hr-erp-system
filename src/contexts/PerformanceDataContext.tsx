import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { mockEmployees } from '@/data/mockEmployees';

export interface CriteriaItem {
  name: string;
  nameEn: string;
  score: number;
  weight: number;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  station: string;
  quarter: string;
  year: string;
  score: number;
  status: 'draft' | 'submitted' | 'approved';
  reviewer: string;
  reviewDate: string;
  strengths?: string;
  improvements?: string;
  goals?: string;
  managerComments?: string;
  criteria?: CriteriaItem[];
}

export const defaultCriteria: CriteriaItem[] = [
  { name: 'جودة العمل', nameEn: 'Work Quality', score: 3, weight: 25 },
  { name: 'الإنتاجية', nameEn: 'Productivity', score: 3, weight: 20 },
  { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 3, weight: 20 },
  { name: 'التواصل', nameEn: 'Communication', score: 3, weight: 15 },
  { name: 'المبادرة', nameEn: 'Initiative', score: 3, weight: 10 },
  { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 3, weight: 10 },
];

// Real initial reviews based on actual employees
const initialReviews: PerformanceReview[] = [
  {
    id: '1', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', department: 'الإدارة', station: 'cairo',
    quarter: 'Q4', year: '2025', score: 4.5, status: 'approved', reviewer: 'محمد السيد', reviewDate: '2025-12-15',
    strengths: 'أداء ممتاز في إدارة الفريق والالتزام بالمواعيد', improvements: 'تحسين مهارات العرض التقديمي', goals: 'قيادة مشروع تطوير النظام الجديد', managerComments: 'موظف متميز يستحق الترقية',
    criteria: [
      { name: 'جودة العمل', nameEn: 'Work Quality', score: 5, weight: 25 },
      { name: 'الإنتاجية', nameEn: 'Productivity', score: 4, weight: 20 },
      { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 5, weight: 20 },
      { name: 'التواصل', nameEn: 'Communication', score: 4, weight: 15 },
      { name: 'المبادرة', nameEn: 'Initiative', score: 4, weight: 10 },
      { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 5, weight: 10 },
    ],
  },
  {
    id: '2', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', department: 'تقنية المعلومات', station: 'hq1',
    quarter: 'Q4', year: '2025', score: 4.2, status: 'approved', reviewer: 'أحمد حسن', reviewDate: '2025-12-14',
    strengths: 'إتقان البرمجة وحل المشكلات التقنية بسرعة', improvements: 'تحسين التوثيق الفني', goals: 'تعلم تقنيات الذكاء الاصطناعي',
    criteria: [
      { name: 'جودة العمل', nameEn: 'Work Quality', score: 4, weight: 25 },
      { name: 'الإنتاجية', nameEn: 'Productivity', score: 4, weight: 20 },
      { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 5, weight: 20 },
      { name: 'التواصل', nameEn: 'Communication', score: 4, weight: 15 },
      { name: 'المبادرة', nameEn: 'Initiative', score: 4, weight: 10 },
      { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 4, weight: 10 },
    ],
  },
  {
    id: '3', employeeId: 'Emp004', employeeName: 'شريف منير', department: 'المبيعات', station: 'hurghada',
    quarter: 'Q4', year: '2025', score: 4.0, status: 'submitted', reviewer: 'هدى علي', reviewDate: '2025-12-12',
    strengths: 'مهارات تواصل ممتازة مع العملاء', improvements: 'الالتزام بالمواعيد النهائية', goals: 'زيادة المبيعات بنسبة 15%',
    criteria: [
      { name: 'جودة العمل', nameEn: 'Work Quality', score: 4, weight: 25 },
      { name: 'الإنتاجية', nameEn: 'Productivity', score: 4, weight: 20 },
      { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 4, weight: 20 },
      { name: 'التواصل', nameEn: 'Communication', score: 5, weight: 15 },
      { name: 'المبادرة', nameEn: 'Initiative', score: 3, weight: 10 },
      { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 4, weight: 10 },
    ],
  },
  {
    id: '4', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', department: 'الإدارة', station: 'cairo',
    quarter: 'Q3', year: '2025', score: 3.9, status: 'approved', reviewer: 'محمد عبدالله', reviewDate: '2025-09-20',
    strengths: 'التزام عالي بالجودة', improvements: 'تطوير مهارات القيادة', goals: 'إتمام دورة القيادة المتقدمة',
    criteria: [
      { name: 'جودة العمل', nameEn: 'Work Quality', score: 4, weight: 25 },
      { name: 'الإنتاجية', nameEn: 'Productivity', score: 4, weight: 20 },
      { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 4, weight: 20 },
      { name: 'التواصل', nameEn: 'Communication', score: 3, weight: 15 },
      { name: 'المبادرة', nameEn: 'Initiative', score: 4, weight: 10 },
      { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 4, weight: 10 },
    ],
  },
  {
    id: '5', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', department: 'تقنية المعلومات', station: 'hq1',
    quarter: 'Q3', year: '2025', score: 4.3, status: 'approved', reviewer: 'سمير أحمد', reviewDate: '2025-09-18',
    strengths: 'سرعة في التنفيذ وجودة الكود', improvements: 'مشاركة المعرفة مع الفريق', goals: 'بناء نظام CI/CD',
    criteria: [
      { name: 'جودة العمل', nameEn: 'Work Quality', score: 5, weight: 25 },
      { name: 'الإنتاجية', nameEn: 'Productivity', score: 4, weight: 20 },
      { name: 'العمل الجماعي', nameEn: 'Teamwork', score: 4, weight: 20 },
      { name: 'التواصل', nameEn: 'Communication', score: 4, weight: 15 },
      { name: 'المبادرة', nameEn: 'Initiative', score: 5, weight: 10 },
      { name: 'الحضور والالتزام', nameEn: 'Attendance', score: 4, weight: 10 },
    ],
  },
];

export const calculateScore = (criteria: CriteriaItem[]) => {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  const weightedSum = criteria.reduce((s, c) => s + (c.score * c.weight), 0);
  return parseFloat((weightedSum / totalWeight).toFixed(2));
};

interface PerformanceDataContextType {
  reviews: PerformanceReview[];
  addReview: (review: Omit<PerformanceReview, 'id'>) => void;
  updateReview: (id: string, updates: Partial<PerformanceReview>) => void;
  deleteReview: (id: string) => void;
}

const PerformanceDataContext = createContext<PerformanceDataContextType | undefined>(undefined);

export const PerformanceDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = usePersistedState<PerformanceReview[]>('hr_performance_reviews', initialReviews);

  const addReview = useCallback((review: Omit<PerformanceReview, 'id'>) => {
    setReviews(prev => [...prev, { ...review, id: String(Date.now()) }]);
  }, []);

  const updateReview = useCallback((id: string, updates: Partial<PerformanceReview>) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <PerformanceDataContext.Provider value={{ reviews, addReview, updateReview, deleteReview }}>
      {children}
    </PerformanceDataContext.Provider>
  );
};

export const usePerformanceData = () => {
  const ctx = useContext(PerformanceDataContext);
  if (!ctx) throw new Error('usePerformanceData must be used within PerformanceDataProvider');
  return ctx;
};
