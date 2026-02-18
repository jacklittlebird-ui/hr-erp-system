import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePayrollData } from '@/contexts/PayrollDataContext';
import { useSalaryData } from '@/contexts/SalaryDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalSalary = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeePayroll } = usePayrollData();
  const { getLatestSalaryRecord } = useSalaryData();

  const payroll = useMemo(() => getEmployeePayroll(PORTAL_EMPLOYEE_ID), [getEmployeePayroll]);
  const salaryRecord = useMemo(() => getLatestSalaryRecord(PORTAL_EMPLOYEE_ID), [getLatestSalaryRecord]);
  const latest = payroll[0];

  const months = ar
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Use salary record for base info, payroll for processed data
  const earnings = latest ? [
    { l: ar ? 'الراتب الأساسي' : 'Basic Salary', v: latest.basicSalary },
    { l: ar ? 'بدل المواصلات' : 'Transport Allowance', v: latest.transportAllowance },
    { l: ar ? 'الحوافز' : 'Incentives', v: latest.incentives },
    { l: ar ? 'بدل المحطة' : 'Station Allowance', v: latest.stationAllowance },
    { l: ar ? 'بدل الجوال' : 'Mobile Allowance', v: latest.mobileAllowance },
    { l: ar ? 'بدل المعيشة' : 'Living Allowance', v: latest.livingAllowance },
    { l: ar ? 'أجر إضافي' : 'Overtime Pay', v: latest.overtimePay },
    { l: ar ? 'المكافآت' : 'Bonus', v: latest.bonusAmount },
  ] : salaryRecord ? [
    { l: ar ? 'الراتب الأساسي' : 'Basic Salary', v: salaryRecord.basicSalary },
    { l: ar ? 'بدل المواصلات' : 'Transport Allowance', v: salaryRecord.transportAllowance },
    { l: ar ? 'الحوافز' : 'Incentives', v: salaryRecord.incentives },
    { l: ar ? 'بدل المحطة' : 'Station Allowance', v: salaryRecord.stationAllowance },
    { l: ar ? 'بدل الجوال' : 'Mobile Allowance', v: salaryRecord.mobileAllowance },
    { l: ar ? 'بدل المعيشة' : 'Living Allowance', v: salaryRecord.livingAllowance },
  ] : [];

  const deductions = latest ? [
    { l: ar ? 'تأمينات الموظف' : 'Employee Insurance', v: latest.employeeInsurance },
    { l: ar ? 'أقساط القروض' : 'Loan Payment', v: latest.loanPayment },
    { l: ar ? 'السلف' : 'Advances', v: latest.advanceAmount },
    { l: ar ? 'فاتورة الجوال' : 'Mobile Bill', v: latest.mobileBill },
    { l: ar ? 'خصم إجازة' : 'Leave Deduction', v: latest.leaveDeduction },
    { l: ar ? 'جزاءات' : 'Penalties', v: latest.penaltyAmount },
  ] : salaryRecord ? [
    { l: ar ? 'تأمينات الموظف' : 'Employee Insurance', v: salaryRecord.employeeInsurance },
  ] : [];

  const totalEarnings = earnings.reduce((s, e) => s + e.v, 0);
  const totalDeductions = latest ? latest.totalDeductions : deductions.reduce((s, d) => s + d.v, 0);
  const netSalary = latest ? latest.netSalary : totalEarnings - totalDeductions;

  const hasData = latest || salaryRecord;

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'الراتب' : 'Salary'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'إجمالي الراتب' : 'Gross Salary'}</p>
          <p className="text-3xl font-bold text-primary">{hasData ? totalEarnings.toLocaleString() : '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'الخصومات' : 'Deductions'}</p>
          <p className="text-3xl font-bold text-destructive">{hasData ? totalDeductions.toLocaleString() : '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'صافي الراتب' : 'Net Salary'}</p>
          <p className="text-3xl font-bold text-success">{hasData ? netSalary.toLocaleString() : '—'}</p>
        </CardContent></Card>
      </div>

      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>{ar ? 'تفاصيل الراتب' : 'Salary Breakdown'}</CardTitle></CardHeader>
            <CardContent>
              <h4 className={cn("font-semibold text-success mb-2 text-sm", isRTL && "text-right")}>{ar ? 'المستحقات' : 'Earnings'}</h4>
              {earnings.filter(x => x.v > 0).map((item, i) => (
                <div key={i} className={cn("flex justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                  <span>{item.l}</span>
                  <span className="font-mono font-medium text-success">{item.v.toLocaleString()}</span>
                </div>
              ))}
              <div className={cn("flex justify-between py-2 font-bold bg-muted/50 px-2 rounded mt-1", isRTL && "flex-row-reverse")}>
                <span>{ar ? 'إجمالي المستحقات' : 'Total Earnings'}</span>
                <span className="text-success">{totalEarnings.toLocaleString()}</span>
              </div>

              <Separator className="my-3" />
              <h4 className={cn("font-semibold text-destructive mb-2 text-sm", isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</h4>
              {deductions.filter(x => x.v > 0).map((item, i) => (
                <div key={i} className={cn("flex justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                  <span>{item.l}</span>
                  <span className="font-mono font-medium text-destructive">{item.v.toLocaleString()}</span>
                </div>
              ))}
              <div className={cn("flex justify-between py-2 font-bold bg-muted/50 px-2 rounded mt-1", isRTL && "flex-row-reverse")}>
                <span>{ar ? 'إجمالي الخصومات' : 'Total Deductions'}</span>
                <span className="text-destructive">{totalDeductions.toLocaleString()}</span>
              </div>

              <Separator className="my-3" />
              <div className={cn("flex justify-between py-3 font-bold text-lg bg-primary/10 px-3 rounded", isRTL && "flex-row-reverse")}>
                <span>{ar ? 'صافي الراتب' : 'Net Salary'}</span>
                <span className="text-primary">{netSalary.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Wallet className="w-5 h-5" />{ar ? 'كشوف الرواتب' : 'Payslips'}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الشهر' : 'Month'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إجمالي' : 'Gross'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'خصومات' : 'Deductions'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'صافي' : 'Net'}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {payroll.map((p, i) => {
                    const pGross = p.basicSalary + p.transportAllowance + p.incentives + p.stationAllowance + p.mobileAllowance + p.livingAllowance + p.overtimePay + p.bonusAmount;
                    return (
                      <TableRow key={i}>
                        <TableCell>{months[parseInt(p.month) - 1]} {p.year}</TableCell>
                        <TableCell>{pGross.toLocaleString()}</TableCell>
                        <TableCell className="text-destructive">{p.totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className="font-bold">{p.netSalary.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  {payroll.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد كشوف رواتب معالجة' : 'No processed payslips'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {!hasData && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          {ar ? 'لا توجد بيانات رواتب بعد' : 'No salary data yet'}
        </CardContent></Card>
      )}
    </div>
  );
};
