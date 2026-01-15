import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isRTL ? "font-arabic" : "font-sans"
    )}>
      <Header />
      <Sidebar />
      <main className={cn(
        "pt-16 min-h-screen",
        isRTL ? "mr-64" : "ml-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
