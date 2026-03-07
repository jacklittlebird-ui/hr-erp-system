import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lock, Bell, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  email: boolean;
  requests: boolean;
  attendance: boolean;
  salary: boolean;
  evaluations: boolean;
}

export const PortalSettings = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    email: true, requests: true, attendance: true, salary: true, evaluations: true,
  });

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'كلمة المرور غير متطابقة' : 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast({ title: ar ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: ar ? 'تم التحديث' : 'Updated', description: ar ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const toggleNotif = (key: keyof NotificationSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notifOptions = [
    { key: 'email' as const, ar: 'إشعارات البريد الإلكتروني', en: 'Email Notifications' },
    { key: 'requests' as const, ar: 'إشعارات الطلبات', en: 'Request Notifications' },
    { key: 'attendance' as const, ar: 'تذكيرات الحضور', en: 'Attendance Reminders' },
    { key: 'salary' as const, ar: 'إشعارات الرواتب', en: 'Salary Notifications' },
    { key: 'evaluations' as const, ar: 'إشعارات التقييمات', en: 'Evaluation Notifications' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ar ? 'الإعدادات' : 'Settings'}</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />{ar ? 'تغيير كلمة المرور' : 'Change Password'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{ar ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{ar ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <Button onClick={handlePasswordChange} className="gap-2" disabled={loading}>
            <Check className="w-4 h-4" />
            {loading ? (ar ? 'جاري التحديث...' : 'Updating...') : (ar ? 'حفظ' : 'Save')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />{ar ? 'إعدادات الإشعارات' : 'Notification Settings'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {notifOptions.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <Label>{ar ? s.ar : s.en}</Label>
              <Switch checked={notifSettings[s.key]} onCheckedChange={() => toggleNotif(s.key)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};