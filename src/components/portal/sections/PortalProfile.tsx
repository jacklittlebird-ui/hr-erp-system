import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Building2, Briefcase, Mail, Phone, MapPin, CreditCard, Calendar, FileText, Shield, GraduationCap } from 'lucide-react';

const employee = {
  nameAr: 'أحمد محمد علي', nameEn: 'Ahmed Mohamed Ali', id: 'EMP002',
  department: { ar: 'تقنية المعلومات', en: 'IT' },
  jobTitle: { ar: 'مطور برمجيات أول', en: 'Senior Software Developer' },
  manager: { ar: 'محمد أحمد', en: 'Mohamed Ahmed' },
  hireDate: '2023/01/15',
  email: 'ahmed.mohammed@company.com', phone: '+966 50 123 4567',
  address: { ar: 'الرياض، المملكة العربية السعودية', en: 'Riyadh, Saudi Arabia' },
  nationalId: '1234567890', iban: 'SA1234567890123456789012',
  emergencyPhone: '+966 50 987 6543',
  contractType: { ar: 'دوام كامل', en: 'Full-time' },
  contractStart: '2023/01/15', contractEnd: '2027/01/15',
  birthDate: '1990/05/20',
  nationality: { ar: 'مصري', en: 'Egyptian' },
  maritalStatus: { ar: 'متزوج', en: 'Married' },
  gender: { ar: 'ذكر', en: 'Male' },
  education: { ar: 'بكالوريوس هندسة حاسبات', en: 'BSc Computer Engineering' },
  insuranceNo: 'SI-98765', healthCardNo: 'HC-54321',
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

export const PortalProfile = () => {
  const { language, isRTL } = useLanguage();
  const l = (obj: { ar: string; en: string }) => language === 'ar' ? obj.ar : obj.en;

  return (
    <div className="space-y-6">
      <div className={cn(isRTL && "text-right")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</h1>
        <p className="text-muted-foreground">{language === 'ar' ? 'عرض وإدارة معلوماتك الشخصية' : 'View and manage your personal info'}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-2xl font-bold text-primary">
              {employee.nameAr[0]}
            </div>
            <div className={cn(isRTL && "text-right")}>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{l({ ar: employee.nameAr, en: employee.nameEn })}</h2>
                <Badge className="bg-success/10 text-success border-success">{language === 'ar' ? 'نشط' : 'Active'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{l(employee.jobTitle)}</p>
              <p className="text-sm text-muted-foreground">{l(employee.department)}</p>
              <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الرقم الوظيفي:' : 'ID:'} {employee.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><Building2 className="w-5 h-5" />{language === 'ar' ? 'معلومات الوظيفة' : 'Job Information'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Building2} label={language === 'ar' ? 'القسم' : 'Department'} value={l(employee.department)} />
            <InfoItem icon={Briefcase} label={language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'} value={l(employee.jobTitle)} />
            <InfoItem icon={User} label={language === 'ar' ? 'المدير' : 'Manager'} value={l(employee.manager)} />
            <InfoItem icon={Calendar} label={language === 'ar' ? 'تاريخ الالتحاق' : 'Hire Date'} value={employee.hireDate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><User className="w-5 h-5" />{language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Mail} label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={employee.email} />
            <InfoItem icon={Phone} label={language === 'ar' ? 'الهاتف المحمول' : 'Mobile'} value={employee.phone} />
            <InfoItem icon={MapPin} label={language === 'ar' ? 'العنوان' : 'Address'} value={l(employee.address)} />
            <InfoItem icon={CreditCard} label={language === 'ar' ? 'الرقم القومي' : 'National ID'} value={employee.nationalId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><CreditCard className="w-5 h-5" />{language === 'ar' ? 'المعلومات البنكية' : 'Bank Information'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={CreditCard} label={language === 'ar' ? 'رقم الحساب (IBAN)' : 'IBAN'} value={employee.iban} />
            <InfoItem icon={Phone} label={language === 'ar' ? 'رقم الطوارئ' : 'Emergency'} value={employee.emergencyPhone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><FileText className="w-5 h-5" />{language === 'ar' ? 'معلومات العقد' : 'Contract'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={FileText} label={language === 'ar' ? 'نوع العقد' : 'Type'} value={l(employee.contractType)} />
            <InfoItem icon={Calendar} label={language === 'ar' ? 'تاريخ البداية' : 'Start'} value={employee.contractStart} />
            <InfoItem icon={Calendar} label={language === 'ar' ? 'تاريخ الانتهاء' : 'End'} value={employee.contractEnd} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><Shield className="w-5 h-5" />{language === 'ar' ? 'معلومات إضافية' : 'Additional Info'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Calendar} label={language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'} value={employee.birthDate} />
            <InfoItem icon={User} label={language === 'ar' ? 'الجنسية' : 'Nationality'} value={l(employee.nationality)} />
            <InfoItem icon={User} label={language === 'ar' ? 'الحالة الاجتماعية' : 'Marital Status'} value={l(employee.maritalStatus)} />
            <InfoItem icon={User} label={language === 'ar' ? 'النوع' : 'Gender'} value={l(employee.gender)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4"><CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}><Shield className="w-5 h-5" />{language === 'ar' ? 'التأمينات' : 'Insurance'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Shield} label={language === 'ar' ? 'رقم التأمين الاجتماعي' : 'Social Insurance'} value={employee.insuranceNo} />
            <InfoItem icon={Shield} label={language === 'ar' ? 'رقم بطاقة التأمين الصحي' : 'Health Card'} value={employee.healthCardNo} />
            <InfoItem icon={GraduationCap} label={language === 'ar' ? 'المؤهل الدراسي' : 'Education'} value={l(employee.education)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
