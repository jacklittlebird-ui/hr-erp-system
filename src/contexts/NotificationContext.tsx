import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

const mapRow = (r: any): AppNotification => ({
  id: r.id,
  titleAr: r.title_ar,
  titleEn: r.title_en,
  descAr: r.desc_ar || undefined,
  descEn: r.desc_en || undefined,
  type: r.type as AppNotification['type'],
  module: r.module as AppNotification['module'],
  employeeId: r.employee_id || undefined,
  read: r.is_read,
  timestamp: r.created_at,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setNotifications(data.map(mapRow));
  }, []);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        fetchNotifications();
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        fetchNotifications();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setNotifications([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback(async (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => {
    // Optimistic local update
    const tempId = `temp_${Date.now()}`;
    const localNotif: AppNotification = {
      ...n,
      id: tempId,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [localNotif, ...prev]);

    // Persist to DB
    const payload: any = {
      title_ar: n.titleAr,
      title_en: n.titleEn,
      desc_ar: n.descAr || null,
      desc_en: n.descEn || null,
      type: n.type,
      module: n.module,
      employee_id: n.employeeId || null,
      user_id: userId,
    };
    await supabase.from('notifications').insert(payload);
    // Re-fetch for correct IDs
    fetchNotifications();
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (userId) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    }
  }, [userId]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    if (userId) {
      await supabase.from('notifications').delete().eq('user_id', userId);
    }
  }, [userId]);

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
