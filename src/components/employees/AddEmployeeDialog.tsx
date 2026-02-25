import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { Employee } from '@/types/employee';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { X, User, Phone, CreditCard, Briefcase, Shield, FileCheck, Award, Building2, MoreHorizontal, Calendar, Wallet, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { ContactInfoTab } from './tabs/ContactInfoTab';
import { IdentityTab } from './tabs/IdentityTab';
import { JobInfoTab } from './tabs/JobInfoTab';
import { InsuranceTab } from './tabs/InsuranceTab';
import { PermitsTab } from './tabs/PermitsTab';
import { CertificatesTab } from './tabs/CertificatesTab';
import { DepartmentsTab } from './tabs/DepartmentsTab';
import { OtherTab } from './tabs/OtherTab';
import { LeaveBalanceTab } from './tabs/LeaveBalanceTab';
import { SalaryTab } from './tabs/SalaryTab';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'basic', icon: User, labelKey: 'employees.tabs.basicInfo' },
  { id: 'contact', icon: Phone, labelKey: 'employees.tabs.contactInfo' },
  { id: 'identity', icon: CreditCard, labelKey: 'employees.tabs.identity' },
  { id: 'job', icon: Briefcase, labelKey: 'employees.tabs.jobInfo' },
  { id: 'insurance', icon: Shield, labelKey: 'employees.tabs.insurance' },
  { id: 'permits', icon: FileCheck, labelKey: 'employees.tabs.permits' },
  { id: 'certificates', icon: Award, labelKey: 'employees.tabs.certificates' },
  { id: 'departments', icon: Building2, labelKey: 'employees.tabs.departments' },
  { id: 'other', icon: MoreHorizontal, labelKey: 'employees.tabs.other' },
  { id: 'leave', icon: Calendar, labelKey: 'employees.tabs.leaveBalance' },
  { id: 'salary', icon: Wallet, labelKey: 'employees.tabs.salary' },
];

const emptyEmployee: Employee = {
  id: '',
  employeeId: '',
  nameAr: '',
  nameEn: '',
  department: '',
  jobTitle: '',
  phone: '',
  status: 'active',
};

