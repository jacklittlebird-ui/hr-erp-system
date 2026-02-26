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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert, Search } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  level: 'admin' | 'manager' | 'supervisor' | 'user';
  permissions: string[];
  isSystem: boolean;
  usersCount: number;
}

const permissionModules = [
  {
    module: { ar: 'الموظفين', en: 'Employees' },
    perms: [
      { key: 'emp.view', ar: 'عرض', en: 'View' },
      { key: 'emp.create', ar: 'إضافة', en: 'Create' },
      { key: 'emp.edit', ar: 'تعديل', en: 'Edit' },
      { key: 'emp.delete', ar: 'حذف', en: 'Delete' },
    ],
  },
  {
    module: { ar: 'الحضور', en: 'Attendance' },
    perms: [
      { key: 'att.view', ar: 'عرض', en: 'View' },
      { key: 'att.edit', ar: 'تعديل', en: 'Edit' },
      { key: 'att.approve', ar: 'اعتماد', en: 'Approve' },
    ],
  },
  {
    module: { ar: 'الإجازات', en: 'Leaves' },
    perms: [
      { key: 'lev.view', ar: 'عرض', en: 'View' },
      { key: 'lev.create', ar: 'طلب', en: 'Request' },
      { key: 'lev.approve', ar: 'اعتماد', en: 'Approve' },
      { key: 'lev.delete', ar: 'حذف', en: 'Delete' },
    ],
  },
  {
    module: { ar: 'الرواتب', en: 'Salaries' },
    perms: [
      { key: 'sal.view', ar: 'عرض', en: 'View' },
      { key: 'sal.process', ar: 'تشغيل مسير', en: 'Process Payroll' },
      { key: 'sal.edit', ar: 'تعديل', en: 'Edit' },
    ],
  },
  {
    module: { ar: 'القروض', en: 'Loans' },
    perms: [
      { key: 'loan.view', ar: 'عرض', en: 'View' },
      { key: 'loan.create', ar: 'إنشاء', en: 'Create' },
      { key: 'loan.approve', ar: 'اعتماد', en: 'Approve' },
    ],
  },
  {
    module: { ar: 'التقارير', en: 'Reports' },
    perms: [
      { key: 'rep.view', ar: 'عرض', en: 'View' },
      { key: 'rep.export', ar: 'تصدير', en: 'Export' },
    ],
  },
  {
    module: { ar: 'الإعدادات', en: 'Settings' },
    perms: [
      { key: 'set.view', ar: 'عرض', en: 'View' },
      { key: 'set.edit', ar: 'تعديل', en: 'Edit' },
      { key: 'set.users', ar: 'إدارة المستخدمين', en: 'Manage Users' },
      { key: 'set.roles', ar: 'إدارة الأدوار', en: 'Manage Roles' },
    ],
  },
];

const allPerms = permissionModules.flatMap(m => m.perms.map(p => p.key));

const initialRoles: Role[] = [
  { id: '1', name: 'مدير النظام', description: 'صلاحيات كاملة على جميع الوظائف', level: 'admin', permissions: allPerms, isSystem: true, usersCount: 1 },
  { id: '2', name: 'مدير الموارد البشرية', description: 'إدارة شاملة لشؤون الموظفين', level: 'manager', permissions: allPerms.filter(p => !p.startsWith('set.')), isSystem: false, usersCount: 2 },
  { id: '3', name: 'مشرف', description: 'مراجعة واعتماد الطلبات', level: 'supervisor', permissions: ['emp.view', 'att.view', 'att.approve', 'lev.view', 'lev.approve', 'rep.view'], isSystem: false, usersCount: 4 },
  { id: '4', name: 'موظف', description: 'صلاحيات أساسية للعرض فقط', level: 'user', permissions: ['emp.view', 'att.view', 'lev.view', 'lev.create'], isSystem: false, usersCount: 15 },
];

const levelColors: Record<string, string> = { admin: 'destructive', manager: 'default', supervisor: 'secondary', user: 'outline' };
const levelLabels: Record<string, { ar: string; en: string }> = {
  admin: { ar: 'مدير', en: 'Admin' },
  manager: { ar: 'مدير قسم', en: 'Manager' },
  supervisor: { ar: 'مشرف', en: 'Supervisor' },
  user: { ar: 'مستخدم', en: 'User' },
};

