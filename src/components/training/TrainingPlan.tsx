import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Plus, Calendar, CalendarDays, Users, FileText, 
  ChevronRight, Eye, Edit2, Trash2, Download, Check, ChevronsUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';

interface PlannedCourse {
  id: string;
  courseCode: string;
  courseName: string;
  provider: string;
  plannedDate: string;
  duration: string;
  participants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  trainer?: string;
  location?: string;
  cost?: number;
  assignedEmployees?: { employeeId: string; actualDate?: string }[];
}

const mockPlannedCourses: PlannedCourse[] = [
  { id: '1', courseCode: 'ER-001', courseName: 'Emergency Response', provider: 'Link Aero Training', plannedDate: '2024-03-15', duration: '2 days', participants: 15, status: 'scheduled', trainer: 'Dr. Ahmed Hassan', location: 'Training Center', cost: 5000 },
  { id: '2', courseCode: 'DGR-001', courseName: 'Dangerous Goods Handling', provider: 'IATA', plannedDate: '2024-03-20', duration: '5 days', participants: 10, status: 'scheduled', trainer: 'Eng. Mohamed Ali', location: 'Airport Office', cost: 8000 },
  { id: '3', courseCode: 'SEC-001', courseName: 'Aviation Security', provider: 'ECAA', plannedDate: '2024-02-10', duration: '3 days', participants: 20, status: 'completed', trainer: 'Mr. Hossam Hagag', location: 'Training Center', cost: 3000 },
  { id: '4', courseCode: 'RMP-001', courseName: 'Ramp Safety', provider: 'Internal', plannedDate: '2024-04-01', duration: '1 day', participants: 25, status: 'scheduled', trainer: 'Mr. Moatasem Mahmoud', location: 'Ramp Area', cost: 2000 },
];

interface StaffCourse {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  courseCode: string;
  courseName: string;
  dueDate: string;
  status: 'due' | 'overdue' | 'scheduled';
}

const mockStaffCourses: StaffCourse[] = [
  { id: '1', employeeId: '031', employeeName: 'Ibrahim Abdel Atty', department: 'Operations', courseCode: 'ER-001', courseName: 'Emergency Response', dueDate: '2024-03-15', status: 'due' },
  { id: '2', employeeId: '045', employeeName: 'Abanoub Adel Fekry', department: 'Operations', courseCode: 'DGR-001', courseName: 'Dangerous Goods', dueDate: '2024-02-28', status: 'overdue' },
  { id: '3', employeeId: '067', employeeName: 'Abdallah Ahmed', department: 'HR', courseCode: 'SEC-001', courseName: 'Aviation Security', dueDate: '2024-03-20', status: 'scheduled' },
];

// Training debt record for portal
export interface TrainingDebt {
  id: string;
  employeeId: string;
  courseName: string;
  cost: number;
  actualDate: string;
  expiryDate: string; // 3 years from actualDate
}

type ViewType = 'menu' | 'addCourse' | 'viewPlan' | 'nextYearPlan' | 'staffCourses' | 'staffReport';

