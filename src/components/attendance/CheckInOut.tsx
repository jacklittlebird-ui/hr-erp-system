import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Clock, LogIn, LogOut, Calendar, Timer, User, MapPin, Building2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/pages/Attendance';
import { toast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  name: string;
  nameAr: string;
  department: string;
  location: string;
}

interface CheckInOutProps {
  records: AttendanceRecord[];
  onCheckIn: (employeeId: string, employeeName: string, employeeNameAr: string, department: string) => void;
  onCheckOut: (recordId: string) => void;
}

// Sample employees data
const sampleEmployees: Employee[] = [
  { id: 'EMP001', name: 'Ahmed Mohamed', nameAr: 'أحمد محمد', department: 'IT', location: 'HQ' },
  { id: 'EMP002', name: 'Sara Ali', nameAr: 'سارة علي', department: 'HR', location: 'HQ' },
  { id: 'EMP003', name: 'Mohamed Hassan', nameAr: 'محمد حسن', department: 'Finance', location: 'HQ' },
  { id: 'EMP004', name: 'Fatima Omar', nameAr: 'فاطمة عمر', department: 'Sales', location: 'Airport-T1' },
  { id: 'EMP005', name: 'Ali Mahmoud', nameAr: 'علي محمود', department: 'Marketing', location: 'HQ' },
  { id: 'EMP006', name: 'Nour Ahmed', nameAr: 'نور أحمد', department: 'Operations', location: 'Airport-T2' },
  { id: 'EMP007', name: 'Khaled Ibrahim', nameAr: 'خالد إبراهيم', department: 'Security', location: 'Airport-T1' },
  { id: 'EMP008', name: 'Mona Saeed', nameAr: 'منى سعيد', department: 'Security', location: 'Airport-T3' },
];

