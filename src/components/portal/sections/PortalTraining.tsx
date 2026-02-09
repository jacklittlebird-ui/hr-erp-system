import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

const courses = [
  { nameAr: 'دورة القيادة المتقدمة', nameEn: 'Advanced Leadership', progress: 75, statusAr: 'جاري', statusEn: 'In Progress', dateAr: '2026-01-01 - 2026-03-01', dateEn: '2026-01-01 - 2026-03-01' },
  { nameAr: 'إدارة المشاريع PMP', nameEn: 'PMP Project Management', progress: 100, statusAr: 'مكتمل', statusEn: 'Completed', dateAr: '2025-09-01 - 2025-11-30', dateEn: '2025-09-01 - 2025-11-30' },
  { nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity Basics', progress: 30, statusAr: 'جاري', statusEn: 'In Progress', dateAr: '2026-02-01 - 2026-04-01', dateEn: '2026-02-01 - 2026-04-01' },
];

export const PortalTraining = () => {
  const { language, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{language === 'ar' ? 'التدريب' : 'Training'}</h1>

      <div className="grid gap-4">
        {courses.map((c, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className={cn("flex justify-between items-center mb-3", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{language === 'ar' ? c.nameAr : c.nameEn}</h3>
                </div>
                <Badge variant="outline" className={c.progress === 100 ? 'bg-success/10 text-success border-success' : 'bg-primary/10 text-primary border-primary'}>
                  {language === 'ar' ? c.statusAr : c.statusEn}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{c.dateAr}</p>
              <div className="flex items-center gap-3">
                <Progress value={c.progress} className="flex-1" />
                <span className="text-sm font-medium">{c.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
