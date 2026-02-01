import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogIn, LogOut, Clock, Calendar, User, Timer, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: 'present' | 'absent' | 'late' | 'early-leave' | 'on-leave' | 'weekend';
}

// Mock current employee data
const currentEmployee = {
  id: 'EMP001',
  name: 'Ahmed Hassan',
  nameAr: 'أحمد حسن',
  department: 'IT',
  position: 'Software Developer',
  positionAr: 'مطور برمجيات',
};

// Generate mock attendance data for the month
const generateMonthlyRecords = (year: number, month: number): AttendanceRecord[] => {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start, end });
  
  return days.map((day, index) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isWeekendDay = isWeekend(day);
    const isPast = day < new Date();
    
    if (isWeekendDay) {
      return {
        id: `rec-${index}`,
        date: dateStr,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'weekend' as const,
      };
    }
    
    if (!isPast) {
      return {
        id: `rec-${index}`,
        date: dateStr,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'absent' as const,
      };
    }
    
    // Random attendance for past days
    const rand = Math.random();
    if (rand > 0.9) {
      return {
        id: `rec-${index}`,
        date: dateStr,
        checkIn: null,
        checkOut: null,
        workHours: 0,
        status: 'absent' as const,
      };
    } else if (rand > 0.8) {
      return {
        id: `rec-${index}`,
        date: dateStr,
        checkIn: '09:15',
        checkOut: '17:00',
        workHours: 7.75,
        status: 'late' as const,
      };
    } else {
      const overtime = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
      return {
        id: `rec-${index}`,
        date: dateStr,
        checkIn: '08:00',
        checkOut: `${17 + overtime}:00`,
        workHours: 8 + overtime,
        status: 'present' as const,
      };
    }
  });
};

