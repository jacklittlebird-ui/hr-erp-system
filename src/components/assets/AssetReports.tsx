import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Download, Printer, FileText, Package, TrendingUp, Wrench, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export const AssetReports = () => {
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState('year');

  const assetsByCategory = [
    { name: t('assets.category.laptop'), value: 15, color: '#3b82f6' },
    { name: t('assets.category.desktop'), value: 12, color: '#22c55e' },
    { name: t('assets.category.phone'), value: 8, color: '#f59e0b' },
    { name: t('assets.category.printer'), value: 6, color: '#ef4444' },
    { name: t('assets.category.furniture'), value: 25, color: '#8b5cf6' },
    { name: t('assets.category.vehicle'), value: 4, color: '#06b6d4' },
  ];

  const assetsByStatus = [
    { status: t('assets.status.available'), count: 18 },
    { status: t('assets.status.assigned'), count: 42 },
    { status: t('assets.status.maintenance'), count: 5 },
    { status: t('assets.status.retired'), count: 5 },
  ];

  const monthlyAcquisition = [
    { month: t('months.jan'), purchased: 5, cost: 85000 },
    { month: t('months.feb'), purchased: 3, cost: 45000 },
    { month: t('months.mar'), purchased: 8, cost: 120000 },
    { month: t('months.apr'), purchased: 2, cost: 30000 },
    { month: t('months.may'), purchased: 6, cost: 95000 },
    { month: t('months.jun'), purchased: 4, cost: 60000 },
  ];

  const maintenanceCost = [
    { month: t('months.jan'), cost: 3500 },
    { month: t('months.feb'), cost: 2800 },
    { month: t('months.mar'), cost: 4200 },
    { month: t('months.apr'), cost: 1500 },
    { month: t('months.may'), cost: 3800 },
    { month: t('months.jun'), cost: 2550 },
  ];

  const deptAssets = [
    { dept: t('dept.it'), count: 28 },
    { dept: t('dept.hr'), count: 8 },
    { dept: t('dept.finance'), count: 12 },
    { dept: t('dept.marketing'), count: 10 },
    { dept: t('dept.operations'), count: 12 },
  ];

  const stats = [
    { label: t('assets.reports.totalAssets'), value: '70', icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('assets.reports.totalValue'), value: '1.2M', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('assets.reports.maintenanceCost'), value: '18.3K', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: t('assets.reports.utilization'), value: '85%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const handlePrint = () => window.print();
  const handleExport = (type: string) => {
    const data = JSON.stringify({ assetsByCategory, assetsByStatus, monthlyAcquisition }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-report.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-4 items-center justify-between", isRTL && "flex-row-reverse")}>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t('assets.reports.thisMonth')}</SelectItem>
                <SelectItem value="quarter">{t('assets.reports.thisQuarter')}</SelectItem>
                <SelectItem value="year">{t('assets.reports.thisYear')}</SelectItem>
              </SelectContent>
            </Select>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4" />{t('assets.reports.print')}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}><Download className="w-4 h-4" />{t('assets.reports.exportPDF')}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}><FileText className="w-4 h-4" />{t('assets.reports.exportExcel')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className={cn("p-3 rounded-lg", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
                <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{t('assets.reports.byCategory')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetsByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {assetsByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('assets.reports.byStatus')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name={t('assets.reports.count')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('assets.reports.acquisitionTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAcquisition}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="purchased" name={t('assets.reports.purchased')} fill="#22c55e" />
                  <Bar dataKey="cost" name={t('assets.reports.costLabel')} fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('assets.reports.maintenanceTrend')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={maintenanceCost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} ${t('assets.currency')}`} />
                  <Line type="monotone" dataKey="cost" name={t('assets.reports.costLabel')} stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('assets.reports.byDept')}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptAssets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="dept" type="category" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" name={t('assets.reports.count')} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
