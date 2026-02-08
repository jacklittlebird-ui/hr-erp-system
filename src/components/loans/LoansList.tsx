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
import { Search, Plus, Edit, Eye, Trash2, DollarSign, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Loan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  loanType: string;
  amount: number;
  interestRate: number;
  installments: number;
  monthlyPayment: number;
  paidInstallments: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'rejected';
  reason: string;
  approvedBy: string;
  approvalDate: string;
}

const mockLoans: Loan[] = [
  {
    id: 'LN001',
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    department: 'تقنية المعلومات',
    loanType: 'personal',
    amount: 50000,
    interestRate: 0,
    installments: 24,
    monthlyPayment: 2083.33,
    paidInstallments: 12,
    remainingAmount: 25000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    status: 'active',
    reason: 'شراء سيارة',
    approvedBy: 'محمد أحمد',
    approvalDate: '2023-12-20',
  },
  {
    id: 'LN002',
    employeeId: 'EMP002',
    employeeName: 'فاطمة أحمد حسن',
    department: 'الموارد البشرية',
    loanType: 'emergency',
    amount: 10000,
    interestRate: 0,
    installments: 10,
    monthlyPayment: 1000,
    paidInstallments: 10,
    remainingAmount: 0,
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'completed',
    reason: 'ظروف طارئة',
    approvedBy: 'محمد أحمد',
    approvalDate: '2024-02-25',
  },
  {
    id: 'LN003',
    employeeId: 'EMP003',
    employeeName: 'خالد عبدالله محمد',
    department: 'المبيعات',
    loanType: 'housing',
    amount: 100000,
    interestRate: 0,
    installments: 60,
    monthlyPayment: 1666.67,
    paidInstallments: 0,
    remainingAmount: 100000,
    startDate: '2025-02-01',
    endDate: '2030-01-31',
    status: 'pending',
    reason: 'تجهيز منزل',
    approvedBy: '',
    approvalDate: '',
  },
];

const mockEmployees = [
  { id: 'EMP001', name: 'أحمد محمد علي', department: 'تقنية المعلومات' },
  { id: 'EMP002', name: 'فاطمة أحمد حسن', department: 'الموارد البشرية' },
  { id: 'EMP003', name: 'خالد عبدالله محمد', department: 'المبيعات' },
  { id: 'EMP004', name: 'سارة علي أحمد', department: 'المالية' },
];

