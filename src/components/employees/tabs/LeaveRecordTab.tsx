import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, PlusCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaveRecordTabProps {
  employee: Employee;
}

type SubTab = 'leaves' | 'permissions' | 'extraDays';
type RecordStatus = 'approved' | 'pending' | 'rejected';

interface LeaveRecord {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: RecordStatus;
  reason: string;
  notes: string;
}

interface PermissionRecord {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: RecordStatus;
  reason: string;
  notes: string;
}

interface ExtraDayRecord {
  id: string;
  type: string;
  date: string;
  year: string;
  reason: string;
  status: RecordStatus;
}

// Mock data
const mockLeaveRecords: LeaveRecord[] = [
  { id: '1', type: 'إجازة سنوية', startDate: '2026/01/05', endDate: '2026/01/07', days: 3, status: 'approved', reason: 'إجازة عائلية', notes: '-' },
  { id: '2', type: 'إجازة مرضية', startDate: '2026/01/15', endDate: '2026/01/16', days: 2, status: 'approved', reason: 'مرض', notes: 'تم تقديم تقرير طبي' },
  { id: '3', type: 'إجازة عارضة', startDate: '2026/01/20', endDate: '2026/01/20', days: 1, status: 'pending', reason: 'ظروف شخصية', notes: '-' },
  { id: '4', type: 'إجازة سنوية', startDate: '2026/02/01', endDate: '2026/02/03', days: 3, status: 'approved', reason: 'سفر', notes: '-' },
  { id: '5', type: 'إجازة مرضية', startDate: '2026/02/10', endDate: '2026/02/10', days: 1, status: 'rejected', reason: 'صداع', notes: 'لم يتم تقديم تقرير' },
  { id: '6', type: 'إجازة عارضة', startDate: '2026/02/15', endDate: '2026/02/15', days: 1, status: 'approved', reason: 'ظروف طارئة', notes: '-' },
  { id: '7', type: 'إجازة سنوية', startDate: '2026/01/25', endDate: '2026/01/27', days: 3, status: 'pending', reason: 'إجازة', notes: '-' },
  { id: '8', type: 'إجازة مرضية', startDate: '2026/02/05', endDate: '2026/02/05', days: 1, status: 'approved', reason: 'فحص طبي', notes: '-' },
];

const mockPermissionRecords: PermissionRecord[] = [
  { id: '1', type: 'Late Arrival', date: '2026/01/05', time: '10:00', duration: '1 ساعة', status: 'approved', reason: 'adsd', notes: '-' },
  { id: '2', type: 'Late Arrival', date: '2026/01/03', time: '10:00', duration: '1 ساعة', status: 'approved', reason: 'jhodv', notes: '-' },
  { id: '3', type: 'خروج مبكر', date: '2026/01/10', time: '15:00', duration: '2 ساعة', status: 'pending', reason: 'موعد طبي', notes: '-' },
  { id: '4', type: 'Late Arrival', date: '2026/01/20', time: '09:30', duration: '30 دقيقة', status: 'rejected', reason: 'زحمة', notes: '-' },
  { id: '5', type: 'خروج مبكر', date: '2026/02/01', time: '14:00', duration: '3 ساعات', status: 'approved', reason: 'أمر شخصي', notes: '-' },
  { id: '6', type: 'Late Arrival', date: '2026/02/05', time: '10:30', duration: '1.5 ساعة', status: 'approved', reason: 'مواصلات', notes: '-' },
];

const mockExtraDayRecords: ExtraDayRecord[] = [
  { id: '1', type: 'يوم إضافي', date: '2026/01/25', year: '-', reason: 'لالا', status: 'pending' },
  { id: '2', type: 'يوم إضافي', date: '2026/01/03', year: '-', reason: 'qsd', status: 'approved' },
  { id: '3', type: 'يوم إضافي', date: '2026/01/03', year: '-', reason: 'عمل في الراحة', status: 'approved' },
  { id: '4', type: 'يوم إضافي', date: '2026/02/01', year: '-', reason: 'عمل إضافي', status: 'approved' },
  { id: '5', type: 'يوم إضافي', date: '2026/02/10', year: '-', reason: 'بديل', status: 'pending' },
  { id: '6', type: 'يوم إضافي', date: '2026/01/15', year: '-', reason: 'عمل يوم جمعة', status: 'approved' },
  { id: '7', type: 'يوم إضافي', date: '2026/02/07', year: '-', reason: 'عمل في إجازة رسمية', status: 'approved' },
  { id: '8', type: 'يوم إضافي', date: '2026/01/10', year: '-', reason: 'تعويض', status: 'rejected' },
];

