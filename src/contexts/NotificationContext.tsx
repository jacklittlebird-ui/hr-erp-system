import React, { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

export interface AppNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
  type: 'success' | 'warning' | 'info' | 'error';
  module: 'employee' | 'salary' | 'payroll' | 'attendance' | 'leave' | 'loan' | 'training' | 'performance' | 'portal' | 'asset' | 'recruitment' | 'general';
  employeeId?: string;
  read: boolean;
  timestamp: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: AppNotification[] = [
  { id: 'init1', titleAr: 'مرحباً بك في نظام الموارد البشرية', titleEn: 'Welcome to HR System', type: 'info', module: 'general', read: false, timestamp: new Date().toISOString() },
  { id: 'init_emp001_1', titleAr: 'تم اعتماد إجازتك السنوية', titleEn: 'Your annual leave has been approved', descAr: 'تم اعتماد إجازتك من 10/01 إلى 12/01', descEn: 'Your leave from 01/10 to 01/12 has been approved', type: 'success', module: 'leave', employeeId: 'Emp001', read: false, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'init_emp001_2', titleAr: 'موعد تقييم الأداء الربع سنوي', titleEn: 'Quarterly performance review due', descAr: 'يرجى الاطلاع على نتائج تقييم Q4 2025', descEn: 'Please review Q4 2025 evaluation results', type: 'info', module: 'performance', employeeId: 'Emp001', read: false, timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 'init_emp001_3', titleAr: 'قسط القرض الشهري مستحق', titleEn: 'Monthly loan installment due', descAr: 'قسط القرض الشخصي بقيمة 2,500 ج.م مستحق هذا الشهر', descEn: 'Personal loan installment of 2,500 EGP is due this month', type: 'warning', module: 'loan', employeeId: 'Emp001', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = usePersistedState<AppNotification[]>('hr_notifications', initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    const newN: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newN, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
