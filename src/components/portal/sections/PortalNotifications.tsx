import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const notifications = [
  { id: 1, titleAr: 'تمت الموافقة على طلب الإجازة', titleEn: 'Leave request approved', timeAr: 'منذ ساعتين', timeEn: '2 hours ago', type: 'success', read: false },
  { id: 2, titleAr: 'تم تحديث كشف الراتب لشهر يناير', titleEn: 'January payslip updated', timeAr: 'منذ يوم', timeEn: '1 day ago', type: 'info', read: false },
  { id: 3, titleAr: 'تذكير: موعد تقييم الأداء الربعي', titleEn: 'Reminder: Quarterly performance review', timeAr: 'منذ 3 أيام', timeEn: '3 days ago', type: 'warning', read: true },
  { id: 4, titleAr: 'تم تسليم عهدة جديدة', titleEn: 'New asset assigned', timeAr: 'منذ أسبوع', timeEn: '1 week ago', type: 'info', read: true },
];

const typeIcons = { success: CheckCircle, warning: AlertCircle, info: Info };
const typeColors = { success: 'text-success', warning: 'text-warning', info: 'text-primary' };

export const PortalNotifications = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</h1>

      <div className="grid gap-3">
        {notifications.map(n => {
          const Icon = typeIcons[n.type as keyof typeof typeIcons] || Info;
          return (
            <Card key={n.id} className={cn(!n.read && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-4">
                <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                  <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", typeColors[n.type as keyof typeof typeColors])} />
                  <div className={cn("flex-1", isRTL && "text-right")}>
                    <p className={cn("font-medium", !n.read && "font-semibold")}>{language === 'ar' ? n.titleAr : n.titleEn}</p>
                    <p className="text-xs text-muted-foreground mt-1">{language === 'ar' ? n.timeAr : n.timeEn}</p>
                  </div>
                  {!n.read && <Badge className="bg-primary text-primary-foreground text-[10px]">{language === 'ar' ? 'جديد' : 'New'}</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
