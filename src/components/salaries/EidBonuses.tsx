import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Play, Loader2, Gift, Download } from 'lucide-react';

const JOB_LEVELS = [
  { value: 'worker', label: 'Worker' },
  { value: 'driver', label: 'Driver' },
  { value: 'messenger', label: 'Messenger' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Med Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'shiftLeader', label: 'Shift Leader' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
];

interface BonusRecord {
  id?: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  station_name: string;
  department_name: string;
  job_title: string;
  hire_date: string;
  bank_account_number: string;
  bank_id_number: string;
  bank_name: string;
  bank_account_type: string;
  job_level: string;
  amount: number;
}

export const EidBonuses = () => {
  const { isRTL, language } = useLanguage();
  const ar = language === 'ar';

  const [bonusNumber, setBonusNumber] = useState('1');
  const [minMonths, setMinMonths] = useState('3');
  const [levelAmounts, setLevelAmounts] = useState<Record<string, string>>({});
  const [records, setRecords] = useState<BonusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const currentYear = new Date().getFullYear().toString();

  // Load existing records on mount & when bonus number changes
  useEffect(() => {
    loadExistingRecords();
  }, [bonusNumber]);

  const loadExistingRecords = async () => {
    setLoadingRecords(true);
    const { data, error } = await supabase
      .from('eid_bonuses')
      .select('*')
      .eq('bonus_number', parseInt(bonusNumber))
      .eq('year', currentYear)
      .order('employee_code');
    
    if (!error && data) {
      setRecords(data.map(r => ({
        id: r.id,
        employee_id: r.employee_id,
        employee_name: r.employee_name || '',
        employee_code: r.employee_code || '',
        station_name: r.station_name || '',
        department_name: r.department_name || '',
        job_title: r.job_title || '',
        hire_date: r.hire_date || '',
        bank_account_number: r.bank_account_number || '',
        bank_id_number: r.bank_id_number || '',
        bank_name: r.bank_name || '',
        bank_account_type: r.bank_account_type || '',
        job_level: r.job_level || '',
        amount: r.amount,
      })));
    }
    setLoadingRecords(false);
  };

  const handleRun = async () => {
    // Validate that at least one level has an amount
    const hasAmount = Object.values(levelAmounts).some(v => parseFloat(v) > 0);
    if (!hasAmount) {
      toast.error(ar ? 'يرجى إدخال مبلغ لفئة واحدة على الأقل' : 'Please enter an amount for at least one level');
      return;
    }

    setLoading(true);
    try {
      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - parseInt(minMonths));
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      // Fetch eligible employees with their station & department
      const { data: employees, error: empErr } = await supabase
        .from('employees')
        .select(`
          id, name_ar, name_en, employee_code, job_level, job_title_ar, job_title_en,
          hire_date, bank_account_number, bank_id_number, bank_name, bank_account_type,
          station_id, department_id,
          stations:station_id (name_ar, name_en),
          departments:department_id (name_ar, name_en)
        `)
        .eq('status', 'active')
        .or('resigned.is.null,resigned.eq.false')
        .lte('hire_date', cutoffStr);

      if (empErr) throw empErr;
      if (!employees || employees.length === 0) {
        toast.info(ar ? 'لا يوجد موظفين مستحقين' : 'No eligible employees found');
        setLoading(false);
        return;
      }

      // Build records
      const bonusRecords: any[] = [];
      for (const emp of employees) {
        const level = emp.job_level || '';
        const amount = parseFloat(levelAmounts[level] || '0');
        if (amount <= 0) continue;

        const station = emp.stations as any;
        const dept = emp.departments as any;

        bonusRecords.push({
          employee_id: emp.id,
          bonus_number: parseInt(bonusNumber),
          year: currentYear,
          amount,
          job_level: level,
          employee_name: ar ? emp.name_ar : emp.name_en,
          employee_code: emp.employee_code,
          station_name: station ? (ar ? station.name_ar : station.name_en) : '',
          department_name: dept ? (ar ? dept.name_ar : dept.name_en) : '',
          job_title: ar ? (emp.job_title_ar || '') : (emp.job_title_en || ''),
          hire_date: emp.hire_date,
          bank_account_number: emp.bank_account_number || '',
          bank_id_number: emp.bank_id_number || '',
          bank_name: emp.bank_name || '',
          bank_account_type: emp.bank_account_type || '',
        });
      }

      if (bonusRecords.length === 0) {
        toast.info(ar ? 'لا يوجد موظفين بمستويات وظيفية محددة المبالغ' : 'No employees match the configured levels');
        setLoading(false);
        return;
      }

      // Upsert
      const { error: upsertErr } = await supabase
        .from('eid_bonuses')
        .upsert(bonusRecords, { onConflict: 'employee_id,bonus_number,year' });

      if (upsertErr) throw upsertErr;

      toast.success(ar ? `تم تشغيل العيدية ${bonusNumber} بنجاح - ${bonusRecords.length} موظف` : `Eid Bonus ${bonusNumber} processed - ${bonusRecords.length} employees`);
      loadExistingRecords();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = useMemo(() => records.reduce((s, r) => s + r.amount, 0), [records]);

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Gift className="w-5 h-5 text-primary" />
            {ar ? 'إعدادات العيدية' : 'Eid Bonus Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Top selectors */}
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", isRTL && "direction-rtl")}>
            <div className="space-y-2">
              <Label className={cn(isRTL && "text-right block")}>{ar ? 'اختر العيدية' : 'Select Bonus'}</Label>
              <Select value={bonusNumber} onValueChange={setBonusNumber}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{ar ? 'عيدية 1' : 'Eid Bonus 1'}</SelectItem>
                  <SelectItem value="2">{ar ? 'عيدية 2' : 'Eid Bonus 2'}</SelectItem>
                  <SelectItem value="3">{ar ? 'عيدية 3' : 'Eid Bonus 3'}</SelectItem>
                  <SelectItem value="4">{ar ? 'عيدية 4' : 'Eid Bonus 4'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={cn(isRTL && "text-right block")}>{ar ? 'استبعاد من لم يتم' : 'Exclude employees under'}</Label>
              <Select value={minMonths} onValueChange={setMinMonths}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(m => (
                    <SelectItem key={m} value={String(m)}>
                      {m} {ar ? (m === 1 ? 'شهر' : 'أشهر') : (m === 1 ? 'month' : 'months')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Level amounts grid */}
          <div>
            <Label className={cn("text-sm font-semibold mb-3 block", isRTL && "text-right")}>
              {ar ? 'مبلغ العيدية لكل مستوى وظيفي' : 'Bonus amount per job level'}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {JOB_LEVELS.map(level => (
                <div key={level.value} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{level.label}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={levelAmounts[level.value] || ''}
                    onChange={e => setLevelAmounts(prev => ({ ...prev, [level.value]: e.target.value }))}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Run button */}
          <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
            <Button onClick={handleRun} disabled={loading} className="gap-2 min-w-[180px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {ar ? 'تشغيل جماعي' : 'Run Bulk Process'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              {ar ? `سجل العيدية ${bonusNumber} - ${currentYear}` : `Eid Bonus ${bonusNumber} Record - ${currentYear}`}
              <Badge variant="secondary">{records.length}</Badge>
            </CardTitle>
            {records.length > 0 && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                {ar ? 'الإجمالي:' : 'Total:'} {totalAmount.toLocaleString()} {ar ? 'ج.م' : 'EGP'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecords ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {ar ? 'لا توجد سجلات بعد. قم بتشغيل العيدية أولاً.' : 'No records yet. Run the bonus process first.'}
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>#</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'الرقم الوظيفي' : 'ID'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'المحطة' : 'Station'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'القسم' : 'Department'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'الوظيفة' : 'Job Title'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'تاريخ التعيين' : 'Hire Date'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'رقم الحساب' : 'Account No.'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'ID البنكي' : 'Bank ID'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'اسم البنك' : 'Bank Name'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'نوع الحساب' : 'Account Type'}</TableHead>
                    <TableHead className={cn("whitespace-nowrap", isRTL && "text-right")}>{ar ? 'المبلغ' : 'Amount'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={r.id || r.employee_id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{r.employee_name}</TableCell>
                      <TableCell>{r.employee_code}</TableCell>
                      <TableCell>{r.station_name}</TableCell>
                      <TableCell>{r.department_name}</TableCell>
                      <TableCell>{r.job_title}</TableCell>
                      <TableCell dir="ltr">{r.hire_date}</TableCell>
                      <TableCell>{r.bank_account_number}</TableCell>
                      <TableCell>{r.bank_id_number}</TableCell>
                      <TableCell>{r.bank_name}</TableCell>
                      <TableCell>{r.bank_account_type}</TableCell>
                      <TableCell className="font-semibold">{r.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
