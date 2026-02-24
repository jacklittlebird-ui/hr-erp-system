import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Users, UserPlus, UserMinus, Building2, Download, FileText, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useReportExport } from '@/hooks/useReportExport';
import { stationLocations } from '@/data/stationLocations';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';

export const EmployeeReports = () => {
  const { t, isRTL } = useLanguage();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { employees } = useEmployeeData();
  const [department, setDepartment] = useState('all');
  const [station, setStation] = useState('all');
  const [status, setStatus] = useState('all');
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(d => d && d !== '-'));
    return Array.from(depts);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDept = department === 'all' || emp.department === department;
      const matchesStation = station === 'all' || emp.stationLocation === station;
      const matchesStatus = status === 'all' || emp.status === status;
      return matchesDept && matchesStation && matchesStatus;
    });
  }, [employees, department, station, status]);

  const realStats = useMemo(() => [
    { label: t('reports.totalEmployees'), value: filteredEmployees.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('reports.newHires'), value: filteredEmployees.filter(e => e.status === 'active').length, icon: UserPlus, color: 'text-success', bg: 'bg-success/10' },
    { label: t('reports.terminated'), value: filteredEmployees.filter(e => e.status === 'inactive').length, icon: UserMinus, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: ar ? 'موقوف' : 'Suspended', value: filteredEmployees.filter(e => e.status === 'suspended').length, icon: Building2, color: 'text-warning', bg: 'bg-warning/10' },
  ], [filteredEmployees, t, ar]);

  const realDeptData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEmployees.forEach(e => { map[e.department] = (map[e.department] || 0) + 1; });
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [filteredEmployees]);

  const realStationData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredEmployees.forEach(e => {
      const st = e.stationLocation || (ar ? 'غير محدد' : 'Unassigned');
      const label = stationLocations.find(s => s.value === st);
      const key = label ? (ar ? label.labelAr : label.labelEn) : st;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredEmployees, ar]);

  const getEmployeeExportColumns = () => [
    { header: ar ? 'كود الموظف' : 'Employee ID', key: 'employeeId' },
    { header: ar ? 'الاسم' : 'Name', key: 'name' },
    { header: ar ? 'المحطة' : 'Station', key: 'station' },
    { header: ar ? 'القسم' : 'Department', key: 'department' },
    { header: ar ? 'الوظيفة' : 'Job Title', key: 'jobTitle' },
    { header: ar ? 'الحالة' : 'Status', key: 'status' },
  ];

  const getEmployeeExportData = () => filteredEmployees.map(e => ({
    employeeId: e.employeeId,
    name: ar ? e.nameAr : e.nameEn,
    station: (() => { const s = stationLocations.find(s => s.value === e.stationLocation); return s ? (ar ? s.labelAr : s.labelEn) : (e.stationLocation || '-'); })(),
    department: e.department,
    jobTitle: e.jobTitle,
    status: e.status === 'active' ? (ar ? 'نشط' : 'Active') : e.status === 'inactive' ? (ar ? 'غير نشط' : 'Inactive') : (ar ? 'موقوف' : 'Suspended'),
  }));

  const reportTitle = t('reports.tabs.employees');

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex flex-wrap gap-4", isRTL && "flex-row-reverse")}>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allDepartments')}</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger className="w-44"><SelectValue placeholder={ar ? 'المحطة/الموقع' : 'Station'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => (
                    <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="active">{ar ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="inactive">{ar ? 'غير نشط' : 'Inactive'}</SelectItem>
                  <SelectItem value="suspended">{ar ? 'موقوف' : 'Suspended'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={() => handlePrint(reportTitle)}>
                <Printer className="w-4 h-4 mr-2" />{t('reports.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: reportTitle, data: getEmployeeExportData(), columns: getEmployeeExportColumns() })}>
                <Download className="w-4 h-4 mr-2" />PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: reportTitle, data: getEmployeeExportData(), columns: getEmployeeExportColumns() })}>
                <FileText className="w-4 h-4 mr-2" />CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {realStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-3 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader><CardTitle>{t('reports.departmentDistribution')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={realDeptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {realDeptData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{ar ? 'التوزيع حسب المحطة' : 'Distribution by Station'}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={realStationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" name={ar ? 'الموظفين' : 'Employees'} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
