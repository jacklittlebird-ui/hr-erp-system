import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUniformData, getDepreciationPercent, getCurrentValue } from '@/contexts/UniformDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shirt, Info, Hash, Banknote, Coins, FileText } from 'lucide-react';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { supabase } from '@/integrations/supabase/client';

export const PortalUniforms = () => {
  const PORTAL_EMPLOYEE_ID = usePortalEmployee();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { getEmployeeUniforms } = useUniformData();

  const myUniforms = getEmployeeUniforms(PORTAL_EMPLOYEE_ID);

  const totalCurrentValue = myUniforms.reduce((s, u) => s + getCurrentValue(u.totalPrice, u.deliveryDate), 0);
  const totalOriginalValue = myUniforms.reduce((s, u) => s + u.totalPrice, 0);

  const [employeeName, setEmployeeName] = useState('');
  const [ackDates, setAckDates] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!PORTAL_EMPLOYEE_ID) return;

    const fetchName = async () => {
      const { data } = await supabase.from('employees').select('name_ar, name_en').eq('id', PORTAL_EMPLOYEE_ID).single();
      if (data) setEmployeeName(ar ? data.name_ar : data.name_en);
    };

    const fetchAcks = async () => {
      const { data } = await supabase
        .from('uniform_acknowledgments')
        .select('uniform_id, acknowledged_at')
        .eq('employee_id', PORTAL_EMPLOYEE_ID);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((a: any) => { map[a.uniform_id] = a.acknowledged_at; });
        setAckDates(map);
      }
    };

    fetchName();
    fetchAcks();
  }, [PORTAL_EMPLOYEE_ID]);

  const totalValue = myUniforms.reduce((s, u) => s + u.totalPrice, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Shirt className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        {ar ? 'اليونيفورم' : 'Uniforms'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { icon: Hash, label: ar ? 'عدد الأصناف' : 'Items', value: myUniforms.length, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { icon: Banknote, label: ar ? 'القيمة الأصلية' : 'Original Value', value: totalOriginalValue.toLocaleString(), gradient: 'from-slate-500 to-gray-500', bg: 'bg-slate-50 dark:bg-slate-950/40' },
          { icon: Coins, label: ar ? 'القيمة المستحقة الحالية' : 'Current Due', value: totalCurrentValue.toLocaleString(), gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
        ].map((s, i) => (
          <Card key={i} className={`border-0 shadow-sm ${s.bg}`}>
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${s.gradient}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <p className="text-sm flex items-center gap-2 text-amber-700">
            <Info className="w-4 h-4" />
            {ar
              ? 'القيمة المستحقة تتناقص تلقائياً: 75% بعد 3 أشهر، 50% بعد 6 أشهر، 25% بعد 9 أشهر، 0% بعد سنة (يتم إخفاء الصنف).'
              : 'Due value depreciates automatically: 75% after 3 months, 50% after 6, 25% after 9, 0% after 12 months (item hidden).'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ar ? 'أصناف اليونيفورم' : 'Uniform Items'}</CardTitle>
        </CardHeader>
        <CardContent>
          {myUniforms.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {ar ? 'لا توجد أصناف يونيفورم حالياً' : 'No uniform items currently'}
            </p>
          ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{ar ? 'الصنف' : 'Type'}</TableHead>
                  <TableHead>{ar ? 'العدد' : 'Qty'}</TableHead>
                  <TableHead>{ar ? 'القيمة الأصلية' : 'Original'}</TableHead>
                  <TableHead>{ar ? 'القيمة الحالية' : 'Current'}</TableHead>
                  <TableHead>{ar ? 'تاريخ التسليم' : 'Delivery'}</TableHead>
                  <TableHead>{ar ? 'الاستهلاك' : 'Depreciation'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myUniforms.map(u => {
                  const depPct = getDepreciationPercent(u.deliveryDate);
                  const curVal = getCurrentValue(u.totalPrice, u.deliveryDate);
                  const usedPct = 100 - depPct;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{ar ? u.typeAr : u.typeEn}</TableCell>
                      <TableCell>{u.quantity}</TableCell>
                      <TableCell>{u.totalPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-bold text-primary">{curVal.toLocaleString()}</TableCell>
                      <TableCell>{u.deliveryDate}</TableCell>
                      <TableCell>
                        <Badge variant={usedPct >= 75 ? 'destructive' : usedPct >= 50 ? 'secondary' : 'outline'}>
                          {usedPct}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledgment receipt below the table */}
      {myUniforms.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm text-foreground">{ar ? 'إقرار استلام اليونيفورم' : 'Uniform Receipt Acknowledgment'}</h4>
          </div>
          <p className="text-sm leading-7 text-muted-foreground whitespace-pre-wrap">
            {ar ? (
              <>
                أقر أنا الموقع أدناه: <strong className="text-foreground">{employeeName}</strong> بأنني استلمت يونيفورم من الشركة كما هو مدون.
{'\n\n'}كما وأقر بأنني ملتزم بدفع قيمة اليونيفورم للشركة في حالة تركي العمل بالشركة وذلك كالتالي:
{'\n\n'}• في حالة ترك العمل بالشركة قبل مرور ثلاثة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع قيمة اليونيفورم بالكامل.
{'\n'}• في حالة ترك الشركة بعد مرور من ثلاثة إلى ستة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع ثلاثة أرباع قيمة اليونيفورم.
{'\n'}• في حالة ترك الشركة بعد مرور من ستة إلى تسعة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع نصف قيمة اليونيفورم.
{'\n'}• في حالة ترك الشركة بعد مرور من تسعة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع ربع قيمة اليونيفورم.
{'\n'}• في حالة ترك الشركة بعد مرور سنة من تاريخ استلام اليونيفورم يسقط ثمن اليونيفورم بالكامل.
{'\n\n'}وهذا إقرار وتعهد مني بذلك،،،
              </>
            ) : (
              <>
                I, the undersigned <strong className="text-foreground">{employeeName}</strong>, acknowledge that I have received a uniform from the company as listed above.
{'\n\n'}I also acknowledge that I am committed to paying the uniform value to the company if I leave, as follows:
{'\n\n'}• If I leave before 3 months from the delivery date, I pay the full uniform value.
{'\n'}• If I leave after 3 to 6 months, I pay three-quarters of the uniform value.
{'\n'}• If I leave after 6 to 9 months, I pay half the uniform value.
{'\n'}• If I leave after 9 months, I pay one-quarter of the uniform value.
{'\n'}• If I leave after 1 year, the uniform cost is fully waived.
{'\n\n'}This is my acknowledgment and commitment.
              </>
            )}
          </p>
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              {ar ? 'المقر بما فيه:' : 'Acknowledged by:'} <span className="text-primary">{employeeName}</span>
            </p>
            {(() => {
              // Find the earliest ack date among all uniforms
              const dates = myUniforms.map(u => ackDates[u.id]).filter(Boolean);
              if (dates.length > 0) {
                const earliest = dates.sort()[0];
                return (
                  <p className="text-xs text-muted-foreground">
                    {ar ? 'تاريخ الإقرار:' : 'Acknowledgment date:'} {new Date(earliest).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                );
              }
              return (
                <p className="text-xs text-destructive">
                  {ar ? 'لم يتم الإقرار بعد' : 'Not acknowledged yet'}
                </p>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};