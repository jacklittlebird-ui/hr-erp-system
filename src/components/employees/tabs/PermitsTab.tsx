import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface PermitsTabProps {
  employee: Employee;
}

export const PermitsTab = ({ employee }: PermitsTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="cairoTempPermit" />
            <Label htmlFor="cairoTempPermit">{t('employees.fields.cairoAirportTempPermit')}</Label>
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.tempPermitNo')}</Label>
            <Input className={cn(isRTL && "text-right")} dir="ltr" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="cairoAnnualPermit" />
            <Label htmlFor="cairoAnnualPermit">{t('employees.fields.cairoAirportAnnualPermit')}</Label>
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.annualPermitNo')}</Label>
            <Input className={cn(isRTL && "text-right")} dir="ltr" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="airportsTempPermit" />
            <Label htmlFor="airportsTempPermit">{t('employees.fields.airportsTempPermit')}</Label>
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.airportsTempPermitNo')}</Label>
            <Input className={cn(isRTL && "text-right")} dir="ltr" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="airportsAnnualPermit" />
            <Label htmlFor="airportsAnnualPermit">{t('employees.fields.airportsAnnualPermit')}</Label>
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.airportsAnnualPermitNo')}</Label>
            <Input className={cn(isRTL && "text-right")} dir="ltr" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.airportsPermitType')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>

        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.permitNameEn')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.permitNameAr')}</Label>
        <Input className={cn(isRTL && "text-right")} />
      </div>
    </div>
  );
};
