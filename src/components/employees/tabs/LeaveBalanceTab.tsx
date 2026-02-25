import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarDays, Stethoscope, AlertTriangle, Clock, Save, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaveBalanceTabProps {
  employee: Employee;
  onUpdate?: (updates: Partial<Employee>) => void;
  onDirectSave?: (updates: Partial<Employee>) => Promise<void>;
}

interface YearlyBalance {
  year: number;
  annualTotal: number;
  annualUsed: number;
  sickTotal: number;
  sickUsed: number;
  casualTotal: number;
  casualUsed: number;
  permissionsTotal: number;
  permissionsUsed: number;
}

const currentYear = new Date().getFullYear();
const availableYears = Array.from({ length: 11 }, (_, i) => 2025 + i); // 2025-2035

// Initial mock saved balances
const initialSavedBalances: YearlyBalance[] = [
  {
    year: 2026,
    annualTotal: 21,
    annualUsed: 0,
    sickTotal: 15,
    sickUsed: 0,
    casualTotal: 7,
    casualUsed: 0,
    permissionsTotal: 24,
    permissionsUsed: 0,
  },
  {
    year: 2025,
    annualTotal: 21,
    annualUsed: 5,
    sickTotal: 15,
    sickUsed: 2,
    casualTotal: 7,
    casualUsed: 1,
    permissionsTotal: 24,
    permissionsUsed: 4,
  },
];

const leaveCardConfig = [
  {
    key: 'annual' as const,
    titleKey: 'leaveBalance.annualLeave',
    icon: CalendarDays,
    iconBg: 'bg-blue-500',
    iconColor: 'text-blue-500',
    totalColor: 'text-blue-600',
    usedColor: 'text-blue-500',
    remainingColor: 'text-blue-600',
    cardBg: 'bg-blue-50',
    unit: 'day',
  },
  {
    key: 'sick' as const,
    titleKey: 'leaveBalance.sickLeave',
    icon: Stethoscope,
    iconBg: 'bg-orange-500',
    iconColor: 'text-orange-500',
    totalColor: 'text-orange-600',
    usedColor: 'text-orange-500',
    remainingColor: 'text-orange-600',
    cardBg: 'bg-orange-50',
    unit: 'day',
  },
  {
    key: 'casual' as const,
    titleKey: 'leaveBalance.casualLeave',
    icon: AlertTriangle,
    iconBg: 'bg-green-500',
    iconColor: 'text-green-500',
    totalColor: 'text-green-600',
    usedColor: 'text-green-500',
    remainingColor: 'text-green-600',
    cardBg: 'bg-green-50',
    unit: 'day',
  },
  {
    key: 'permissions' as const,
    titleKey: 'leaveBalance.permissions',
    icon: Clock,
    iconBg: 'bg-purple-500',
    iconColor: 'text-purple-500',
    totalColor: 'text-purple-600',
    usedColor: 'text-purple-500',
    remainingColor: 'text-purple-600',
    cardBg: 'bg-purple-50',
    unit: 'hour',
  },
];

