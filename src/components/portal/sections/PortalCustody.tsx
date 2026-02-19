import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Package, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { toast } from '@/hooks/use-toast';

interface CustodyItem {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  assignDate: string;
  status: 'in-custody' | 'returned' | 'maintenance';
  condition: string;
  notes: string;
}

const initialItems: CustodyItem[] = [
  { id: 1, nameAr: 'لابتوب Dell XPS', nameEn: 'Dell XPS Laptop', code: 'AST-001', assignDate: '2023-02-01', status: 'in-custody', condition: 'good', notes: '' },
  { id: 2, nameAr: 'هاتف iPhone 15', nameEn: 'iPhone 15', code: 'AST-045', assignDate: '2024-06-15', status: 'in-custody', condition: 'good', notes: '' },
  { id: 3, nameAr: 'بطاقة دخول', nameEn: 'Access Card', code: 'AST-102', assignDate: '2023-01-15', status: 'in-custody', condition: 'good', notes: '' },
  { id: 4, nameAr: 'جهاز لاسلكي', nameEn: 'Walkie-Talkie', code: 'AST-200', assignDate: '2024-01-10', status: 'returned', condition: 'fair', notes: '' },
];

export const PortalCustody = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [items, setItems] = usePersistedState<CustodyItem[]>('hr_portal_custody', initialItems);
  const [isOpen, setIsOpen] = useState(false);
  const [reportItem, setReportItem] = useState<CustodyItem | null>(null);
  const [reportNote, setReportNote] = useState('');

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'in-custody': { label: ar ? 'بحوزتي' : 'In Custody', className: 'bg-primary/10 text-primary border-primary' },
      'returned': { label: ar ? 'تم الإرجاع' : 'Returned', className: 'bg-muted text-muted-foreground' },
      'maintenance': { label: ar ? 'صيانة' : 'Maintenance', className: 'bg-warning/10 text-warning border-warning' },
    };
    const c = config[status] || config['in-custody'];
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
  };

  const inCustody = items.filter(i => i.status === 'in-custody').length;
  const returned = items.filter(i => i.status === 'returned').length;
  const maintenance = items.filter(i => i.status === 'maintenance').length;

  const handleReportIssue = () => {
    if (!reportItem || !reportNote.trim()) {
      toast({ title: ar ? 'خطأ' : 'Error', description: ar ? 'يرجى كتابة وصف المشكلة' : 'Please describe the issue', variant: 'destructive' });
      return;
    }
    setItems(prev => prev.map(i => i.id === reportItem.id ? { ...i, status: 'maintenance' as const, notes: reportNote } : i));
    toast({ title: ar ? 'تم الإبلاغ' : 'Reported', description: ar ? 'تم إرسال بلاغ الصيانة بنجاح' : 'Maintenance report submitted' });
    setReportItem(null);
    setReportNote('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'العهد والممتلكات' : 'Custody & Assets'}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{inCustody}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'بحوزتي' : 'In Custody'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Package className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{returned}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'تم إرجاعها' : 'Returned'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold">{maintenance}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'صيانة' : 'Maintenance'}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Package className="w-5 h-5" />{ar ? 'العهد المسلمة' : 'Assigned Items'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الكود' : 'Code'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الاسم' : 'Name'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'تاريخ التسليم' : 'Assigned'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إجراء' : 'Action'}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map(i => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono">{i.code}</TableCell>
                  <TableCell>{ar ? i.nameAr : i.nameEn}</TableCell>
                  <TableCell>{i.assignDate}</TableCell>
                  <TableCell>{statusBadge(i.status)}</TableCell>
                  <TableCell>
                    {i.status === 'in-custody' && (
                      <Dialog open={isOpen && reportItem?.id === i.id} onOpenChange={(o) => { setIsOpen(o); if (o) setReportItem(i); }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {ar ? 'إبلاغ' : 'Report'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>{ar ? 'إبلاغ عن مشكلة' : 'Report Issue'}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">{ar ? i.nameAr : i.nameEn} ({i.code})</p>
                            <div className="space-y-2">
                              <Label>{ar ? 'وصف المشكلة' : 'Issue Description'}</Label>
                              <Textarea value={reportNote} onChange={e => setReportNote(e.target.value)} placeholder={ar ? 'صف المشكلة...' : 'Describe the issue...'} />
                            </div>
                            <Button onClick={handleReportIssue} className="w-full">{ar ? 'إرسال البلاغ' : 'Submit Report'}</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
