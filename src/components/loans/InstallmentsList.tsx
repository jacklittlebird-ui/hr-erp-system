import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Clock, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Installment {
  id: string;
  loanId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue';
}

const mockInstallments: Installment[] = [
  {
    id: 'INS001',
    loanId: 'LN001',
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    department: 'تقنية المعلومات',
    installmentNumber: 12,
    totalInstallments: 24,
    amount: 2083.33,
    dueDate: '2025-01-01',
    paidDate: '2025-01-01',
    status: 'paid',
  },
  {
    id: 'INS002',
    loanId: 'LN001',
    employeeId: 'EMP001',
    employeeName: 'أحمد محمد علي',
    department: 'تقنية المعلومات',
    installmentNumber: 13,
    totalInstallments: 24,
    amount: 2083.33,
    dueDate: '2025-02-01',
    paidDate: null,
    status: 'pending',
  },
  {
    id: 'INS003',
    loanId: 'LN002',
    employeeId: 'EMP002',
    employeeName: 'فاطمة أحمد حسن',
    department: 'الموارد البشرية',
    installmentNumber: 10,
    totalInstallments: 10,
    amount: 1000,
    dueDate: '2024-12-01',
    paidDate: '2024-12-01',
    status: 'paid',
  },
  {
    id: 'INS004',
    loanId: 'LN004',
    employeeId: 'EMP004',
    employeeName: 'سارة علي أحمد',
    department: 'المالية',
    installmentNumber: 3,
    totalInstallments: 12,
    amount: 1500,
    dueDate: '2025-01-15',
    paidDate: null,
    status: 'overdue',
  },
];

export const InstallmentsList = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [installments, setInstallments] = useState<Installment[]>(mockInstallments);

  const statusLabels: Record<string, { en: string; ar: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    paid: { en: 'Paid', ar: 'مدفوع', variant: 'default' },
    pending: { en: 'Pending', ar: 'قيد الانتظار', variant: 'outline' },
    overdue: { en: 'Overdue', ar: 'متأخر', variant: 'destructive' },
  };

  const filteredInstallments = installments.filter(installment => {
    const matchesSearch = installment.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         installment.loanId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || installment.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || installment.dueDate.startsWith(monthFilter);
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handlePayInstallment = (installmentId: string) => {
    setInstallments(installments.map(inst => 
      inst.id === installmentId 
        ? { ...inst, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
        : inst
    ));
    toast({ title: t('common.success'), description: t('loans.installments.paid') });
  };

  const stats = {
    totalInstallments: installments.length,
    paidInstallments: installments.filter(i => i.status === 'paid').length,
    pendingInstallments: installments.filter(i => i.status === 'pending').length,
    overdueInstallments: installments.filter(i => i.status === 'overdue').length,
    totalPaidAmount: installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    totalPendingAmount: installments.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0),
  };

  const months = [
    { value: '2025-01', label: isRTL ? 'يناير 2025' : 'January 2025' },
    { value: '2025-02', label: isRTL ? 'فبراير 2025' : 'February 2025' },
    { value: '2024-12', label: isRTL ? 'ديسمبر 2024' : 'December 2024' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.total')}</p>
                <p className="text-2xl font-bold">{stats.totalInstallments}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.paidCount')}</p>
                <p className="text-2xl font-bold">{stats.paidInstallments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.pendingCount')}</p>
                <p className="text-2xl font-bold">{stats.pendingInstallments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.overdueCount')}</p>
                <p className="text-2xl font-bold">{stats.overdueInstallments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.paidAmount')}</p>
                <p className="text-2xl font-bold">{stats.totalPaidAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('loans.installments.pendingAmount')}</p>
                <p className="text-2xl font-bold">{stats.totalPendingAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>{t('loans.installments.title')}</CardTitle>
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
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('loans.installments.filterMonth')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('loans.loanId')}</TableHead>
                <TableHead>{t('loans.employee')}</TableHead>
                <TableHead>{t('loans.installments.number')}</TableHead>
                <TableHead>{t('loans.amount')}</TableHead>
                <TableHead>{t('loans.installments.dueDate')}</TableHead>
                <TableHead>{t('loans.installments.paidDate')}</TableHead>
                <TableHead>{t('loans.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstallments.map((installment) => (
                <TableRow key={installment.id}>
                  <TableCell className="font-medium">{installment.loanId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{installment.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{installment.department}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {installment.installmentNumber}/{installment.totalInstallments}
                  </TableCell>
                  <TableCell>{installment.amount.toLocaleString()}</TableCell>
                  <TableCell>{installment.dueDate}</TableCell>
                  <TableCell>{installment.paidDate || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusLabels[installment.status].variant}>
                      {isRTL ? statusLabels[installment.status].ar : statusLabels[installment.status].en}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {installment.status !== 'paid' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePayInstallment(installment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('loans.installments.markPaid')}
                      </Button>
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
