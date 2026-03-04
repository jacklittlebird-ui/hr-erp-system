import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalDashboard } from '@/components/portal/sections/PortalDashboard';
import { PortalProfile } from '@/components/portal/sections/PortalProfile';
import { PortalAttendance } from '@/components/portal/sections/PortalAttendance';
import { PortalLeaves } from '@/components/portal/sections/PortalLeaves';
import { PortalSalary } from '@/components/portal/sections/PortalSalary';
import { PortalLoans } from '@/components/portal/sections/PortalLoans';
import { PortalEvaluations } from '@/components/portal/sections/PortalEvaluations';
import { PortalTraining } from '@/components/portal/sections/PortalTraining';
import { PortalCustody } from '@/components/portal/sections/PortalCustody';
import { PortalDocuments } from '@/components/portal/sections/PortalDocuments';
import { PortalMissions } from '@/components/portal/sections/PortalMissions';
import { PortalViolations } from '@/components/portal/sections/PortalViolations';
import { PortalRequests } from '@/components/portal/sections/PortalRequests';
import { PortalNotifications } from '@/components/portal/sections/PortalNotifications';
import { PortalSettings } from '@/components/portal/sections/PortalSettings';
import { PortalUniforms } from '@/components/portal/sections/PortalUniforms';

export type PortalSection =
  | 'dashboard' | 'profile' | 'attendance' | 'leaves'
  | 'salary' | 'loans' | 'evaluations' | 'training'
  | 'custody' | 'documents' | 'missions' | 'violations'
  | 'requests' | 'notifications' | 'settings' | 'uniforms';

const sectionComponents: Record<PortalSection, React.FC> = {
  dashboard: PortalDashboard,
  profile: PortalProfile,
  attendance: PortalAttendance,
  leaves: PortalLeaves,
  salary: PortalSalary,
  loans: PortalLoans,
  evaluations: PortalEvaluations,
  training: PortalTraining,
  custody: PortalCustody,
  uniforms: PortalUniforms,
  documents: PortalDocuments,
  missions: PortalMissions,
  violations: PortalViolations,
  requests: PortalRequests,
  notifications: PortalNotifications,
  settings: PortalSettings,
};

const EmployeePortal = () => {
  const { isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<PortalSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pull-to-refresh
  const mainRef = useRef<HTMLElement>(null);
  const touchStartY = useRef(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!mainRef.current || refreshing) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 100 && mainRef.current.scrollTop <= 0) {
      setRefreshing(true);
      window.location.reload();
    }
  }, [refreshing]);

  const ActiveComponent = sectionComponents[activeSection];

  return (
    <div className={cn("min-h-screen bg-background flex", isRTL ? "flex-row-reverse font-arabic" : "font-sans")}>
      <PortalSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggleCollapse={() => {
          if (isMobile) {
            setMobileOpen(!mobileOpen);
          } else {
            setSidebarCollapsed(!sidebarCollapsed);
          }
        }}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
        <PortalHeader onToggleSidebar={() => {
          if (isMobile) {
            setMobileOpen(!mobileOpen);
          } else {
            setSidebarCollapsed(!sidebarCollapsed);
          }
        }} />
        <main
          ref={mainRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="flex-1 p-3 md:p-6 overflow-auto min-w-0"
        >
          {refreshing && (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
};

export default EmployeePortal;
