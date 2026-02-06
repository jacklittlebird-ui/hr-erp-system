import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Search, Download, Printer, Eye } from 'lucide-react';

interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  year: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  mealAllowance: number;
  otherAllowances: number;
  socialInsurance: number;
  taxes: number;
  loanDeduction: number;
  otherDeductions: number;
  overtime: number;
  bonus: number;
  netSalary: number;
}

export const SalarySlips = () => {
  const { t, isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  const slips: SalarySlip[] = [
    {
      id: '1', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق', department: 'تقنية المعلومات',
      month: '01', year: '2026', basicSalary: 8500, housingAllowance: 1200, transportAllowance: 500,
      mealAllowance: 300, otherAllowances: 500, socialInsurance: 450, taxes: 300, loanDeduction: 200,
      otherDeductions: 0, overtime: 800, bonus: 0, netSalary: 10850,
    },
    {
      id: '2', employeeId: 'Emp002', employeeName: 'محمد أحمد علي', department: 'الموارد البشرية',
      month: '01', year: '2026', basicSalary: 7200, housingAllowance: 1000, transportAllowance: 400,
      mealAllowance: 300, otherAllowances: 300, socialInsurance: 380, taxes: 250, loanDeduction: 0,
      otherDeductions: 170, overtime: 0, bonus: 500, netSalary: 8900,
    },
    {
      id: '3', employeeId: 'Emp003', employeeName: 'سارة حسن محمود', department: 'المالية',
      month: '01', year: '2026', basicSalary: 9000, housingAllowance: 1500, transportAllowance: 600,
      mealAllowance: 300, otherAllowances: 600, socialInsurance: 500, taxes: 350, loanDeduction: 500,
      otherDeductions: 50, overtime: 400, bonus: 1000, netSalary: 12000,
    },
    {
      id: '4', employeeId: 'Emp004', employeeName: 'أحمد يوسف', department: 'التسويق',
      month: '01', year: '2026', basicSalary: 6800, housingAllowance: 900, transportAllowance: 400,
      mealAllowance: 250, otherAllowances: 250, socialInsurance: 360, taxes: 220, loanDeduction: 0,
      otherDeductions: 170, overtime: 200, bonus: 0, netSalary: 8050,
    },
    {
      id: '5', employeeId: 'Emp005', employeeName: 'فاطمة عبدالله', department: 'العمليات',
      month: '01', year: '2026', basicSalary: 7500, housingAllowance: 1100, transportAllowance: 450,
      mealAllowance: 300, otherAllowances: 350, socialInsurance: 400, taxes: 270, loanDeduction: 300,
      otherDeductions: 0, overtime: 600, bonus: 0, netSalary: 9330,
    },
  ];

  const filteredSlips = slips.filter(s =>
    s.employeeName.includes(search) || s.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const months = [
    { value: '01', label: t('months.jan') }, { value: '02', label: t('months.feb') },
    { value: '03', label: t('months.mar') }, { value: '04', label: t('months.apr') },
    { value: '05', label: t('months.may') }, { value: '06', label: t('months.jun') },
    { value: '07', label: t('salaries.months.jul') }, { value: '08', label: t('salaries.months.aug') },
    { value: '09', label: t('salaries.months.sep') }, { value: '10', label: t('salaries.months.oct') },
    { value: '11', label: t('salaries.months.nov') }, { value: '12', label: t('salaries.months.dec') },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center", isRTL && "flex-row-reverse")}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('salaries.searchEmployee')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(isRTL ? "pr-10 text-right" : "pl-10")}
              />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />
              {t('salaries.printAll')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              {t('salaries.exportAll')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slips Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(isRTL && "text-right")}>{t('salaries.slipsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employeeId')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employee')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.department')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.basicSalary')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.totalEarnings')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.totalDeductionsLabel')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.netSalary')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSlips.map(slip => {
                const totalEarnings = slip.basicSalary + slip.housingAllowance + slip.transportAllowance + slip.mealAllowance + slip.otherAllowances + slip.overtime + slip.bonus;
                const totalDeductions = slip.socialInsurance + slip.taxes + slip.loanDeduction + slip.otherDeductions;
                return (
                  <TableRow key={slip.id}>
                    <TableCell className={cn(isRTL && "text-right")}>{slip.employeeId}</TableCell>
                    <TableCell className={cn("font-medium", isRTL && "text-right")}>{slip.employeeName}</TableCell>
                    <TableCell className={cn(isRTL && "text-right")}>{slip.department}</TableCell>
                    <TableCell className={cn(isRTL && "text-right")}>{slip.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className={cn("text-green-600", isRTL && "text-right")}>{totalEarnings.toLocaleString()}</TableCell>
                    <TableCell className={cn("text-destructive", isRTL && "text-right")}>{totalDeductions.toLocaleString()}</TableCell>
                    <TableCell className={cn("font-bold", isRTL && "text-right")}>{slip.netSalary.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedSlip(slip)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Slip Detail Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className={cn(isRTL && "text-right")}>{t('salaries.slipDetail')}</DialogTitle>
          </DialogHeader>
          {selectedSlip && (
            <div className="space-y-4">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <div>
                  <p className="font-bold text-lg">{selectedSlip.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSlip.department} - {selectedSlip.employeeId}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {months.find(m => m.value === selectedSlip.month)?.label} {selectedSlip.year}
                </p>
              </div>

              <Separator />

              {/* Earnings */}
              <div>
                <h4 className={cn("font-semibold text-green-600 mb-2", isRTL && "text-right")}>{t('salaries.earnings')}</h4>
                <div className="space-y-1 text-sm">
                  {[
                    { label: t('salaries.basicSalary'), value: selectedSlip.basicSalary },
                    { label: t('salaries.housingAllowance'), value: selectedSlip.housingAllowance },
                    { label: t('salaries.transportAllowance'), value: selectedSlip.transportAllowance },
                    { label: t('salaries.mealAllowance'), value: selectedSlip.mealAllowance },
                    { label: t('salaries.otherAllowances'), value: selectedSlip.otherAllowances },
                    { label: t('salaries.overtime'), value: selectedSlip.overtime },
                    { label: t('salaries.bonus'), value: selectedSlip.bonus },
                  ].filter(item => item.value > 0).map((item, i) => (
                    <div key={i} className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                      <span>{item.label}</span>
                      <span className="text-green-600">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Deductions */}
              <div>
                <h4 className={cn("font-semibold text-destructive mb-2", isRTL && "text-right")}>{t('salaries.deductionsLabel')}</h4>
                <div className="space-y-1 text-sm">
                  {[
                    { label: t('salaries.socialInsurance'), value: selectedSlip.socialInsurance },
                    { label: t('salaries.taxes'), value: selectedSlip.taxes },
                    { label: t('salaries.loanDeduction'), value: selectedSlip.loanDeduction },
                    { label: t('salaries.otherDeductions'), value: selectedSlip.otherDeductions },
                  ].filter(item => item.value > 0).map((item, i) => (
                    <div key={i} className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                      <span>{item.label}</span>
                      <span className="text-destructive">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Net */}
              <div className={cn("flex justify-between items-center text-lg font-bold", isRTL && "flex-row-reverse")}>
                <span>{t('salaries.netSalary')}</span>
                <span className="text-primary">{selectedSlip.netSalary.toLocaleString()}</span>
              </div>

              <div className={cn("flex gap-2 pt-2", isRTL && "flex-row-reverse")}>
                <Button variant="outline" className="flex-1 gap-2">
                  <Printer className="w-4 h-4" />
                  {t('salaries.print')}
                </Button>
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  {t('salaries.download')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
