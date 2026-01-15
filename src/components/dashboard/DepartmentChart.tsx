import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  'hsl(217, 91%, 60%)',   // Blue - IT
  'hsl(330, 81%, 60%)',   // Pink - HR
  'hsl(168, 76%, 42%)',   // Teal - Finance
  'hsl(142, 71%, 45%)',   // Green - Sales
  'hsl(0, 79%, 72%)',     // Coral - Marketing
  'hsl(45, 93%, 47%)',    // Yellow - Operations
];

export const DepartmentChart = () => {
  const { t, isRTL } = useLanguage();

  const data = [
    { name: t('dept.it'), value: 35 },
    { name: t('dept.hr'), value: 15 },
    { name: t('dept.finance'), value: 20 },
    { name: t('dept.sales'), value: 45 },
    { name: t('dept.marketing'), value: 25 },
    { name: t('dept.operations'), value: 30 },
  ];

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border/50">
      <h3 className={`text-lg font-semibold text-foreground mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <span className="text-primary">📊</span>
        {t('chart.departmentDist')}
      </h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontFamily: isRTL ? 'Cairo' : 'Inter'
              }}
            />
            <Legend 
              layout="vertical"
              align={isRTL ? "left" : "right"}
              verticalAlign="middle"
              formatter={(value) => (
                <span style={{ fontFamily: isRTL ? 'Cairo' : 'Inter', color: 'hsl(var(--foreground))' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
