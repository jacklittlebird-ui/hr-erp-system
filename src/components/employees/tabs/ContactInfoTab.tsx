import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ContactInfoTabProps {
  employee: Employee;
}

export const ContactInfoTab = ({ employee }: ContactInfoTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.email')}</Label>
          <Input type="email" defaultValue={employee.email} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.homePhone')}</Label>
          <Input defaultValue={employee.homePhone} className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.mobile')}</Label>
          <Input defaultValue={employee.phone} className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.address')}</Label>
        <Textarea 
          defaultValue={employee.address} 
          className={cn("min-h-[100px]", isRTL && "text-right")} 
        />
      </div>

      {/* City and Governorate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.city')}</Label>
          <Input defaultValue={employee.city} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.governorate')}</Label>
          <Input defaultValue={employee.governorate} className={cn(isRTL && "text-right")} />
        </div>
      </div>
    </div>
  );
};
