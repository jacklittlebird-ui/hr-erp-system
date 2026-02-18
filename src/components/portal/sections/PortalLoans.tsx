import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { HandCoins, Plus } from 'lucide-react';
import { toast } from 'sonner';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalLoans = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getLoans, addLoanRequest } = usePortalData();
  const loans = useMemo(() => getLoans(PORTAL_EMPLOYEE_ID), [getLoans]);
  const [showDialog, setShowDialog] = useState(false);
  const [loanType, setLoanType] = useState('');
  const [amount, setAmount] = useState('');
  const [installment, setInstallment] = useState('');

  const loanTypes = [
    { value: 'personal', ar: 'قرض شخصي', en: 'Personal Loan' },
    { value: 'advance', ar: 'سلفة', en: 'Advance' },
    { value: 'emergency', ar: 'قرض طوارئ', en: 'Emergency Loan' },
  ];

  const handleSubmit = () => {
    if (!loanType || !amount) { toast.error(ar ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    const t = loanTypes.find(l => l.value === loanType);
    addLoanRequest({
      employeeId: PORTAL_EMPLOYEE_ID,
      typeAr: t?.ar || '', typeEn: t?.en || '',
      amount: Number(amount),
      installment: Number(installment) || Number(amount),
    });
    toast.success(ar ? 'تم تقديم طلب القرض بنجاح' : 'Loan request submitted');
    setShowDialog(false); setLoanType(''); setAmount(''); setInstallment('');
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'قروضي' : 'My Loans'}</h1>
        <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب قرض' : 'Request Loan'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'إجمالي القروض' : 'Total Loans'}</p>
          <p className="text-3xl font-bold text-primary">{loans.reduce((s, l) => s + l.amount, 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'المسدد' : 'Paid'}</p>
          <p className="text-3xl font-bold text-success">{loans.reduce((s, l) => s + l.paid, 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground">{ar ? 'المتبقي' : 'Remaining'}</p>
          <p className="text-3xl font-bold text-destructive">{loans.reduce((s, l) => s + l.remaining, 0).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><HandCoins className="w-5 h-5" />{ar ? 'القروض والسلف' : 'Loans & Advances'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'المبلغ' : 'Amount'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'المسدد' : 'Paid'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'المتبقي' : 'Remaining'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'القسط' : 'Installment'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loans.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{ar ? l.typeAr : l.typeEn}</TableCell>
                  <TableCell>{l.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-success">{l.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{l.remaining.toLocaleString()}</TableCell>
                  <TableCell>{l.installment.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={l.status === 'paid' ? 'bg-success/10 text-success border-success' : 'bg-warning/10 text-warning border-warning'}>
                      {l.status === 'paid' ? (ar ? 'مسدد' : 'Paid') : (ar ? 'جاري' : 'Active')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {loans.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد قروض' : 'No loans'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent><DialogHeader><DialogTitle>{ar ? 'طلب قرض جديد' : 'New Loan Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{ar ? 'نوع القرض' : 'Loan Type'}</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger><SelectValue placeholder={ar ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{loanTypes.map(t => <SelectItem key={t.value} value={t.value}>{ar ? t.ar : t.en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{ar ? 'المبلغ' : 'Amount'}</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div><Label>{ar ? 'القسط الشهري' : 'Monthly Installment'}</Label><Input type="number" value={installment} onChange={e => setInstallment(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit}>{ar ? 'تقديم الطلب' : 'Submit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
