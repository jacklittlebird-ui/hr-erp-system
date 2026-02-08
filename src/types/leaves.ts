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

export interface PermissionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  permissionType: 'early_leave' | 'late_arrival' | 'personal' | 'medical';
  date: string;
  fromTime: string;
  toTime: string;
  durationHours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export interface MissionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  missionType: 'internal' | 'external' | 'training' | 'meeting' | 'client_visit';
  date: string;
  destination?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  department: string;
  date: string;
  hours: number;
  overtimeType: 'regular' | 'holiday' | 'weekend';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
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
