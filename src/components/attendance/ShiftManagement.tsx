import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Plus, Edit2, Trash2, Calendar, Users, Moon, Sun, Sunset, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShiftDefinition } from '@/types/attendance';
import { stationLocations } from '@/data/stationLocations';
import { toast } from '@/hooks/use-toast';

// Initial sample shifts using station values
const initialShifts: ShiftDefinition[] = [
  {
    id: 'shift-morning',
    name: 'Morning Shift',
    nameAr: 'وردية صباحية',
    code: 'MORNING',
    startTime: '06:00',
    endTime: '14:00',
    isOvernight: false,
    breakDuration: 30,
    workDuration: 8,
    color: '#22c55e',
    locationId: 'cairo',
    order: 1,
  },
  {
    id: 'shift-afternoon',
    name: 'Afternoon Shift',
    nameAr: 'وردية مسائية',
    code: 'AFTERNOON',
    startTime: '14:00',
    endTime: '22:00',
    isOvernight: false,
    breakDuration: 30,
    workDuration: 8,
    color: '#f59e0b',
    locationId: 'cairo',
    order: 2,
  },
  {
    id: 'shift-night',
    name: 'Night Shift',
    nameAr: 'وردية ليلية',
    code: 'NIGHT',
    startTime: '22:00',
    endTime: '06:00',
    isOvernight: true,
    breakDuration: 30,
    workDuration: 8,
    color: '#6366f1',
    locationId: 'cairo',
    order: 3,
  },
];