export const AddEmployeeDialog = ({ open, onClose }: AddEmployeeDialogProps) => {
  const { t, isRTL } = useLanguage();
  const ar = isRTL;
  const { refreshEmployees } = useEmployeeData();
  const [saving, setSaving] = useState(false);
  const updatesRef = useRef<Partial<Employee>>({});
  const [employee, setEmployee] = useState<Employee>({ ...emptyEmployee });

  const handleUpdate = useCallback((updates: Partial<Employee>) => {
    updatesRef.current = { ...updatesRef.current, ...updates };
    setEmployee(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = async () => {
    const data = { ...emptyEmployee, ...updatesRef.current };

    if (!data.employeeId?.trim() || !data.nameAr?.trim() || !data.nameEn?.trim()) {
      toast.error(ar ? 'يرجى ملء الحقول المطلوبة: كود الموظف، الاسم بالعربية، الاسم بالإنجليزية' : 'Please fill required fields: Employee Code, Arabic Name, English Name');
      return;
    }

    setSaving(true);
    try {
      const row: Record<string, any> = {
        employee_code: data.employeeId.trim(),
        name_ar: data.nameAr.trim(),
        name_en: data.nameEn.trim(),
        phone: data.phone?.trim() || '',
        email: data.email?.trim() || '',
        job_title_ar: data.jobTitleAr || data.jobTitle || '',
        job_title_en: data.jobTitleEn || '',
        status: data.status || 'active',
        birth_date: data.birthDate || null,
        birth_place: data.birthPlace || null,
        gender: data.gender || null,
        religion: data.religion || null,
        nationality: data.nationality || null,
        marital_status: data.maritalStatus || null,
        children_count: data.childrenCount ?? 0,
        education_ar: data.educationAr || null,
        graduation_year: data.graduationYear || null,
        address: data.address || null,
        city: data.city || null,
        governorate: data.governorate || null,
        national_id: data.nationalId || null,
        id_issue_date: data.idIssueDate || null,
        id_expiry_date: data.idExpiryDate || null,
        issuing_authority: data.issuingAuthority || null,
        military_status: data.militaryStatus || null,
        department_id: data.departmentId || null,
        job_degree: data.jobDegree || null,
        job_level: data.jobLevel || null,
        hire_date: data.hireDate || null,
        employment_status: data.employmentStatus || 'active',
        resignation_date: data.resignationDate || null,
        resignation_reason: data.resignationReason || null,
        social_insurance_no: data.socialInsuranceNo || null,
        social_insurance_start_date: data.socialInsuranceStartDate || null,
        social_insurance_end_date: data.socialInsuranceEndDate || null,
        health_insurance_card_no: data.healthInsuranceCardNo || null,
        has_health_insurance: data.hasHealthInsurance ?? false,
        has_social_insurance: data.hasSocialInsurance ?? false,
        contract_type: data.contractType || null,
        basic_salary: data.basicSalary ?? 0,
        annual_leave_balance: data.annualLeaveBalance ?? 21,
        sick_leave_balance: data.sickLeaveBalance ?? 7,
        bank_account_number: data.bankAccountNumber || null,
        bank_id_number: data.bankIdNumber || null,
        bank_account_type: data.bankAccountType || null,
        bank_name: data.bankName || null,
        notes: data.notes || null,
      };

      const { error } = await supabase.from('employees').insert(row as any);
      if (error) throw error;

      toast.success(ar ? 'تم إضافة الموظف بنجاح' : 'Employee added successfully');
      await refreshEmployees();
      // Reset
      updatesRef.current = {};
      setEmployee({ ...emptyEmployee });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || (ar ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    updatesRef.current = {};
    setEmployee({ ...emptyEmployee });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-primary-foreground hover:bg-primary-foreground/20">
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-primary-foreground">
            {ar ? 'إضافة موظف جديد' : 'Add New Employee'}
          </h2>
        </div>

        {/* Content */}
        <Tabs defaultValue="basic" className="flex flex-col h-[calc(90vh-60px)]" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Tabs Navigation */}
          <div className="border-b bg-background">
            <ScrollArea className="w-full">
              <TabsList className={cn(
                "inline-flex h-12 items-center justify-start bg-transparent p-0 w-max",
                isRTL && "flex-row-reverse"
              )}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent rounded-none",
                        "data-[state=active]:text-primary data-[state=active]:border-primary",
                        "hover:text-foreground transition-colors",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="whitespace-nowrap">{t(tab.labelKey)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-auto">
            <TabsContent value="basic" className="mt-0 h-full">
              <BasicInfoTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="contact" className="mt-0 h-full">
              <ContactInfoTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="identity" className="mt-0 h-full">
              <IdentityTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="job" className="mt-0 h-full">
              <JobInfoTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="insurance" className="mt-0 h-full">
              <InsuranceTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="permits" className="mt-0 h-full">
              <PermitsTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="certificates" className="mt-0 h-full">
              <CertificatesTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="departments" className="mt-0 h-full">
              <DepartmentsTab employee={employee} />
            </TabsContent>
            <TabsContent value="other" className="mt-0 h-full">
              <OtherTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
            <TabsContent value="leave" className="mt-0 h-full">
              <LeaveBalanceTab employee={employee} />
            </TabsContent>
            <TabsContent value="salary" className="mt-0 h-full">
              <SalaryTab employee={employee} onUpdate={handleUpdate} />
            </TabsContent>
          </div>

          {/* Footer */}
          <div className={cn(
            "border-t bg-muted/30 px-6 py-4 flex gap-3",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            <Button className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? (ar ? 'جاري الحفظ...' : 'Saving...') : (ar ? 'حفظ' : 'Save')}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              {ar ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
