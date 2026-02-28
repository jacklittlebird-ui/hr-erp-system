import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Search, Plus, Edit2, Building2, Plane, Timer,
  Clock, Calendar, Filter, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { sampleAttendanceRules, sampleShiftDefinitions } from '@/types/attendance';
import { stationLocations } from '@/data/stationLocations';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { toast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  employeeId: string;
  attendanceRuleId: string;
  stationValue: string;
  shiftId?: string;
  effectiveFrom: string;
  isActive: boolean;
}

export const EmployeeAssignment = () => {
  const { t, isRTL, language } = useLanguage();
  const { employees: contextEmployees } = useEmployeeData();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceRuleId: '',
    stationValue: '',
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const rules = sampleAttendanceRules;
  const shifts = sampleShiftDefinitions;

  const getRule = (ruleId: string) => rules.find(r => r.id === ruleId);
  const getShift = (shiftId?: string) => shiftId ? shifts.find(s => s.id === shiftId) : null;
  const getStationLabel = (val: string) => {
    const s = stationLocations.find(st => st.value === val);
    if (!s) return val;
    return language === 'ar' ? s.labelAr : s.labelEn;
  };

  const getEmployee = (empId: string) => contextEmployees.find(e => e.id === empId);

  const getRuleBadgeColor = (ruleId: string) => {
    const rule = getRule(ruleId);
    if (!rule) return 'bg-gray-100 text-gray-700';
    switch (rule.scheduleType) {
      case 'fixed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'flexible': return 'bg-green-100 text-green-700 border-green-300';
      case 'shift': return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const getRuleIcon = (ruleId: string) => {
    const rule = getRule(ruleId);
    if (!rule) return <Clock className="w-4 h-4" />;
    switch (rule.scheduleType) {
      case 'fixed': return <Building2 className="w-4 h-4" />;
      case 'flexible': return <Timer className="w-4 h-4" />;
      case 'shift': return <Plane className="w-4 h-4" />;
    }
  };

  // Filter employees by selected station for cascading selection
  const filteredEmployeesForForm = useMemo(() => {
    if (!formData.stationValue) return contextEmployees;
    return contextEmployees.filter(e => {
      const empStation = e.stationName?.toLowerCase() || '';
      const selectedStation = stationLocations.find(s => s.value === formData.stationValue);
      if (!selectedStation) return true;
      return empStation === selectedStation.labelEn.toLowerCase() || empStation === selectedStation.labelAr;
    });
  }, [contextEmployees, formData.stationValue]);

  const handleSaveAssignment = () => {
    if (!formData.employeeId || !formData.attendanceRuleId || !formData.stationValue) {
      toast({
        title: language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingAssignment) {
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment 
          ? {
              ...a,
              attendanceRuleId: formData.attendanceRuleId,
              stationValue: formData.stationValue,
              shiftId: formData.shiftId || undefined,
              effectiveFrom: formData.effectiveFrom,
            }
          : a
      ));
      toast({ title: language === 'ar' ? 'تم تحديث التعيين بنجاح' : 'Assignment updated successfully' });
    } else {
      // Check if employee already has an assignment
      const existing = assignments.find(a => a.employeeId === formData.employeeId && a.isActive);
      if (existing) {
        toast({
          title: language === 'ar' ? 'هذا الموظف معين بالفعل' : 'Employee already assigned',
          variant: 'destructive',
        });
        return;
      }

      const newAssignment: Assignment = {
        id: `assign-${Date.now()}`,
        employeeId: formData.employeeId,
        attendanceRuleId: formData.attendanceRuleId,
        stationValue: formData.stationValue,
        shiftId: formData.shiftId || undefined,
        effectiveFrom: formData.effectiveFrom,
        isActive: true,
      };
      setAssignments(prev => [...prev, newAssignment]);
      toast({ title: language === 'ar' ? 'تم التعيين بنجاح' : 'Assignment saved successfully' });
    }

    resetForm();
    setIsAssignDialogOpen(false);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setFormData({
      employeeId: assignment.employeeId,
      attendanceRuleId: assignment.attendanceRuleId,
      stationValue: assignment.stationValue,
      shiftId: assignment.shiftId || '',
      effectiveFrom: assignment.effectiveFrom,
    });
    setEditingAssignment(assignment.id);
    setIsAssignDialogOpen(true);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    toast({ title: language === 'ar' ? 'تم حذف التعيين' : 'Assignment deleted' });
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      attendanceRuleId: '',
      stationValue: '',
      shiftId: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
    setEditingAssignment(null);
  };

  const filteredAssignments = assignments.filter(a => {
    const emp = getEmployee(a.employeeId);
    const matchesSearch = emp ? (
      emp.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    ) : false;
    
    const matchesStation = stationFilter === 'all' || a.stationValue === stationFilter;
    const matchesRule = ruleFilter === 'all' || a.attendanceRuleId === ruleFilter;
    
    return (searchTerm === '' || matchesSearch) && matchesStation && matchesRule;
  });

  // Show which rule is shift-based for conditional shift selection
  const selectedRule = getRule(formData.attendanceRuleId);
  const isShiftRule = selectedRule?.scheduleType === 'shift';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex justify-between items-center flex-wrap gap-4", isRTL && "flex-row-reverse")}>
        <div>
          <h2 className="text-xl font-semibold">{t('attendance.assignment.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('attendance.assignment.subtitle')}</p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="w-4 h-4" />
              {t('attendance.assignment.assignEmployee')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAssignment ? t('attendance.assignment.editAssignment') : t('attendance.assignment.assignEmployee')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Station Selection */}
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'المحطة / الموقع' : 'Station / Location'}</Label>
                <Select 
                  value={formData.stationValue}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, stationValue: v, employeeId: '' }))}
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

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label>{t('attendance.assignment.employee')}</Label>
                <Select 
                  value={formData.employeeId} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, employeeId: v }))}
                  disabled={!!editingAssignment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendance.assignment.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployeesForForm.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {language === 'ar' ? emp.nameAr : emp.nameEn} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Attendance Rule */}
              <div className="space-y-2">
                <Label>{t('attendance.assignment.attendanceRule')}</Label>
                <Select 
                  value={formData.attendanceRuleId}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, attendanceRuleId: v, shiftId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendance.assignment.selectRule')} />
                  </SelectTrigger>
                  <SelectContent>
                    {rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {language === 'ar' ? rule.nameAr : rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Shift - only show if rule is shift-based */}
              {isShiftRule && (
                <div className="space-y-2">
                  <Label>{t('attendance.assignment.shift')}</Label>
                  <Select 
                    value={formData.shiftId}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, shiftId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('attendance.assignment.selectShift')} />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {language === 'ar' ? shift.nameAr : shift.name} ({shift.startTime} - {shift.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Effective From */}
              <div className="space-y-2">
                <Label>{t('attendance.assignment.effectiveFrom')}</Label>
                <Input 
                  type="date" 
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
              </div>
              
              <Button className="w-full" onClick={handleSaveAssignment}>
                {t('attendance.assignment.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className={cn("flex flex-wrap gap-4", isRTL && "flex-row-reverse")}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('attendance.assignment.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
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
            
            <Select value={ruleFilter} onValueChange={setRuleFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attendance.assignment.allRules')}</SelectItem>
                {rules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {language === 'ar' ? rule.nameAr : rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي التعيينات' : 'Total Assignments'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{new Set(assignments.map(a => a.stationValue)).size}</p>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المحطات المغطاة' : 'Stations Covered'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.filter(a => a.shiftId).length}</p>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'بنظام الورديات' : 'On Shift System'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Users className="w-5 h-5" />
            {t('attendance.assignment.employeeAssignments')}
          </CardTitle>
          <CardDescription>
            {filteredAssignments.length} {t('attendance.assignment.employees')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{language === 'ar' ? 'لا توجد تعيينات بعد. اضغط على زر "تعيين موظف" للبدء.' : 'No assignments yet. Click "Assign Employee" to get started.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.employee')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{language === 'ar' ? 'المحطة' : 'Station'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.attendanceRule')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.shift')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.effectiveFrom')}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => {
                    const emp = getEmployee(assignment.employeeId);
                    const rule = getRule(assignment.attendanceRuleId);
                    const shift = getShift(assignment.shiftId);
                    
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {emp ? emp.nameEn.split(' ').map(n => n[0]).join('') : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {emp ? (language === 'ar' ? emp.nameAr : emp.nameEn) : assignment.employeeId}
                              </p>
                              <p className="text-sm text-muted-foreground">{emp?.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="w-3 h-3" />
                            {getStationLabel(assignment.stationValue)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule && (
                            <Badge variant="outline" className={cn("gap-1", getRuleBadgeColor(assignment.attendanceRuleId))}>
                              {getRuleIcon(assignment.attendanceRuleId)}
                              {language === 'ar' ? rule.nameAr : rule.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {shift ? (
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: shift.color }} />
                              <span className="text-sm">{language === 'ar' ? shift.nameAr : shift.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{assignment.effectiveFrom}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditAssignment(assignment)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAssignment(assignment.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
