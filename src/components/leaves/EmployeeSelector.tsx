import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockEmployees } from '@/data/mockEmployees';

interface EmployeeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const EmployeeSelector = ({ value, onChange, label }: EmployeeSelectorProps) => {
  const { t, isRTL, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const activeEmployees = useMemo(() => mockEmployees.filter(e => e.status === 'active'), []);

  const selectedEmployee = activeEmployees.find(e => e.employeeId === value);

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
              ? (language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn)
              : t('leaves.newRequest.selectEmployee')}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
          <Command>
            <CommandInput placeholder={t('leaves.newRequest.searchEmployee')} />
            <CommandList>
              <CommandEmpty>{t('leaves.newRequest.noEmployeeFound')}</CommandEmpty>
              <CommandGroup>
                {activeEmployees.map((emp) => (
                  <CommandItem
                    key={emp.employeeId}
                    value={`${emp.nameAr} ${emp.nameEn} ${emp.employeeId}`}
                    onSelect={() => {
                      onChange(emp.employeeId);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", value === emp.employeeId ? "opacity-100" : "opacity-0")}
                    />
                    <div className={cn("flex flex-col", isRTL && "items-end")}>
                      <span className="font-medium">
                        {language === 'ar' ? emp.nameAr : emp.nameEn}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {emp.employeeId} - {emp.department}
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
