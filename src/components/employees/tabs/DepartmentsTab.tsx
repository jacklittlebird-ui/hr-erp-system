import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DepartmentsTabProps {
  employee: Employee;
  onChange?: (field: string, value: string) => void;
}

const DEPT_CODES = ['PS', 'LL', 'OO', 'RO', 'LC', 'SC', 'IA', 'AD', 'AC', 'WO', 'TR'];

export const DepartmentsTab = ({ employee, onChange }: DepartmentsTabProps) => {
  const { t, isRTL } = useLanguage();

  const selectedCode = (employee as any).deptCode || '';

  return (
    <div className="p-6">
      <div className="rounded-xl border border-border bg-muted/20 p-6">
        <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className={cn("text-lg font-semibold", isRTL && "text-right")}>{t('employees.tabs.departments')}</h3>
        </div>
        <RadioGroup
          value={selectedCode}
          onValueChange={(val) => onChange?.('deptCode', val)}
          className="flex flex-wrap gap-4"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {DEPT_CODES.map((code) => (
            <div key={code} className="flex items-center gap-1.5">
              <RadioGroupItem value={code} id={`dept-${code}`} />
              <Label htmlFor={`dept-${code}`} className="cursor-pointer text-sm font-medium">
                {code}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};
