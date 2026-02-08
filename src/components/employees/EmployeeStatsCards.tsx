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
    { label: t('employees.stats.total'), value: total, icon: Users, variant: 'dark' as const },
    { label: t('employees.stats.active'), value: active, icon: UserCheck, variant: 'red' as const },
    { label: t('employees.stats.departments'), value: departments, icon: Briefcase, variant: 'red' as const },
    { label: t('employees.stats.newThisMonth'), value: newThisMonth, icon: UserPlus, variant: 'dark' as const },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isDark = stat.variant === 'dark';
        return (
          <div
            key={index}
            className={cn(
              "rounded-xl p-5 flex items-center gap-4",
              isDark
                ? "bg-foreground text-background"
                : "bg-destructive text-destructive-foreground",
              isRTL && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
                isDark ? "bg-background/20" : "bg-destructive-foreground/20"
              )}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div className={cn(isRTL && "text-right")}>
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
