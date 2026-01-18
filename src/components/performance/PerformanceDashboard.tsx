import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Star, TrendingUp, Users, Target, Award, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const performanceData = [
  { name: 'ممتاز', value: 8, color: 'hsl(var(--stat-green))' },
  { name: 'جيد جداً', value: 15, color: 'hsl(var(--stat-blue))' },
  { name: 'جيد', value: 12, color: 'hsl(var(--stat-yellow))' },
  { name: 'مقبول', value: 5, color: 'hsl(var(--stat-coral))' },
  { name: 'ضعيف', value: 2, color: 'hsl(var(--destructive))' },
];

const quarterlyTrend = [
  { quarter: 'Q1 2024', average: 3.8, completed: 35 },
  { quarter: 'Q2 2024', average: 4.0, completed: 38 },
  { quarter: 'Q3 2024', average: 4.1, completed: 40 },
  { quarter: 'Q4 2024', average: 4.2, completed: 42 },
];

const topPerformers = [
  { id: 1, name: 'أحمد محمد', department: 'تقنية المعلومات', score: 4.9, avatar: 'AM' },
  { id: 2, name: 'فاطمة علي', department: 'الموارد البشرية', score: 4.8, avatar: 'FA' },
  { id: 3, name: 'محمد حسن', department: 'المبيعات', score: 4.7, avatar: 'MH' },
  { id: 4, name: 'سارة أحمد', department: 'المالية', score: 4.6, avatar: 'SA' },
  { id: 5, name: 'عمر خالد', department: 'العمليات', score: 4.5, avatar: 'OK' },
];

export const PerformanceDashboard = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    { 
      key: 'performance.stats.avgScore', 
      value: '4.2', 
      icon: Star, 
      color: 'bg-stat-yellow/10 text-stat-yellow',
      trend: '+0.2',
      trendUp: true
    },
    { 
      key: 'performance.stats.totalReviews', 
      value: '42', 
      icon: BarChart3, 
      color: 'bg-stat-blue/10 text-stat-blue',
      trend: '+5',
      trendUp: true
    },
    { 
      key: 'performance.stats.pendingReviews', 
      value: '8', 
      icon: Target, 
      color: 'bg-stat-coral/10 text-stat-coral',
      trend: '-3',
      trendUp: false
    },
    { 
      key: 'performance.stats.completionRate', 
      value: '84%', 
      icon: TrendingUp, 
      color: 'bg-stat-green/10 text-stat-green',
      trend: '+12%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key}>
              <CardContent className="p-6">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("space-y-1", isRTL && "text-right")}>
                    <p className="text-sm text-muted-foreground">{t(stat.key)}</p>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded",
                        stat.trendUp ? "bg-stat-green/10 text-stat-green" : "bg-stat-coral/10 text-stat-coral"
                      )}>
                        {stat.trend}
                      </span>
                    </div>
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
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('performance.charts.distribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('performance.charts.quarterlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyTrend}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="hsl(var(--stat-blue))" name={t('performance.metrics.average')} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="hsl(var(--stat-green))" name={t('performance.metrics.completed')} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Award className="w-5 h-5 text-stat-yellow" />
            {t('performance.topPerformers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div 
                key={performer.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                  index === 0 ? "bg-stat-yellow text-stat-yellow-foreground" :
                  index === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                  index === 2 ? "bg-stat-coral/20 text-stat-coral" :
                  "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
                  {performer.avatar}
                </div>
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <p className="font-medium">{performer.name}</p>
                  <p className="text-sm text-muted-foreground">{performer.department}</p>
                </div>
                <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  <Star className="w-4 h-4 text-stat-yellow fill-stat-yellow" />
                  <span className="font-bold text-lg">{performer.score}</span>
                </div>
                <Progress value={performer.score * 20} className="w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
