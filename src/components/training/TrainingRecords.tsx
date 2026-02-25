import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployeeData } from '@/contexts/EmployeeDataContext';
import { stationLocations } from '@/data/stationLocations';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  nameEn: string;
  nameAr: string;
  department: string;
  station: string;
  linkId: string;
  hireDate: string;
  mobile: string;
  photo?: string;
  jobFunctions: string[];
}

interface TrainingRecord {
  id: string;
  employeeId: string;
  courseName: string;
  provider: string;
  location: string;
  startDate: string;
  endDate: string;
  plannedDate: string;
  result: 'passed' | 'failed' | 'pending';
  percentage?: number;
}

const jobFunctionLabels: Record<string, { en: string; ar: string }> = {
  'PS': { en: 'Passenger Services', ar: 'خدمات الركاب' },
  'LL': { en: 'Lost & Found', ar: 'المفقودات' },
  'OO': { en: 'Operations Officer', ar: 'مسؤول العمليات' },
  'RO': { en: 'Ramp Officer', ar: 'مسؤول الساحة' },
  'LC': { en: 'Load Control', ar: 'التحميل' },
  'SC': { en: 'Security Coordinator', ar: 'منسق الأمن' },
  'IA': { en: 'Intl Affairs Officer', ar: 'مسؤول الشؤون الدولية' },
  'AD': { en: 'Administration', ar: 'الإدارة' },
  'AC': { en: 'Accountant', ar: 'محاسب' },
  'WO': { en: 'Worker', ar: 'عامل' },
  'TR': { en: 'Trainer', ar: 'مدرب' },
};

