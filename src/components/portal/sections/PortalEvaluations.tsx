import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalEvaluations = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getEvaluations } = usePortalData();
  const evaluations = useMemo(() => getEvaluations(PORTAL_EMPLOYEE_ID), [getEvaluations]);

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'تقييماتي' : 'My Evaluations'}</h1>

      {evaluations.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">{ar ? 'لا توجد تقييمات' : 'No evaluations'}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {evaluations.map(e => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                  <div className={cn(isRTL && "text-right")}>
                    <h3 className="font-semibold text-lg">{e.period}</h3>
                    <p className="text-sm text-muted-foreground">{ar ? 'المقيّم:' : 'Reviewer:'} {ar ? e.reviewerAr : e.reviewerEn}</p>
                    <p className="text-sm mt-2">{ar ? e.notesAr : e.notesEn}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className={cn("w-5 h-5", si < Math.floor(e.score) ? "text-warning fill-warning" : "text-muted")} />
                      ))}
                    </div>
                    <span className="text-xl font-bold">{e.score}/{e.maxScore}</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success">{e.status === 'completed' ? (ar ? 'مكتمل' : 'Completed') : (ar ? 'معلق' : 'Pending')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
