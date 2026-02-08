import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Save, Building2, Users, UserCheck, TrendingUp, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockEmployees } from '@/data/mockEmployees';
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
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const [checkedDepts, setCheckedDepts] = useState<string[]>(employee.departmentAccess || []);

  const employees = useMemo(() => mockEmployees.filter(e => e.status === 'active'), []);

  const selectedManagerName = useMemo(() => {
    const emp = mockEmployees.find(e => e.id === selectedManager);
    return emp ? (isRTL ? emp.nameAr : emp.nameEn) : '';
  }, [selectedManager, isRTL]);

  const handleSave = () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم القسم بالعربي والإنجليزي' : 'Please enter department name in Arabic and English');
      return;
    }
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

      {/* Department Form */}
      <div className="border rounded-xl p-6 space-y-5 bg-muted/20">
        <h3 className={cn(
          "text-lg font-semibold flex items-center gap-2",
          isRTL && "flex-row-reverse text-right"
        )}>
          <Building2 className="w-5 h-5 text-primary" />
          {t('departments.departmentInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Arabic Name */}
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('departments.nameAr')}</Label>
            <Input
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder={isRTL ? 'أدخل اسم القسم بالعربي' : 'Enter department name in Arabic'}
              className={cn(isRTL && "text-right")}
            />
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('departments.nameEn')}</Label>
            <Input
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder={isRTL ? 'أدخل اسم القسم بالإنجليزي' : 'Enter department name in English'}
              className={cn(isRTL && "text-right")}
            />
          </div>

          {/* Manager - Searchable Dropdown */}
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{t('departments.manager')}</Label>
            <Popover open={managerOpen} onOpenChange={setManagerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={managerOpen}
                  className={cn(
                    "w-full justify-between font-normal h-10",
                    !selectedManager && "text-muted-foreground",
                    isRTL && "flex-row-reverse text-right"
                  )}
                >
                  {selectedManagerName || (isRTL ? 'اختر مدير القسم' : 'Select department manager')}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 z-50 bg-popover" align="start">
                <Command>
                  <CommandInput
                    placeholder={isRTL ? 'ابحث عن موظف...' : 'Search employee...'}
                    className={cn(isRTL && "text-right")}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isRTL ? 'لم يتم العثور على موظف' : 'No employee found'}
                    </CommandEmpty>
                    <CommandGroup>
                      {employees.map((emp) => (
                        <CommandItem
                          key={emp.id}
                          value={`${emp.nameAr} ${emp.nameEn}`}
                          onSelect={() => {
                            setSelectedManager(emp.id);
                            setManagerOpen(false);
                          }}
                          className={cn(isRTL && "flex-row-reverse text-right")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedManager === emp.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className={cn("flex flex-col", isRTL && "items-end")}>
                            <span className="font-medium">{isRTL ? emp.nameAr : emp.nameEn}</span>
                            <span className="text-xs text-muted-foreground">
                              {emp.employeeId} - {isRTL ? emp.nameEn : emp.nameAr}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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
