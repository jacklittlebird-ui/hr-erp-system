import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const CHART_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

interface DeptRow {
  id: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  created_at: string;
}

const Departments = () => {
  const { t, isRTL } = useLanguage();
  const { employees: allEmployees } = useEmployeeData();
  const [departments, setDepartments] = useState<DeptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchDepartments = useCallback(async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setDepartments(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const activeEmployees = useMemo(() => allEmployees.filter(e => e.status === 'active'), [allEmployees]);

  const getManagerName = (managerId: string) => {
    const emp = allEmployees.find(e => e.id === managerId);
    return emp ? (isRTL ? emp.nameAr : emp.nameEn) : '-';
  };

  const selectedManagerLabel = useMemo(() => {
    const emp = allEmployees.find(e => e.id === selectedManager);
    return emp ? (isRTL ? emp.nameAr : emp.nameEn) : '';
  }, [selectedManager, isRTL, allEmployees]);

  // Count employees per department
  const deptEmployeeCount = useMemo(() => {
    const counts: Record<string, number> = {};
    allEmployees.forEach(e => {
      if (e.departmentId) {
        counts[e.departmentId] = (counts[e.departmentId] || 0) + 1;
      }
    });
    return counts;
  }, [allEmployees]);

  const totalEmployees = Object.values(deptEmployeeCount).reduce((s, c) => s + c, 0);
  const avgSize = departments.length ? Math.round(totalEmployees / departments.length) : 0;

  const chartData = departments.map((d, i) => ({
    name: isRTL ? d.name_ar : d.name_en,
    value: deptEmployeeCount[d.id] || 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const handleSave = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم القسم بالعربي والإنجليزي' : 'Please enter department name in Arabic and English');
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('departments').update({ name_ar: nameAr, name_en: nameEn }).eq('id', editingId);
      if (error) { toast.error(isRTL ? 'خطأ في التحديث' : 'Update error'); return; }
      toast.success(isRTL ? 'تم تحديث القسم بنجاح' : 'Department updated successfully');
      setEditingId(null);
    } else {
      const { error } = await supabase.from('departments').insert({ name_ar: nameAr, name_en: nameEn });
      if (error) { toast.error(isRTL ? 'خطأ في الإضافة' : 'Insert error'); return; }
      toast.success(isRTL ? 'تم إضافة القسم بنجاح' : 'Department added successfully');
    }

    setNameAr('');
    setNameEn('');
    setSelectedManager('');
    fetchDepartments();
  };

  const handleEdit = (dept: DeptRow) => {
    setEditingId(dept.id);
    setNameAr(dept.name_ar);
    setNameEn(dept.name_en);
    setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) { toast.error(isRTL ? 'خطأ في الحذف' : 'Delete error'); return; }
    toast.success(isRTL ? 'تم حذف القسم بنجاح' : 'Department deleted successfully');
    fetchDepartments();
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
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.empCount')}</TableHead>
                    <TableHead className={cn("font-semibold", isRTL && "text-right")}>{t('departmentsPage.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept, index) => (
                    <TableRow key={dept.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{dept.name_ar}</TableCell>
                      <TableCell>{dept.name_en}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20">
                          {deptEmployeeCount[dept.id] || 0} {isRTL ? 'موظف' : 'emp'}
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
