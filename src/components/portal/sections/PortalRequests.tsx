import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ClipboardList, Plus } from 'lucide-react';

const requests = [
  { id: 1, typeAr: 'خطاب تعريف', typeEn: 'Intro Letter', dateAr: '2026-01-20', statusAr: 'مقبول', statusEn: 'Approved', cls: 'bg-success/10 text-success border-success' },
  { id: 2, typeAr: 'شهادة خبرة', typeEn: 'Experience Cert', dateAr: '2026-02-01', statusAr: 'معلق', statusEn: 'Pending', cls: 'bg-warning/10 text-warning border-warning' },
  { id: 3, typeAr: 'تعديل بيانات', typeEn: 'Data Update', dateAr: '2025-12-15', statusAr: 'مرفوض', statusEn: 'Rejected', cls: 'bg-destructive/10 text-destructive border-destructive' },
];

export const PortalRequests = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'الطلبات' : 'Requests'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{language === 'ar' ? 'طلب جديد' : 'New Request'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><ClipboardList className="w-5 h-5" />{language === 'ar' ? 'جميع الطلبات' : 'All Requests'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {requests.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{language === 'ar' ? r.typeAr : r.typeEn}</TableCell>
                  <TableCell>{r.dateAr}</TableCell>
                  <TableCell><Badge variant="outline" className={r.cls}>{language === 'ar' ? r.statusAr : r.statusEn}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
