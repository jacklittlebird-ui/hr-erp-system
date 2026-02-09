export interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  managerId: string;
  employeeCount: number;
  createdAt: string;
}

export const initialDepartments: Department[] = [
  { id: '1', nameAr: 'الإدارة', nameEn: 'Administration', managerId: '1', employeeCount: 5, createdAt: '2024-01-01' },
  { id: '2', nameAr: 'تقنية المعلومات', nameEn: 'Information Technology', managerId: '2', employeeCount: 8, createdAt: '2024-01-01' },
  { id: '3', nameAr: 'الموارد البشرية', nameEn: 'Human Resources', managerId: '3', employeeCount: 4, createdAt: '2024-03-15' },
  { id: '4', nameAr: 'المالية', nameEn: 'Finance', managerId: '1', employeeCount: 6, createdAt: '2024-02-01' },
  { id: '5', nameAr: 'المبيعات', nameEn: 'Sales', managerId: '4', employeeCount: 10, createdAt: '2024-04-01' },
  { id: '6', nameAr: 'التسويق', nameEn: 'Marketing', managerId: '2', employeeCount: 3, createdAt: '2024-05-01' },
];
