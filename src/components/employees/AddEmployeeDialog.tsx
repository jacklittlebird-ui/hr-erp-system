import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddEmployeeDialog = ({ open, onClose }: AddEmployeeDialogProps) => {
  const { isRTL } = useLanguage();
  const { refreshEmployees } = useEmployeeData();
  const ar = isRTL;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeCode: '',
    nameAr: '',
    nameEn: '',
    phone: '',
    email: '',
    jobTitleAr: '',
    jobTitleEn: '',
    departmentId: '',
    stationId: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const [departments, setDepartments] = useState<{ id: string; name_ar: string; name_en: string }[]>([]);
  const [stations, setStations] = useState<{ id: string; name_ar: string; name_en: string; code: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadLookups = async () => {
    if (loaded) return;
    const [deptRes, stRes] = await Promise.all([
      supabase.from('departments').select('id, name_ar, name_en').eq('is_active', true).order('name_ar'),
      supabase.from('stations').select('id, name_ar, name_en, code').eq('is_active', true).order('name_ar'),
    ]);
    setDepartments(deptRes.data || []);
    setStations(stRes.data || []);
    setLoaded(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      loadLookups();
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeCode.trim() || !form.nameAr.trim() || !form.nameEn.trim()) {
      toast.error(ar ? 'يرجى ملء الحقول المطلوبة (كود الموظف، الاسم عربي، الاسم انجليزي)' : 'Please fill required fields (Employee Code, Arabic Name, English Name)');
      return;
    }

    setLoading(true);
    try {
      const row: Record<string, any> = {
        employee_code: form.employeeCode.trim(),
        name_ar: form.nameAr.trim(),
        name_en: form.nameEn.trim(),
        phone: form.phone.trim() || '',
        email: form.email.trim() || '',
        job_title_ar: form.jobTitleAr.trim() || '',
        job_title_en: form.jobTitleEn.trim() || '',
        status: form.status,
      };
      if (form.departmentId) row.department_id = form.departmentId;
      if (form.stationId) row.station_id = form.stationId;

      const { error } = await supabase.from('employees').insert(row as any);
      if (error) throw error;

      toast.success(ar ? 'تم إضافة الموظف بنجاح' : 'Employee added successfully');
      await refreshEmployees();
      setForm({ employeeCode: '', nameAr: '', nameEn: '', phone: '', email: '', jobTitleAr: '', jobTitleEn: '', departmentId: '', stationId: '', status: 'active' });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || (ar ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={ar ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{ar ? 'إضافة موظف جديد' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Employee Code */}
          <div className="space-y-2">
            <Label>{ar ? 'كود الموظف *' : 'Employee Code *'}</Label>
            <Input value={form.employeeCode} onChange={e => setForm(p => ({ ...p, employeeCode: e.target.value }))} placeholder={ar ? 'مثال: EMP001' : 'e.g. EMP001'} />
          </div>

          {/* Name AR */}
          <div className="space-y-2">
            <Label>{ar ? 'الاسم بالعربية *' : 'Arabic Name *'}</Label>
            <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} dir="rtl" />
          </div>

          {/* Name EN */}
          <div className="space-y-2">
            <Label>{ar ? 'الاسم بالإنجليزية *' : 'English Name *'}</Label>
            <Input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} dir="ltr" />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label>{ar ? 'الهاتف' : 'Phone'}</Label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} dir="ltr" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>{ar ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} dir="ltr" type="email" />
          </div>

          {/* Job Title AR */}
          <div className="space-y-2">
            <Label>{ar ? 'المسمى الوظيفي (عربي)' : 'Job Title (AR)'}</Label>
            <Input value={form.jobTitleAr} onChange={e => setForm(p => ({ ...p, jobTitleAr: e.target.value }))} dir="rtl" />
          </div>

          {/* Job Title EN */}
          <div className="space-y-2">
            <Label>{ar ? 'المسمى الوظيفي (إنجليزي)' : 'Job Title (EN)'}</Label>
            <Input value={form.jobTitleEn} onChange={e => setForm(p => ({ ...p, jobTitleEn: e.target.value }))} dir="ltr" />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label>{ar ? 'القسم' : 'Department'}</Label>
            <Select value={form.departmentId} onValueChange={v => setForm(p => ({ ...p, departmentId: v }))}>
              <SelectTrigger><SelectValue placeholder={ar ? 'اختر القسم' : 'Select department'} /></SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{ar ? d.name_ar : d.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Station */}
          <div className="space-y-2">
            <Label>{ar ? 'المحطة/الموقع' : 'Station/Location'}</Label>
            <Select value={form.stationId} onValueChange={v => setForm(p => ({ ...p, stationId: v }))}>
              <SelectTrigger><SelectValue placeholder={ar ? 'اختر المحطة' : 'Select station'} /></SelectTrigger>
              <SelectContent>
                {stations.map(s => (
                  <SelectItem key={s.id} value={s.id}>{ar ? s.name_ar : s.name_en} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{ar ? 'الحالة' : 'Status'}</Label>
            <Select value={form.status} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{ar ? 'نشط' : 'Active'}</SelectItem>
                <SelectItem value="inactive">{ar ? 'غير نشط' : 'Inactive'}</SelectItem>
                <SelectItem value="suspended">{ar ? 'موقوف' : 'Suspended'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className={cn("gap-2", ar && "flex-row-reverse")}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {ar ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-success hover:bg-success/90 text-success-foreground">
            {loading ? (ar ? 'جاري الحفظ...' : 'Saving...') : (ar ? 'حفظ' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
