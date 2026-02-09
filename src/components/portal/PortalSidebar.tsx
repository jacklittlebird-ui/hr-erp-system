import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PortalSection } from '@/pages/EmployeePortal';
import {
  LayoutDashboard, User, Clock, Calendar, Wallet, HandCoins,
  Star, GraduationCap, Package, FileText, MapPin, Ban,
  ClipboardList, Bell, Settings, ChevronRight, ChevronLeft,
} from 'lucide-react';

interface SidebarGroup {
  labelAr: string;
  labelEn: string;
  items: { key: PortalSection; labelAr: string; labelEn: string; icon: React.ElementType }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    labelAr: 'الرئيسية',
    labelEn: 'Main',
    items: [
      { key: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard },
      { key: 'profile', labelAr: 'ملفي الشخصي', labelEn: 'My Profile', icon: User },
    ],
  },
  {
    labelAr: 'العمل',
    labelEn: 'Work',
    items: [
      { key: 'attendance', labelAr: 'الحضور والانصراف', labelEn: 'Attendance', icon: Clock },
      { key: 'leaves', labelAr: 'الإجازات', labelEn: 'Leaves', icon: Calendar },
    ],
  },
  {
    labelAr: 'المالية',
    labelEn: 'Financial',
    items: [
      { key: 'salary', labelAr: 'الراتب', labelEn: 'Salary', icon: Wallet },
      { key: 'loans', labelAr: 'قروضي', labelEn: 'My Loans', icon: HandCoins },
    ],
  },
  {
    labelAr: 'الأداء',
    labelEn: 'Performance',
    items: [
      { key: 'evaluations', labelAr: 'تقييماتي', labelEn: 'Evaluations', icon: Star },
      { key: 'training', labelAr: 'التدريب', labelEn: 'Training', icon: GraduationCap },
    ],
  },
  {
    labelAr: 'العهد والمستندات',
    labelEn: 'Custody & Docs',
    items: [
      { key: 'custody', labelAr: 'عهد وتعهدات', labelEn: 'Custody', icon: Package },
      { key: 'documents', labelAr: 'المستندات', labelEn: 'Documents', icon: FileText },
    ],
  },
  {
    labelAr: 'الطلبات',
    labelEn: 'Requests',
    items: [
      { key: 'missions', labelAr: 'مأمورياتي', labelEn: 'Missions', icon: MapPin },
      { key: 'violations', labelAr: 'مخالفاتي', labelEn: 'Violations', icon: Ban },
      { key: 'requests', labelAr: 'الطلبات', labelEn: 'Requests', icon: ClipboardList },
    ],
  },
  {
    labelAr: 'النظام',
    labelEn: 'System',
    items: [
      { key: 'notifications', labelAr: 'الإشعارات', labelEn: 'Notifications', icon: Bell },
      { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
    ],
  },
];

interface PortalSidebarProps {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const PortalSidebar = ({ activeSection, onSectionChange, collapsed, onToggleCollapse }: PortalSidebarProps) => {
  const { language, isRTL } = useLanguage();

  const CollapseIcon = isRTL
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-card border-border flex flex-col transition-all duration-300 overflow-hidden",
        isRTL ? "border-l" : "border-r",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Collapse toggle */}
      <div className={cn("flex items-center p-3", collapsed ? "justify-center" : isRTL ? "justify-start" : "justify-end")}>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
        >
          <CollapseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {sidebarGroups.map((group, gi) => (
          <div key={gi}>
            {!collapsed && (
              <p className={cn(
                "px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60",
                isRTL && "text-right"
              )}>
                {language === 'ar' ? group.labelAr : group.labelEn}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSectionChange(item.key)}
                    title={collapsed ? (language === 'ar' ? item.labelAr : item.labelEn) : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground",
                      isRTL && !collapsed && "flex-row-reverse text-right"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
