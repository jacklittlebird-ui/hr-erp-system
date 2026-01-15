import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Bell, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();

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
        
        <button className="relative p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
          <Bell className="w-5 h-5 text-primary-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-stat-coral rounded-full" />
        </button>
      </div>
    </header>
  );
};
