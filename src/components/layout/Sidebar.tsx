import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  FileText,
  Calendar,
  KeyRound,
  Wallet,
  FileBarChart,
  HandCoins,
  UserPlus,
  Star,
  Monitor,
  Shirt,
  FolderOpen,
  BarChart3,
  GraduationCap,
  Settings,
  Shield,
  Layers,
  UserCog,
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ElementType;
  active?: boolean;
}

const mainNavItems: NavItem[] = [
  { key: 'nav.dashboard', icon: LayoutDashboard, active: true },
  { key: 'nav.employees', icon: Users },
  { key: 'nav.departments', icon: Building2 },
  { key: 'nav.attendance', icon: Clock },
  { key: 'nav.missions', icon: FileText },
  { key: 'nav.leaves', icon: Calendar },
  { key: 'nav.permissions', icon: KeyRound },
  { key: 'nav.salaries', icon: Wallet },
  { key: 'nav.salaryReports', icon: FileBarChart },
  { key: 'nav.loans', icon: HandCoins },
  { key: 'nav.recruitment', icon: UserPlus },
  { key: 'nav.performance', icon: Star },
  { key: 'nav.assets', icon: Monitor },
  { key: 'nav.uniforms', icon: Shirt },
  { key: 'nav.documents', icon: FolderOpen },
  { key: 'nav.reports', icon: BarChart3 },
  { key: 'nav.training', icon: GraduationCap },
];

const configNavItems: NavItem[] = [
  { key: 'nav.users', icon: UserCog },
  { key: 'nav.groups', icon: Layers },
  { key: 'nav.roles', icon: Shield },
  { key: 'nav.settings', icon: Settings },
];

export const Sidebar = () => {
  const { t, isRTL } = useLanguage();

  return (
    <aside className={cn(
      "fixed top-16 h-[calc(100vh-4rem)] w-64 bg-card border-border overflow-y-auto",
      isRTL ? "right-0 border-l" : "left-0 border-r"
    )}>
      <nav className="p-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavButton key={item.key} item={item} t={t} isRTL={isRTL} />
        ))}
        
        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('nav.configurations')}
          </p>
        </div>
        
        {configNavItems.map((item) => (
          <NavButton key={item.key} item={item} t={t} isRTL={isRTL} />
        ))}
      </nav>
    </aside>
  );
};

interface NavButtonProps {
  item: NavItem;
  t: (key: string) => string;
  isRTL: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ item, t, isRTL }) => {
  const Icon = item.icon;
  
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        item.active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        isRTL && "flex-row-reverse text-right"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{t(item.key)}</span>
    </button>
  );
};
