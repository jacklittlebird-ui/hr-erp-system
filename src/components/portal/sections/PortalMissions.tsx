import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MapPin, Plus } from 'lucide-react';

const missions = [
  { id: 1, destAr: 'الإسكندرية', destEn: 'Alexandria', from: '2026-01-15', to: '2026-01-17', purposeAr: 'اجتماع عمل', purposeEn: 'Business Meeting', statusAr: 'مقبول', statusEn: 'Approved', cls: 'bg-success/10 text-success border-success' },
  { id: 2, destAr: 'أسوان', destEn: 'Aswan', from: '2026-02-20', to: '2026-02-22', purposeAr: 'تدريب ميداني', purposeEn: 'Field Training', statusAr: 'معلق', statusEn: 'Pending', cls: 'bg-warning/10 text-warning border-warning' },
];

export const PortalMissions = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'مأمورياتي' : 'My Missions'}</h1>
        <Button><Plus className="w-4 h-4 mr-1" />{language === 'ar' ? 'طلب مأمورية' : 'New Mission'}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><MapPin className="w-5 h-5" />{language === 'ar' ? 'سجل المأموريات' : 'Mission Records'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الوجهة' : 'Destination'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'من' : 'From'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'إلى' : 'To'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الغرض' : 'Purpose'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {missions.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{language === 'ar' ? m.destAr : m.destEn}</TableCell>
                  <TableCell>{m.from}</TableCell>
                  <TableCell>{m.to}</TableCell>
                  <TableCell>{language === 'ar' ? m.purposeAr : m.purposeEn}</TableCell>
                  <TableCell><Badge variant="outline" className={m.cls}>{language === 'ar' ? m.statusAr : m.statusEn}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
