import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LeaveBalanceTabProps {
  employee: Employee;
}

export const LeaveBalanceTab = ({ employee }: LeaveBalanceTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.annualLeaveBalance')}</Label>
          <Input 
            type="number" 
            defaultValue={employee.annualLeaveBalance || 21}
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.sickLeaveBalance')}</Label>
          <Input 
            type="number" 
            defaultValue={employee.sickLeaveBalance || 7}
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.casualLeaveBalance')}</Label>
          <Input 
            type="number" 
            defaultValue={6}
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.usedLeave')}</Label>
          <Input 
            type="number" 
            defaultValue={0}
            className={cn(isRTL && "text-right")} 
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
