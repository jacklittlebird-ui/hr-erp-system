import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Eye, CheckCircle, XCircle, Banknote, TrendingUp, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Advance {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  amount: number;
  requestDate: string;
  deductionMonth: string;
  status: 'pending' | 'approved' | 'rejected' | 'deducted';
  reason: string;
  approvedBy: string;
  approvalDate: string;
}

const mockAdvances: Advance[] = [
  {
    id: 'ADV001',
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    department: 'تقنية المعلومات',
    amount: 3000,
    requestDate: '2025-02-01',
    deductionMonth: '2025-02',
    status: 'approved',
    reason: 'مصاريف طارئة',
    approvedBy: 'محمد أحمد',
    approvalDate: '2025-02-02',
  },
  {
    id: 'ADV002',
    employeeId: 'EMP002',
    employeeName: 'فاطمة أحمد حسن',
    department: 'الموارد البشرية',
    amount: 2000,
    requestDate: '2025-02-03',
    deductionMonth: '2025-02',
    status: 'pending',
    reason: 'احتياجات شخصية',
    approvedBy: '',
    approvalDate: '',
  },
  {
    id: 'ADV003',
    employeeId: 'EMP003',
    employeeName: 'خالد عبدالله محمد',
    department: 'المبيعات',
    amount: 5000,
    requestDate: '2025-01-15',
    deductionMonth: '2025-01',
    status: 'deducted',
    reason: 'مصاريف سفر',
    approvedBy: 'محمد أحمد',
    approvalDate: '2025-01-16',
  },
];

const mockEmployees = [
  { id: 'EMP001', name: 'أحمد محمد علي', department: 'تقنية المعلومات', salary: 15000 },
  { id: 'EMP002', name: 'فاطمة أحمد حسن', department: 'الموارد البشرية', salary: 12000 },
  { id: 'EMP003', name: 'خالد عبدالله محمد', department: 'المبيعات', salary: 10000 },
  { id: 'EMP004', name: 'سارة علي أحمد', department: 'المالية', salary: 13000 },
];