const Roles = () => {
  const { language, isRTL } = useLanguage();
  const [roles, setRoles] = usePersistedState<Role[]>('hr_roles', initialRoles);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: '', description: '', level: 'user' as Role['level'], permissions: [] as string[] });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAr = language === 'ar';
  const filtered = roles.filter(r => r.name.includes(search) || r.description.includes(search));

  const openAdd = () => { setEditingRole(null); setForm({ name: '', description: '', level: 'user', permissions: [] }); setDialogOpen(true); };
  const openEdit = (role: Role) => { setEditingRole(role); setForm({ name: role.name, description: role.description, level: role.level, permissions: [...role.permissions] }); setDialogOpen(true); };

  const togglePerm = (key: string) => setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(p => p !== key) : [...f.permissions, key] }));
  const toggleModule = (perms: string[]) => {
    const allSelected = perms.every(p => form.permissions.includes(p));
    setForm(f => ({ ...f, permissions: allSelected ? f.permissions.filter(p => !perms.includes(p)) : [...new Set([...f.permissions, ...perms])] }));
  };

  const handleSave = () => {
    if (!form.name) { toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'يرجى إدخال اسم الدور' : 'Enter role name', variant: 'destructive' }); return; }
    if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, ...form } : r));
    } else {
      setRoles(prev => [...prev, { id: Date.now().toString(), ...form, isSystem: false, usersCount: 0 }]);
    }
    toast({ title: isAr ? 'تم الحفظ' : 'Saved' });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { setRoles(prev => prev.filter(r => r.id !== id)); setDeleteConfirm(null); toast({ title: isAr ? 'تم الحذف' : 'Deleted' }); };

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isRTL && "text-right")}>
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isAr ? 'إدارة الأدوار' : 'Role Management'}</h1>
            <p className="text-muted-foreground">{isAr ? 'تحديد الأدوار وصلاحيات كل دور' : 'Define roles and their permissions'}</p>
          </div>
          <Button onClick={openAdd} className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <Plus className="w-4 h-4" /> {isAr ? 'إضافة دور' : 'Add Role'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Shield className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{roles.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي الأدوار' : 'Total Roles'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><ShieldCheck className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{roles.filter(r => r.isSystem).length}</p><p className="text-xs text-muted-foreground">{isAr ? 'أدوار النظام' : 'System Roles'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><ShieldAlert className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{roles.reduce((s, r) => s + r.usersCount, 0)}</p><p className="text-xs text-muted-foreground">{isAr ? 'مستخدمون معينون' : 'Assigned Users'}</p></div>
          </CardContent></Card>
        </div>

        <div className="relative max-w-md">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input placeholder={isAr ? 'بحث...' : 'Search...'} value={search} onChange={e => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(role => (
            <Card key={role.id} className={role.isSystem ? 'border-primary/30' : ''}>
              <CardHeader className="pb-3">
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className="space-y-1">
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      {role.isSystem && <Badge variant="outline" className="text-xs">{isAr ? 'نظام' : 'System'}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  {!role.isSystem && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(role)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(role.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                  {role.isSystem && (
                    <Button size="icon" variant="ghost" onClick={() => openEdit(role)}><Edit className="w-4 h-4" /></Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                  <Badge variant={levelColors[role.level] as any}>{isAr ? levelLabels[role.level].ar : levelLabels[role.level].en}</Badge>
                  <span className="text-sm text-muted-foreground">{role.usersCount} {isAr ? 'مستخدم' : 'users'}</span>
                  <span className="text-sm text-muted-foreground">{role.permissions.length} {isAr ? 'صلاحية' : 'permissions'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog with module-based permissions */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRole ? (isAr ? 'تعديل دور' : 'Edit Role') : (isAr ? 'إضافة دور' : 'Add Role')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{isAr ? 'اسم الدور' : 'Role Name'}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label>{isAr ? 'المستوى' : 'Level'}</Label>
                  <select className="w-full border rounded-md p-2 bg-background text-foreground" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value as Role['level'] }))}>
                    {Object.entries(levelLabels).map(([k, v]) => <option key={k} value={k}>{isAr ? v.ar : v.en}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>{isAr ? 'الوصف' : 'Description'}</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <Label className="mb-2 block">{isAr ? 'الصلاحيات حسب القسم' : 'Permissions by Module'}</Label>
                <div className="space-y-3 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {permissionModules.map(mod => {
                    const modKeys = mod.perms.map(p => p.key);
                    const allChecked = modKeys.every(k => form.permissions.includes(k));
                    return (
                      <div key={mod.module.en} className="space-y-1">
                        <label className={cn("flex items-center gap-2 font-medium cursor-pointer", isRTL && "flex-row-reverse")}>
                          <Checkbox checked={allChecked} onCheckedChange={() => toggleModule(modKeys)} />
                          <span>{isAr ? mod.module.ar : mod.module.en}</span>
                        </label>
                        <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-1", isRTL ? "mr-6" : "ml-6")}>
                          {mod.perms.map(p => (
                            <label key={p.key} className={cn("flex items-center gap-1.5 text-sm cursor-pointer", isRTL && "flex-row-reverse")}>
                              <Checkbox checked={form.permissions.includes(p.key)} onCheckedChange={() => togglePerm(p.key)} />
                              <span>{isAr ? p.ar : p.en}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
            <p className="text-muted-foreground">{isAr ? 'هل أنت متأكد من حذف هذا الدور؟' : 'Delete this role?'}</p>
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

export default Roles;