const statusConfig: Record<RecordStatus, { label: string; labelAr: string; bg: string; text: string; border: string }> = {
  approved: { label: 'Approved', labelAr: 'موافق عليه', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  pending: { label: 'Pending', labelAr: 'قيد المراجعة', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  rejected: { label: 'Rejected', labelAr: 'مرفوضة', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

const StatusBadge = ({ status }: { status: RecordStatus }) => {
  const { language } = useLanguage();
  const config = statusConfig[status];
  return (
    <span className={cn('px-3 py-1 rounded-md text-xs font-semibold border', config.bg, config.text, config.border)}>
      {language === 'ar' ? config.labelAr : config.label}
    </span>
  );
};

// Summary card component for status counts
const StatusSummaryCards = ({ 
  approved, pending, rejected, 
  approvedLabel, pendingLabel, rejectedLabel 
}: { 
  approved: number; pending: number; rejected: number;
  approvedLabel: string; pendingLabel: string; rejectedLabel: string;
}) => {
  const { isRTL } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 text-center">
        <p className={cn("text-sm font-medium text-yellow-700 mb-1", isRTL && "text-right")}>{pendingLabel}</p>
        <p className="text-3xl font-bold text-yellow-600">{pending}</p>
      </div>
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center">
        <p className={cn("text-sm font-medium text-green-700 mb-1", isRTL && "text-right")}>{approvedLabel}</p>
        <p className="text-3xl font-bold text-green-600">{approved}</p>
      </div>
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-center">
        <p className={cn("text-sm font-medium text-red-700 mb-1", isRTL && "text-right")}>{rejectedLabel}</p>
        <p className="text-3xl font-bold text-red-600">{rejected}</p>
      </div>
    </div>
  );
};

export const LeaveRecordTab = ({ employee }: LeaveRecordTabProps) => {
  const { t, isRTL, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('leaves');

  // Computed summaries
  const leaveSummary = useMemo(() => {
    const approved = mockLeaveRecords.filter(r => r.status === 'approved');
    const usedDays = approved.reduce((sum, r) => sum + r.days, 0);
    return {
      total: 21,
      used: usedDays,
      remaining: 21 - usedDays,
      approvedCount: approved.length,
      pendingCount: mockLeaveRecords.filter(r => r.status === 'pending').length,
      rejectedCount: mockLeaveRecords.filter(r => r.status === 'rejected').length,
    };
  }, []);

  const permissionSummary = useMemo(() => ({
    total: 24,
    used: 12,
    remaining: 12,
    approvedCount: mockPermissionRecords.filter(r => r.status === 'approved').length,
    pendingCount: mockPermissionRecords.filter(r => r.status === 'pending').length,
    rejectedCount: mockPermissionRecords.filter(r => r.status === 'rejected').length,
  }), []);

  const extraDaysSummary = useMemo(() => {
    const approved = mockExtraDayRecords.filter(r => r.status === 'approved');
    return {
      totalAdded: approved.length,
      approvedCount: approved.length,
      pendingCount: mockExtraDayRecords.filter(r => r.status === 'pending').length,
      rejectedCount: mockExtraDayRecords.filter(r => r.status === 'rejected').length,
    };
  }, []);

  const subTabs = [
    { id: 'leaves' as SubTab, icon: CalendarDays, label: t('leaveRecord.leaves'), count: mockLeaveRecords.length },
    { id: 'permissions' as SubTab, icon: Clock, label: t('leaveRecord.permissions'), count: mockPermissionRecords.length },
    { id: 'extraDays' as SubTab, icon: PlusCircle, label: t('leaveRecord.extraDays'), count: mockExtraDayRecords.length },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Annual Leave Balance */}
        <div className="relative rounded-2xl overflow-hidden h-28"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #c4b5fd 100%)' }}>
          <div className={cn("absolute inset-0 p-5 flex flex-col justify-between", isRTL ? "text-right" : "text-left")}>
            <p className="text-white/90 text-sm font-medium">{t('leaveRecord.annualLeaveBalance')}</p>
            <div>
              <span className="text-4xl font-bold text-white">{leaveSummary.remaining}</span>
              <span className="text-white/80 text-sm mr-2 ml-2">{t('leaveRecord.dayAvailable')}</span>
            </div>
          </div>
        </div>

        {/* Permissions Balance */}
        <div className="relative rounded-2xl overflow-hidden h-28"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%)' }}>
          <div className={cn("absolute inset-0 p-5 flex flex-col justify-between", isRTL ? "text-right" : "text-left")}>
            <p className="text-white/90 text-sm font-medium">{t('leaveRecord.permissionsBalance')}</p>
            <div>
              <span className="text-4xl font-bold text-white">{permissionSummary.remaining}</span>
              <span className="text-white/80 text-sm mr-2 ml-2">{t('leaveRecord.hourAvailable')}</span>
            </div>
          </div>
        </div>

        {/* Extra Days */}
        <div className="relative rounded-2xl overflow-hidden h-28"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #67e8f9 100%)' }}>
          <div className={cn("absolute inset-0 p-5 flex flex-col justify-between", isRTL ? "text-right" : "text-left")}>
            <p className="text-white/90 text-sm font-medium">{t('leaveRecord.extraDaysLabel')}</p>
            <div>
              <span className="text-4xl font-bold text-white">{extraDaysSummary.totalAdded}</span>
              <span className="text-white/80 text-sm mr-2 ml-2">{t('leaveRecord.dayAdded')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className={cn("flex items-center gap-2 justify-end", !isRTL && "justify-start")}>
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-muted/50",
                isRTL && "flex-row-reverse"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={cn(
                "min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-xs font-bold",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeSubTab === 'leaves' && <LeavesContent summary={leaveSummary} />}
      {activeSubTab === 'permissions' && <PermissionsContent summary={permissionSummary} />}
      {activeSubTab === 'extraDays' && <ExtraDaysContent summary={extraDaysSummary} />}
    </div>
  );
};

// ========== Leaves Sub-Tab ==========
const LeavesContent = ({ summary }: { summary: { approvedCount: number; pendingCount: number; rejectedCount: number } }) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Status Summary */}
      <StatusSummaryCards
        approved={summary.approvedCount}
        pending={summary.pendingCount}
        rejected={summary.rejectedCount}
        approvedLabel={t('leaveRecord.approvedLeaves')}
        pendingLabel={t('leaveRecord.pendingLeaves')}
        rejectedLabel={t('leaveRecord.rejectedLeaves')}
      />

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-border/30">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.leaveType')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.startDate')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.endDate')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.days')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.status')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.reason')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaveRecords.map((record, idx) => (
              <tr key={record.id} className={cn("border-b border-border/20", idx % 2 === 0 ? "bg-card" : "bg-muted/30")}>
                <td className="px-4 py-3 text-sm text-foreground">{record.type}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.startDate}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.endDate}</td>
                <td className="px-4 py-3 text-sm text-foreground font-medium">{record.days}</td>
                <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                <td className="px-4 py-3 text-sm text-foreground">{record.reason}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== Permissions Sub-Tab ==========
const PermissionsContent = ({ summary }: { summary: { approvedCount: number; pendingCount: number; rejectedCount: number } }) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Status Summary - horizontal bars like the reference */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 flex items-center justify-end gap-3" dir="rtl">
          <span className="text-yellow-700 font-semibold text-sm">{t('leaveRecord.pendingLabel')}</span>
          <span className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</span>
        </div>
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center justify-end gap-3" dir="rtl">
          <span className="text-green-700 font-semibold text-sm">{t('leaveRecord.approvedLabel')}</span>
          <span className="text-2xl font-bold text-green-600">{summary.approvedCount}</span>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center justify-end gap-3" dir="rtl">
          <span className="text-red-700 font-semibold text-sm">{t('leaveRecord.rejectedLabel')}</span>
          <span className="text-2xl font-bold text-red-600">{summary.rejectedCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-border/30">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.permType')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.date')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.time')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.duration')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.status')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.reason')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {mockPermissionRecords.map((record, idx) => (
              <tr key={record.id} className={cn("border-b border-border/20", idx % 2 === 0 ? "bg-card" : "bg-muted/30")}>
                <td className="px-4 py-3 text-sm text-foreground">{record.type}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.date}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.time}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.duration}</td>
                <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                <td className="px-4 py-3 text-sm text-foreground">{record.reason}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== Extra Days Sub-Tab ==========
