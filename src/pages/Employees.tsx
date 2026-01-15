import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EditEmployeeDialog } from '@/components/employees/EditEmployeeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Employee {
  id: string;
  employeeId: string;
  nameAr: string;
  nameEn: string;
  department: string;
  jobTitle: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  // Basic Info
  stationLocation?: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  birthDate?: string;
  birthPlace?: string;
  birthGovernorate?: string;
  gender?: string;
  religion?: string;
  nationality?: string;
  maritalStatus?: string;
  childrenCount?: number;
  educationAr?: string;
  graduationYear?: string;
  // Contact Info
  email?: string;
  homePhone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  governorate?: string;
  // Identity & Documents
  nationalId?: string;
  idIssueDate?: string;
  idExpiryDate?: string;
  issuingAuthority?: string;
  issuingGovernorate?: string;
  militaryStatus?: string;
  // Job Info
  departmentId?: string;
  jobTitleAr?: string;
  jobTitleEn?: string;
  jobLevel?: string;
  jobDegree?: string;
  hireDate?: string;
  recruitedBy?: string;
  employmentStatus?: string;
  resignationDate?: string;
  resignationReason?: string;
  // Insurance
  socialInsuranceNo?: string;
  socialInsuranceStartDate?: string;
  socialInsuranceEndDate?: string;
  healthInsuranceCardNo?: string;
  hasHealthInsurance?: boolean;
  hasGovernmentHealthInsurance?: boolean;
  hasSocialInsurance?: boolean;
  contractType?: string;
  // Permits
  hasCairoAirportTempPermit?: boolean;
  cairoAirportAnnualPermitNo?: string;
  hasCairoAirportAnnualPermit?: boolean;
  tempPermitNo?: string;
  annualPermitNo?: string;
  hasAirportsTempPermit?: boolean;
  airportsTempPermitNo?: string;
  airportsAnnualPermitNo?: string;
  airportsPermitType?: string;
  permitNameEn?: string;
  permitNameAr?: string;
  // Certificates
  hasQualificationCert?: boolean;
  hasMilitaryServiceCert?: boolean;
  hasBirthCert?: boolean;
  hasIdCopy?: boolean;
  hasPledge?: boolean;
  hasContract?: boolean;
  hasReceipt?: boolean;
  attachments?: string;
  // Departments access
  departmentAccess?: string[];
  // Other
  notes?: string;
  // Leave Balance
  annualLeaveBalance?: number;
  sickLeaveBalance?: number;
  // Salary
  basicSalary?: number;
  allowances?: number;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'E176788294962',
    nameAr: 'موظف تجريبي 176788294962',
    nameEn: 'Test Employee 176788294962',
    department: '-',
    jobTitle: 'موظف',
    phone: '176788294962',
    status: 'inactive',
  },
  {
    id: '2',
    employeeId: 'Emp001',
    nameAr: 'جلال عبد الرازق عبد العليم',
    nameEn: 'Galal Abdel Razek Abdel Alim',
    department: '-',
    jobTitle: 'موظف',
    phone: '01000010001',
    status: 'active',
  },
];

const Employees = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredEmployees = employees.filter(emp => 
    emp.nameAr.includes(searchQuery) || 
    emp.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center",
          isRTL && "sm:flex-row-reverse"
        )}>
          <h1 className="text-2xl font-bold text-foreground">
            {t('employees.title')}
          </h1>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {t('employees.refresh')}
            </Button>
            <Button size="sm" className="gap-2 bg-success hover:bg-success/90">
              <Plus className="w-4 h-4" />
              {t('employees.addEmployee')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
            isRTL ? "right-3" : "left-3"
          )} />
          <Input
            placeholder={t('employees.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("w-full", isRTL ? "pr-10 text-right" : "pl-10")}
          />
        </div>

        {/* Table */}
        <EmployeeTable 
          employees={filteredEmployees} 
          onEdit={handleEdit}
        />

        {/* Edit Dialog */}
        <EditEmployeeDialog
          employee={selectedEmployee}
          open={isEditDialogOpen}
          onClose={handleCloseDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Employees;
