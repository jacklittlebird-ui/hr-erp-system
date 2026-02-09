import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download, Printer, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useReportExport } from '@/hooks/useReportExport';
import { stationLocations } from '@/data/stationLocations';

export const SalaryReports = () => {
  const { t, isRTL } = useLanguage();
  const { language } = useLanguage();
  const [period, setPeriod] = useState('year');
  const [station, setStation] = useState('all');
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();

  const monthlySalaries = [
    { month: t('months.jan'), basic: 850000, allowances: 150000, deductions: 80000, net: 920000 },
    { month: t('months.feb'), basic: 860000, allowances: 155000, deductions: 82000, net: 933000 },
    { month: t('months.mar'), basic: 870000, allowances: 160000, deductions: 85000, net: 945000 },
    { month: t('months.apr'), basic: 880000, allowances: 162000, deductions: 88000, net: 954000 },
    { month: t('months.may'), basic: 890000, allowances: 165000, deductions: 90000, net: 965000 },
    { month: t('months.jun'), basic: 900000, allowances: 170000, deductions: 92000, net: 978000 },
  ];

  const departmentSalaries = [
    { name: t('dept.it'), value: 350000, color: '#3b82f6' },
    { name: t('dept.hr'), value: 120000, color: '#22c55e' },
    { name: t('dept.finance'), value: 180000, color: '#f59e0b' },
    { name: t('dept.marketing'), value: 150000, color: '#ef4444' },
    { name: t('dept.operations'), value: 200000, color: '#8b5cf6' },
  ];

  const salaryRange = [
    { range: '0-5K', count: 25 },
    { range: '5K-10K', count: 45 },
    { range: '10K-15K', count: 40 },
    { range: '15K-20K', count: 30 },
    { range: '20K+', count: 20 },
  ];

  const stats = [
    { label: t('reports.totalPayroll'), value: '978K', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('reports.avgSalary'), value: '6,112', icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: t('reports.totalAllowances'), value: '170K', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('reports.totalDeductions'), value: '92K', icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  const reportTitle = t('reports.tabs.salaries');

  const getExportColumns = () => [
    { header: t('reports.month'), key: 'month' },
    { header: t('reports.basic'), key: 'basic' },
    { header: t('reports.allowances'), key: 'allowances' },
    { header: t('reports.deductions'), key: 'deductions' },
    { header: t('reports.net'), key: 'net' },
  ];

  const getExportData = () => monthlySalaries.map(d => ({
    month: d.month, basic: d.basic, allowances: d.allowances, deductions: d.deductions, net: d.net,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
                  <SelectItem value="quarter">{t('reports.thisQuarter')}</SelectItem>
                  <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={station} onValueChange={setStation}>
                <SelectTrigger className="w-44"><SelectValue placeholder={language === 'ar' ? 'المحطة/الموقع' : 'Station'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => (
                    <SelectItem key={s.value} value={s.value}>{language === 'ar' ? s.labelAr : s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={() => handlePrint(reportTitle)}>
                <Printer className="w-4 h-4 mr-2" />{t('reports.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <Download className="w-4 h-4 mr-2" />{t('reports.exportPDF')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <FileText className="w-4 h-4 mr-2" />{t('reports.exportExcel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-3 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>{t('reports.payrollTrend')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySalaries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                    <Legend />
                    <Area type="monotone" dataKey="net" name={t('reports.netSalary')} stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="basic" name={t('reports.basicSalary')} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('reports.salaryByDept')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentSalaries} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {departmentSalaries.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('reports.salaryDistribution')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryRange}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" fontSize={12} /><YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" name={t('reports.employees')} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
