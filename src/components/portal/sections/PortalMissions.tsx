import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalData, MissionType } from '@/contexts/PortalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { MapPin, Plus, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PORTAL_EMPLOYEE_ID = 'Emp001';

const missionTypeLabels: Record<MissionType, { ar: string; en: string }> = {
  internal: { ar: 'داخلية', en: 'Internal' },
  external: { ar: 'خارجية', en: 'External' },
  training: { ar: 'تدريب', en: 'Training' },
  meeting: { ar: 'اجتماع', en: 'Meeting' },
  client_visit: { ar: 'زيارة عميل', en: 'Client Visit' },
};

export const PortalMissions = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { getMissions, addMission } = usePortalData();
  const missions = useMemo(() => getMissions(PORTAL_EMPLOYEE_ID), [getMissions]);
  const [showDialog, setShowDialog] = useState(false);
  const [missionType, setMissionType] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [dest, setDest] = useState('');
  const [reason, setReason] = useState('');

  const statusCls: Record<string, string> = {
    approved: 'bg-success/10 text-success border-success',
    pending: 'bg-warning/10 text-warning border-warning',
    rejected: 'bg-destructive/10 text-destructive border-destructive',
  };

  const missionTypeCls: Record<string, string> = {
    internal: 'bg-blue-100 text-blue-700 border-blue-300',
    external: 'bg-purple-100 text-purple-700 border-purple-300',
    training: 'bg-green-100 text-green-700 border-green-300',
    meeting: 'bg-orange-100 text-orange-700 border-orange-300',
    client_visit: 'bg-pink-100 text-pink-700 border-pink-300',
  };

  const handleSubmit = () => {
    if (!missionType || !date || !reason) {
      toast.error(ar ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    addMission({
      employeeId: PORTAL_EMPLOYEE_ID,
      missionType: missionType as MissionType,
      date: format(date, 'yyyy-MM-dd'),
      destAr: dest,
      destEn: dest,
      reasonAr: reason,
      reasonEn: reason,
    });
    toast.success(ar ? 'تم تقديم طلب المأمورية بنجاح' : 'Mission request submitted');
    setShowDialog(false);
    setMissionType('');
    setDate(undefined);
    setDest('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <h1 className="text-2xl font-bold">{ar ? 'مأمورياتي' : 'My Missions'}</h1>
        <Button onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-1" />{ar ? 'طلب مأمورية' : 'New Mission'}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <MapPin className="w-5 h-5" />{ar ? 'سجل المأموريات' : 'Mission Records'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النوع' : 'Type'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الوجهة' : 'Destination'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'السبب' : 'Reason'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map(m => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Badge variant="outline" className={missionTypeCls[m.missionType]}>
                      {ar ? missionTypeLabels[m.missionType].ar : missionTypeLabels[m.missionType].en}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell>{ar ? m.destAr : m.destEn}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{ar ? m.reasonAr : m.reasonEn}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusCls[m.status]}>
                      {m.status === 'approved' ? (ar ? 'مقبول' : 'Approved') : m.status === 'pending' ? (ar ? 'معلق' : 'Pending') : (ar ? 'مرفوض' : 'Rejected')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {missions.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">{ar ? 'لا توجد مأموريات' : 'No missions'}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ar ? 'طلب مأمورية جديدة' : 'New Mission Request'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{ar ? 'نوع المأمورية' : 'Mission Type'} <span className="text-destructive">*</span></Label>
                <Select value={missionType} onValueChange={setMissionType}>
                  <SelectTrigger><SelectValue placeholder={ar ? 'اختر النوع' : 'Select type'} /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(missionTypeLabels).map(([key, val]) => (
                      <SelectItem key={key} value={key}>{ar ? val.ar : val.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{ar ? 'التاريخ' : 'Date'} <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'yyyy-MM-dd') : (ar ? 'اختر التاريخ' : 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'الوجهة' : 'Destination'}</Label>
              <Input value={dest} onChange={e => setDest(e.target.value)} placeholder={ar ? 'أدخل الوجهة' : 'Enter destination'} />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'السبب' : 'Reason'} <span className="text-destructive">*</span></Label>
              <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder={ar ? 'أدخل سبب المأمورية' : 'Enter mission reason'} rows={4} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSubmit}>{ar ? 'تقديم الطلب' : 'Submit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