export const ShiftManagement = () => {
  const { t, isRTL, language } = useLanguage();
  const [shifts, setShifts] = useState<ShiftDefinition[]>(initialShifts);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ShiftDefinition>>({
    name: '',
    nameAr: '',
    code: '',
    startTime: '08:00',
    endTime: '16:00',
    breakDuration: 30,
    color: '#22c55e',
    locationId: '',
    isOvernight: false,
    order: 1,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      code: '',
      startTime: '08:00',
      endTime: '16:00',
      breakDuration: 30,
      color: '#22c55e',
      locationId: '',
      isOvernight: false,
      order: 1,
    });
    setEditingShiftId(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (shift: ShiftDefinition) => {
    setFormData({
      name: shift.name,
      nameAr: shift.nameAr,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      color: shift.color,
      locationId: shift.locationId,
      isOvernight: shift.isOvernight,
      order: shift.order,
    });
    setEditingShiftId(shift.id);
    setIsDialogOpen(true);
  };

  const getShiftIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'MORNING': return <Sun className="w-4 h-4" />;
      case 'AFTERNOON': return <Sunset className="w-4 h-4" />;
      case 'NIGHT': return <Moon className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStationLabel = (stationValue: string) => {
    const station = stationLocations.find(s => s.value === stationValue);
    if (!station) return stationValue;
    return language === 'ar' ? station.labelAr : station.labelEn;
  };

  const calculateWorkDuration = (start: string, end: string, isOvernight: boolean): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    if (isOvernight && endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    return (endMinutes - startMinutes) / 60;
  };

  const handleSaveShift = () => {
    if (!formData.name || !formData.startTime || !formData.endTime || !formData.locationId) {
      toast({
        title: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const workDuration = calculateWorkDuration(formData.startTime, formData.endTime!, formData.isOvernight || false);
    
    if (editingShiftId) {
      setShifts(prev => prev.map(shift => {
        if (shift.id === editingShiftId) {
          return {
            ...shift,
            name: formData.name!,
            nameAr: formData.nameAr || formData.name!,
            code: formData.code || formData.name!.toUpperCase().replace(/\s/g, '_'),
            startTime: formData.startTime!,
            endTime: formData.endTime!,
            isOvernight: formData.isOvernight || false,
            breakDuration: formData.breakDuration || 30,
            workDuration,
            color: formData.color || '#22c55e',
            locationId: formData.locationId!,
          };
        }
        return shift;
      }));
      toast({ title: language === 'ar' ? 'تم تحديث الوردية بنجاح' : 'Shift updated successfully' });
    } else {
      const shift: ShiftDefinition = {
        id: `shift-${Date.now()}`,
        name: formData.name!,
        nameAr: formData.nameAr || formData.name!,
        code: formData.code || formData.name!.toUpperCase().replace(/\s/g, '_'),
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        isOvernight: formData.isOvernight || false,
        breakDuration: formData.breakDuration || 30,
        workDuration,
        color: formData.color || '#22c55e',
        locationId: formData.locationId!,
        order: shifts.length + 1,
      };
      setShifts(prev => [...prev, shift]);
      toast({ title: language === 'ar' ? 'تمت إضافة الوردية بنجاح' : 'Shift added successfully' });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    toast({ title: language === 'ar' ? 'تم حذف الوردية' : 'Shift deleted' });
  };

  const filteredShifts = selectedLocation === 'all' 
    ? shifts 
    : shifts.filter(s => s.locationId === selectedLocation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <div>
          <h2 className="text-xl font-semibold">{t('attendance.shifts.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('attendance.shifts.subtitle')}</p>
        </div>
        <Button onClick={handleOpenAddDialog} className={cn("gap-2", isRTL && "flex-row-reverse")}>
          <Plus className="w-4 h-4" />
          {t('attendance.shifts.addShift')}
        </Button>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingShiftId 
                ? (language === 'ar' ? 'تعديل الوردية' : 'Edit Shift') 
                : t('attendance.shifts.addShift')
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.shifts.nameEn')}</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Morning Shift"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.shifts.nameAr')}</Label>
                <Input 
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="وردية صباحية"
                  dir="rtl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.shifts.startTime')}</Label>
                <Input 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.shifts.endTime')}</Label>
                <Input 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المحطة / الموقع' : 'Station / Location'}</Label>
              <Select 
                value={formData.locationId}
                onValueChange={(v) => setFormData({ ...formData, locationId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر المحطة' : 'Select Station'} />
                </SelectTrigger>
                <SelectContent>
                  {stationLocations.map((station) => (
                    <SelectItem key={station.value} value={station.value}>
                      {language === 'ar' ? station.labelAr : station.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.shifts.breakDuration')}</Label>
                <Input 
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData({ ...formData, breakDuration: Number(e.target.value) })}
                  min={0}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.shifts.color')}</Label>
                <Input 
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="overnight">{t('attendance.shifts.overnight')}</Label>
              <Switch 
                id="overnight"
                checked={formData.isOvernight}
                onCheckedChange={(checked) => setFormData({ ...formData, isOvernight: checked })}
              />
            </div>
            
            <Button onClick={handleSaveShift} className="w-full">
              {editingShiftId 
                ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                : t('attendance.shifts.save')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Station Filter */}
      <div className={cn("flex gap-4 items-center", isRTL && "flex-row-reverse")}>
        <Label>{language === 'ar' ? 'تصفية حسب المحطة' : 'Filter by Station'}</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'ar' ? 'جميع المحطات' : 'All Stations'}</SelectItem>
            {stationLocations.map((station) => (
              <SelectItem key={station.value} value={station.value}>
                {language === 'ar' ? station.labelAr : station.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.map((shift) => (
          <Card key={shift.id} className="relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 right-0 h-1" 
              style={{ backgroundColor: shift.color }}
            />
            <CardHeader className="pb-2">
              <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${shift.color}20` }}
                  >
                    {getShiftIcon(shift.code)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {language === 'ar' ? shift.nameAr : shift.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{shift.code}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(shift)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteShift(shift.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t('attendance.shifts.time')}</span>
                <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
              </div>
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t('attendance.shifts.duration')}</span>
                <span className="font-medium">{shift.workDuration}h</span>
              </div>
              <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                <span className="text-muted-foreground">{t('attendance.shifts.break')}</span>
                <span className="font-medium">{shift.breakDuration} min</span>
              </div>
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <span className="text-sm text-muted-foreground">{language === 'ar' ? 'المحطة' : 'Station'}</span>
                <Badge variant="outline" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  {getStationLabel(shift.locationId)}
                </Badge>
              </div>
              {shift.isOvernight && (
                <Badge variant="secondary" className="gap-1">
                  <Moon className="w-3 h-3" />
                  {t('attendance.shifts.overnightShift')}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shift Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Calendar className="w-5 h-5" />
            {t('attendance.shifts.scheduleOverview')}
          </CardTitle>
          <CardDescription>{t('attendance.shifts.scheduleDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.shift')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'المحطة' : 'Station'}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.time')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.duration')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color }} />
                        {language === 'ar' ? shift.nameAr : shift.name}
                      </div>
                    </TableCell>
                    <TableCell>{getStationLabel(shift.locationId)}</TableCell>
                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                    <TableCell>{shift.workDuration}h</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