export const TrainingPlan = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { employees } = useEmployeeData();
  const ar = language === 'ar';
  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [plannedCourses, setPlannedCourses] = usePersistedState<PlannedCourse[]>('hr_training_plan_courses', mockPlannedCourses);
  const [trainingDebts, setTrainingDebts] = usePersistedState<TrainingDebt[]>('hr_training_debts', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState<Partial<PlannedCourse & { selectedEmployeeIds: string[] }>>({});
  const [empOpen, setEmpOpen] = useState(false);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState<string | null>(null);
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignActualDate, setAssignActualDate] = useState('');
  const [assignEmpOpen, setAssignEmpOpen] = useState(false);

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled': return <Badge className="bg-blue-500">{t('training.plan.scheduled')}</Badge>;
      case 'in-progress': return <Badge className="bg-yellow-500">{t('training.plan.inProgress')}</Badge>;
      case 'completed': return <Badge className="bg-green-500">{t('training.plan.completed')}</Badge>;
      case 'cancelled': return <Badge variant="destructive">{t('training.plan.cancelled')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStaffStatusBadge = (status: string) => {
    switch(status) {
      case 'due': return <Badge className="bg-yellow-500">{t('training.plan.due')}</Badge>;
      case 'overdue': return <Badge variant="destructive">{t('training.plan.overdue')}</Badge>;
      case 'scheduled': return <Badge className="bg-green-500">{t('training.plan.scheduled')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddCourse = () => {
    if (!formData.courseCode || !formData.courseName || !formData.plannedDate) {
      toast({ title: t('common.error'), description: t('training.fillRequired'), variant: 'destructive' });
      return;
    }
    const newCourse: PlannedCourse = {
      id: String(Date.now()),
      courseCode: formData.courseCode || '',
      courseName: formData.courseName || '',
      provider: formData.provider || '',
      plannedDate: formData.plannedDate || '',
      duration: formData.duration || '',
      participants: formData.participants || 0,
      status: 'scheduled',
      trainer: formData.trainer,
      location: formData.location,
      cost: formData.cost || 0,
      assignedEmployees: [],
    };
    setPlannedCourses(prev => [...prev, newCourse]);
    setIsAddDialogOpen(false);
    setFormData({});
    toast({ title: t('common.success'), description: t('training.plan.courseAdded') });
  };

  const handleAssignEmployee = () => {
    if (!assignCourseId || !assignEmpId) return;
    const course = plannedCourses.find(c => c.id === assignCourseId);
    if (!course) return;

    // Add employee to the course
    const updatedCourses = plannedCourses.map(c => {
      if (c.id === assignCourseId) {
        const existing = c.assignedEmployees || [];
        if (existing.find(e => e.employeeId === assignEmpId)) {
          // Update actual date
          return { ...c, assignedEmployees: existing.map(e => e.employeeId === assignEmpId ? { ...e, actualDate: assignActualDate || undefined } : e) };
        }
        return { ...c, assignedEmployees: [...existing, { employeeId: assignEmpId, actualDate: assignActualDate || undefined }] };
      }
      return c;
    });
    setPlannedCourses(updatedCourses);

    // If actual date is set, create training debt
    if (assignActualDate && course.cost && course.cost > 0) {
      const expiryDate = new Date(assignActualDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);
      const debt: TrainingDebt = {
        id: `debt_${Date.now()}`,
        employeeId: assignEmpId,
        courseName: course.courseName,
        cost: course.cost,
        actualDate: assignActualDate,
        expiryDate: expiryDate.toISOString().split('T')[0],
      };
      // Remove existing debt for same employee+course if any
      setTrainingDebts(prev => [
        ...prev.filter(d => !(d.employeeId === assignEmpId && d.courseName === course.courseName)),
        debt,
      ]);
    }

    toast({ title: ar ? 'تم التعيين' : 'Assigned', description: ar ? 'تم تعيين الموظف للدورة' : 'Employee assigned to course' });
    setAssignDialogOpen(false);
    setAssignEmpId('');
    setAssignActualDate('');
  };

  const handleDeleteCourse = (id: string) => {
    setPlannedCourses(prev => prev.filter(c => c.id !== id));
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
  };

  const MenuView = () => (
    <div className="space-y-4 max-w-xl mx-auto">
      <Button 
        className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => { setIsAddDialogOpen(true); }}
      >
        <span className="flex items-center gap-3">
          <Plus className="h-5 w-5" />
          {t('training.plan.addCourse')}
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      <Button 
        className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('viewPlan')}
      >
        <span className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          {t('training.plan.viewPlan')}
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      <Button 
        className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('nextYearPlan')}
      >
        <span className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5" />
          {t('training.plan.viewNextYear')}
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      <Button 
        className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('staffCourses')}
      >
        <span className="flex items-center gap-3">
          <Users className="h-5 w-5" />
          {t('training.plan.staffCourses')}
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      
      <Button 
        className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('staffReport')}
      >
        <span className="flex items-center gap-3">
          <FileText className="h-5 w-5" />
          {t('training.plan.staffReport')}
        </span>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  const PlanTableView = ({ year, title }: { year: number; title: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title} - {year}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('menu')}>
            {t('common.back')}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('training.courses.code')}</TableHead>
              <TableHead>{t('training.courseName')}</TableHead>
              <TableHead>{t('training.provider')}</TableHead>
              <TableHead>{t('training.plannedDate')}</TableHead>
              <TableHead>{t('training.courses.duration')}</TableHead>
              <TableHead>{ar ? 'التكلفة' : 'Cost'}</TableHead>
              <TableHead>{t('training.plan.participants')}</TableHead>
              <TableHead>{t('training.plan.trainer')}</TableHead>
              <TableHead>{t('training.location')}</TableHead>
              <TableHead>{t('training.courses.status')}</TableHead>
              <TableHead>{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plannedCourses
              .filter(c => new Date(c.plannedDate).getFullYear() === year)
              .map(course => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono">{course.courseCode}</TableCell>
                  <TableCell className="font-medium">{course.courseName}</TableCell>
                  <TableCell>{course.provider}</TableCell>
                  <TableCell>{course.plannedDate}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>{course.cost?.toLocaleString() || '0'}</TableCell>
                  <TableCell>{course.participants}</TableCell>
                  <TableCell>{course.trainer || '-'}</TableCell>
                  <TableCell>{course.location || '-'}</TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setAssignCourseId(course.id);
                        setAssignDialogOpen(true);
                      }} title={ar ? 'تعيين موظف' : 'Assign Employee'}>
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const StaffCoursesView = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('training.plan.staffCourses')}</CardTitle>
        <Button variant="outline" onClick={() => setCurrentView('menu')}>
          {t('common.back')}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('training.plan.employeeId')}</TableHead>
              <TableHead>{t('training.plan.employeeName')}</TableHead>
              <TableHead>{t('training.plan.department')}</TableHead>
              <TableHead>{t('training.courses.code')}</TableHead>
              <TableHead>{t('training.courseName')}</TableHead>
              <TableHead>{t('training.plan.dueDate')}</TableHead>
              <TableHead>{t('training.courses.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStaffCourses.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">{item.employeeId}</TableCell>
                <TableCell className="font-medium">{item.employeeName}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell className="font-mono">{item.courseCode}</TableCell>
                <TableCell>{item.courseName}</TableCell>
                <TableCell>{item.dueDate}</TableCell>
                <TableCell>{getStaffStatusBadge(item.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const StaffReportView = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('training.plan.staffReport')}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('menu')}>
            {t('common.back')}
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{mockStaffCourses.length}</p>
              <p className="text-sm text-muted-foreground">{t('training.plan.totalPlanned')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{mockStaffCourses.filter(c => c.status === 'scheduled').length}</p>
              <p className="text-sm text-muted-foreground">{t('training.plan.scheduled')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{mockStaffCourses.filter(c => c.status === 'due').length}</p>
              <p className="text-sm text-muted-foreground">{t('training.plan.due')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{mockStaffCourses.filter(c => c.status === 'overdue').length}</p>
              <p className="text-sm text-muted-foreground">{t('training.plan.overdue')}</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('training.plan.department')}</TableHead>
              <TableHead>{t('training.plan.totalStaff')}</TableHead>
              <TableHead>{t('training.plan.coursesScheduled')}</TableHead>
              <TableHead>{t('training.plan.coursesDue')}</TableHead>
              <TableHead>{t('training.plan.coursesOverdue')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Operations</TableCell>
              <TableCell>25</TableCell>
              <TableCell>15</TableCell>
              <TableCell>8</TableCell>
              <TableCell className="text-destructive">2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">HR</TableCell>
              <TableCell>10</TableCell>
              <TableCell>8</TableCell>
              <TableCell>2</TableCell>
              <TableCell className="text-destructive">0</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Finance</TableCell>
              <TableCell>8</TableCell>
              <TableCell>6</TableCell>
              <TableCell>1</TableCell>
              <TableCell className="text-destructive">1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {currentView === 'menu' && <MenuView />}
      {currentView === 'viewPlan' && <PlanTableView year={selectedYear} title={t('training.plan.viewPlan')} />}
      {currentView === 'nextYearPlan' && <PlanTableView year={selectedYear + 1} title={t('training.plan.viewNextYear')} />}
      {currentView === 'staffCourses' && <StaffCoursesView />}
      {currentView === 'staffReport' && <StaffReportView />}

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('training.plan.addCourse')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('training.courses.code')}</Label>
              <Input
                value={formData.courseCode || ''}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.courseName')}</Label>
              <Input
                value={formData.courseName || ''}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.provider')}</Label>
              <Input
                value={formData.provider || ''}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.plannedDate')}</Label>
              <Input
                type="date"
                value={formData.plannedDate || ''}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.courses.duration')}</Label>
              <Input
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div>
              <Label>{ar ? 'تكلفة الدورة' : 'Course Cost'}</Label>
              <Input
                type="number"
                min={0}
                value={formData.cost || ''}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>{t('training.plan.participants')}</Label>
              <Input
                type="number"
                value={formData.participants || ''}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>{t('training.plan.trainer')}</Label>
              <Input
                value={formData.trainer || ''}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.location')}</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleAddCourse}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar ? 'تعيين موظف للدورة' : 'Assign Employee to Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{ar ? 'الدورة' : 'Course'}</Label>
              <Input value={plannedCourses.find(c => c.id === assignCourseId)?.courseName || ''} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'اختر الموظف' : 'Select Employee'}</Label>
              <Popover open={assignEmpOpen} onOpenChange={setAssignEmpOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between", isRTL && "flex-row-reverse")}>
                    {assignEmpId
                      ? (() => { const e = activeEmployees.find(emp => emp.employeeId === assignEmpId); return e ? `${e.employeeId} - ${ar ? e.nameAr : e.nameEn}` : assignEmpId; })()
                      : (ar ? '-- اختر الموظف --' : '-- Select Employee --')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                  <Command>
                    <CommandInput placeholder={ar ? 'بحث...' : 'Search...'} />
                    <CommandList>
                      <CommandEmpty>{ar ? 'لا نتائج' : 'No results'}</CommandEmpty>
                      <CommandGroup>
                        {activeEmployees.map(emp => (
                          <CommandItem key={emp.employeeId} value={`${emp.nameAr} ${emp.nameEn} ${emp.employeeId}`}
                            onSelect={() => { setAssignEmpId(emp.employeeId); setAssignEmpOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", assignEmpId === emp.employeeId ? "opacity-100" : "opacity-0")} />
                            {emp.employeeId} - {ar ? emp.nameAr : emp.nameEn}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>{ar ? 'تاريخ أخذ الدورة الفعلي (اختياري)' : 'Actual Course Date (optional)'}</Label>
              <Input type="date" value={assignActualDate} onChange={e => setAssignActualDate(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                {ar ? 'عند إدخال التاريخ الفعلي تتحول الدورة من مخططة إلى فعلية وتصبح ديناً على الموظف لمدة 3 سنوات' : 'When actual date is set, the course becomes actual and creates a 3-year debt for the employee'}
              </p>
            </div>
            {assignCourseId && (
              <div className="space-y-2">
                <Label>{ar ? 'تكلفة الدورة' : 'Course Cost'}</Label>
                <Input value={plannedCourses.find(c => c.id === assignCourseId)?.cost?.toLocaleString() || '0'} readOnly className="bg-muted" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>{ar ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleAssignEmployee}>{ar ? 'تعيين' : 'Assign'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
