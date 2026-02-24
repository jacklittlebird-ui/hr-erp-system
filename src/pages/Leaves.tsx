import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAttendanceData } from '@/contexts/AttendanceDataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveRequestsList } from '@/components/leaves/LeaveRequestsList';
import { PermissionRequestsList } from '@/components/leaves/PermissionRequestsList';
import { MissionRequestsList } from '@/components/leaves/MissionRequestsList';
import { OvertimeRequestsList } from '@/components/leaves/OvertimeRequestsList';
import { NewRequestForm } from '@/components/leaves/NewRequestForm';
import { LeaveBalanceOverview } from '@/components/leaves/LeaveBalanceOverview';
import { LeaveCalendar } from '@/components/leaves/LeaveCalendar';
import { LeaveApprovals } from '@/components/leaves/LeaveApprovals';
import {
  sampleLeaveRequests,
  samplePermissionRequests,
  sampleMissionRequests,
  sampleOvertimeRequests,
  sampleLeaveBalances,
} from '@/data/leavesData';
import {
  LeaveRequest,
  PermissionRequest,
  MissionRequest,
  OvertimeRequest,
  MISSION_TIME_CONFIG,
} from '@/types/leaves';
import { FileText, Plus, CheckCircle, BarChart3, Calendar, ShieldCheck, Briefcase, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Leaves = () => {
  const { t, isRTL } = useLanguage();
  const { addMissionAttendance } = useAttendanceData();
  const [activeTab, setActiveTab] = useState('leaves');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>(samplePermissionRequests);
  const [missionRequests, setMissionRequests] = useState<MissionRequest[]>(sampleMissionRequests);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>(sampleOvertimeRequests);

  const handleApproveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(req =>
      req.id === id
        ? { ...req, status: 'approved' as const, approvedBy: 'Current User', approvedDate: new Date().toISOString().split('T')[0] }
        : req
    ));
  };

  const handleRejectLeave = (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req =>
      req.id === id
        ? { ...req, status: 'rejected' as const, rejectionReason: reason }
        : req
    ));
  };

  const handleApprovePermission = (id: string) => {
    setPermissionRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleRejectPermission = (id: string, reason: string) => {
    setPermissionRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const handleApproveMission = (id: string) => {
    const mission = missionRequests.find(r => r.id === id);
    setMissionRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
    // Create attendance record for approved mission
    if (mission) {
      const config = MISSION_TIME_CONFIG[mission.missionType];
      addMissionAttendance(
        mission.employeeId,
        mission.employeeName,
        mission.employeeNameAr,
        mission.department,
        mission.date,
        config.checkIn,
        config.checkOut,
        config.hours
      );
    }
  };

  const handleRejectMission = (id: string, reason: string) => {
    setMissionRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const handleApproveOvertime = (id: string) => {
    setOvertimeRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
  };

  const handleRejectOvertime = (id: string, reason: string) => {
    setOvertimeRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const handleNewLeave = (data: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>) => {
    setLeaveRequests(prev => [...prev, {
      ...data,
      id: String(prev.length + 1),
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    }]);
    setActiveTab('leaves');
  };

  const handleNewPermission = (data: Omit<PermissionRequest, 'id' | 'status' | 'submittedDate'>) => {
    setPermissionRequests(prev => [...prev, {
      ...data,
      id: `P${prev.length + 1}`,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    }]);
    setActiveTab('permissions');
  };

  const handleNewMission = (data: Omit<MissionRequest, 'id' | 'status' | 'submittedDate'>) => {
    setMissionRequests(prev => [...prev, {
      ...data,
      id: `M${prev.length + 1}`,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    }]);
    setActiveTab('missions');
  };

  const handleNewOvertime = (data: Omit<OvertimeRequest, 'id' | 'status' | 'submittedDate'>) => {
    setOvertimeRequests(prev => [...prev, {
      ...data,
      id: `O${prev.length + 1}`,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    }]);
    setActiveTab('overtime');
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length +
    permissionRequests.filter(r => r.status === 'pending').length +
    missionRequests.filter(r => r.status === 'pending').length +
    overtimeRequests.filter(r => r.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('leaves.title')}</h1>
          <p className="text-muted-foreground">{t('leaves.subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-4 lg:grid-cols-8 mb-6",
            isRTL && "direction-rtl"
          )}>
            <TabsTrigger value="leaves" className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.leaves')}</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.permissions')}</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.missions')}</span>
            </TabsTrigger>
            <TabsTrigger value="overtime" className="flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.overtime')}</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.newRequest')}</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-1.5 relative">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.approvals')}</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.balance')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">{t('leaves.tabs.calendar')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaves">
            <LeaveRequestsList requests={leaveRequests} />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionRequestsList requests={permissionRequests} />
          </TabsContent>

          <TabsContent value="missions">
            <MissionRequestsList requests={missionRequests} />
          </TabsContent>

          <TabsContent value="overtime">
            <OvertimeRequestsList requests={overtimeRequests} />
          </TabsContent>

          <TabsContent value="new">
            <NewRequestForm
              onSubmitLeave={handleNewLeave}
              onSubmitPermission={handleNewPermission}
              onSubmitMission={handleNewMission}
              onSubmitOvertime={handleNewOvertime}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <LeaveApprovals
              leaveRequests={leaveRequests.filter(r => r.status === 'pending')}
              permissionRequests={permissionRequests.filter(r => r.status === 'pending')}
              missionRequests={missionRequests.filter(r => r.status === 'pending')}
              overtimeRequests={overtimeRequests.filter(r => r.status === 'pending')}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onApprovePermission={handleApprovePermission}
              onRejectPermission={handleRejectPermission}
              onApproveMission={handleApproveMission}
              onRejectMission={handleRejectMission}
              onApproveOvertime={handleApproveOvertime}
              onRejectOvertime={handleRejectOvertime}
            />
          </TabsContent>

          <TabsContent value="balance">
            <LeaveBalanceOverview balances={sampleLeaveBalances} />
          </TabsContent>

          <TabsContent value="calendar">
            <LeaveCalendar requests={leaveRequests.filter(r => r.status === 'approved')} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Leaves;
