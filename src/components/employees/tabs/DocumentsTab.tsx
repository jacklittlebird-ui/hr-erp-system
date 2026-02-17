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
import { Plus, FileText, Trash2 } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

interface Document {
  id: string;
  employeeId: string;
  name: string;
  type: string;
  date: string;
  expiryDate?: string;
  notes?: string;
}

const docTypes = [
  { value: 'contract', ar: 'عقد عمل', en: 'Employment Contract' },
  { value: 'certificate', ar: 'شهادة', en: 'Certificate' },
  { value: 'id_copy', ar: 'صورة بطاقة', en: 'ID Copy' },
  { value: 'insurance', ar: 'مستند تأمين', en: 'Insurance Document' },
  { value: 'letter', ar: 'خطاب', en: 'Letter' },
  { value: 'other', ar: 'أخرى', en: 'Other' },
];

interface DocumentsTabProps {
  employee: Employee;
}

export const DocumentsTab = ({ employee }: DocumentsTabProps) => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { addNotification } = useNotifications();
  const [documents, setDocuments] = usePersistedState<Document[]>('hr_documents', []);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'contract', date: new Date().toISOString().split('T')[0], expiryDate: '', notes: '' });

  const empDocs = documents.filter(d => d.employeeId === employee.employeeId).sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'أدخل اسم المستند' : 'Enter document name', variant: 'destructive' });
      return;
    }
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      employeeId: employee.employeeId,
      ...form,
    };
    setDocuments(prev => [...prev, newDoc]);
    addNotification({ titleAr: `مستند جديد للموظف: ${employee.nameAr}`, titleEn: `New document for: ${employee.nameEn}`, type: 'info', module: 'employee' });
    toast({ title: ar ? 'تمت الإضافة' : 'Added' });
    setShowDialog(false);
    setForm({ name: '', type: 'contract', date: new Date().toISOString().split('T')[0], expiryDate: '', notes: '' });
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <h3 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <FileText className="w-5 h-5 text-primary" />
          {ar ? 'المستندات' : 'Documents'}
        </h3>
        <Button size="sm" className="gap-2" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4" />
          {ar ? 'إضافة مستند' : 'Add Document'}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-primary-foreground">
              <TableHead className="text-primary-foreground">{ar ? 'اسم المستند' : 'Document Name'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'النوع' : 'Type'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'تاريخ الانتهاء' : 'Expiry'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'ملاحظات' : 'Notes'}</TableHead>
              <TableHead className="text-primary-foreground">{ar ? 'إجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {ar ? 'لا توجد مستندات' : 'No documents'}
                </TableCell>
              </TableRow>
            ) : (
              empDocs.map(doc => {
                const typeLabel = docTypes.find(t => t.value === doc.type);
                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{ar ? typeLabel?.ar : typeLabel?.en}</TableCell>
                    <TableCell>{doc.date}</TableCell>
                    <TableCell>{doc.expiryDate || '-'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{doc.notes || '-'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(doc.id)}>
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
            <DialogTitle>{ar ? 'إضافة مستند جديد' : 'Add New Document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ar ? 'اسم المستند' : 'Document Name'}</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'النوع' : 'Type'}</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {docTypes.map(t => <SelectItem key={t.value} value={t.value}>{ar ? t.ar : t.en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{ar ? 'التاريخ' : 'Date'}</Label>
                <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{ar ? 'تاريخ الانتهاء' : 'Expiry Date'}</Label>
                <Input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'ملاحظات' : 'Notes'}</Label>
              <Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
