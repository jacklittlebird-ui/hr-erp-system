import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Save, Landmark, Calendar, Plus, Edit, Trash2, Wallet, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SalaryTabProps {
  employee: Employee;
}

interface BankInfo {
  accountNumber: string;
  bankId: string;
  accountType: string;
  bankName: string;
}

interface SalaryRecord {
  year: string;
  basicSalary: number;
  transportAllowance: number;
  incentives: number;
  livingAllowance: number;
  stationAllowance: number;
  mobileAllowance: number;
  employeeInsurance: number;
  employerSocialInsurance: number;
  healthInsurance: number;
  incomeTax: number;
}

const defaultBanks = [
  { value: 'credit_agricole', labelAr: 'كريدي أجريكول', labelEn: 'Crédit Agricole' },
  { value: 'nbe', labelAr: 'البنك الأهلي المصري', labelEn: 'National Bank of Egypt' },
  { value: 'cash', labelAr: 'نقدي', labelEn: 'Cash' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));

const calcGross = (r: SalaryRecord) =>
  r.basicSalary + r.transportAllowance + r.incentives + r.livingAllowance + r.stationAllowance + r.mobileAllowance;

const calcNet = (r: SalaryRecord) => calcGross(r) - r.employeeInsurance;

const calcEmployerContributions = (r: SalaryRecord) =>
  r.employerSocialInsurance + r.healthInsurance + r.incomeTax;

