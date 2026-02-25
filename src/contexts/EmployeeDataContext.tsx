import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeDataContextType {
  employees: Employee[];
  loading: boolean;
  getEmployee: (id: string) => Employee | undefined;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  addEmployee: (employee: Employee) => void;
  refreshEmployees: () => Promise<void>;
}

const EmployeeDataContext = createContext<EmployeeDataContextType | undefined>(undefined);

// Map DB row → frontend Employee
function mapRow(row: any): Employee {
  return {
    id: row.id,
    employeeId: row.employee_code,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    department: row.departments?.name_ar || '-',
    jobTitle: row.job_title_ar || '',
    phone: row.phone || '',
    status: row.status as Employee['status'],
    stationLocation: row.stations?.code || '',
    firstName: row.name_en?.split(' ')[0] || '',
    birthDate: row.birth_date || undefined,
    birthPlace: row.birth_place || undefined,
    gender: row.gender || undefined,
    religion: row.religion || undefined,
    nationality: row.nationality || undefined,
    maritalStatus: row.marital_status || undefined,
    childrenCount: row.children_count ?? undefined,
    educationAr: row.education_ar || undefined,
    graduationYear: row.graduation_year || undefined,
    email: row.email || undefined,
    mobile: row.phone || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    governorate: row.governorate || undefined,
    nationalId: row.national_id || undefined,
    idIssueDate: row.id_issue_date || undefined,
    idExpiryDate: row.id_expiry_date || undefined,
    issuingAuthority: row.issuing_authority || undefined,
    militaryStatus: row.military_status || undefined,
    departmentId: row.department_id || undefined,
    jobTitleAr: row.job_title_ar || undefined,
    jobTitleEn: row.job_title_en || undefined,
    jobLevel: row.job_level || undefined,
    jobDegree: row.job_degree || undefined,
    hireDate: row.hire_date || undefined,
    employmentStatus: row.employment_status || undefined,
    resignationDate: row.resignation_date || undefined,
    resignationReason: row.resignation_reason || undefined,
    socialInsuranceNo: row.social_insurance_no || undefined,
    socialInsuranceStartDate: row.social_insurance_start_date || undefined,
    socialInsuranceEndDate: row.social_insurance_end_date || undefined,
    healthInsuranceCardNo: row.health_insurance_card_no || undefined,
    hasHealthInsurance: row.has_health_insurance ?? undefined,
    hasSocialInsurance: row.has_social_insurance ?? undefined,
    contractType: row.contract_type || undefined,
    basicSalary: row.basic_salary ?? undefined,
    annualLeaveBalance: row.annual_leave_balance ?? undefined,
    sickLeaveBalance: row.sick_leave_balance ?? undefined,
    bankAccountNumber: row.bank_account_number || undefined,
    bankIdNumber: row.bank_id_number || undefined,
    bankAccountType: row.bank_account_type || undefined,
    bankName: row.bank_name || undefined,
    notes: row.notes || undefined,
  };
}

// Map frontend updates → DB columns
function mapUpdates(updates: Partial<Employee>): Record<string, any> {
  const map: Record<string, string> = {
    nameAr: 'name_ar',
    nameEn: 'name_en',
    employeeId: 'employee_code',
    phone: 'phone',
    status: 'status',
    birthDate: 'birth_date',
    birthPlace: 'birth_place',
    gender: 'gender',
    religion: 'religion',
    nationality: 'nationality',
    maritalStatus: 'marital_status',
    childrenCount: 'children_count',
    educationAr: 'education_ar',
    graduationYear: 'graduation_year',
    email: 'email',
    address: 'address',
    city: 'city',
    governorate: 'governorate',
    nationalId: 'national_id',
    idIssueDate: 'id_issue_date',
    idExpiryDate: 'id_expiry_date',
    issuingAuthority: 'issuing_authority',
    militaryStatus: 'military_status',
    departmentId: 'department_id',
    jobTitleAr: 'job_title_ar',
    jobTitleEn: 'job_title_en',
    jobLevel: 'job_level',
    jobDegree: 'job_degree',
    hireDate: 'hire_date',
    employmentStatus: 'employment_status',
    resignationDate: 'resignation_date',
    resignationReason: 'resignation_reason',
    socialInsuranceNo: 'social_insurance_no',
    socialInsuranceStartDate: 'social_insurance_start_date',
    socialInsuranceEndDate: 'social_insurance_end_date',
    healthInsuranceCardNo: 'health_insurance_card_no',
    hasHealthInsurance: 'has_health_insurance',
    hasSocialInsurance: 'has_social_insurance',
    contractType: 'contract_type',
    basicSalary: 'basic_salary',
    annualLeaveBalance: 'annual_leave_balance',
    sickLeaveBalance: 'sick_leave_balance',
    bankAccountNumber: 'bank_account_number',
    bankIdNumber: 'bank_id_number',
    bankAccountType: 'bank_account_type',
    bankName: 'bank_name',
    notes: 'notes',
    jobTitle: 'job_title_ar',
    // Additional fields that were missing
    mobile: 'phone',
    homePhone: 'phone',
  };

  const dbUpdates: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    const dbCol = map[key];
    if (dbCol) {
      dbUpdates[dbCol] = value === '' ? null : value;
    }
  }
  return dbUpdates;
}

export const EmployeeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*, departments(name_ar, name_en), stations(code, name_ar, name_en)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } else {
      setEmployees((data || []).map(mapRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const getEmployee = useCallback((id: string) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  const getEmployeeById = useCallback((employeeId: string) => {
    return employees.find(e => e.employeeId === employeeId);
  }, [employees]);

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    const dbUpdates = mapUpdates(updates);
    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await supabase.from('employees').update(dbUpdates).eq('id', id);
    if (error) {
      console.error('Error updating employee:', error);
      return;
    }

    // Optimistic update locally + re-fetch for joined data
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    const emp = employees.find(e => e.id === id);
    addNotification({ titleAr: `تم تحديث بيانات الموظف: ${emp?.nameAr || id}`, titleEn: `Employee updated: ${emp?.nameEn || id}`, type: 'success', module: 'employee' });
  }, [employees, addNotification]);

  const addEmployee = useCallback(async (employee: Employee) => {
    const dbRow: any = {
      employee_code: employee.employeeId,
      name_ar: employee.nameAr,
      name_en: employee.nameEn,
      phone: employee.phone || '',
      status: employee.status || 'active',
      job_title_ar: employee.jobTitle || employee.jobTitleAr || '',
      job_title_en: employee.jobTitleEn || '',
      email: employee.email || '',
    };

    const { data, error } = await supabase.from('employees').insert(dbRow).select('*, departments(name_ar, name_en), stations(code, name_ar, name_en)').single();
    if (error) {
      console.error('Error adding employee:', error);
      return;
    }
    if (data) {
      setEmployees(prev => [...prev, mapRow(data)]);
    }
    addNotification({ titleAr: `تم إضافة موظف جديد: ${employee.nameAr}`, titleEn: `New employee added: ${employee.nameEn}`, type: 'success', module: 'employee' });
  }, [addNotification]);

  return (
    <EmployeeDataContext.Provider value={{ employees, loading, getEmployee, getEmployeeById, updateEmployee, addEmployee, refreshEmployees: fetchEmployees }}>
      {children}
    </EmployeeDataContext.Provider>
  );
};

export const useEmployeeData = () => {
  const ctx = useContext(EmployeeDataContext);
  if (!ctx) throw new Error('useEmployeeData must be used within EmployeeDataProvider');
  return ctx;
};