export const AdvancesList = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [advances, setAdvances] = useState<Advance[]>(mockAdvances);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    deductionMonth: '',
    reason: '',
  });

  const statusLabels: Record<string, { en: string; ar: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { en: 'Pending', ar: 'قيد الانتظار', variant: 'outline' },
    approved: { en: 'Approved', ar: 'موافق عليه', variant: 'default' },
    rejected: { en: 'Rejected', ar: 'مرفوض', variant: 'destructive' },
    deducted: { en: 'Deducted', ar: 'تم الخصم', variant: 'secondary' },
  };

  const filteredAdvances = advances.filter(advance => {
    const matchesSearch = advance.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         advance.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || advance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.amount || !formData.deductionMonth) {
      toast({ title: t('common.error'), description: t('loans.fillRequired'), variant: 'destructive' });
      return;
    }

    const employee = mockEmployees.find(e => e.id === formData.employeeId);
    const amount = parseFloat(formData.amount);
    const maxAdvance = (employee?.salary || 0) * 0.5;

    if (amount > maxAdvance) {
      toast({ title: t('common.error'), description: t('loans.advanceExceedsLimit'), variant: 'destructive' });
      return;
    }

    const newAdvance: Advance = {
      id: `ADV${String(advances.length + 1).padStart(3, '0')}`,
      employeeId: formData.employeeId,
      employeeName: employee?.name || '',
      department: employee?.department || '',
      amount,
      requestDate: new Date().toISOString().split('T')[0],
      deductionMonth: formData.deductionMonth,
      status: 'pending',
      reason: formData.reason,
      approvedBy: '',
      approvalDate: '',
    };

    setAdvances([...advances, newAdvance]);
    setShowDialog(false);
    setFormData({ employeeId: '', amount: '', deductionMonth: '', reason: '' });
    toast({ title: t('common.success'), description: t('loans.advanceAdded') });
  };

  const handleApprove = (advanceId: string) => {
    setAdvances(advances.map(advance => 
      advance.id === advanceId 
        ? { ...advance, status: 'approved' as const, approvedBy: 'المدير', approvalDate: new Date().toISOString().split('T')[0] }
        : advance
    ));
    toast({ title: t('common.success'), description: t('loans.advanceApproved') });
  };

  const handleReject = (advanceId: string) => {
    setAdvances(advances.map(advance => 
      advance.id === advanceId ? { ...advance, status: 'rejected' as const } : advance
    ));
    toast({ title: t('common.success'), description: t('loans.advanceRejected') });
  };

  const stats = {
    totalAdvances: advances.length,
    pendingAdvances: advances.filter(a => a.status === 'pending').length,
    approvedAmount: advances.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.amount, 0),
    deductedAmount: advances.filter(a => a.status === 'deducted').reduce((sum, a) => sum + a.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.advances.total')}</p>
                <p className="text-2xl font-bold">{stats.totalAdvances}</p>
              </div>
              <Banknote className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.advances.pending')}</p>
                <p className="text-2xl font-bold">{stats.pendingAdvances}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.advances.approved')}</p>
                <p className="text-2xl font-bold">{stats.approvedAmount.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.advances.deducted')}</p>
                <p className="text-2xl font-bold">{stats.deductedAmount.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{t('loans.advances.title')}</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('loans.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full md:w-64 ${isRTL ? 'pr-9' : 'pl-9'}`}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder={t('loans.filterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {isRTL ? label.ar : label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('loans.advances.add')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('loans.advanceId')}</TableHead>
                <TableHead>{t('loans.employee')}</TableHead>
                <TableHead>{t('loans.amount')}</TableHead>
                <TableHead>{t('loans.advances.requestDate')}</TableHead>
                <TableHead>{t('loans.advances.deductionMonth')}</TableHead>
                <TableHead>{t('loans.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdvances.map((advance) => (
                <TableRow key={advance.id}>
                  <TableCell className="font-medium">{advance.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{advance.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{advance.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>{advance.amount.toLocaleString()}</TableCell>
                  <TableCell>{advance.requestDate}</TableCell>
                  <TableCell>{advance.deductionMonth}</TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[advance.status].variant}>
                      {isRTL ? statusLabels[advance.status].ar : statusLabels[advance.status].en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedAdvance(advance); setShowViewDialog(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {advance.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(advance.id)}>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReject(advance.id)}>
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Advance Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('loans.advances.add')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('loans.employee')}</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('loans.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {t('loans.maxAdvance')}: {(emp.salary * 0.5).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('loans.amount')}</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('loans.advances.deductionMonth')}</Label>
              <Input
                type="month"
                value={formData.deductionMonth}
                onChange={(e) => setFormData({ ...formData, deductionMonth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('loans.reason')}</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Advance Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('loans.advances.details')}</DialogTitle>
          </DialogHeader>
          {selectedAdvance && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">{t('loans.advanceId')}</Label>
                <p className="font-medium">{selectedAdvance.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.employee')}</Label>
                <p className="font-medium">{selectedAdvance.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.amount')}</Label>
                <p className="font-medium">{selectedAdvance.amount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.status')}</Label>
                <Badge variant={statusLabels[selectedAdvance.status].variant}>
                  {isRTL ? statusLabels[selectedAdvance.status].ar : statusLabels[selectedAdvance.status].en}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.advances.requestDate')}</Label>
                <p className="font-medium">{selectedAdvance.requestDate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.advances.deductionMonth')}</Label>
                <p className="font-medium">{selectedAdvance.deductionMonth}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">{t('loans.reason')}</Label>
                <p className="font-medium">{selectedAdvance.reason}</p>
              </div>
              {selectedAdvance.approvedBy && (
                <>
                  <div>
                    <Label className="text-muted-foreground">{t('loans.approvedBy')}</Label>
                    <p className="font-medium">{selectedAdvance.approvedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('loans.approvalDate')}</Label>
                    <p className="font-medium">{selectedAdvance.approvalDate}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
