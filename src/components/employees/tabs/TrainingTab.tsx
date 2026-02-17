import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Employee } from '@/types/employee';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, GraduationCap, Trash2 } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

interface TrainingRecord {
  id: string;
  employeeId: string;
  courseName: string;
  provider: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'planned';
  score?: string;
}

interface TrainingTabProps {
  employee: Employee;
}

export const TrainingTab = ({ employee }: TrainingTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { addNotification } = useNotifications();
  const [records, setRecords] = usePersistedState<TrainingRecord[]>('hr_training_records', []);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ courseName: '', provider: '', startDate: '', endDate: '', status: 'planned' as const, score: '' });

  const empRecords = records.filter(r => r.employeeId === employee.employeeId).sort((a, b) => b.startDate.localeCompare(a.startDate));

  const handleAdd = () => {
    if (!form.courseName.trim()) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'أدخل اسم الدورة' : 'Enter course name', variant: 'destructive' });
      return;
    }
    const newRecord: TrainingRecord = {
      id: `train_${Date.now()}`,
      employeeId: employee.employeeId,
      ...form,
    };
    setRecords(prev => [...prev, newRecord]);
    addNotification({ titleAr: `دورة تدريبية جديدة للموظف: ${employee.nameAr}`, titleEn: `New training for: ${employee.nameEn}`, type: 'info', module: 'training' });
    toast({ title: ar ? 'تمت الإضافة' : 'Added' });
    setShowDialog(false);
    setForm({ courseName: '', provider: '', startDate: '', endDate: '', status: 'planned', score: '' });
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  const statusLabels: Record<string, { ar: string; en: string; color: string }> = {
    completed: { ar: 'مكتمل', en: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
    in_progress: { ar: 'جاري', en: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    planned: { ar: 'مخطط', en: 'Planned', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  };

  return (
    <div className="p-6 space-y-6">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <GraduationCap className="w-5 h-5 text-primary" />
          {ar ? 'التدريب' : 'Training'}
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" />
          {ar ? 'إضافة دورة' : 'Add Course'}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground">{ar ? 'اسم الدورة' : 'Course Name'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الجهة' : 'Provider'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'من' : 'From'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'إلى' : 'To'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'الدرجة' : 'Score'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد دورات تدريبية' : 'No training records'}
                </TableCell>
              </TableRow>
            ) : (
              empRecords.map(r => {
                const sl = statusLabels[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.courseName}</TableCell>
                    <TableCell>{r.provider}</TableCell>
                    <TableCell>{r.startDate}</TableCell>
                    <TableCell>{r.endDate}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-md text-xs font-semibold border", sl?.color)}>
                        {ar ? sl?.ar : sl?.en}
                      </span>
                    </TableCell>
                    <TableCell>{r.score || '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(r.id)}>
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
            <DialogTitle>{ar ? 'إضافة دورة تدريبية' : 'Add Training Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ar ? 'اسم الدورة' : 'Course Name'}</Label>
              <Input value={form.courseName} onChange={e => setForm(p => ({ ...p, courseName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'الجهة المقدمة' : 'Provider'}</Label>
              <Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{ar ? 'من' : 'From'}</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{ar ? 'إلى' : 'To'}</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{ar ? 'الحالة' : 'Status'}</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">{ar ? 'مخطط' : 'Planned'}</SelectItem>
                    <SelectItem value="in_progress">{ar ? 'جاري' : 'In Progress'}</SelectItem>
                    <SelectItem value="completed">{ar ? 'مكتمل' : 'Completed'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{ar ? 'الدرجة' : 'Score'}</Label>
                <Input value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} />
              </div>
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
