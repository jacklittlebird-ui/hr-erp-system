import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CertificatesTabProps {
  employee: Employee;
}

export const CertificatesTab = ({ employee }: CertificatesTabProps) => {
  const { t, isRTL } = useLanguage();

  const certificates = [
    { id: 'qualificationCert', labelKey: 'employees.fields.qualificationCert' },
    { id: 'militaryServiceCert', labelKey: 'employees.fields.militaryServiceCert' },
    { id: 'birthCert', labelKey: 'employees.fields.birthCert' },
    { id: 'idCopy', labelKey: 'employees.fields.idCopy' },
    { id: 'pledge', labelKey: 'employees.fields.pledge' },
    { id: 'contract', labelKey: 'employees.fields.contract' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="flex flex-col items-center gap-2">
            <Checkbox id={cert.id} className="w-5 h-5" />
            <Label htmlFor={cert.id} className="text-center text-sm">
              {t(cert.labelKey)}
            </Label>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center gap-2">
          <Checkbox id="receipt" className="w-5 h-5" />
          <Label htmlFor="receipt" className="text-center text-sm">
            {t('employees.fields.receipt')}
          </Label>
          <span className="text-xs text-muted-foreground">Chooseit</span>
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.attachments')}</Label>
        <Input className={cn(isRTL && "text-right")} />
      </div>
    </div>
  );
};
