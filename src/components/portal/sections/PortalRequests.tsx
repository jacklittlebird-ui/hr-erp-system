import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ClipboardList, Plus } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalRequests = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getRequests } = usePortalData();
  const requests = useMemo(() => getRequests(PORTAL_EMPLOYEE_ID), [getRequests]);

  const statusCls: Record<string, string> = {
    approved: 'bg-success/10 text-success border-success',
    pending: 'bg-warning/10 text-warning border-warning',
    rejected: 'bg-destructive/10 text-destructive border-destructive',
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'الطلبات' : 'Requests'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب جديد' : 'New Request'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><ClipboardList className="w-5 h-5" />{ar ? 'جميع الطلبات' : 'All Requests'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{ar ? r.typeAr : r.typeEn}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusCls[r.status]}>
                      {r.status === 'approved' ? (ar ? 'مقبول' : 'Approved') : r.status === 'pending' ? (ar ? 'معلق' : 'Pending') : (ar ? 'مرفوض' : 'Rejected')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد طلبات' : 'No requests'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
