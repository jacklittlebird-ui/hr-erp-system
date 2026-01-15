import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AttendanceChart = () => {
  const { t, isRTL } = useLanguage();

  const data = [
    { day: isRTL ? 'السبت' : 'Sat', attendance: 165, completed: 45, late: 12 },
    { day: isRTL ? 'الأحد' : 'Sun', attendance: 180, completed: 52, late: 8 },
    { day: isRTL ? 'الاثنين' : 'Mon', attendance: 175, completed: 48, late: 15 },
    { day: isRTL ? 'الثلاثاء' : 'Tue', attendance: 185, completed: 55, late: 10 },
    { day: isRTL ? 'الأربعاء' : 'Wed', attendance: 178, completed: 50, late: 18 },
    { day: isRTL ? 'الخميس' : 'Thu', attendance: 170, completed: 42, late: 14 },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
      <h3 className={`text-lg font-semibold text-foreground mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-primary">📊</span>
        {t('chart.weeklyAttendance')}
      </h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontFamily: isRTL ? 'Cairo' : 'Inter'
              }}
            />
            <Legend 
              formatter={(value) => {
                const labels: Record<string, string> = {
                  attendance: t('legend.attendance'),
                  completed: t('legend.completed'),
                  late: t('legend.late'),
                };
                return <span style={{ fontFamily: isRTL ? 'Cairo' : 'Inter' }}>{labels[value] || value}</span>;
              }}
            />
            <Bar dataKey="attendance" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" fill="hsl(var(--chart-6))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
