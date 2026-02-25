import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Building2, Users, UserCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DepartmentsTabProps {
  employee: Employee;
}

const departmentCodes = [
  'PS', 'OO', 'LC', 'IA', 'LL', 'RO',
  'QC', 'AD', 'AC', 'WO', 'TR',
];

export const DepartmentsTab = ({ employee }: DepartmentsTabProps) => {
  const { t, isRTL } = useLanguage();
  const [checkedDepts, setCheckedDepts] = useState<string[]>(employee.departmentAccess || []);

  const handleSave = () => {
    toast.success(isRTL ? 'تم حفظ بيانات القسم بنجاح' : 'Department data saved successfully');
  };

  const toggleDept = (code: string) => {
    setCheckedDepts(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Mock analytics
  const analytics = {
    totalEmployees: 24,
    activeEmployees: 20,
    avgPerformance: 87,
    growthRate: 12,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">{t('departments.totalEmployees')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalEmployees}</p>
          <p className="text-xs text-muted-foreground">{t('departments.inDepartment')}</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <UserCheck className="w-5 h-5" />
            <span className="text-sm font-medium">{t('departments.activeEmployees')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.activeEmployees}</p>
          <p className="text-xs text-muted-foreground">{t('departments.currentlyActive')}</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-violet-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">{t('departments.avgPerformance')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.avgPerformance}%</p>
          <p className="text-xs text-muted-foreground">{t('departments.performanceScore')}</p>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-600">
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">{t('departments.growthRate')}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">+{analytics.growthRate}%</p>
          <p className="text-xs text-muted-foreground">{t('departments.thisYear')}</p>
        </div>
      </div>


      {/* Department Access Codes */}
      <div className="border rounded-xl p-6 space-y-4 bg-muted/20">
        <h3 className={cn(
          "text-lg font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse text-right"
        )}>
          <Building2 className="w-5 h-5 text-primary" />
          {t('departments.accessCodes')}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {departmentCodes.map((code) => (
            <div key={code} className="flex flex-col items-center gap-2">
              <Checkbox
                id={`dept-${code}`}
                className="w-5 h-5"
                checked={checkedDepts.includes(code)}
                onCheckedChange={() => toggleDept(code)}
              />
              <Label htmlFor={`dept-${code}`} className="text-center text-sm font-medium">
                {code}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
        <Button onClick={handleSave} className="gap-2 px-8">
          <Save className="w-4 h-4" />
          {t('departments.save')}
        </Button>
      </div>
    </div>
  );
};
