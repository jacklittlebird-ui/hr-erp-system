import { useLanguage } from '@/contexts/LanguageContext';
import { usePayrollData } from '@/contexts/PayrollDataContext';
import { useAttendanceData } from '@/contexts/AttendanceDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Calendar, Wallet, Star, LogIn, LogOut } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalDashboard = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeePayroll } = usePayrollData();
  const { records, checkIn, checkOut, getMonthlyStats } = useAttendanceData();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = records.find(r => r.employeeId === PORTAL_EMPLOYEE_ID && r.date === today);
  const isCheckedIn = todayRecord?.checkIn && !todayRecord?.checkOut;

  const monthlyStats = useMemo(() => getMonthlyStats(PORTAL_EMPLOYEE_ID, new Date().getFullYear(), new Date().getMonth()), [getMonthlyStats]);
  const latestPayroll = useMemo(() => {
    const p = getEmployeePayroll(PORTAL_EMPLOYEE_ID);
    return p[0];
  }, [getEmployeePayroll]);

  const handleCheckIn = () => {
    checkIn(PORTAL_EMPLOYEE_ID, 'Galal AbdelRazek AbdelHaliem', 'جلال عبد الرازق عبد العليم', 'الإدارة');
    toast({ title: ar ? 'تم تسجيل الحضور' : 'Checked In', description: format(new Date(), 'HH:mm') });
  };

  const handleCheckOut = () => {
    if (todayRecord) {
      checkOut(todayRecord.id);
      toast({ title: ar ? 'تم تسجيل الانصراف' : 'Checked Out', description: format(new Date(), 'HH:mm') });
    }
  };

  const stats = [
    { icon: Clock, labelAr: 'أيام الحضور هذا الشهر', labelEn: 'Attendance Days', value: String(monthlyStats.present), color: 'text-primary' },
    { icon: Calendar, labelAr: 'رصيد الإجازات', labelEn: 'Leave Balance', value: '15', color: 'text-success' },
    { icon: Wallet, labelAr: 'صافي الراتب', labelEn: 'Net Salary', value: latestPayroll ? latestPayroll.netSalary.toLocaleString() : '—', color: 'text-warning' },
    { icon: Star, labelAr: 'آخر تقييم', labelEn: 'Last Evaluation', value: '4.2/5', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>
          {ar ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className={cn("text-muted-foreground", isRTL && "text-right")}>
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ar ? arLocale : enUS })}
        </p>
      </div>

      {/* Check-in/out */}
      <Card>
        <CardContent className="p-6">
          <div className={cn("flex flex-col sm:flex-row items-center justify-center gap-6", isRTL && "sm:flex-row-reverse")}>
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" className="h-20 w-44 text-lg font-bold bg-success hover:bg-success/90 text-white" onClick={handleCheckIn} disabled={!!isCheckedIn}>
                <LogIn className="w-6 h-6 ml-2" />
                {ar ? 'تسجيل حضور' : 'Check In'}
              </Button>
              {todayRecord?.checkIn && <Badge variant="outline" className="bg-success/10 text-success">{todayRecord.checkIn}</Badge>}
            </div>
            <div className="hidden sm:block w-px h-16 bg-border" />
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" variant="destructive" className="h-20 w-44 text-lg font-bold" onClick={handleCheckOut} disabled={!isCheckedIn}>
                <LogOut className="w-6 h-6 ml-2" />
                {ar ? 'تسجيل انصراف' : 'Check Out'}
              </Button>
              {todayRecord?.checkOut && <Badge variant="outline" className="bg-destructive/10 text-destructive">{todayRecord.checkOut}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5 text-center">
              <s.icon className={cn("w-8 h-8 mx-auto mb-2", s.color)} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{ar ? s.labelAr : s.labelEn}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
