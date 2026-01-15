import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveRequestsList } from '@/components/leaves/LeaveRequestsList';
import { LeaveBalanceOverview } from '@/components/leaves/LeaveBalanceOverview';
import { LeaveCalendar } from '@/components/leaves/LeaveCalendar';
import { LeaveApprovals } from '@/components/leaves/LeaveApprovals';
import { Calendar, FileText, BarChart3, CheckCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'casual' | 'unpaid' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

export interface EmployeeLeaveBalance {
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  annualTotal: number;
  annualUsed: number;
  annualRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  casualTotal: number;
  casualUsed: number;
  casualRemaining: number;
}

// Sample data
export const sampleLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'Ahmed Mohamed',
    employeeNameAr: 'أحمد محمد',
    department: 'IT',
    leaveType: 'annual',
    startDate: '2024-02-15',
    endDate: '2024-02-20',
    days: 5,
    reason: 'Family vacation',
    status: 'pending',
    submittedDate: '2024-02-10',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Sara Ali',
    employeeNameAr: 'سارة علي',
    department: 'HR',
    leaveType: 'sick',
    startDate: '2024-02-12',
    endDate: '2024-02-13',
    days: 2,
    reason: 'Medical appointment',
    status: 'approved',
    submittedDate: '2024-02-11',
    approvedBy: 'Manager',
    approvedDate: '2024-02-11',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Mohamed Hassan',
    employeeNameAr: 'محمد حسن',
    department: 'Finance',
    leaveType: 'casual',
    startDate: '2024-02-18',
    endDate: '2024-02-18',
    days: 1,
    reason: 'Personal matter',
    status: 'pending',
    submittedDate: '2024-02-15',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Fatima Omar',
    employeeNameAr: 'فاطمة عمر',
    department: 'Sales',
    leaveType: 'annual',
    startDate: '2024-02-25',
    endDate: '2024-03-01',
    days: 5,
    reason: 'Travel abroad',
    status: 'rejected',
    submittedDate: '2024-02-14',
    rejectionReason: 'Conflict with project deadline',
  },
];

export const sampleLeaveBalances: EmployeeLeaveBalance[] = [
  {
    employeeId: 'EMP001',
    employeeName: 'Ahmed Mohamed',
    employeeNameAr: 'أحمد محمد',
    department: 'IT',
    annualTotal: 21,
    annualUsed: 5,
    annualRemaining: 16,
    sickTotal: 15,
    sickUsed: 2,
    sickRemaining: 13,
    casualTotal: 7,
    casualUsed: 1,
    casualRemaining: 6,
  },
  {
    employeeId: 'EMP002',
    employeeName: 'Sara Ali',
    employeeNameAr: 'سارة علي',
    department: 'HR',
    annualTotal: 21,
    annualUsed: 10,
    annualRemaining: 11,
    sickTotal: 15,
    sickUsed: 5,
    sickRemaining: 10,
    casualTotal: 7,
    casualUsed: 3,
    casualRemaining: 4,
  },
  {
    employeeId: 'EMP003',
    employeeName: 'Mohamed Hassan',
    employeeNameAr: 'محمد حسن',
    department: 'Finance',
    annualTotal: 21,
    annualUsed: 0,
    annualRemaining: 21,
    sickTotal: 15,
    sickUsed: 0,
    sickRemaining: 15,
    casualTotal: 7,
    casualUsed: 2,
    casualRemaining: 5,
  },
];

const Leaves = () => {
  const { t, isRTL, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(sampleLeaveRequests);

  const handleApprove = (id: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'approved' as const, approvedBy: 'Current User', approvedDate: new Date().toISOString().split('T')[0] }
        : req
    ));
  };

  const handleReject = (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'rejected' as const, rejectionReason: reason }
        : req
    ));
  };

  const handleNewRequest = (request: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: String(leaveRequests.length + 1),
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [...prev, newRequest]);
    setActiveTab('requests');
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('leaves.title')}</h1>
          <p className="text-muted-foreground">{t('leaves.subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-5 mb-6",
            isRTL && "direction-rtl"
          )}>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t('leaves.tabs.requests')}</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('leaves.tabs.newRequest')}</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2 relative">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('leaves.tabs.approvals')}</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('leaves.tabs.balance')}</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('leaves.tabs.calendar')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <LeaveRequestsList requests={leaveRequests} />
          </TabsContent>

          <TabsContent value="new">
            <LeaveRequestForm onSubmit={handleNewRequest} />
          </TabsContent>

          <TabsContent value="approvals">
            <LeaveApprovals 
              requests={leaveRequests.filter(r => r.status === 'pending')} 
              onApprove={handleApprove}
              onReject={handleReject}
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
