import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Clock, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/pages/Attendance';

interface LateArrivalsProps {
  records: AttendanceRecord[];
}

export const LateArrivals = ({ records }: LateArrivalsProps) => {
  const { t, isRTL, language } = useLanguage();

  // Group late arrivals by employee
  const lateByEmployee = records.reduce((acc, record) => {
    if (!acc[record.employeeId]) {
      acc[record.employeeId] = {
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        employeeNameAr: record.employeeNameAr,
        department: record.department,
        count: 0,
        totalMinutesLate: 0,
        records: [],
      };
    }
    acc[record.employeeId].count++;
    if (record.checkIn) {
      const [hours, minutes] = record.checkIn.split(':').map(Number);
      const lateMinutes = (hours - 9) * 60 + minutes;
      acc[record.employeeId].totalMinutesLate += lateMinutes;
    }
    acc[record.employeeId].records.push(record);
    return acc;
  }, {} as Record<string, { employeeId: string; employeeName: string; employeeNameAr: string; department: string; count: number; totalMinutesLate: number; records: AttendanceRecord[] }>);

  const sortedEmployees = Object.values(lateByEmployee).sort((a, b) => b.count - a.count);

  // Today's late arrivals
  const today = new Date().toISOString().split('T')[0];
  const todayLate = records.filter(r => r.date === today);

  // This week's stats
  const thisWeekLate = records.length;

  const formatMinutesLate = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-warning/20">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.late.today')}</p>
                <p className="text-3xl font-bold text-warning">{todayLate.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.late.thisWeek')}</p>
                <p className="text-3xl font-bold">{thisWeekLate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.late.frequentOffenders')}</p>
                <p className="text-3xl font-bold">{sortedEmployees.filter(e => e.count >= 3).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Late Arrivals */}
      {todayLate.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              {t('attendance.late.todayList')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayLate.map((record) => (
                <div 
                  key={record.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">{language === 'ar' ? record.employeeNameAr : record.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{t(`dept.${record.department.toLowerCase()}`)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-warning">{record.checkIn}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.notes || t('attendance.late.noReason')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequent Late Arrivals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('attendance.late.frequentTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('attendance.late.noLateArrivals')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.employee')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.department')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.late.lateCount')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.late.avgLateTime')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.late.severity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEmployees.map((employee) => {
                    const avgLate = Math.round(employee.totalMinutesLate / employee.count);
                    const severity = employee.count >= 5 ? 'high' : employee.count >= 3 ? 'medium' : 'low';
                    
                    return (
                      <TableRow key={employee.employeeId}>
                        <TableCell className="font-medium">
                          {language === 'ar' ? employee.employeeNameAr : employee.employeeName}
                        </TableCell>
                        <TableCell>{t(`dept.${employee.department.toLowerCase()}`)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                            {employee.count} {t('attendance.late.times')}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatMinutesLate(avgLate)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              severity === 'high' && "bg-destructive/10 text-destructive border-destructive",
                              severity === 'medium' && "bg-warning/10 text-warning border-warning",
                              severity === 'low' && "bg-success/10 text-success border-success",
                            )}
                          >
                            {t(`attendance.late.severity.${severity}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
