import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

interface Violation {
  id: string;
  employeeId: string;
  date: string;
  type: string;
  description: string;
  penalty: string;
  status: 'active' | 'resolved';
}

const violationTypes = [
  { value: 'absence', ar: 'غياب بدون إذن', en: 'Unauthorized Absence' },
  { value: 'late', ar: 'تأخر متكرر', en: 'Repeated Tardiness' },
  { value: 'conduct', ar: 'سلوك غير لائق', en: 'Misconduct' },
  { value: 'safety', ar: 'مخالفة سلامة', en: 'Safety Violation' },
  { value: 'other', ar: 'أخرى', en: 'Other' },
];

interface ViolationsTabProps {
  employee: Employee;
}

export const ViolationsTab = ({ employee }: ViolationsTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { addNotification } = useNotifications();
  const [violations, setViolations] = usePersistedState<Violation[]>('hr_violations', []);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ type: 'absence', description: '', penalty: '', date: new Date().toISOString().split('T')[0] });

  const empViolations = violations.filter(v => v.employeeId === employee.employeeId).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    const newV: Violation = {
      id: `viol_${Date.now()}`,
      employeeId: employee.employeeId,
      ...form,
      status: 'active',
    };
    setViolations(prev => [...prev, newV]);
    addNotification({ titleAr: `مخالفة جديدة للموظف: ${employee.nameAr}`, titleEn: `New violation for: ${employee.nameEn}`, type: 'warning', module: 'employee' });
    toast({ title: ar ? 'تمت الإضافة' : 'Added' });
    setShowDialog(false);
    setForm({ type: 'absence', description: '', penalty: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <AlertTriangle className="w-5 h-5 text-destructive" />
          {ar ? 'المخالفات' : 'Violations'}
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" />
          {ar ? 'إضافة مخالفة' : 'Add Violation'}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-destructive text-destructive-foreground">
              <TableHead className="text-destructive-foreground">{ar ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className="text-destructive-foreground">{ar ? 'النوع' : 'Type'}</TableHead>
              <TableHead className="text-destructive-foreground">{ar ? 'الوصف' : 'Description'}</TableHead>
              <TableHead className="text-destructive-foreground">{ar ? 'العقوبة' : 'Penalty'}</TableHead>
              <TableHead className="text-destructive-foreground">{ar ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empViolations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد مخالفات' : 'No violations'}
                </TableCell>
              </TableRow>
            ) : (
              empViolations.map(v => {
                const typeLabel = violationTypes.find(t => t.value === v.type);
                return (
                  <TableRow key={v.id}>
                    <TableCell>{v.date}</TableCell>
                    <TableCell>{ar ? typeLabel?.ar : typeLabel?.en}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{v.description}</TableCell>
                    <TableCell>{v.penalty}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(v.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'إضافة مخالفة جديدة' : 'Add New Violation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ar ? 'التاريخ' : 'Date'}</Label>
              <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'النوع' : 'Type'}</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {violationTypes.map(t => <SelectItem key={t.value} value={t.value}>{ar ? t.ar : t.en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'الوصف' : 'Description'}</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'العقوبة' : 'Penalty'}</Label>
              <Input value={form.penalty} onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{ar ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleAdd}>{ar ? 'حفظ' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
