import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface OtherTabProps {
  employee: Employee;
}

export const OtherTab = ({ employee }: OtherTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.notes')}</Label>
        <Textarea 
          defaultValue={employee.notes}
          className={cn("min-h-[150px]", isRTL && "text-right")} 
          placeholder={t('employees.fields.notesPlaceholder')}
        />
      </div>
    </div>
  );
};
