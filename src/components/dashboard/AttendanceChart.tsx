import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

export const AttendanceChart = () => {
  const { t, isRTL } = useLanguage();
  const [data, setData] = useState<{ day: string; attendance: number; late: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const now = new Date();
      const days: { day: string; attendance: number; late: number }[] = [];
      // Last 6 working days
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const { data: records } = await supabase.from('attendance_records').select('id, is_late').eq('date', dateStr);
        days.push({
          day: d.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'short' }),
          attendance: records?.length || 0,
          late: records?.filter(r => r.is_late).length || 0,
        });
      }
      setData(days);
    };
    fetch();
  }, [isRTL]);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
      <h3 className={`text-lg font-semibold text-foreground mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-primary">📊</span>
        {t('chart.weeklyAttendance')}
      </h3>
      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">{isRTL ? 'لا توجد بيانات' : 'No data'}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }} reversed={isRTL} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }} orientation={isRTL ? 'right' : 'left'} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontFamily: isRTL ? 'Cairo' : 'Inter' }} />
              <Legend formatter={(value) => {
                const labels: Record<string, string> = { attendance: t('legend.attendance'), late: t('legend.late') };
                return <span style={{ fontFamily: isRTL ? 'Cairo' : 'Inter' }}>{labels[value] || value}</span>;
              }} />
              <Bar dataKey="attendance" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="hsl(var(--chart-6))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
