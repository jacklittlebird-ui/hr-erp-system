import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download, Printer, FileText, Users, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

const SalaryReports = () => {
  const { t, isRTL } = useLanguage();
  const [period, setPeriod] = useState('year');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDept, setSelectedDept] = useState('all');

  // Overview data
  const monthlySalaries = [
    { month: t('months.jan'), basic: 850000, allowances: 150000, deductions: 80000, net: 920000 },
    { month: t('months.feb'), basic: 860000, allowances: 155000, deductions: 82000, net: 933000 },
    { month: t('months.mar'), basic: 870000, allowances: 160000, deductions: 85000, net: 945000 },
    { month: t('months.apr'), basic: 880000, allowances: 162000, deductions: 88000, net: 954000 },
    { month: t('months.may'), basic: 890000, allowances: 165000, deductions: 90000, net: 965000 },
    { month: t('months.jun'), basic: 900000, allowances: 170000, deductions: 92000, net: 978000 },
    { month: t('salaries.months.jul'), basic: 910000, allowances: 172000, deductions: 94000, net: 988000 },
    { month: t('salaries.months.aug'), basic: 920000, allowances: 175000, deductions: 95000, net: 1000000 },
    { month: t('salaries.months.sep'), basic: 930000, allowances: 178000, deductions: 97000, net: 1011000 },
    { month: t('salaries.months.oct'), basic: 940000, allowances: 180000, deductions: 98000, net: 1022000 },
    { month: t('salaries.months.nov'), basic: 950000, allowances: 182000, deductions: 100000, net: 1032000 },
    { month: t('salaries.months.dec'), basic: 960000, allowances: 185000, deductions: 102000, net: 1043000 },
  ];

  const departmentSalaries = [
    { name: t('dept.it'), value: 350000, employees: 45, avgSalary: 7778, color: '#3b82f6' },
    { name: t('dept.hr'), value: 120000, employees: 18, avgSalary: 6667, color: '#22c55e' },
    { name: t('dept.finance'), value: 180000, employees: 25, avgSalary: 7200, color: '#f59e0b' },
    { name: t('dept.marketing'), value: 150000, employees: 22, avgSalary: 6818, color: '#ef4444' },
    { name: t('dept.operations'), value: 200000, employees: 30, avgSalary: 6667, color: '#8b5cf6' },
    { name: t('dept.sales'), value: 178000, employees: 20, avgSalary: 8900, color: '#06b6d4' },
  ];

  const salaryRange = [
    { range: '0-3K', count: 10, percentage: 6 },
    { range: '3K-5K', count: 25, percentage: 16 },
    { range: '5K-8K', count: 45, percentage: 28 },
    { range: '8K-12K', count: 40, percentage: 25 },
    { range: '12K-20K', count: 28, percentage: 18 },
    { range: '20K+', count: 12, percentage: 7 },
  ];

  const allowanceBreakdown = [
    { name: t('salaries.housingAllowance'), value: 280000, color: '#3b82f6' },
    { name: t('salaries.transportAllowance'), value: 85000, color: '#22c55e' },
    { name: t('salaries.mealAllowance'), value: 48000, color: '#f59e0b' },
    { name: t('salaries.overtime'), value: 45000, color: '#ef4444' },
    { name: t('salaries.bonus'), value: 35000, color: '#8b5cf6' },
    { name: t('salaries.otherAllowances'), value: 22000, color: '#06b6d4' },
  ];

  const deductionBreakdown = [
    { name: t('salaries.socialInsurance'), value: 45000, color: '#ef4444' },
    { name: t('salaries.taxes'), value: 32000, color: '#f59e0b' },
    { name: t('salaries.loanDeduction'), value: 12000, color: '#8b5cf6' },
    { name: t('salaries.otherDeductions'), value: 8000, color: '#6b7280' },
  ];

  const employeeSalaryDetails = [
    { id: 'EMP001', name: isRTL ? 'أحمد محمد' : 'Ahmed Mohammed', dept: t('dept.it'), basic: 8000, allowances: 3200, deductions: 1680, net: 9520 },
    { id: 'EMP002', name: isRTL ? 'سارة أحمد' : 'Sara Ahmed', dept: t('dept.hr'), basic: 6500, allowances: 2600, deductions: 1365, net: 7735 },
    { id: 'EMP003', name: isRTL ? 'محمد علي' : 'Mohammed Ali', dept: t('dept.finance'), basic: 9000, allowances: 3600, deductions: 1890, net: 10710 },
    { id: 'EMP004', name: isRTL ? 'فاطمة حسن' : 'Fatima Hassan', dept: t('dept.marketing'), basic: 7000, allowances: 2800, deductions: 1470, net: 8330 },
    { id: 'EMP005', name: isRTL ? 'خالد عبدالله' : 'Khaled Abdullah', dept: t('dept.operations'), basic: 7500, allowances: 3000, deductions: 1575, net: 8925 },
    { id: 'EMP006', name: isRTL ? 'نورة سعيد' : 'Noura Saeed', dept: t('dept.it'), basic: 10000, allowances: 4000, deductions: 2100, net: 11900 },
    { id: 'EMP007', name: isRTL ? 'عمر يوسف' : 'Omar Youssef', dept: t('dept.sales'), basic: 8500, allowances: 3400, deductions: 1785, net: 10115 },
    { id: 'EMP008', name: isRTL ? 'ليلى إبراهيم' : 'Layla Ibrahim', dept: t('dept.finance'), basic: 11000, allowances: 4400, deductions: 2310, net: 13090 },
  ];

  const yearComparison = [
    { month: t('months.jan'), current: 920000, previous: 780000 },
    { month: t('months.feb'), current: 933000, previous: 795000 },
    { month: t('months.mar'), current: 945000, previous: 810000 },
    { month: t('months.apr'), current: 954000, previous: 820000 },
    { month: t('months.may'), current: 965000, previous: 835000 },
    { month: t('months.jun'), current: 978000, previous: 850000 },
  ];

  const stats = [
    { label: t('reports.totalPayroll'), value: '11.79M', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('reports.avgSalary'), value: '7,350', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: t('reports.totalAllowances'), value: '2.07M', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: t('reports.totalDeductions'), value: '1.1M', icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  const tabs = [
    { id: 'overview', label: t('salaryReports.overview') },
    { id: 'departments', label: t('salaryReports.byDepartment') },
    { id: 'details', label: t('salaryReports.details') },
    { id: 'comparison', label: t('salaryReports.comparison') },
    { id: 'allowances', label: t('salaryReports.allowancesAnalysis') },
  ];

  return (
    <DashboardLayout>
      <div className={cn("mb-6", isRTL && "text-right")}>
        <h1 className="text-2xl font-bold text-foreground">{t('salaryReports.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('salaryReports.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
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
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('reports.allDepartments')}</SelectItem>
                  <SelectItem value="it">{t('dept.it')}</SelectItem>
                  <SelectItem value="hr">{t('dept.hr')}</SelectItem>
                  <SelectItem value="finance">{t('dept.finance')}</SelectItem>
                  <SelectItem value="marketing">{t('dept.marketing')}</SelectItem>
                  <SelectItem value="operations">{t('dept.operations')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                {t('reports.print')}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t('reports.exportPDF')}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                {t('reports.exportExcel')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('reports.payrollTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySalaries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Area type="monotone" dataKey="net" name={t('reports.netSalary')} stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="basic" name={t('reports.basicSalary')} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="allowances" name={t('reports.totalAllowances')} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.salaryDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryRange}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" name={t('reports.employees')} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.salaryByDept')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentSalaries}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {departmentSalaries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('salaryReports.deptCostComparison')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentSalaries} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                      <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Bar dataKey="value" name={t('reports.totalPayroll')} radius={[0, 4, 4, 0]}>
                        {departmentSalaries.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('salaryReports.deptSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaries.department')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaryReports.employeesCount')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('reports.totalPayroll')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('reports.avgSalary')}</TableHead>
                      <TableHead className={cn(isRTL && "text-right")}>{t('salaryReports.costPercentage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentSalaries.map((dept, index) => {
                      const totalValue = departmentSalaries.reduce((sum, d) => sum + d.value, 0);
                      return (
                        <TableRow key={index}>
                          <TableCell className={cn("font-medium", isRTL && "text-right")}>
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                              {dept.name}
                            </div>
                          </TableCell>
                          <TableCell className={cn(isRTL && "text-right")}>{dept.employees}</TableCell>
                          <TableCell className={cn(isRTL && "text-right")}>{dept.value.toLocaleString()}</TableCell>
                          <TableCell className={cn(isRTL && "text-right")}>{dept.avgSalary.toLocaleString()}</TableCell>
                          <TableCell className={cn(isRTL && "text-right")}>
                            <Badge variant="outline">{((dept.value / totalValue) * 100).toFixed(1)}%</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <CardTitle>{t('salaryReports.employeeSalaryDetails')}</CardTitle>
                <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t('reports.exportExcel')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employeeId')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('employees.table.name')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.department')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.basicSalary')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.allowancesTotal')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.deductionsTotal')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('salaries.netSalary')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSalaryDetails.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <Badge variant="outline" className="font-mono">{emp.id}</Badge>
                      </TableCell>
                      <TableCell className={cn("font-medium", isRTL && "text-right")}>{emp.name}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{emp.dept}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{emp.basic.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <span className="text-green-600">+{emp.allowances.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <span className="text-destructive">-{emp.deductions.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className={cn("font-bold", isRTL && "text-right")}>{emp.net.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('salaryReports.yearOverYear')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Line type="monotone" dataKey="current" name={t('salaryReports.currentYear')} stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="previous" name={t('salaryReports.previousYear')} stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">{t('salaryReports.growthRate')}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">+15.2%</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('salaryReports.vsLastYear')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">{t('salaryReports.avgIncrease')}</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">+8.5%</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('salaryReports.perEmployee')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">{t('salaryReports.newPositions')}</p>
                  <p className="text-3xl font-bold text-primary mt-2">+18</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('salaryReports.thisYear')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Allowances Analysis Tab */}
        <TabsContent value="allowances">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('salaryReports.allowanceBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allowanceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {allowanceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('salaryReports.deductionBreakdown')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deductionBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {deductionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('salaryReports.monthlyAllowanceTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySalaries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Bar dataKey="allowances" name={t('reports.totalAllowances')} fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="deductions" name={t('reports.totalDeductions')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SalaryReports;
