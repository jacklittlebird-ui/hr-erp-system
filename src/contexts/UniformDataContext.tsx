import React, { createContext, useContext, useCallback } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

export interface UniformItem {
  id: number;
  employeeId: string;
  typeAr: string;
  typeEn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
  notes?: string;
}

export const UNIFORM_TYPES = [
  { ar: 'قميص أبيض', en: 'White Shirt' },
  { ar: 'قميص لبني', en: 'Light Blue Shirt' },
  { ar: 'بنطلون كحلي', en: 'Navy Pants' },
  { ar: 'جاكيت بدلة كحلي', en: 'Navy Suit Jacket' },
  { ar: 'بلوفر', en: 'Pullover' },
  { ar: 'كرافت', en: 'Tie' },
  { ar: 'إيشارب', en: 'Scarf' },
  { ar: 'بلوزة حريمي', en: 'Women Blouse' },
];

export function getDepreciationPercent(deliveryDate: string): number {
  const delivery = new Date(deliveryDate);
  const now = new Date();
  const months = (now.getFullYear() - delivery.getFullYear()) * 12 + (now.getMonth() - delivery.getMonth());
  if (months >= 12) return 0;
  if (months >= 9) return 25;
  if (months >= 6) return 50;
  if (months >= 3) return 75;
  return 100;
}

export function getCurrentValue(totalPrice: number, deliveryDate: string): number {
  return totalPrice * (getDepreciationPercent(deliveryDate) / 100);
}

export function isExpired(deliveryDate: string): boolean {
  return getDepreciationPercent(deliveryDate) === 0;
}

interface UniformDataContextType {
  uniforms: UniformItem[];
  addUniform: (item: Omit<UniformItem, 'id'>) => void;
  deleteUniform: (id: number) => void;
  updateUniform: (id: number, updates: Partial<UniformItem>) => void;
  getEmployeeUniforms: (employeeId: string) => UniformItem[];
}

const UniformDataContext = createContext<UniformDataContextType | undefined>(undefined);

export const UniformDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uniforms, setUniforms] = usePersistedState<UniformItem[]>('hr_uniforms', []);

  const addUniform = useCallback((item: Omit<UniformItem, 'id'>) => {
    setUniforms(prev => [...prev, { ...item, id: Date.now() }]);
  }, []);

  const deleteUniform = useCallback((id: number) => {
    setUniforms(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateUniform = useCallback((id: number, updates: Partial<UniformItem>) => {
    setUniforms(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const getEmployeeUniforms = useCallback((employeeId: string) => {
    return uniforms.filter(u => u.employeeId === employeeId && !isExpired(u.deliveryDate));
  }, [uniforms]);

  return (
    <UniformDataContext.Provider value={{ uniforms, addUniform, deleteUniform, updateUniform, getEmployeeUniforms }}>
      {children}
    </UniformDataContext.Provider>
  );
};

export const useUniformData = () => {
  const ctx = useContext(UniformDataContext);
  if (!ctx) throw new Error('useUniformData must be used within UniformDataProvider');
  return ctx;
};
