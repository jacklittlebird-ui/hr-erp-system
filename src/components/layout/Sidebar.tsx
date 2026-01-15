import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, FileText, Calendar, KeyRound, Wallet,
  FileBarChart, HandCoins, UserPlus, Star, Monitor, Shirt, FolderOpen, BarChart3,
  GraduationCap, Settings, Shield, Layers, UserCog,
} from 'lucide-react';

interface NavItem {
  key: string;
  icon: React.ElementType;
  path: string;
}

const mainNavItems: NavItem[] = [
  { key: 'nav.dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'nav.employees', icon: Users, path: '/employees' },
  { key: 'nav.departments', icon: Building2, path: '/departments' },
  { key: 'nav.attendance', icon: Clock, path: '/attendance' },
  { key: 'nav.missions', icon: FileText, path: '/missions' },
  { key: 'nav.leaves', icon: Calendar, path: '/leaves' },
  { key: 'nav.permissions', icon: KeyRound, path: '/permissions' },
  { key: 'nav.salaries', icon: Wallet, path: '/salaries' },
  { key: 'nav.salaryReports', icon: FileBarChart, path: '/salary-reports' },
  { key: 'nav.loans', icon: HandCoins, path: '/loans' },
  { key: 'nav.recruitment', icon: UserPlus, path: '/recruitment' },
  { key: 'nav.performance', icon: Star, path: '/performance' },
  { key: 'nav.assets', icon: Monitor, path: '/assets' },
  { key: 'nav.uniforms', icon: Shirt, path: '/uniforms' },
  { key: 'nav.documents', icon: FolderOpen, path: '/documents' },
  { key: 'nav.reports', icon: BarChart3, path: '/reports' },
  { key: 'nav.training', icon: GraduationCap, path: '/training' },
];

const configNavItems: NavItem[] = [
  { key: 'nav.users', icon: UserCog, path: '/users' },
  { key: 'nav.groups', icon: Layers, path: '/groups' },
  { key: 'nav.roles', icon: Shield, path: '/roles' },
  { key: 'nav.settings', icon: Settings, path: '/settings' },
];

export const Sidebar = () => {
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed top-16 h-[calc(100vh-4rem)] w-64 bg-card border-border overflow-y-auto",
      isRTL ? "right-0 border-l" : "left-0 border-r"
    )}>
      <nav className="p-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavButton key={item.key} item={item} t={t} isRTL={isRTL} isActive={location.pathname === item.path} />
        ))}
        <div className="pt-6 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('nav.configurations')}
          </p>
        </div>
        {configNavItems.map((item) => (
          <NavButton key={item.key} item={item} t={t} isRTL={isRTL} isActive={location.pathname === item.path} />
        ))}
      </nav>
    </aside>
  );
};

interface NavButtonProps {
  item: NavItem;
  t: (key: string) => string;
  isRTL: boolean;
  isActive: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ item, t, isRTL, isActive }) => {
  const Icon = item.icon;
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(item.path)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive
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
