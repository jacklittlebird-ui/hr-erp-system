import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BasicInfoTabProps {
  employee: Employee;
}

export const BasicInfoTab = ({ employee }: BasicInfoTabProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="p-6 space-y-8">
      {/* Avatar Section */}
      <div className="bg-primary py-8 rounded-lg flex flex-col items-center justify-center">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary-foreground/20">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl">
              {employee.nameAr.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary" />
          </button>
        </div>
        <p className="mt-4 text-primary-foreground text-sm">
          {t('employees.clickToUpload')}
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Employee ID */}
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.employeeId')}</Label>
          <Input defaultValue={employee.employeeId} className={cn(isRTL && "text-right")} />
        </div>

        {/* Station/Location */}
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.stationLocation')} *</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cairo">القاهرة</SelectItem>
              <SelectItem value="alex">الإسكندرية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.enterStation')}</Label>
          <Input placeholder={t('employees.fields.enterStation')} className={cn(isRTL && "text-right")} />
        </div>
      </div>

      {/* Full Name Arabic */}
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.fullNameAr')}</Label>
        <Input defaultValue={employee.nameAr} className={cn(isRTL && "text-right")} />
      </div>

      {/* Full Name English */}
      <div className="space-y-2">
        <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.fullNameEn')}</Label>
        <Input defaultValue={employee.nameEn} className={cn(isRTL && "text-right")} />
      </div>

      {/* Personal Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.firstName')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.fatherName')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.familyName')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.birthDate')}</Label>
          <Input type="date" className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.birthPlace')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.birthGovernorate')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.gender')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('employees.gender.male')}</SelectItem>
              <SelectItem value="female">{t('employees.gender.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.religion')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="muslim">{t('employees.religion.muslim')}</SelectItem>
              <SelectItem value="christian">{t('employees.religion.christian')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.nationality')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.maritalStatus')}</Label>
          <Select>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('employees.select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">{t('employees.maritalStatus.single')}</SelectItem>
              <SelectItem value="married">{t('employees.maritalStatus.married')}</SelectItem>
              <SelectItem value="divorced">{t('employees.maritalStatus.divorced')}</SelectItem>
              <SelectItem value="widowed">{t('employees.maritalStatus.widowed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Education Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.childrenCount')}</Label>
          <Input type="number" className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.educationAr')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
        <div className="space-y-2">
          <Label className={cn(isRTL && "text-right block")}>{t('employees.fields.graduationYear')}</Label>
          <Input className={cn(isRTL && "text-right")} />
        </div>
      </div>
    </div>
  );
};
