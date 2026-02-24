import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { usePerformanceData, defaultCriteria, calculateScore, CriteriaItem } from '@/contexts/PerformanceDataContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { stationLocations } from '@/data/stationLocations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Users, Star, AlertTriangle, LogOut, Globe, MapPin, Target, TrendingUp, Lightbulb, MessageSquare, Save, Send, Plus, Trash2, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Shared violation interface (matches ViolationsTab)
interface Violation {
  id: string;
  employeeId: string;
  date: string;
  type: string;
  description: string;
  penalty: string;
  status: 'active' | 'resolved';
}

const violationTypes = [
  { value: 'absence', ar: 'غياب بدون إذن', en: 'Unauthorized Absence' },
  { value: 'late', ar: 'تأخر متكرر', en: 'Repeated Tardiness' },
  { value: 'conduct', ar: 'سلوك غير لائق', en: 'Misconduct' },
  { value: 'safety', ar: 'مخالفة سلامة', en: 'Safety Violation' },
  { value: 'negligence', ar: 'إهمال', en: 'Negligence' },
  { value: 'uniform', ar: 'مخالفة زي', en: 'Uniform Violation' },
  { value: 'other', ar: 'أخرى', en: 'Other' },
];

interface CriteriaScore {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  weight: number;
}

const initialCriteria: CriteriaScore[] = [
  { id: 'quality', name: 'Work Quality', nameAr: 'جودة العمل', score: 3, weight: 25 },
  { id: 'productivity', name: 'Productivity', nameAr: 'الإنتاجية', score: 3, weight: 20 },
  { id: 'teamwork', name: 'Teamwork', nameAr: 'العمل الجماعي', score: 3, weight: 20 },
  { id: 'communication', name: 'Communication', nameAr: 'التواصل', score: 3, weight: 15 },
  { id: 'initiative', name: 'Initiative', nameAr: 'المبادرة', score: 3, weight: 10 },
  { id: 'attendance', name: 'Attendance & Punctuality', nameAr: 'الحضور والالتزام', score: 3, weight: 10 },
];

const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

