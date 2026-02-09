import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Settings, Lock, Bell } from 'lucide-react';

export const PortalSettings = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'الإعدادات' : 'Settings'}</h1>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Lock className="w-5 h-5" />{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
            <Input type="password" className={cn(isRTL && "text-right")} />
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
            <Input type="password" className={cn(isRTL && "text-right")} />
          </div>
          <div className="space-y-2">
            <Label className={cn(isRTL && "text-right block")}>{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
            <Input type="password" className={cn(isRTL && "text-right")} />
          </div>
          <Button>{language === 'ar' ? 'حفظ' : 'Save'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Bell className="w-5 h-5" />{language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { ar: 'إشعارات البريد الإلكتروني', en: 'Email Notifications' },
            { ar: 'إشعارات الطلبات', en: 'Request Notifications' },
            { ar: 'تذكيرات الحضور', en: 'Attendance Reminders' },
          ].map((s, i) => (
            <div key={i} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <Label>{language === 'ar' ? s.ar : s.en}</Label>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
