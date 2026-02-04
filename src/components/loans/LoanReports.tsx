import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Filter, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportData {
  month: string;
  loansIssued: number;
  loansAmount: number;
  advancesIssued: number;
  advancesAmount: number;
  installmentsCollected: number;
  installmentsAmount: number;
}

const mockReportData: ReportData[] = [
  { month: 'يناير', loansIssued: 5, loansAmount: 150000, advancesIssued: 12, advancesAmount: 25000, installmentsCollected: 45, installmentsAmount: 85000 },
  { month: 'فبراير', loansIssued: 3, loansAmount: 80000, advancesIssued: 8, advancesAmount: 18000, installmentsCollected: 48, installmentsAmount: 90000 },
  { month: 'مارس', loansIssued: 7, loansAmount: 200000, advancesIssued: 15, advancesAmount: 35000, installmentsCollected: 52, installmentsAmount: 95000 },
  { month: 'أبريل', loansIssued: 4, loansAmount: 120000, advancesIssued: 10, advancesAmount: 22000, installmentsCollected: 55, installmentsAmount: 100000 },
  { month: 'مايو', loansIssued: 6, loansAmount: 180000, advancesIssued: 14, advancesAmount: 30000, installmentsCollected: 58, installmentsAmount: 105000 },
  { month: 'يونيو', loansIssued: 8, loansAmount: 250000, advancesIssued: 18, advancesAmount: 40000, installmentsCollected: 62, installmentsAmount: 115000 },
];

const loanTypeData = [
  { name: 'قرض شخصي', value: 45, color: '#3b82f6' },
  { name: 'قرض إسكان', value: 25, color: '#10b981' },
  { name: 'قرض طوارئ', value: 20, color: '#f59e0b' },
  { name: 'قرض تعليم', value: 10, color: '#8b5cf6' },
];

const departmentLoansData = [
  { department: 'تقنية المعلومات', loans: 15, amount: 450000 },
  { department: 'الموارد البشرية', loans: 8, amount: 180000 },
  { department: 'المالية', loans: 12, amount: 350000 },
  { department: 'المبيعات', loans: 10, amount: 280000 },
  { department: 'العمليات', loans: 6, amount: 150000 },
];

export const LoanReports = () => {
  const { t, isRTL } = useLanguage();
  const [reportType, setReportType] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [department, setDepartment] = useState('all');

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  const totalStats = {
    totalLoans: mockReportData.reduce((sum, d) => sum + d.loansIssued, 0),
    totalLoansAmount: mockReportData.reduce((sum, d) => sum + d.loansAmount, 0),
    totalAdvances: mockReportData.reduce((sum, d) => sum + d.advancesIssued, 0),
    totalAdvancesAmount: mockReportData.reduce((sum, d) => sum + d.advancesAmount, 0),
    totalInstallments: mockReportData.reduce((sum, d) => sum + d.installmentsCollected, 0),
    totalInstallmentsAmount: mockReportData.reduce((sum, d) => sum + d.installmentsAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('loans.reports.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>{t('loans.reports.type')}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('loans.reports.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('loans.reports.quarterly')}</SelectItem>
                  <SelectItem value="yearly">{t('loans.reports.yearly')}</SelectItem>
                  <SelectItem value="custom">{t('loans.reports.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('loans.reports.dateFrom')}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('loans.reports.dateTo')}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('loans.reports.department')}</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="it">{t('dept.it')}</SelectItem>
                  <SelectItem value="hr">{t('dept.hr')}</SelectItem>
                  <SelectItem value="finance">{t('dept.finance')}</SelectItem>
                  <SelectItem value="sales">{t('dept.sales')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => handleExport('pdf')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={() => handleExport('excel')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.totalLoans')}</p>
              <p className="text-2xl font-bold">{totalStats.totalLoans}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.loansAmount')}</p>
              <p className="text-2xl font-bold">{totalStats.totalLoansAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.totalAdvances')}</p>
              <p className="text-2xl font-bold">{totalStats.totalAdvances}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.advancesAmount')}</p>
              <p className="text-2xl font-bold">{totalStats.totalAdvancesAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.installmentsCollected')}</p>
              <p className="text-2xl font-bold">{totalStats.totalInstallments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t('loans.reports.collectedAmount')}</p>
              <p className="text-2xl font-bold">{totalStats.totalInstallmentsAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loans Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('loans.reports.monthlyLoans')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="loansAmount" fill="hsl(var(--primary))" name={isRTL ? 'مبلغ القروض' : 'Loans Amount'} />
                <Bar dataKey="advancesAmount" fill="hsl(var(--secondary))" name={isRTL ? 'مبلغ السلف' : 'Advances Amount'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('loans.reports.loanTypes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={loanTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('loans.reports.collectionTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockReportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="installmentsAmount" stroke="hsl(var(--primary))" strokeWidth={2} name={isRTL ? 'الأقساط المحصلة' : 'Collected Installments'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Loans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('loans.reports.departmentLoans')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('loans.reports.department')}</TableHead>
                  <TableHead>{t('loans.reports.loansCount')}</TableHead>
                  <TableHead>{t('loans.reports.totalAmount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentLoansData.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell>{dept.loans}</TableCell>
                    <TableCell>{dept.amount.toLocaleString()}</TableCell>
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
