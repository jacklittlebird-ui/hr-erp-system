import { useState } from 'react';
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

const mockEmployees: Employee[] = [
  { id: '1', nameEn: 'Ibrahim Abdel Atty', nameAr: 'ابراهيم عبدالعاطي', department: 'Office Boy', station: 'HDQ - OPS', linkId: '031', hireDate: '22/12/2001', mobile: '01014192347', jobFunctions: ['WO'] },
  { id: '2', nameEn: 'Abanoub Adel Fekry', nameAr: 'أبانوب عادل فكري', department: 'Operations', station: 'CAI', linkId: '045', hireDate: '15/03/2015', mobile: '01123456789', jobFunctions: ['OO', 'RO'] },
  { id: '3', nameEn: 'Abdallah Ahmed Abdallah', nameAr: 'عبدالله احمد عبدالله', department: 'HR', station: 'HDQ', linkId: '067', hireDate: '10/06/2018', mobile: '01098765432', jobFunctions: ['AD'] },
  { id: '4', nameEn: 'Ahmed Fathy Ali Morsy', nameAr: 'احمد فتحي علي مرسي', department: 'Finance', station: 'HDQ', linkId: '089', hireDate: '01/09/2020', mobile: '01234567890', jobFunctions: ['AC'] },
  { id: '5', nameEn: 'Abdallah Badawy Saied', nameAr: 'عبدالله بدوي سعيد', department: 'IT', station: 'HDQ', linkId: '102', hireDate: '20/11/2019', mobile: '01555555555', jobFunctions: ['SC'] },
];

