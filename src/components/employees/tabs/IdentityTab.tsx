import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface IdentityTabProps {
  employee: Employee;
}

export const IdentityTab = ({ employee }: IdentityTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.nationalId')}</Label>
          <Input defaultValue={employee.nationalId} className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.idIssueDate')}</Label>
          <Input type="date" defaultValue={employee.idIssueDate} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.idExpiryDate')}</Label>
          <Input type="date" defaultValue={employee.idExpiryDate} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.issuingAuthority')}</Label>
          <Input defaultValue={employee.issuingAuthority} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.issuingGovernorate')}</Label>
          <Input defaultValue={employee.issuingGovernorate} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.militaryStatus')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">{t('employees.military.completed')}</SelectItem>
              <SelectItem value="exempt">{t('employees.military.exempt')}</SelectItem>
              <SelectItem value="postponed">{t('employees.military.postponed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