const StationManagerPortal = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const { employees } = useEmployeeData();
  const { reviews, addReview } = usePerformanceData();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;
  const ar = language === 'ar';

  // Shared violations store (same key as ViolationsTab)
  const [violations, setViolations] = usePersistedState<Violation[]>('hr_violations', []);

  // Evaluation dialog state
  const [evalDialog, setEvalDialog] = useState(false);
  const [evalEmployeeId, setEvalEmployeeId] = useState('');
  const [evalYear, setEvalYear] = useState('');
  const [evalQuarter, setEvalQuarter] = useState('');
  const [evalCriteria, setEvalCriteria] = useState<CriteriaScore[]>(initialCriteria.map(c => ({ ...c })));
  const [evalStrengths, setEvalStrengths] = useState('');
  const [evalImprovements, setEvalImprovements] = useState('');
  const [evalGoals, setEvalGoals] = useState('');
  const [evalComments, setEvalComments] = useState('');

  // Violation dialog state
  const [violDialog, setViolDialog] = useState(false);
  const [violForm, setViolForm] = useState({ employeeId: '', type: 'absence', description: '', penalty: '', date: new Date().toISOString().split('T')[0] });

  const stationName = useMemo(() => {
    const loc = stationLocations.find(s => s.value === user?.station);
    return language === 'ar' ? loc?.labelAr : loc?.labelEn;
  }, [user?.station, language]);

  const stationEmployees = useMemo(() => {
    return employees.filter(e => e.stationLocation === user?.station);
  }, [employees, user?.station]);

  // Filter reviews for this station's employees
  const stationReviews = useMemo(() => {
    const empIds = stationEmployees.map(e => e.employeeId);
    return reviews.filter(r => empIds.includes(r.employeeId) || r.station === user?.station);
  }, [reviews, stationEmployees, user?.station]);

  // Filter violations for this station's employees
  const stationViolations = useMemo(() => {
    const empIds = stationEmployees.map(e => e.employeeId);
    return violations.filter(v => empIds.includes(v.employeeId));
  }, [violations, stationEmployees]);

  // Eval helpers
  const evalOverallScore = useMemo(() => {
    const totalWeight = evalCriteria.reduce((s, c) => s + c.weight, 0);
    const weightedSum = evalCriteria.reduce((s, c) => s + (c.score * c.weight), 0);
    return parseFloat((weightedSum / totalWeight).toFixed(2));
  }, [evalCriteria]);

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return { label: ar ? 'ممتاز' : 'Excellent', color: 'text-[hsl(var(--stat-green))]' };
    if (score >= 3.5) return { label: ar ? 'جيد جداً' : 'Very Good', color: 'text-[hsl(var(--stat-blue))]' };
    if (score >= 2.5) return { label: ar ? 'جيد' : 'Good', color: 'text-[hsl(var(--stat-yellow))]' };
    if (score >= 1.5) return { label: ar ? 'مقبول' : 'Acceptable', color: 'text-[hsl(var(--stat-coral))]' };
    return { label: ar ? 'ضعيف' : 'Poor', color: 'text-destructive' };
  };

  const resetEvalForm = () => {
    setEvalEmployeeId('');
    setEvalYear('');
    setEvalQuarter('');
    setEvalCriteria(initialCriteria.map(c => ({ ...c })));
    setEvalStrengths('');
    setEvalImprovements('');
    setEvalGoals('');
    setEvalComments('');
  };

  const handleAddEvaluation = (status: 'draft' | 'submitted') => {
    if (!evalEmployeeId || !evalYear || !evalQuarter) {
      toast({ title: t('أكمل البيانات المطلوبة', 'Complete required fields'), variant: 'destructive' });
      return;
    }
    const emp = stationEmployees.find(e => e.id === evalEmployeeId);
    if (!emp) return;
    addReview({
      employeeId: emp.employeeId,
      employeeName: ar ? emp.nameAr : emp.nameEn,
      department: emp.department,
      station: user?.station || '',
      quarter: evalQuarter,
      year: evalYear,
      score: evalOverallScore,
      status,
      reviewer: ar ? (user?.nameAr || '') : (user?.name || ''),
      reviewDate: new Date().toISOString().split('T')[0],
      strengths: evalStrengths,
      improvements: evalImprovements,
      goals: evalGoals,
      managerComments: evalComments,
      criteria: evalCriteria.map(c => ({ name: c.nameAr, nameEn: c.name, score: c.score, weight: c.weight })),
    });
    toast({ title: t('تم إضافة التقييم بنجاح', 'Evaluation added successfully') });
    setEvalDialog(false);
    resetEvalForm();
  };

  const handleAddViolation = () => {
    if (!violForm.employeeId || !violForm.type) {
      toast({ title: t('أكمل البيانات المطلوبة', 'Complete required fields'), variant: 'destructive' });
      return;
    }
    const emp = stationEmployees.find(e => e.id === violForm.employeeId);
    if (!emp) return;
    const newViol: Violation = {
      id: `viol_${Date.now()}`,
      employeeId: emp.employeeId,
      date: violForm.date,
      type: violForm.type,
      description: violForm.description,
      penalty: violForm.penalty,
      status: 'active',
    };
    setViolations(prev => [...prev, newViol]);
    addNotification({ titleAr: `مخالفة جديدة للموظف: ${emp.nameAr}`, titleEn: `New violation for: ${emp.nameEn}`, type: 'warning', module: 'employee' });
    toast({ title: t('تم إضافة المخالفة بنجاح', 'Violation added successfully') });
    setViolDialog(false);
    setViolForm({ employeeId: '', type: 'absence', description: '', penalty: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteViolation = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id));
    toast({ title: t('تم الحذف', 'Deleted') });
  };

  // === Employees Tab Filters ===
  const [deptFilter, setDeptFilter] = useState('all');
  const [empSearch, setEmpSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const stationDepartments = useMemo(() => {
    const depts = [...new Set(stationEmployees.map(e => e.department).filter(Boolean))];
    return depts.sort();
  }, [stationEmployees]);
  const filteredStationEmployees = useMemo(() => {
    let list = stationEmployees;
    if (deptFilter !== 'all') list = list.filter(e => e.department === deptFilter);
    if (statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
    if (empSearch.trim()) {
      const q = empSearch.trim().toLowerCase();
      list = list.filter(e => e.nameAr.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q));
    }
    return list;
  }, [stationEmployees, deptFilter, statusFilter, empSearch]);

  // === Evaluations Tab Filters ===
  const [evalSearch, setEvalSearch] = useState('');
  const [evalFilterEmployee, setEvalFilterEmployee] = useState('all');
  const [evalFilterDept, setEvalFilterDept] = useState('all');
  const [evalFilterQuarter, setEvalFilterQuarter] = useState('all');
  const [evalFilterYear, setEvalFilterYear] = useState('all');
  const [evalFilterStatus, setEvalFilterStatus] = useState('all');
  const filteredReviews = useMemo(() => {
    let list = stationReviews;
    if (evalFilterEmployee !== 'all') list = list.filter(r => r.employeeId === evalFilterEmployee);
    if (evalFilterDept !== 'all') list = list.filter(r => r.department === evalFilterDept);
    if (evalFilterQuarter !== 'all') list = list.filter(r => r.quarter === evalFilterQuarter);
    if (evalFilterYear !== 'all') list = list.filter(r => r.year === evalFilterYear);
    if (evalFilterStatus !== 'all') list = list.filter(r => r.status === evalFilterStatus);
    if (evalSearch.trim()) {
      const q = evalSearch.trim().toLowerCase();
      list = list.filter(r => r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q) || r.reviewer.toLowerCase().includes(q));
    }
    return list;
  }, [stationReviews, evalFilterEmployee, evalFilterDept, evalFilterQuarter, evalFilterYear, evalFilterStatus, evalSearch]);

  // === Violations Tab Filters ===
  const [violSearch, setViolSearch] = useState('');
  const [violFilterEmployee, setViolFilterEmployee] = useState('all');
  const [violFilterType, setViolFilterType] = useState('all');
  const [violFilterStatus, setViolFilterStatus] = useState('all');
  const filteredViolations = useMemo(() => {
    let list = stationViolations;
    if (violFilterEmployee !== 'all') list = list.filter(v => v.employeeId === violFilterEmployee);
    if (violFilterType !== 'all') list = list.filter(v => v.type === violFilterType);
    if (violFilterStatus !== 'all') list = list.filter(v => v.status === violFilterStatus);
    if (violSearch.trim()) {
      const q = violSearch.trim().toLowerCase();
      list = list.filter(v => {
        const emp = stationEmployees.find(e => e.employeeId === v.employeeId);
        return v.employeeId.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || (emp && (emp.nameAr.toLowerCase().includes(q) || emp.nameEn.toLowerCase().includes(q)));
      });
    }
    return list;
  }, [stationViolations, violFilterEmployee, violFilterType, violFilterStatus, violSearch, stationEmployees]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const severityFromScore = (score: number) => {
    if (score >= 4) return 'bg-[hsl(var(--stat-green-bg))] text-[hsl(var(--stat-green))]';
    if (score >= 3) return 'bg-[hsl(var(--stat-blue-bg))] text-[hsl(var(--stat-blue))]';
    if (score >= 2) return 'bg-[hsl(var(--stat-yellow-bg))] text-[hsl(var(--stat-yellow))]';
    return 'bg-destructive/10 text-destructive';
  };

  const scoreInfo = getScoreLabel(evalOverallScore);

  const getQuarterLabel = (q: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      'Q1': { ar: 'Q1 (يناير - مارس)', en: 'Q1 (Jan - Mar)' },
      'Q2': { ar: 'Q2 (أبريل - يونيو)', en: 'Q2 (Apr - Jun)' },
      'Q3': { ar: 'Q3 (يوليو - سبتمبر)', en: 'Q3 (Jul - Sep)' },
      'Q4': { ar: 'Q4 (أكتوبر - ديسمبر)', en: 'Q4 (Oct - Dec)' },
    };
    return language === 'ar' ? labels[q]?.ar : labels[q]?.en;
  };

  return (
    <div className={cn("min-h-screen bg-background", isRTL ? "font-arabic" : "font-sans")} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">{t('بوابة مدير المحطة', 'Station Manager Portal')}</h1>
              <p className="text-xs text-muted-foreground">{stationName} - {language === 'ar' ? user?.nameAr : user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
              <Globe className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-destructive">
              <LogOut className="h-4 w-4" />
              {t('خروج', 'Logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--stat-blue-bg))] flex items-center justify-center"><Users className="h-5 w-5 text-[hsl(var(--stat-blue))]" /></div>
            <div><p className="text-2xl font-bold">{stationEmployees.length}</p><p className="text-xs text-muted-foreground">{t('الموظفين', 'Employees')}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--stat-green-bg))] flex items-center justify-center"><Users className="h-5 w-5 text-[hsl(var(--stat-green))]" /></div>
            <div><p className="text-2xl font-bold">{stationEmployees.filter(e => e.status === 'active').length}</p><p className="text-xs text-muted-foreground">{t('نشط', 'Active')}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--stat-purple-bg))] flex items-center justify-center"><Star className="h-5 w-5 text-[hsl(var(--stat-purple))]" /></div>
            <div><p className="text-2xl font-bold">{stationReviews.length}</p><p className="text-xs text-muted-foreground">{t('التقييمات', 'Evaluations')}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--stat-coral-bg))] flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-[hsl(var(--stat-coral))]" /></div>
            <div><p className="text-2xl font-bold">{stationViolations.length}</p><p className="text-xs text-muted-foreground">{t('المخالفات', 'Violations')}</p></div>
          </CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="employees" className="gap-1.5"><Users className="h-4 w-4" />{t('الموظفين', 'Employees')}</TabsTrigger>
            <TabsTrigger value="evaluations" className="gap-1.5"><Star className="h-4 w-4" />{t('التقييمات', 'Evaluations')}</TabsTrigger>
            <TabsTrigger value="violations" className="gap-1.5"><AlertTriangle className="h-4 w-4" />{t('المخالفات', 'Violations')}</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <Card>
              <CardHeader className="space-y-3">
                <CardTitle>{t('موظفي المحطة', 'Station Employees')}</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('بحث بالاسم أو الرقم...', 'Search by name or ID...')} value={empSearch} onChange={e => setEmpSearch(e.target.value)} className="ps-9" />
                  </div>
                  <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('جميع الأقسام', 'All Departments')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الأقسام', 'All Departments')}</SelectItem>
                      {stationDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t('جميع الحالات', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الحالات', 'All Statuses')}</SelectItem>
                      <SelectItem value="active">{t('نشط', 'Active')}</SelectItem>
                      <SelectItem value="inactive">{t('غير نشط', 'Inactive')}</SelectItem>
                      <SelectItem value="suspended">{t('معلق', 'Suspended')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t('الرقم', 'ID')}</TableHead>
                    <TableHead>{t('الاسم', 'Name')}</TableHead>
                    <TableHead>{t('الوظيفة', 'Job Title')}</TableHead>
                    <TableHead>{t('القسم', 'Department')}</TableHead>
                    <TableHead>{t('الحالة', 'Status')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredStationEmployees.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('لا يوجد موظفين', 'No employees found')}</TableCell></TableRow>
                    ) : filteredStationEmployees.map(emp => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                        <TableCell className="font-medium">{language === 'ar' ? emp.nameAr : emp.nameEn}</TableCell>
                        <TableCell>{emp.jobTitle}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>
                          <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                            {emp.status === 'active' ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations">
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>{t('تقييمات الموظفين', 'Employee Evaluations')}</CardTitle>
                  <Button onClick={() => setEvalDialog(true)} size="sm"><Star className="h-4 w-4 me-1.5" />{t('إضافة تقييم', 'Add Evaluation')}</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('بحث بالاسم أو الرقم...', 'Search by name or ID...')} value={evalSearch} onChange={e => setEvalSearch(e.target.value)} className="ps-9" />
                  </div>
                  <Select value={evalFilterEmployee} onValueChange={setEvalFilterEmployee}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('جميع الموظفين', 'All Employees')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الموظفين', 'All Employees')}</SelectItem>
                      {stationEmployees.map(emp => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>{ar ? emp.nameAr : emp.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={evalFilterDept} onValueChange={setEvalFilterDept}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder={t('جميع الأقسام', 'All Departments')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الأقسام', 'All Departments')}</SelectItem>
                      {stationDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={evalFilterQuarter} onValueChange={setEvalFilterQuarter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('جميع الأرباع', 'All Quarters')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الأرباع', 'All Quarters')}</SelectItem>
                      {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={evalFilterYear} onValueChange={setEvalFilterYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={t('جميع السنوات', 'All Years')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع السنوات', 'All Years')}</SelectItem>
                      {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={evalFilterStatus} onValueChange={setEvalFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('جميع الحالات', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الحالات', 'All Statuses')}</SelectItem>
                      <SelectItem value="draft">{t('مسودة', 'Draft')}</SelectItem>
                      <SelectItem value="submitted">{t('مقدّم', 'Submitted')}</SelectItem>
                      <SelectItem value="approved">{t('معتمد', 'Approved')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t('الموظف', 'Employee')}</TableHead>
                    <TableHead>{t('الربع', 'Quarter')}</TableHead>
                    <TableHead>{t('السنة', 'Year')}</TableHead>
                    <TableHead>{t('الدرجة', 'Score')}</TableHead>
                    <TableHead>{t('الحالة', 'Status')}</TableHead>
                    <TableHead>{t('المقيّم', 'Reviewer')}</TableHead>
                    <TableHead>{t('التاريخ', 'Date')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredReviews.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('لا توجد تقييمات', 'No evaluations found')}</TableCell></TableRow>
                    ) : filteredReviews.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.employeeName}</TableCell>
                        <TableCell>{r.quarter}</TableCell>
                        <TableCell>{r.year}</TableCell>
                        <TableCell>
                          <Badge className={severityFromScore(r.score)}>
                            {r.score}/5 - {getScoreLabel(r.score).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            r.status === 'approved' ? 'bg-[hsl(var(--stat-green-bg))] text-[hsl(var(--stat-green))] border-[hsl(var(--stat-green))]' :
                            r.status === 'submitted' ? 'bg-[hsl(var(--stat-yellow-bg))] text-[hsl(var(--stat-yellow))] border-[hsl(var(--stat-yellow))]' :
                            'bg-muted text-muted-foreground'
                          }>
                            {r.status === 'approved' ? t('معتمد', 'Approved') : r.status === 'submitted' ? t('مقدّم', 'Submitted') : t('مسودة', 'Draft')}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.reviewer}</TableCell>
                        <TableCell>{r.reviewDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations">
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle>{t('مخالفات الموظفين', 'Employee Violations')}</CardTitle>
                  <Button onClick={() => setViolDialog(true)} size="sm" variant="destructive"><AlertTriangle className="h-4 w-4 me-1.5" />{t('إضافة مخالفة', 'Add Violation')}</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('بحث بالاسم أو الوصف...', 'Search by name or description...')} value={violSearch} onChange={e => setViolSearch(e.target.value)} className="ps-9" />
                  </div>
                  <Select value={violFilterEmployee} onValueChange={setViolFilterEmployee}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('جميع الموظفين', 'All Employees')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الموظفين', 'All Employees')}</SelectItem>
                      {stationEmployees.map(emp => (
                        <SelectItem key={emp.employeeId} value={emp.employeeId}>{ar ? emp.nameAr : emp.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={violFilterType} onValueChange={setViolFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('جميع الأنواع', 'All Types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الأنواع', 'All Types')}</SelectItem>
                      {violationTypes.map(vt => (
                        <SelectItem key={vt.value} value={vt.value}>{ar ? vt.ar : vt.en}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={violFilterStatus} onValueChange={setViolFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder={t('جميع الحالات', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('جميع الحالات', 'All Statuses')}</SelectItem>
                      <SelectItem value="active">{t('نشطة', 'Active')}</SelectItem>
                      <SelectItem value="resolved">{t('محلولة', 'Resolved')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('الموظف', 'Employee')}</TableHead>
                      <TableHead>{t('التاريخ', 'Date')}</TableHead>
                      <TableHead>{t('النوع', 'Type')}</TableHead>
                      <TableHead>{t('الوصف', 'Description')}</TableHead>
                      <TableHead>{t('العقوبة', 'Penalty')}</TableHead>
                      <TableHead>{t('إجراءات', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('لا توجد مخالفات', 'No violations found')}</TableCell></TableRow>
                    ) : filteredViolations.map(v => {
                      const emp = stationEmployees.find(e => e.employeeId === v.employeeId);
                      const typeLabel = violationTypes.find(vt => vt.value === v.type);
                      return (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{ar ? emp?.nameAr : emp?.nameEn || v.employeeId}</TableCell>
                          <TableCell>{v.date}</TableCell>
                          <TableCell>{ar ? typeLabel?.ar : typeLabel?.en || v.type}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{v.description}</TableCell>
                          <TableCell>{v.penalty || '-'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteViolation(v.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Full Evaluation Dialog - matches PerformanceReviewForm */}
      <Dialog open={evalDialog} onOpenChange={v => { if (!v) resetEvalForm(); setEvalDialog(v); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Star className="w-5 h-5 text-primary" />
              {t('إضافة تقييم جديد', 'Add New Evaluation')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Employee & Period */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('الموظف', 'Employee')}</Label>
                <Select value={evalEmployeeId} onValueChange={setEvalEmployeeId}>
                  <SelectTrigger><SelectValue placeholder={t('اختر موظفاً', 'Select employee')} /></SelectTrigger>
                  <SelectContent>{stationEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{ar ? emp.nameAr : emp.nameEn} - {emp.department}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('السنة', 'Year')}</Label>
                <Select value={evalYear} onValueChange={setEvalYear}>
                  <SelectTrigger><SelectValue placeholder={t('اختر السنة', 'Select year')} /></SelectTrigger>
                  <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('الربع', 'Quarter')}</Label>
                <Select value={evalQuarter} onValueChange={setEvalQuarter}>
                  <SelectTrigger><SelectValue placeholder={t('اختر الربع', 'Select quarter')} /></SelectTrigger>
                  <SelectContent>{quarters.map(q => <SelectItem key={q} value={q}>{getQuarterLabel(q)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Criteria */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn("flex items-center gap-2 text-base", isRTL && "flex-row-reverse")}>
                  <Target className="w-4 h-4 text-primary" />
                  {t('معايير التقييم', 'Evaluation Criteria')}
                </CardTitle>
                <CardDescription>{t('اضغط على النجوم لتحديد الدرجة (1-5)', 'Click stars to set score (1-5)')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {evalCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-1.5">
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Label className="text-sm font-medium">{ar ? criterion.nameAr : criterion.name}</Label>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{criterion.weight}%</span>
                      </div>
                      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={cn("w-5 h-5 cursor-pointer transition-colors hover:scale-110", star <= criterion.score ? "text-[hsl(var(--stat-yellow))] fill-[hsl(var(--stat-yellow))]" : "text-muted-foreground hover:text-[hsl(var(--stat-yellow))]/50")}
                            onClick={() => setEvalCriteria(prev => prev.map(c => c.id === criterion.id ? { ...c, score: star } : c))} />
                        ))}
                        <span className="font-bold text-sm w-6 text-center">{criterion.score}</span>
                      </div>
                    </div>
                    <Progress value={criterion.score * 20} className="h-1.5" />
                  </div>
                ))}

                {/* Overall Score */}
                <div className={cn("flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Star className="w-5 h-5 text-[hsl(var(--stat-yellow))] fill-[hsl(var(--stat-yellow))]" />
                    <span className="font-semibold">{t('الدرجة الإجمالية', 'Overall Score')}</span>
                  </div>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <span className={cn("font-bold text-xl", scoreInfo.color)}>{evalOverallScore}</span>
                    <Badge variant="outline" className={cn(scoreInfo.color, "border-current")}>{scoreInfo.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="w-4 h-4 text-[hsl(var(--stat-green))]" />
                  {t('نقاط القوة', 'Strengths')}
                </Label>
                <Textarea value={evalStrengths} onChange={e => setEvalStrengths(e.target.value)} className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                  <Lightbulb className="w-4 h-4 text-[hsl(var(--stat-coral))]" />
                  {t('مجالات التحسين', 'Improvements')}
                </Label>
                <Textarea value={evalImprovements} onChange={e => setEvalImprovements(e.target.value)} className="min-h-[80px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <Target className="w-4 h-4 text-primary" />
                {t('أهداف الربع القادم', 'Next Quarter Goals')}
              </Label>
              <Textarea value={evalGoals} onChange={e => setEvalGoals(e.target.value)} className="min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
                <MessageSquare className="w-4 h-4 text-primary" />
                {t('ملاحظات المدير', 'Manager Comments')}
              </Label>
              <Textarea value={evalComments} onChange={e => setEvalComments(e.target.value)} className="min-h-[60px]" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEvalDialog(false); resetEvalForm(); }}>{t('إلغاء', 'Cancel')}</Button>
            <Button variant="outline" onClick={() => handleAddEvaluation('draft')} className="gap-1.5"><Save className="w-4 h-4" />{t('حفظ كمسودة', 'Save Draft')}</Button>
            <Button onClick={() => handleAddEvaluation('submitted')} className="gap-1.5"><Send className="w-4 h-4" />{t('تقديم', 'Submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Dialog - matches ViolationsTab */}
      <Dialog open={violDialog} onOpenChange={setViolDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('إضافة مخالفة جديدة', 'Add New Violation')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('الموظف', 'Employee')}</Label>
              <Select value={violForm.employeeId} onValueChange={v => setViolForm(p => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('اختر موظفاً', 'Select employee')} /></SelectTrigger>
                <SelectContent>{stationEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{ar ? emp.nameAr : emp.nameEn}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('التاريخ', 'Date')}</Label>
              <Input type="date" value={violForm.date} onChange={e => setViolForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('نوع المخالفة', 'Violation Type')}</Label>
              <Select value={violForm.type} onValueChange={v => setViolForm(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{violationTypes.map(vt => <SelectItem key={vt.value} value={vt.value}>{ar ? vt.ar : vt.en}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('الوصف', 'Description')}</Label>
              <Textarea value={violForm.description} onChange={e => setViolForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('العقوبة', 'Penalty')}</Label>
              <Input value={violForm.penalty} onChange={e => setViolForm(p => ({ ...p, penalty: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViolDialog(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button variant="destructive" onClick={handleAddViolation}>{t('حفظ', 'Save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationManagerPortal;