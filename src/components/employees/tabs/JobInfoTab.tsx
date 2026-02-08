import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobInfoTabProps {
  employee: Employee;
}

export const JobInfoTab = ({ employee }: JobInfoTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.department')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.selectDepartment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">{t('dept.it')}</SelectItem>
              <SelectItem value="hr">{t('dept.hr')}</SelectItem>
              <SelectItem value="finance">{t('dept.finance')}</SelectItem>
              <SelectItem value="sales">{t('dept.sales')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.jobTitleAr')}</Label>
          <Input defaultValue={employee.jobTitleAr || employee.jobTitle} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.jobTitleEn')}</Label>
          <Input defaultValue={employee.jobTitleEn || 'Employee'} className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.jobDegree')} *</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.selectDegree')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.jobLevel')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.hireDate')}</Label>
          <Input type="date" defaultValue={employee.hireDate} className={cn(isRTL && "text-right")} />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.recruitedBy')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.employmentStatus')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('employees.status.active')}</SelectItem>
              <SelectItem value="resigned">{t('employees.status.resigned')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="resigned" />
          <Label htmlFor="resigned">{t('employees.fields.resigned')}</Label>
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.resignationDate')}</Label>
          <Input type="date" className={cn(isRTL && "text-right")} />
        </div>
      </div>

      {/* Add New Department Button */}
      <Button variant="outline" size="sm" className="gap-2">
        <Plus className="w-4 h-4" />
        {t('employees.addNewDepartment')}
      </Button>

      {/* Resignation Reason */}
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.resignationReason')}</Label>
        <Textarea className={cn("min-h-[100px]", isRTL && "text-right")} />
      </div>
    </div>
  );
};
