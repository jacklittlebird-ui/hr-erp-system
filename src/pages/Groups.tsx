import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Layers, Search } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  membersCount: number;
  createdAt: string;
}

const allPermissions = [
  { key: 'employees.view', ar: 'عرض الموظفين', en: 'View Employees' },
  { key: 'employees.edit', ar: 'تعديل الموظفين', en: 'Edit Employees' },
  { key: 'employees.delete', ar: 'حذف الموظفين', en: 'Delete Employees' },
  { key: 'attendance.view', ar: 'عرض الحضور', en: 'View Attendance' },
  { key: 'attendance.edit', ar: 'تعديل الحضور', en: 'Edit Attendance' },
  { key: 'leaves.view', ar: 'عرض الإجازات', en: 'View Leaves' },
  { key: 'leaves.approve', ar: 'اعتماد الإجازات', en: 'Approve Leaves' },
  { key: 'salaries.view', ar: 'عرض الرواتب', en: 'View Salaries' },
  { key: 'salaries.edit', ar: 'تعديل الرواتب', en: 'Edit Salaries' },
  { key: 'reports.view', ar: 'عرض التقارير', en: 'View Reports' },
  { key: 'reports.export', ar: 'تصدير التقارير', en: 'Export Reports' },
  { key: 'settings.manage', ar: 'إدارة الإعدادات', en: 'Manage Settings' },
  { key: 'users.manage', ar: 'إدارة المستخدمين', en: 'Manage Users' },
  { key: 'roles.manage', ar: 'إدارة الأدوار', en: 'Manage Roles' },
  { key: 'loans.view', ar: 'عرض القروض', en: 'View Loans' },
  { key: 'loans.approve', ar: 'اعتماد القروض', en: 'Approve Loans' },
  { key: 'training.manage', ar: 'إدارة التدريب', en: 'Manage Training' },
  { key: 'recruitment.manage', ar: 'إدارة التوظيف', en: 'Manage Recruitment' },
];

const initialGroups: Group[] = [
  { id: '1', name: 'الإدارة العليا', description: 'صلاحيات كاملة على جميع أقسام النظام', permissions: allPermissions.map(p => p.key), membersCount: 2, createdAt: '2025-01-01' },
  { id: '2', name: 'الموارد البشرية', description: 'إدارة شؤون الموظفين والإجازات والحضور', permissions: ['employees.view', 'employees.edit', 'attendance.view', 'attendance.edit', 'leaves.view', 'leaves.approve', 'reports.view'], membersCount: 3, createdAt: '2025-01-15' },
  { id: '3', name: 'المالية', description: 'إدارة الرواتب والقروض والتقارير المالية', permissions: ['salaries.view', 'salaries.edit', 'loans.view', 'loans.approve', 'reports.view', 'reports.export'], membersCount: 2, createdAt: '2025-02-01' },
  { id: '4', name: 'المشرفين', description: 'عرض بيانات الموظفين والحضور فقط', permissions: ['employees.view', 'attendance.view', 'leaves.view', 'reports.view'], membersCount: 5, createdAt: '2025-03-01' },
];

const Groups = () => {
  const { language, isRTL } = useLanguage();
  const [groups, setGroups] = usePersistedState<Group[]>('hr_groups', initialGroups);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAr = language === 'ar';
  const filtered = groups.filter(g => g.name.includes(search) || g.description.includes(search));

  const openAdd = () => {
    setEditingGroup(null);
    setForm({ name: '', description: '', permissions: [] });
    setDialogOpen(true);
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    setForm({ name: group.name, description: group.description, permissions: [...group.permissions] });
    setDialogOpen(true);
  };

  const togglePermission = (key: string) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key]
    }));
  };

  const selectAll = () => {
    setForm(f => ({ ...f, permissions: allPermissions.map(p => p.key) }));
  };

  const deselectAll = () => {
    setForm(f => ({ ...f, permissions: [] }));
  };

  const handleSave = () => {
    if (!form.name) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'يرجى إدخال اسم المجموعة' : 'Please enter group name', variant: 'destructive' });
      return;
    }
    if (editingGroup) {
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, ...form } : g));
      toast({ title: isAr ? 'تم التحديث' : 'Updated' });
    } else {
      setGroups(prev => [...prev, { id: Date.now().toString(), ...form, membersCount: 0, createdAt: new Date().toISOString().split('T')[0] }]);
      toast({ title: isAr ? 'تمت الإضافة' : 'Added' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setDeleteConfirm(null);
    toast({ title: isAr ? 'تم الحذف' : 'Deleted' });
  };

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isRTL && "text-right")}>
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isAr ? 'إدارة المجموعات' : 'Group Management'}</h1>
            <p className="text-muted-foreground">{isAr ? 'إنشاء وإدارة مجموعات الصلاحيات' : 'Create and manage permission groups'}</p>
          </div>
          <Button onClick={openAdd} className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <Plus className="w-4 h-4" /> {isAr ? 'إضافة مجموعة' : 'Add Group'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Layers className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{groups.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي المجموعات' : 'Total Groups'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Users className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{groups.reduce((s, g) => s + g.membersCount, 0)}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي الأعضاء' : 'Total Members'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Layers className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{allPermissions.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي الصلاحيات' : 'Total Permissions'}</p></div>
          </CardContent></Card>
        </div>

        <div className="relative max-w-md">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input placeholder={isAr ? 'بحث...' : 'Search...'} value={search} onChange={e => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
        </div>

        {/* Groups Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(group => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(group)}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(group.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("flex items-center gap-4 mb-3", isRTL && "flex-row-reverse")}>
                  <Badge variant="outline"><Users className="w-3 h-3 mr-1" />{group.membersCount} {isAr ? 'عضو' : 'members'}</Badge>
                  <Badge variant="secondary">{group.permissions.length} {isAr ? 'صلاحية' : 'permissions'}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.permissions.slice(0, 5).map(p => {
                    const perm = allPermissions.find(ap => ap.key === p);
                    return <Badge key={p} variant="outline" className="text-xs">{perm ? (isAr ? perm.ar : perm.en) : p}</Badge>;
                  })}
                  {group.permissions.length > 5 && <Badge variant="secondary" className="text-xs">+{group.permissions.length - 5}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGroup ? (isAr ? 'تعديل مجموعة' : 'Edit Group') : (isAr ? 'إضافة مجموعة' : 'Add Group')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>{isAr ? 'اسم المجموعة' : 'Group Name'}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>{isAr ? 'الوصف' : 'Description'}</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                  <Label>{isAr ? 'الصلاحيات' : 'Permissions'}</Label>
                  <div className="flex gap-2">
                    <Button variant="link" size="sm" onClick={selectAll}>{isAr ? 'تحديد الكل' : 'Select All'}</Button>
                    <Button variant="link" size="sm" onClick={deselectAll}>{isAr ? 'إلغاء الكل' : 'Deselect All'}</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {allPermissions.map(perm => (
                    <label key={perm.key} className={cn("flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded", isRTL && "flex-row-reverse")}>
                      <Checkbox checked={form.permissions.includes(perm.key)} onCheckedChange={() => togglePermission(perm.key)} />
                      <span className="text-sm">{isAr ? perm.ar : perm.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleSave}>{isAr ? 'حفظ' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">{isAr ? 'هل أنت متأكد من حذف هذه المجموعة؟' : 'Are you sure?'}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>{isAr ? 'حذف' : 'Delete'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Groups;