export const TrainingRecords = () => {
  const { t, language, isRTL } = useLanguage();
  const { employees: contextEmployees } = useEmployeeData();
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchStation, setSearchStation] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [newRecord, setNewRecord] = useState({
    courseName: '', provider: '', location: '', startDate: '', endDate: '', plannedDate: '',
  });

  const trainingEmployees: Employee[] = useMemo(() => contextEmployees.map((emp) => ({
    id: emp.id,
    nameEn: emp.nameEn,
    nameAr: emp.nameAr,
    department: emp.department,
    station: emp.stationLocation || 'HDQ',
    linkId: emp.employeeId.replace('Emp', ''),
    hireDate: emp.hireDate || '',
    mobile: emp.phone || '',
    jobFunctions: [],
  })), [contextEmployees]);

  // Fetch training records from DB when employee is selected
  useEffect(() => {
    if (!selectedEmployee) { setTrainingRecords([]); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('training_records')
        .select('*, training_courses(name_en, name_ar)')
        .eq('employee_id', selectedEmployee.id);
      setTrainingRecords((data || []).map(r => ({
        id: r.id,
        employeeId: r.employee_id,
        courseName: r.training_courses ? (language === 'ar' ? (r.training_courses as any).name_ar : (r.training_courses as any).name_en) : '',
        provider: '',
        location: '',
        startDate: r.start_date || '',
        endDate: r.end_date || '',
        plannedDate: '',
        result: r.status === 'completed' ? 'passed' : r.status === 'failed' ? 'failed' : 'pending',
        percentage: r.score || undefined,
      })));
    };
    fetch();
  }, [selectedEmployee, language]);

  const filteredEmployees = trainingEmployees.filter(emp => {
    const nameMatch = emp.nameEn.toLowerCase().includes(searchName.toLowerCase()) || emp.nameAr.includes(searchName);
    const deptMatch = !searchDept || searchDept === 'all' || emp.department === searchDept;
    const stationMatch = !searchStation || searchStation === 'all' || emp.station.includes(searchStation);
    return nameMatch && deptMatch && stationMatch;
  });

  const getResultBadge = (result: string) => {
    switch(result) {
      case 'passed': return <Badge className="bg-stat-green">{t('training.result.passed')}</Badge>;
      case 'failed': return <Badge variant="destructive">{t('training.result.failed')}</Badge>;
      default: return <Badge variant="secondary">{t('training.result.pending')}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className={cn("col-span-3 space-y-4", isRTL && "order-last")}>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input placeholder={t('training.searchByName')} value={searchName} onChange={(e) => setSearchName(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
            </div>
            <Select value={searchDept} onValueChange={setSearchDept}>
              <SelectTrigger><SelectValue placeholder={t('training.searchByDept')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Operations">{t('dept.operations')}</SelectItem>
                <SelectItem value="HR">{t('dept.hr')}</SelectItem>
                <SelectItem value="Finance">{t('dept.finance')}</SelectItem>
                <SelectItem value="IT">{t('dept.it')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchStation} onValueChange={setSearchStation}>
              <SelectTrigger><SelectValue placeholder={t('training.searchByStation')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {stationLocations.map(s => (<SelectItem key={s.value} value={s.value}>{language === 'ar' ? s.labelAr : s.labelEn}</SelectItem>))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {filteredEmployees.map(emp => (
            <button key={emp.id} onClick={() => setSelectedEmployee(emp)}
              className={cn("w-full text-start px-3 py-2 rounded-lg transition-colors text-sm",
                selectedEmployee?.id === emp.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-primary")}>
              {language === 'ar' ? emp.nameAr : emp.nameEn}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-9 space-y-6">
        {selectedEmployee ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Avatar className="w-24 h-24"><AvatarFallback className="text-2xl">{selectedEmployee.nameEn.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn}</h2>
                      <p className="text-muted-foreground">{selectedEmployee.department}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div><span className="text-muted-foreground">{t('training.linkId')}: </span><span className="font-medium">{selectedEmployee.linkId}</span></div>
                      <div><span className="text-muted-foreground">{t('training.station')}: </span><span className="font-medium">{selectedEmployee.station}</span></div>
                      <div><span className="text-muted-foreground">{t('training.hireDate')}: </span><span className="font-medium">{selectedEmployee.hireDate}</span></div>
                      <div><span className="text-muted-foreground">{t('training.mobile')}: </span><span className="font-medium">{selectedEmployee.mobile}</span></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('training.jobFunction')}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(jobFunctionLabels).map(key => (
                          <label key={key} className="flex items-center gap-1 text-xs"><Checkbox checked={selectedEmployee.jobFunctions.includes(key)} disabled /><span>{key}</span></label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="mb-1"><strong>{t('training.jobFunctionLegend')}:</strong></p>
              <p>{Object.entries(jobFunctionLabels).map(([key, val], i) => (<span key={key}>{key}= {language === 'ar' ? val.ar : val.en}{i < Object.keys(jobFunctionLabels).length - 1 ? '  |  ' : ''}</span>))}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{t('training.records.title')}</h3>
                  <Button onClick={() => setIsAddRecordOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('training.records.add')}</Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>{t('training.courseName')}</TableHead>
                      <TableHead>{t('training.startDate')}</TableHead>
                      <TableHead>{t('training.endDate')}</TableHead>
                      <TableHead>{t('training.result')}</TableHead>
                      <TableHead>{t('training.percentage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"><X className="h-4 w-4" /></Button></TableCell>
                        <TableCell>{record.courseName}</TableCell>
                        <TableCell>{record.startDate}</TableCell>
                        <TableCell>{record.endDate}</TableCell>
                        <TableCell>{getResultBadge(record.result)}</TableCell>
                        <TableCell>{record.percentage ? `${record.percentage}%` : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {trainingRecords.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('training.noRecords')}</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card><CardContent className="p-12 text-center text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t('training.selectEmployee')}</p></CardContent></Card>
        )}
      </div>

      <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('training.records.add')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>{t('training.courseName')}</Label><Input value={newRecord.courseName} onChange={(e) => setNewRecord({ ...newRecord, courseName: e.target.value })} /></div>
            <div><Label>{t('training.provider')}</Label><Input value={newRecord.provider} onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })} /></div>
            <div><Label>{t('training.location')}</Label><Input value={newRecord.location} onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })} /></div>
            <div><Label>{t('training.startDate')}</Label><Input type="date" value={newRecord.startDate} onChange={(e) => setNewRecord({ ...newRecord, startDate: e.target.value })} /></div>
            <div><Label>{t('training.endDate')}</Label><Input type="date" value={newRecord.endDate} onChange={(e) => setNewRecord({ ...newRecord, endDate: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => setIsAddRecordOpen(false)}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
