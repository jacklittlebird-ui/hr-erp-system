import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { useUniformData, UNIFORM_TYPES, getDepreciationPercent, getCurrentValue } from '@/contexts/UniformDataContext';
import { useReportExport } from '@/hooks/useReportExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Printer, Download, FileText, Shirt, Users, TrendingUp, Package } from 'lucide-react';
import { stationLocations } from '@/data/stationLocations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const UniformReport = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { employees } = useEmployeeData();
  const { uniforms } = useUniformData();
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();
  const [station, setStation] = useState('all');

  const filteredUniforms = useMemo(() => {
    if (station === 'all') return uniforms;
    return uniforms.filter(u => {
      const emp = employees.find(e => e.employeeId === u.employeeId);
      return emp?.stationLocation === station;
    });
  }, [uniforms, employees, station]);

  const totalItems = filteredUniforms.length;
  const totalQuantity = filteredUniforms.reduce((s, u) => s + u.quantity, 0);
  const totalOriginal = filteredUniforms.reduce((s, u) => s + u.totalPrice, 0);
  const totalCurrent = filteredUniforms.reduce((s, u) => s + getCurrentValue(u.totalPrice, u.deliveryDate), 0);
  const totalEmployees = new Set(filteredUniforms.map(u => u.employeeId)).size;

  const stats = [
    { label: ar ? 'إجمالي الأصناف' : 'Total Items', value: totalQuantity, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: ar ? 'عدد الموظفين' : 'Employees', value: totalEmployees, icon: Users, color: 'text-success', bg: 'bg-success/10' },
    { label: ar ? 'القيمة الأصلية' : 'Original Value', value: `${totalOriginal.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: ar ? 'القيمة الحالية' : 'Current Value', value: `${totalCurrent.toLocaleString()}`, icon: Shirt, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // By type chart
  const typeData = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; value: number }> = {};
    filteredUniforms.forEach(u => {
      const key = ar ? u.typeAr : u.typeEn;
      if (!map[key]) map[key] = { name: key, quantity: 0, value: 0 };
      map[key].quantity += u.quantity;
      map[key].value += u.totalPrice;
    });
    return Object.values(map);
  }, [filteredUniforms, ar]);

  // By employee
  const employeeData = useMemo(() => {
    const map: Record<string, { empId: string; name: string; station: string; dept: string; items: number; original: number; current: number; depreciation: number }> = {};
    filteredUniforms.forEach(u => {
      const emp = employees.find(e => e.employeeId === u.employeeId);
      if (!map[u.employeeId]) {
        const st = emp?.stationLocation || '';
        const stLabel = stationLocations.find(s => s.value === st);
        map[u.employeeId] = {
          empId: u.employeeId,
          name: emp ? (ar ? emp.nameAr : emp.nameEn) : u.employeeId,
          station: stLabel ? (ar ? stLabel.labelAr : stLabel.labelEn) : st || '-',
          dept: emp?.department || '-',
          items: 0, original: 0, current: 0, depreciation: 0,
        };
      }
      map[u.employeeId].items += u.quantity;
      map[u.employeeId].original += u.totalPrice;
      const cv = getCurrentValue(u.totalPrice, u.deliveryDate);
      map[u.employeeId].current += cv;
      map[u.employeeId].depreciation += (u.totalPrice - cv);
    });
    return Object.values(map);
  }, [filteredUniforms, employees, ar]);

  // Depreciation distribution
  const depreciationData = useMemo(() => {
    const ranges = [
      { label: '100%', count: 0 },
      { label: '75%', count: 0 },
      { label: '50%', count: 0 },
      { label: '25%', count: 0 },
      { label: '0%', count: 0 },
    ];
    filteredUniforms.forEach(u => {
      const pct = getDepreciationPercent(u.deliveryDate);
      const idx = pct === 100 ? 0 : pct === 75 ? 1 : pct === 50 ? 2 : pct === 25 ? 3 : 4;
      ranges[idx].count++;
    });
    return ranges.filter(r => r.count > 0);
  }, [filteredUniforms]);

  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const reportTitle = ar ? 'تقرير اليونيفورم الشامل' : 'Comprehensive Uniform Report';

  const getExportData = () => employeeData.map(e => ({
    ...e,
    original: e.original.toLocaleString(),
    current: e.current.toLocaleString(),
    depreciation: e.depreciation.toLocaleString(),
  }));

  const getExportColumns = () => [
    { header: ar ? 'كود الموظف' : 'Employee ID', key: 'empId' },
    { header: ar ? 'الاسم' : 'Name', key: 'name' },
    { header: ar ? 'المحطة' : 'Station', key: 'station' },
    { header: ar ? 'القسم' : 'Department', key: 'dept' },
    { header: ar ? 'عدد الأصناف' : 'Items', key: 'items' },
    { header: ar ? 'القيمة الأصلية' : 'Original', key: 'original' },
    { header: ar ? 'القيمة الحالية' : 'Current', key: 'current' },
    { header: ar ? 'الإهلاك' : 'Depreciation', key: 'depreciation' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger className="w-44"><SelectValue placeholder={ar ? 'المحطة' : 'Station'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => (
                    <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={() => handlePrint(reportTitle)}>
                <Printer className="w-4 h-4 mr-2" />{ar ? 'طباعة' : 'Print'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <Download className="w-4 h-4 mr-2" />PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <FileText className="w-4 h-4 mr-2" />CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
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
            <CardHeader><CardTitle>{ar ? 'التوزيع حسب النوع' : 'Distribution by Type'}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" name={ar ? 'الكمية' : 'Quantity'} fill="#3b82f6" />
                    <Bar dataKey="value" name={ar ? 'القيمة' : 'Value'} fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{ar ? 'توزيع الإهلاك' : 'Depreciation Distribution'}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={depreciationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count"
                      label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}>
                      {depreciationData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>{ar ? 'تفاصيل اليونيفورم حسب الموظف' : 'Uniform Details by Employee'}</CardTitle></CardHeader>
          <CardContent>
            {employeeData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {ar ? 'لا توجد بيانات يونيفورم' : 'No uniform data available'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar ? 'كود الموظف' : 'Employee ID'}</TableHead>
                    <TableHead>{ar ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead>{ar ? 'المحطة' : 'Station'}</TableHead>
                    <TableHead>{ar ? 'القسم' : 'Department'}</TableHead>
                    <TableHead>{ar ? 'عدد الأصناف' : 'Items'}</TableHead>
                    <TableHead>{ar ? 'القيمة الأصلية' : 'Original'}</TableHead>
                    <TableHead>{ar ? 'القيمة الحالية' : 'Current'}</TableHead>
                    <TableHead>{ar ? 'الإهلاك' : 'Depreciation'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeData.map(e => (
                    <TableRow key={e.empId}>
                      <TableCell>{e.empId}</TableCell>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.station}</TableCell>
                      <TableCell>{e.dept}</TableCell>
                      <TableCell>{e.items}</TableCell>
                      <TableCell>{e.original.toLocaleString()}</TableCell>
                      <TableCell>{e.current.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={e.depreciation > 0 ? 'destructive' : 'secondary'}>
                          {e.depreciation.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={4}>{ar ? 'الإجمالي' : 'Total'}</TableCell>
                    <TableCell>{employeeData.reduce((s, e) => s + e.items, 0)}</TableCell>
                    <TableCell>{totalOriginal.toLocaleString()}</TableCell>
                    <TableCell>{totalCurrent.toLocaleString()}</TableCell>
                    <TableCell>{(totalOriginal - totalCurrent).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
