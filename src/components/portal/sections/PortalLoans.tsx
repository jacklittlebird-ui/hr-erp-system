import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HandCoins, Plus } from 'lucide-react';

const loans = [
  { id: 1, typeAr: 'قرض شخصي', typeEn: 'Personal Loan', amount: 10000, paid: 4000, remaining: 6000, installment: 1000, statusAr: 'جاري', statusEn: 'Active' },
  { id: 2, typeAr: 'سلفة', typeEn: 'Advance', amount: 2000, paid: 2000, remaining: 0, installment: 500, statusAr: 'مسدد', statusEn: 'Paid' },
];

export const PortalLoans = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'قروضي' : 'My Loans'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{language === 'ar' ? 'طلب قرض' : 'Request Loan'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><HandCoins className="w-5 h-5" />{language === 'ar' ? 'القروض والسلف' : 'Loans & Advances'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'المسدد' : 'Paid'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'المتبقي' : 'Remaining'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'القسط' : 'Installment'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loans.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{language === 'ar' ? l.typeAr : l.typeEn}</TableCell>
                  <TableCell>{l.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-success">{l.paid.toLocaleString()}</TableCell>
                  <TableCell className="text-destructive">{l.remaining.toLocaleString()}</TableCell>
                  <TableCell>{l.installment.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={l.remaining === 0 ? 'bg-success/10 text-success border-success' : 'bg-warning/10 text-warning border-warning'}>
                      {language === 'ar' ? l.statusAr : l.statusEn}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
