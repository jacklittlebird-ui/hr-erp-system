import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Menu, Bell, Globe, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortalHeaderProps {
  onToggleSidebar: () => void;
}

// Mock employee
const employee = {
  nameAr: 'أحمد محمد علي',
  nameEn: 'Ahmed Mohamed Ali',
  id: 'EMP001',
};

export const PortalHeader = ({ onToggleSidebar }: PortalHeaderProps) => {
  const { language, setLanguage, isRTL } = useLanguage();

  return (
    <header className={cn(
      "h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-10",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <p className="text-sm font-semibold leading-tight">
              {language === 'ar' ? employee.nameAr : employee.nameEn}
            </p>
            <p className="text-xs text-muted-foreground">{employee.id}</p>
          </div>
        </div>
      </div>

      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <h1 className="text-lg font-bold hidden md:block">
          {language === 'ar' ? 'بوابة الموظف' : 'Employee Portal'}
        </h1>
      </div>

      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        >
          <Globe className="w-4 h-4" />
          <span className="ml-1 text-xs">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center">3</span>
        </Button>
      </div>
    </header>
  );
};
