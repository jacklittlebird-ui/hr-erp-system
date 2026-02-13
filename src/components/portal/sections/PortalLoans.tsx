import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandCoins, Plus } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalLoans = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getLoans } = usePortalData();
  const loans = useMemo(() => getLoans(PORTAL_EMPLOYEE_ID), [getLoans]);

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'قروضي' : 'My Loans'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب قرض' : 'Request Loan'}</Button>
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
    </div>
  );
};
