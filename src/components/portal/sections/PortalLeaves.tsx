import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Calendar, Plus } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalLeaves = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getLeaveBalances, getLeaveRequests } = usePortalData();

  const balances = useMemo(() => getLeaveBalances(PORTAL_EMPLOYEE_ID), [getLeaveBalances]);
  const requests = useMemo(() => getLeaveRequests(PORTAL_EMPLOYEE_ID), [getLeaveRequests]);

  const statusCls: Record<string, string> = {
    approved: 'bg-success/10 text-success border-success',
    pending: 'bg-warning/10 text-warning border-warning',
    rejected: 'bg-destructive/10 text-destructive border-destructive',
  };
  const statusLabel: Record<string, { ar: string; en: string }> = {
    approved: { ar: 'مقبول', en: 'Approved' },
    pending: { ar: 'معلق', en: 'Pending' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'الإجازات' : 'Leaves'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب إجازة' : 'Request Leave'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((b, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="font-semibold text-lg">{ar ? b.typeAr : b.typeEn}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted-foreground">{ar ? 'الإجمالي' : 'Total'}: <strong>{b.total}</strong></span>
                <span className="text-destructive">{ar ? 'مستخدم' : 'Used'}: <strong>{b.used}</strong></span>
                <span className="text-success">{ar ? 'متبقي' : 'Left'}: <strong>{b.remaining}</strong></span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(b.used / b.total) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Calendar className="w-5 h-5" />{ar ? 'طلبات الإجازات' : 'Leave Requests'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'من' : 'From'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إلى' : 'To'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الأيام' : 'Days'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{ar ? r.typeAr : r.typeEn}</TableCell>
                  <TableCell>{r.from}</TableCell>
                  <TableCell>{r.to}</TableCell>
                  <TableCell>{r.days}</TableCell>
                  <TableCell><Badge variant="outline" className={statusCls[r.status]}>{ar ? statusLabel[r.status].ar : statusLabel[r.status].en}</Badge></TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد طلبات' : 'No requests'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
