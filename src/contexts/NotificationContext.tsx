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
