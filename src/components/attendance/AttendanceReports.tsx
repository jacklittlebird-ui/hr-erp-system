import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Clock, TrendingUp, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/pages/Attendance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from 'recharts';

interface AttendanceReportsProps {
  records: AttendanceRecord[];
}

export const AttendanceReports = ({ records }: AttendanceReportsProps) => {
  const { t, isRTL, language } = useLanguage();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const onLeave = records.filter(r => r.status === 'on-leave').length;
    const earlyLeave = records.filter(r => r.status === 'early-leave').length;
    
    const totalWorkHours = records.reduce((sum, r) => sum + r.workHours, 0);
    const totalOvertime = records.reduce((sum, r) => sum + r.overtime, 0);
    
    const attendanceRate = totalRecords > 0 ? ((present + late) / totalRecords * 100).toFixed(1) : 0;
    const punctualityRate = totalRecords > 0 ? (present / (present + late) * 100).toFixed(1) : 0;

    return {
      totalRecords,
      present,
      late,
      absent,
      onLeave,
      earlyLeave,
      totalWorkHours,
      totalOvertime,
      attendanceRate,
      punctualityRate,
    };
  }, [records]);

  // Status distribution for pie chart
  const statusData = [
    { name: t('attendance.status.present'), value: stats.present, color: '#22c55e' },
    { name: t('attendance.status.late'), value: stats.late, color: '#f59e0b' },
    { name: t('attendance.status.absent'), value: stats.absent, color: '#ef4444' },
    { name: t('attendance.status.on-leave'), value: stats.onLeave, color: '#3b82f6' },
    { name: t('attendance.status.early-leave'), value: stats.earlyLeave, color: '#f97316' },
  ].filter(d => d.value > 0);

  // Department-wise attendance
  const departmentData = useMemo(() => {
    const depts: Record<string, { present: number; late: number; absent: number }> = {};
    records.forEach(r => {
      if (!depts[r.department]) {
        depts[r.department] = { present: 0, late: 0, absent: 0 };
      }
      if (r.status === 'present') depts[r.department].present++;
      else if (r.status === 'late') depts[r.department].late++;
      else if (r.status === 'absent') depts[r.department].absent++;
    });
    return Object.entries(depts).map(([dept, data]) => ({
      name: t(`dept.${dept.toLowerCase()}`),
      [t('attendance.status.present')]: data.present,
      [t('attendance.status.late')]: data.late,
      [t('attendance.status.absent')]: data.absent,
    }));
  }, [records, t]);

  // Weekly trend
  const weeklyTrend = useMemo(() => {
    const days: Record<string, { date: string; attendance: number; late: number }> = {};
    records.forEach(r => {
      if (!days[r.date]) {
        days[r.date] = { date: r.date, attendance: 0, late: 0 };
      }
      if (r.status === 'present' || r.status === 'late') {
        days[r.date].attendance++;
      }
      if (r.status === 'late') {
        days[r.date].late++;
      }
    });
    return Object.values(days).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-success/10">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.attendanceRate')}</p>
                <p className="text-2xl font-bold text-success">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-primary/10">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.punctualityRate')}</p>
                <p className="text-2xl font-bold text-primary">{stats.punctualityRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.totalWorkHours')}</p>
                <p className="text-2xl font-bold">{stats.totalWorkHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attendance.reports.totalOvertime')}</p>
                <p className="text-2xl font-bold">{stats.totalOvertime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t('attendance.reports.statusDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('attendance.reports.weeklyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="attendance" 
                    name={t('attendance.reports.totalAttendance')}
                    stroke="#22c55e" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="late" 
                    name={t('attendance.status.late')}
                    stroke="#f59e0b" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('attendance.reports.departmentWise')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey={t('attendance.status.present')} fill="#22c55e" />
                <Bar dataKey={t('attendance.status.late')} fill="#f59e0b" />
                <Bar dataKey={t('attendance.status.absent')} fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
