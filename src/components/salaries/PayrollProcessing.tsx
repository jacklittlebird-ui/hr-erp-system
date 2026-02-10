import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSalaryData, calcGross } from '@/contexts/SalaryDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Wallet, Gift, TrendingDown, Building2, Save, X, FileText, Users, TrendingUp, Clock, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockEmployees } from '@/data/mockEmployees';
import { stationLocations } from '@/data/stationLocations';

// Mock data references
const mockLoans = [
  { employeeId: 'Emp001', monthlyPayment: 2500, status: 'active' },
  { employeeId: 'Emp002', monthlyPayment: 2000, status: 'active' },
];

const mockAdvances = [
  { employeeId: 'Emp002', amount: 2000, deductionMonth: '2026-02', status: 'approved' },
];

const mockMobileBills = [
  { employeeId: 'Emp001', billAmount: 350, deductionMonth: '2026-02' },
  { employeeId: 'Emp002', billAmount: 280, deductionMonth: '2026-02' },
];

interface PayrollEntry {
  employeeId: string;
  month: string;
  year: string;
  bonusType: 'amount' | 'percentage';
  bonusValue: number;
  leaveDays: number;
  penaltyType: 'amount' | 'days' | 'percentage';
  penaltyValue: number;
  saved: boolean;
}

