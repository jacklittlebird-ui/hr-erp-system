import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Package, CheckCircle, Laptop, GraduationCap, FileText } from 'lucide-react';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { supabase } from '@/integrations/supabase/client';

interface AssignedAsset {
  id: string;
  assetCode: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  model: string;
  condition: string;
  status: string;
}

interface TrainingDebt {
  id: string;
  courseNameAr: string;
  courseNameEn: string;
  status: string;
  startDate: string;
  endDate: string;
  score: number | null;
  cost: number;
  totalCost: number;
  plannedDate: string;
  provider: string;
  validityYears: number;
}

export const PortalCustody = () => {
  const PORTAL_EMPLOYEE_ID = usePortalEmployee();
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [assets, setAssets] = useState<AssignedAsset[]>([]);
  const [trainingDebts, setTrainingDebts] = useState<TrainingDebt[]>([]);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    if (!PORTAL_EMPLOYEE_ID) return;

    const fetchAssets = async () => {
      const { data } = await supabase.from('assets').select('*').eq('assigned_to', PORTAL_EMPLOYEE_ID);
      if (data) {
        setAssets(data.map(a => ({
          id: a.id, assetCode: a.asset_code, nameEn: a.name_en, nameAr: a.name_ar,
          brand: a.brand || '', model: a.model || '', condition: a.condition || 'good', status: a.status,
        })));
      }
    };

    const fetchTraining = async () => {
      const { data } = await supabase
        .from('training_records')
        .select('*, training_courses(name_ar, name_en, validity_years)')
        .eq('employee_id', PORTAL_EMPLOYEE_ID)
        .gt('total_cost', 0);
      if (data) {
        const now = new Date();
        const filtered = data.filter((t: any) => {
          if (!t.planned_date) return true;
          const expiryDate = new Date(t.planned_date);
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          return now <= expiryDate;
        });
        setTrainingDebts(filtered.map((t: any) => ({
          id: t.id,
          courseNameAr: (t.training_courses as any)?.name_ar || '',
          courseNameEn: (t.training_courses as any)?.name_en || '',
          status: t.status,
          startDate: t.start_date || '',
          endDate: t.end_date || '',
          score: t.score,
          cost: t.cost || 0,
          totalCost: t.total_cost || 0,
          plannedDate: t.planned_date || '',
          provider: t.provider || '',
          validityYears: (t.training_courses as any)?.validity_years || 1,
        })));
      }
    };

    const fetchEmployeeName = async () => {
      const { data } = await supabase.from('employees').select('name_ar, name_en').eq('id', PORTAL_EMPLOYEE_ID).single();
      if (data) setEmployeeName(ar ? data.name_ar : data.name_en);
    };

    fetchAssets();
    fetchTraining();
    fetchEmployeeName();
  }, [PORTAL_EMPLOYEE_ID]);

  const assigned = assets.filter(a => a.status === 'assigned').length;
  const inMaintenance = assets.filter(a => a.status === 'maintenance').length;
  const conditionMap: Record<string, string> = { good: 'جيدة', fair: 'مقبولة', poor: 'سيئة', new: 'جديدة' };
  const assetStatusMap: Record<string, { ar: string; cls: string }> = {
    assigned: { ar: 'بحوزتي', cls: 'bg-primary/10 text-primary border-primary' },
    maintenance: { ar: 'بالصيانة', cls: 'bg-amber-100 text-amber-700 border-amber-400' },
  };
  const statusMap: Record<string, { ar: string; cls: string }> = {
    enrolled: { ar: 'قيد التدريب', cls: 'bg-warning/10 text-warning border-warning' },
    failed: { ar: 'لم يجتاز', cls: 'bg-destructive/10 text-destructive border-destructive' },
    completed: { ar: 'مكتمل', cls: 'bg-primary/10 text-primary border-primary' },
  };

  return (
    <div className="space-y-6">
      <h1 className={cn("text-xl md:text-2xl font-bold", isRTL && "text-right")}>{ar ? 'العهد والتعهدات' : 'Custody & Obligations'}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{assigned}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'عهد بحوزتي' : 'Assigned'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Package className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{assets.length}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'إجمالي الأصول' : 'Total Assets'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <GraduationCap className="w-6 h-6 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold">{trainingDebts.length}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'مستحقات تدريب' : 'Training Dues'}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="assets" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList>
          <TabsTrigger value="assets">{ar ? 'العهد المسلمة' : 'Assigned Assets'}</TabsTrigger>
          <TabsTrigger value="training">{ar ? 'مستحقات التدريب' : 'Training Dues'}</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Laptop className="w-5 h-5 text-primary" />{ar ? 'الأصول المعيّنة لي' : 'Assets Assigned to Me'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{ar ? 'لا توجد أصول معيّنة' : 'No assets assigned'}</p>
              ) : (
                <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader><TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الكود' : 'Code'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الماركة' : 'Brand'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الموديل' : 'Model'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة الفنية' : 'Condition'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {assets.map(a => {
                      const aStatus = assetStatusMap[a.status] || { ar: a.status, cls: '' };
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono">{a.assetCode}</TableCell>
                          <TableCell className="font-medium">{ar ? a.nameAr : a.nameEn}</TableCell>
                          <TableCell>{a.brand}</TableCell>
                          <TableCell>{a.model}</TableCell>
                          <TableCell><Badge variant="outline">{ar ? (conditionMap[a.condition] || a.condition) : a.condition}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className={aStatus.cls}>{ar ? aStatus.ar : a.status}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <GraduationCap className="w-5 h-5 text-warning" />{ar ? 'مستحقات التدريب' : 'Training Dues'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingDebts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{ar ? 'لا توجد مستحقات تدريب' : 'No training dues'}</p>
              ) : (
                <div className="space-y-6">
                  {trainingDebts.map(t => {
                    const s = statusMap[t.status] || { ar: t.status, cls: '' };
                    const courseName = ar ? t.courseNameAr : t.courseNameEn;
                    const yearsLabel = ar
                      ? `${t.validityYears} ${t.validityYears === 1 ? 'سنة' : t.validityYears <= 10 ? 'سنوات' : 'سنة'}`
                      : `${t.validityYears} year(s)`;

                    return (
                      <Card key={t.id} className="border border-border/50">
                        <CardContent className="p-4 space-y-4">
                          {/* Course info row */}
                          <div className="overflow-x-auto">
                            <Table className="min-w-[450px]">
                              <TableHeader><TableRow>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الدورة' : 'Course'}</TableHead>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'تاريخ البداية' : 'Start'}</TableHead>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'تاريخ النهاية' : 'End'}</TableHead>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'قيمة الدورة' : 'Value'}</TableHead>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'تكاليف الدورة' : 'Costs'}</TableHead>
                                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
                              </TableRow></TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="font-medium">{courseName}</TableCell>
                                  <TableCell>{t.startDate || '—'}</TableCell>
                                  <TableCell>{t.endDate || '—'}</TableCell>
                                  <TableCell>{t.cost ? t.cost.toLocaleString() : '—'}</TableCell>
                                  <TableCell className="font-semibold">{t.totalCost ? t.totalCost.toLocaleString() : '—'}</TableCell>
                                  <TableCell><Badge variant="outline" className={s.cls}>{ar ? s.ar : t.status}</Badge></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          {/* Acknowledgment message */}
                          <div className={cn("bg-muted/50 border border-border rounded-lg p-4", isRTL && "text-right")}>
                            <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                              <FileText className="w-4 h-4 text-primary" />
                              <h4 className="font-bold text-sm text-foreground">{ar ? 'إيصال استلام نقدية' : 'Cash Receipt Acknowledgment'}</h4>
                            </div>
                            <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
                              {ar ? (
                                <>
                                  أقر وأتعهد أنا <strong className="text-foreground">{employeeName}</strong> أنني استلمت مبلغ <strong className="text-primary">{t.totalCost.toLocaleString()}</strong> جنيه وذلك لرغبتي في الحصول على دورة تدريبية <strong className="text-primary">{courseName}</strong> والمقامة في الفترة من <strong>{t.startDate}</strong> وحتى <strong>{t.endDate}</strong> والمقامة في <strong>{t.provider}</strong>

وهذا المبلغ يمثل قيمة مصروفات الدورة المذكورة، وأقر بأنني قد تسلمت المبلغ المذكور من شركة لينك أيرو تريدنج إجنسي على سبيل الأمانة، ومستعد لرده فوراً حين طلب الشركة له وذلك في حالة تركي للعمل بالشركة قبل انقضاء <strong className="text-primary">{yearsLabel}</strong> من تاريخ انتهاء الدورة. وهذا إقرار مني باستلام المبلغ. مع كامل علمي بأحكام القوانين المنظمة لخيانة الأمانة وهذا إقرار مني بذلك.
                                </>
                              ) : (
                                <>
                                  I, <strong className="text-foreground">{employeeName}</strong>, acknowledge that I have received the amount of <strong className="text-primary">{t.totalCost.toLocaleString()}</strong> EGP for the purpose of attending the training course <strong className="text-primary">{courseName}</strong> held from <strong>{t.startDate}</strong> to <strong>{t.endDate}</strong> at <strong>{t.provider}</strong>.

This amount represents the expenses of the aforementioned course. I acknowledge that I have received the said amount from Link Aero Trading Agency in trust, and I am ready to return it immediately upon the company's request, in the event of my leaving the company before the expiration of <strong className="text-primary">{yearsLabel}</strong> from the end date of the course. This is my acknowledgment of receiving the amount, with full knowledge of the laws governing breach of trust.
                                </>
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
