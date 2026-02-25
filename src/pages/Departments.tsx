import { useState, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Users, UserCheck, TrendingUp, Plus, Save,
  ChevronDown, Check, Edit2, Trash2, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { initialDepartments, Department } from '@/data/departments';

const CHART_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const Departments = () => {
  const { t, isRTL } = useLanguage();
  const { employees: allEmployees } = useEmployeeData();
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const activeEmployees = useMemo(() => allEmployees.filter(e => e.status === 'active'), [allEmployees]);

  const getManagerName = (managerId: string) => {
    const emp = allEmployees.find(e => e.id === managerId);
    return emp ? (isRTL ? emp.nameAr : emp.nameEn) : '-';
  };

  const selectedManagerLabel = useMemo(() => {
    const emp = allEmployees.find(e => e.id === selectedManager);
    return emp ? (isRTL ? emp.nameAr : emp.nameEn) : '';
  }, [selectedManager, isRTL, allEmployees]);

  const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
  const avgSize = departments.length ? Math.round(totalEmployees / departments.length) : 0;

  const chartData = departments.map((d, i) => ({
    name: isRTL ? d.nameAr : d.nameEn,
    value: d.employeeCount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const handleSave = () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم القسم بالعربي والإنجليزي' : 'Please enter department name in Arabic and English');
      return;
    }
    if (!selectedManager) {
      toast.error(isRTL ? 'يرجى اختيار مدير القسم' : 'Please select a department manager');
      return;
    }

    if (editingId) {
      setDepartments(prev => prev.map(d =>
        d.id === editingId ? { ...d, nameAr, nameEn, managerId: selectedManager } : d
      ));
      toast.success(isRTL ? 'تم تحديث القسم بنجاح' : 'Department updated successfully');
      setEditingId(null);
    } else {
      const newDept: Department = {
        id: String(Date.now()),
        nameAr,
        nameEn,
        managerId: selectedManager,
        employeeCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDepartments(prev => [...prev, newDept]);
      toast.success(isRTL ? 'تم إضافة القسم بنجاح' : 'Department added successfully');
    }

    setNameAr('');
    setNameEn('');
    setSelectedManager('');
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setNameAr(dept.nameAr);
    setNameEn(dept.nameEn);
    setSelectedManager(dept.managerId);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast.success(isRTL ? 'تم حذف القسم بنجاح' : 'Department deleted successfully');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNameAr('');
    setNameEn('');
    setSelectedManager('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary rounded-xl p-6">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">{t('departmentsPage.title')}</h1>
              <p className="text-primary-foreground/70 mt-1">{t('departmentsPage.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">{t('departmentsPage.totalDepts')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              <p className="text-xs text-muted-foreground">{t('departmentsPage.registeredDepts')}</p>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">{t('departmentsPage.totalEmps')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
              <p className="text-xs text-muted-foreground">{t('departmentsPage.acrossAllDepts')}</p>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-violet-500/10 to-violet-600/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-violet-600">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">{t('departmentsPage.avgSize')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{avgSize}</p>
              <p className="text-xs text-muted-foreground">{t('departmentsPage.empsPerDept')}</p>
            </CardContent>
          </Card>

          <Card className="border bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <UserCheck className="w-5 h-5" />
                <span className="text-sm font-medium">{t('departmentsPage.managers')}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(departments.map(d => d.managerId)).size}
              </p>
              <p className="text-xs text-muted-foreground">{t('departmentsPage.uniqueManagers')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Form */}
          <Card className="lg:col-span-2" ref={formRef}>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Plus className="w-5 h-5 text-primary" />
                {editingId ? t('departmentsPage.editDept') : t('departmentsPage.addDept')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={cn(isRTL && "text-right block")}>{t('departments.nameAr')}</Label>
                  <Input
                    value={nameAr}
                    onChange={e => setNameAr(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم القسم بالعربي' : 'Department name in Arabic'}
                    className={cn(isRTL && "text-right")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isRTL && "text-right block")}>{t('departments.nameEn')}</Label>
                  <Input
                    value={nameEn}
                    onChange={e => setNameEn(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسم القسم بالإنجليزي' : 'Department name in English'}
                    className={cn(isRTL && "text-right")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={cn(isRTL && "text-right block")}>{t('departments.manager')}</Label>
                  <Popover open={managerOpen} onOpenChange={setManagerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={managerOpen}
                        className={cn(
                          "w-full justify-between font-normal h-10",
                          !selectedManager && "text-muted-foreground",
                          isRTL && "flex-row-reverse text-right"
                        )}
                      >
                        {selectedManagerLabel || (isRTL ? 'اختر مدير القسم' : 'Select manager')}
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0 z-50 bg-popover" align="start">
                      <Command>
                        <CommandInput
                          placeholder={isRTL ? 'ابحث عن موظف...' : 'Search employee...'}
                          className={cn(isRTL && "text-right")}
                        />
                        <CommandList>
                          <CommandEmpty>{isRTL ? 'لم يتم العثور على موظف' : 'No employee found'}</CommandEmpty>
                          <CommandGroup>
                            {activeEmployees.map((emp) => (
                              <CommandItem
                                key={emp.id}
                                value={`${emp.nameAr} ${emp.nameEn}`}
                                onSelect={() => {
                                  setSelectedManager(emp.id);
                                  setManagerOpen(false);
                                }}
                                className={cn(isRTL && "flex-row-reverse text-right")}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedManager === emp.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className={cn("flex flex-col", isRTL && "items-end")}>
                                  <span className="font-medium">{isRTL ? emp.nameAr : emp.nameEn}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {emp.employeeId} - {isRTL ? emp.nameEn : emp.nameAr}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className={cn("flex gap-3", isRTL ? "justify-start" : "justify-end")}>
                {editingId && (
                  <Button variant="outline" onClick={handleCancelEdit}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                )}
                <Button onClick={handleSave} className="gap-2 px-8">
                  <Save className="w-4 h-4" />
                  {editingId ? (isRTL ? 'تحديث القسم' : 'Update Department') : t('departments.save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2 text-base", isRTL && "flex-row-reverse")}>
                <BarChart3 className="w-5 h-5 text-primary" />
                {t('departmentsPage.distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                      fontSize={11}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Building2 className="w-5 h-5 text-primary" />
              {t('departmentsPage.deptList')}
              <Badge variant="secondary" className="mr-2">{departments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>#</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.deptNameAr')}</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.deptNameEn')}</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.deptManager')}</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.empCount')}</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept, index) => (
                    <TableRow key={dept.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{dept.nameAr}</TableCell>
                      <TableCell>{dept.nameEn}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>
                        <Badge variant="outline" className="font-normal">
                          {getManagerName(dept.managerId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20">
                          {dept.employeeCount} {isRTL ? 'موظف' : 'emp'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(dept)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(dept.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
