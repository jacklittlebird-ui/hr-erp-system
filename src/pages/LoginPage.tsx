import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, User, Shield, MapPin, Eye, EyeOff, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type LoginTab = 'admin' | 'employee' | 'station_manager';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<LoginTab>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const tabs: { key: LoginTab; icon: React.ElementType; labelAr: string; labelEn: string }[] = [
    { key: 'admin', icon: Shield, labelAr: 'مدير النظام', labelEn: 'Admin' },
    { key: 'employee', icon: User, labelAr: 'الموظف', labelEn: 'Employee' },
    { key: 'station_manager', icon: MapPin, labelAr: 'مدير المحطة', labelEn: 'Station Manager' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast({ title: t('يرجى ملء جميع الحقول', 'Please fill all fields'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login({ type: activeTab as UserRole, identifier: identifier.trim(), password });
      setLoading(false);
      if (result.success) {
        toast({ title: t('تم تسجيل الدخول بنجاح', 'Login successful') });
        if (activeTab === 'admin') navigate('/');
        else if (activeTab === 'employee') navigate('/employee-portal');
        else navigate('/station-manager');
      } else {
        toast({ title: t('بيانات الدخول غير صحيحة', 'Invalid credentials'), variant: 'destructive' });
      }
    }, 500);
  };

  const getPlaceholder = () => {
    if (activeTab === 'employee') return t('رقم الموظف (مثال: Emp001)', 'Employee ID (e.g. Emp001)');
    return t('البريد الإلكتروني', 'Email');
  };

  const getIdentifierLabel = () => {
    if (activeTab === 'employee') return t('رقم الموظف', 'Employee ID');
    return t('البريد الإلكتروني', 'Email');
  };

  const getDemoCredentials = () => {
    if (activeTab === 'admin') return { id: 'admin@hr.com', pass: 'admin123' };
    if (activeTab === 'employee') return { id: 'Emp001', pass: '123456' };
    return { id: 'cairo@hr.com', pass: 'manager123' };
  };

  const demo = getDemoCredentials();

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary)/0.08)] via-background to-[hsl(var(--stat-blue)/0.08)] p-4",
      isRTL ? "font-arabic" : "font-sans"
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50"
        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      >
        <Globe className="h-5 w-5" />
      </Button>

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('نظام إدارة الموارد البشرية', 'HR Management System')}</h1>
          <p className="text-muted-foreground mt-1">{t('سجّل دخولك للمتابعة', 'Sign in to continue')}</p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setIdentifier(''); setPassword(''); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {activeTab === 'admin' && t('دخول مدير النظام', 'Admin Login')}
              {activeTab === 'employee' && t('دخول الموظف', 'Employee Login')}
              {activeTab === 'station_manager' && t('دخول مدير المحطة', 'Station Manager Login')}
            </CardTitle>
            <CardDescription>
              {activeTab === 'admin' && t('أدخل بريدك الإلكتروني وكلمة المرور', 'Enter your email and password')}
              {activeTab === 'employee' && t('أدخل رقم الموظف وكلمة المرور', 'Enter your employee ID and password')}
              {activeTab === 'station_manager' && t('أدخل بريدك الإلكتروني وكلمة المرور', 'Enter your email and password')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{getIdentifierLabel()}</Label>
                <Input
                  type={activeTab === 'employee' ? 'text' : 'email'}
                  placeholder={getPlaceholder()}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
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

            {/* Demo credentials */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t('بيانات تجريبية:', 'Demo credentials:')}</p>
              <div className="text-xs text-muted-foreground space-y-0.5" dir="ltr">
                <p>{activeTab === 'employee' ? 'ID' : 'Email'}: <span className="font-mono text-foreground">{demo.id}</span></p>
                <p>Password: <span className="font-mono text-foreground">{demo.pass}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
