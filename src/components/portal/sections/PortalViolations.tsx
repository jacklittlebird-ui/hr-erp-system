import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Ban } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalViolations = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getViolations } = usePortalData();
  const violations = useMemo(() => getViolations(PORTAL_EMPLOYEE_ID), [getViolations]);

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'مخالفاتي' : 'My Violations'}</h1>

      {violations.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">{ar ? 'لا توجد مخالفات' : 'No violations'}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {violations.map(v => (
            <Card key={v.id}>
              <CardContent className="p-5">
                <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                    <Ban className="w-5 h-5 text-destructive mt-0.5" />
                    <div className={cn(isRTL && "text-right")}>
                      <p className="font-semibold">{ar ? v.typeAr : v.typeEn}</p>
                      <p className="text-sm text-muted-foreground">{v.date}</p>
                      <p className="text-sm mt-1">{ar ? 'العقوبة:' : 'Penalty:'} {ar ? v.penaltyAr : v.penaltyEn}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={v.status === 'open' ? 'bg-warning/10 text-warning border-warning' : 'bg-muted text-muted-foreground'}>
                    {v.status === 'open' ? (ar ? 'مفتوح' : 'Open') : (ar ? 'مغلق' : 'Closed')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
