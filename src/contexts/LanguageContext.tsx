import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<string, Record<Language, string>> = {
  // Header
  'app.title': { en: 'HR Management System', ar: 'نظام إدارة الموارد البشرية' },
  
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.employees': { en: 'Employees', ar: 'الموظفين' },
  'nav.departments': { en: 'Departments', ar: 'الأقسام' },
  'nav.attendance': { en: 'Attendance', ar: 'الحضور والانصراف' },
  'nav.missions': { en: 'Mission Requests', ar: 'طلبات المأمورية' },
  'nav.leaves': { en: 'Leaves', ar: 'الإجازات' },
  'nav.permissions': { en: 'Permissions', ar: 'الأذونات' },
  'nav.salaries': { en: 'Salaries', ar: 'الرواتب' },
  'nav.salaryReports': { en: 'Salary Reports', ar: 'تقارير الرواتب' },
  'nav.loans': { en: 'Loans', ar: 'القروض' },
  'nav.recruitment': { en: 'Recruitment', ar: 'التوظيف' },
  'nav.performance': { en: 'Performance', ar: 'تقييم الأداء' },
  'nav.assets': { en: 'Assets', ar: 'الأصول' },
  'nav.uniforms': { en: 'Uniforms', ar: 'يونيفورم الموظفين' },
  'nav.documents': { en: 'Documents', ar: 'المستندات' },
  'nav.reports': { en: 'Reports', ar: 'التقارير' },
  'nav.training': { en: 'Training', ar: 'التدريب' },
  
  // Configuration
  'nav.configurations': { en: 'CONFIGURATIONS', ar: 'الإعدادات' },
  'nav.users': { en: 'Users', ar: 'المستخدمين' },
  'nav.groups': { en: 'Groups', ar: 'المجموعات' },
  'nav.roles': { en: 'Roles', ar: 'الأدوار' },
  'nav.settings': { en: 'Site Settings', ar: 'إعدادات الموقع' },
  
  // Dashboard
  'dashboard.title': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'dashboard.totalEmployees': { en: 'Total Employees', ar: 'إجمالي الموظفين' },
  'dashboard.activeEmployees': { en: 'Active Employees', ar: 'موظفين نشطين' },
  'dashboard.departments': { en: 'Departments', ar: 'الأقسام' },
  'dashboard.todayAttendance': { en: 'Today Attendance', ar: 'الحضور اليوم' },
  'dashboard.openPositions': { en: 'Open Positions', ar: 'الوظائف المفتوحة' },
  'dashboard.pendingLeaves': { en: 'Pending Leave Requests', ar: 'طلبات الإجازة المعلقة' },
  'dashboard.assignedAssets': { en: 'Assigned Assets', ar: 'الأصول المعينة' },
  'dashboard.avgPerformance': { en: 'Avg Performance', ar: 'متوسط تقييم الأداء' },
  
  // Charts
  'chart.reportsStats': { en: 'Reports & Statistics', ar: 'التقارير والإحصائيات' },
  'chart.employeeGrowth': { en: 'Employee Growth (Last 6 Months)', ar: 'نمو الموظفين (آخر 6 أشهر)' },
  'chart.departmentDist': { en: 'Employees by Department', ar: 'توزيع الموظفين حسب القسم' },
  'chart.weeklyAttendance': { en: 'Weekly Attendance & Performance', ar: 'الحضور والأداء الأسبوعي' },
  'chart.advancedReports': { en: 'Advanced Reports', ar: 'لوحة التقارير المتقدمة' },
  'chart.refresh': { en: 'Refresh', ar: 'تحديث' },
  
  // Departments
  'dept.it': { en: 'IT', ar: 'تقنية المعلومات' },
  'dept.hr': { en: 'HR', ar: 'الموارد البشرية' },
  'dept.finance': { en: 'Finance', ar: 'المالية' },
  'dept.sales': { en: 'Sales', ar: 'المبيعات' },
  'dept.marketing': { en: 'Marketing', ar: 'التسويق' },
  'dept.operations': { en: 'Operations', ar: 'العمليات' },
  
  // Chart legends
  'legend.attendance': { en: 'Attendance', ar: 'الحضور' },
  'legend.completed': { en: 'Completed Tasks', ar: 'التقييمات المكتملة' },
  'legend.late': { en: 'Late', ar: 'التأخير' },
  
  // Months
  'month.jan': { en: 'Jan', ar: 'يناير' },
  'month.feb': { en: 'Feb', ar: 'فبراير' },
  'month.mar': { en: 'Mar', ar: 'مارس' },
  'month.apr': { en: 'Apr', ar: 'أبريل' },
  'month.may': { en: 'May', ar: 'مايو' },
  'month.jun': { en: 'Jun', ar: 'يونيو' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