export const PayrollProcessing = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getSalaryRecord } = useSalaryData();

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('02');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Sidebar filters
  const [searchName, setSearchName] = useState('');
  const [searchStation, setSearchStation] = useState('');

  // Payroll-specific fields
  const [bonusType, setBonusType] = useState<'amount' | 'percentage'>('amount');
  const [bonusValue, setBonusValue] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [penaltyType, setPenaltyType] = useState<'amount' | 'days' | 'percentage'>('amount');
  const [penaltyValue, setPenaltyValue] = useState(0);

  const [savedEntries, setSavedEntries] = useState<PayrollEntry[]>([]);

  const period = `${selectedYear}-${selectedMonth}`;

  const salaryRecord = useMemo(() => {
    if (!selectedEmployee) return null;
    return getSalaryRecord(selectedEmployee, selectedYear);
  }, [selectedEmployee, selectedYear, getSalaryRecord]);

  const gross = useMemo(() => {
    if (!salaryRecord) return 0;
    return calcGross(salaryRecord);
  }, [salaryRecord]);

  const bonusAmount = useMemo(() => {
    if (bonusType === 'amount') return bonusValue;
    return Math.round((bonusValue / 100) * gross);
  }, [bonusType, bonusValue, gross]);

  const employeeInsurance = salaryRecord?.employeeInsurance || 0;

  const loanPayment = useMemo(() => {
    const loan = mockLoans.find(l => l.employeeId === selectedEmployee && l.status === 'active');
    return loan?.monthlyPayment || 0;
  }, [selectedEmployee]);

  const advanceAmount = useMemo(() => {
    const adv = mockAdvances.find(a => a.employeeId === selectedEmployee && a.deductionMonth === period && a.status === 'approved');
    return adv?.amount || 0;
  }, [selectedEmployee, period]);

  const mobileBill = useMemo(() => {
    const bill = mockMobileBills.find(b => b.employeeId === selectedEmployee && b.deductionMonth === period);
    return bill?.billAmount || 0;
  }, [selectedEmployee, period]);

  const dailyRate = useMemo(() => gross / 30, [gross]);
  const leaveDeduction = useMemo(() => Math.round(dailyRate * leaveDays), [dailyRate, leaveDays]);

  const penaltyAmount = useMemo(() => {
    if (penaltyType === 'amount') return penaltyValue;
    if (penaltyType === 'days') return Math.round(dailyRate * penaltyValue);
    if (penaltyType === 'percentage') return Math.round((penaltyValue / 100) * gross);
    return 0;
  }, [penaltyType, penaltyValue, dailyRate, gross]);

  const totalDeductions = employeeInsurance + loanPayment + advanceAmount + mobileBill + leaveDeduction + penaltyAmount;
  const grossWithBonus = gross + bonusAmount;
  const netSalary = grossWithBonus - totalDeductions;

  const employerSocialIns = salaryRecord?.employerSocialInsurance || 0;
  const healthIns = salaryRecord?.healthInsurance || 0;
  const incomeTax = salaryRecord?.incomeTax || 0;

  const handleSave = () => {
    if (!selectedEmployee || !salaryRecord) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'يرجى اختيار موظف لديه بيانات راتب' : 'Select an employee with salary data', variant: 'destructive' });
      return;
    }
    const entry: PayrollEntry = {
      employeeId: selectedEmployee, month: selectedMonth, year: selectedYear,
      bonusType, bonusValue, leaveDays, penaltyType, penaltyValue, saved: true,
    };
    setSavedEntries(prev => {
      const idx = prev.findIndex(e => e.employeeId === selectedEmployee && e.month === selectedMonth && e.year === selectedYear);
      if (idx >= 0) { const u = [...prev]; u[idx] = entry; return u; }
      return [...prev, entry];
    });
    toast({ title: ar ? 'تم الحفظ' : 'Saved', description: ar ? 'تم حفظ بيانات الراتب الشهري' : 'Monthly payroll saved' });
  };

  const handleReset = () => {
    setBonusType('amount');
    setBonusValue(0);
    setLeaveDays(0);
    setPenaltyType('amount');
    setPenaltyValue(0);
  };

  const activeEmployees = mockEmployees.filter(e => e.status === 'active');

  // Filter employees by name and station
  const filteredEmployees = activeEmployees.filter(emp => {
    const nameMatch = emp.nameEn.toLowerCase().includes(searchName.toLowerCase()) || emp.nameAr.includes(searchName);
    const stationMatch = !searchStation || searchStation === 'all' || emp.stationLocation === searchStation;
    return nameMatch && stationMatch;
  });

  const months = [
    { value: '01', label: ar ? 'يناير' : 'January' }, { value: '02', label: ar ? 'فبراير' : 'February' },
    { value: '03', label: ar ? 'مارس' : 'March' }, { value: '04', label: ar ? 'أبريل' : 'April' },
    { value: '05', label: ar ? 'مايو' : 'May' }, { value: '06', label: ar ? 'يونيو' : 'June' },
    { value: '07', label: ar ? 'يوليو' : 'July' }, { value: '08', label: ar ? 'أغسطس' : 'August' },
    { value: '09', label: ar ? 'سبتمبر' : 'September' }, { value: '10', label: ar ? 'أكتوبر' : 'October' },
    { value: '11', label: ar ? 'نوفمبر' : 'November' }, { value: '12', label: ar ? 'ديسمبر' : 'December' },
  ];

  const totalSaved = savedEntries.filter(e => e.month === selectedMonth && e.year === selectedYear).length;

  const stats = [
    { label: ar ? 'إجمالي الموظفين' : 'Total Employees', value: String(activeEmployees.length), icon: Users, bg: 'bg-stat-blue', cardBg: 'bg-stat-blue-bg' },
    { label: ar ? 'تم المعالجة' : 'Processed', value: String(totalSaved), icon: FileText, bg: 'bg-stat-green', cardBg: 'bg-stat-green-bg' },
    { label: ar ? 'المتبقي' : 'Remaining', value: String(activeEmployees.length - totalSaved), icon: Clock, bg: 'bg-stat-yellow', cardBg: 'bg-stat-yellow-bg' },
    { label: ar ? 'إجمالي المبالغ' : 'Total Net', value: '—', icon: Wallet, bg: 'bg-stat-purple', cardBg: 'bg-stat-purple-bg' },
  ];

  const readOnlyField = (label: string, value: number | string, disabled = true) => (
    <div className="space-y-1.5">
      <Label className={cn("text-xs", isRTL && "text-right block")}>{label}</Label>
      <Input value={typeof value === 'number' ? value.toLocaleString() : value} readOnly={disabled} disabled={disabled} className={cn("h-9 text-sm bg-muted/30", isRTL && "text-right")} />
    </div>
  );

  const selectedEmpData = activeEmployees.find(e => e.employeeId === selectedEmployee);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={cn("rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border/30", stat.cardBg, isRTL && "flex-row-reverse")}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Period Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className={cn("flex flex-wrap gap-4 items-end", isRTL && "flex-row-reverse")}>
            <div className="space-y-2">
              <Label>{ar ? 'الشهر' : 'Month'}</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'السنة' : 'Year'}</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => String(2025 + i)).map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: Sidebar + Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Employee Sidebar */}
        <div className={cn("col-span-3 space-y-4", isRTL && "order-last")}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={ar ? 'بحث بالاسم...' : 'Search by name...'}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className={cn(isRTL ? "pr-10" : "pl-10")}
                />
              </div>
              <Select value={searchStation} onValueChange={setSearchStation}>
                <SelectTrigger>
                  <SelectValue placeholder={ar ? 'المحطة/الموقع' : 'Station'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => (
                    <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredEmployees.map(emp => {
              const isSaved = savedEntries.some(e => e.employeeId === emp.employeeId && e.month === selectedMonth && e.year === selectedYear);
              return (
                <button
                  key={emp.id}
                  onClick={() => { setSelectedEmployee(emp.employeeId); handleReset(); }}
                  className={cn(
                    "w-full text-start px-3 py-2 rounded-lg transition-colors text-sm flex items-center justify-between",
                    selectedEmployee === emp.employeeId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span>{ar ? emp.nameAr : emp.nameEn}</span>
                  {isSaved && <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-6">
          {selectedEmployee && !salaryRecord && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 text-center">
                <p className="text-destructive font-medium">
                  {ar ? `لا توجد بيانات راتب لهذا الموظف في سنة ${selectedYear}. يرجى إدخال بيانات الراتب أولاً من ملف الموظف.` : `No salary data for this employee in ${selectedYear}. Please enter salary data first from the employee profile.`}
                </p>
              </CardContent>
            </Card>
          )}

          {!selectedEmployee && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{ar ? 'اختر موظفاً من القائمة لعرض بيانات الراتب' : 'Select an employee from the list to view salary data'}</p>
              </CardContent>
            </Card>
          )}

          {salaryRecord && (
            <>
              {/* Employee Info Header */}
              {selectedEmpData && (
                <Card>
                  <CardContent className="p-4">
                    <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {(ar ? selectedEmpData.nameAr : selectedEmpData.nameEn).charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{ar ? selectedEmpData.nameAr : selectedEmpData.nameEn}</h3>
                        <p className="text-sm text-muted-foreground">{selectedEmpData.department} - {selectedEmpData.employeeId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* مكونات الراتب */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <Wallet className="h-5 w-5 text-primary" />
                    {ar ? 'مكونات الراتب' : 'Salary Components'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {readOnlyField(ar ? 'الراتب الأساسي (ج.م)' : 'Basic Salary (EGP)', salaryRecord.basicSalary)}
                    {readOnlyField(ar ? 'بدل المواصلات (ج.م)' : 'Transport (EGP)', salaryRecord.transportAllowance)}
                    {readOnlyField(ar ? 'الحوافز (ج.م)' : 'Incentives (EGP)', salaryRecord.incentives)}
                    {readOnlyField(ar ? 'بدل المعيشة (ج.م)' : 'Living (EGP)', salaryRecord.livingAllowance)}
                    {readOnlyField(ar ? 'بدل سكن المحطة (ج.م)' : 'Station (EGP)', salaryRecord.stationAllowance)}
                    {readOnlyField(ar ? 'بدل الجوال (ج.م)' : 'Mobile (EGP)', salaryRecord.mobileAllowance)}
                    {readOnlyField(ar ? 'إجمالي الراتب (ج.م)' : 'Gross Salary (EGP)', gross)}
                  </div>
                </CardContent>
              </Card>

              {/* المكافآت */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <Gift className="h-5 w-5 text-green-600" />
                    {ar ? 'المكافآت' : 'Bonuses'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={bonusType} onValueChange={(v) => { setBonusType(v as any); setBonusValue(0); }} className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex-1 border rounded-lg p-4 cursor-pointer transition-colors", bonusType === 'amount' ? 'border-primary bg-primary/5' : 'border-border')}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="amount" id="bonus-amount" />
                        <Label htmlFor="bonus-amount" className="cursor-pointer">{ar ? 'مبلغ يدوي' : 'Manual Amount'}</Label>
                      </div>
                    </div>
                    <div className={cn("flex-1 border rounded-lg p-4 cursor-pointer transition-colors", bonusType === 'percentage' ? 'border-primary bg-primary/5' : 'border-border')}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="percentage" id="bonus-pct" />
                        <Label htmlFor="bonus-pct" className="cursor-pointer">{ar ? 'نسبة مئوية من الإجمالي' : 'Percentage of Gross'}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs", isRTL && "text-right block")}>
                        {bonusType === 'amount' ? (ar ? 'قيمة المكافأة (ج.م)' : 'Bonus Amount (EGP)') : (ar ? 'النسبة المئوية %' : 'Percentage %')}
                      </Label>
                      <Input type="number" value={bonusValue || ''} onChange={e => setBonusValue(parseFloat(e.target.value) || 0)} className={cn("h-9 text-sm", isRTL && "text-right")} />
                    </div>
                    {bonusType === 'percentage' && (
                      <div className="space-y-1.5">
                        <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'قيمة المكافأة المحسوبة (ج.م)' : 'Calculated Bonus (EGP)'}</Label>
                        <Input value={bonusAmount.toLocaleString()} readOnly disabled className={cn("h-9 text-sm bg-muted/30", isRTL && "text-right")} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* مساهمات صاحب العمل */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <Building2 className="h-5 w-5 text-blue-600" />
                    {ar ? 'مساهمات صاحب العمل' : 'Employer Contributions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {readOnlyField(ar ? 'التأمينات الاجتماعية - صاحب العمل (ج.م)' : 'Social Insurance - Employer (EGP)', employerSocialIns)}
                    {readOnlyField(ar ? 'التأمين الصحي (ج.م)' : 'Health Insurance (EGP)', healthIns)}
                    {readOnlyField(ar ? 'ضريبة الدخل (ج.م)' : 'Income Tax (EGP)', incomeTax)}
                  </div>
                </CardContent>
              </Card>

              {/* الخصومات */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    {ar ? 'الخصومات' : 'Deductions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {readOnlyField(ar ? 'التأمينات الاجتماعية - الموظف (ج.م)' : 'Social Insurance - Employee (EGP)', employeeInsurance)}
                    {readOnlyField(ar ? 'القروض (محسوب تلقائياً) (ج.م)' : 'Loans (Auto) (EGP)', loanPayment)}
                    {readOnlyField(ar ? 'السلف (ج.م)' : 'Advances (EGP)', advanceAmount)}
                    {readOnlyField(ar ? 'الجوال الشخصي (ج.م)' : 'Mobile Bill (EGP)', mobileBill)}
                  </div>

                  <Separator />

                  {/* Leave deduction */}
                  <div>
                    <h4 className={cn("font-semibold text-sm mb-3", isRTL && "text-right")}>{ar ? 'خصم الإجازة من الراتب' : 'Leave Salary Deduction'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'عدد الأيام' : 'Number of Days'}</Label>
                        <Input type="number" value={leaveDays || ''} onChange={e => setLeaveDays(parseFloat(e.target.value) || 0)} className={cn("h-9 text-sm", isRTL && "text-right")} min={0} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'قيمة الخصم (محسوب تلقائياً) (ج.م)' : 'Deduction Amount (Auto) (EGP)'}</Label>
                        <Input value={leaveDeduction.toLocaleString()} readOnly disabled className={cn("h-9 text-sm bg-muted/30", isRTL && "text-right")} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Penalties */}
                  <div>
                    <h4 className={cn("font-semibold text-sm mb-3", isRTL && "text-right")}>{ar ? 'الجزاءات' : 'Penalties'}</h4>
                    <RadioGroup value={penaltyType} onValueChange={(v) => { setPenaltyType(v as any); setPenaltyValue(0); }} className={cn("flex gap-3 mb-4", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex-1 border rounded-lg p-3 cursor-pointer transition-colors", penaltyType === 'amount' ? 'border-primary bg-primary/5' : 'border-border')}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="amount" id="pen-amount" />
                          <Label htmlFor="pen-amount" className="cursor-pointer text-sm">{ar ? 'مبلغ' : 'Amount'}</Label>
                        </div>
                      </div>
                      <div className={cn("flex-1 border rounded-lg p-3 cursor-pointer transition-colors", penaltyType === 'days' ? 'border-primary bg-primary/5' : 'border-border')}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="days" id="pen-days" />
                          <Label htmlFor="pen-days" className="cursor-pointer text-sm">{ar ? 'أيام' : 'Days'}</Label>
                        </div>
                      </div>
                      <div className={cn("flex-1 border rounded-lg p-3 cursor-pointer transition-colors", penaltyType === 'percentage' ? 'border-primary bg-primary/5' : 'border-border')}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="percentage" id="pen-pct" />
                          <Label htmlFor="pen-pct" className="cursor-pointer text-sm">{ar ? 'نسبة مئوية' : 'Percentage'}</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className={cn("text-xs", isRTL && "text-right block")}>
                          {penaltyType === 'amount' ? (ar ? 'قيمة الجزاء (ج.م)' : 'Penalty Amount (EGP)') :
                            penaltyType === 'days' ? (ar ? 'عدد الأيام' : 'Number of Days') :
                              (ar ? 'النسبة المئوية %' : 'Percentage %')}
                        </Label>
                        <Input type="number" value={penaltyValue || ''} onChange={e => setPenaltyValue(parseFloat(e.target.value) || 0)} className={cn("h-9 text-sm", isRTL && "text-right")} min={0} />
                      </div>
                      {penaltyType !== 'amount' && (
                        <div className="space-y-1.5">
                          <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'قيمة الجزاء (ج.م)' : 'Penalty Value (EGP)'}</Label>
                          <Input value={penaltyAmount.toLocaleString()} readOnly disabled className={cn("h-9 text-sm bg-muted/30", isRTL && "text-right")} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ملخص الحسابات */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
                    <FileText className="h-5 w-5 text-primary" />
                    {ar ? 'ملخص الحسابات' : 'Calculation Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={cn("flex justify-between items-center py-2", isRTL && "flex-row-reverse")}>
                      <span className="text-sm text-muted-foreground">{ar ? 'إجمالي الراتب (Gross Salary)' : 'Gross Salary'}</span>
                      <span className="font-bold text-lg">{gross.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</span>
                    </div>
                    {bonusAmount > 0 && (
                      <div className={cn("flex justify-between items-center py-2", isRTL && "flex-row-reverse")}>
                        <span className="text-sm text-green-600">{ar ? '+ المكافآت' : '+ Bonuses'}</span>
                        <span className="font-bold text-green-600">+{bonusAmount.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</span>
                      </div>
                    )}
                    <Separator />
                    <div className={cn("flex justify-between items-center py-2", isRTL && "flex-row-reverse")}>
                      <span className="text-sm text-destructive font-medium">{ar ? 'إجمالي الخصومات' : 'Total Deductions'}</span>
                      <span className="font-bold text-destructive">{totalDeductions.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <Separator className="border-2" />
                    <div className={cn("flex justify-between items-center py-2", isRTL && "flex-row-reverse")}>
                      <span className="text-base font-bold">{ar ? 'صافي الراتب (Net Salary)' : 'Net Salary'}</span>
                      <span className="font-bold text-2xl text-primary">{netSalary.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className={cn("flex gap-3 sticky bottom-0 bg-background py-4 border-t", isRTL ? "flex-row-reverse" : "")}>
                <Button onClick={handleSave} className="gap-2 flex-1 md:flex-none md:min-w-[200px]" size="lg">
                  <Save className="h-5 w-5" />
                  {ar ? 'حفظ الراتب' : 'Save Salary'}
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-2 flex-1 md:flex-none md:min-w-[150px]" size="lg">
                  <X className="h-5 w-5" />
                  {ar ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
