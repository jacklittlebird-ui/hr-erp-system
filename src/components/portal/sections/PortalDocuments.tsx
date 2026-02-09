import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Download, Upload } from 'lucide-react';

const documents = [
  { nameAr: 'عقد العمل', nameEn: 'Employment Contract', dateAr: '2023-01-15', typeAr: 'عقد', typeEn: 'Contract' },
  { nameAr: 'شهادة خبرة', nameEn: 'Experience Certificate', dateAr: '2025-06-01', typeAr: 'شهادة', typeEn: 'Certificate' },
  { nameAr: 'كشف راتب - يناير 2026', nameEn: 'Payslip - Jan 2026', dateAr: '2026-01-31', typeAr: 'مالي', typeEn: 'Financial' },
  { nameAr: 'صورة البطاقة', nameEn: 'ID Copy', dateAr: '2023-01-15', typeAr: 'هوية', typeEn: 'Identity' },
];

export const PortalDocuments = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{language === 'ar' ? 'المستندات' : 'Documents'}</h1>
        <Button><Upload className="w-4 h-4 mr-1" />{language === 'ar' ? 'رفع مستند' : 'Upload'}</Button>
      </div>

      <div className="grid gap-3">
        {documents.map((d, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <FileText className="w-8 h-8 text-primary" />
                  <div className={cn(isRTL && "text-right")}>
                    <p className="font-medium">{language === 'ar' ? d.nameAr : d.nameEn}</p>
                    <p className="text-xs text-muted-foreground">{d.dateAr}</p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Badge variant="secondary">{language === 'ar' ? d.typeAr : d.typeEn}</Badge>
                  <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
