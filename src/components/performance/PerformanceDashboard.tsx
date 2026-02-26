import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePerformanceData } from '@/contexts/PerformanceDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Star, TrendingUp, Users, Target, Award, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const PerformanceDashboard = () => {
  const { t, isRTL, language } = useLanguage();
  const { reviews } = usePerformanceData();

  const { performanceData, quarterlyTrend, topPerformers, stats } = useMemo(() => {
    const total = reviews.length;
    const avgScore = total > 0 ? (reviews.reduce((s, r) => s + r.score, 0) / total) : 0;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'submitted' || r.status === 'draft').length;
    const completionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Distribution
    const excellent = reviews.filter(r => r.score >= 4.5).length;
    const veryGood = reviews.filter(r => r.score >= 3.5 && r.score < 4.5).length;
    const good = reviews.filter(r => r.score >= 2.5 && r.score < 3.5).length;
    const acceptable = reviews.filter(r => r.score >= 1.5 && r.score < 2.5).length;
    const poor = reviews.filter(r => r.score < 1.5).length;

    const performanceData = [
      { name: language === 'ar' ? 'ممتاز' : 'Excellent', value: excellent, color: 'hsl(var(--stat-green))' },
      { name: language === 'ar' ? 'جيد جداً' : 'Very Good', value: veryGood, color: 'hsl(var(--stat-blue))' },
      { name: language === 'ar' ? 'جيد' : 'Good', value: good, color: 'hsl(var(--stat-yellow))' },
      { name: language === 'ar' ? 'مقبول' : 'Acceptable', value: acceptable, color: 'hsl(var(--stat-coral))' },
      { name: language === 'ar' ? 'ضعيف' : 'Poor', value: poor, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);

    // Quarterly trend from actual data
    const quarterMap: Record<string, { total: number; count: number }> = {};
    reviews.forEach(r => {
      const key = `${r.quarter} ${r.year}`;
      if (!quarterMap[key]) quarterMap[key] = { total: 0, count: 0 };
      quarterMap[key].total += r.score;
      quarterMap[key].count++;
    });
    const quarterlyTrend = Object.entries(quarterMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4)
      .map(([quarter, data]) => ({
        quarter,
        average: parseFloat((data.total / data.count).toFixed(1)),
        completed: data.count,
      }));

    // Top performers - best score per employee
    const empBest: Record<string, { name: string; department: string; score: number }> = {};
    reviews.filter(r => r.status === 'approved').forEach(r => {
      if (!empBest[r.employeeId] || r.score > empBest[r.employeeId].score) {
        empBest[r.employeeId] = { name: r.employeeName, department: r.department, score: r.score };
      }
    });
    const topPerformers = Object.entries(empBest)
      .map(([id, data]) => ({ id, ...data, avatar: data.name.split(' ').map(w => w[0]).join('').slice(0, 2) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const stats = [
      { key: 'performance.stats.avgScore', value: avgScore.toFixed(1), icon: Star, color: 'bg-stat-yellow/10 text-stat-yellow' },
      { key: 'performance.stats.totalReviews', value: String(total), icon: BarChart3, color: 'bg-stat-blue/10 text-stat-blue' },
      { key: 'performance.stats.pendingReviews', value: String(pending), icon: Target, color: 'bg-stat-coral/10 text-stat-coral' },
      { key: 'performance.stats.completionRate', value: `${completionRate}%`, icon: TrendingUp, color: 'bg-stat-green/10 text-stat-green' },
    ];

    return { performanceData, quarterlyTrend, topPerformers, stats };
  }, [reviews, language]);

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
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('performance.charts.distribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={performanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('performance.charts.quarterlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {quarterlyTrend.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</div>
              )}
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
          {topPerformers.length > 0 ? (
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className={cn("flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                    index === 0 ? "bg-stat-yellow text-stat-yellow-foreground" :
                    index === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                    index === 2 ? "bg-stat-coral/20 text-stat-coral" :
                    "bg-muted text-muted-foreground"
                  )}>{index + 1}</div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">{performer.avatar}</div>
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">{language === 'ar' ? 'لا توجد تقييمات معتمدة بعد' : 'No approved reviews yet'}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
