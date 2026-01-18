import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Download, FileBarChart, TrendingUp, TrendingDown, Users, Building2, Star, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const departmentScores = [
  { department: 'تقنية المعلومات', average: 4.3, employees: 15, trend: '+0.3' },
  { department: 'الموارد البشرية', average: 4.1, employees: 8, trend: '+0.2' },
  { department: 'المبيعات', average: 3.9, employees: 20, trend: '-0.1' },
  { department: 'المالية', average: 4.0, employees: 10, trend: '+0.1' },
  { department: 'العمليات', average: 3.7, employees: 25, trend: '+0.4' },
  { department: 'التسويق', average: 4.2, employees: 12, trend: '+0.2' },
];

const quarterlyComparison = [
  { quarter: 'Q1', score: 3.8, target: 4.0 },
  { quarter: 'Q2', score: 4.0, target: 4.0 },
  { quarter: 'Q3', score: 4.1, target: 4.2 },
  { quarter: 'Q4', score: 4.2, target: 4.2 },
];

const criteriaAverages = [
  { criteria: 'جودة العمل', score: 4.2 },
  { criteria: 'الإنتاجية', score: 3.9 },
  { criteria: 'العمل الجماعي', score: 4.1 },
  { criteria: 'التواصل', score: 4.0 },
  { criteria: 'المبادرة', score: 3.7 },
  { criteria: 'الحضور', score: 4.3 },
];

const radarData = criteriaAverages.map(item => ({
  subject: item.criteria,
  A: item.score * 20,
  fullMark: 100,
}));

export const QuarterlyReports = () => {
  const { t, isRTL } = useLanguage();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedQuarter, setSelectedQuarter] = useState('Q4');

  const summaryStats = [
    { label: t('performance.reports.totalReviews'), value: '90', icon: FileBarChart, color: 'bg-stat-blue/10 text-stat-blue' },
    { label: t('performance.reports.avgScore'), value: '4.2', icon: Star, color: 'bg-stat-yellow/10 text-stat-yellow' },
    { label: t('performance.reports.aboveTarget'), value: '72%', icon: TrendingUp, color: 'bg-stat-green/10 text-stat-green' },
    { label: t('performance.reports.needsImprovement'), value: '8%', icon: TrendingDown, color: 'bg-stat-coral/10 text-stat-coral' },
  ];

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row justify-between gap-4", isRTL && "sm:flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <FileBarChart className="w-5 h-5 text-primary" />
                {t('performance.reports.title')}
              </CardTitle>
              <CardDescription className="mt-1">{t('performance.reports.description')}</CardDescription>
            </div>
            <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q4">Q4</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q1">Q1</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t('performance.reports.export')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-1", isRTL && "text-right")}>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg", stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('performance.reports.quarterlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyComparison}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis domain={[3, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--stat-blue))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--stat-blue))', strokeWidth: 2, r: 6 }}
                    name={t('performance.metrics.actualScore')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--stat-green))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--stat-green))', strokeWidth: 2, r: 4 }}
                    name={t('performance.metrics.target')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Criteria Radar */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Target className="w-5 h-5 text-primary" />
              {t('performance.reports.criteriaAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar 
                    name="Score" 
                    dataKey="A" 
                    stroke="hsl(var(--stat-blue))" 
                    fill="hsl(var(--stat-blue))" 
                    fillOpacity={0.4} 
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Building2 className="w-5 h-5 text-primary" />
            {t('performance.reports.departmentPerformance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentScores.map((dept) => (
              <div 
                key={dept.department}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                  <p className="font-medium truncate">{dept.department}</p>
                  <p className="text-sm text-muted-foreground">
                    {dept.employees} {t('performance.reports.employees')}
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={dept.average * 20} className="h-2" />
                </div>
                <div className={cn("flex items-center gap-2 min-w-[100px]", isRTL && "flex-row-reverse justify-end")}>
                  <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                    <Star className="w-4 h-4 text-stat-yellow fill-stat-yellow" />
                    <span className="font-bold">{dept.average}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    dept.trend.startsWith('+') ? "bg-stat-green/10 text-stat-green" : "bg-stat-coral/10 text-stat-coral"
                  )}>
                    {dept.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criteria Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="w-5 h-5 text-primary" />
            {t('performance.reports.criteriaBreakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={criteriaAverages} layout="vertical">
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="criteria" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--stat-blue))" 
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
