import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { useUniformData, UNIFORM_TYPES, getDepreciationPercent, getCurrentValue } from '@/contexts/UniformDataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus, Trash2, Shirt, Users, TrendingUp, Package, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Uniforms = () => {
  const { language, isRTL, t } = useLanguage();
  const { employees } = useEmployeeData();
  const { uniforms, addUniform, deleteUniform } = useUniformData();

  const [employeeId, setEmployeeId] = useState('');
  const [empOpen, setEmpOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ typeIndex: string; quantity: number; unitPrice: number }[]>([
    { typeIndex: '', quantity: 1, unitPrice: 0 },
  ]);

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);
  const selectedEmployee = activeEmployees.find(e => e.employeeId === employeeId);

  const addRow = () => setItems(prev => [...prev, { typeIndex: '', quantity: 1, unitPrice: 0 }]);
  const removeRow = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row));
  };

  const grandTotal = items.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0);

  const handleSave = () => {
    if (!employeeId || !deliveryDate) {
      toast.error(language === 'ar' ? 'يرجى اختيار الموظف وتاريخ التسليم' : 'Please select employee and delivery date');
      return;
    }
    const validItems = items.filter(r => r.typeIndex !== '' && r.quantity > 0 && r.unitPrice > 0);
    if (validItems.length === 0) {
      toast.error(language === 'ar' ? 'يرجى إضافة صنف واحد على الأقل' : 'Please add at least one item');
      return;
    }
    validItems.forEach(r => {
      const uType = UNIFORM_TYPES[parseInt(r.typeIndex)];
      addUniform({
        employeeId,
        typeAr: uType.ar,
        typeEn: uType.en,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        totalPrice: r.quantity * r.unitPrice,
        deliveryDate,
        notes,
      });
    });
    toast.success(language === 'ar' ? 'تم حفظ اليونيفورم بنجاح' : 'Uniform saved successfully');
    handleReset();
  };

  const handleReset = () => {
    setEmployeeId('');
    setDeliveryDate('');
    setNotes('');
    setItems([{ typeIndex: '', quantity: 1, unitPrice: 0 }]);
  };

  // Stats
  const totalItems = uniforms.length;
  const totalEmployees = new Set(uniforms.map(u => u.employeeId)).size;
  const totalOriginalValue = uniforms.reduce((s, u) => s + u.totalPrice, 0);
  const totalCurrentValue = uniforms.reduce((s, u) => s + getCurrentValue(u.totalPrice, u.deliveryDate), 0);

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isRTL && "text-right")}>
        {/* Header */}
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <h1 className={cn("text-2xl font-bold flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Shirt className="w-7 h-7 text-primary" />
            {language === 'ar' ? 'إدارة يونيفورم الموظفين' : 'Employee Uniform Management'}
          </h1>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-1.5">
            <RefreshCw className="w-4 h-4" />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: language === 'ar' ? 'إجمالي الأصناف' : 'Total Items', value: totalItems, icon: Package, color: 'text-blue-600 bg-blue-100' },
            { label: language === 'ar' ? 'عدد الموظفين' : 'Employees', value: totalEmployees, icon: Users, color: 'text-green-600 bg-green-100' },
            { label: language === 'ar' ? 'القيمة الإجمالية' : 'Total Value', value: totalOriginalValue.toLocaleString(), icon: TrendingUp, color: 'text-amber-600 bg-amber-100' },
            { label: language === 'ar' ? 'القيمة الحالية' : 'Current Value', value: totalCurrentValue.toLocaleString(), icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", s.color)}>
                    <s.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Depreciation info */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className={cn("font-bold flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
              <Info className="w-5 h-5 text-amber-600" />
              {language === 'ar' ? 'نظام حساب الاستهلاك التلقائي' : 'Auto Depreciation System'}
            </h3>
            <ul className={cn("space-y-1 text-sm", isRTL && "text-right")}>
              {[
                { ar: 'بعد 3 أشهر: تنخفض القيمة إلى 75% (استهلاك 25%)', en: 'After 3 months: value drops to 75% (25% depreciation)' },
                { ar: 'بعد 6 أشهر: تنخفض القيمة إلى 50% (استهلاك 50%)', en: 'After 6 months: value drops to 50% (50% depreciation)' },
                { ar: 'بعد 9 أشهر: تنخفض القيمة إلى 25% (استهلاك 75%)', en: 'After 9 months: value drops to 25% (75% depreciation)' },
                { ar: 'بعد 12 شهر: تصبح القيمة 0% ويتم الحذف التلقائي', en: 'After 12 months: value becomes 0% and auto-removed' },
              ].map((rule, i) => (
                <li key={i} className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {language === 'ar' ? rule.ar : rule.en}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Add form */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'إضافة يونيفورم جديد' : 'Add New Uniform'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Employee selector */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'اختر الموظف' : 'Select Employee'}</Label>
              <Popover open={empOpen} onOpenChange={setEmpOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", isRTL && "flex-row-reverse")}>
                    {selectedEmployee
                      ? `${selectedEmployee.employeeId} - ${language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn}`
                      : (language === 'ar' ? '-- اختر الموظف / Select Employee --' : '-- Select Employee --')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                  <Command>
                    <CommandInput placeholder={language === 'ar' ? 'بحث...' : 'Search...'} />
                    <CommandList>
                      <CommandEmpty>{language === 'ar' ? 'لا نتائج' : 'No results'}</CommandEmpty>
                      <CommandGroup>
                        {activeEmployees.map(emp => (
                          <CommandItem key={emp.employeeId} value={`${emp.nameAr} ${emp.nameEn} ${emp.employeeId}`}
                            onSelect={() => { setEmployeeId(emp.employeeId); setEmpOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", employeeId === emp.employeeId ? "opacity-100" : "opacity-0")} />
                            <span>{emp.employeeId} - {language === 'ar' ? emp.nameAr : emp.nameEn}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Employee ID display */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رقم الموظف' : 'Employee ID'}</Label>
              <Input value={employeeId} readOnly className="bg-muted" />
            </div>

            {/* Delivery date */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ الاستلام' : 'Delivery Date'}</Label>
              <Input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>

            {/* Items table */}
            <div className="space-y-2">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <Label className="font-bold">{language === 'ar' ? 'الأصناف' : 'Items'}</Label>
                <Button size="sm" onClick={addRow} className="gap-1">
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة صنف' : 'Add Item'}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'نوع الصنف' : 'Type'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'قيمة الصنف' : 'Unit Price'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'العدد' : 'Qty'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الإجمالي' : 'Total'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Select value={row.typeIndex} onValueChange={v => updateRow(i, 'typeIndex', v)}>
                          <SelectTrigger><SelectValue placeholder={language === 'ar' ? 'اختر الصنف' : 'Select type'} /></SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {UNIFORM_TYPES.map((ut, idx) => (
                              <SelectItem key={idx} value={String(idx)}>{language === 'ar' ? ut.ar : ut.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} step={0.01} value={row.unitPrice || ''} onChange={e => updateRow(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={1} value={row.quantity} onChange={e => updateRow(i, 'quantity', parseInt(e.target.value) || 1)} />
                      </TableCell>
                      <TableCell className="font-bold">{(row.quantity * row.unitPrice).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => removeRow(i)} disabled={items.length === 1}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className={cn("text-center font-bold text-lg", "mt-2")}>
                {language === 'ar' ? 'الإجمالي الكلي' : 'Grand Total'}: <span className="text-primary">{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Actions */}
            <div className={cn("flex gap-3 justify-end", isRTL && "flex-row-reverse")}>
              <Button variant="outline" onClick={handleReset} className="gap-1.5">
                <RefreshCw className="w-4 h-4" />
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
              <Button onClick={handleSave} className="gap-1.5">
                <Package className="w-4 h-4" />
                {language === 'ar' ? 'حفظ جميع الأصناف' : 'Save All Items'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Uniforms list */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Package className="w-5 h-5" />
              {language === 'ar' ? 'قائمة اليونيفورم' : 'Uniforms List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'رقم الموظف' : 'Emp ID'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'اسم الموظف' : 'Name'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الصنف' : 'Type'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'القيمة الأصلية' : 'Original'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'القيمة الحالية' : 'Current'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'العدد' : 'Qty'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الإجمالي الحالي' : 'Current Total'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'تاريخ الاستلام' : 'Delivery'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'الاستهلاك' : 'Depreciation'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniforms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
                    </TableCell>
                  </TableRow>
                ) : (
                  uniforms.map(u => {
                    const emp = employees.find(e => e.employeeId === u.employeeId);
                    const depPct = getDepreciationPercent(u.deliveryDate);
                    const curVal = getCurrentValue(u.totalPrice, u.deliveryDate);
                    const usedPct = 100 - depPct;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-mono">{u.employeeId}</TableCell>
                        <TableCell>{emp ? (language === 'ar' ? emp.nameAr : emp.nameEn) : (language === 'ar' ? 'غير محدد' : 'Unknown')}</TableCell>
                        <TableCell>{language === 'ar' ? u.typeAr : u.typeEn}</TableCell>
                        <TableCell>{u.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{(u.unitPrice * depPct / 100).toFixed(2)}</TableCell>
                        <TableCell>{u.quantity}</TableCell>
                        <TableCell className="font-bold">{curVal.toFixed(2)}</TableCell>
                        <TableCell>{u.deliveryDate}</TableCell>
                        <TableCell>
                          <Badge variant={usedPct >= 75 ? 'destructive' : usedPct >= 50 ? 'secondary' : 'outline'}>
                            {usedPct}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="icon" onClick={() => deleteUniform(u.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Uniforms;
