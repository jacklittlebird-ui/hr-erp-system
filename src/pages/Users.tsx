import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Shield, Users as UsersIcon, UserCheck, UserX } from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  group: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const initialUsers: SystemUser[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@company.com', role: 'مدير النظام', group: 'الإدارة العليا', status: 'active', lastLogin: '2026-02-20', createdAt: '2025-01-01' },
  { id: '2', name: 'سارة أحمد', email: 'sara@company.com', role: 'مدير الموارد البشرية', group: 'الموارد البشرية', status: 'active', lastLogin: '2026-02-19', createdAt: '2025-03-15' },
  { id: '3', name: 'محمد علي', email: 'mohamed@company.com', role: 'محاسب', group: 'المالية', status: 'active', lastLogin: '2026-02-18', createdAt: '2025-06-01' },
  { id: '4', name: 'فاطمة حسن', email: 'fatma@company.com', role: 'موظف', group: 'العمليات', status: 'inactive', lastLogin: '2026-01-10', createdAt: '2025-08-20' },
];

const Users = () => {
  const { language, isRTL } = useLanguage();
  const [users, setUsers] = usePersistedState<SystemUser[]>('hr_system_users', initialUsers);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: string; group: string; status: 'active' | 'inactive' }>({ name: '', email: '', role: '', group: '', status: 'active' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAr = language === 'ar';

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.includes(search) || u.role.includes(search)
  );

  const openAdd = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: '', group: '', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (user: SystemUser) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, group: user.group, status: user.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields', variant: 'destructive' });
      return;
    }
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form } : u));
      toast({ title: isAr ? 'تم التحديث' : 'Updated', description: isAr ? 'تم تحديث بيانات المستخدم' : 'User updated successfully' });
    } else {
      const newUser: SystemUser = {
        id: Date.now().toString(),
        ...form,
        lastLogin: '-',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      toast({ title: isAr ? 'تمت الإضافة' : 'Added', description: isAr ? 'تم إضافة مستخدم جديد' : 'New user added' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
    toast({ title: isAr ? 'تم الحذف' : 'Deleted', description: isAr ? 'تم حذف المستخدم' : 'User deleted' });
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isRTL && "text-right")}>
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isAr ? 'إدارة المستخدمين' : 'User Management'}</h1>
            <p className="text-muted-foreground">{isAr ? 'إدارة مستخدمي النظام وصلاحياتهم' : 'Manage system users and permissions'}</p>
          </div>
          <Button onClick={openAdd} className={cn("gap-2", isRTL && "flex-row-reverse")}>
            <Plus className="w-4 h-4" /> {isAr ? 'إضافة مستخدم' : 'Add User'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><UsersIcon className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي المستخدمين' : 'Total Users'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><UserCheck className="w-5 h-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{activeCount}</p><p className="text-xs text-muted-foreground">{isAr ? 'نشط' : 'Active'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><UserX className="w-5 h-5 text-red-600" /></div>
            <div><p className="text-2xl font-bold">{inactiveCount}</p><p className="text-xs text-muted-foreground">{isAr ? 'غير نشط' : 'Inactive'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Shield className="w-5 h-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{new Set(users.map(u => u.role)).size}</p><p className="text-xs text-muted-foreground">{isAr ? 'الأدوار' : 'Roles'}</p></div>
          </CardContent></Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input placeholder={isAr ? 'بحث عن مستخدم...' : 'Search users...'} value={search} onChange={e => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{isAr ? 'البريد' : 'Email'}</TableHead>
                  <TableHead>{isAr ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{isAr ? 'المجموعة' : 'Group'}</TableHead>
                  <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isAr ? 'آخر دخول' : 'Last Login'}</TableHead>
                  <TableHead>{isAr ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    <TableCell>{user.group}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={user.status === 'active'} onCheckedChange={() => toggleStatus(user.id)} />
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(user)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm(user.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد نتائج' : 'No results'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? (isAr ? 'تعديل مستخدم' : 'Edit User') : (isAr ? 'إضافة مستخدم' : 'Add User')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>{isAr ? 'الاسم' : 'Name'}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>{isAr ? 'البريد الإلكتروني' : 'Email'}</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>{isAr ? 'الدور' : 'Role'}</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue placeholder={isAr ? 'اختر الدور' : 'Select role'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مدير النظام">{isAr ? 'مدير النظام' : 'System Admin'}</SelectItem>
                    <SelectItem value="مدير الموارد البشرية">{isAr ? 'مدير الموارد البشرية' : 'HR Manager'}</SelectItem>
                    <SelectItem value="محاسب">{isAr ? 'محاسب' : 'Accountant'}</SelectItem>
                    <SelectItem value="مشرف">{isAr ? 'مشرف' : 'Supervisor'}</SelectItem>
                    <SelectItem value="موظف">{isAr ? 'موظف' : 'Employee'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{isAr ? 'المجموعة' : 'Group'}</Label>
                <Select value={form.group} onValueChange={v => setForm(f => ({ ...f, group: v }))}>
                  <SelectTrigger><SelectValue placeholder={isAr ? 'اختر المجموعة' : 'Select group'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الإدارة العليا">{isAr ? 'الإدارة العليا' : 'Senior Management'}</SelectItem>
                    <SelectItem value="الموارد البشرية">{isAr ? 'الموارد البشرية' : 'HR'}</SelectItem>
                    <SelectItem value="المالية">{isAr ? 'المالية' : 'Finance'}</SelectItem>
                    <SelectItem value="العمليات">{isAr ? 'العمليات' : 'Operations'}</SelectItem>
                    <SelectItem value="تقنية المعلومات">{isAr ? 'تقنية المعلومات' : 'IT'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleSave}>{isAr ? 'حفظ' : 'Save'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">{isAr ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?'}</p>
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

export default Users;
