import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, BarChart3, Trash2, Star } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

interface Evaluation {
  id: string;
  employeeId: string;
  date: string;
  quarter: string;
  year: string;
  score: number;
  evaluator: string;
  notes: string;
}

interface EvaluationsTabProps {
  employee: Employee;
}

export const EvaluationsTab = ({ employee }: EvaluationsTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { addNotification } = useNotifications();
  const [evaluations, setEvaluations] = usePersistedState<Evaluation[]>('hr_evaluations', []);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ quarter: 'Q1', year: String(new Date().getFullYear()), score: 0, evaluator: '', notes: '' });

  const empEvals = evaluations
    .filter(e => e.employeeId === employee.employeeId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    const newEval: Evaluation = {
      id: `eval_${Date.now()}`,
      employeeId: employee.employeeId,
      date: new Date().toISOString().split('T')[0],
      ...form,
      score: Number(form.score),
    };
    setEvaluations(prev => [...prev, newEval]);
    addNotification({ titleAr: `تقييم جديد للموظف: ${employee.nameAr}`, titleEn: `New evaluation for: ${employee.nameEn}`, type: 'info', module: 'performance' });
    toast({ title: ar ? 'تمت الإضافة' : 'Added' });
    setShowDialog(false);
    setForm({ quarter: 'Q1', year: String(new Date().getFullYear()), score: 0, evaluator: '', notes: '' });
  };

  const handleDelete = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <BarChart3 className="w-5 h-5 text-primary" />
          {ar ? 'التقييمات' : 'Evaluations'}
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" />
          {ar ? 'إضافة تقييم' : 'Add Evaluation'}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground">{ar ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الربع' : 'Quarter'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'السنة' : 'Year'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الدرجة' : 'Score'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'المقيّم' : 'Evaluator'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'ملاحظات' : 'Notes'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empEvals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد تقييمات' : 'No evaluations'}
                </TableCell>
              </TableRow>
            ) : (
              empEvals.map(ev => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.date}</TableCell>
                  <TableCell>{ev.quarter}</TableCell>
                  <TableCell>{ev.year}</TableCell>
                  <TableCell className={cn("font-bold", getScoreColor(ev.score))}>{ev.score}%</TableCell>
                  <TableCell>{ev.evaluator}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ev.notes}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(ev.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'إضافة تقييم جديد' : 'Add New Evaluation'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{ar ? 'الربع' : 'Quarter'}</Label>
                <Select value={form.quarter} onValueChange={v => setForm(p => ({ ...p, quarter: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{ar ? 'السنة' : 'Year'}</Label>
                <Input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'الدرجة (0-100)' : 'Score (0-100)'}</Label>
              <Input type="number" min={0} max={100} value={form.score} onChange={e => setForm(p => ({ ...p, score: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'المقيّم' : 'Evaluator'}</Label>
              <Input value={form.evaluator} onChange={e => setForm(p => ({ ...p, evaluator: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
