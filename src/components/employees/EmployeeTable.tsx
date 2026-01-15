import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/pages/Employees';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
}

export const EmployeeTable = ({ employees, onEdit }: EmployeeTableProps) => {
  const { t, isRTL, language } = useLanguage();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.photo')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.employeeId')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.name')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.department')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.jobTitle')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.phone')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.status')}
            </TableHead>
            <TableHead className={cn("text-primary-foreground font-semibold", isRTL && "text-right")}>
              {t('employees.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/50">
              <TableCell>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(language === 'ar' ? employee.nameAr : employee.nameEn)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className={cn("font-medium", isRTL && "text-right")}>
                {employee.employeeId}
              </TableCell>
              <TableCell className={cn(isRTL && "text-right")}>
                {language === 'ar' ? employee.nameAr : employee.nameEn}
              </TableCell>
              <TableCell className={cn(isRTL && "text-right")}>
                {employee.department}
              </TableCell>
              <TableCell className={cn(isRTL && "text-right")}>
                {employee.jobTitle}
              </TableCell>
              <TableCell className={cn(isRTL && "text-right")} dir="ltr">
                {employee.phone}
              </TableCell>
              <TableCell className={cn(isRTL && "text-right")}>
                {employee.status === 'active' ? (
                  <Badge className="bg-success text-success-foreground hover:bg-success/90">
                    {t('employees.status.active')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-warning border-warning">
                    {t('employees.status.inactive')}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className={cn("flex gap-1", isRTL && "flex-row-reverse justify-end")}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
