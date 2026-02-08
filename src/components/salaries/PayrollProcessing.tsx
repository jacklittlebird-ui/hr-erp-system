import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Play, CheckCircle, Clock, AlertTriangle, Users, Wallet, TrendingUp, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollRun {
  id: string;
  month: string;
  year: string;
  status: 'draft' | 'processing' | 'completed' | 'approved';
  totalEmployees: number;
  totalBasic: number;
  totalAllowances: number;
  totalDeductions: number;
  totalNet: number;
  processedDate?: string;
  approvedBy?: string;
}

export const PayrollProcessing = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [showDetails, setShowDetails] = useState(false);

  const [payrollRuns] = useState<PayrollRun[]>([
    {
      id: '1', month: '01', year: '2026', status: 'completed',
      totalEmployees: 160, totalBasic: 850000, totalAllowances: 170000,
      totalDeductions: 92000, totalNet: 928000, processedDate: '2026-01-28', approvedBy: 'أحمد محمد'
    },
    {
      id: '2', month: '12', year: '2025', status: 'approved',
      totalEmployees: 158, totalBasic: 840000, totalAllowances: 165000,
      totalDeductions: 90000, totalNet: 915000, processedDate: '2025-12-27', approvedBy: 'أحمد محمد'
    },
    {
      id: '3', month: '11', year: '2025', status: 'approved',
      totalEmployees: 155, totalBasic: 830000, totalAllowances: 160000,
      totalDeductions: 88000, totalNet: 902000, processedDate: '2025-11-27', approvedBy: 'أحمد محمد'
    },
  ]);

  const payrollEmployees = [
    { id: '1', name: 'جلال عبد الرازق', dept: 'تقنية المعلومات', basic: 8500, allowances: 2500, deductions: 950, net: 10050 },
    { id: '2', name: 'محمد أحمد علي', dept: 'الموارد البشرية', basic: 7200, allowances: 2000, deductions: 800, net: 8400 },
    { id: '3', name: 'سارة حسن محمود', dept: 'المالية', basic: 9000, allowances: 3000, deductions: 1100, net: 10900 },
    { id: '4', name: 'أحمد يوسف', dept: 'التسويق', basic: 6800, allowances: 1800, deductions: 750, net: 7850 },
    { id: '5', name: 'فاطمة عبدالله', dept: 'العمليات', basic: 7500, allowances: 2200, deductions: 850, net: 8850 },
    { id: '6', name: 'خالد إبراهيم', dept: 'تقنية المعلومات', basic: 9500, allowances: 3200, deductions: 1200, net: 11500 },
  ];

  const stats = [
    { label: t('salaries.stats.totalEmployees'), value: '160', icon: Users, color: 'text-primary-foreground', bg: 'bg-stat-blue', cardBg: 'bg-stat-blue-bg' },
    { label: t('salaries.stats.totalPayroll'), value: '928K', icon: Wallet, color: 'text-primary-foreground', bg: 'bg-stat-green', cardBg: 'bg-stat-green-bg' },
    { label: t('salaries.stats.totalAllowances'), value: '170K', icon: TrendingUp, color: 'text-primary-foreground', bg: 'bg-stat-purple', cardBg: 'bg-stat-purple-bg' },
    { label: t('salaries.stats.pendingApproval'), value: '1', icon: Clock, color: 'text-foreground', bg: 'bg-stat-yellow', cardBg: 'bg-stat-yellow-bg' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: t('salaries.status.draft') },
      processing: { variant: 'outline', label: t('salaries.status.processing') },
      completed: { variant: 'default', label: t('salaries.status.completed') },
      approved: { variant: 'default', label: t('salaries.status.approved') },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleRunPayroll = () => {
    toast({
      title: t('salaries.payrollStarted'),
      description: t('salaries.payrollStartedDesc'),
    });
  };

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
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={cn("rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border/30", stat.cardBg, isRTL && "flex-row-reverse")}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Run Payroll */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(isRTL && "text-right")}>{t('salaries.runPayroll')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("flex flex-wrap gap-4 items-end", isRTL && "flex-row-reverse")}>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('salaries.month')}</label>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('salaries.year')}</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRunPayroll} className="gap-2">
              <Play className="w-4 h-4" />
              {t('salaries.processPayroll')}
            </Button>
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  {t('salaries.viewDetails')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className={cn(isRTL && "text-right")}>
                    {t('salaries.payrollDetails')} - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employee')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.department')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.basicSalary')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.allowancesTotal')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.deductionsTotal')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.netSalary')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollEmployees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className={cn(isRTL && "text-right")}>{emp.name}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{emp.dept}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{emp.basic.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{emp.allowances.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{emp.deductions.toLocaleString()}</TableCell>
                        <TableCell className={cn("font-bold", isRTL && "text-right")}>{emp.net.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle className={cn(isRTL && "text-right")}>{t('salaries.recentRuns')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.period')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employeesCount')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.totalBasic')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.allowancesTotal')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.deductionsTotal')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.netSalary')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.statusLabel')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns.map(run => (
                <TableRow key={run.id}>
                  <TableCell className={cn(isRTL && "text-right")}>
                    {months.find(m => m.value === run.month)?.label} {run.year}
                  </TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{run.totalEmployees}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{(run.totalBasic / 1000).toFixed(0)}K</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{(run.totalAllowances / 1000).toFixed(0)}K</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{(run.totalDeductions / 1000).toFixed(0)}K</TableCell>
                  <TableCell className={cn("font-bold", isRTL && "text-right")}>{(run.totalNet / 1000).toFixed(0)}K</TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>
                    <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                      {run.status === 'completed' && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('salaries.approve')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
