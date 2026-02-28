import { useMemo, useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
  const [records, setRecords] = useState<PayrollEntry[]>([]);

  const fetchPayroll = useCallback(async () => {
    const { data } = await supabase
      .from('payroll_entries')
      .select('*')
      .eq('employee_id', employee.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (data) {
      setRecords(data.map(r => ({
        id: r.id,
        month: r.month,
        year: r.year,
        basicSalary: r.basic_salary ?? 0,
        transportAllowance: r.transport_allowance ?? 0,
        incentives: r.incentives ?? 0,
        stationAllowance: r.station_allowance ?? 0,
        mobileAllowance: r.mobile_allowance ?? 0,
        livingAllowance: r.living_allowance ?? 0,
        overtimePay: r.overtime_pay ?? 0,
        bonusAmount: r.bonus_amount ?? 0,
        gross: r.gross ?? 0,
        employeeInsurance: r.employee_insurance ?? 0,
        healthInsurance: r.health_insurance ?? 0,
        employerSocialInsurance: r.employer_social_insurance ?? 0,
        incomeTax: r.income_tax ?? 0,
        loanPayment: r.loan_payment ?? 0,
        advanceAmount: r.advance_amount ?? 0,
        mobileBill: r.mobile_bill ?? 0,
        leaveDeduction: r.leave_deduction ?? 0,
        penaltyAmount: r.penalty_amount ?? 0,
        totalDeductions: r.total_deductions ?? 0,
        netSalary: r.net_salary ?? 0,
      })));
    }
  }, [employee.id]);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

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