export const CheckInOut = ({ records, onCheckIn, onCheckOut }: CheckInOutProps) => {
  const { t, isRTL, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    nameAr: '',
    department: '',
    location: 'HQ',
  });
  
  const today = new Date().toISOString().split('T')[0];
  
  // Find today's record for selected employee
  const todayRecord = selectedEmployee 
    ? records.find(r => r.date === today && r.employeeId === selectedEmployee.id)
    : null;
  const hasCheckedIn = todayRecord?.checkIn !== null;
  const hasCheckedOut = todayRecord?.checkOut !== null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (!selectedEmployee) {
      toast({
        title: t('attendance.selectEmployeeFirst'),
        variant: 'destructive',
      });
      return;
    }
    onCheckIn(
      selectedEmployee.id, 
      selectedEmployee.name, 
      selectedEmployee.nameAr, 
      selectedEmployee.department
    );
    toast({
      title: t('attendance.checkin.success'),
      description: `${language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.name} - ${t('attendance.checkin.successMessage')}`,
    });
  };

  const handleCheckOut = () => {
    if (todayRecord) {
      onCheckOut(todayRecord.id);
      toast({
        title: t('attendance.checkout.success'),
        description: `${language === 'ar' ? selectedEmployee?.nameAr : selectedEmployee?.name} - ${t('attendance.checkout.successMessage')}`,
      });
    }
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.nameAr || !newEmployee.department) {
      toast({
        title: t('attendance.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }

    const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const employee: Employee = {
      id: newId,
      name: newEmployee.name,
      nameAr: newEmployee.nameAr,
      department: newEmployee.department,
      location: newEmployee.location,
    };

    setEmployees(prev => [...prev, employee]);
    setSelectedEmployee(employee);
    setShowAddEmployee(false);
    setNewEmployee({ name: '', nameAr: '', department: '', location: 'HQ' });
    
    toast({
      title: t('attendance.employeeAdded'),
      description: `${employee.name} - ${employee.nameAr}`,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWorkDuration = () => {
    if (!todayRecord?.checkIn) return null;
    const [checkInHour, checkInMin] = todayRecord.checkIn.split(':').map(Number);
    const checkInDate = new Date();
    checkInDate.setHours(checkInHour, checkInMin, 0);
    
    const endTime = todayRecord.checkOut 
      ? (() => {
          const [h, m] = todayRecord.checkOut.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m, 0);
          return d;
        })()
      : currentTime;
    
    const diff = endTime.getTime() - checkInDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get today's attendance summary
  const todayStats = {
    totalCheckedIn: records.filter(r => r.date === today && r.checkIn).length,
    totalCheckedOut: records.filter(r => r.date === today && r.checkOut).length,
    totalLate: records.filter(r => r.date === today && r.status === 'late').length,
  };

  return (
    <div className="space-y-6">
      {/* Employee Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <User className="w-5 h-5 text-primary" />
            {t('attendance.selectEmployee')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("flex gap-4 items-end", isRTL && "flex-row-reverse")}>
            <div className="flex-1">
              <Label className="mb-2 block">{t('attendance.employee')}</Label>
              <Select 
                value={selectedEmployee?.id || ''} 
                onValueChange={(value) => {
                  const emp = employees.find(e => e.id === value);
                  setSelectedEmployee(emp || null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('attendance.selectEmployeePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <span>{emp.id}</span>
                        <span>-</span>
                        <span>{language === 'ar' ? emp.nameAr : emp.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {emp.department}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddEmployee(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              {t('attendance.addEmployee')}
            </Button>
          </div>

          {selectedEmployee && (
            <div className={cn("mt-4 p-4 bg-muted rounded-lg flex items-center gap-6", isRTL && "flex-row-reverse")}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {language === 'ar' ? selectedEmployee.nameAr : selectedEmployee.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === 'ar' ? selectedEmployee.name : selectedEmployee.nameAr}
                </p>
                <div className={cn("flex gap-4 mt-2 text-sm", isRTL && "flex-row-reverse")}>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {selectedEmployee.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedEmployee.location}
                  </span>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {selectedEmployee.id}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Time Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{formatDate(currentTime)}</span>
            </div>
            <div className="text-6xl font-bold text-primary mb-6 font-mono">
              {formatTime(currentTime)}
            </div>
            
            {/* Action Buttons */}
            <div className={cn("flex justify-center gap-4", isRTL && "flex-row-reverse")}>
              {!selectedEmployee ? (
                <Badge variant="outline" className="text-lg py-3 px-6 bg-muted">
                  {t('attendance.selectEmployeeFirst')}
                </Badge>
              ) : !hasCheckedIn ? (
                <Button 
                  size="lg" 
                  className="bg-success hover:bg-success/90 min-w-[200px] h-14 text-lg gap-2"
                  onClick={handleCheckIn}
                >
                  <LogIn className="w-5 h-5" />
                  {t('attendance.checkin.button')}
                </Button>
              ) : !hasCheckedOut ? (
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="min-w-[200px] h-14 text-lg gap-2"
                  onClick={handleCheckOut}
                >
                  <LogOut className="w-5 h-5" />
                  {t('attendance.checkout.button')}
                </Button>
              ) : (
                <Badge variant="outline" className="text-lg py-3 px-6 bg-muted">
                  {t('attendance.completed')}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Status for Selected Employee */}
      {selectedEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-lg bg-success/10">
                  <LogIn className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendance.checkin.time')}</p>
                  <p className="text-2xl font-bold">
                    {todayRecord?.checkIn || '--:--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <LogOut className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendance.checkout.time')}</p>
                  <p className="text-2xl font-bold">
                    {todayRecord?.checkOut || '--:--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Timer className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('attendance.workDuration')}</p>
                  <p className="text-2xl font-bold">
                    {getWorkDuration() || '--:--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Status Info */}
      {todayRecord && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Clock className="w-5 h-5" />
              {t('attendance.todayStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm py-1 px-3",
                  todayRecord.status === 'present' && "bg-success/10 text-success border-success",
                  todayRecord.status === 'late' && "bg-warning/10 text-warning border-warning",
                  todayRecord.status === 'early-leave' && "bg-orange-100 text-orange-700 border-orange-300",
                )}
              >
                {t(`attendance.status.${todayRecord.status}`)}
              </Badge>
              {todayRecord.status === 'late' && (
                <span className="text-sm text-muted-foreground">
                  {t('attendance.lateBy')} {parseInt(todayRecord.checkIn?.split(':')[0] || '9') - 9}h {parseInt(todayRecord.checkIn?.split(':')[1] || '0')}m
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Calendar className="w-5 h-5" />
            {t('attendance.todaySummary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-3xl font-bold text-success">{todayStats.totalCheckedIn}</p>
              <p className="text-sm text-muted-foreground">{t('attendance.totalCheckedIn')}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-3xl font-bold text-primary">{todayStats.totalCheckedOut}</p>
              <p className="text-sm text-muted-foreground">{t('attendance.totalCheckedOut')}</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-3xl font-bold text-warning">{todayStats.totalLate}</p>
              <p className="text-sm text-muted-foreground">{t('attendance.totalLate')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('attendance.addNewEmployee')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('attendance.employeeNameEn')}</Label>
              <Input 
                value={newEmployee.name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label>{t('attendance.employeeNameAr')}</Label>
              <Input 
                value={newEmployee.nameAr}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, nameAr: e.target.value }))}
                placeholder="جون دو"
                dir="rtl"
              />
            </div>
            <div>
              <Label>{t('attendance.department')}</Label>
              <Select 
                value={newEmployee.department}
                onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('attendance.selectDepartment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('attendance.location')}</Label>
              <Select 
                value={newEmployee.location}
                onValueChange={(value) => setNewEmployee(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HQ">{t('attendance.locations.hq')}</SelectItem>
                  <SelectItem value="Airport-T1">{t('attendance.locations.airportT1')}</SelectItem>
                  <SelectItem value="Airport-T2">{t('attendance.locations.airportT2')}</SelectItem>
                  <SelectItem value="Airport-T3">{t('attendance.locations.airportT3')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddEmployee}>
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