const mockTrainingRecords: TrainingRecord[] = [
  { id: '1', employeeId: '1', courseName: 'Emergency Response - R', provider: 'Link Aero Training Agency', location: 'Operations Control Center - OCC', startDate: '20/05/2018', endDate: '30/05/2018', plannedDate: '', result: 'passed', percentage: 85 },
  { id: '2', employeeId: '1', courseName: 'Emergency Response - R', provider: 'Link Aero Training Agency', location: 'Operations Control Center - OCC', startDate: '20/05/2015', endDate: '30/05/2015', plannedDate: '', result: 'passed' },
  { id: '3', employeeId: '1', courseName: 'Emergency Response - R', provider: 'Link Aero Training Agency', location: 'Operations Control Center - OCC', startDate: '22/05/2012', endDate: '22/05/2012', plannedDate: '', result: 'passed' },
];

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
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchStation, setSearchStation] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    courseName: '',
    provider: '',
    location: '',
    startDate: '',
    endDate: '',
    plannedDate: '',
  });

  const filteredEmployees = mockEmployees.filter(emp => {
    const nameMatch = emp.nameEn.toLowerCase().includes(searchName.toLowerCase()) ||
                      emp.nameAr.includes(searchName);
    const deptMatch = !searchDept || emp.department === searchDept;
    const stationMatch = !searchStation || emp.station.includes(searchStation);
    return nameMatch && deptMatch && stationMatch;
  });

  const employeeRecords = selectedEmployee 
    ? mockTrainingRecords.filter(r => r.employeeId === selectedEmployee.id)
    : [];

  const getResultBadge = (result: string) => {
    switch(result) {
      case 'passed': return <Badge className="bg-green-500">{t('training.result.passed')}</Badge>;
      case 'failed': return <Badge variant="destructive">{t('training.result.failed')}</Badge>;
      default: return <Badge variant="secondary">{t('training.result.pending')}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Sidebar - Employee List */}
      <div className={cn("col-span-3 space-y-4", isRTL && "order-last")}>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('training.searchByName')}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={searchDept} onValueChange={setSearchDept}>
              <SelectTrigger>
                <SelectValue placeholder={t('training.searchByDept')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Operations">{t('dept.operations')}</SelectItem>
                <SelectItem value="HR">{t('dept.hr')}</SelectItem>
                <SelectItem value="Finance">{t('dept.finance')}</SelectItem>
                <SelectItem value="IT">{t('dept.it')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={searchStation} onValueChange={setSearchStation}>
              <SelectTrigger>
                <SelectValue placeholder={t('training.searchByStation')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="HDQ">HDQ</SelectItem>
                <SelectItem value="CAI">CAI</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {filteredEmployees.map(emp => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp)}
              className={cn(
                "w-full text-start px-3 py-2 rounded-lg transition-colors text-sm",
                selectedEmployee?.id === emp.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-primary"
              )}
            >
              {language === 'ar' ? emp.nameAr : emp.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Employee Details & Training Records */}
      <div className="col-span-9 space-y-6">
        {selectedEmployee ? (
          <>
            {/* Employee Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedEmployee.photo} />
                    <AvatarFallback className="text-2xl">{selectedEmployee.nameEn.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">{language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.nameEn}</h2>
                      <p className="text-muted-foreground">{selectedEmployee.department}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('training.linkId')}: </span>
                        <span className="font-medium">{selectedEmployee.linkId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('training.station')}: </span>
                        <span className="font-medium">{selectedEmployee.station}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('training.hireDate')}: </span>
                        <span className="font-medium">{selectedEmployee.hireDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('training.mobile')}: </span>
                        <span className="font-medium">{selectedEmployee.mobile}</span>
                      </div>
                    </div>

                    {/* Job Functions */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('training.jobFunction')}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(jobFunctionLabels).map(key => (
                          <label key={key} className="flex items-center gap-1 text-xs">
                            <Checkbox checked={selectedEmployee.jobFunctions.includes(key)} disabled />
                            <span>{key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Functions Legend */}
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p className="mb-1"><strong>{t('training.jobFunctionLegend')}:</strong></p>
              <p>
                {Object.entries(jobFunctionLabels).map(([key, val], i) => (
                  <span key={key}>
                    {key}= {language === 'ar' ? val.ar : val.en}
                    {i < Object.keys(jobFunctionLabels).length - 1 ? '  |  ' : ''}
                  </span>
                ))}
              </p>
            </div>

            {/* Training Records Table */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{t('training.records.title')}</h3>
                  <Button onClick={() => setIsAddRecordOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('training.records.add')}
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>{t('training.courseName')}</TableHead>
                      <TableHead>{t('training.provider')}</TableHead>
                      <TableHead>{t('training.location')}</TableHead>
                      <TableHead>{t('training.startDate')}</TableHead>
                      <TableHead>{t('training.endDate')}</TableHead>
                      <TableHead>{t('training.plannedDate')}</TableHead>
                      <TableHead>{t('training.result')}</TableHead>
                      <TableHead>{t('training.percentage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>{record.courseName}</TableCell>
                        <TableCell>{record.provider}</TableCell>
                        <TableCell>{record.location}</TableCell>
                        <TableCell>{record.startDate}</TableCell>
                        <TableCell>{record.endDate}</TableCell>
                        <TableCell>{record.plannedDate || '-'}</TableCell>
                        <TableCell>{getResultBadge(record.result)}</TableCell>
                        <TableCell>{record.percentage ? `${record.percentage}%` : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {employeeRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          {t('training.noRecords')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('training.selectEmployee')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Record Dialog */}
      <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('training.records.add')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>{t('training.courseName')}</Label>
              <Input
                value={newRecord.courseName}
                onChange={(e) => setNewRecord({ ...newRecord, courseName: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.provider')}</Label>
              <Input
                value={newRecord.provider}
                onChange={(e) => setNewRecord({ ...newRecord, provider: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.location')}</Label>
              <Input
                value={newRecord.location}
                onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.startDate')}</Label>
              <Input
                type="date"
                value={newRecord.startDate}
                onChange={(e) => setNewRecord({ ...newRecord, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.endDate')}</Label>
              <Input
                type="date"
                value={newRecord.endDate}
                onChange={(e) => setNewRecord({ ...newRecord, endDate: e.target.value })}
              />
            </div>
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
