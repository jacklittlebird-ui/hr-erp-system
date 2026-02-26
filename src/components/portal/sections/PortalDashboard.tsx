import { useLanguage } from '@/contexts/LanguageContext';
import { usePayrollData } from '@/contexts/PayrollDataContext';
import { useAttendanceData } from '@/contexts/AttendanceDataContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Calendar, Wallet, Star, LogIn, LogOut, FileText, Bell } from 'lucide-react';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';

export const PortalDashboard = () => {
  const PORTAL_EMPLOYEE_ID = usePortalEmployee();
  const { getEmployeeById } = useEmployeeData();
  const employee = getEmployeeById(PORTAL_EMPLOYEE_ID);
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeePayroll } = usePayrollData();
  const { records, checkIn, checkOut, getMonthlyStats } = useAttendanceData();
  const { getLeaveBalances, getEvaluations, getLeaveRequests, getMissions, getRequests } = usePortalData();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = records.find(r => r.employeeId === PORTAL_EMPLOYEE_ID && r.date === today);
  const isCheckedIn = todayRecord?.checkIn && !todayRecord?.checkOut;

  const monthlyStats = useMemo(() => getMonthlyStats(PORTAL_EMPLOYEE_ID, new Date().getFullYear(), new Date().getMonth()), [getMonthlyStats]);
  const latestPayroll = useMemo(() => {
    const p = getEmployeePayroll(PORTAL_EMPLOYEE_ID);
    return p[0];
  }, [getEmployeePayroll]);

  // Get real leave balance
  const leaveBalances = useMemo(() => getLeaveBalances(PORTAL_EMPLOYEE_ID), [getLeaveBalances]);
  const annualBalance = leaveBalances.find(b => b.typeEn === 'Annual');
  const totalLeaveRemaining = leaveBalances.reduce((sum, b) => sum + b.remaining, 0);

  // Get real latest evaluation
  const evaluations = useMemo(() => getEvaluations(PORTAL_EMPLOYEE_ID), [getEvaluations]);
  const latestEval = evaluations.length > 0 ? evaluations[0] : null;

  // Pending requests count
  const pendingLeaves = useMemo(() => getLeaveRequests(PORTAL_EMPLOYEE_ID).filter(r => r.status === 'pending').length, [getLeaveRequests]);
  const pendingMissions = useMemo(() => getMissions(PORTAL_EMPLOYEE_ID).filter(r => r.status === 'pending').length, [getMissions]);
  const pendingRequests = useMemo(() => getRequests(PORTAL_EMPLOYEE_ID).filter(r => r.status === 'pending').length, [getRequests]);
  const totalPending = pendingLeaves + pendingMissions + pendingRequests;

  const handleCheckIn = () => {
    checkIn(PORTAL_EMPLOYEE_ID, employee?.nameEn || '', employee?.nameAr || '', employee?.department || '');
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
    { icon: Calendar, labelAr: 'رصيد الإجازات', labelEn: 'Leave Balance', value: String(totalLeaveRemaining), color: 'text-success' },
    { icon: Wallet, labelAr: 'صافي الراتب', labelEn: 'Net Salary', value: latestPayroll ? latestPayroll.netSalary.toLocaleString() : '—', color: 'text-warning' },
    { icon: Star, labelAr: 'آخر تقييم', labelEn: 'Last Evaluation', value: latestEval ? `${latestEval.score}/${latestEval.maxScore}` : '—', color: 'text-purple-500' },
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

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Requests */}
        <Card>
          <CardContent className="p-5">
            <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
              <Bell className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">{ar ? 'طلبات معلقة' : 'Pending Requests'}</h3>
            </div>
            <p className="text-3xl font-bold text-warning text-center">{totalPending}</p>
            <div className="text-xs text-muted-foreground text-center mt-2 space-y-1">
              {pendingLeaves > 0 && <p>{ar ? `${pendingLeaves} إجازة` : `${pendingLeaves} leave(s)`}</p>}
              {pendingMissions > 0 && <p>{ar ? `${pendingMissions} مأمورية` : `${pendingMissions} mission(s)`}</p>}
              {pendingRequests > 0 && <p>{ar ? `${pendingRequests} طلب` : `${pendingRequests} request(s)`}</p>}
              {totalPending === 0 && <p>{ar ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances */}
        <Card>
          <CardContent className="p-5">
            <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{ar ? 'أرصدة الإجازات' : 'Leave Balances'}</h3>
            </div>
            <div className="space-y-2">
              {leaveBalances.map((b, i) => (
                <div key={i} className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{ar ? b.typeAr : b.typeEn}</span>
                  <span className="font-medium">{b.remaining}/{b.total}</span>
                </div>
              ))}
              {leaveBalances.length === 0 && <p className="text-sm text-muted-foreground text-center">{ar ? 'لا توجد أرصدة' : 'No balances'}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Latest Evaluation */}
        <Card>
          <CardContent className="p-5">
            <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
              <Star className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">{ar ? 'آخر تقييم' : 'Latest Evaluation'}</h3>
            </div>
            {latestEval ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{latestEval.period}</p>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={cn("w-5 h-5", si < Math.floor(latestEval.score) ? "text-warning fill-warning" : "text-muted")} />
                  ))}
                </div>
                <p className="text-xl font-bold">{latestEval.score}/{latestEval.maxScore}</p>
                <p className="text-xs text-muted-foreground">{ar ? latestEval.notesAr : latestEval.notesEn}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">{ar ? 'لا توجد تقييمات' : 'No evaluations'}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
