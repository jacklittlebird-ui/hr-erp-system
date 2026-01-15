import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Calendar, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/pages/Attendance';
import { toast } from '@/hooks/use-toast';

interface CheckInOutProps {
  records: AttendanceRecord[];
  onCheckIn: (employeeId: string) => void;
  onCheckOut: (recordId: string) => void;
}

export const CheckInOut = ({ records, onCheckIn, onCheckOut }: CheckInOutProps) => {
  const { t, isRTL } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Find today's record for current user
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === today && r.employeeId === 'EMP001');
  const hasCheckedIn = todayRecord?.checkIn !== null;
  const hasCheckedOut = todayRecord?.checkOut !== null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    onCheckIn('EMP001');
    toast({
      title: t('attendance.checkin.success'),
      description: t('attendance.checkin.successMessage'),
    });
  };

  const handleCheckOut = () => {
    if (todayRecord) {
      onCheckOut(todayRecord.id);
      toast({
        title: t('attendance.checkout.success'),
        description: t('attendance.checkout.successMessage'),
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate work duration
  const getWorkDuration = () => {
    if (!todayRecord?.checkIn) return null;
    const [checkInHour, checkInMin] = todayRecord.checkIn.split(':').map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(checkInHour, checkInMin, 0);
    
    const endTime = todayRecord.checkOut 
      ? (() => {
          const [h, m] = todayRecord.checkOut.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0);
          return d;
        })()
      : currentTime;
    
    const diff = endTime.getTime() - checkInDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Current Time Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{formatDate(currentTime)}</span>
            </div>
            <div className="text-6xl font-bold text-primary mb-6 font-mono">
              {formatTime(currentTime)}
            </div>
            
            {/* Action Buttons */}
            <div className={cn("flex justify-center gap-4", isRTL && "flex-row-reverse")}>
              {!hasCheckedIn ? (
                <Button 
                  size="lg" 
                  className="bg-success hover:bg-success/90 min-w-[200px] h-14 text-lg"
                  onClick={handleCheckIn}
                >
                  <LogIn className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.checkin.button')}
                </Button>
              ) : !hasCheckedOut ? (
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="min-w-[200px] h-14 text-lg"
                  onClick={handleCheckOut}
                >
                  <LogOut className={cn("w-5 h-5", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.checkout.button')}
                </Button>
              ) : (
                <Badge variant="outline" className="text-lg py-3 px-6 bg-muted">
                  {t('attendance.completed')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-success/10">
                <LogIn className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.checkin.time')}</p>
                <p className="text-2xl font-bold">
                  {todayRecord?.checkIn || '--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-destructive/10">
                <LogOut className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.checkout.time')}</p>
                <p className="text-2xl font-bold">
                  {todayRecord?.checkOut || '--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-primary/10">
                <Timer className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.workDuration')}</p>
                <p className="text-2xl font-bold">
                  {getWorkDuration() || '--:--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Status Info */}
      {todayRecord && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('attendance.todayStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm py-1 px-3",
                  todayRecord.status === 'present' && "bg-success/10 text-success border-success",
                  todayRecord.status === 'late' && "bg-warning/10 text-warning border-warning",
                  todayRecord.status === 'early-leave' && "bg-orange-100 text-orange-700 border-orange-300",
                )}
              >
                {t(`attendance.status.${todayRecord.status}`)}
              </Badge>
              {todayRecord.status === 'late' && (
                <span className="text-sm text-muted-foreground">
                  {t('attendance.lateBy')} {parseInt(todayRecord.checkIn?.split(':')[0] || '9') - 9}h {parseInt(todayRecord.checkIn?.split(':')[1] || '0')}m
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
