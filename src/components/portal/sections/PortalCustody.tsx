import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

const items = [
  { id: 1, nameAr: 'لابتوب Dell XPS', nameEn: 'Dell XPS Laptop', codeAr: 'AST-001', assignDate: '2023-02-01', statusAr: 'بحوزتي', statusEn: 'In Custody' },
  { id: 2, nameAr: 'هاتف iPhone 15', nameEn: 'iPhone 15', codeAr: 'AST-045', assignDate: '2024-06-15', statusAr: 'بحوزتي', statusEn: 'In Custody' },
  { id: 3, nameAr: 'بطاقة دخول', nameEn: 'Access Card', codeAr: 'AST-102', assignDate: '2023-01-15', statusAr: 'بحوزتي', statusEn: 'In Custody' },
];

export const PortalCustody = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'عهد وتعهدات' : 'Custody & Pledges'}</h1>

      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Package className="w-5 h-5" />{language === 'ar' ? 'العهد المسلمة' : 'Assigned Items'}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الكود' : 'Code'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'تاريخ التسليم' : 'Assigned'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono">{i.codeAr}</TableCell>
                  <TableCell>{language === 'ar' ? i.nameAr : i.nameEn}</TableCell>
                  <TableCell>{i.assignDate}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-primary/10 text-primary border-primary">{language === 'ar' ? i.statusAr : i.statusEn}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
