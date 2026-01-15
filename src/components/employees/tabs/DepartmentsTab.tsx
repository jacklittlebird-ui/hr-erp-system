import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DepartmentsTabProps {
  employee: Employee;
}

const departmentCodes = [
  'PS', 'OO', 'LC', 'IA', 'LL', 'RO',
  'QC', 'AD', 'AC', 'WO', 'TR',
];

export const DepartmentsTab = ({ employee }: DepartmentsTabProps) => {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {departmentCodes.map((code) => (
          <div key={code} className="flex flex-col items-center gap-2">
            <Checkbox id={`dept-${code}`} className="w-5 h-5" />
            <Label htmlFor={`dept-${code}`} className="text-center text-sm font-medium">
              {code}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
