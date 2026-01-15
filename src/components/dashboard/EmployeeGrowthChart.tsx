import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const EmployeeGrowthChart = () => {
  const { t, isRTL } = useLanguage();

  const data = [
    { month: t('month.jan'), employees: 165 },
    { month: t('month.feb'), employees: 170 },
    { month: t('month.mar'), employees: 175 },
    { month: t('month.apr'), employees: 180 },
    { month: t('month.may'), employees: 185 },
    { month: t('month.jun'), employees: 190 },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
      <h3 className={`text-lg font-semibold text-foreground mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-primary">📈</span>
        {t('chart.employeeGrowth')}
      </h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontFamily: isRTL ? 'Cairo' : 'Inter', fontSize: 12 }}
              domain={[160, 195]}
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
            <Line 
              type="monotone" 
              dataKey="employees" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
