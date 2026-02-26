import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Shield, Users as UsersIcon, UserCheck, MapPin, User, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface SystemUser {
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'station_manager' | 'employee';
  station_code?: string;
  station_name?: string;
  employee_code?: string;
  created_at: string;
}

const Users = () => {
  const { language, isRTL } = useLanguage();
  const { session } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stations, setStations] = useState<{ id: string; code: string; name_ar: string; name_en: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; employee_code: string; name_ar: string; name_en: string }[]>([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: '' as string,
    station_code: '',
    employee_code: '',
  });

  const isAr = language === 'ar';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get all user_roles with profiles
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role, station_id, employee_id');

      if (error) throw error;

      // Get profiles for these users
      const userIds = [...new Set(roles?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .in('id', userIds);

      // Get stations
      const { data: stationsData } = await supabase.from('stations').select('id, code, name_ar, name_en');

      // Get employees
      const { data: empsData } = await supabase.from('employees').select('id, employee_code, name_ar, name_en');

      const mapped: SystemUser[] = (roles || []).map(r => {
        const profile = profiles?.find(p => p.id === r.user_id);
        const station = stationsData?.find(s => s.id === r.station_id);
        const emp = empsData?.find(e => e.id === r.employee_id);
        return {
          user_id: r.user_id,
          email: profile?.email || '',
          full_name: profile?.full_name || '',
          role: r.role as SystemUser['role'],
          station_code: station?.code,
          station_name: isAr ? station?.name_ar : station?.name_en,
          employee_code: emp?.employee_code,
          created_at: profile?.created_at || '',
        };
      });

      setUsers(mapped);
      if (stationsData) setStations(stationsData);
      if (empsData) setEmployees(empsData);
    } catch (err: any) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  }, [isAr]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password || !form.role) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (form.password.length < 6) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    if (form.role === 'station_manager' && !form.station_code) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: isAr ? 'يرجى اختيار المحطة' : 'Please select a station', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-user', {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
          station_code: form.station_code || undefined,
          employee_code: form.employee_code || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: isAr ? 'تم بنجاح' : 'Success', description: isAr ? 'تم إنشاء المستخدم بنجاح' : 'User created successfully' });
      setDialogOpen(false);
      setForm({ full_name: '', email: '', password: '', role: '', station_code: '', employee_code: '' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: isAr ? 'خطأ' : 'Error', description: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-primary/10 text-primary border-primary/30">{isAr ? 'مدير النظام' : 'Admin'}</Badge>;
      case 'station_manager': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">{isAr ? 'مدير محطة' : 'Station Manager'}</Badge>;
      case 'employee': return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/30">{isAr ? 'موظف' : 'Employee'}</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-primary" />;
      case 'station_manager': return <MapPin className="w-4 h-4 text-amber-600" />;
      default: return <User className="w-4 h-4 text-sky-600" />;
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const smCount = users.filter(u => u.role === 'station_manager').length;
  const empCount = users.filter(u => u.role === 'employee').length;

  return (
    <DashboardLayout>
      <div className={cn("space-y-6", isRTL && "text-right")}>
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isAr ? 'إدارة المستخدمين' : 'User Management'}</h1>
            <p className="text-muted-foreground">{isAr ? 'إنشاء وإدارة حسابات المستخدمين والأدوار' : 'Create and manage user accounts and roles'}</p>
          </div>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button onClick={() => setDialogOpen(true)} className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="w-4 h-4" /> {isAr ? 'إضافة مستخدم' : 'Add User'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><UsersIcon className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{users.length}</p><p className="text-xs text-muted-foreground">{isAr ? 'إجمالي المستخدمين' : 'Total Users'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Shield className="w-5 h-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{adminCount}</p><p className="text-xs text-muted-foreground">{isAr ? 'مديرو النظام' : 'Admins'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><MapPin className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold">{smCount}</p><p className="text-xs text-muted-foreground">{isAr ? 'مديرو المحطات' : 'Station Managers'}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10"><UserCheck className="w-5 h-5 text-sky-600" /></div>
            <div><p className="text-2xl font-bold">{empCount}</p><p className="text-xs text-muted-foreground">{isAr ? 'الموظفون' : 'Employees'}</p></div>
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
                  <TableHead>{isAr ? 'المستخدم' : 'User'}</TableHead>
                  <TableHead>{isAr ? 'البريد' : 'Email'}</TableHead>
                  <TableHead>{isAr ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{isAr ? 'التفاصيل' : 'Details'}</TableHead>
                  <TableHead>{isAr ? 'تاريخ الإنشاء' : 'Created'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    {isAr ? 'جاري التحميل...' : 'Loading...'}
                  </TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{isAr ? 'لا توجد نتائج' : 'No results'}</TableCell></TableRow>
                ) : filtered.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {getRoleIcon(user.role)}
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell dir="ltr" className="text-left">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.role === 'station_manager' && user.station_name && (
                        <Badge variant="outline" className="gap-1"><MapPin className="w-3 h-3" />{user.station_name}</Badge>
                      )}
                      {user.role === 'employee' && user.employee_code && (
                        <Badge variant="outline">{user.employee_code}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isAr ? 'إنشاء مستخدم جديد' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{isAr ? 'الاسم الكامل' : 'Full Name'} *</Label>
                <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'} />
              </div>
              <div>
                <Label>{isAr ? 'البريد الإلكتروني' : 'Email'} *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" placeholder="user@company.com" />
              </div>
              <div>
                <Label>{isAr ? 'كلمة المرور' : 'Password'} *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    dir="ltr"
                    placeholder={isAr ? '6 أحرف على الأقل' : 'Min 6 characters'}
                    className="pe-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", isRTL ? "left-3" : "right-3")}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>{isAr ? 'الدور' : 'Role'} *</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v, station_code: '', employee_code: '' }))}>
                  <SelectTrigger><SelectValue placeholder={isAr ? 'اختر الدور' : 'Select role'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> {isAr ? 'مدير النظام' : 'Admin'}</span>
                    </SelectItem>
                    <SelectItem value="station_manager">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {isAr ? 'مدير محطة' : 'Station Manager'}</span>
                    </SelectItem>
                    <SelectItem value="employee">
                      <span className="flex items-center gap-2"><User className="w-4 h-4" /> {isAr ? 'موظف' : 'Employee'}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.role === 'station_manager' && (
                <div>
                  <Label>{isAr ? 'المحطة' : 'Station'} *</Label>
                  <Select value={form.station_code} onValueChange={v => setForm(f => ({ ...f, station_code: v }))}>
                    <SelectTrigger><SelectValue placeholder={isAr ? 'اختر المحطة' : 'Select station'} /></SelectTrigger>
                    <SelectContent>
                      {stations.map(s => (
                        <SelectItem key={s.code} value={s.code}>
                          <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {isAr ? s.name_ar : s.name_en}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {form.role === 'employee' && (
                <div>
                  <Label>{isAr ? 'رقم الموظف' : 'Employee Code'}</Label>
                  <Select value={form.employee_code} onValueChange={v => setForm(f => ({ ...f, employee_code: v }))}>
                    <SelectTrigger><SelectValue placeholder={isAr ? 'اختر الموظف (اختياري)' : 'Select employee (optional)'} /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => (
                        <SelectItem key={e.employee_code} value={e.employee_code}>
                          {e.employee_code} — {isAr ? e.name_ar : e.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">{isAr ? 'اختياري: لربط الحساب بسجل موظف موجود' : 'Optional: link to existing employee record'}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'إنشاء الحساب' : 'Create Account')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Users;
