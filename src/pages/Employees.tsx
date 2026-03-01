import { useMemo, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeStatsCards } from '@/components/employees/EmployeeStatsCards';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Download, Upload, Printer, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog';
import { useReportExport } from '@/hooks/useReportExport';
import { stationLocations } from '@/data/stationLocations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';

const Employees = () => {
  const { t, isRTL } = useLanguage();
  const { employees, refreshEmployees } = useEmployeeData();
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const ar = isRTL;

  const getStationLabel = (val?: string) => {
    if (!val) return '-';
    const s = stationLocations.find(s => s.value === val);
    return s ? (ar ? s.labelAr : s.labelEn) : val;
  };

  // Full export columns with all employee data
  const exportColumns = [
    { header: ar ? 'كود الموظف' : 'Employee ID', key: 'employeeId' },
    { header: ar ? 'الاسم (عربي)' : 'Name (AR)', key: 'nameAr' },
    { header: ar ? 'الاسم (انجليزي)' : 'Name (EN)', key: 'nameEn' },
    { header: ar ? 'الاسم الأول' : 'First Name', key: 'firstName' },
    { header: ar ? 'اسم الأب' : 'Father Name', key: 'fatherName' },
    { header: ar ? 'اسم العائلة' : 'Family Name', key: 'familyName' },
    { header: ar ? 'المحطة' : 'Station', key: 'station' },
    { header: ar ? 'القسم' : 'Department', key: 'department' },
    { header: ar ? 'الوظيفة' : 'Job Title', key: 'jobTitle' },
    { header: ar ? 'الهاتف' : 'Phone', key: 'phone' },
    { header: ar ? 'البريد الإلكتروني' : 'Email', key: 'email' },
    { header: ar ? 'هاتف المنزل' : 'Home Phone', key: 'homePhone' },
    { header: ar ? 'الرقم القومي' : 'National ID', key: 'nationalId' },
    { header: ar ? 'تاريخ الميلاد' : 'Birth Date', key: 'birthDate' },
    { header: ar ? 'محل الميلاد' : 'Birth Place', key: 'birthPlace' },
    { header: ar ? 'الجنس' : 'Gender', key: 'gender' },
    { header: ar ? 'الديانة' : 'Religion', key: 'religion' },
    { header: ar ? 'الجنسية' : 'Nationality', key: 'nationality' },
    { header: ar ? 'الحالة الاجتماعية' : 'Marital Status', key: 'maritalStatus' },
    { header: ar ? 'عدد الأطفال' : 'Children', key: 'childrenCount' },
    { header: ar ? 'المؤهل' : 'Education', key: 'educationAr' },
    { header: ar ? 'سنة التخرج' : 'Graduation Year', key: 'graduationYear' },
    { header: ar ? 'العنوان' : 'Address', key: 'address' },
    { header: ar ? 'المدينة' : 'City', key: 'city' },
    { header: ar ? 'المحافظة' : 'Governorate', key: 'governorate' },
    { header: ar ? 'الموقف من التجنيد' : 'Military Status', key: 'militaryStatus' },
    { header: ar ? 'نوع العقد' : 'Contract Type', key: 'contractType' },
    { header: ar ? 'تاريخ التعيين' : 'Hire Date', key: 'hireDate' },
    { header: ar ? 'الراتب الأساسي' : 'Basic Salary', key: 'basicSalary' },
    { header: ar ? 'رقم التأمين الاجتماعي' : 'Social Insurance No', key: 'socialInsuranceNo' },
    { header: ar ? 'رقم بطاقة التأمين الصحي' : 'Health Insurance Card', key: 'healthInsuranceCardNo' },
    { header: ar ? 'اسم البنك' : 'Bank Name', key: 'bankName' },
    { header: ar ? 'رقم الحساب البنكي' : 'Bank Account', key: 'bankAccountNumber' },
    { header: ar ? 'الحالة' : 'Status', key: 'status' },
    { header: ar ? 'ملاحظات' : 'Notes', key: 'notes' },
  ];

  const getExportData = () => filteredEmployees.map(e => ({
    employeeId: e.employeeId,
    nameAr: e.nameAr,
    nameEn: e.nameEn,
    firstName: e.firstName || '-',
    fatherName: e.fatherName || '-',
    familyName: e.familyName || '-',
    station: getStationLabel(e.stationLocation),
    department: e.department,
    jobTitle: e.jobTitle,
    phone: e.phone || '-',
    email: e.email || '-',
    homePhone: e.homePhone || '-',
    nationalId: e.nationalId || '-',
    birthDate: e.birthDate || '-',
    birthPlace: e.birthPlace || '-',
    gender: e.gender || '-',
    religion: e.religion || '-',
    nationality: e.nationality || '-',
    maritalStatus: e.maritalStatus || '-',
    childrenCount: e.childrenCount ?? '-',
    educationAr: e.educationAr || '-',
    graduationYear: e.graduationYear || '-',
    address: e.address || '-',
    city: e.city || '-',
    governorate: e.governorate || '-',
    militaryStatus: e.militaryStatus || '-',
    contractType: e.contractType || '-',
    hireDate: e.hireDate || '-',
    basicSalary: e.basicSalary ?? '-',
    socialInsuranceNo: e.socialInsuranceNo || '-',
    healthInsuranceCardNo: e.healthInsuranceCardNo || '-',
    bankName: e.bankName || '-',
    bankAccountNumber: e.bankAccountNumber || '-',
    status: e.status === 'active' ? (ar ? 'نشط' : 'Active') : e.status === 'inactive' ? (ar ? 'غير نشط' : 'Inactive') : (ar ? 'موقوف' : 'Suspended'),
    notes: e.notes || '-',
  }));

  const reportTitle = ar ? 'تقرير الموظفين' : 'Employee Report';

  const counts = useMemo(() => ({
    all: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    suspended: employees.filter(e => e.status === 'suspended').length,
  }), [employees]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(d => d !== '-'));
    return depts.size;
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        emp.nameAr.includes(searchQuery) ||
        emp.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.includes(searchQuery) ||
        emp.jobTitle.includes(searchQuery);
      const matchesFilter = activeFilter === 'all' || emp.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [employees, searchQuery, activeFilter]);

  // Export all employees data to Excel/CSV
  const handleExportAll = () => {
    exportToCSV({ title: reportTitle, data: getExportData(), columns: exportColumns });
  };

  // Import from CSV
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        toast({ title: ar ? 'الملف فارغ أو غير صالح' : 'File is empty or invalid', variant: 'destructive' });
        return;
      }

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^\uFEFF/, '').trim().toLowerCase());

      // Map CSV header to DB column
      const headerMap: Record<string, string> = {
        'employee id': 'employee_code', 'كود الموظف': 'employee_code',
        'name (ar)': 'name_ar', 'الاسم (عربي)': 'name_ar',
        'name (en)': 'name_en', 'الاسم (انجليزي)': 'name_en',
        'first name': 'first_name', 'الاسم الأول': 'first_name',
        'father name': 'father_name', 'اسم الأب': 'father_name',
        'family name': 'family_name', 'اسم العائلة': 'family_name',
        'phone': 'phone', 'الهاتف': 'phone',
        'email': 'email', 'البريد الإلكتروني': 'email',
        'home phone': 'home_phone', 'هاتف المنزل': 'home_phone',
        'national id': 'national_id', 'الرقم القومي': 'national_id',
        'birth date': 'birth_date', 'تاريخ الميلاد': 'birth_date',
        'birth place': 'birth_place', 'محل الميلاد': 'birth_place',
        'gender': 'gender', 'الجنس': 'gender',
        'religion': 'religion', 'الديانة': 'religion',
        'nationality': 'nationality', 'الجنسية': 'nationality',
        'marital status': 'marital_status', 'الحالة الاجتماعية': 'marital_status',
        'children': 'children_count', 'عدد الأطفال': 'children_count',
        'education': 'education_ar', 'المؤهل': 'education_ar',
        'graduation year': 'graduation_year', 'سنة التخرج': 'graduation_year',
        'address': 'address', 'العنوان': 'address',
        'city': 'city', 'المدينة': 'city',
        'governorate': 'governorate', 'المحافظة': 'governorate',
        'military status': 'military_status', 'الموقف من التجنيد': 'military_status',
        'contract type': 'contract_type', 'نوع العقد': 'contract_type',
        'hire date': 'hire_date', 'تاريخ التعيين': 'hire_date',
        'basic salary': 'basic_salary', 'الراتب الأساسي': 'basic_salary',
        'social insurance no': 'social_insurance_no', 'رقم التأمين الاجتماعي': 'social_insurance_no',
        'health insurance card': 'health_insurance_card_no', 'رقم بطاقة التأمين الصحي': 'health_insurance_card_no',
        'bank name': 'bank_name', 'اسم البنك': 'bank_name',
        'bank account': 'bank_account_number', 'رقم الحساب البنكي': 'bank_account_number',
        'job title': 'job_title_ar', 'الوظيفة': 'job_title_ar',
        'notes': 'notes', 'ملاحظات': 'notes',
      };

      const dbColumns = headers.map(h => headerMap[h] || null);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const record: Record<string, any> = {};

        dbColumns.forEach((col, idx) => {
          if (col && values[idx] && values[idx] !== '-') {
            if (col === 'children_count') {
              const num = parseInt(values[idx]);
              if (!isNaN(num)) record[col] = num;
            } else if (col === 'basic_salary') {
              const num = parseFloat(values[idx]);
              if (!isNaN(num)) record[col] = num;
            } else {
              record[col] = values[idx];
            }
          }
        });

        // Skip rows without required fields
        if (!record.employee_code || !record.name_ar || !record.name_en) {
          errorCount++;
          continue;
        }

        const { error } = await (supabase.from('employees') as any).upsert(
          record,
          { onConflict: 'employee_code' }
        );

        if (error) {
          console.error('Import error for row', i, error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      toast({
        title: ar
          ? `تم استيراد ${successCount} موظف بنجاح${errorCount > 0 ? ` (${errorCount} أخطاء)` : ''}`
          : `Imported ${successCount} employees successfully${errorCount > 0 ? ` (${errorCount} errors)` : ''}`,
      });

      await refreshEmployees();
    } catch (err) {
      console.error('Import failed:', err);
      toast({ title: ar ? 'فشل الاستيراد' : 'Import failed', variant: 'destructive' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-primary rounded-xl p-6">
          <div className={cn("flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center", isRTL && "sm:flex-row-reverse")}>
            <h1 className="text-2xl font-bold text-primary-foreground">{t('employees.title')}</h1>
            <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => refreshEmployees()}><RefreshCw className="w-4 h-4" />{t('employees.refresh')}</Button>
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => handlePrint(reportTitle)}><Printer className="w-4 h-4" />{ar ? 'طباعة' : 'Print'}</Button>
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => exportToPDF({ title: reportTitle, data: getExportData(), columns: exportColumns })}><Download className="w-4 h-4" />PDF</Button>
              <Button variant="secondary" size="sm" className="gap-2" onClick={handleExportAll}><FileText className="w-4 h-4" />CSV</Button>
              <Button variant="secondary" size="sm" className="gap-2" onClick={handleImportClick} disabled={importing}>
                <Upload className="w-4 h-4" />{importing ? (ar ? 'جاري الاستيراد...' : 'Importing...') : t('employees.importExcel')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button size="sm" className="gap-2 bg-success hover:bg-success/90 text-success-foreground" onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4" />{t('employees.addEmployee')}</Button>
            </div>
          </div>
        </div>
        <EmployeeStatsCards total={counts.all} active={counts.active} departments={departments} newThisMonth={1} />
        <EmployeeFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />
        <div ref={reportRef}>
          <EmployeeTable employees={filteredEmployees} />
        </div>
      </div>
      <AddEmployeeDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </DashboardLayout>
  );
};

export default Employees;
