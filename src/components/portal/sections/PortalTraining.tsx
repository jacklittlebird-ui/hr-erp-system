import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { GraduationCap, AlertTriangle, Info } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { TrainingDebt } from '@/components/training/TrainingPlan';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalTraining = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getTraining } = usePortalData();
  const courses = useMemo(() => getTraining(PORTAL_EMPLOYEE_ID), [getTraining]);
  const [trainingDebts] = usePersistedState<TrainingDebt[]>('hr_training_debts', []);

  // Filter active debts (not expired - within 3 years)
  const activeDebts = useMemo(() => {
    const now = new Date();
    return trainingDebts
      .filter(d => d.employeeId === PORTAL_EMPLOYEE_ID && new Date(d.expiryDate) > now);
  }, [trainingDebts]);

  const totalDebt = activeDebts.reduce((s, d) => s + d.cost, 0);

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'التدريب' : 'Training'}</h1>

      {/* Training Debts Section */}
      {activeDebts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2 text-amber-800", isRTL && "flex-row-reverse")}>
              <AlertTriangle className="w-5 h-5" />
              {ar ? 'الدورات المستحقة (دين تدريبي)' : 'Training Debts'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className={cn("text-xs text-amber-700 flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Info className="w-3 h-3" />
              {ar ? 'تظل تكلفة الدورة ديناً على الموظف لمدة 3 سنوات من تاريخ أخذ الدورة ثم تُزال تلقائياً' : 'Course cost remains as employee debt for 3 years from the actual date, then auto-removed'}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ar ? 'اسم الدورة' : 'Course'}</TableHead>
                  <TableHead>{ar ? 'التكلفة' : 'Cost'}</TableHead>
                  <TableHead>{ar ? 'تاريخ الدورة' : 'Date'}</TableHead>
                  <TableHead>{ar ? 'تاريخ الانتهاء' : 'Expires'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeDebts.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.courseName}</TableCell>
                    <TableCell className="font-bold text-amber-700">{d.cost.toLocaleString()}</TableCell>
                    <TableCell>{d.actualDate}</TableCell>
                    <TableCell>{d.expiryDate}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-amber-100/50 font-bold">
                  <TableCell>{ar ? 'الإجمالي' : 'Total'}</TableCell>
                  <TableCell className="text-amber-800">{totalDebt.toLocaleString()}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Existing courses */}
      {courses.length === 0 && activeDebts.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">{ar ? 'لا توجد دورات' : 'No courses'}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {courses.map(c => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className={cn("flex justify-between items-center mb-3", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{ar ? c.nameAr : c.nameEn}</h3>
                  </div>
                  <Badge variant="outline" className={c.status === 'completed' ? 'bg-success/10 text-success border-success' : 'bg-primary/10 text-primary border-primary'}>
                    {c.status === 'completed' ? (ar ? 'مكتمل' : 'Completed') : c.status === 'in-progress' ? (ar ? 'جاري' : 'In Progress') : (ar ? 'مخطط' : 'Planned')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{c.startDate} - {c.endDate}</p>
                <div className="flex items-center gap-3">
                  <Progress value={c.progress} className="flex-1" />
                  <span className="text-sm font-medium">{c.progress}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
