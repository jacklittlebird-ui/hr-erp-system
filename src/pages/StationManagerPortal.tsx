import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { usePersistedState } from '@/hooks/usePersistedState';
import { cn } from '@/lib/utils';
import { stationLocations } from '@/data/stationLocations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Users, Star, AlertTriangle, LogOut, Globe, BarChart3, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  score: number;
  quarter: string;
  year: string;
  notes: string;
  station: string;
}

interface Violation {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  station: string;
}

const StationManagerPortal = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const { employees } = useEmployeeData();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => language === 'ar' ? ar : en;

  const [evaluations, setEvaluations] = usePersistedState<Evaluation[]>('hr_station_evaluations', []);
  const [violations, setViolations] = usePersistedState<Violation[]>('hr_station_violations', []);
  const [evalDialog, setEvalDialog] = useState(false);
  const [violDialog, setViolDialog] = useState(false);
  const [evalForm, setEvalForm] = useState({ employeeId: '', score: '80', quarter: 'Q1', year: new Date().getFullYear().toString(), notes: '' });
  const [violForm, setViolForm] = useState({ employeeId: '', type: '', description: '', severity: 'medium' as 'low' | 'medium' | 'high' });

  const stationName = useMemo(() => {
    const loc = stationLocations.find(s => s.value === user?.station);
    return language === 'ar' ? loc?.labelAr : loc?.labelEn;
  }, [user?.station, language]);

  const stationEmployees = useMemo(() => {
    return employees.filter(e => e.stationLocation === user?.station);
  }, [employees, user?.station]);

  const stationEvals = useMemo(() => evaluations.filter(e => e.station === user?.station), [evaluations, user?.station]);
  const stationViols = useMemo(() => violations.filter(v => v.station === user?.station), [violations, user?.station]);

  const handleAddEvaluation = () => {
    if (!evalForm.employeeId) { toast({ title: t('اختر موظفاً', 'Select an employee'), variant: 'destructive' }); return; }
    const emp = stationEmployees.find(e => e.id === evalForm.employeeId);
    const newEval: Evaluation = {
      id: `eval-${Date.now()}`,
      employeeId: evalForm.employeeId,
      employeeName: language === 'ar' ? emp?.nameAr || '' : emp?.nameEn || '',
      date: new Date().toISOString().split('T')[0],
      score: parseInt(evalForm.score) || 80,
      quarter: evalForm.quarter,
      year: evalForm.year,
      notes: evalForm.notes,
      station: user?.station || '',
    };
    setEvaluations(prev => [...prev, newEval]);
    toast({ title: t('تم إضافة التقييم بنجاح', 'Evaluation added successfully') });
    setEvalDialog(false);
    setEvalForm({ employeeId: '', score: '80', quarter: 'Q1', year: new Date().getFullYear().toString(), notes: '' });
  };

  const handleAddViolation = () => {
    if (!violForm.employeeId || !violForm.type) { toast({ title: t('أكمل البيانات المطلوبة', 'Complete required fields'), variant: 'destructive' }); return; }
    const emp = stationEmployees.find(e => e.id === violForm.employeeId);
    const newViol: Violation = {
      id: `viol-${Date.now()}`,
      employeeId: violForm.employeeId,
      employeeName: language === 'ar' ? emp?.nameAr || '' : emp?.nameEn || '',
      date: new Date().toISOString().split('T')[0],
      type: violForm.type,
      description: violForm.description,
      severity: violForm.severity,
      station: user?.station || '',
    };
    setViolations(prev => [...prev, newViol]);
    toast({ title: t('تم إضافة المخالفة بنجاح', 'Violation added successfully') });
    setViolDialog(false);
    setViolForm({ employeeId: '', type: '', description: '', severity: 'medium' });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const severityColors = { low: 'bg-[hsl(var(--stat-yellow-bg))] text-[hsl(var(--stat-yellow))]', medium: 'bg-[hsl(var(--stat-coral-bg))] text-[hsl(var(--stat-coral))]', high: 'bg-destructive/10 text-destructive' };

  const violationTypes = [
    { value: 'late', ar: 'تأخر', en: 'Late Arrival' },
    { value: 'absence', ar: 'غياب', en: 'Absence' },
    { value: 'negligence', ar: 'إهمال', en: 'Negligence' },
    { value: 'misconduct', ar: 'سوء سلوك', en: 'Misconduct' },
    { value: 'safety', ar: 'مخالفة سلامة', en: 'Safety Violation' },
    { value: 'uniform', ar: 'مخالفة زي', en: 'Uniform Violation' },
    { value: 'other', ar: 'أخرى', en: 'Other' },
  ];

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
            <div><p className="text-2xl font-bold">{stationEvals.length}</p><p className="text-xs text-muted-foreground">{t('التقييمات', 'Evaluations')}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--stat-coral-bg))] flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-[hsl(var(--stat-coral))]" /></div>
            <div><p className="text-2xl font-bold">{stationViols.length}</p><p className="text-xs text-muted-foreground">{t('المخالفات', 'Violations')}</p></div>
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
              <CardHeader><CardTitle>{t('موظفي المحطة', 'Station Employees')}</CardTitle></CardHeader>
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
                    {stationEmployees.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('لا يوجد موظفين في هذه المحطة', 'No employees in this station')}</TableCell></TableRow>
                    ) : stationEmployees.map(emp => (
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('تقييمات الموظفين', 'Employee Evaluations')}</CardTitle>
                <Button onClick={() => setEvalDialog(true)} size="sm"><Star className="h-4 w-4 me-1.5" />{t('إضافة تقييم', 'Add Evaluation')}</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t('الموظف', 'Employee')}</TableHead>
                    <TableHead>{t('الربع', 'Quarter')}</TableHead>
                    <TableHead>{t('السنة', 'Year')}</TableHead>
                    <TableHead>{t('الدرجة', 'Score')}</TableHead>
                    <TableHead>{t('التاريخ', 'Date')}</TableHead>
                    <TableHead>{t('ملاحظات', 'Notes')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {stationEvals.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('لا توجد تقييمات بعد', 'No evaluations yet')}</TableCell></TableRow>
                    ) : stationEvals.map(ev => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium">{ev.employeeName}</TableCell>
                        <TableCell>{ev.quarter}</TableCell>
                        <TableCell>{ev.year}</TableCell>
                        <TableCell><Badge className={ev.score >= 80 ? 'bg-[hsl(var(--stat-green))]' : ev.score >= 60 ? 'bg-[hsl(var(--stat-yellow))]' : 'bg-destructive'}>{ev.score}%</Badge></TableCell>
                        <TableCell>{ev.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ev.notes}</TableCell>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('مخالفات الموظفين', 'Employee Violations')}</CardTitle>
                <Button onClick={() => setViolDialog(true)} size="sm" variant="destructive"><AlertTriangle className="h-4 w-4 me-1.5" />{t('إضافة مخالفة', 'Add Violation')}</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>{t('الموظف', 'Employee')}</TableHead>
                    <TableHead>{t('النوع', 'Type')}</TableHead>
                    <TableHead>{t('الخطورة', 'Severity')}</TableHead>
                    <TableHead>{t('التاريخ', 'Date')}</TableHead>
                    <TableHead>{t('الوصف', 'Description')}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {stationViols.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('لا توجد مخالفات', 'No violations')}</TableCell></TableRow>
                    ) : stationViols.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.employeeName}</TableCell>
                        <TableCell>{violationTypes.find(vt => vt.value === v.type)?.[language === 'ar' ? 'ar' : 'en'] || v.type}</TableCell>
                        <TableCell><Badge className={severityColors[v.severity]}>{v.severity === 'low' ? t('منخفضة', 'Low') : v.severity === 'medium' ? t('متوسطة', 'Medium') : t('عالية', 'High')}</Badge></TableCell>
                        <TableCell>{v.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{v.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Evaluation Dialog */}
      <Dialog open={evalDialog} onOpenChange={setEvalDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('إضافة تقييم جديد', 'Add New Evaluation')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('الموظف', 'Employee')}</Label>
              <Select value={evalForm.employeeId} onValueChange={v => setEvalForm(p => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('اختر موظفاً', 'Select employee')} /></SelectTrigger>
                <SelectContent>{stationEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{language === 'ar' ? emp.nameAr : emp.nameEn}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>{t('الربع', 'Quarter')}</Label>
                <Select value={evalForm.quarter} onValueChange={v => setEvalForm(p => ({ ...p, quarter: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Q1','Q2','Q3','Q4'].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('السنة', 'Year')}</Label>
                <Input value={evalForm.year} onChange={e => setEvalForm(p => ({ ...p, year: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('الدرجة', 'Score')} %</Label>
                <Input type="number" min="0" max="100" value={evalForm.score} onChange={e => setEvalForm(p => ({ ...p, score: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('ملاحظات', 'Notes')}</Label>
              <Textarea value={evalForm.notes} onChange={e => setEvalForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvalDialog(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button onClick={handleAddEvaluation}>{t('حفظ', 'Save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Dialog */}
      <Dialog open={violDialog} onOpenChange={setViolDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('إضافة مخالفة جديدة', 'Add New Violation')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('الموظف', 'Employee')}</Label>
              <Select value={violForm.employeeId} onValueChange={v => setViolForm(p => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder={t('اختر موظفاً', 'Select employee')} /></SelectTrigger>
                <SelectContent>{stationEmployees.map(emp => <SelectItem key={emp.id} value={emp.id}>{language === 'ar' ? emp.nameAr : emp.nameEn}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('نوع المخالفة', 'Violation Type')}</Label>
                <Select value={violForm.type} onValueChange={v => setViolForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('اختر', 'Select')} /></SelectTrigger>
                  <SelectContent>{violationTypes.map(vt => <SelectItem key={vt.value} value={vt.value}>{language === 'ar' ? vt.ar : vt.en}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('الخطورة', 'Severity')}</Label>
                <Select value={violForm.severity} onValueChange={v => setViolForm(p => ({ ...p, severity: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('منخفضة', 'Low')}</SelectItem>
                    <SelectItem value="medium">{t('متوسطة', 'Medium')}</SelectItem>
                    <SelectItem value="high">{t('عالية', 'High')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('الوصف', 'Description')}</Label>
              <Textarea value={violForm.description} onChange={e => setViolForm(p => ({ ...p, description: e.target.value }))} />
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
