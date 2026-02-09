import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Plus, Edit, Trash2, DollarSign, Users, Clock, CheckCircle, Printer, FileText, FileSpreadsheet, CreditCard, List } from 'lucide-react';
import { InstallmentScheduleDialog } from './InstallmentScheduleDialog';
import { toast } from '@/hooks/use-toast';
import { mockEmployees as systemEmployees } from '@/data/mockEmployees';
import { stationLocations } from '@/data/stationLocations';
import { useReportExport } from '@/hooks/useReportExport';

interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  station: string;
  amount: number;
  installments: number;
  monthlyPayment: number;
  paidInstallments: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  status: 'active' | 'completed' | 'pending';
  notes: string;
  calculationMethod: 'auto' | 'manual';
}

const mockLoans: Loan[] = [
  {
    id: 'LN001', employeeId: 'Emp002', employeeName: 'أحمد محمد', station: 'cairo',
    amount: 20000, installments: 10, monthlyPayment: 2000, paidInstallments: 6,
    paidAmount: 6000, remainingAmount: 14000, startDate: '2024-02', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN002', employeeId: 'Emp001', employeeName: 'فاطمة علي', station: 'alex',
    amount: 30000, installments: 20, monthlyPayment: 1500, paidInstallments: 5,
    paidAmount: 7500, remainingAmount: 22500, startDate: '2024-01', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN003', employeeId: 'Emp003', employeeName: 'مريم يوسف', station: 'hurghada',
    amount: 80000, installments: 8, monthlyPayment: 10000, paidInstallments: 1,
    paidAmount: 10000, remainingAmount: 70000, startDate: '2024-02', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN004', employeeId: 'Emp004', employeeName: 'خالد حسين', station: 'sharm',
    amount: 48000, installments: 16, monthlyPayment: 3000, paidInstallments: 16,
    paidAmount: 48000, remainingAmount: 0, startDate: '2023-12', status: 'completed',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN005', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', station: 'capital',
    amount: 30000, installments: 12, monthlyPayment: 2500, paidInstallments: 0,
    paidAmount: 0, remainingAmount: 30000, startDate: '2025-12', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
  {
    id: 'LN006', employeeId: 'Emp002', employeeName: 'عمر سعيد', station: 'luxor',
    amount: 30000, installments: 12, monthlyPayment: 2500, paidInstallments: 0,
    paidAmount: 0, remainingAmount: 30000, startDate: '2024-03', status: 'active',
    notes: '', calculationMethod: 'auto',
  },
];

const getMonthName = (dateStr: string, lang: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const monthName = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long' });
  return `${monthName} ${year}`;
};

export const LoansList = () => {
  const { t, isRTL, language } = useLanguage();
  const { handlePrint, exportToPDF, exportToCSV } = useReportExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);
  const [showInstallmentSchedule, setShowInstallmentSchedule] = useState(false);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    installments: '',
    startDate: '',
    notes: '',
    calculationMethod: 'auto' as 'auto' | 'manual',
    monthlyPayment: '',
  });

  const selectedEmployee = useMemo(() => 
    systemEmployees.find(e => e.employeeId === formData.employeeId),
    [formData.employeeId]
  );

  const autoMonthlyPayment = useMemo(() => {
    const amount = parseFloat(formData.amount);
    const installments = parseInt(formData.installments);
    if (amount > 0 && installments > 0) return (amount / installments).toFixed(2);
    return '';
  }, [formData.amount, formData.installments]);

  // Auto-calculate installments when manual: amount and monthlyPayment are set
  const autoInstallmentsCount = useMemo(() => {
    if (formData.calculationMethod !== 'manual') return '';
    const amount = parseFloat(formData.amount);
    const monthly = parseFloat(formData.monthlyPayment);
    if (amount > 0 && monthly > 0) return String(Math.ceil(amount / monthly));
    return '';
  }, [formData.amount, formData.monthlyPayment, formData.calculationMethod]);

  const statusLabels: Record<string, { en: string; ar: string; color: string }> = {
    active: { en: 'Active', ar: 'نشط', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { en: 'Completed', ar: 'مكتمل', color: 'bg-green-100 text-green-700 border-green-300' },
    pending: { en: 'Pending', ar: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.employeeName.includes(searchQuery) ||
      loan.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesStation = stationFilter === 'all' || loan.station === stationFilter;
    return matchesSearch && matchesStatus && matchesStation;
  });

  const stats = {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === 'active').length,
    pendingLoans: loans.filter(l => l.status === 'pending').length,
    totalAmount: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0),
  };

  const resetForm = () => {
    setFormData({ employeeId: '', amount: '', installments: '', startDate: '', notes: '', calculationMethod: 'auto', monthlyPayment: '' });
    setEditingLoan(null);
  };

  const openAddDialog = () => { resetForm(); setShowDialog(true); };

  const openEditDialog = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      employeeId: loan.employeeId,
      amount: String(loan.amount),
      installments: String(loan.installments),
      startDate: loan.startDate,
      notes: loan.notes,
      calculationMethod: loan.calculationMethod,
      monthlyPayment: loan.calculationMethod === 'manual' ? String(loan.monthlyPayment) : '',
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const amount = parseFloat(formData.amount);
    const isManual = formData.calculationMethod === 'manual';
    const monthlyPayment = isManual ? parseFloat(formData.monthlyPayment || '0') : 0;
    const installments = isManual ? (amount > 0 && monthlyPayment > 0 ? Math.ceil(amount / monthlyPayment) : 0) : parseInt(formData.installments);
    const monthly = isManual ? monthlyPayment : (amount > 0 && installments > 0 ? amount / installments : 0);

    if (!formData.employeeId || !formData.amount || !formData.startDate || installments <= 0) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const employee = systemEmployees.find(e => e.employeeId === formData.employeeId);

    if (editingLoan) {
      setLoans(loans.map(l => l.id === editingLoan.id ? {
        ...l, employeeId: formData.employeeId, employeeName: employee?.nameAr || l.employeeName,
        amount, installments, monthlyPayment: monthly, startDate: formData.startDate,
        notes: formData.notes, calculationMethod: formData.calculationMethod,
        remainingAmount: amount - l.paidAmount, station: employee?.department === 'الإدارة' ? 'capital' : l.station,
      } : l));
      toast({ title: isRTL ? 'تم التحديث' : 'Updated', description: isRTL ? 'تم تعديل القرض بنجاح' : 'Loan updated successfully' });
    } else {
      const newLoan: Loan = {
        id: `LN${String(loans.length + 1).padStart(3, '0')}`,
        employeeId: formData.employeeId, employeeName: employee?.nameAr || '',
        station: employee?.department === 'الإدارة' ? 'capital' : 'cairo',
        amount, installments, monthlyPayment: monthly, paidInstallments: 0,
        paidAmount: 0, remainingAmount: amount, startDate: formData.startDate,
        status: 'active', notes: formData.notes, calculationMethod: formData.calculationMethod,
      };
      setLoans([...loans, newLoan]);
      toast({ title: isRTL ? 'تم الحفظ' : 'Saved', description: isRTL ? 'تم إضافة القرض بنجاح' : 'Loan added successfully' });
    }
    setShowDialog(false);
    resetForm();
  };

  const handleRecordPayment = (loanId: string) => {
    setLoans(loans.map(loan => {
      if (loan.id !== loanId || loan.paidInstallments >= loan.installments) return loan;
      const newPaid = loan.paidInstallments + 1;
      const newPaidAmount = loan.paidAmount + loan.monthlyPayment;
      return {
        ...loan,
        paidInstallments: newPaid,
        paidAmount: newPaidAmount,
        remainingAmount: loan.amount - newPaidAmount,
        status: newPaid >= loan.installments ? 'completed' as const : loan.status,
      };
    }));
    toast({ title: isRTL ? 'تم' : 'Done', description: isRTL ? 'تم تسجيل الدفعة' : 'Payment recorded' });
  };

  const confirmDelete = () => {
    if (deletingLoanId) {
      setLoans(loans.filter(l => l.id !== deletingLoanId));
      toast({ title: isRTL ? 'تم الحذف' : 'Deleted', description: isRTL ? 'تم حذف القرض' : 'Loan deleted' });
    }
    setShowDeleteDialog(false);
    setDeletingLoanId(null);
  };

  const exportColumns = [
    { header: isRTL ? 'الموظف' : 'Employee', key: 'employeeName' },
    { header: isRTL ? 'إجمالي القرض' : 'Total', key: 'amount' },
    { header: isRTL ? 'القسط الشهري' : 'Monthly', key: 'monthlyPayment' },
    { header: isRTL ? 'عدد الأقساط' : 'Installments', key: 'installments' },
    { header: isRTL ? 'المدفوع' : 'Paid', key: 'paidAmount' },
    { header: isRTL ? 'المتبقي' : 'Remaining', key: 'remainingAmount' },
    { header: isRTL ? 'الحالة' : 'Status', key: 'status' },
  ];
  const exportData = filteredLoans.map(l => ({ ...l, status: isRTL ? statusLabels[l.status].ar : statusLabels[l.status].en }));
  const exportTitle = isRTL ? 'تقرير القروض' : 'Loans Report';

  const getStationLabel = (stationValue: string) => {
    const s = stationLocations.find(st => st.value === stationValue);
    return s ? (isRTL ? s.labelAr : s.labelEn) : stationValue;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: isRTL ? 'إجمالي القروض' : 'Total Loans', value: stats.totalLoans, icon: DollarSign, bgClass: 'bg-stat-purple-bg', iconBg: 'bg-stat-purple' },
          { label: isRTL ? 'القروض النشطة' : 'Active Loans', value: stats.activeLoans, icon: CheckCircle, bgClass: 'bg-stat-green-bg', iconBg: 'bg-stat-green' },
          { label: isRTL ? 'قيد الانتظار' : 'Pending', value: stats.pendingLoans, icon: Clock, bgClass: 'bg-stat-yellow-bg', iconBg: 'bg-stat-yellow' },
          { label: isRTL ? 'إجمالي المتبقي' : 'Outstanding', value: stats.totalAmount.toLocaleString(), icon: Users, bgClass: 'bg-stat-blue-bg', iconBg: 'bg-stat-blue' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-5 ${s.bgClass} flex items-center gap-4 shadow-sm border border-border/30`}>
            <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
              <s.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{isRTL ? 'قائمة القروض' : 'Loans List'}</CardTitle>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input placeholder={isRTL ? 'بحث...' : 'Search...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full md:w-48 ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{isRTL ? v.ar : v.en}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder={isRTL ? 'المحطة' : 'Station'} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                  {stationLocations.map(s => <SelectItem key={s.value} value={s.value}>{isRTL ? s.labelAr : s.labelEn}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => handlePrint(exportTitle)}><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => exportToPDF({ title: exportTitle, data: exportData, columns: exportColumns })}><FileText className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => exportToCSV({ title: exportTitle, data: exportData, columns: exportColumns, fileName: 'loans' })}><FileSpreadsheet className="h-4 w-4" /></Button>
              <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-1" />{isRTL ? 'إضافة قرض' : 'Add Loan'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoans.map(loan => {
              const progressPercent = loan.installments > 0 ? (loan.paidInstallments / loan.installments) * 100 : 0;
              return (
                <Card key={loan.id} className="relative overflow-hidden border">
                  <CardContent className="p-5 space-y-3">
                    {/* Header */}
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline" className={statusLabels[loan.status].color}>
                        {isRTL ? statusLabels[loan.status].ar : statusLabels[loan.status].en}
                      </Badge>
                      <h3 className="font-bold text-lg">{loan.employeeName}</h3>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'إجمالي القرض' : 'Total Loan'}</span>
                        <span className="font-semibold">{loan.amount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'قيمة القسط الشهري' : 'Monthly Installment'}</span>
                        <span className="font-semibold">{loan.monthlyPayment.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'عدد الأقساط' : 'Installments'}</span>
                        <span className="font-semibold">{loan.installments}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'تاريخ البدء' : 'Start Date'}</span>
                        <span className="font-semibold">{getMonthName(loan.startDate, language)}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'المبلغ المدفوع' : 'Paid Amount'}</span>
                        <span className="font-semibold text-green-600">{loan.paidAmount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                      <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="text-muted-foreground">{isRTL ? 'المبلغ المتبقي' : 'Remaining'}</span>
                        <span className="font-semibold text-destructive">{loan.remainingAmount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{loan.paidInstallments} / {loan.installments} {isRTL ? 'قسط' : 'inst.'}</span>
                        <span>{progressPercent.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>

                    {/* Actions */}
                    <div className={`flex gap-2 pt-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => { setViewingLoan(loan); setShowInstallmentSchedule(true); }}>
                        <List className="h-3 w-3" />{isRTL ? 'جدول الأقساط' : 'Schedule'}
                      </Button>
                      {loan.status === 'active' && (
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleRecordPayment(loan.id)}>
                          <CreditCard className="h-3 w-3" />{isRTL ? 'تسجيل دفعة' : 'Record Payment'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openEditDialog(loan)}>
                        <Edit className="h-3 w-3" />{isRTL ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-destructive hover:text-destructive" onClick={() => { setDeletingLoanId(loan.id); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-3 w-3" />{isRTL ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredLoans.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">{isRTL ? 'لا توجد قروض' : 'No loans found'}</div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="bg-gradient-to-r from-red-500 to-blue-500 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-white text-center text-xl">
              {editingLoan ? (isRTL ? 'تعديل القرض' : 'Edit Loan') : (isRTL ? 'إضافة قرض جديد' : 'Add New Loan')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Employee */}
            <div className="space-y-2">
              <Label>{isRTL ? 'اختر الموظف *' : 'Select Employee *'}</Label>
              <Select value={formData.employeeId} onValueChange={v => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger><SelectValue placeholder={isRTL ? '-- اختر الموظف --' : '-- Select Employee --'} /></SelectTrigger>
                <SelectContent>
                  {systemEmployees.map(emp => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {isRTL ? emp.nameAr : emp.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEmployee && (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'المحطة/الموقع: ' : 'Station: '}{selectedEmployee.department || '-'}
                </p>
              )}
            </div>

            {/* Amount & Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'إجمالي مبلغ القرض * (ج.م)' : 'Total Loan Amount * (EGP)'}</Label>
                <Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'تاريخ بدء الخصم *' : 'Deduction Start Date *'}</Label>
                <Input type="month" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
            </div>

            {/* Calculation Method */}
            <div className="space-y-2">
              <Label>{isRTL ? 'طريقة حساب الأقساط' : 'Installment Calculation Method'}</Label>
              <RadioGroup value={formData.calculationMethod} onValueChange={v => setFormData({ ...formData, calculationMethod: v as 'auto' | 'manual' })} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="auto" id="calc-auto" />
                  <Label htmlFor="calc-auto" className="cursor-pointer">{isRTL ? 'حساب تلقائي' : 'Auto Calculate'}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="manual" id="calc-manual" />
                  <Label htmlFor="calc-manual" className="cursor-pointer">{isRTL ? 'إدخال يدوي' : 'Manual Entry'}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Installments */}
            <div className="space-y-2">
              <Label>{isRTL ? 'عدد الأقساط' : 'Number of Installments'}{formData.calculationMethod === 'manual' ? (isRTL ? ' (محسوب تلقائياً)' : ' (Auto-calculated)') : ' *'}</Label>
              {formData.calculationMethod === 'manual' ? (
                <Input value={autoInstallmentsCount ? `${autoInstallmentsCount} ${isRTL ? 'قسط' : 'installments'}` : ''} disabled className="bg-muted" />
              ) : (
                <Input type="number" value={formData.installments} onChange={e => setFormData({ ...formData, installments: e.target.value })} />
              )}
            </div>

            {/* Monthly Payment */}
            <div className="space-y-2">
              <Label>{isRTL ? 'قيمة القسط الشهري' : 'Monthly Installment'}{formData.calculationMethod === 'auto' ? (isRTL ? ' (محسوب تلقائياً)' : ' (Auto-calculated)') : ''}</Label>
              {formData.calculationMethod === 'auto' ? (
                <Input value={autoMonthlyPayment ? `${parseFloat(autoMonthlyPayment).toLocaleString()} ${isRTL ? 'ج.م' : 'EGP'}` : ''} disabled className="bg-muted" />
              ) : (
                <Input type="number" value={formData.monthlyPayment} onChange={e => setFormData({ ...formData, monthlyPayment: e.target.value })} />
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-blue-600">
              {editingLoan ? (isRTL ? 'تحديث القرض' : 'Update Loan') : (isRTL ? 'حفظ القرض' : 'Save Loan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
            <AlertDialogDescription>{isRTL ? 'هل أنت متأكد من حذف هذا القرض؟ لا يمكن التراجع.' : 'Are you sure you want to delete this loan? This cannot be undone.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isRTL ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <InstallmentScheduleDialog open={showInstallmentSchedule} onOpenChange={setShowInstallmentSchedule} loan={viewingLoan} />
    </div>
  );
};
