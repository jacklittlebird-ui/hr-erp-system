import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Download, Printer, FileText, Briefcase, Users, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const RecruitmentReports = () => {
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState('year');

  const monthlyHiring = [
    { month: t('months.jan'), applications: 45, interviews: 20, hired: 5 },
    { month: t('months.feb'), applications: 52, interviews: 25, hired: 7 },
    { month: t('months.mar'), applications: 38, interviews: 18, hired: 4 },
    { month: t('months.apr'), applications: 60, interviews: 30, hired: 8 },
    { month: t('months.may'), applications: 55, interviews: 28, hired: 6 },
    { month: t('months.jun'), applications: 48, interviews: 22, hired: 5 },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 35, color: '#0077B5' },
    { name: t('recruitment.source.website'), value: 25, color: '#22c55e' },
    { name: 'Indeed', value: 20, color: '#2164f3' },
    { name: t('recruitment.source.referral'), value: 15, color: '#f59e0b' },
    { name: t('recruitment.source.other'), value: 5, color: '#8b5cf6' },
  ];

  const departmentHiring = [
    { dept: t('dept.it'), openings: 5, filled: 3 },
    { dept: t('dept.hr'), openings: 2, filled: 2 },
    { dept: t('dept.finance'), openings: 3, filled: 1 },
    { dept: t('dept.marketing'), openings: 2, filled: 0 },
    { dept: t('dept.operations'), openings: 4, filled: 3 },
  ];

  const timeToHire = [
    { month: t('months.jan'), days: 32 },
    { month: t('months.feb'), days: 28 },
    { month: t('months.mar'), days: 35 },
    { month: t('months.apr'), days: 25 },
    { month: t('months.may'), days: 30 },
    { month: t('months.jun'), days: 27 },
  ];

  const stats = [
    { label: t('recruitment.reports.totalApplications'), value: '298', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('recruitment.reports.totalHired'), value: '35', icon: Briefcase, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('recruitment.reports.avgTimeToHire'), value: '29 ' + t('recruitment.reports.daysUnit'), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('recruitment.reports.conversionRate'), value: '11.7%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const handlePrint = () => window.print();
  const handleExport = (type: string) => {
    const data = JSON.stringify(monthlyHiring, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t('recruitment.reports.thisMonth')}</SelectItem>
                <SelectItem value="quarter">{t('recruitment.reports.thisQuarter')}</SelectItem>
                <SelectItem value="year">{t('recruitment.reports.thisYear')}</SelectItem>
              </SelectContent>
            </Select>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4" />{t('recruitment.reports.print')}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><Download className="w-4 h-4" />{t('recruitment.reports.exportPDF')}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><FileText className="w-4 h-4" />{t('recruitment.reports.exportExcel')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className={cn("p-3 rounded-lg", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('recruitment.reports.hiringTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHiring}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" name={t('recruitment.reports.applications')} fill="#3b82f6" />
                  <Bar dataKey="interviews" name={t('recruitment.reports.interviews')} fill="#f59e0b" />
                  <Bar dataKey="hired" name={t('recruitment.reports.hired')} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('recruitment.reports.sourceAnalysis')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('recruitment.reports.timeToHire')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeToHire}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" name={t('recruitment.reports.daysUnit')} stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('recruitment.reports.deptHiring')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHiring} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="dept" type="category" fontSize={12} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openings" name={t('recruitment.reports.openings')} fill="#3b82f6" />
                  <Bar dataKey="filled" name={t('recruitment.reports.filled')} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
