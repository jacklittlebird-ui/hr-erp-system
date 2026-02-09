import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Calendar, Wallet, Star, LogIn, LogOut, Timer } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export const PortalDashboard = () => {
  const { language, isRTL } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const saved = localStorage.getItem(`attendance_${today}`);
    return saved ? JSON.parse(saved).isCheckedIn : false;
  });
  const [checkInTime, setCheckInTime] = useState<string | null>(() => {
    const saved = localStorage.getItem(`attendance_${today}`);
    return saved ? JSON.parse(saved).checkInTime : null;
  });
  const [checkOutTime, setCheckOutTime] = useState<string | null>(() => {
    const saved = localStorage.getItem(`attendance_${today}`);
    return saved ? JSON.parse(saved).checkOutTime : null;
  });

  const saveState = (ci: boolean, inT: string | null, outT: string | null) => {
    localStorage.setItem(`attendance_${today}`, JSON.stringify({ isCheckedIn: ci, checkInTime: inT, checkOutTime: outT }));
  };

  const handleCheckIn = () => {
    const time = format(new Date(), 'HH:mm');
    setIsCheckedIn(true); setCheckInTime(time);
    saveState(true, time, null);
    toast({ title: language === 'ar' ? 'تم تسجيل الحضور' : 'Checked In', description: time });
  };
  const handleCheckOut = () => {
    const time = format(new Date(), 'HH:mm');
    setIsCheckedIn(false); setCheckOutTime(time);
    saveState(false, checkInTime, time);
    toast({ title: language === 'ar' ? 'تم تسجيل الانصراف' : 'Checked Out', description: time });
  };

  const stats = [
    { icon: Clock, labelAr: 'أيام الحضور هذا الشهر', labelEn: 'Attendance Days', value: '18', color: 'text-primary' },
    { icon: Calendar, labelAr: 'رصيد الإجازات', labelEn: 'Leave Balance', value: '15', color: 'text-success' },
    { icon: Wallet, labelAr: 'صافي الراتب', labelEn: 'Net Salary', value: '8,500', color: 'text-warning' },
    { icon: Star, labelAr: 'آخر تقييم', labelEn: 'Last Evaluation', value: '4.2/5', color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className={cn("text-muted-foreground", isRTL && "text-right")}>
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}
        </p>
      </div>

      {/* Check-in/out */}
      <Card>
        <CardContent className="p-6">
          <div className={cn("flex flex-col sm:flex-row items-center justify-center gap-6", isRTL && "sm:flex-row-reverse")}>
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" className="h-20 w-44 text-lg font-bold bg-success hover:bg-success/90 text-white" onClick={handleCheckIn} disabled={isCheckedIn}>
                <LogIn className="w-6 h-6 ml-2" />
                {language === 'ar' ? 'تسجيل حضور' : 'Check In'}
              </Button>
              {checkInTime && <Badge variant="outline" className="bg-success/10 text-success">{checkInTime}</Badge>}
            </div>
            <div className="hidden sm:block w-px h-16 bg-border" />
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" variant="destructive" className="h-20 w-44 text-lg font-bold" onClick={handleCheckOut} disabled={!isCheckedIn}>
                <LogOut className="w-6 h-6 ml-2" />
                {language === 'ar' ? 'تسجيل انصراف' : 'Check Out'}
              </Button>
              {checkOutTime && <Badge variant="outline" className="bg-destructive/10 text-destructive">{checkOutTime}</Badge>}
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
              <p className="text-sm text-muted-foreground">{language === 'ar' ? s.labelAr : s.labelEn}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
