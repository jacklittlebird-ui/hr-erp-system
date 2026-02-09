import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

const evaluations = [
  { period: 'Q4 2025', score: 4.2, maxScore: 5, reviewerAr: 'محمد أحمد', reviewerEn: 'Mohamed Ahmed', statusAr: 'مكتمل', statusEn: 'Completed', notes: { ar: 'أداء ممتاز في المشاريع', en: 'Excellent project performance' } },
  { period: 'Q3 2025', score: 3.8, maxScore: 5, reviewerAr: 'محمد أحمد', reviewerEn: 'Mohamed Ahmed', statusAr: 'مكتمل', statusEn: 'Completed', notes: { ar: 'جيد مع مجال للتحسين', en: 'Good with room for improvement' } },
  { period: 'Q2 2025', score: 4.5, maxScore: 5, reviewerAr: 'محمد أحمد', reviewerEn: 'Mohamed Ahmed', statusAr: 'مكتمل', statusEn: 'Completed', notes: { ar: 'أداء متميز', en: 'Outstanding performance' } },
];

export const PortalEvaluations = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'تقييماتي' : 'My Evaluations'}</h1>

      <div className="grid gap-4">
        {evaluations.map((e, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                <div className={cn(isRTL && "text-right")}>
                  <h3 className="font-semibold text-lg">{e.period}</h3>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المقيّم:' : 'Reviewer:'} {language === 'ar' ? e.reviewerAr : e.reviewerEn}</p>
                  <p className="text-sm mt-2">{language === 'ar' ? e.notes.ar : e.notes.en}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={cn("w-5 h-5", si < Math.floor(e.score) ? "text-warning fill-warning" : "text-muted")} />
                    ))}
                  </div>
                  <span className="text-xl font-bold">{e.score}/{e.maxScore}</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success">{language === 'ar' ? e.statusAr : e.statusEn}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
