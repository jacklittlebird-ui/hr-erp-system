import { useState } from 'react';
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
  Clock, Calendar, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EmployeeAttendanceAssignment, 
  sampleAttendanceRules, 
  sampleLocations,
  sampleShiftDefinitions
} from '@/types/attendance';

interface EmployeeData {
  id: string;
  name: string;
  nameAr: string;
  department: string;
  jobTitle: string;
  avatar?: string;
}

const sampleEmployees: EmployeeData[] = [
  { id: 'EMP001', name: 'Ahmed Mohamed', nameAr: 'أحمد محمد', department: 'IT', jobTitle: 'Developer' },
  { id: 'EMP002', name: 'Sara Ali', nameAr: 'سارة علي', department: 'HR', jobTitle: 'HR Specialist' },
  { id: 'EMP003', name: 'Mohamed Hassan', nameAr: 'محمد حسن', department: 'Security', jobTitle: 'Security Officer' },
  { id: 'EMP004', name: 'Fatima Omar', nameAr: 'فاطمة عمر', department: 'Security', jobTitle: 'Security Officer' },
  { id: 'EMP005', name: 'Ali Mahmoud', nameAr: 'علي محمود', department: 'Operations', jobTitle: 'Operations Manager' },
  { id: 'EMP006', name: 'Nour Ahmed', nameAr: 'نور أحمد', department: 'Security', jobTitle: 'Security Supervisor' },
];

const sampleAssignments: (EmployeeAttendanceAssignment & { employee: EmployeeData })[] = [
  {
    id: 'assign-1',
    employeeId: 'EMP001',
    attendanceRuleId: 'rule-hq-fixed',
    locationId: 'loc-hq',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[0],
  },
  {
    id: 'assign-2',
    employeeId: 'EMP002',
    attendanceRuleId: 'rule-hq-flexible',
    locationId: 'loc-hq',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[1],
  },
  {
    id: 'assign-3',
    employeeId: 'EMP003',
    attendanceRuleId: 'rule-airport-3shift',
    locationId: 'loc-cai',
    shiftId: 'shift-morning',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[2],
  },
  {
    id: 'assign-4',
    employeeId: 'EMP004',
    attendanceRuleId: 'rule-airport-3shift',
    locationId: 'loc-cai',
    shiftId: 'shift-afternoon',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[3],
  },
  {
    id: 'assign-5',
    employeeId: 'EMP005',
    attendanceRuleId: 'rule-hq-fixed',
    locationId: 'loc-hq',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[4],
  },
  {
    id: 'assign-6',
    employeeId: 'EMP006',
    attendanceRuleId: 'rule-airport-3shift',
    locationId: 'loc-hrg',
    shiftId: 'shift-night',
    effectiveFrom: '2024-01-01',
    isActive: true,
    employee: sampleEmployees[5],
  },
];

