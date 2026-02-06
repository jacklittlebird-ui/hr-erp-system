import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Plus, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AllowanceType {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'allowance' | 'deduction';
  calculation: 'fixed' | 'percentage';
  defaultValue: number;
  isActive: boolean;
  isTaxable: boolean;
  appliesTo: string;
}

export const AllowancesDeductions = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'allowances' | 'deductions'>('allowances');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [items] = useState<AllowanceType[]>([
    { id: '1', nameAr: 'بدل السكن', nameEn: 'Housing Allowance', type: 'allowance', calculation: 'percentage', defaultValue: 25, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '2', nameAr: 'بدل المواصلات', nameEn: 'Transport Allowance', type: 'allowance', calculation: 'fixed', defaultValue: 500, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '3', nameAr: 'بدل الوجبات', nameEn: 'Meal Allowance', type: 'allowance', calculation: 'fixed', defaultValue: 300, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '4', nameAr: 'بدل الهاتف', nameEn: 'Phone Allowance', type: 'allowance', calculation: 'fixed', defaultValue: 200, isActive: true, isTaxable: true, appliesTo: 'managers' },
    { id: '5', nameAr: 'بدل طبيعة عمل', nameEn: 'Nature of Work Allowance', type: 'allowance', calculation: 'percentage', defaultValue: 15, isActive: true, isTaxable: true, appliesTo: 'field' },
    { id: '6', nameAr: 'التأمين الاجتماعي', nameEn: 'Social Insurance', type: 'deduction', calculation: 'percentage', defaultValue: 11, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '7', nameAr: 'ضريبة الدخل', nameEn: 'Income Tax', type: 'deduction', calculation: 'percentage', defaultValue: 10, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '8', nameAr: 'التأمين الصحي', nameEn: 'Health Insurance', type: 'deduction', calculation: 'fixed', defaultValue: 250, isActive: true, isTaxable: false, appliesTo: 'all' },
    { id: '9', nameAr: 'صندوق التوفير', nameEn: 'Savings Fund', type: 'deduction', calculation: 'percentage', defaultValue: 5, isActive: false, isTaxable: false, appliesTo: 'optional' },
    { id: '10', nameAr: 'خصم الغياب', nameEn: 'Absence Deduction', type: 'deduction', calculation: 'fixed', defaultValue: 0, isActive: true, isTaxable: false, appliesTo: 'variable' },
  ]);

  const filtered = items.filter(i => i.type === (activeView === 'allowances' ? 'allowance' : 'deduction'));

  const handleAdd = () => {
    toast({ title: t('common.success'), description: t('salaries.itemAdded') });
    setShowAddDialog(false);
  };

  const appliesToLabels: Record<string, string> = {
    all: t('salaries.appliesAll'),
    managers: t('salaries.appliesManagers'),
    field: t('salaries.appliesField'),
    optional: t('salaries.appliesOptional'),
    variable: t('salaries.appliesVariable'),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={cn("cursor-pointer transition-all", activeView === 'allowances' && "ring-2 ring-primary")}
          onClick={() => setActiveView('allowances')}
        >
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaries.allowancesTypes')}</p>
                <p className="text-2xl font-bold">{items.filter(i => i.type === 'allowance').length}</p>
                <p className="text-xs text-green-600">
                  {items.filter(i => i.type === 'allowance' && i.isActive).length} {t('salaries.activeItems')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn("cursor-pointer transition-all", activeView === 'deductions' && "ring-2 ring-primary")}
          onClick={() => setActiveView('deductions')}
        >
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-red-100">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaries.deductionsTypes')}</p>
                <p className="text-2xl font-bold">{items.filter(i => i.type === 'deduction').length}</p>
                <p className="text-xs text-destructive">
                  {items.filter(i => i.type === 'deduction' && i.isActive).length} {t('salaries.activeItems')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle>
              {activeView === 'allowances' ? t('salaries.allowancesTypes') : t('salaries.deductionsTypes')}
            </CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('salaries.addItem')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className={cn(isRTL && "text-right")}>
                    {activeView === 'allowances' ? t('salaries.addAllowance') : t('salaries.addDeduction')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('salaries.nameAr')}</Label>
                      <Input className={cn(isRTL && "text-right")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.nameEn')}</Label>
                      <Input />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('salaries.calculationType')}</Label>
                      <Select defaultValue="fixed">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">{t('salaries.fixedAmount')}</SelectItem>
                          <SelectItem value="percentage">{t('salaries.percentageOfBasic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.defaultValue')}</Label>
                      <Input type="number" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('salaries.appliesTo')}</Label>
                    <Select defaultValue="all">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('salaries.appliesAll')}</SelectItem>
                        <SelectItem value="managers">{t('salaries.appliesManagers')}</SelectItem>
                        <SelectItem value="field">{t('salaries.appliesField')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <Switch defaultChecked />
                    <Label>{t('salaries.isTaxable')}</Label>
                  </div>
                  <Button onClick={handleAdd} className="w-full">{t('common.save')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.itemName')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.calculationType')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.defaultValue')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.appliesTo')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.taxable')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.statusLabel')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className={cn("font-medium", isRTL && "text-right")}>
                    {isRTL ? item.nameAr : item.nameEn}
                  </TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>
                    <Badge variant="outline">
                      {item.calculation === 'fixed' ? t('salaries.fixedAmount') : t('salaries.percentageOfBasic')}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>
                    {item.calculation === 'percentage' ? `${item.defaultValue}%` : item.defaultValue.toLocaleString()}
                  </TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{appliesToLabels[item.appliesTo]}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>
                    {item.isTaxable ? t('salaries.yes') : t('salaries.no')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? t('salaries.active') : t('salaries.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
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