const EmployeeAttendance = () => {
  const { t, isRTL, language } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  
  const monthlyRecords = useMemo(() => 
    generateMonthlyRecords(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  
  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const workingDays = monthlyRecords.filter(r => r.status !== 'weekend');
    const presentDays = monthlyRecords.filter(r => r.status === 'present' || r.status === 'late');
    const lateDays = monthlyRecords.filter(r => r.status === 'late');
    const absentDays = monthlyRecords.filter(r => r.status === 'absent' && new Date(r.date) < new Date());
    const totalHours = monthlyRecords.reduce((sum, r) => sum + r.workHours, 0);
    const overtimeHours = monthlyRecords.reduce((sum, r) => sum + Math.max(0, r.workHours - 8), 0);
    
    return {
      workingDays: workingDays.length,
      presentDays: presentDays.length,
      lateDays: lateDays.length,
      absentDays: absentDays.length,
      totalHours: totalHours.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
      attendanceRate: workingDays.length > 0 
        ? ((presentDays.length / workingDays.filter(d => new Date(d.date) < new Date()).length) * 100).toFixed(1)
        : '0',
    };
  }, [monthlyRecords]);

  const handleCheckIn = () => {
    const time = format(new Date(), 'HH:mm');
    setIsCheckedIn(true);
    setCheckInTime(time);
    toast({
      title: language === 'ar' ? 'تم تسجيل الحضور بنجاح' : 'Check-in Successful',
      description: language === 'ar' 
        ? `تم تسجيل حضورك في الساعة ${time}`
        : `You checked in at ${time}`,
    });
  };

  const handleCheckOut = () => {
    const time = format(new Date(), 'HH:mm');
    setCheckOutTime(time);
    setIsCheckedIn(false);
    
    // Calculate work duration
    if (checkInTime) {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = time.split(':').map(Number);
      const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      toast({
        title: language === 'ar' ? 'تم تسجيل الانصراف بنجاح' : 'Check-out Successful',
        description: language === 'ar' 
          ? `تم تسجيل انصرافك في الساعة ${time}. مدة العمل: ${hours} ساعة و ${minutes} دقيقة`
          : `You checked out at ${time}. Work duration: ${hours}h ${minutes}m`,
      });
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles: Record<string, string> = {
      present: 'bg-success/10 text-success border-success',
      absent: 'bg-destructive/10 text-destructive border-destructive',
      late: 'bg-warning/10 text-warning border-warning',
      'early-leave': 'bg-orange-100 text-orange-700 border-orange-300',
      'on-leave': 'bg-blue-100 text-blue-700 border-blue-300',
      weekend: 'bg-muted text-muted-foreground border-muted',
    };
    
    const labels: Record<string, string> = {
      present: language === 'ar' ? 'حاضر' : 'Present',
      absent: language === 'ar' ? 'غائب' : 'Absent',
      late: language === 'ar' ? 'متأخر' : 'Late',
      'early-leave': language === 'ar' ? 'انصراف مبكر' : 'Early Leave',
      'on-leave': language === 'ar' ? 'إجازة' : 'On Leave',
      weekend: language === 'ar' ? 'عطلة' : 'Weekend',
    };
    
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const months = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Employee Info */}
        <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4", isRTL && "md:flex-row-reverse")}>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {language === 'ar' ? 'بوابة الموظف' : 'Employee Portal'}
            </h1>
            <div className={cn("flex items-center gap-2 mt-2 text-muted-foreground", isRTL && "flex-row-reverse")}>
              <User className="w-4 h-4" />
              <span className="font-medium">
                {language === 'ar' ? currentEmployee.nameAr : currentEmployee.name}
              </span>
              <span className="text-xs">({currentEmployee.id})</span>
              <Badge variant="secondary">
                {language === 'ar' ? currentEmployee.positionAr : currentEmployee.position}
              </Badge>
            </div>
          </div>
          <div className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-mono">{currentTime}</span>
            <span className="text-muted-foreground">|</span>
            <Calendar className="w-5 h-5 text-primary" />
            <span>{format(new Date(), 'EEEE, d MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}</span>
          </div>
        </div>

        {/* Check-in/Check-out Section */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Timer className="w-5 h-5" />
              {language === 'ar' ? 'تسجيل الحضور والانصراف' : 'Attendance Check-in/out'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex flex-col md:flex-row gap-6 items-center justify-center", isRTL && "md:flex-row-reverse")}>
              {/* Check-in Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  className="h-24 w-48 text-xl font-bold bg-success hover:bg-success/90 text-white shadow-lg"
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                >
                  <LogIn className="w-8 h-8 ml-2" />
                  {language === 'ar' ? 'تسجيل الحضور' : 'Check In'}
                </Button>
                {checkInTime && (
                  <Badge variant="outline" className="bg-success/10 text-success text-sm px-4 py-1">
                    {language === 'ar' ? `وقت الحضور: ${checkInTime}` : `Checked in at: ${checkInTime}`}
                  </Badge>
                )}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-24 bg-border" />
              <div className="md:hidden w-24 h-px bg-border" />

              {/* Check-out Button */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-24 w-48 text-xl font-bold shadow-lg"
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn}
                >
                  <LogOut className="w-8 h-8 ml-2" />
                  {language === 'ar' ? 'تسجيل الانصراف' : 'Check Out'}
                </Button>
                {checkOutTime && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive text-sm px-4 py-1">
                    {language === 'ar' ? `وقت الانصراف: ${checkOutTime}` : `Checked out at: ${checkOutTime}`}
                  </Badge>
                )}
              </div>
            </div>

            {/* Today's Status */}
            {(checkInTime || checkOutTime) && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className={cn("font-semibold mb-2", isRTL && "text-right")}>
                  {language === 'ar' ? 'حالة اليوم' : "Today's Status"}
                </h4>
                <div className={cn("flex gap-6 text-sm", isRTL && "flex-row-reverse justify-end")}>
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'الحضور:' : 'Check-in:'}</span>
                    <span className="font-mono ml-2">{checkInTime || '--:--'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{language === 'ar' ? 'الانصراف:' : 'Check-out:'}</span>
                    <span className="font-mono ml-2">{checkOutTime || '--:--'}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أيام العمل' : 'Working Days'}</p>
              <p className="text-2xl font-bold text-primary">{monthlyStats.workingDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أيام الحضور' : 'Present Days'}</p>
              <p className="text-2xl font-bold text-success">{monthlyStats.presentDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أيام التأخير' : 'Late Days'}</p>
              <p className="text-2xl font-bold text-warning">{monthlyStats.lateDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أيام الغياب' : 'Absent Days'}</p>
              <p className="text-2xl font-bold text-destructive">{monthlyStats.absentDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}</p>
              <p className="text-2xl font-bold">{monthlyStats.totalHours}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{language === 'ar' ? 'ساعات إضافية' : 'Overtime'}</p>
              <p className="text-2xl font-bold text-purple-600">{monthlyStats.overtimeHours}h</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Records */}
        <Card>
          <CardHeader>
            <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center gap-4", isRTL && "md:flex-row-reverse")}>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Calendar className="w-5 h-5" />
                {language === 'ar' ? 'سجل الحضور الشهري' : 'Monthly Attendance Record'}
              </CardTitle>
              <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Bar */}
            <div className={cn("flex items-center justify-between p-4 mb-4 bg-muted/50 rounded-lg", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {language === 'ar' ? 'نسبة الحضور:' : 'Attendance Rate:'}
                </span>
                <Badge variant="outline" className="bg-success/10 text-success text-lg px-3">
                  {monthlyStats.attendanceRate}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? `${monthlyStats.presentDays} من ${monthlyStats.workingDays} يوم عمل`
                  : `${monthlyStats.presentDays} of ${monthlyStats.workingDays} working days`
                }
              </div>
            </div>

            {/* Records Table */}
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'اليوم' : 'Day'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحضور' : 'Check In'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الانصراف' : 'Check Out'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الساعات' : 'Hours'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyRecords.map((record) => (
                    <TableRow key={record.id} className={record.status === 'weekend' ? 'bg-muted/30' : ''}>
                      <TableCell className="font-mono">{record.date}</TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'EEEE', { locale: language === 'ar' ? ar : enUS })}
                      </TableCell>
                      <TableCell className="font-mono">{record.checkIn || '-'}</TableCell>
                      <TableCell className="font-mono">{record.checkOut || '-'}</TableCell>
                      <TableCell>
                        {record.workHours > 0 ? (
                          <span className={record.workHours > 8 ? 'text-purple-600 font-medium' : ''}>
                            {record.workHours}h
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAttendance;
