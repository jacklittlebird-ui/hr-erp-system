import { useMemo, useState } from 'react';
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

type FilterStatus = 'all' | 'active' | 'inactive' | 'suspended';

const Employees = () => {
  const { t, isRTL } = useLanguage();
  const { employees, refreshEmployees } = useEmployeeData();
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const ar = isRTL;

  const getStationLabel = (val?: string) => {
    if (!val) return '-';
    const s = stationLocations.find(s => s.value === val);
    return s ? (ar ? s.labelAr : s.labelEn) : val;
  };

  const exportColumns = [
    { header: ar ? 'كود الموظف' : 'Employee ID', key: 'employeeId' },
    { header: ar ? 'الاسم (عربي)' : 'Name (AR)', key: 'nameAr' },
    { header: ar ? 'الاسم (انجليزي)' : 'Name (EN)', key: 'nameEn' },
    { header: ar ? 'المحطة' : 'Station', key: 'station' },
    { header: ar ? 'القسم' : 'Department', key: 'department' },
    { header: ar ? 'الوظيفة' : 'Job Title', key: 'jobTitle' },
    { header: ar ? 'الهاتف' : 'Phone', key: 'phone' },
    { header: ar ? 'الحالة' : 'Status', key: 'status' },
  ];

  const getExportData = () => filteredEmployees.map(e => ({
    employeeId: e.employeeId,
    nameAr: e.nameAr,
    nameEn: e.nameEn,
    station: getStationLabel(e.stationLocation),
    department: e.department,
    jobTitle: e.jobTitle,
    phone: e.phone || '-',
    status: e.status === 'active' ? (ar ? 'نشط' : 'Active') : e.status === 'inactive' ? (ar ? 'غير نشط' : 'Inactive') : (ar ? 'موقوف' : 'Suspended'),
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
              <Button variant="secondary" size="sm" className="gap-2" onClick={() => exportToCSV({ title: reportTitle, data: getExportData(), columns: exportColumns })}><FileText className="w-4 h-4" />CSV</Button>
              <Button variant="secondary" size="sm" className="gap-2"><Upload className="w-4 h-4" />{t('employees.importExcel')}</Button>
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
