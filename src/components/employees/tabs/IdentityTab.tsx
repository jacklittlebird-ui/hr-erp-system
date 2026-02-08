import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface IdentityTabProps {
  employee: Employee;
}

export const IdentityTab = ({ employee }: IdentityTabProps) => {
  const { t, isRTL } = useLanguage();
  const [issueDate, setIssueDate] = useState(employee.idIssueDate || '');
  const [expiryDate, setExpiryDate] = useState(employee.idExpiryDate || '');

  useEffect(() => {
    if (issueDate) {
      const issue = new Date(issueDate);
      const expiry = new Date(issue);
      expiry.setFullYear(expiry.getFullYear() + 7);
      setExpiryDate(expiry.toISOString().split('T')[0]);
    }
  }, [issueDate]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.nationalId')}</Label>
          <Input defaultValue={employee.nationalId} className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.idIssueDate')}</Label>
          <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.idExpiryDate')}</Label>
          <Input type="date" value={expiryDate} readOnly className={cn(isRTL && "text-right", "bg-muted")} />
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
              <SelectItem value="not-applicable">{t('employees.military.notApplicable')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
