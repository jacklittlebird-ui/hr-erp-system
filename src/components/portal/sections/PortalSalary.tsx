import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePayrollData } from '@/contexts/PayrollDataContext';
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

  const payroll = useMemo(() => getEmployeePayroll(PORTAL_EMPLOYEE_ID), [getEmployeePayroll]);
  const latest = payroll[0];

  const months = ar
    ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const totalGross = latest ? latest.gross + latest.bonusAmount : 0;

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'الراتب' : 'Salary'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'إجمالي الراتب' : 'Gross'}</p>
          <p className="text-3xl font-bold text-primary">{latest ? totalGross.toLocaleString() : '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'الخصومات' : 'Deductions'}</p>
          <p className="text-3xl font-bold text-destructive">{latest ? latest.totalDeductions.toLocaleString() : '—'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'صافي الراتب' : 'Net'}</p>
          <p className="text-3xl font-bold text-success">{latest ? latest.netSalary.toLocaleString() : '—'}</p>
        </CardContent></Card>
      </div>

      {latest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>{ar ? 'تفاصيل الراتب' : 'Breakdown'}</CardTitle></CardHeader>
            <CardContent>
              <h4 className={cn("font-semibold text-green-600 mb-2 text-sm", isRTL && "text-right")}>{ar ? 'المستحقات' : 'Earnings'}</h4>
              {[
                { l: ar ? 'الراتب الأساسي' : 'Basic', v: latest.basicSalary },
                { l: ar ? 'بدل المواصلات' : 'Transport', v: latest.transportAllowance },
                { l: ar ? 'الحوافز' : 'Incentives', v: latest.incentives },
                { l: ar ? 'بدل المعيشة' : 'Living', v: latest.livingAllowance },
                { l: ar ? 'بدل المحطة' : 'Station', v: latest.stationAllowance },
                { l: ar ? 'بدل الجوال' : 'Mobile', v: latest.mobileAllowance },
                { l: ar ? 'أجر إضافي' : 'Overtime', v: latest.overtimePay },
                { l: ar ? 'المكافآت' : 'Bonus', v: latest.bonusAmount },
              ].filter(x => x.v > 0).map((item, i) => (
                <div key={i} className={cn("flex justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                  <span>{item.l}</span>
                  <span className="font-mono font-medium text-green-600">{item.v.toLocaleString()}</span>
                </div>
              ))}

              <Separator className="my-3" />
              <h4 className={cn("font-semibold text-destructive mb-2 text-sm", isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</h4>
              {[
                { l: ar ? 'التأمينات' : 'Insurance', v: latest.employeeInsurance },
                { l: ar ? 'القروض' : 'Loans', v: latest.loanPayment },
                { l: ar ? 'السلف' : 'Advances', v: latest.advanceAmount },
                { l: ar ? 'الجوال' : 'Mobile', v: latest.mobileBill },
                { l: ar ? 'خصم إجازة' : 'Leave', v: latest.leaveDeduction },
                { l: ar ? 'جزاءات' : 'Penalties', v: latest.penaltyAmount },
              ].filter(x => x.v > 0).map((item, i) => (
                <div key={i} className={cn("flex justify-between py-2 border-b last:border-0 text-destructive", isRTL && "flex-row-reverse")}>
                  <span>{item.l}</span>
                  <span className="font-mono font-medium">{item.v.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Wallet className="w-5 h-5" />{ar ? 'كشوف الرواتب' : 'Payslips'}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الشهر' : 'Month'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إجمالي' : 'Gross'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'خصومات' : 'Ded.'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'صافي' : 'Net'}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {payroll.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{months[parseInt(p.month) - 1]} {p.year}</TableCell>
                      <TableCell>{(p.gross + p.bonusAmount).toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">{p.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">{p.netSalary.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {payroll.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد بيانات' : 'No data'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {!latest && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          {ar ? 'لا توجد بيانات رواتب معالجة بعد' : 'No processed salary data yet'}
        </CardContent></Card>
      )}
    </div>
  );
};
