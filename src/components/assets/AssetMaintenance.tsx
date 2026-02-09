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
import { Plus, Search, Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRecord {
  id: string;
  assetCode: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  reportedDate: string;
  completedDate?: string;
  assignedTo: string;
  cost: number;
  description: string;
  resolution?: string;
}

const initialMaintenance: MaintenanceRecord[] = [
  { id: '1', assetCode: 'AST-003', assetName: 'طابعة HP LaserJet', type: 'corrective', priority: 'high', status: 'in-progress', reportedDate: '2026-02-01', assignedTo: 'محمد الفني', cost: 500, description: 'الطابعة لا تعمل بشكل صحيح - انسداد في الحبر' },
  { id: '2', assetCode: 'AST-001', assetName: 'لابتوب Dell Latitude', type: 'preventive', priority: 'low', status: 'completed', reportedDate: '2026-01-15', completedDate: '2026-01-18', assignedTo: 'أحمد الصيانة', cost: 200, description: 'صيانة دورية - تنظيف وتحديث', resolution: 'تم التنظيف وتحديث النظام' },
  { id: '3', assetCode: 'AST-007', assetName: 'سيارة تويوتا كورولا', type: 'preventive', priority: 'medium', status: 'pending', reportedDate: '2026-02-05', assignedTo: 'ورشة الصيانة', cost: 1500, description: 'صيانة دورية - تغيير زيت وفلاتر' },
  { id: '4', assetCode: 'AST-008', assetName: 'جهاز كمبيوتر HP', type: 'emergency', priority: 'critical', status: 'completed', reportedDate: '2026-01-20', completedDate: '2026-01-21', assignedTo: 'أحمد الصيانة', cost: 0, description: 'الجهاز لا يعمل نهائياً', resolution: 'تم تقييم الجهاز - غير قابل للإصلاح ويجب الاستغناء عنه' },
  { id: '5', assetCode: 'AST-002', assetName: 'شاشة Samsung', type: 'corrective', priority: 'medium', status: 'pending', reportedDate: '2026-02-08', assignedTo: 'محمد الفني', cost: 350, description: 'وميض في الشاشة عند التشغيل' },
];

export const AssetMaintenance = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialMaintenance);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    assetCode: '', assetName: '', type: 'corrective' as MaintenanceRecord['type'],
    priority: 'medium' as MaintenanceRecord['priority'], assignedTo: '', cost: 0, description: '',
  });

  const stats = [
    { label: t('assets.maintenance.pending'), value: records.filter(r => r.status === 'pending').length, icon: Clock, bg: 'bg-amber-100', color: 'text-amber-600' },
    { label: t('assets.maintenance.inProgress'), value: records.filter(r => r.status === 'in-progress').length, icon: Wrench, bg: 'bg-blue-100', color: 'text-blue-600' },
    { label: t('assets.maintenance.completedStat'), value: records.filter(r => r.status === 'completed').length, icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600' },
    { label: t('assets.maintenance.totalCost'), value: `${records.reduce((s, r) => s + r.cost, 0).toLocaleString()} ${t('assets.currency')}`, icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
  ];

  const filtered = records.filter(r => {
    const matchSearch = r.assetName.includes(search) || r.assetCode.includes(search) || r.assignedTo.includes(search);
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!form.assetCode || !form.description) {
      toast({ title: t('assets.error'), description: t('assets.fillRequired'), variant: 'destructive' });
      return;
    }
    const newRecord: MaintenanceRecord = { id: String(Date.now()), ...form, status: 'pending', reportedDate: new Date().toISOString().split('T')[0] };
    setRecords(prev => [newRecord, ...prev]);
    toast({ title: t('assets.success'), description: t('assets.maintenance.created') });
    setDialogOpen(false);
    setForm({ assetCode: '', assetName: '', type: 'corrective', priority: 'medium', assignedTo: '', cost: 0, description: '' });
  };

  const handleStatusChange = (id: string, status: MaintenanceRecord['status']) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status, ...(status === 'completed' ? { completedDate: new Date().toISOString().split('T')[0] } : {}) } : r));
    toast({ title: t('assets.success'), description: t('assets.maintenance.statusUpdated') });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: t('assets.maintenance.statusPending') },
      'in-progress': { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100', label: t('assets.maintenance.statusInProgress') },
      completed: { className: 'bg-green-100 text-green-700 hover:bg-green-100', label: t('assets.maintenance.statusCompleted') },
      cancelled: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: t('assets.maintenance.statusCancelled') },
    };
    const s = map[status];
    return s ? <Badge className={s.className}>{s.label}</Badge> : null;
  };

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { className: string; label: string }> = {
      low: { className: 'bg-green-100 text-green-700 hover:bg-green-100', label: t('assets.maintenance.priorityLow') },
      medium: { className: 'bg-amber-100 text-amber-700 hover:bg-amber-100', label: t('assets.maintenance.priorityMedium') },
      high: { className: 'bg-orange-100 text-orange-700 hover:bg-orange-100', label: t('assets.maintenance.priorityHigh') },
      critical: { className: 'bg-red-100 text-red-700 hover:bg-red-100', label: t('assets.maintenance.priorityCritical') },
    };
    const s = map[priority];
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
                <Input placeholder={t('assets.maintenance.search')} value={search} onChange={e => setSearch(e.target.value)} className={cn(isRTL ? "pr-9" : "pl-9")} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('assets.filter.all')}</SelectItem>
                  <SelectItem value="pending">{t('assets.maintenance.statusPending')}</SelectItem>
                  <SelectItem value="in-progress">{t('assets.maintenance.statusInProgress')}</SelectItem>
                  <SelectItem value="completed">{t('assets.maintenance.statusCompleted')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4" />{t('assets.maintenance.addRequest')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{t('assets.maintenance.addRequest')}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{t('assets.field.code')}</Label><Input value={form.assetCode} onChange={e => setForm(f => ({ ...f, assetCode: e.target.value }))} placeholder="AST-XXX" /></div>
                    <div className="space-y-2"><Label>{t('assets.field.name')}</Label><Input value={form.assetName} onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>{t('assets.maintenance.type')}</Label>
                      <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as MaintenanceRecord['type'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">{t('assets.maintenance.typePreventive')}</SelectItem>
                          <SelectItem value="corrective">{t('assets.maintenance.typeCorrective')}</SelectItem>
                          <SelectItem value="emergency">{t('assets.maintenance.typeEmergency')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('assets.maintenance.priority')}</Label>
                      <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as MaintenanceRecord['priority'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('assets.maintenance.priorityLow')}</SelectItem>
                          <SelectItem value="medium">{t('assets.maintenance.priorityMedium')}</SelectItem>
                          <SelectItem value="high">{t('assets.maintenance.priorityHigh')}</SelectItem>
                          <SelectItem value="critical">{t('assets.maintenance.priorityCritical')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>{t('assets.maintenance.cost')}</Label><Input type="number" min={0} value={form.cost} onChange={e => setForm(f => ({ ...f, cost: +e.target.value }))} /></div>
                  </div>
                  <div className="space-y-2"><Label>{t('assets.maintenance.assignedTo')}</Label><Input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>{t('assets.maintenance.description')}</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                  <Button onClick={handleAdd} className="w-full">{t('assets.save')}</Button>
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
                <TableHead>{t('assets.maintenance.type')}</TableHead>
                <TableHead>{t('assets.maintenance.priority')}</TableHead>
                <TableHead>{t('assets.maintenance.reportedDate')}</TableHead>
                <TableHead>{t('assets.maintenance.assignedTo')}</TableHead>
                <TableHead>{t('assets.maintenance.cost')}</TableHead>
                <TableHead>{t('assets.field.status')}</TableHead>
                <TableHead>{t('assets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.assetCode}</TableCell>
                  <TableCell className="font-medium">{record.assetName}</TableCell>
                  <TableCell><Badge variant="outline">{t(`assets.maintenance.type${record.type.charAt(0).toUpperCase() + record.type.slice(1)}`)}</Badge></TableCell>
                  <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                  <TableCell>{record.reportedDate}</TableCell>
                  <TableCell>{record.assignedTo}</TableCell>
                  <TableCell>{record.cost.toLocaleString()} {t('assets.currency')}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    {record.status !== 'completed' && record.status !== 'cancelled' && (
                      <Select value={record.status} onValueChange={v => handleStatusChange(record.id, v as MaintenanceRecord['status'])}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t('assets.maintenance.statusPending')}</SelectItem>
                          <SelectItem value="in-progress">{t('assets.maintenance.statusInProgress')}</SelectItem>
                          <SelectItem value="completed">{t('assets.maintenance.statusCompleted')}</SelectItem>
                          <SelectItem value="cancelled">{t('assets.maintenance.statusCancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
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
