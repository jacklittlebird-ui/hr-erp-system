import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Download, Printer, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { stationLocations } from '@/data/stationLocations';

export const PayrollHistory = () => {
  const { t, language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedStation, setSelectedStation] = useState('all');

  const monthlyData = [
    { month: t('months.jan'), basic: 830000, allowances: 160000, deductions: 88000, net: 902000 },
    { month: t('months.feb'), basic: 835000, allowances: 162000, deductions: 89000, net: 908000 },
    { month: t('months.mar'), basic: 838000, allowances: 163000, deductions: 89500, net: 911500 },
    { month: t('months.apr'), basic: 840000, allowances: 165000, deductions: 90000, net: 915000 },
    { month: t('months.may'), basic: 842000, allowances: 166000, deductions: 90500, net: 917500 },
    { month: t('months.jun'), basic: 845000, allowances: 167000, deductions: 91000, net: 921000 },
    { month: t('salaries.months.jul'), basic: 847000, allowances: 168000, deductions: 91500, net: 923500 },
    { month: t('salaries.months.aug'), basic: 848000, allowances: 168500, deductions: 91800, net: 924700 },
    { month: t('salaries.months.sep'), basic: 850000, allowances: 169000, deductions: 92000, net: 927000 },
    { month: t('salaries.months.oct'), basic: 850000, allowances: 170000, deductions: 92000, net: 928000 },
    { month: t('salaries.months.nov'), basic: 852000, allowances: 170500, deductions: 92200, net: 930300 },
    { month: t('salaries.months.dec'), basic: 855000, allowances: 171000, deductions: 92500, net: 933500 },
  ];

  const employeeHistory = [
    { id: '1', name: 'جلال عبد الرازق', dept: 'تقنية المعلومات', jan: 10050, feb: 10050, mar: 10200, apr: 10200, may: 10200, jun: 10500, change: '+4.5%' },
    { id: '2', name: 'محمد أحمد علي', dept: 'الموارد البشرية', jan: 8400, feb: 8400, mar: 8400, apr: 8600, may: 8600, jun: 8900, change: '+6.0%' },
    { id: '3', name: 'سارة حسن محمود', dept: 'المالية', jan: 10900, feb: 10900, mar: 11000, apr: 11000, may: 11200, jun: 12000, change: '+10.1%' },
    { id: '4', name: 'أحمد يوسف', dept: 'التسويق', jan: 7850, feb: 7850, mar: 7850, apr: 7950, may: 7950, jun: 8050, change: '+2.5%' },
    { id: '5', name: 'فاطمة عبدالله', dept: 'العمليات', jan: 8850, feb: 8850, mar: 9000, apr: 9000, may: 9000, jun: 9330, change: '+5.4%' },
  ];

  const stats = [
    { label: t('salaries.annualPayroll'), value: '11.1M', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('salaries.avgMonthly'), value: '928K', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('salaries.yearlyGrowth'), value: '+3.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('salaries.avgPerEmployee'), value: '5,800', icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const filteredEmployees = employeeHistory.filter(e =>
    e.name.includes(search) || e.dept.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={cn(isRTL && "text-right")}>{t('salaries.payrollTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <Legend />
                  <Bar dataKey="basic" name={t('salaries.basicSalary')} fill="hsl(var(--primary))" />
                  <Bar dataKey="allowances" name={t('salaries.allowancesTotal')} fill="#22c55e" />
                  <Bar dataKey="deductions" name={t('salaries.deductionsTotal')} fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={cn(isRTL && "text-right")}>{t('salaries.netTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <Line type="monotone" dataKey="net" name={t('salaries.netSalary')} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee History Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-wrap gap-4 justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle>{t('salaries.employeeHistory')}</CardTitle>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('salaries.searchEmployee')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn("w-48", isRTL ? "pr-10 text-right" : "pl-10")}
                />
              </div>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={ar ? 'المحطة/الموقع' : 'Station'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => (
                    <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => String(2025 + i)).map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employee')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.department')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.jan')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.feb')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.mar')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.apr')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.may')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('months.jun')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.change')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className={cn("font-medium", isRTL && "text-right")}>{emp.name}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.dept}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.jan.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.feb.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.mar.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.apr.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.may.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{emp.jun.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">{emp.change}</Badge>
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
