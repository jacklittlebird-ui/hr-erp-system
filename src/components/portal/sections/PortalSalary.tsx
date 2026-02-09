import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

const salaryBreakdown = [
  { labelAr: 'الراتب الأساسي', labelEn: 'Basic Salary', amount: 5000 },
  { labelAr: 'بدل المواصلات', labelEn: 'Transport', amount: 500 },
  { labelAr: 'بدل السكن', labelEn: 'Housing', amount: 2000 },
  { labelAr: 'بدل الوجبات', labelEn: 'Meals', amount: 300 },
  { labelAr: 'بدلات أخرى', labelEn: 'Other', amount: 700 },
];

const deductions = [
  { labelAr: 'تأمين اجتماعي', labelEn: 'Social Insurance', amount: -500 },
  { labelAr: 'ضرائب', labelEn: 'Taxes', amount: -300 },
];

const payslips = [
  { month: '2026-01', gross: 8500, deductions: 800, net: 7700 },
  { month: '2025-12', gross: 8500, deductions: 800, net: 7700 },
  { month: '2025-11', gross: 8500, deductions: 800, net: 7700 },
];

export const PortalSalary = () => {
  const { language, isRTL } = useLanguage();
  const total = salaryBreakdown.reduce((s, i) => s + i.amount, 0);
  const totalDed = deductions.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'الراتب' : 'Salary'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الراتب' : 'Gross'}</p>
          <p className="text-3xl font-bold text-primary">{total.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الاستقطاعات' : 'Deductions'}</p>
          <p className="text-3xl font-bold text-destructive">{Math.abs(totalDed).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'صافي الراتب' : 'Net'}</p>
          <p className="text-3xl font-bold text-success">{(total + totalDed).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{language === 'ar' ? 'تفاصيل الراتب' : 'Breakdown'}</CardTitle></CardHeader>
          <CardContent>
            {salaryBreakdown.map((s, i) => (
              <div key={i} className={cn("flex justify-between py-2 border-b last:border-0", isRTL && "flex-row-reverse")}>
                <span>{language === 'ar' ? s.labelAr : s.labelEn}</span>
                <span className="font-mono font-medium">{s.amount.toLocaleString()}</span>
              </div>
            ))}
            {deductions.map((d, i) => (
              <div key={i} className={cn("flex justify-between py-2 border-b last:border-0 text-destructive", isRTL && "flex-row-reverse")}>
                <span>{language === 'ar' ? d.labelAr : d.labelEn}</span>
                <span className="font-mono font-medium">{d.amount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Wallet className="w-5 h-5" />{language === 'ar' ? 'كشوف الرواتب' : 'Payslips'}</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الشهر' : 'Month'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'إجمالي' : 'Gross'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'خصومات' : 'Ded.'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'صافي' : 'Net'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {payslips.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.month}</TableCell>
                    <TableCell>{p.gross.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">{p.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">{p.net.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
