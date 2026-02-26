import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Grid3X3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

export const Header = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 bg-primary z-50 flex items-center justify-between px-6",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <Grid3X3 className="w-6 h-6 text-primary-foreground" />
        <h1 className={cn(
          "text-xl font-bold text-primary-foreground",
          isRTL ? "font-arabic" : "font-sans"
        )}>
          {t('app.title')}
        </h1>
      </div>

      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleLanguage}
          className="min-w-[80px] font-semibold"
        >
          {language === 'ar' ? 'English' : 'عربي'}
        </Button>
        
        <NotificationDropdown variant="header" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{language === 'ar' ? 'خروج' : 'Logout'}</span>
        </Button>
      </div>
    </header>
  );
};
