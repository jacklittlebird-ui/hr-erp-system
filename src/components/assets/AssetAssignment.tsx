import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Plus, Search, Undo2, UserCheck, Users, Package, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssetAssignmentRecord {
  id: string;
  assetCode: string;
  assetName: string;
  employeeName: string;
  employeeId: string;
  department: string;
  assignedDate: string;
  returnDate?: string;
  status: 'active' | 'returned' | 'transferred';
  notes: string;
}

const initialAssignments: AssetAssignmentRecord[] = [
  { id: '1', assetCode: 'AST-001', assetName: 'لابتوب Dell Latitude', employeeName: 'أحمد محمد علي', employeeId: 'EMP-001', department: 'تقنية المعلومات', assignedDate: '2025-07-01', status: 'active', notes: '' },
  { id: '2', assetCode: 'AST-004', assetName: 'هاتف iPhone 15', employeeName: 'محمد خالد حسن', employeeId: 'EMP-003', department: 'المالية', assignedDate: '2025-09-15', status: 'active', notes: 'هاتف عمل' },
  { id: '3', assetCode: 'AST-005', assetName: 'مكتب خشبي', employeeName: 'سارة أحمد', employeeId: 'EMP-005', department: 'الموارد البشرية', assignedDate: '2024-08-01', status: 'active', notes: '' },
  { id: '4', assetCode: 'AST-007', assetName: 'سيارة تويوتا كورولا', employeeName: 'خالد محمود', employeeId: 'EMP-002', department: 'العمليات', assignedDate: '2025-05-01', status: 'active', notes: 'سيارة الإدارة' },
  { id: '5', assetCode: 'AST-009', assetName: 'لابتوب HP ProBook', employeeName: 'نورا محمد', employeeId: 'EMP-008', department: 'التسويق', assignedDate: '2025-01-10', returnDate: '2026-01-15', status: 'returned', notes: 'تم الإرجاع بحالة جيدة' },
  { id: '6', assetCode: 'AST-010', assetName: 'شاشة LG 24"', employeeName: 'علي حسن', employeeId: 'EMP-004', department: 'تقنية المعلومات', assignedDate: '2025-03-01', returnDate: '2025-11-20', status: 'transferred', notes: 'تم النقل لقسم المالية' },
];