export const LeaveBalanceTab = ({ employee, onUpdate, onDirectSave }: LeaveBalanceTabProps) => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [savedBalances, setSavedBalances] = useState<YearlyBalance[]>(() => {
    const currentYearBalance: YearlyBalance = {
      year: currentYear,
      annualTotal: Number(employee.annualLeaveBalance ?? 21),
      annualUsed: 0,
      sickTotal: Number(employee.sickLeaveBalance ?? 15),
      sickUsed: 0,
      casualTotal: 7,
      casualUsed: 0,
      permissionsTotal: 24,
      permissionsUsed: 0,
    };

    return [currentYearBalance, ...initialSavedBalances.filter((b) => b.year !== currentYear)];
  });

  // Form state for the selected year
  const existingBalance = savedBalances.find(b => b.year === Number(selectedYear));

  const [annualTotal, setAnnualTotal] = useState(existingBalance?.annualTotal ?? Number(employee.annualLeaveBalance ?? 21));
  const [sickTotal, setSickTotal] = useState(existingBalance?.sickTotal ?? Number(employee.sickLeaveBalance ?? 15));
  const [casualTotal, setCasualTotal] = useState(existingBalance?.casualTotal ?? 7);
  const [permissionsTotal, setPermissionsTotal] = useState(existingBalance?.permissionsTotal ?? 24);

  // When year changes, update form fields
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const balance = savedBalances.find(b => b.year === Number(year));
    if (balance) {
      setAnnualTotal(balance.annualTotal);
      setSickTotal(balance.sickTotal);
      setCasualTotal(balance.casualTotal);
      setPermissionsTotal(balance.permissionsTotal);
    } else {
      setAnnualTotal(21);
      setSickTotal(15);
      setCasualTotal(7);
      setPermissionsTotal(24);
    }
  };

  const handleSave = async () => {
    const yearNum = Number(selectedYear);
    const newBalance: YearlyBalance = {
      year: yearNum,
      annualTotal,
      annualUsed: existingBalance?.annualUsed ?? 0,
      sickTotal,
      sickUsed: existingBalance?.sickUsed ?? 0,
      casualTotal,
      casualUsed: existingBalance?.casualUsed ?? 0,
      permissionsTotal,
      permissionsUsed: existingBalance?.permissionsUsed ?? 0,
    };

    setSavedBalances(prev => {
      const existing = prev.find(b => b.year === yearNum);
      if (existing) {
        return prev.map(b => b.year === yearNum ? newBalance : b);
      }
      return [...prev, newBalance].sort((a, b) => b.year - a.year);
    });

    const updates: Partial<Employee> = {
      annualLeaveBalance: annualTotal,
      sickLeaveBalance: sickTotal,
    };

    // Push to parent for accumulation
    onUpdate?.(updates);

    // Also directly save to DB if handler provided
    if (onDirectSave) {
      try {
        await onDirectSave(updates);
        toast({
          title: t('leaveBalance.saved'),
          description: t('leaveBalance.savedMessage'),
        });
      } catch {
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء حفظ الرصيد',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: t('leaveBalance.saved'),
        description: t('leaveBalance.savedMessage'),
      });
    }
  };

  // History: last 4 years from saved balances
  const historyBalances = useMemo(() => {
    return savedBalances
      .sort((a, b) => b.year - a.year)
      .slice(0, 4);
  }, [savedBalances]);

  const getCardValues = (balance: YearlyBalance, key: string) => {
    switch (key) {
      case 'annual':
        return { total: balance.annualTotal, used: balance.annualUsed, remaining: balance.annualTotal - balance.annualUsed };
      case 'sick':
        return { total: balance.sickTotal, used: balance.sickUsed, remaining: balance.sickTotal - balance.sickUsed };
      case 'casual':
        return { total: balance.casualTotal, used: balance.casualUsed, remaining: balance.casualTotal - balance.casualUsed };
      case 'permissions':
        return { total: balance.permissionsTotal, used: balance.permissionsUsed, remaining: balance.permissionsTotal - balance.permissionsUsed };
      default:
        return { total: 0, used: 0, remaining: 0 };
    }
  };

  const getUnitLabel = (unit: string) => {
    return unit === 'hour' ? t('leaveBalance.hours') : t('leaveBalance.days');
  };

  return (
    <div className="p-6 space-y-8">
      {/* Year Selector */}
      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <h3 className="text-lg font-semibold text-foreground">{t('leaveBalance.year')}</h3>
        <Select value={selectedYear} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
            {availableYears.map(year => (
              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Balance Cards - Editable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveCardConfig.map((card) => {
          const Icon = card.icon;
          const isExisting = !!existingBalance;
          const values = existingBalance ? getCardValues(existingBalance, card.key) : null;
          
          let totalValue: number;
          let setTotal: (val: number) => void;
          
          switch (card.key) {
            case 'annual':
              totalValue = annualTotal;
              setTotal = (val) => {
                setAnnualTotal(val);
                onUpdate?.({ annualLeaveBalance: val });
              };
              break;
            case 'sick':
              totalValue = sickTotal;
              setTotal = (val) => {
                setSickTotal(val);
                onUpdate?.({ sickLeaveBalance: val });
              };
              break;
            case 'casual':
              totalValue = casualTotal;
              setTotal = setCasualTotal;
              break;
            case 'permissions':
              totalValue = permissionsTotal;
              setTotal = setPermissionsTotal;
              break;
          }

          return (
            <div key={card.key} className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className={cn("flex items-center gap-3 p-4 pb-2", isRTL && "flex-row-reverse")}>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", card.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">{t(card.titleKey)}</h4>
              </div>

              {/* Total Value */}
              <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground mb-1">{t('leaveBalance.total')}</p>
                <Input
                  type="number"
                  min={0}
                  value={totalValue}
                  onChange={(e) => setTotal(Number(e.target.value))}
                  className={cn("text-2xl font-bold h-12 text-center", card.totalColor)}
                />
              </div>

              {/* Used & Remaining */}
              <div className={cn("grid grid-cols-2 gap-2 p-4 pt-2", card.cardBg)}>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t('leaveBalance.used')}</p>
                  <p className={cn("text-lg font-bold", card.usedColor)}>
                    {values?.used ?? 0} <span className="text-xs font-normal">{getUnitLabel(card.unit)}</span>
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t('leaveBalance.remaining')}</p>
                  <p className={cn("text-lg font-bold", card.remainingColor)}>
                    {values ? values.remaining : totalValue} <span className="text-xs font-normal">{getUnitLabel(card.unit)}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        className="w-full h-12 text-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
      >
        <Save className="w-5 h-5" />
        {t('leaveBalance.saveBalance')}
      </Button>

      {/* Balance History */}
      <div className="space-y-4">
        <h3 className={cn("text-xl font-bold text-foreground", isRTL && "text-right")}>
          {t('leaveBalance.balanceHistory')}
        </h3>

        {/* History Header */}
        <div className="bg-destructive text-destructive-foreground rounded-xl p-4">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <CalendarIcon className="w-5 h-5" />
              <span className="font-semibold">
                {t('leaveBalance.historyTitle')}
              </span>
            </div>
            <span className="text-sm opacity-80">
              {t('leaveBalance.showing')} {historyBalances.length} {t('leaveBalance.yearsLabel')}
            </span>
          </div>
        </div>

        {/* Year Sections */}
        {historyBalances.map((balance) => (
          <div key={balance.year} className="border-2 border-green-300/50 rounded-xl p-5 bg-green-50/30">
            {/* Year Header */}
            <div className={cn("flex items-center gap-3 mb-4", isRTL && "flex-row-reverse")}>
              <CalendarIcon className="w-5 h-5 text-foreground" />
              <span className="text-xl font-bold text-foreground">{balance.year}</span>
              {balance.year === currentYear && (
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {t('leaveBalance.currentYear')}
                </span>
              )}
            </div>

            {/* Read-only Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {leaveCardConfig.map((card) => {
                const Icon = card.icon;
                const values = getCardValues(balance, card.key);

                return (
                  <div key={card.key} className="rounded-xl border border-border/30 bg-card shadow-sm overflow-hidden">
                    <div className={cn("flex items-center gap-3 p-4 pb-2", isRTL && "flex-row-reverse")}>
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white", card.iconBg)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{t(card.titleKey)}</h4>
                    </div>

                    <div className="px-4 py-1">
                      <p className="text-xs text-muted-foreground">{t('leaveBalance.total')}</p>
                      <p className={cn("text-2xl font-bold", card.totalColor)}>{values.total}</p>
                    </div>

                    <div className={cn("grid grid-cols-2 gap-2 p-3 pt-2", card.cardBg)}>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{t('leaveBalance.used')}</p>
                        <p className={cn("text-sm font-bold", card.usedColor)}>
                          {values.used} <span className="text-[10px] font-normal">{getUnitLabel(card.unit)}</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">{t('leaveBalance.remaining')}</p>
                        <p className={cn("text-sm font-bold", card.remainingColor)}>
                          {values.remaining} <span className="text-[10px] font-normal">{getUnitLabel(card.unit)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {historyBalances.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t('leaveBalance.noHistory')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
