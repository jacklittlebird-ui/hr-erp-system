import { useState, useRef, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Upload, Trash2, Smartphone, Search, Printer, FileText, FileSpreadsheet, Phone, Users, DollarSign, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockEmployees } from '@/data/mockEmployees';
import { useReportExport } from '@/hooks/useReportExport';

interface MobileBillEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  billAmount: number;
  deductionMonth: string;
  status: 'pending' | 'deducted';
  uploadDate: string;
  batchId: string;
}

const getMonthLabel = (dateStr: string, lang: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' });
};

export const MobileBills = () => {
  const { isRTL, language } = useLanguage();
  const { handlePrint, exportToPDF, exportToCSV } = useReportExport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deductionMonth, setDeductionMonth] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [entries, setEntries] = useState<MobileBillEntry[]>([
    { id: '1', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', department: 'تقنية المعلومات', billAmount: 350, deductionMonth: '2026-02', status: 'pending', uploadDate: '2026-02-01', batchId: 'B001' },
    { id: '2', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', department: 'الموارد البشرية', billAmount: 280, deductionMonth: '2026-02', status: 'pending', uploadDate: '2026-02-01', batchId: 'B001' },
    { id: '3', employeeId: 'Emp003', employeeName: 'سارة أحمد حسن', department: 'المالية', billAmount: 420, deductionMonth: '2026-01', status: 'deducted', uploadDate: '2026-01-05', batchId: 'B000' },
  ]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!deductionMonth) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى تحديد شهر الخصم أولاً' : 'Please select deduction month first', variant: 'destructive' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى رفع ملف Excel أو CSV' : 'Please upload an Excel or CSV file', variant: 'destructive' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim());
      // Skip header row
      const dataLines = lines.slice(1);
      const batchId = `B${String(Date.now()).slice(-4)}`;
      const newEntries: MobileBillEntry[] = [];
      let skippedCount = 0;

      dataLines.forEach((line, idx) => {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const empId = parts[0];
        const amount = parseFloat(parts[1]);

        if (!empId || isNaN(amount) || amount <= 0) {
          skippedCount++;
          return;
        }

        const employee = mockEmployees.find(emp => emp.employeeId === empId);
        
        newEntries.push({
          id: `${Date.now()}-${idx}`,
          employeeId: empId,
          employeeName: employee?.nameAr || empId,
          department: employee?.department || '-',
          billAmount: amount,
          deductionMonth,
          status: 'pending',
          uploadDate: new Date().toISOString().split('T')[0],
          batchId,
        });
      });

      if (newEntries.length === 0) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'لم يتم العثور على بيانات صالحة في الملف. تأكد أن الملف يحتوي على عمودين: رقم ID الموظف ومبلغ الفاتورة' : 'No valid data found. Ensure file has two columns: Employee ID and Bill Amount',
          variant: 'destructive',
        });
      } else {
        setEntries(prev => [...prev, ...newEntries]);
        toast({
          title: isRTL ? 'تم الرفع بنجاح' : 'Upload Successful',
          description: isRTL
            ? `تم إضافة ${newEntries.length} فاتورة${skippedCount > 0 ? ` (تم تخطي ${skippedCount} سطر غير صالح)` : ''}`
            : `${newEntries.length} bills added${skippedCount > 0 ? ` (${skippedCount} invalid rows skipped)` : ''}`,
        });
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = () => {
    if (deletingId) setEntries(prev => prev.filter(e => e.id !== deletingId));
    setShowDeleteDialog(false);
    setDeletingId(null);
    toast({ title: isRTL ? 'تم الحذف' : 'Deleted' });
  };

  const handleMarkDeducted = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'deducted' as const } : e));
    toast({ title: isRTL ? 'تم تحديث الحالة' : 'Status Updated' });
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.employeeName.includes(searchQuery) || e.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => ({
    total: entries.length,
    pending: entries.filter(e => e.status === 'pending').length,
    totalAmount: entries.reduce((s, e) => s + e.billAmount, 0),
    deductedAmount: entries.filter(e => e.status === 'deducted').reduce((s, e) => s + e.billAmount, 0),
  }), [entries]);

  const exportTitle = isRTL ? 'تقرير فواتير الموبايل' : 'Mobile Bills Report';
  const exportColumns = [
    { header: isRTL ? 'رقم الموظف' : 'Employee ID', key: 'employeeId' },
    { header: isRTL ? 'اسم الموظف' : 'Employee', key: 'employeeName' },
    { header: isRTL ? 'القسم' : 'Department', key: 'department' },
    { header: isRTL ? 'مبلغ الفاتورة' : 'Bill Amount', key: 'billAmount' },
    { header: isRTL ? 'شهر الخصم' : 'Deduction Month', key: 'monthLabel' },
    { header: isRTL ? 'الحالة' : 'Status', key: 'statusLabel' },
  ];
  const exportData = filteredEntries.map(e => ({
    ...e,
    monthLabel: getMonthLabel(e.deductionMonth, language),
    statusLabel: e.status === 'pending' ? (isRTL ? 'قيد الخصم' : 'Pending') : (isRTL ? 'تم الخصم' : 'Deducted'),
  }));

  const generateMonths = () => {
    const months: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = -2; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ value: val, label: getMonthLabel(val, language) });
    }
    return months;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: isRTL ? 'إجمالي الفواتير' : 'Total Bills', value: stats.total, icon: Phone, bgClass: 'bg-stat-blue-bg', iconBg: 'bg-stat-blue' },
          { label: isRTL ? 'قيد الخصم' : 'Pending', value: stats.pending, icon: Calendar, bgClass: 'bg-stat-yellow-bg', iconBg: 'bg-stat-yellow' },
          { label: isRTL ? 'إجمالي المبالغ' : 'Total Amount', value: `${stats.totalAmount.toLocaleString()}`, icon: DollarSign, bgClass: 'bg-stat-purple-bg', iconBg: 'bg-stat-purple' },
          { label: isRTL ? 'المبالغ المخصومة' : 'Deducted', value: `${stats.deductedAmount.toLocaleString()}`, icon: Users, bgClass: 'bg-stat-green-bg', iconBg: 'bg-stat-green' },
        ].map((s, i) => (
          <div key={i} className={cn("rounded-xl p-5 flex items-center gap-4 shadow-sm border border-border/30", s.bgClass, isRTL && "flex-row-reverse")}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", s.iconBg)}>
              <s.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Upload className="h-5 w-5" />
            {isRTL ? 'رفع فواتير الموبايل' : 'Upload Mobile Bills'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("flex flex-col md:flex-row gap-4 items-end", isRTL && "md:flex-row-reverse")}>
            <div className="space-y-2 flex-1">
              <Label>{isRTL ? 'شهر الخصم *' : 'Deduction Month *'}</Label>
              <Select value={deductionMonth} onValueChange={setDeductionMonth}>
                <SelectTrigger className="w-full md:w-60">
                  <SelectValue placeholder={isRTL ? '-- اختر شهر الخصم --' : '-- Select Month --'} />
                </SelectTrigger>
                <SelectContent>
                  {generateMonths().map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex-1">
              <Label>{isRTL ? 'ملف الفواتير (Excel/CSV) *' : 'Bills File (Excel/CSV) *'}</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className={cn("mt-4 p-4 rounded-lg bg-muted/50 border border-border/50", isRTL && "text-right")}>
            <p className="text-sm font-medium text-foreground mb-2">
              <Smartphone className="h-4 w-4 inline-block mx-1" />
              {isRTL ? 'تعليمات الملف:' : 'File Instructions:'}
            </p>
            <ul className={cn("text-xs text-muted-foreground space-y-1", isRTL ? "list-disc pr-5" : "list-disc pl-5")}>
              <li>{isRTL ? 'العمود الأول: رقم ID الموظف (مثال: Emp001)' : 'Column 1: Employee ID (e.g., Emp001)'}</li>
              <li>{isRTL ? 'العمود الثاني: مبلغ فاتورة الموبايل' : 'Column 2: Mobile bill amount'}</li>
              <li>{isRTL ? 'السطر الأول يعتبر عنوان الأعمدة ويتم تخطيه' : 'First row is treated as header and skipped'}</li>
              <li>{isRTL ? 'سيتم خصم المبلغ تلقائياً عند معالجة رواتب الشهر المحدد' : 'Amount will be auto-deducted during payroll processing for the selected month'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <CardTitle>{isRTL ? 'سجل فواتير الموبايل' : 'Mobile Bills Log'}</CardTitle>
            <div className={cn("flex flex-wrap gap-3", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-3 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input placeholder={isRTL ? 'بحث...' : 'Search...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={cn("w-full md:w-48", isRTL ? "pr-9" : "pl-9")} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="pending">{isRTL ? 'قيد الخصم' : 'Pending'}</SelectItem>
                  <SelectItem value="deducted">{isRTL ? 'تم الخصم' : 'Deducted'}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => handlePrint(exportTitle)}><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => exportToPDF({ title: exportTitle, data: exportData, columns: exportColumns })}><FileText className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => exportToCSV({ title: exportTitle, data: exportData, columns: exportColumns, fileName: 'mobile-bills' })}><FileSpreadsheet className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'رقم الموظف' : 'Employee ID'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'اسم الموظف' : 'Employee'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'القسم' : 'Department'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'مبلغ الفاتورة' : 'Bill Amount'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'شهر الخصم' : 'Deduction Month'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'تاريخ الرفع' : 'Upload Date'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className={cn("font-mono text-xs", isRTL && "text-right")}>{entry.employeeId}</TableCell>
                  <TableCell className={cn("font-medium", isRTL && "text-right")}>{entry.employeeName}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{entry.department}</TableCell>
                  <TableCell className={cn("font-semibold", isRTL && "text-right")}>{entry.billAmount.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{getMonthLabel(entry.deductionMonth, language)}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{entry.uploadDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={entry.status === 'deducted' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}>
                      {entry.status === 'deducted' ? (isRTL ? 'تم الخصم' : 'Deducted') : (isRTL ? 'قيد الخصم' : 'Pending')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                      {entry.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-green-600" onClick={() => handleMarkDeducted(entry.id)}>
                          {isRTL ? 'خصم' : 'Deduct'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs gap-1 text-destructive hover:text-destructive" onClick={() => { setDeletingId(entry.id); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">{isRTL ? 'لا توجد فواتير' : 'No bills found'}</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
            <AlertDialogDescription>{isRTL ? 'هل أنت متأكد من حذف هذه الفاتورة؟' : 'Delete this bill entry?'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isRTL ? 'حذف' : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
