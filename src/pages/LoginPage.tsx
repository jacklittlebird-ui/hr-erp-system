import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, isRTL } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: t('يرجى ملء جميع الحقول', 'Please fill all fields'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const result = await login({ email: email.trim(), password });
    setLoading(false);
    if (result.success) {
      toast({ title: t('تم تسجيل الدخول بنجاح', 'Login successful') });
      // Navigation will happen automatically via AuthRoute redirect
    } else {
      toast({ title: t('بيانات الدخول غير صحيحة', 'Invalid credentials'), description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-background to-[hsl(var(--stat-blue)/0.08)] p-4",
      isRTL ? "font-arabic" : "font-sans"
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      >
        <Globe className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('نظام إدارة الموارد البشرية', 'HR Management System')}</h1>
          <p className="text-muted-foreground mt-1">{t('سجّل دخولك للمتابعة', 'Sign in to continue')}</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t('تسجيل الدخول', 'Sign In')}</CardTitle>
            <CardDescription>{t('أدخل بريدك الإلكتروني وكلمة المرور', 'Enter your email and password')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('البريد الإلكتروني', 'Email')}</Label>
                <Input
                  type="email"
                  placeholder={t('البريد الإلكتروني', 'Email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('كلمة المرور', 'Password')}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-11 pe-10"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", isRTL ? "left-3" : "right-3")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? t('جاري الدخول...', 'Signing in...') : t('تسجيل الدخول', 'Sign In')}
              </Button>
            </form>

            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t('ملاحظة:', 'Note:')}</p>
              <p className="text-xs text-muted-foreground">
                {t('يتم تحديد الدور (مدير/موظف/مدير محطة) تلقائياً بناءً على حسابك', 'Your role (admin/employee/station manager) is determined automatically from your account')}
              </p>
            </div>
          </CardContent>
      </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Developed by OneStory Solutions
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
