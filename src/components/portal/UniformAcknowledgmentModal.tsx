import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { useToast } from '@/hooks/use-toast';

interface PendingUniformAck {
  id: string;
  typeAr: string;
  typeEn: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: string;
}

export const UniformAcknowledgmentModal = ({ onAllAcknowledged }: { onAllAcknowledged: () => void }) => {
  const employeeId = usePortalEmployee();
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingUniformAck[]>([]);
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    const fetchData = async () => {
      setLoading(true);

      const { data: uniforms } = await supabase
        .from('uniforms')
        .select('*')
        .eq('employee_id', employeeId);

      if (!uniforms || uniforms.length === 0) {
        setPending([]);
        setLoading(false);
        onAllAcknowledged();
        return;
      }

      const uniformIds = uniforms.map(u => u.id);
      const { data: acks } = await supabase
        .from('uniform_acknowledgments')
        .select('uniform_id')
        .eq('employee_id', employeeId)
        .in('uniform_id', uniformIds);

      const ackedIds = new Set((acks || []).map((a: any) => a.uniform_id));
      const unacked = uniforms.filter(u => !ackedIds.has(u.id));

      if (unacked.length === 0) {
        setPending([]);
        setLoading(false);
        onAllAcknowledged();
        return;
      }

      const { data: emp } = await supabase
        .from('employees')
        .select('name_ar, name_en')
        .eq('id', employeeId)
        .single();
      if (emp) setEmployeeName(ar ? emp.name_ar : emp.name_en);

      setPending(unacked.map(u => ({
        id: u.id,
        typeAr: u.type_ar,
        typeEn: u.type_en,
        quantity: u.quantity,
        unitPrice: u.unit_price || 0,
        totalPrice: u.total_price || 0,
        deliveryDate: u.delivery_date,
      })));
      setLoading(false);
    };
    fetchData();
  }, [employeeId]);

  const handleAcknowledge = async () => {
    if (!checked || !employeeId || pending.length === 0) return;
    setSubmitting(true);
    // Acknowledge all pending uniforms at once
    const inserts = pending.map(p => ({
      uniform_id: p.id,
      employee_id: employeeId,
    }));
    await supabase.from('uniform_acknowledgments').insert(inserts as any);
    toast({ title: ar ? 'تم الإقرار بنجاح' : 'Acknowledged successfully' });
    setPending([]);
    setSubmitting(false);
    onAllAcknowledged();
  };

  if (loading || pending.length === 0) return null;

  const totalValue = pending.reduce((s, u) => s + u.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground text-center">
            {ar ? 'إقرار استلام اليونيفورم' : 'Uniform Receipt Acknowledgment'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {ar ? `(${pending.length} صنف)` : `(${pending.length} item(s))`}
          </p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className={cn("space-y-5 text-sm leading-7 text-foreground", isRTL && "text-right")}>
            {/* Opening statement */}
            <p>
              {ar ? (
                <>أقر أنا الموقع أدناه: <strong className="text-primary">{employeeName}</strong> بأنني استلمت يونيفورم من الشركة كما هو مدون:</>
              ) : (
                <>I, the undersigned <strong className="text-primary">{employeeName}</strong>, acknowledge that I have received a uniform from the company as listed below:</>
              )}
            </p>

            {/* Uniform items table */}
            <div className="overflow-x-auto">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar ? 'الصنف' : 'Item'}</TableHead>
                    <TableHead>{ar ? 'الكمية' : 'Qty'}</TableHead>
                    <TableHead>{ar ? 'سعر الوحدة' : 'Unit Price'}</TableHead>
                    <TableHead>{ar ? 'الإجمالي' : 'Total'}</TableHead>
                    <TableHead>{ar ? 'تاريخ التسليم' : 'Delivery Date'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{ar ? u.typeAr : u.typeEn}</TableCell>
                      <TableCell>{u.quantity}</TableCell>
                      <TableCell>{u.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">{u.totalPrice.toLocaleString()}</TableCell>
                      <TableCell>{u.deliveryDate}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>{ar ? 'الإجمالي الكلي' : 'Grand Total'}</TableCell>
                    <TableCell className="text-primary">{totalValue.toLocaleString()}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Terms */}
            <div className="whitespace-pre-wrap text-muted-foreground">
              {ar ? (
                <>
كما وأقر بأنني ملتزم بدفع قيمة اليونيفورم للشركة في حالة تركي العمل بالشركة وذلك كالتالي:

• في حالة ترك العمل بالشركة قبل مرور ثلاثة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع قيمة اليونيفورم بالكامل.

• في حالة ترك الشركة بعد مرور من ثلاثة إلى ستة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع ثلاثة أرباع قيمة اليونيفورم.

• في حالة ترك الشركة بعد مرور من ستة إلى تسعة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع نصف قيمة اليونيفورم.

• في حالة ترك الشركة بعد مرور من تسعة أشهر من تاريخ استلام اليونيفورم ألتزم بدفع ربع قيمة اليونيفورم.

• في حالة ترك الشركة بعد مرور سنة من تاريخ استلام اليونيفورم يسقط ثمن اليونيفورم بالكامل.

وهذا إقرار وتعهد مني بذلك،،،
                </>
              ) : (
                <>
I also acknowledge that I am committed to paying the uniform value to the company if I leave work, as follows:

• If I leave before 3 months from the delivery date, I pay the full uniform value.

• If I leave after 3 to 6 months, I pay three-quarters of the uniform value.

• If I leave after 6 to 9 months, I pay half the uniform value.

• If I leave after 9 months, I pay one-quarter of the uniform value.

• If I leave after 1 year, the uniform cost is fully waived.

This is my acknowledgment and commitment.
                </>
              )}
            </div>

            {/* Signature */}
            <div className="pt-3 border-t border-border/50 flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">
                {ar ? 'المقر بما فيه:' : 'Acknowledged by:'} <span className="text-primary">{employeeName}</span>
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-border space-y-4">
          <label className={cn("flex items-center gap-3 cursor-pointer", isRTL && "flex-row-reverse")}>
            <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
            <span className="text-sm font-medium text-foreground">
              {ar ? 'أقر بذلك' : 'I acknowledge this'}
            </span>
          </label>
          <Button
            className="w-full"
            size="lg"
            disabled={!checked || submitting}
            onClick={handleAcknowledge}
          >
            {submitting ? (ar ? 'جاري الإرسال...' : 'Submitting...') : (ar ? 'موافق' : 'Confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};
