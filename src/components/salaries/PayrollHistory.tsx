import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePayrollData } from '@/contexts/PayrollDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Download, Printer, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { stationLocations } from '@/data/stationLocations';
import { useReportExport } from '@/hooks/useReportExport';

export const PayrollHistory = () => {
  const { t, language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { payrollEntries } = usePayrollData();
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedStation, setSelectedStation] = useState('all');

  const yearEntries = useMemo(() =>
    payrollEntries.filter(e => e.year === selectedYear && (selectedStation === 'all' || e.stationLocation === selectedStation)),
    [payrollEntries, selectedYear, selectedStation]
  );

  const monthlyData = useMemo(() => {
    const monthNames = ar
      ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return monthNames.map((name, i) => {
      const m = String(i + 1).padStart(2, '0');
      const monthEntries = yearEntries.filter(e => e.month === m);
      return {
        month: name,
        basic: monthEntries.reduce((s, e) => s + e.basicSalary, 0),
        allowances: monthEntries.reduce((s, e) => s + e.transportAllowance + e.incentives + e.livingAllowance + e.stationAllowance + e.mobileAllowance + e.overtimePay, 0),
        deductions: monthEntries.reduce((s, e) => s + e.totalDeductions, 0),
        net: monthEntries.reduce((s, e) => s + e.netSalary, 0),
        count: monthEntries.length,
      };
    });
  }, [yearEntries, ar]);

  const totalNet = yearEntries.reduce((s, e) => s + e.netSalary, 0);
  const avgMonthly = monthlyData.filter(m => m.count > 0).length > 0 ? Math.round(totalNet / monthlyData.filter(m => m.count > 0).length) : 0;

  const stats = [
    { label: ar ? 'إجمالي المرتبات السنوي' : 'Annual Payroll', value: totalNet.toLocaleString(), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { label: ar ? 'متوسط الشهري' : 'Avg Monthly', value: avgMonthly.toLocaleString(), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: ar ? 'عدد الموظفين' : 'Employees', value: String(new Set(yearEntries.map(e => e.employeeId)).size), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: ar ? 'أشهر معالجة' : 'Months Processed', value: String(new Set(yearEntries.map(e => e.month)).size), icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  // Group by employee for table
  const employeeSummary = useMemo(() => {
    const map = new Map<string, { name: string; dept: string; station: string; months: Record<string, number>; total: number }>();
    yearEntries.forEach(e => {
      if (!map.has(e.employeeId)) map.set(e.employeeId, { name: ar ? e.employeeName : e.employeeNameEn, dept: e.department, station: e.stationLocation, months: {}, total: 0 });
      const emp = map.get(e.employeeId)!;
      emp.months[e.month] = e.netSalary;
      emp.total += e.netSalary;
    });
    return Array.from(map.entries()).filter(([_, v]) => v.name.includes(search) || v.dept.includes(search));
  }, [yearEntries, search, ar]);

  const reportTitle = ar ? 'سجل الرواتب' : 'Payroll History';
  const exportData = employeeSummary.map(([id, v]) => ({ employeeId: id, name: v.name, dept: v.dept, total: v.total }));
  const expCols = [
    { header: ar ? 'الكود' : 'ID', key: 'employeeId' },
    { header: ar ? 'الاسم' : 'Name', key: 'name' },
    { header: ar ? 'القسم' : 'Dept', key: 'dept' },
    { header: ar ? 'الإجمالي' : 'Total', key: 'total' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}><CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className={cn("p-3 rounded-lg", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
              <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className={cn(isRTL && "text-right")}>{ar ? 'اتجاه الرواتب' : 'Payroll Trend'}</CardTitle></CardHeader>
          <CardContent><div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData.filter(m => m.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                <Bar dataKey="basic" name={ar ? 'الأساسي' : 'Basic'} fill="hsl(var(--primary))" />
                <Bar dataKey="allowances" name={ar ? 'البدلات' : 'Allowances'} fill="#22c55e" />
                <Bar dataKey="deductions" name={ar ? 'الخصومات' : 'Deductions'} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className={cn(isRTL && "text-right")}>{ar ? 'صافي الرواتب' : 'Net Trend'}</CardTitle></CardHeader>
          <CardContent><div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData.filter(m => m.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Line type="monotone" dataKey="net" name={ar ? 'الصافي' : 'Net'} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className={cn("flex flex-wrap gap-4 justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle>{ar ? 'سجل الموظفين' : 'Employee History'}</CardTitle>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input placeholder={ar ? 'بحث...' : 'Search...'} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("w-48", isRTL ? "pr-10 text-right" : "pl-10")} />
              </div>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="w-44"><SelectValue placeholder={ar ? 'المحطة' : 'Station'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع المحطات' : 'All'}</SelectItem>
                  {stationLocations.map(s => <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: 11 }, (_, i) => String(2025 + i)).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handlePrint(reportTitle)}><Printer className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: reportTitle, data: exportData, columns: expCols })}><Download className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={reportRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'القسم' : 'Dept'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'المحطة' : 'Station'}</TableHead>
                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => {
                    const mn = ar ? ['ين','فب','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'][parseInt(m)-1] : ['J','F','M','A','M','J','J','A','S','O','N','D'][parseInt(m)-1];
                    return <TableHead key={m} className="text-center px-1">{mn}</TableHead>;
                  })}
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الإجمالي' : 'Total'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeSummary.map(([id, v]) => {
                  const st = stationLocations.find(s => s.value === v.station);
                  return (
                    <TableRow key={id}>
                      <TableCell className={cn("font-medium", isRTL && "text-right")}>{v.name}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{v.dept}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{st ? (ar ? st.labelAr : st.labelEn) : '-'}</TableCell>
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                        <TableCell key={m} className="text-center px-1 text-xs">{v.months[m] ? v.months[m].toLocaleString() : '-'}</TableCell>
                      ))}
                      <TableCell className={cn("font-bold", isRTL && "text-right")}>{v.total.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                {employeeSummary.length === 0 && (
                  <TableRow><TableCell colSpan={16} className="text-center text-muted-foreground py-8">{ar ? 'لا توجد بيانات' : 'No data'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
