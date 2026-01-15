import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SalaryTabProps {
  employee: Employee;
}

export const SalaryTab = ({ employee }: SalaryTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.basicSalary')}</Label>
          <Input 
            type="number" 
            defaultValue={employee.basicSalary}
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.allowances')}</Label>
          <Input 
            type="number" 
            defaultValue={employee.allowances}
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.transportAllowance')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.housingAllowance')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.mealAllowance')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.otherAllowances')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.deductions')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
          />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.netSalary')}</Label>
          <Input 
            type="number" 
            className={cn(isRTL && "text-right")} 
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
