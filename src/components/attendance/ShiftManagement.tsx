import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, Edit2, Trash2, Calendar, Users, Moon, Sun, Sunset, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShiftDefinition, Location, sampleShiftDefinitions, sampleLocations } from '@/types/attendance';

export const ShiftManagement = () => {
  const { t, isRTL, language } = useLanguage();
  const [shifts, setShifts] = useState<ShiftDefinition[]>(sampleShiftDefinitions);
  const [locations] = useState<Location[]>(sampleLocations);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null);
  
  // New shift form state
  const [newShift, setNewShift] = useState<Partial<ShiftDefinition>>({
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

  const getShiftIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'MORNING':
        return <Sun className="w-4 h-4" />;
      case 'AFTERNOON':
        return <Sunset className="w-4 h-4" />;
      case 'NIGHT':
        return <Moon className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  const handleAddShift = () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime || !newShift.locationId) return;
    
    const workDuration = calculateWorkDuration(
      newShift.startTime,
      newShift.endTime!,
      newShift.isOvernight || false
    );
    
    const shift: ShiftDefinition = {
      id: `shift-${Date.now()}`,
      name: newShift.name,
      nameAr: newShift.nameAr || newShift.name,
      code: newShift.code || newShift.name.toUpperCase().replace(/\s/g, '_'),
      startTime: newShift.startTime,
      endTime: newShift.endTime!,
      isOvernight: newShift.isOvernight || false,
      breakDuration: newShift.breakDuration || 30,
      workDuration,
      color: newShift.color || '#22c55e',
      locationId: newShift.locationId,
      order: shifts.length + 1,
    };
    
    setShifts([...shifts, shift]);
    setNewShift({
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
    setIsAddDialogOpen(false);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
  };

  const filteredShifts = selectedLocation === 'all' 
    ? shifts 
    : shifts.filter(s => s.locationId === selectedLocation);

  const airportLocations = locations.filter(l => l.type === 'airport');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
        <div>
          <h2 className="text-xl font-semibold">{t('attendance.shifts.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('attendance.shifts.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="w-4 h-4" />
              {t('attendance.shifts.addShift')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('attendance.shifts.addShift')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('attendance.shifts.nameEn')}</Label>
                  <Input 
                    value={newShift.name}
                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                    placeholder="Morning Shift"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('attendance.shifts.nameAr')}</Label>
                  <Input 
                    value={newShift.nameAr}
                    onChange={(e) => setNewShift({ ...newShift, nameAr: e.target.value })}
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
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('attendance.shifts.endTime')}</Label>
                  <Input 
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('attendance.shifts.location')}</Label>
                <Select 
                  value={newShift.locationId}
                  onValueChange={(v) => setNewShift({ ...newShift, locationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendance.shifts.selectLocation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {airportLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {language === 'ar' ? loc.nameAr : loc.name}
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
                    value={newShift.breakDuration}
                    onChange={(e) => setNewShift({ ...newShift, breakDuration: Number(e.target.value) })}
                    min={0}
                    max={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('attendance.shifts.color')}</Label>
                  <Input 
                    type="color"
                    value={newShift.color}
                    onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                    className="h-10 p-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="overnight">{t('attendance.shifts.overnight')}</Label>
                <Switch 
                  id="overnight"
                  checked={newShift.isOvernight}
                  onCheckedChange={(checked) => setNewShift({ ...newShift, isOvernight: checked })}
                />
              </div>
              
              <Button onClick={handleAddShift} className="w-full">
                {t('attendance.shifts.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location Filter */}
      <div className={cn("flex gap-4 items-center", isRTL && "flex-row-reverse")}>
        <Label>{t('attendance.shifts.filterByLocation')}</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('attendance.shifts.allLocations')}</SelectItem>
            {airportLocations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {language === 'ar' ? loc.nameAr : loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.map((shift) => {
          const location = locations.find(l => l.id === shift.locationId);
          return (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteShift(shift.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t('attendance.shifts.time')}</span>
                  <span className="font-medium">
                    {shift.startTime} - {shift.endTime}
                  </span>
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
                  <span className="text-sm text-muted-foreground">{t('attendance.shifts.location')}</span>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {location ? (language === 'ar' ? location.nameAr : location.name) : '-'}
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
          );
        })}
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
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.location')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.time')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.duration')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.employees')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.shifts.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.map((shift) => {
                  const location = locations.find(l => l.id === shift.locationId);
                  return (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: shift.color }}
                          />
                          {language === 'ar' ? shift.nameAr : shift.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {location ? (language === 'ar' ? location.nameAr : location.name) : '-'}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {shift.startTime} → {shift.endTime}
                        </code>
                      </TableCell>
                      <TableCell>{shift.workDuration}h</TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{Math.floor(Math.random() * 20) + 5}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-success">
                          {t('attendance.shifts.active')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
