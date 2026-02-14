import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface OtherTabProps {
  employee: Employee;
  onUpdate?: (updates: Partial<Employee>) => void;
}

export const OtherTab = ({ employee, onUpdate }: OtherTabProps) => {
  const { t, isRTL } = useLanguage();
  const [notes, setNotes] = useState(employee.notes || '');

  const handleChange = (value: string) => {
    setNotes(value);
    onUpdate?.({ notes: value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.notes')}</Label>
        <Textarea
          value={notes}
          onChange={e => handleChange(e.target.value)}
          className={cn("min-h-[150px]", isRTL && "text-right")}
          placeholder={t('employees.fields.notesPlaceholder')}
        />
      </div>
    </div>
  );
};
