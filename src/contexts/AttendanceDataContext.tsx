import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'late' | 'early-leave' | 'on-leave' | 'weekend';
  workHours: number;
  workMinutes: number;
  overtime: number;
  notes?: string;
}

/** Calculate work hours correctly including overnight shifts */
export const calculateWorkTime = (checkIn: string | null, checkOut: string | null): { hours: number; minutes: number; totalMinutes: number } => {
  if (!checkIn || !checkOut) return { hours: 0, minutes: 0, totalMinutes: 0 };
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  let totalInMinutes = inH * 60 + inM;
  let totalOutMinutes = outH * 60 + outM;
  // Handle overnight shift: if checkout is before checkin, add 24 hours
  if (totalOutMinutes < totalInMinutes) {
    totalOutMinutes += 24 * 60;
  }
  const diffMinutes = totalOutMinutes - totalInMinutes;
  return { hours: Math.floor(diffMinutes / 60), minutes: diffMinutes % 60, totalMinutes: diffMinutes };
};

interface AttendanceDataContextType {
  records: AttendanceEntry[];
  checkIn: (employeeId: string, employeeName: string, employeeNameAr: string, department: string) => void;
  checkOut: (recordId: string) => void;
  getEmployeeRecords: (employeeId: string) => AttendanceEntry[];
  getEmployeeMonthlyRecords: (employeeId: string, year: number, month: number) => AttendanceEntry[];
  getMonthlyStats: (employeeId: string, year: number, month: number) => {
    present: number; late: number; absent: number; totalHours: number; totalMinutes: number; overtime: number;
  };
}

const AttendanceDataContext = createContext<AttendanceDataContextType | undefined>(undefined);

// Generate realistic initial data for Emp001 and Emp002
const generateInitialRecords = (): AttendanceEntry[] => {
  const records: AttendanceEntry[] = [];
  const employees = [
    { id: 'Emp001', name: 'Galal AbdelRazek AbdelHaliem', nameAr: 'جلال عبد الرازق عبد العليم', dept: 'الإدارة' },
    { id: 'Emp002', name: 'Ahmed Mohamed Ali', nameAr: 'أحمد محمد علي', dept: 'تقنية المعلومات' },
  ];
  const now = new Date();
  let idCounter = 1;

  employees.forEach(emp => {
    // Generate records for current month up to today
    for (let d = 1; d <= now.getDate(); d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), d);
      const day = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      if (day === 5 || day === 6) {
        records.push({
          id: String(idCounter++), employeeId: emp.id, employeeName: emp.name, employeeNameAr: emp.nameAr,
          department: emp.dept, date: dateStr, checkIn: null, checkOut: null,
          status: 'weekend', workHours: 0, workMinutes: 0, overtime: 0,
        });
        continue;
      }

      if (date.toDateString() === now.toDateString()) continue; // Skip today

      const r = Math.random();
      if (r > 0.92) {
        records.push({
          id: String(idCounter++), employeeId: emp.id, employeeName: emp.name, employeeNameAr: emp.nameAr,
          department: emp.dept, date: dateStr, checkIn: null, checkOut: null,
          status: 'absent', workHours: 0, workMinutes: 0, overtime: 0,
        });
      } else if (r > 0.82) {
        const wt = calculateWorkTime('09:15', '17:00');
        records.push({
          id: String(idCounter++), employeeId: emp.id, employeeName: emp.name, employeeNameAr: emp.nameAr,
          department: emp.dept, date: dateStr, checkIn: '09:15', checkOut: '17:00',
          status: 'late', workHours: wt.hours, workMinutes: wt.minutes, overtime: 0,
        });
      } else {
        const ot = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
        const outTime = `${String(17 + ot).padStart(2, '0')}:00`;
        const wt = calculateWorkTime('08:00', outTime);
        records.push({
          id: String(idCounter++), employeeId: emp.id, employeeName: emp.name, employeeNameAr: emp.nameAr,
          department: emp.dept, date: dateStr, checkIn: '08:00', checkOut: outTime,
          status: 'present', workHours: wt.hours, workMinutes: wt.minutes, overtime: Math.max(0, wt.hours - 8),
        });
      }
    }
  });

  // Add a night shift example for Emp002 
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 2);
  if (yesterdayDate.getDay() !== 5 && yesterdayDate.getDay() !== 6) {
    const dateStr = yesterdayDate.toISOString().split('T')[0];
    // Override the record for that day with a night shift
    const existingIdx = records.findIndex(r => r.employeeId === 'Emp002' && r.date === dateStr);
    if (existingIdx >= 0) {
      const wt = calculateWorkTime('22:00', '06:30');
      records[existingIdx] = {
        ...records[existingIdx],
        checkIn: '22:00', checkOut: '06:30',
        status: 'present', workHours: wt.hours, workMinutes: wt.minutes, overtime: Math.max(0, wt.hours - 8),
      };
    }
  }

  return records;
};

export const AttendanceDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AttendanceEntry[]>(generateInitialRecords);

  const checkInFn = useCallback((employeeId: string, employeeName: string, employeeNameAr: string, department: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const dateString = now.toISOString().split('T')[0];
    const isLate = now.getHours() >= 9;

    const entry: AttendanceEntry = {
      id: String(Date.now()),
      employeeId, employeeName, employeeNameAr, department,
      date: dateString, checkIn: timeString, checkOut: null,
      status: isLate ? 'late' : 'present',
      workHours: 0, workMinutes: 0, overtime: 0,
    };
    setRecords(prev => [...prev, entry]);
  }, []);

  const checkOutFn = useCallback((recordId: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const wt = calculateWorkTime(record.checkIn, timeString);
        const isEarlyLeave = now.getHours() < 17;
        return {
          ...record,
          checkOut: timeString,
          status: isEarlyLeave ? 'early-leave' : record.status,
          workHours: wt.hours,
          workMinutes: wt.minutes,
          overtime: Math.max(0, wt.hours - 8),
        };
      }
      return record;
    }));
  }, []);

  const getEmployeeRecords = useCallback((employeeId: string) => {
    return records.filter(r => r.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const getEmployeeMonthlyRecords = useCallback((employeeId: string, year: number, month: number) => {
    return records.filter(r => {
      if (r.employeeId !== employeeId) return false;
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [records]);

  const getMonthlyStats = useCallback((employeeId: string, year: number, month: number) => {
    const monthRecords = records.filter(r => {
      if (r.employeeId !== employeeId) return false;
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const present = monthRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const late = monthRecords.filter(r => r.status === 'late').length;
    const absent = monthRecords.filter(r => r.status === 'absent').length;
    const totalMinutes = monthRecords.reduce((s, r) => s + r.workHours * 60 + r.workMinutes, 0);
    const overtime = monthRecords.reduce((s, r) => s + r.overtime, 0);
    return { present, late, absent, totalHours: Math.floor(totalMinutes / 60), totalMinutes: totalMinutes % 60, overtime };
  }, [records]);

  return (
    <AttendanceDataContext.Provider value={{ records, checkIn: checkInFn, checkOut: checkOutFn, getEmployeeRecords, getEmployeeMonthlyRecords, getMonthlyStats }}>
      {children}
    </AttendanceDataContext.Provider>
  );
};

export const useAttendanceData = () => {
  const ctx = useContext(AttendanceDataContext);
  if (!ctx) throw new Error('useAttendanceData must be used within AttendanceDataProvider');
  return ctx;
};