export const AssetAssignment = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<AssetAssignmentRecord[]>(initialAssignments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ assetCode: '', assetName: '', employeeName: '', employeeId: '', department: '', notes: '' });

  const stats = [
    { label: t('assets.assignment.totalAssigned'), value: assignments.filter(a => a.status === 'active').length, icon: UserCheck, bg: 'bg-primary/10', color: 'text-primary' },
    { label: t('assets.assignment.returned'), value: assignments.filter(a => a.status === 'returned').length, icon: Undo2, bg: 'bg-green-100', color: 'text-green-600' },
    { label: t('assets.assignment.transferred'), value: assignments.filter(a => a.status === 'transferred').length, icon: ArrowRightLeft, bg: 'bg-blue-100', color: 'text-blue-600' },
    { label: t('assets.assignment.totalRecords'), value: assignments.length, icon: Package, bg: 'bg-amber-100', color: 'text-amber-600' },
  ];

  const filtered = assignments.filter(a => {
    const matchSearch = a.assetName.includes(search) || a.employeeName.includes(search) || a.assetCode.includes(search);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAssign = () => {
    if (!form.assetCode || !form.employeeName) {
      toast({ title: t('assets.error'), description: t('assets.fillRequired'), variant: 'destructive' });
      return;
    }
    const newAssignment: AssetAssignmentRecord = {
      id: String(Date.now()), ...form, assignedDate: new Date().toISOString().split('T')[0], status: 'active',
    };
    setAssignments(prev => [newAssignment, ...prev]);
    toast({ title: t('assets.success'), description: t('assets.assignment.assigned') });
    setDialogOpen(false);
    setForm({ assetCode: '', assetName: '', employeeName: '', employeeId: '', department: '', notes: '' });
  };

  const handleReturn = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] } : a));
    toast({ title: t('assets.success'), description: t('assets.assignment.returnSuccess') });
  };

  const handleTransfer = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'transferred' as const, returnDate: new Date().toISOString().split('T')[0] } : a));
    toast({ title: t('assets.success'), description: t('assets.assignment.transferSuccess') });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      active: { className: 'bg-green-100 text-green-700 hover:bg-green-100', label: t('assets.assignment.active') },
      returned: { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100', label: t('assets.assignment.returnedStatus') },
      transferred: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: t('assets.assignment.transferredStatus') },
    };
    const s = map[status];
    return s ? <Badge className={s.className}>{s.label}</Badge> : null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className={cn("p-2.5 rounded-lg", stat.bg)}><stat.icon className={cn("w-5 h-5", stat.color)} /></div>
                <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-3 items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex gap-3 flex-1", isRTL && "flex-row-reverse")}>
              <div className="relative flex-1 max-w-sm">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input placeholder={t('assets.assignment.search')} value={search} onChange={e => setSearch(e.target.value)} className={cn(isRTL ? "pr-9" : "pl-9")} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('assets.filter.all')}</SelectItem>
                  <SelectItem value="active">{t('assets.assignment.active')}</SelectItem>
                  <SelectItem value="returned">{t('assets.assignment.returnedStatus')}</SelectItem>
                  <SelectItem value="transferred">{t('assets.assignment.transferredStatus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4" />{t('assets.assignment.assignNew')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{t('assets.assignment.assignNew')}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('assets.field.code')}</Label><Input value={form.assetCode} onChange={e => setForm(f => ({ ...f, assetCode: e.target.value }))} placeholder="AST-XXX" /></div>
                    <div className="space-y-2"><Label>{t('assets.field.name')}</Label><Input value={form.assetName} onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('assets.assignment.employee')}</Label><Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>{t('assets.assignment.employeeId')}</Label><Input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="EMP-XXX" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('assets.field.department')}</Label>
                    <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                      <SelectTrigger><SelectValue placeholder={t('assets.field.selectDept')} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="تقنية المعلومات">{t('dept.it')}</SelectItem>
                        <SelectItem value="الموارد البشرية">{t('dept.hr')}</SelectItem>
                        <SelectItem value="المالية">{t('dept.finance')}</SelectItem>
                        <SelectItem value="التسويق">{t('dept.marketing')}</SelectItem>
                        <SelectItem value="العمليات">{t('dept.operations')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>{t('assets.field.notes')}</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                  <Button onClick={handleAssign} className="w-full">{t('assets.assignment.assign')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('assets.field.code')}</TableHead>
                <TableHead>{t('assets.field.name')}</TableHead>
                <TableHead>{t('assets.assignment.employee')}</TableHead>
                <TableHead>{t('assets.field.department')}</TableHead>
                <TableHead>{t('assets.assignment.assignedDate')}</TableHead>
                <TableHead>{t('assets.assignment.returnDateCol')}</TableHead>
                <TableHead>{t('assets.field.status')}</TableHead>
                <TableHead>{t('assets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.assetCode}</TableCell>
                  <TableCell className="font-medium">{record.assetName}</TableCell>
                  <TableCell>
                    <div><p className="font-medium">{record.employeeName}</p><p className="text-xs text-muted-foreground">{record.employeeId}</p></div>
                  </TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>{record.assignedDate}</TableCell>
                  <TableCell>{record.returnDate || '-'}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    {record.status === 'active' && (
                      <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                        <Button variant="outline" size="sm" onClick={() => handleReturn(record.id)}>
                          <Undo2 className="w-3 h-3" />{t('assets.assignment.return')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTransfer(record.id)}>
                          <ArrowRightLeft className="w-3 h-3" />{t('assets.assignment.transfer')}
                        </Button>
                      </div>
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
