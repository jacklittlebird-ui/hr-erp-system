import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Users, UserPlus, UserMinus, Building2, Download, FileText, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useReportExport } from '@/hooks/useReportExport';

export const EmployeeReports = () => {
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState('year');
  const [department, setDepartment] = useState('all');
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();

  const headcountData = [
    { month: t('months.jan'), count: 145 },
    { month: t('months.feb'), count: 148 },
    { month: t('months.mar'), count: 152 },
    { month: t('months.apr'), count: 155 },
    { month: t('months.may'), count: 160 },
    { month: t('months.jun'), count: 158 },
  ];

  const departmentData = [
    { name: t('dept.it'), value: 45, color: '#3b82f6' },
    { name: t('dept.hr'), value: 20, color: '#22c55e' },
    { name: t('dept.finance'), value: 25, color: '#f59e0b' },
    { name: t('dept.marketing'), value: 30, color: '#ef4444' },
    { name: t('dept.operations'), value: 40, color: '#8b5cf6' },
  ];

  const turnoverData = [
    { month: t('months.jan'), hired: 5, left: 2 },
    { month: t('months.feb'), hired: 8, left: 3 },
    { month: t('months.mar'), hired: 6, left: 4 },
    { month: t('months.apr'), hired: 4, left: 2 },
    { month: t('months.may'), hired: 7, left: 5 },
    { month: t('months.jun'), hired: 3, left: 1 },
  ];

  const genderData = [
    { name: t('reports.male'), value: 95, color: '#3b82f6' },
    { name: t('reports.female'), value: 65, color: '#ec4899' },
  ];

  const stats = [
    { label: t('reports.totalEmployees'), value: 160, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('reports.newHires'), value: 33, icon: UserPlus, color: 'text-success', bg: 'bg-success/10' },
    { label: t('reports.terminated'), value: 17, icon: UserMinus, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: t('reports.departments'), value: 5, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const reportTitle = t('reports.tabs.employees');

  const getExportColumns = () => [
    { header: t('reports.month'), key: 'month' },
    { header: t('reports.totalEmployees'), key: 'count' },
    { header: t('reports.hired'), key: 'hired' },
    { header: t('reports.left'), key: 'left' },
  ];

  const getExportData = () => headcountData.map((h, i) => ({
    month: h.month,
    count: h.count,
    hired: turnoverData[i]?.hired ?? 0,
    left: turnoverData[i]?.left ?? 0,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
                  <SelectItem value="quarter">{t('reports.thisQuarter')}</SelectItem>
                  <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allDepartments')}</SelectItem>
                  <SelectItem value="it">{t('dept.it')}</SelectItem>
                  <SelectItem value="hr">{t('dept.hr')}</SelectItem>
                  <SelectItem value="finance">{t('dept.finance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={() => handlePrint(reportTitle)}>
                <Printer className="w-4 h-4 mr-2" />
                {t('reports.print')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.exportPDF')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: reportTitle, data: getExportData(), columns: getExportColumns() })}>
                <FileText className="w-4 h-4 mr-2" />
                {t('reports.exportExcel')}
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
          <Card>
            <CardHeader><CardTitle>{t('reports.headcountTrend')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={headcountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name={t('reports.employees')} stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('reports.departmentDistribution')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {departmentData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader><CardTitle>{t('reports.turnoverAnalysis')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hired" name={t('reports.hired')} fill="#22c55e" />
                    <Bar dataKey="left" name={t('reports.left')} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('reports.genderDistribution')}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {genderData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
