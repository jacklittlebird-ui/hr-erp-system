import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Calendar, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PORTAL_EMPLOYEE_ID = 'Emp001';

export const PortalLeaves = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getLeaveBalances, getLeaveRequests, addLeaveRequest, getPermissions, addPermission } = usePortalData();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPermDialog, setShowPermDialog] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [permType, setPermType] = useState('');
  const [permDate, setPermDate] = useState('');
  const [permFrom, setPermFrom] = useState('');
  const [permTo, setPermTo] = useState('');
  const [permReason, setPermReason] = useState('');

  const balances = useMemo(() => getLeaveBalances(PORTAL_EMPLOYEE_ID), [getLeaveBalances]);
  const requests = useMemo(() => getLeaveRequests(PORTAL_EMPLOYEE_ID), [getLeaveRequests]);
  const permissions = useMemo(() => getPermissions(PORTAL_EMPLOYEE_ID), [getPermissions]);

  const statusCls: Record<string, string> = {
    approved: 'bg-success/10 text-success border-success',
    pending: 'bg-warning/10 text-warning border-warning',
    rejected: 'bg-destructive/10 text-destructive border-destructive',
  };
  const statusLabel: Record<string, { ar: string; en: string }> = {
    approved: { ar: 'مقبول', en: 'Approved' },
    pending: { ar: 'معلق', en: 'Pending' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  const leaveTypes = [
    { value: 'annual', ar: 'سنوية', en: 'Annual' },
    { value: 'sick', ar: 'مرضية', en: 'Sick' },
    { value: 'casual', ar: 'عارضة', en: 'Casual' },
    { value: 'unpaid', ar: 'بدون راتب', en: 'Unpaid' },
  ];

  const permTypes = [
    { value: 'early_leave', ar: 'انصراف مبكر', en: 'Early Leave' },
    { value: 'late_arrival', ar: 'تأخر صباحي', en: 'Late Arrival' },
    { value: 'personal', ar: 'شخصي', en: 'Personal' },
    { value: 'medical', ar: 'طبي', en: 'Medical' },
  ];

  const handleSubmitLeave = () => {
    if (!leaveType || !leaveFrom || !leaveTo) { toast.error(ar ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    const t = leaveTypes.find(l => l.value === leaveType);
    const d1 = new Date(leaveFrom); const d2 = new Date(leaveTo);
    const days = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / 86400000) + 1);
    addLeaveRequest({ employeeId: PORTAL_EMPLOYEE_ID, typeAr: t?.ar || '', typeEn: t?.en || '', from: leaveFrom, to: leaveTo, days });
    toast.success(ar ? 'تم تقديم طلب الإجازة بنجاح' : 'Leave request submitted');
    setShowLeaveDialog(false); setLeaveType(''); setLeaveFrom(''); setLeaveTo('');
  };

  const handleSubmitPerm = () => {
    if (!permType || !permDate || !permFrom || !permTo) { toast.error(ar ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    const t = permTypes.find(p => p.value === permType);
    addPermission({ employeeId: PORTAL_EMPLOYEE_ID, typeAr: t?.ar || '', typeEn: t?.en || '', date: permDate, fromTime: permFrom, toTime: permTo, reason: permReason });
    toast.success(ar ? 'تم تقديم طلب الإذن بنجاح' : 'Permission request submitted');
    setShowPermDialog(false); setPermType(''); setPermDate(''); setPermFrom(''); setPermTo(''); setPermReason('');
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'الإجازات والأذونات' : 'Leaves & Permissions'}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowPermDialog(true)} variant="outline"><Clock className="w-4 h-4 mr-1" />{ar ? 'طلب إذن' : 'Request Permission'}</Button>
          <Button onClick={() => setShowLeaveDialog(true)}><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب إجازة' : 'Request Leave'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((b, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <p className="font-semibold text-lg">{ar ? b.typeAr : b.typeEn}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted-foreground">{ar ? 'الإجمالي' : 'Total'}: <strong>{b.total}</strong></span>
                <span className="text-destructive">{ar ? 'مستخدم' : 'Used'}: <strong>{b.used}</strong></span>
                <span className="text-success">{ar ? 'متبقي' : 'Left'}: <strong>{b.remaining}</strong></span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(b.used / b.total) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="leaves" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList>
          <TabsTrigger value="leaves">{ar ? 'الإجازات' : 'Leaves'}</TabsTrigger>
          <TabsTrigger value="permissions">{ar ? 'الأذونات' : 'Permissions'}</TabsTrigger>
        </TabsList>

        <TabsContent value="leaves">
          <Card>
            <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Calendar className="w-5 h-5" />{ar ? 'طلبات الإجازات' : 'Leave Requests'}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'من' : 'From'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إلى' : 'To'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الأيام' : 'Days'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {requests.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{ar ? r.typeAr : r.typeEn}</TableCell>
                      <TableCell>{r.from}</TableCell>
                      <TableCell>{r.to}</TableCell>
                      <TableCell>{r.days}</TableCell>
                      <TableCell><Badge variant="outline" className={statusCls[r.status]}>{ar ? statusLabel[r.status].ar : statusLabel[r.status].en}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {requests.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد طلبات' : 'No requests'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><Clock className="w-5 h-5" />{ar ? 'طلبات الأذونات' : 'Permission Requests'}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'من' : 'From'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'إلى' : 'To'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {permissions.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{ar ? p.typeAr : p.typeEn}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.fromTime}</TableCell>
                      <TableCell>{p.toTime}</TableCell>
                      <TableCell><Badge variant="outline" className={statusCls[p.status]}>{ar ? statusLabel[p.status].ar : statusLabel[p.status].en}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {permissions.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد أذونات' : 'No permissions'}</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent><DialogHeader><DialogTitle>{ar ? 'طلب إجازة جديدة' : 'New Leave Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{ar ? 'نوع الإجازة' : 'Leave Type'}</Label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger><SelectValue placeholder={ar ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{leaveTypes.map(t => <SelectItem key={t.value} value={t.value}>{ar ? t.ar : t.en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{ar ? 'من' : 'From'}</Label><Input type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} /></div>
              <div><Label>{ar ? 'إلى' : 'To'}</Label><Input type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSubmitLeave}>{ar ? 'تقديم الطلب' : 'Submit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={showPermDialog} onOpenChange={setShowPermDialog}>
        <DialogContent><DialogHeader><DialogTitle>{ar ? 'طلب إذن جديد' : 'New Permission Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{ar ? 'نوع الإذن' : 'Permission Type'}</Label>
              <Select value={permType} onValueChange={setPermType}>
                <SelectTrigger><SelectValue placeholder={ar ? 'اختر' : 'Select'} /></SelectTrigger>
                <SelectContent>{permTypes.map(t => <SelectItem key={t.value} value={t.value}>{ar ? t.ar : t.en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{ar ? 'التاريخ' : 'Date'}</Label><Input type="date" value={permDate} onChange={e => setPermDate(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{ar ? 'من' : 'From'}</Label><Input type="time" value={permFrom} onChange={e => setPermFrom(e.target.value)} /></div>
              <div><Label>{ar ? 'إلى' : 'To'}</Label><Input type="time" value={permTo} onChange={e => setPermTo(e.target.value)} /></div>
            </div>
            <div><Label>{ar ? 'السبب' : 'Reason'}</Label><Input value={permReason} onChange={e => setPermReason(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmitPerm}>{ar ? 'تقديم الطلب' : 'Submit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
