import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Calendar, Plus } from 'lucide-react';

const balances = [
  { typeAr: 'سنوية', typeEn: 'Annual', total: 21, used: 6, remaining: 15 },
  { typeAr: 'مرضية', typeEn: 'Sick', total: 14, used: 2, remaining: 12 },
  { typeAr: 'عارضة', typeEn: 'Casual', total: 7, used: 3, remaining: 4 },
];

const requests = [
  { id: 1, typeAr: 'سنوية', typeEn: 'Annual', from: '2026-01-10', to: '2026-01-12', days: 3, statusAr: 'مقبول', statusEn: 'Approved', statusCls: 'bg-success/10 text-success border-success' },
  { id: 2, typeAr: 'مرضية', typeEn: 'Sick', from: '2026-01-20', to: '2026-01-21', days: 2, statusAr: 'مقبول', statusEn: 'Approved', statusCls: 'bg-success/10 text-success border-success' },
  { id: 3, typeAr: 'سنوية', typeEn: 'Annual', from: '2026-02-15', to: '2026-02-17', days: 3, statusAr: 'معلق', statusEn: 'Pending', statusCls: 'bg-warning/10 text-warning border-warning' },
];

export const PortalLeaves = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'الإجازات' : 'Leaves'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{language === 'ar' ? 'طلب إجازة' : 'Request Leave'}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((b, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="font-semibold text-lg">{language === 'ar' ? b.typeAr : b.typeEn}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted-foreground">{language === 'ar' ? 'الإجمالي' : 'Total'}: <strong>{b.total}</strong></span>
                <span className="text-destructive">{language === 'ar' ? 'مستخدم' : 'Used'}: <strong>{b.used}</strong></span>
                <span className="text-success">{language === 'ar' ? 'متبقي' : 'Left'}: <strong>{b.remaining}</strong></span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(b.used / b.total) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Calendar className="w-5 h-5" />{language === 'ar' ? 'طلبات الإجازات' : 'Leave Requests'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'من' : 'From'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'إلى' : 'To'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الأيام' : 'Days'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{language === 'ar' ? r.typeAr : r.typeEn}</TableCell>
                  <TableCell>{r.from}</TableCell>
                  <TableCell>{r.to}</TableCell>
                  <TableCell>{r.days}</TableCell>
                  <TableCell><Badge variant="outline" className={r.statusCls}>{language === 'ar' ? r.statusAr : r.statusEn}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