export const SalaryTab = ({ employee }: SalaryTabProps) => {
  const { isRTL, language } = useLanguage();
  const ar = language === 'ar';

  // Bank info (fixed)
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountNumber: '', bankId: '', accountType: '', bankName: '',
  });
  const [banks, setBanks] = useState(defaultBanks);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ labelAr: '', labelEn: '' });

  // Salary records
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState<Omit<SalaryRecord, 'year'>>({
    basicSalary: 0, transportAllowance: 0, incentives: 0, livingAllowance: 0,
    stationAllowance: 0, mobileAllowance: 0, employeeInsurance: 0,
    employerSocialInsurance: 0, healthInsurance: 0, incomeTax: 0,
  });

  const existingRecord = useMemo(
    () => salaryRecords.find(r => r.year === selectedYear),
    [salaryRecords, selectedYear]
  );

  // When year changes, load existing data
  const handleYearChange = useCallback((year: string) => {
    setSelectedYear(year);
    const existing = salaryRecords.find(r => r.year === year);
    if (existing) {
      const { year: _, ...rest } = existing;
      setFormData(rest);
    } else {
      setFormData({
        basicSalary: 0, transportAllowance: 0, incentives: 0, livingAllowance: 0,
        stationAllowance: 0, mobileAllowance: 0, employeeInsurance: 0,
        employerSocialInsurance: 0, healthInsurance: 0, incomeTax: 0,
      });
    }
  }, [salaryRecords]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const gross = useMemo(() => calcGross({ ...formData, year: '' }), [formData]);
  const net = useMemo(() => calcNet({ ...formData, year: '' }), [formData]);
  const employerTotal = useMemo(() => calcEmployerContributions({ ...formData, year: '' }), [formData]);

  const handleSaveSalary = () => {
    if (!selectedYear) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'اختر السنة أولاً' : 'Select a year first', variant: 'destructive' });
      return;
    }
    const record: SalaryRecord = { year: selectedYear, ...formData };
    setSalaryRecords(prev => {
      const idx = prev.findIndex(r => r.year === selectedYear);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [...prev, record];
    });
    toast({ title: ar ? 'تم الحفظ' : 'Saved', description: ar ? `تم حفظ راتب سنة ${selectedYear}` : `Salary for ${selectedYear} saved` });
  };

  const handleSaveBankInfo = () => {
    toast({ title: ar ? 'تم الحفظ' : 'Saved', description: ar ? 'تم حفظ البيانات البنكية' : 'Bank info saved' });
  };

  const handleAddBank = () => {
    if (!newBank.labelAr || !newBank.labelEn) return;
    const value = newBank.labelEn.toLowerCase().replace(/\s+/g, '_');
    setBanks(prev => [...prev, { value, ...newBank }]);
    setShowAddBank(false);
    setNewBank({ labelAr: '', labelEn: '' });
    toast({ title: ar ? 'تمت الإضافة' : 'Added' });
  };

  const handleDeleteRecord = (year: string) => {
    setSalaryRecords(prev => prev.filter(r => r.year !== year));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  const sortedRecords = useMemo(() => [...salaryRecords].sort((a, b) => b.year.localeCompare(a.year)), [salaryRecords]);

  const fieldRow = (label: string, field: keyof typeof formData) => (
    <div className="space-y-1.5">
      <Label className={cn("text-xs", isRTL && "text-right block")}>{label}</Label>
      <Input
        type="number"
        value={formData[field] || ''}
        onChange={e => updateField(field, e.target.value)}
        className={cn("h-9 text-sm", isRTL && "text-right")}
      />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ====== BANK INFO (FIXED) ====== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <Landmark className="h-5 w-5 text-primary" />
            {ar ? 'بيانات الحساب البنكي' : 'Bank Account Info'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'رقم الحساب البنكي' : 'Bank Account Number'}</Label>
              <Input value={bankInfo.accountNumber} onChange={e => setBankInfo(p => ({ ...p, accountNumber: e.target.value }))} className={cn("h-9 text-sm", isRTL && "text-right")} />
            </div>
            <div className="space-y-1.5">
              <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'رقم الـ ID البنكي' : 'Bank ID Number'}</Label>
              <Input value={bankInfo.bankId} onChange={e => setBankInfo(p => ({ ...p, bankId: e.target.value }))} className={cn("h-9 text-sm", isRTL && "text-right")} />
            </div>
            <div className="space-y-1.5">
              <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'نوع الحساب البنكي' : 'Account Type'}</Label>
              <Input value={bankInfo.accountType} onChange={e => setBankInfo(p => ({ ...p, accountType: e.target.value }))} className={cn("h-9 text-sm", isRTL && "text-right")} />
            </div>
            <div className="space-y-1.5">
              <Label className={cn("text-xs", isRTL && "text-right block")}>{ar ? 'اسم البنك' : 'Bank Name'}</Label>
              <div className="flex gap-2">
                <Select value={bankInfo.bankName} onValueChange={v => setBankInfo(p => ({ ...p, bankName: v }))}>
                  <SelectTrigger className="h-9 text-sm flex-1"><SelectValue placeholder={ar ? '-- اختر البنك --' : '-- Select --'} /></SelectTrigger>
                  <SelectContent>
                    {banks.map(b => <SelectItem key={b.value} value={b.value}>{ar ? b.labelAr : b.labelEn}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-9 px-2" onClick={() => setShowAddBank(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className={cn("flex mt-4", isRTL ? "justify-start" : "justify-end")}>
            <Button size="sm" onClick={handleSaveBankInfo} className="gap-1">
              <Save className="h-4 w-4" />{ar ? 'حفظ البيانات البنكية' : 'Save Bank Info'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====== SALARY ENTRY ====== */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between flex-wrap gap-3", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
              <Calendar className="h-5 w-5 text-primary" />
              {ar ? 'مكونات الراتب السنوي' : 'Annual Salary Components'}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-32 h-9"><SelectValue placeholder={ar ? 'اختر السنة' : 'Select Year'} /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              {existingRecord && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                  {ar ? 'تعديل بيانات موجودة' : 'Editing existing'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Allowances */}
          <div>
            <h4 className={cn("font-semibold text-sm mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingUp className="h-4 w-4 text-green-600" />
              {ar ? 'مكونات الراتب' : 'Salary Components'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {fieldRow(ar ? 'الراتب الأساسي' : 'Basic Salary', 'basicSalary')}
              {fieldRow(ar ? 'بدل المواصلات' : 'Transport Allowance', 'transportAllowance')}
              {fieldRow(ar ? 'حوافز' : 'Incentives', 'incentives')}
              {fieldRow(ar ? 'بدل معيشة' : 'Living Allowance', 'livingAllowance')}
              {fieldRow(ar ? 'بدل محطات' : 'Station Allowance', 'stationAllowance')}
              {fieldRow(ar ? 'بدل محمول' : 'Mobile Allowance', 'mobileAllowance')}
            </div>
          </div>

          <Separator />

          {/* Employee Deductions */}
          <div>
            <h4 className={cn("font-semibold text-sm mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <TrendingDown className="h-4 w-4 text-destructive" />
              {ar ? 'الخصومات (حصة الموظف)' : 'Deductions (Employee Share)'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {fieldRow(ar ? 'تأمينات (حصة موظف)' : 'Insurance (Employee)', 'employeeInsurance')}
            </div>
          </div>

          <Separator />

          {/* Employer Contributions */}
          <div>
            <h4 className={cn("font-semibold text-sm mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Building2 className="h-4 w-4 text-blue-600" />
              {ar ? 'مساهمات صاحب العمل' : 'Employer Contributions'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {fieldRow(ar ? 'التأمينات الاجتماعية - صاحب العمل (ج.م)' : 'Social Insurance - Employer (EGP)', 'employerSocialInsurance')}
              {fieldRow(ar ? 'التأمين الصحي (ج.م)' : 'Health Insurance (EGP)', 'healthInsurance')}
              {fieldRow(ar ? 'ضريبة الدخل (ج.م)' : 'Income Tax (EGP)', 'incomeTax')}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{ar ? 'الراتب الإجمالي' : 'Gross Salary'}</p>
                <p className="text-2xl font-bold text-green-700">{gross.toLocaleString()} <span className="text-sm">{ar ? 'ج.م' : 'EGP'}</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">{ar ? 'الأساسي + جميع البدلات + الحوافز' : 'Basic + All Allowances + Incentives'}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{ar ? 'الراتب الصافي' : 'Net Salary'}</p>
                <p className="text-2xl font-bold text-blue-700">{net.toLocaleString()} <span className="text-sm">{ar ? 'ج.م' : 'EGP'}</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">{ar ? 'الإجمالي − تأمينات حصة الموظف' : 'Gross − Employee Insurance'}</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{ar ? 'مساهمات صاحب العمل' : 'Employer Contributions'}</p>
                <p className="text-2xl font-bold text-purple-700">{employerTotal.toLocaleString()} <span className="text-sm">{ar ? 'ج.م' : 'EGP'}</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">{ar ? 'تأمينات اجتماعية + صحي + ضريبة' : 'Social + Health + Tax'}</p>
              </CardContent>
            </Card>
          </div>

          <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
            <Button onClick={handleSaveSalary} className="gap-1" disabled={!selectedYear}>
              <Save className="h-4 w-4" />
              {existingRecord ? (ar ? 'تحديث الراتب' : 'Update Salary') : (ar ? 'حفظ الراتب' : 'Save Salary')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====== SALARY HISTORY ====== */}
      {sortedRecords.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
              <Wallet className="h-5 w-5 text-primary" />
              {ar ? 'سجل الرواتب' : 'Salary History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{ar ? 'السنة' : 'Year'}</TableHead>
                    <TableHead>{ar ? 'الأساسي' : 'Basic'}</TableHead>
                    <TableHead>{ar ? 'مواصلات' : 'Transport'}</TableHead>
                    <TableHead>{ar ? 'حوافز' : 'Incentives'}</TableHead>
                    <TableHead>{ar ? 'معيشة' : 'Living'}</TableHead>
                    <TableHead>{ar ? 'محطات' : 'Station'}</TableHead>
                    <TableHead>{ar ? 'محمول' : 'Mobile'}</TableHead>
                    <TableHead className="text-green-700">{ar ? 'الإجمالي' : 'Gross'}</TableHead>
                    <TableHead className="text-destructive">{ar ? 'تأمين موظف' : 'Emp. Ins.'}</TableHead>
                    <TableHead className="text-blue-700">{ar ? 'الصافي' : 'Net'}</TableHead>
                    <TableHead className="text-purple-700">{ar ? 'مساهمات صاحب العمل' : 'Employer'}</TableHead>
                    <TableHead className="text-center">{ar ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map(r => (
                    <TableRow key={r.year}>
                      <TableCell className="text-center font-bold">
                        <Badge variant="outline">{r.year}</Badge>
                      </TableCell>
                      <TableCell>{r.basicSalary.toLocaleString()}</TableCell>
                      <TableCell>{r.transportAllowance.toLocaleString()}</TableCell>
                      <TableCell>{r.incentives.toLocaleString()}</TableCell>
                      <TableCell>{r.livingAllowance.toLocaleString()}</TableCell>
                      <TableCell>{r.stationAllowance.toLocaleString()}</TableCell>
                      <TableCell>{r.mobileAllowance.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-green-700">{calcGross(r).toLocaleString()}</TableCell>
                      <TableCell className="text-destructive">{r.employeeInsurance.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-blue-700">{calcNet(r).toLocaleString()}</TableCell>
                      <TableCell className="text-purple-700">{calcEmployerContributions(r).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleYearChange(r.year)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDeleteRecord(r.year)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Bank Dialog */}
      <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{ar ? 'إضافة بنك جديد' : 'Add New Bank'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{ar ? 'اسم البنك بالعربية' : 'Bank Name (Arabic)'}</Label>
              <Input value={newBank.labelAr} onChange={e => setNewBank(p => ({ ...p, labelAr: e.target.value }))} className={cn(isRTL && "text-right")} />
            </div>
            <div className="space-y-1.5">
              <Label>{ar ? 'اسم البنك بالإنجليزية' : 'Bank Name (English)'}</Label>
              <Input value={newBank.labelEn} onChange={e => setNewBank(p => ({ ...p, labelEn: e.target.value }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddBank(false)}>{ar ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleAddBank}>{ar ? 'إضافة' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
