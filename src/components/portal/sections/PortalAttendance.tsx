import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const generateRecords = (year: number, month: number) => {
  const days = eachDayOfInterval({ start: startOfMonth(new Date(year, month)), end: endOfMonth(new Date(year, month)) });
  return days.map((day, i) => {
    const isWk = isWeekend(day);
    const isPast = day < new Date();
    if (isWk) return { id: `r${i}`, date: format(day, 'yyyy-MM-dd'), checkIn: null, checkOut: null, hours: 0, status: 'weekend' as const };
    if (!isPast) return { id: `r${i}`, date: format(day, 'yyyy-MM-dd'), checkIn: null, checkOut: null, hours: 0, status: 'absent' as const };
    const r = Math.random();
    if (r > 0.9) return { id: `r${i}`, date: format(day, 'yyyy-MM-dd'), checkIn: null, checkOut: null, hours: 0, status: 'absent' as const };
    if (r > 0.8) return { id: `r${i}`, date: format(day, 'yyyy-MM-dd'), checkIn: '09:15', checkOut: '17:00', hours: 7.75, status: 'late' as const };
    const ot = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
    return { id: `r${i}`, date: format(day, 'yyyy-MM-dd'), checkIn: '08:00', checkOut: `${17 + ot}:00`, hours: 8 + ot, status: 'present' as const };
  });
};

export const PortalAttendance = () => {
  const { language, isRTL } = useLanguage();
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const records = useMemo(() => generateRecords(year, month), [year, month]);

  const stats = useMemo(() => {
    const working = records.filter(r => r.status !== 'weekend');
    const present = records.filter(r => r.status === 'present' || r.status === 'late');
    const late = records.filter(r => r.status === 'late');
    const absent = records.filter(r => r.status === 'absent' && new Date(r.date) < new Date());
    const totalH = records.reduce((s, r) => s + r.hours, 0);
    const otH = records.reduce((s, r) => s + Math.max(0, r.hours - 8), 0);
    const pastWorking = working.filter(d => new Date(d.date) < new Date()).length;
    return { working: working.length, present: present.length, late: late.length, absent: absent.length, totalH: totalH.toFixed(1), otH: otH.toFixed(1), rate: pastWorking > 0 ? ((present.length / pastWorking) * 100).toFixed(1) : '0' };
  }, [records]);

  const months = language === 'ar'
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; ar: string; en: string }> = {
      present: { cls: 'bg-success/10 text-success border-success', ar: 'حاضر', en: 'Present' },
      absent: { cls: 'bg-destructive/10 text-destructive border-destructive', ar: 'غائب', en: 'Absent' },
      late: { cls: 'bg-warning/10 text-warning border-warning', ar: 'متأخر', en: 'Late' },
      weekend: { cls: 'bg-muted text-muted-foreground', ar: 'عطلة', en: 'Weekend' },
    };
    const m = map[s] || map.absent;
    return <Badge variant="outline" className={m.cls}>{language === 'ar' ? m.ar : m.en}</Badge>;
  };

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'الحضور والانصراف' : 'Attendance'}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { l: { ar: 'أيام العمل', en: 'Working' }, v: stats.working, c: 'text-primary' },
          { l: { ar: 'حضور', en: 'Present' }, v: stats.present, c: 'text-success' },
          { l: { ar: 'تأخير', en: 'Late' }, v: stats.late, c: 'text-warning' },
          { l: { ar: 'غياب', en: 'Absent' }, v: stats.absent, c: 'text-destructive' },
          { l: { ar: 'إجمالي الساعات', en: 'Total Hours' }, v: stats.totalH, c: '' },
          { l: { ar: 'ساعات إضافية', en: 'Overtime' }, v: stats.otH, c: 'text-purple-500' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">{language === 'ar' ? s.l.ar : s.l.en}</p>
            <p className={cn("text-2xl font-bold", s.c)}>{s.v}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-5 h-5" />
              {language === 'ar' ? 'سجل الحضور الشهري' : 'Monthly Record'}
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
            <span className="font-medium">{language === 'ar' ? 'نسبة الحضور:' : 'Rate:'}</span>
            <Badge variant="outline" className="bg-success/10 text-success text-lg px-3">{stats.rate}%</Badge>
          </div>
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader><TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'اليوم' : 'Day'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحضور' : 'In'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الانصراف' : 'Out'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الساعات' : 'Hours'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {records.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{format(new Date(r.date), 'EEEE', { locale: language === 'ar' ? ar : enUS })}</TableCell>
                    <TableCell className="font-mono">{r.checkIn || '--:--'}</TableCell>
                    <TableCell className="font-mono">{r.checkOut || '--:--'}</TableCell>
                    <TableCell>{r.hours > 0 ? `${r.hours}h` : '-'}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
