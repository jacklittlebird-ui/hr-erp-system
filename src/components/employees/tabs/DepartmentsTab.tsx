import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentsTabProps {
  employee: Employee;
}

export const DepartmentsTab = ({ employee: _employee }: DepartmentsTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6">
      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse") }>
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className={cn("text-lg font-semibold", isRTL && "text-right")}>{t('employees.tabs.departments')}</h3>
        </div>
        <p className={cn("mt-3 text-sm text-muted-foreground", isRTL && "text-right")}>
          {isRTL
            ? 'تم حذف جميع الكروت من هذه التبويبة كما طلبت.'
            : 'All cards were removed from this tab as requested.'}
        </p>
      </div>
    </div>
  );
};
