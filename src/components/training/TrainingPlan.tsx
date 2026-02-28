import { useState, useMemo, useEffect } from 'react';
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
  ChevronRight, Download, Check, ChevronsUpDown, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PlannedCourse {
  id: string;
  courseCode: string;
  courseName: string;
  provider: string;
  plannedDate: string;
  duration: string;
  participants: number;
  status: string;
  trainer: string;
  location: string;
  cost: number;
}

export interface TrainingDebt {
  id: string;
  employeeId: string;
  courseName: string;
  cost: number;
  actualDate: string;
  expiryDate: string;
}

type ViewType = 'menu' | 'viewPlan' | 'nextYearPlan' | 'staffCourses' | 'staffReport';

export const TrainingPlan = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { employees } = useEmployeeData();
  const ar = language === 'ar';
  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  const [selectedYear] = useState(new Date().getFullYear());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PlannedCourse>>({});

  // Course selection from DB
  const [courseOptions, setCourseOptions] = useState<{ id: string; nameEn: string; nameAr: string; code: string; provider: string; duration: string }[]>([]);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignCourseId, setAssignCourseId] = useState<string | null>(null);
  const [assignEmpId, setAssignEmpId] = useState('');
  const [assignActualDate, setAssignActualDate] = useState('');
  const [assignEmpOpen, setAssignEmpOpen] = useState(false);

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);

  // Fetch courses from training_courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('training_courses').select('*').eq('is_active', true);
      setCourseOptions((data || []).map((c: any) => ({
        id: c.id, nameEn: c.name_en, nameAr: c.name_ar,
        code: c.course_code || '', provider: c.provider || '',
        duration: c.duration_hours ? `${c.duration_hours} hours` : '',
      })));
    };
    fetchCourses();
  }, []);

  // Fetch planned courses
  const fetchPlannedCourses = async () => {
    const { data } = await supabase.from('planned_courses').select('*').order('planned_date', { ascending: false });
    setPlannedCourses((data || []).map((c: any) => ({
      id: c.id, courseCode: c.course_code || '', courseName: c.course_name || '',
      provider: c.provider || '', plannedDate: c.planned_date || '', duration: c.duration || '',
      participants: c.participants || 0, status: c.status || 'scheduled',
      trainer: c.trainer || '', location: c.location || '', cost: c.cost || 0,
    })));
  };

  useEffect(() => { fetchPlannedCourses(); }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'scheduled': return <Badge className="bg-blue-500">{t('training.plan.scheduled')}</Badge>;
      case 'in-progress': return <Badge className="bg-yellow-500">{t('training.plan.inProgress')}</Badge>;
      case 'completed': return <Badge className="bg-green-500">{t('training.plan.completed')}</Badge>;
      case 'cancelled': return <Badge variant="destructive">{t('training.plan.cancelled')}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAddCourse = async () => {
    if (!formData.courseName || !formData.plannedDate) {
      toast({ title: t('common.error'), description: t('training.fillRequired'), variant: 'destructive' });
      return;
    }
    await supabase.from('planned_courses').insert({
      course_code: formData.courseCode || '',
      course_name: formData.courseName || '',
      provider: formData.provider || '',
      planned_date: formData.plannedDate,
      duration: formData.duration || '',
      participants: formData.participants || 0,
      status: 'scheduled',
      trainer: formData.trainer || '',
      location: formData.location || '',
      cost: formData.cost || 0,
    } as any);
    setIsAddDialogOpen(false);
    setFormData({});
    toast({ title: t('common.success'), description: t('training.plan.courseAdded') });
    fetchPlannedCourses();
  };

  const handleSelectCourseFromDB = (courseId: string) => {
    const course = courseOptions.find(c => c.id === courseId);
    if (course) {
      setFormData(prev => ({
        ...prev,
        courseCode: course.code,
        courseName: ar ? course.nameAr : course.nameEn,
        provider: course.provider,
        duration: course.duration,
      }));
    }
  };

  const handleAssignEmployee = async () => {
    if (!assignCourseId || !assignEmpId) return;
    const course = plannedCourses.find(c => c.id === assignCourseId);
    if (!course) return;

    const emp = activeEmployees.find(e => e.employeeId === assignEmpId);
    if (!emp) return;

    await supabase.from('planned_course_assignments').upsert({
      planned_course_id: assignCourseId,
      employee_id: emp.id,
      actual_date: assignActualDate || null,
    } as any, { onConflict: 'planned_course_id,employee_id' });

    // If actual date is set, create training debt
    if (assignActualDate && course.cost > 0) {
      const expiryDate = new Date(assignActualDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 3);
      await supabase.from('training_debts').insert({
        employee_id: emp.id,
        course_name: course.courseName,
        cost: course.cost,
        actual_date: assignActualDate,
        expiry_date: expiryDate.toISOString().split('T')[0],
      } as any);
    }

    toast({ title: ar ? 'تم التعيين' : 'Assigned' });
    setAssignDialogOpen(false);
    setAssignEmpId('');
    setAssignActualDate('');
  };

  const handleDeleteCourse = async (id: string) => {
    await supabase.from('planned_courses').delete().eq('id', id);
    toast({ title: ar ? 'تم الحذف' : 'Deleted' });
    fetchPlannedCourses();
  };

  const MenuView = () => (
    <div className="space-y-4 max-w-xl mx-auto">
      <Button className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setIsAddDialogOpen(true)}>
        <span className="flex items-center gap-3"><Plus className="h-5 w-5" />{t('training.plan.addCourse')}</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('viewPlan')}>
        <span className="flex items-center gap-3"><Calendar className="h-5 w-5" />{t('training.plan.viewPlan')}</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('nextYearPlan')}>
        <span className="flex items-center gap-3"><CalendarDays className="h-5 w-5" />{t('training.plan.viewNextYear')}</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button className="w-full h-14 text-lg justify-between bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-900 border border-blue-300"
        onClick={() => setCurrentView('staffReport')}>
        <span className="flex items-center gap-3"><FileText className="h-5 w-5" />{t('training.plan.staffReport')}</span>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  const PlanTableView = ({ year, title }: { year: number; title: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title} - {year}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('menu')}>{t('common.back')}</Button>
          <Button><Download className="h-4 w-4 mr-2" />{t('common.export')}</Button>
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
              .filter(c => c.plannedDate && new Date(c.plannedDate).getFullYear() === year)
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
            {plannedCourses.filter(c => c.plannedDate && new Date(c.plannedDate).getFullYear() === year).length === 0 && (
              <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">{ar ? 'لا توجد دورات' : 'No courses'}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const StaffReportView = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('training.plan.staffReport')}</CardTitle>
        <Button variant="outline" onClick={() => setCurrentView('menu')}>{t('common.back')}</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-primary">{plannedCourses.length}</p><p className="text-sm text-muted-foreground">{t('training.plan.totalPlanned')}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{plannedCourses.filter(c => c.status === 'completed').length}</p><p className="text-sm text-muted-foreground">{t('training.plan.completed')}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-blue-600">{plannedCourses.filter(c => c.status === 'scheduled').length}</p><p className="text-sm text-muted-foreground">{t('training.plan.scheduled')}</p></CardContent></Card>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {currentView === 'menu' && <MenuView />}
      {currentView === 'viewPlan' && <PlanTableView year={selectedYear} title={t('training.plan.viewPlan')} />}
      {currentView === 'nextYearPlan' && <PlanTableView year={selectedYear + 1} title={t('training.plan.viewNextYear')} />}
      {currentView === 'staffReport' && <StaffReportView />}

      {/* Add Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('training.plan.addCourse')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>{ar ? 'اختر من قائمة الدورات' : 'Select from Courses List'}</Label>
              <Select onValueChange={handleSelectCourseFromDB}>
                <SelectTrigger><SelectValue placeholder={ar ? '-- اختر دورة --' : '-- Select Course --'} /></SelectTrigger>
                <SelectContent>
                  {courseOptions.map(c => (
                    <SelectItem key={c.id} value={c.id}>{ar ? c.nameAr : c.nameEn} {c.code ? `(${c.code})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>{t('training.courses.code')}</Label><Input value={formData.courseCode || ''} onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })} /></div>
            <div><Label>{t('training.courseName')}</Label><Input value={formData.courseName || ''} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} /></div>
            <div><Label>{t('training.provider')}</Label><Input value={formData.provider || ''} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} /></div>
            <div><Label>{t('training.plannedDate')}</Label><Input type="date" value={formData.plannedDate || ''} onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })} /></div>
            <div><Label>{t('training.courses.duration')}</Label><Input value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} /></div>
            <div><Label>{ar ? 'تكلفة الدورة' : 'Course Cost'}</Label><Input type="number" min={0} value={formData.cost || ''} onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>{t('training.plan.participants')}</Label><Input type="number" value={formData.participants || ''} onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })} /></div>
            <div><Label>{t('training.plan.trainer')}</Label><Input value={formData.trainer || ''} onChange={(e) => setFormData({ ...formData, trainer: e.target.value })} /></div>
            <div><Label>{t('training.location')}</Label><Input value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
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
          <DialogHeader><DialogTitle>{ar ? 'تعيين موظف للدورة' : 'Assign Employee to Course'}</DialogTitle></DialogHeader>
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