export const LoansList = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loans, setLoans] = useState<Loan[]>(mockLoans);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    loanType: 'personal',
    amount: '',
    installments: '',
    reason: '',
    startDate: '',
  });

  const loanTypeLabels: Record<string, { en: string; ar: string }> = {
    personal: { en: 'Personal Loan', ar: 'قرض شخصي' },
    housing: { en: 'Housing Loan', ar: 'قرض إسكان' },
    emergency: { en: 'Emergency Loan', ar: 'قرض طوارئ' },
    education: { en: 'Education Loan', ar: 'قرض تعليم' },
    medical: { en: 'Medical Loan', ar: 'قرض علاجي' },
  };

  const statusLabels: Record<string, { en: string; ar: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { en: 'Active', ar: 'نشط', variant: 'default' },
    completed: { en: 'Completed', ar: 'مكتمل', variant: 'secondary' },
    pending: { en: 'Pending', ar: 'قيد الانتظار', variant: 'outline' },
    rejected: { en: 'Rejected', ar: 'مرفوض', variant: 'destructive' },
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (!formData.employeeId || !formData.amount || !formData.installments) {
      toast({ title: t('common.error'), description: t('loans.fillRequired'), variant: 'destructive' });
      return;
    }

    const employee = mockEmployees.find(e => e.id === formData.employeeId);
    const amount = parseFloat(formData.amount);
    const installments = parseInt(formData.installments);

    const newLoan: Loan = {
      id: `LN${String(loans.length + 1).padStart(3, '0')}`,
      employeeId: formData.employeeId,
      employeeName: employee?.name || '',
      department: employee?.department || '',
      loanType: formData.loanType,
      amount,
      interestRate: 0,
      installments,
      monthlyPayment: amount / installments,
      paidInstallments: 0,
      remainingAmount: amount,
      startDate: formData.startDate,
      endDate: '',
      status: 'pending',
      reason: formData.reason,
      approvedBy: '',
      approvalDate: '',
    };

    setLoans([...loans, newLoan]);
    setShowDialog(false);
    setFormData({ employeeId: '', loanType: 'personal', amount: '', installments: '', reason: '', startDate: '' });
    toast({ title: t('common.success'), description: t('loans.loanAdded') });
  };

  const handleApprove = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId 
        ? { ...loan, status: 'active' as const, approvedBy: 'المدير', approvalDate: new Date().toISOString().split('T')[0] }
        : loan
    ));
    toast({ title: t('common.success'), description: t('loans.loanApproved') });
  };

  const handleReject = (loanId: string) => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, status: 'rejected' as const } : loan
    ));
    toast({ title: t('common.success'), description: t('loans.loanRejected') });
  };

  const handleDelete = (loanId: string) => {
    setLoans(loans.filter(loan => loan.id !== loanId));
    toast({ title: t('common.success'), description: t('loans.loanDeleted') });
  };

  const stats = {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === 'active').length,
    pendingLoans: loans.filter(l => l.status === 'pending').length,
    totalAmount: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 bg-stat-purple-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-stat-purple flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('loans.stats.totalLoans')}</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalLoans}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 bg-stat-green-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-stat-green flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('loans.stats.activeLoans')}</p>
            <p className="text-2xl font-bold text-foreground">{stats.activeLoans}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 bg-stat-yellow-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-stat-yellow flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('loans.stats.pendingLoans')}</p>
            <p className="text-2xl font-bold text-foreground">{stats.pendingLoans}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 bg-stat-blue-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-stat-blue flex items-center justify-center shrink-0">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('loans.stats.totalOutstanding')}</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{t('loans.loansList')}</CardTitle>
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
                {t('loans.addLoan')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('loans.loanId')}</TableHead>
                <TableHead>{t('loans.employee')}</TableHead>
                <TableHead>{t('loans.loanType')}</TableHead>
                <TableHead>{t('loans.amount')}</TableHead>
                <TableHead>{t('loans.installments')}</TableHead>
                <TableHead>{t('loans.monthlyPayment')}</TableHead>
                <TableHead>{t('loans.remaining')}</TableHead>
                <TableHead>{t('loans.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{loan.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{loan.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isRTL ? loanTypeLabels[loan.loanType]?.ar : loanTypeLabels[loan.loanType]?.en}
                  </TableCell>
                  <TableCell>{loan.amount.toLocaleString()}</TableCell>
                  <TableCell>{loan.paidInstallments}/{loan.installments}</TableCell>
                  <TableCell>{loan.monthlyPayment.toFixed(2)}</TableCell>
                  <TableCell>{loan.remainingAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[loan.status].variant}>
                      {isRTL ? statusLabels[loan.status].ar : statusLabels[loan.status].en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedLoan(loan); setShowViewDialog(true); }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {loan.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(loan.id)}>
                            <CheckCircle className="h-4 w-4 text-stat-green" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReject(loan.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      {loan.status !== 'active' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(loan.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Loan Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('loans.addLoan')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('loans.employee')}</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('loans.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('loans.loanType')}</Label>
              <Select value={formData.loanType} onValueChange={(value) => setFormData({ ...formData, loanType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(loanTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {isRTL ? label.ar : label.en}
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
              <Label>{t('loans.installmentsCount')}</Label>
              <Input
                type="number"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('loans.startDate')}</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
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

      {/* View Loan Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('loans.loanDetails')}</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">{t('loans.loanId')}</Label>
                <p className="font-medium">{selectedLoan.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.employee')}</Label>
                <p className="font-medium">{selectedLoan.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.loanType')}</Label>
                <p className="font-medium">
                  {isRTL ? loanTypeLabels[selectedLoan.loanType]?.ar : loanTypeLabels[selectedLoan.loanType]?.en}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.amount')}</Label>
                <p className="font-medium">{selectedLoan.amount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.installments')}</Label>
                <p className="font-medium">{selectedLoan.paidInstallments}/{selectedLoan.installments}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.monthlyPayment')}</Label>
                <p className="font-medium">{selectedLoan.monthlyPayment.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.remaining')}</Label>
                <p className="font-medium">{selectedLoan.remainingAmount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('loans.status')}</Label>
                <Badge variant={statusLabels[selectedLoan.status].variant}>
                  {isRTL ? statusLabels[selectedLoan.status].ar : statusLabels[selectedLoan.status].en}
                </Badge>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">{t('loans.reason')}</Label>
                <p className="font-medium">{selectedLoan.reason}</p>
              </div>
              {selectedLoan.approvedBy && (
                <>
                  <div>
                    <Label className="text-muted-foreground">{t('loans.approvedBy')}</Label>
                    <p className="font-medium">{selectedLoan.approvedBy}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('loans.approvalDate')}</Label>
                    <p className="font-medium">{selectedLoan.approvalDate}</p>
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