export const EmployeeAssignment = () => {
  const { t, isRTL, language } = useLanguage();
  const [assignments, setAssignments] = useState(sampleAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
  
  // Form state for new/edit assignment
  const [formData, setFormData] = useState({
    employeeId: '',
    attendanceRuleId: '',
    locationId: '',
    shiftId: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const rules = sampleAttendanceRules;
  const locations = sampleLocations;
  const shifts = sampleShiftDefinitions;

  const getRule = (ruleId: string) => rules.find(r => r.id === ruleId);
  const getLocation = (locationId: string) => locations.find(l => l.id === locationId);
  const getShift = (shiftId?: string) => shiftId ? shifts.find(s => s.id === shiftId) : null;

  const getRuleIcon = (ruleId: string) => {
    const rule = getRule(ruleId);
    if (!rule) return <Clock className="w-4 h-4" />;
    switch (rule.scheduleType) {
      case 'fixed': return <Building2 className="w-4 h-4" />;
      case 'flexible': return <Timer className="w-4 h-4" />;
      case 'shift': return <Plane className="w-4 h-4" />;
    }
  };

  const getRuleBadgeColor = (ruleId: string) => {
    const rule = getRule(ruleId);
    if (!rule) return 'bg-gray-100 text-gray-700';
    switch (rule.scheduleType) {
      case 'fixed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'flexible': return 'bg-green-100 text-green-700 border-green-300';
      case 'shift': return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const handleSaveAssignment = () => {
    if (!formData.employeeId || !formData.attendanceRuleId || !formData.locationId) {
      return;
    }

    const employee = sampleEmployees.find(e => e.id === formData.employeeId);
    if (!employee) return;

    if (editingAssignment) {
      // Update existing
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment 
          ? {
              ...a,
              attendanceRuleId: formData.attendanceRuleId,
              locationId: formData.locationId,
              shiftId: formData.shiftId || undefined,
              effectiveFrom: formData.effectiveFrom,
            }
          : a
      ));
    } else {
      // Add new
      const newAssignment = {
        id: `assign-${Date.now()}`,
        employeeId: formData.employeeId,
        attendanceRuleId: formData.attendanceRuleId,
        locationId: formData.locationId,
        shiftId: formData.shiftId || undefined,
        effectiveFrom: formData.effectiveFrom,
        isActive: true,
        employee,
      };
      setAssignments(prev => [...prev, newAssignment]);
    }

    setFormData({
      employeeId: '',
      attendanceRuleId: '',
      locationId: '',
      shiftId: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
    setEditingAssignment(null);
    setIsAssignDialogOpen(false);
  };

  const handleEditAssignment = (assignment: typeof sampleAssignments[0]) => {
    setFormData({
      employeeId: assignment.employeeId,
      attendanceRuleId: assignment.attendanceRuleId,
      locationId: assignment.locationId,
      shiftId: assignment.shiftId || '',
      effectiveFrom: assignment.effectiveFrom,
    });
    setEditingAssignment(assignment.id);
    setIsAssignDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      attendanceRuleId: '',
      locationId: '',
      shiftId: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
    });
    setEditingAssignment(null);
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = 
      a.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employee.nameAr.includes(searchTerm) ||
      a.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || a.locationId === locationFilter;
    const matchesRule = ruleFilter === 'all' || a.attendanceRuleId === ruleFilter;
    
    return matchesSearch && matchesLocation && matchesRule;
  });

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
                    {sampleEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {language === 'ar' ? emp.nameAr : emp.name} ({emp.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('attendance.assignment.attendanceRule')}</Label>
                <Select 
                  value={formData.attendanceRuleId}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, attendanceRuleId: v }))}
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
              
              <div className="space-y-2">
                <Label>{t('attendance.assignment.location')}</Label>
                <Select 
                  value={formData.locationId}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, locationId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('attendance.assignment.selectLocation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {language === 'ar' ? loc.nameAr : loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
                    <SelectItem value="none">{t('attendance.assignment.noShift')}</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {language === 'ar' ? shift.nameAr : shift.name} ({shift.startTime} - {shift.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('attendance.assignment.allLocations')}</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {language === 'ar' ? loc.nameAr : loc.name}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.employee')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.department')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.location')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.attendanceRule')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.shift')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.effectiveFrom')}</TableHead>
                  <TableHead className={cn(isRTL && "text-right")}>{t('attendance.assignment.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => {
                  const rule = getRule(assignment.attendanceRuleId);
                  const location = getLocation(assignment.locationId);
                  const shift = getShift(assignment.shiftId);
                  
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={assignment.employee.avatar} />
                            <AvatarFallback>
                              {assignment.employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {language === 'ar' ? assignment.employee.nameAr : assignment.employee.name}
                            </p>
                            <p className="text-sm text-muted-foreground">{assignment.employeeId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.employee.department}</TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          {location?.type === 'airport' ? (
                            <Plane className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Building2 className="w-4 h-4 text-blue-500" />
                          )}
                          <span>{location ? (language === 'ar' ? location.nameAr : location.name) : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", getRuleBadgeColor(assignment.attendanceRuleId))}>
                          {getRuleIcon(assignment.attendanceRuleId)}
                          {rule ? (language === 'ar' ? rule.nameAr : rule.name) : '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shift ? (
                          <Badge 
                            variant="outline" 
                            style={{ 
                              backgroundColor: `${shift.color}20`, 
                              borderColor: shift.color,
                              color: shift.color 
                            }}
                          >
                            {language === 'ar' ? shift.nameAr : shift.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1 text-sm", isRTL && "flex-row-reverse")}>
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {assignment.effectiveFrom}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
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
