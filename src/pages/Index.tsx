import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentChart } from '@/components/dashboard/DepartmentChart';
import { EmployeeGrowthChart } from '@/components/dashboard/EmployeeGrowthChart';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  Building2, 
  CalendarCheck, 
  Briefcase, 
  FileText,
  Monitor,
  Star,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    { key: 'dashboard.totalEmployees', value: 2, icon: Users, variant: 'coral' as const },
    { key: 'dashboard.activeEmployees', value: 1, icon: UserCheck, variant: 'purple' as const },
    { key: 'dashboard.departments', value: 0, icon: Building2, variant: 'blue' as const },
    { key: 'dashboard.todayAttendance', value: 0, icon: CalendarCheck, variant: 'teal' as const },
    { key: 'dashboard.openPositions', value: 5, icon: Briefcase, variant: 'green' as const },
    { key: 'dashboard.pendingLeaves', value: 12, icon: FileText, variant: 'yellow' as const },
    { key: 'dashboard.assignedAssets', value: 123, icon: Monitor, variant: 'pink' as const },
    { key: 'dashboard.avgPerformance', value: '4.2', icon: Star, variant: 'blue' as const },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className={cn("mb-8", isRTL && "text-right")}>
        <h1 className="text-2xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.key}
            title={t(stat.key)}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Reports Section Header */}
      <div className={cn(
        "flex items-center justify-between mb-6",
        isRTL && "flex-row-reverse"
      )}>
        <h2 className="text-xl font-semibold text-foreground">
          {t('chart.reportsStats')}
        </h2>
        
        <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
          <Button variant="default" className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <BarChart3 className="w-4 h-4" />
            {t('chart.advancedReports')}
          </Button>
          <Button variant="outline" className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <RefreshCw className="w-4 h-4" />
            {t('chart.refresh')}
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DepartmentChart />
        <EmployeeGrowthChart />
      </div>

      {/* Full Width Chart */}
      <AttendanceChart />
    </DashboardLayout>
  );
};

export default Index;
