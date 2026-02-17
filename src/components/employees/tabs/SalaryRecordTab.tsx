import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalaryData, calcFullGross, calcNet } from '@/contexts/SalaryDataContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SalaryRecordTabProps {
  employee: Employee;
}

export const SalaryRecordTab = ({ employee }: SalaryRecordTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { salaryRecords } = useSalaryData();

  const records = useMemo(
    () => salaryRecords.filter(r => r.employeeId === employee.employeeId).sort((a, b) => b.year.localeCompare(a.year)),
    [salaryRecords, employee.employeeId]
  );

  return (
    <div className="p-6 space-y-6">
      <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
        <Receipt className="w-5 h-5 text-primary" />
        {ar ? 'سجل الرواتب' : 'Salary Record'}
      </h3>

      <div className="rounded-xl overflow-hidden border border-border/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground">{ar ? 'السنة' : 'Year'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الأساسي' : 'Basic'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'مواصلات' : 'Transport'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'حوافز' : 'Incentives'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الإجمالي' : 'Gross'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الصافي' : 'Net'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد سجلات رواتب' : 'No salary records'}
                </TableCell>
              </TableRow>
            ) : (
              records.map(r => (
                <TableRow key={r.year}>
                  <TableCell><Badge variant="outline">{r.year}</Badge></TableCell>
                  <TableCell>{r.basicSalary.toLocaleString()}</TableCell>
                  <TableCell>{r.transportAllowance.toLocaleString()}</TableCell>
                  <TableCell>{r.incentives.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-green-600">{calcFullGross(r).toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-blue-600">{calcNet(r).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
