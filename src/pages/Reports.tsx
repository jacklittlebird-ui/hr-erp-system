import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { EmployeeReports } from '@/components/reports/EmployeeReports';
import { AttendanceReportsTab } from '@/components/reports/AttendanceReportsTab';
import { LeaveReports } from '@/components/reports/LeaveReports';
import { SalaryReports } from '@/components/reports/SalaryReports';
import { PerformanceReports } from '@/components/reports/PerformanceReports';
import { TrainingReports } from '@/components/reports/TrainingReports';

const Reports = () => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('employees');

  const tabs = [
    { id: 'employees', label: t('reports.tabs.employees') },
    { id: 'attendance', label: t('reports.tabs.attendance') },
    { id: 'leaves', label: t('reports.tabs.leaves') },
    { id: 'salaries', label: t('reports.tabs.salaries') },
    { id: 'performance', label: t('reports.tabs.performance') },
    { id: 'training', label: t('reports.tabs.training') },
  ];

  return (
    <DashboardLayout>
      <div className={cn("mb-6", isRTL && "text-right")}>
        <h1 className="text-2xl font-bold text-foreground">{t('reports.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('reports.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="employees">
          <EmployeeReports />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceReportsTab />
        </TabsContent>

        <TabsContent value="leaves">
          <LeaveReports />
        </TabsContent>

        <TabsContent value="salaries">
          <SalaryReports />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceReports />
        </TabsContent>

        <TabsContent value="training">
          <TrainingReports />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
