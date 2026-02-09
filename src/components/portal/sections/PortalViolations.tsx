import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Ban } from 'lucide-react';

const violations = [
  { id: 1, dateAr: '2025-11-05', typeAr: 'تأخر متكرر', typeEn: 'Repeated Lateness', penaltyAr: 'إنذار شفهي', penaltyEn: 'Verbal Warning', statusAr: 'مغلق', statusEn: 'Closed' },
  { id: 2, dateAr: '2025-08-20', typeAr: 'غياب بدون إذن', typeEn: 'Unauthorized Absence', penaltyAr: 'خصم يوم', penaltyEn: '1 Day Deduction', statusAr: 'مغلق', statusEn: 'Closed' },
];

export const PortalViolations = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'مخالفاتي' : 'My Violations'}</h1>

      {violations.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">{language === 'ar' ? 'لا توجد مخالفات' : 'No violations'}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {violations.map(v => (
            <Card key={v.id}>
              <CardContent className="p-5">
                <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                    <Ban className="w-5 h-5 text-destructive mt-0.5" />
                    <div className={cn(isRTL && "text-right")}>
                      <p className="font-semibold">{language === 'ar' ? v.typeAr : v.typeEn}</p>
                      <p className="text-sm text-muted-foreground">{v.dateAr}</p>
                      <p className="text-sm mt-1">{language === 'ar' ? 'العقوبة:' : 'Penalty:'} {language === 'ar' ? v.penaltyAr : v.penaltyEn}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">{language === 'ar' ? v.statusAr : v.statusEn}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
