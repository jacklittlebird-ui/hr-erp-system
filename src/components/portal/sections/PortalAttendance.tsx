import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAttendanceData, calculateWorkTime } from '@/contexts/AttendanceDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalAttendance = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeeMonthlyRecords, getMonthlyStats } = useAttendanceData();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const records = useMemo(() => getEmployeeMonthlyRecords(PORTAL_EMPLOYEE_ID, year, month), [year, month, getEmployeeMonthlyRecords]);
  const stats = useMemo(() => getMonthlyStats(PORTAL_EMPLOYEE_ID, year, month), [year, month, getMonthlyStats]);

  const months = ar
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const working = records.filter(r => r.status !== 'weekend').length;
  const pastWorking = records.filter(r => r.status !== 'weekend' && new Date(r.date) < new Date()).length;
  const rate = pastWorking > 0 ? ((stats.present / pastWorking) * 100).toFixed(1) : '0';

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; ar: string; en: string }> = {
      present: { cls: 'bg-success/10 text-success border-success', ar: 'حاضر', en: 'Present' },
      absent: { cls: 'bg-destructive/10 text-destructive border-destructive', ar: 'غائب', en: 'Absent' },
      late: { cls: 'bg-warning/10 text-warning border-warning', ar: 'متأخر', en: 'Late' },
      'early-leave': { cls: 'bg-orange-100 text-orange-600 border-orange-300', ar: 'انصراف مبكر', en: 'Early Leave' },
      weekend: { cls: 'bg-muted text-muted-foreground', ar: 'عطلة', en: 'Weekend' },
      'on-leave': { cls: 'bg-blue-100 text-blue-600 border-blue-300', ar: 'إجازة', en: 'On Leave' },
    };
    const m = map[s] || map.absent;
    return <Badge variant="outline" className={m.cls}>{ar ? m.ar : m.en}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'الحضور والانصراف' : 'Attendance'}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { l: { ar: 'أيام العمل', en: 'Working' }, v: working, c: 'text-primary' },
          { l: { ar: 'حضور', en: 'Present' }, v: stats.present, c: 'text-success' },
          { l: { ar: 'تأخير', en: 'Late' }, v: stats.late, c: 'text-warning' },
          { l: { ar: 'غياب', en: 'Absent' }, v: stats.absent, c: 'text-destructive' },
          { l: { ar: 'إجمالي الساعات', en: 'Total Hours' }, v: `${stats.totalHours}h ${stats.totalMinutes}m`, c: '' },
          { l: { ar: 'ساعات إضافية', en: 'Overtime' }, v: stats.overtime, c: 'text-purple-500' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{ar ? s.l.ar : s.l.en}</p>
            <p className={cn("text-2xl font-bold", s.c)}>{s.v}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-5 h-5" />
              {ar ? 'سجل الحضور الشهري' : 'Monthly Record'}
            </CardTitle>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Select value={month.toString()} onValueChange={v => setMonth(+v)}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>{months.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={year.toString()} onValueChange={v => setYear(+v)}>
                <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>{[2024,2025,2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg", isRTL && "flex-row-reverse")}>
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">{ar ? 'نسبة الحضور:' : 'Rate:'}</span>
            <Badge variant="outline" className="bg-success/10 text-success text-lg px-3">{rate}%</Badge>
          </div>
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader><TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'اليوم' : 'Day'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحضور' : 'In'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الانصراف' : 'Out'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الساعات' : 'Hours'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{format(new Date(r.date), 'EEEE', { locale: ar ? arLocale : enUS })}</TableCell>
                    <TableCell className="font-mono">{r.checkIn || '--:--'}</TableCell>
                    <TableCell className="font-mono">{r.checkOut || '--:--'}</TableCell>
                    <TableCell>{r.workHours > 0 || r.workMinutes > 0 ? `${r.workHours}h ${r.workMinutes}m` : '-'}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                  </TableRow>
                ))}
                {records.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد سجلات' : 'No records'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
