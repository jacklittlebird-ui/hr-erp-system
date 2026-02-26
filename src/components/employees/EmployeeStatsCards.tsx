import { useLanguage } from '@/contexts/LanguageContext';
import { Users, UserCheck, Briefcase, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeStatsCardsProps {
  total: number;
  active: number;
  departments: number;
  newThisMonth: number;
}

export const EmployeeStatsCards = ({ total, active, departments, newThisMonth }: EmployeeStatsCardsProps) => {
  const { t, isRTL } = useLanguage();

  const stats = [
    { label: t('employees.stats.total'), value: total, icon: Users, iconBg: 'bg-stat-blue', cardBg: 'bg-stat-blue-bg' },
    { label: t('employees.stats.active'), value: active, icon: UserCheck, iconBg: 'bg-stat-green', cardBg: 'bg-stat-green-bg' },
    { label: t('employees.stats.departments'), value: departments, icon: Briefcase, iconBg: 'bg-stat-purple', cardBg: 'bg-stat-purple-bg' },
    { label: t('employees.stats.newThisMonth'), value: newThisMonth, icon: UserPlus, iconBg: 'bg-stat-coral', cardBg: 'bg-stat-coral-bg' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={cn(
              "rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border/30",
              stat.cardBg,
              isRTL && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
                stat.iconBg
              )}
            >
              <Icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className={cn(isRTL && "text-right")}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
