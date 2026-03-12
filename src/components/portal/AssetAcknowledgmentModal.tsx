import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { useToast } from '@/hooks/use-toast';

interface PendingAssetAck {
  id: string;
  assetCode: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  category: string;
  purchasePrice: number | null;
}

const categoryMap: Record<string, { ar: string; en: string }> = {
  laptop: { ar: 'لابتوب', en: 'Laptop' },
  desktop: { ar: 'كمبيوتر مكتبي', en: 'Desktop' },
  phone: { ar: 'هاتف', en: 'Phone' },
  printer: { ar: 'طابعة', en: 'Printer' },
  furniture: { ar: 'أثاث', en: 'Furniture' },
  vehicle: { ar: 'مركبة', en: 'Vehicle' },
  other: { ar: 'أخرى', en: 'Other' },
};

export const AssetAcknowledgmentModal = ({ onAllAcknowledged }: { onAllAcknowledged: () => void }) => {
  const employeeId = usePortalEmployee();
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingAssetAck[]>([]);
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    const fetch = async () => {
      setLoading(true);

      // Get assets assigned to employee
      const { data: assets } = await supabase
        .from('assets')
        .select('*')
        .eq('assigned_to', employeeId)
        .eq('status', 'assigned');

      if (!assets || assets.length === 0) {
        setPending([]);
        setLoading(false);
        onAllAcknowledged();
        return;
      }

      // Get existing acknowledgments
      const assetIds = assets.map(a => a.id);
      const { data: acks } = await supabase
        .from('asset_acknowledgments')
        .select('asset_id')
        .eq('employee_id', employeeId)
        .in('asset_id', assetIds);

      const ackedIds = new Set((acks || []).map((a: any) => a.asset_id));
      const unacked = assets.filter(a => !ackedIds.has(a.id));

      if (unacked.length === 0) {
        setPending([]);
        setLoading(false);
        onAllAcknowledged();
        return;
      }

      // Get employee name
      const { data: emp } = await supabase
        .from('employees')
        .select('name_ar, name_en')
        .eq('id', employeeId)
        .single();
      if (emp) setEmployeeName(ar ? emp.name_ar : emp.name_en);

      setPending(unacked.map(a => ({
        id: a.id,
        assetCode: a.asset_code,
        nameAr: a.name_ar,
        nameEn: a.name_en,
        brand: a.brand || '',
        category: a.category || 'other',
        purchasePrice: a.purchase_price,
      })));
      setLoading(false);
    };
    fetch();
  }, [employeeId]);

  const handleAcknowledge = async () => {
    if (!checked || !employeeId || pending.length === 0) return;
    setSubmitting(true);
    const current = pending[0];
    await supabase.from('asset_acknowledgments').insert({
      asset_id: current.id,
      employee_id: employeeId,
    } as any);
    toast({ title: ar ? 'تم الإقرار بنجاح' : 'Acknowledged successfully' });

    const remaining = pending.slice(1);
    if (remaining.length === 0) {
      setPending([]);
      setSubmitting(false);
      onAllAcknowledged();
    } else {
      setPending(remaining);
      setChecked(false);
      setSubmitting(false);
    }
  };

  if (loading || pending.length === 0) return null;

  const current = pending[0];
  const assetName = ar ? current.nameAr : current.nameEn;
  const cat = categoryMap[current.category];
  const catLabel = cat ? (ar ? cat.ar : cat.en) : current.category;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground text-center">
            {ar ? 'إيصال استلام عهدة' : 'Custody Receipt Acknowledgment'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {ar ? `(${pending.length} إقرار متبقي)` : `(${pending.length} pending)`}
          </p>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className={cn("text-sm leading-7 text-foreground whitespace-pre-wrap", isRTL && "text-right")}>
            {ar ? (
              <>
                أقر أنا الموقع أدناه <strong className="text-primary">{employeeName}</strong> أنني تسلمت <strong className="text-primary">{assetName}</strong> فئة <strong className="text-primary">{catLabel}</strong> العلامة التجارية <strong className="text-primary">{current.brand || '—'}</strong> بمبلغ <strong className="text-primary">{current.purchasePrice != null ? current.purchasePrice.toLocaleString() : '—'}</strong> جنيه وذلك كعهدة شخصية من الشركة على سبيل الأمانة، وأتعهد بالمحافظة عليها وتسليمها للشركة متى طُلب مني ذلك.
{'\n\n'}وهذا إقرار مني بالاستلام مع كامل علمي بأحكام القوانين المنظمة لخيانة الأمانة وهذا إقرار مني بذلك.
              </>
            ) : (
              <>
                I, the undersigned <strong className="text-primary">{employeeName}</strong>, acknowledge that I have received <strong className="text-primary">{assetName}</strong> category <strong className="text-primary">{catLabel}</strong> brand <strong className="text-primary">{current.brand || '—'}</strong> valued at <strong className="text-primary">{current.purchasePrice != null ? current.purchasePrice.toLocaleString() : '—'}</strong> EGP as a personal custody from the company in trust, and I pledge to maintain it and return it to the company whenever requested.
{'\n\n'}This is my acknowledgment of receipt, with full knowledge of the laws governing breach of trust.
              </>
            )}
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
