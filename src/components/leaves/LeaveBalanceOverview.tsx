import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, CalendarDays, Stethoscope, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmployeeLeaveBalance } from '@/types/leaves';

interface LeaveBalanceOverviewProps {
  balances: EmployeeLeaveBalance[];
}

export const LeaveBalanceOverview = ({ balances }: LeaveBalanceOverviewProps) => {
  const { t, isRTL, language } = useLanguage();

  // Summary cards data
  const totalAnnualUsed = balances.reduce((sum, b) => sum + b.annualUsed, 0);
  const totalAnnualTotal = balances.reduce((sum, b) => sum + b.annualTotal, 0);
  const totalSickUsed = balances.reduce((sum, b) => sum + b.sickUsed, 0);
  const totalSickTotal = balances.reduce((sum, b) => sum + b.sickTotal, 0);
  const totalCasualUsed = balances.reduce((sum, b) => sum + b.casualUsed, 0);
  const totalCasualTotal = balances.reduce((sum, b) => sum + b.casualTotal, 0);

  const summaryCards = [
    {
      title: t('leaves.balance.annualLeave'),
      used: totalAnnualUsed,
      total: totalAnnualTotal,
      icon: CalendarDays,
      color: 'text-stat-blue',
      bgColor: 'bg-stat-blue-bg',
      iconBg: 'bg-stat-blue',
    },
    {
      title: t('leaves.balance.sickLeave'),
      used: totalSickUsed,
      total: totalSickTotal,
      icon: Stethoscope,
      color: 'text-stat-coral',
      bgColor: 'bg-stat-coral-bg',
      iconBg: 'bg-stat-coral',
    },
    {
      title: t('leaves.balance.casualLeave'),
      used: totalCasualUsed,
      total: totalCasualTotal,
      icon: Coffee,
      color: 'text-stat-green',
      bgColor: 'bg-stat-green-bg',
      iconBg: 'bg-stat-green',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const percentage = (card.used / card.total) * 100;
          return (
            <div key={index} className={cn("rounded-xl p-5 shadow-sm border border-border/30", card.bgColor)}>
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className={cn("p-3 rounded-xl", card.iconBg)}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {card.used} / {card.total}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className={cn("flex justify-between text-xs text-muted-foreground mb-1", isRTL && "flex-row-reverse")}>
                  <span>{t('leaves.balance.used')}</span>
                  <span>{percentage.toFixed(0)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('leaves.balance.detailedBalance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{t('leaves.balance.employee')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('leaves.balance.department')}</TableHead>
                  <TableHead className={cn("text-center", isRTL && "text-right")}>{t('leaves.balance.annualLeave')}</TableHead>
                  <TableHead className={cn("text-center", isRTL && "text-right")}>{t('leaves.balance.sickLeave')}</TableHead>
                  <TableHead className={cn("text-center", isRTL && "text-right")}>{t('leaves.balance.casualLeave')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance.employeeId}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? balance.employeeNameAr : balance.employeeName}
                    </TableCell>
                    <TableCell>{t(`dept.${balance.department.toLowerCase()}`)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-stat-blue">
                          {balance.annualRemaining} / {balance.annualTotal}
                        </span>
                        <Progress 
                          value={(balance.annualUsed / balance.annualTotal) * 100} 
                          className="h-1.5 w-16 mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-stat-coral">
                          {balance.sickRemaining} / {balance.sickTotal}
                        </span>
                        <Progress 
                          value={(balance.sickUsed / balance.sickTotal) * 100} 
                          className="h-1.5 w-16 mt-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-stat-green">
                          {balance.casualRemaining} / {balance.casualTotal}
                        </span>
                        <Progress 
                          value={(balance.casualUsed / balance.casualTotal) * 100} 
                          className="h-1.5 w-16 mt-1"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
