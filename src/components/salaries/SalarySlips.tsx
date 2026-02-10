import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalaryData, calcGross } from '@/contexts/SalaryDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Search, Download, Printer, Eye } from 'lucide-react';
import { mockEmployees } from '@/data/mockEmployees';
import { stationLocations } from '@/data/stationLocations';

export const SalarySlips = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getSalaryRecord } = useSalaryData();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedSlipEmpId, setSelectedSlipEmpId] = useState<string | null>(null);

  const months = [
    { value: '01', label: ar ? 'يناير' : 'January' }, { value: '02', label: ar ? 'فبراير' : 'February' },
    { value: '03', label: ar ? 'مارس' : 'March' }, { value: '04', label: ar ? 'أبريل' : 'April' },
    { value: '05', label: ar ? 'مايو' : 'May' }, { value: '06', label: ar ? 'يونيو' : 'June' },
    { value: '07', label: ar ? 'يوليو' : 'July' }, { value: '08', label: ar ? 'أغسطس' : 'August' },
    { value: '09', label: ar ? 'سبتمبر' : 'September' }, { value: '10', label: ar ? 'أكتوبر' : 'October' },
    { value: '11', label: ar ? 'نوفمبر' : 'November' }, { value: '12', label: ar ? 'ديسمبر' : 'December' },
  ];

  const activeEmployees = mockEmployees.filter(e => e.status === 'active');

  const slips = useMemo(() => {
    return activeEmployees
      .filter(emp => {
        const nameMatch = emp.nameAr.includes(search) || emp.nameEn.toLowerCase().includes(search.toLowerCase()) || emp.employeeId.toLowerCase().includes(search.toLowerCase());
        const stationMatch = selectedStation === 'all' || emp.stationLocation === selectedStation;
        return nameMatch && stationMatch;
      })
      .map(emp => {
        const record = getSalaryRecord(emp.employeeId, selectedYear);
        if (!record) return null;
        const gross = calcGross(record);
        const totalDeductions = record.employeeInsurance;
        const net = gross - totalDeductions;
        return {
          employeeId: emp.employeeId,
          employeeName: ar ? emp.nameAr : emp.nameEn,
          department: emp.department,
          month: selectedMonth,
          year: selectedYear,
          basicSalary: record.basicSalary,
          transportAllowance: record.transportAllowance,
          incentives: record.incentives,
          livingAllowance: record.livingAllowance,
          stationAllowance: record.stationAllowance,
          mobileAllowance: record.mobileAllowance,
          employeeInsurance: record.employeeInsurance,
          gross,
          totalDeductions,
          netSalary: net,
        };
      })
      .filter(Boolean) as any[];
  }, [activeEmployees, search, selectedStation, selectedYear, selectedMonth, getSalaryRecord, ar]);

  const selectedSlip = selectedSlipEmpId ? slips.find(s => s.employeeId === selectedSlipEmpId) : null;
  const monthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center", isRTL && "flex-row-reverse")}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={ar ? 'بحث عن موظف...' : 'Search employee...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(isRTL ? "pr-10 text-right" : "pl-10")}
              />
            </div>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={ar ? 'المحطة/الموقع' : 'Station'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                {stationLocations.map(s => (
                  <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => String(2025 + i)).map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />
              {ar ? 'طباعة الكل' : 'Print All'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              {ar ? 'تصدير الكل' : 'Export All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slips Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(isRTL && "text-right")}>
            {ar ? `قسائم الرواتب - ${monthLabel} ${selectedYear}` : `Salary Slips - ${monthLabel} ${selectedYear}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'كود الموظف' : 'Employee ID'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الموظف' : 'Employee'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'القسم' : 'Department'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الشهر' : 'Month'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الراتب الأساسي' : 'Basic Salary'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إجمالي الراتب' : 'Gross Salary'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'صافي الراتب' : 'Net Salary'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slips.map(slip => (
                <TableRow key={slip.employeeId}>
                  <TableCell className={cn(isRTL && "text-right")}>{slip.employeeId}</TableCell>
                  <TableCell className={cn("font-medium", isRTL && "text-right")}>{slip.employeeName}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{slip.department}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{monthLabel} {slip.year}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{slip.basicSalary.toLocaleString()}</TableCell>
                  <TableCell className={cn("text-green-600", isRTL && "text-right")}>{slip.gross.toLocaleString()}</TableCell>
                  <TableCell className={cn("text-destructive", isRTL && "text-right")}>{slip.totalDeductions.toLocaleString()}</TableCell>
                  <TableCell className={cn("font-bold", isRTL && "text-right")}>{slip.netSalary.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedSlipEmpId(slip.employeeId)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost"><Printer className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {slips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {ar ? 'لا توجد بيانات رواتب لهذه الفترة' : 'No salary data for this period'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Slip Detail Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlipEmpId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={cn(isRTL && "text-right")}>{ar ? 'تفاصيل القسيمة' : 'Slip Detail'}</DialogTitle>
          </DialogHeader>
          {selectedSlip && (
            <div className="space-y-4">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="font-bold text-lg">{selectedSlip.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSlip.department} - {selectedSlip.employeeId}</p>
                </div>
                <p className="text-sm text-muted-foreground">{monthLabel} {selectedSlip.year}</p>
              </div>

              <Separator />

              <div>
                <h4 className={cn("font-semibold text-green-600 mb-2", isRTL && "text-right")}>{ar ? 'المستحقات' : 'Earnings'}</h4>
                <div className="space-y-1 text-sm">
                  {[
                    { label: ar ? 'الراتب الأساسي' : 'Basic Salary', value: selectedSlip.basicSalary },
                    { label: ar ? 'بدل المواصلات' : 'Transport', value: selectedSlip.transportAllowance },
                    { label: ar ? 'الحوافز' : 'Incentives', value: selectedSlip.incentives },
                    { label: ar ? 'بدل المعيشة' : 'Living', value: selectedSlip.livingAllowance },
                    { label: ar ? 'بدل سكن المحطة' : 'Station', value: selectedSlip.stationAllowance },
                    { label: ar ? 'بدل الجوال' : 'Mobile', value: selectedSlip.mobileAllowance },
                  ].filter(item => item.value > 0).map((item, i) => (
                    <div key={i} className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                      <span>{item.label}</span>
                      <span className="text-green-600">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className={cn("font-semibold text-destructive mb-2", isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</h4>
                <div className="space-y-1 text-sm">
                  <div className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                    <span>{ar ? 'التأمينات الاجتماعية' : 'Social Insurance'}</span>
                    <span className="text-destructive">{selectedSlip.employeeInsurance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className={cn("flex justify-between items-center text-lg font-bold", isRTL && "flex-row-reverse")}>
                <span>{ar ? 'صافي الراتب' : 'Net Salary'}</span>
                <span className="text-primary">{selectedSlip.netSalary.toLocaleString()}</span>
              </div>

              <div className={cn("flex gap-2 pt-2", isRTL && "flex-row-reverse")}>
                <Button variant="outline" className="flex-1 gap-2"><Printer className="w-4 h-4" />{ar ? 'طباعة' : 'Print'}</Button>
                <Button variant="outline" className="flex-1 gap-2"><Download className="w-4 h-4" />{ar ? 'تحميل' : 'Download'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
