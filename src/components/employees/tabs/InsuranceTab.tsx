import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface InsuranceTabProps {
  employee: Employee;
}

export const InsuranceTab = ({ employee }: InsuranceTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.socialInsuranceNo')}</Label>
          <Input defaultValue={employee.socialInsuranceNo} className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.socialInsuranceStartDate')}</Label>
          <Input type="date" className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.socialInsuranceEndDate')}</Label>
          <Input type="date" className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.healthInsuranceCardNo')}</Label>
          <Input className={cn(isRTL && "text-right")} dir="ltr" />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox id="healthInsurance" />
          <Label htmlFor="healthInsurance">{t('employees.fields.healthInsurance')}</Label>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Checkbox id="govHealthInsurance" />
          <Label htmlFor="govHealthInsurance">{t('employees.fields.govHealthInsurance')}</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="socialInsurance" />
          <Label htmlFor="socialInsurance">{t('employees.fields.socialInsurance')}</Label>
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.contractType')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.selectContractType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permanent">{t('employees.contract.permanent')}</SelectItem>
              <SelectItem value="temporary">{t('employees.contract.temporary')}</SelectItem>
              <SelectItem value="parttime">{t('employees.contract.parttime')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