const ExtraDaysContent = ({ summary }: { summary: { totalAdded: number; approvedCount: number; pendingCount: number; rejectedCount: number } }) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-xl p-4 text-center text-white font-semibold flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
        <PlusCircle className="w-5 h-5" />
        {t('leaveRecord.extraDaysCurrentYear')}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 text-center">
          <p className="text-sm font-medium text-green-700 mb-1">{t('leaveRecord.approvedDays')}</p>
          <p className="text-3xl font-bold text-green-600">{summary.approvedCount}</p>
        </div>
        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-sm font-medium text-yellow-700 mb-1">{t('leaveRecord.pendingDays')}</p>
          <p className="text-3xl font-bold text-yellow-600">{summary.pendingCount}</p>
        </div>
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-700 mb-1">{t('leaveRecord.totalAddedDays')}</p>
          <p className="text-3xl font-bold text-blue-600">{summary.totalAdded}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-border/30">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/80">
              <th className={cn("px-4 py-3 text-sm font-semibold text-foreground", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.date')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold text-foreground", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.year')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold text-foreground", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.additionType')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold text-foreground", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.reason')}</th>
              <th className={cn("px-4 py-3 text-sm font-semibold text-foreground", isRTL ? "text-right" : "text-left")}>{t('leaveRecord.status')}</th>
            </tr>
          </thead>
          <tbody>
            {mockExtraDayRecords.map((record, idx) => (
              <tr key={record.id} className={cn("border-b border-border/20", idx % 2 === 0 ? "bg-card" : "bg-muted/30")}>
                <td className="px-4 py-3 text-sm text-foreground">{record.date}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.year}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.type}</td>
                <td className="px-4 py-3 text-sm text-foreground">{record.reason}</td>
                <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
