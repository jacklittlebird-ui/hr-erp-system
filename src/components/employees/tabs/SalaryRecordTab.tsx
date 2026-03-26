import { useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePayrollData } from '@/contexts/PayrollDataContext';

interface PayrollEntry {
  id: string;
  month: string;
  year: string;
  basicSalary: number;
  transportAllowance: number;
  incentives: number;
  stationAllowance: number;
  mobileAllowance: number;
  livingAllowance: number;
  overtimePay: number;
  bonusAmount: number;
  gross: number;
  employeeInsurance: number;
  healthInsurance: number;
  employerSocialInsurance: number;
  incomeTax: number;
  loanPayment: number;
  advanceAmount: number;
  mobileBill: number;
  leaveDeduction: number;
  penaltyAmount: number;
  totalDeductions: number;
  netSalary: number;
}

interface SalaryRecordTabProps {
  employee: Employee;
}

const monthNames: Record<string, { ar: string; en: string }> = {
  '01': { ar: 'يناير', en: 'January' },
  '02': { ar: 'فبراير', en: 'February' },
  '03': { ar: 'مارس', en: 'March' },
  '04': { ar: 'أبريل', en: 'April' },
  '05': { ar: 'مايو', en: 'May' },
  '06': { ar: 'يونيو', en: 'June' },
  '07': { ar: 'يوليو', en: 'July' },
  '08': { ar: 'أغسطس', en: 'August' },
  '09': { ar: 'سبتمبر', en: 'September' },
  '10': { ar: 'أكتوبر', en: 'October' },
  '11': { ar: 'نوفمبر', en: 'November' },
  '12': { ar: 'ديسمبر', en: 'December' },
};

export const SalaryRecordTab = ({ employee }: SalaryRecordTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeePayroll, refreshPayroll } = usePayrollData();

  useEffect(() => {
    refreshPayroll();
  }, [refreshPayroll]);

  const records = useMemo<PayrollEntry[]>(() => {
    return getEmployeePayroll(employee.id).map((record) => ({
      id: `${record.employeeId}-${record.year}-${record.month}`,
      month: record.month,
      year: record.year,
      basicSalary: record.basicSalary,
      transportAllowance: record.transportAllowance,
      incentives: record.incentives,
      stationAllowance: record.stationAllowance,
      mobileAllowance: record.mobileAllowance,
      livingAllowance: record.livingAllowance,
      overtimePay: record.overtimePay,
      bonusAmount: record.bonusAmount,
      gross: record.gross,
      employeeInsurance: record.employeeInsurance,
      healthInsurance: record.healthInsurance,
      employerSocialInsurance: record.employerSocialInsurance,
      incomeTax: record.incomeTax,
      loanPayment: record.loanPayment,
      advanceAmount: record.advanceAmount,
      mobileBill: record.mobileBill,
      leaveDeduction: record.leaveDeduction,
      penaltyAmount: record.penaltyAmount,
      totalDeductions: record.totalDeductions,
      netSalary: record.netSalary,
    }));
  }, [employee.id, getEmployeePayroll]);

  const getMonthLabel = (m: string) => {
    const mn = monthNames[m];
    return mn ? (ar ? mn.ar : mn.en) : m;
  };

  return (
    <div className="p-6 space-y-6">
      <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
        <Receipt className="w-5 h-5 text-primary" />
        {ar ? 'سجل الرواتب' : 'Salary Record'}
      </h3>

      <div className="rounded-xl overflow-hidden border border-border/30 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'الشهر' : 'Month'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'السنة' : 'Year'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'الأساسي' : 'Basic'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'مواصلات' : 'Transport'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'حوافز' : 'Incentives'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'بدل محطة' : 'Station'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'بدل موبايل' : 'Mobile'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'بدل معيشة' : 'Living'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'إضافي' : 'Overtime'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'مكافأة' : 'Bonus'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap font-bold">{ar ? 'الإجمالي' : 'Gross'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'تأمين موظف' : 'Emp Ins.'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'قرض' : 'Loan'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'سلفة' : 'Advance'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'موبايل' : 'Mobile Bill'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'خصم إجازة' : 'Leave Ded.'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'جزاء' : 'Penalty'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap">{ar ? 'إجمالي خصم' : 'Tot. Ded.'}</TableHead>
              <TableHead className="text-primary-foreground whitespace-nowrap font-bold">{ar ? 'الصافي' : 'Net'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد سجلات رواتب' : 'No salary records'}
                </TableCell>
              </TableRow>
            ) : (
              records.map(r => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant="outline">{getMonthLabel(r.month)}</Badge></TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.basicSalary.toLocaleString()}</TableCell>
                  <TableCell>{r.transportAllowance.toLocaleString()}</TableCell>
                  <TableCell>{r.incentives.toLocaleString()}</TableCell>
                  <TableCell>{r.stationAllowance.toLocaleString()}</TableCell>
                  <TableCell>{r.mobileAllowance.toLocaleString()}</TableCell>
                  <TableCell>{r.livingAllowance.toLocaleString()}</TableCell>
                  <TableCell>{r.overtimePay.toLocaleString()}</TableCell>
                  <TableCell>{r.bonusAmount.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-green-600">{r.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.employeeInsurance.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.loanPayment.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.advanceAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.mobileBill.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.leaveDeduction.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{r.penaltyAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive font-semibold">{r.totalDeductions.toLocaleString()}</TableCell>
                  <TableCell className="font-bold text-blue-600">{r.netSalary.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
