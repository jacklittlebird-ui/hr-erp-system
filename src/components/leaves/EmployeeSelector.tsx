import { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface MinimalEmployee {
  id: string;
  employee_code: string;
  name_ar: string;
  name_en: string;
  department_name: string;
  status: string;
}

interface EmployeeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const EmployeeSelector = ({ value, onChange, label }: EmployeeSelectorProps) => {
  const { t, isRTL, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<MinimalEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('id, employee_code, name_ar, name_en, status, departments(name_ar)')
        .eq('status', 'active')
        .order('employee_code', { ascending: true });

      if (!error && data) {
        setEmployees(data.map((row: any) => ({
          id: row.id,
          employee_code: row.employee_code,
          name_ar: row.name_ar,
          name_en: row.name_en,
          department_name: row.departments?.name_ar || '-',
          status: row.status,
        })));
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const selectedEmployee = employees.find(e => e.employee_code === value);

  return (
    <div className="space-y-2">
      <Label className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
        <User className="w-4 h-4 text-primary" />
        {label || t('leaves.newRequest.employee')}
        <span className="text-destructive">*</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", isRTL && "flex-row-reverse")}
          >
            {selectedEmployee
              ? `${language === 'ar' ? selectedEmployee.name_ar : selectedEmployee.name_en} (${selectedEmployee.employee_code})`
              : loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : t('leaves.newRequest.selectEmployee')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-popover z-50" align="start">
          <Command shouldFilter={true}>
            <CommandInput placeholder={language === 'ar' ? 'ابحث بالاسم أو الرقم الوظيفي...' : 'Search by name or employee code...'} />
            <CommandList className="max-h-[300px] overflow-y-auto">
              <CommandEmpty>{t('leaves.newRequest.noEmployeeFound')}</CommandEmpty>
              <CommandGroup>
                {employees.map((emp) => (
                  <CommandItem
                    key={emp.employee_code}
                    value={`${emp.name_ar} ${emp.name_en} ${emp.employee_code}`}
                    onSelect={() => {
                      onChange(emp.employee_code);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4 shrink-0", value === emp.employee_code ? "opacity-100" : "opacity-0")}
                    />
                    <div className={cn("flex flex-col min-w-0", isRTL && "items-end")}>
                      <span className="font-medium truncate">
                        {language === 'ar' ? emp.name_ar : emp.name_en}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {emp.employee_code} - {emp.department_name}
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
  );
};
