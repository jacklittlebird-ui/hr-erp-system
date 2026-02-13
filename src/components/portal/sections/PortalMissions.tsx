import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MapPin, Plus } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalMissions = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getMissions } = usePortalData();
  const missions = useMemo(() => getMissions(PORTAL_EMPLOYEE_ID), [getMissions]);

  const statusCls: Record<string, string> = {
    approved: 'bg-success/10 text-success border-success',
    pending: 'bg-warning/10 text-warning border-warning',
    rejected: 'bg-destructive/10 text-destructive border-destructive',
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'مأمورياتي' : 'My Missions'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب مأمورية' : 'New Mission'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><MapPin className="w-5 h-5" />{ar ? 'سجل المأموريات' : 'Mission Records'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الوجهة' : 'Destination'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'من' : 'From'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إلى' : 'To'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الغرض' : 'Purpose'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {missions.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{ar ? m.destAr : m.destEn}</TableCell>
                  <TableCell>{m.from}</TableCell>
                  <TableCell>{m.to}</TableCell>
                  <TableCell>{ar ? m.purposeAr : m.purposeEn}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusCls[m.status]}>
                      {m.status === 'approved' ? (ar ? 'مقبول' : 'Approved') : m.status === 'pending' ? (ar ? 'معلق' : 'Pending') : (ar ? 'مرفوض' : 'Rejected')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {missions.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد مأموريات' : 'No missions'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
