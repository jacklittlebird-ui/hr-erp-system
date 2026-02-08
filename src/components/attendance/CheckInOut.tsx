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
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  
  // Check-in dialog state
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedCheckInEmployee, setSelectedCheckInEmployee] = useState<string>('');
  
  // Check-out dialog state
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [selectedCheckOutEmployee, setSelectedCheckOutEmployee] = useState<string>('');
  
  // Add employee dialog state
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    nameAr: '',
    department: '',
    location: 'HQ',
  });
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get employees who haven't checked in today
  const employeesNotCheckedIn = employees.filter(emp => {
    const todayRecord = records.find(r => r.date === today && r.employeeId === emp.id);
    return !todayRecord || !todayRecord.checkIn;
  });

  // Get records of employees who have checked in but not checked out today
  const recordsCheckedInNotOut = records.filter(r => r.date === today && r.checkIn && !r.checkOut);
  
  // Map to employee info for display
  const employeesCheckedInNotOut = recordsCheckedInNotOut.map(record => {
    const emp = employees.find(e => e.id === record.employeeId);
    return {
      id: record.employeeId,
      name: emp?.name || record.employeeName,
      nameAr: emp?.nameAr || record.employeeNameAr,
      department: emp?.department || record.department,
      location: emp?.location || 'HQ',
      checkIn: record.checkIn,
      recordId: record.id
    };
  });

  const handleCheckIn = () => {
    if (!selectedCheckInEmployee) {
      toast({
        title: t('attendance.selectEmployeeFirst'),
        variant: 'destructive',
      });
      return;
    }
    
    const employee = employees.find(e => e.id === selectedCheckInEmployee);
    if (!employee) return;

    onCheckIn(
      employee.id, 
      employee.name, 
      employee.nameAr, 
      employee.department
    );
    
    toast({
      title: t('attendance.checkin.success'),
      description: `${language === 'ar' ? employee.nameAr : employee.name} - ${currentTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`,
    });
    
    setShowCheckInDialog(false);
    setSelectedCheckInEmployee('');
  };

  const handleCheckOut = () => {
    if (!selectedCheckOutEmployee) {
      toast({
        title: t('attendance.selectEmployeeFirst'),
        variant: 'destructive',
      });
      return;
    }

    const employee = employees.find(e => e.id === selectedCheckOutEmployee);
    const todayRecord = records.find(r => r.date === today && r.employeeId === selectedCheckOutEmployee);
    
    if (!todayRecord || !employee) return;

    // Calculate work hours
    const checkInTime = todayRecord.checkIn;
    const checkOutTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    let workHours = 0;
    let workMinutes = 0;
    
    if (checkInTime) {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = [currentTime.getHours(), currentTime.getMinutes()];
      const totalInMinutes = inH * 60 + inM;
      const totalOutMinutes = outH * 60 + outM;
      const diffMinutes = totalOutMinutes - totalInMinutes;
      workHours = Math.floor(diffMinutes / 60);
      workMinutes = diffMinutes % 60;
    }

    onCheckOut(todayRecord.id);
    
    toast({
      title: t('attendance.checkout.success'),
      description: `${language === 'ar' ? employee.nameAr : employee.name} - ${t('attendance.workDuration')}: ${workHours}h ${workMinutes}m`,
    });
    
    setShowCheckOutDialog(false);
    setSelectedCheckOutEmployee('');
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

  // Get today's attendance summary
  const todayStats = {
    totalCheckedIn: records.filter(r => r.date === today && r.checkIn).length,
    totalCheckedOut: records.filter(r => r.date === today && r.checkOut).length,
    totalLate: records.filter(r => r.date === today && r.status === 'late').length,
  };

  // Get recent check-ins/outs for display
  const recentActivity = records
    .filter(r => r.date === today)
    .sort((a, b) => {
      const timeA = a.checkOut || a.checkIn || '';
      const timeB = b.checkOut || b.checkIn || '';
      return timeB.localeCompare(timeA);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Current Time Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{formatDate(currentTime)}</span>
            </div>
            <div className="text-6xl font-bold text-primary mb-8 font-mono">
              {formatTime(currentTime)}
            </div>
            
            {/* Main Action Buttons */}
            <div className={cn("flex justify-center gap-6 flex-wrap", isRTL && "flex-row-reverse")}>
              <Button 
                size="lg" 
                className="bg-success hover:bg-success/90 min-w-[200px] h-16 text-xl gap-3 shadow-lg"
                onClick={() => setShowCheckInDialog(true)}
              >
                <LogIn className="w-6 h-6" />
                {t('attendance.checkin.button')}
              </Button>
              
              <Button 
                size="lg" 
                variant="destructive"
                className="min-w-[200px] h-16 text-xl gap-3 shadow-lg"
                onClick={() => setShowCheckOutDialog(true)}
              >
                <LogOut className="w-6 h-6" />
                {t('attendance.checkout.button')}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[200px] h-16 text-xl gap-3"
                onClick={() => setShowAddEmployee(true)}
              >
                <Plus className="w-6 h-6" />
                {t('attendance.addEmployee')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 bg-stat-green-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className={cn("flex items-center gap-4 w-full", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-stat-green shrink-0">
              <LogIn className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('attendance.totalCheckedIn')}</p>
              <p className="text-3xl font-bold text-foreground">{todayStats.totalCheckedIn}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5 bg-stat-blue-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className={cn("flex items-center gap-4 w-full", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-stat-blue shrink-0">
              <LogOut className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('attendance.totalCheckedOut')}</p>
              <p className="text-3xl font-bold text-foreground">{todayStats.totalCheckedOut}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5 bg-stat-coral-bg flex items-center gap-4 shadow-sm border border-border/30">
          <div className={cn("flex items-center gap-4 w-full", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-stat-coral shrink-0">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('attendance.totalLate')}</p>
              <p className="text-3xl font-bold text-foreground">{todayStats.totalLate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Timer className="w-5 h-5" />
              {t('attendance.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((record, index) => (
                <div 
                  key={`${record.id}-${index}`}
                  className={cn(
                    "flex items-center justify-between p-3 bg-muted/50 rounded-lg",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === 'ar' ? record.employeeNameAr : record.employeeName}
                      </p>
                      <p className="text-sm text-muted-foreground">{record.department}</p>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    {record.checkIn && (
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        <LogIn className="w-3 h-3 mr-1" />
                        {record.checkIn}
                      </Badge>
                    )}
                    {record.checkOut && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                        <LogOut className="w-3 h-3 mr-1" />
                        {record.checkOut}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={cn(
                        record.status === 'present' && "bg-success/10 text-success",
                        record.status === 'late' && "bg-warning/10 text-warning",
                        record.status === 'early-leave' && "bg-stat-coral/10 text-stat-coral",
                      )}
                    >
                      {t(`attendance.status.${record.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-In Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <LogIn className="w-5 h-5 text-success" />
              {t('attendance.checkin.button')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">{t('attendance.selectEmployee')}</Label>
              <Select 
                value={selectedCheckInEmployee} 
                onValueChange={setSelectedCheckInEmployee}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('attendance.selectEmployeePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {employeesNotCheckedIn.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {t('attendance.allEmployeesCheckedIn')}
                    </div>
                  ) : (
                    employeesNotCheckedIn.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <span className="font-mono text-xs text-muted-foreground">{emp.id}</span>
                          <span>{language === 'ar' ? emp.nameAr : emp.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {emp.department}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCheckInEmployee && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground mb-1">{t('attendance.checkin.time')}</p>
                <p className="text-2xl font-bold text-success">
                  {currentTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCheckInDialog(false);
              setSelectedCheckInEmployee('');
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              className="bg-success hover:bg-success/90"
              onClick={handleCheckIn}
              disabled={!selectedCheckInEmployee}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t('attendance.checkin.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-Out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <LogOut className="w-5 h-5 text-destructive" />
              {t('attendance.checkout.button')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">{t('attendance.selectEmployee')}</Label>
              <Select 
                value={selectedCheckOutEmployee} 
                onValueChange={setSelectedCheckOutEmployee}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('attendance.selectEmployeePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {recordsCheckedInNotOut.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {t('attendance.noEmployeesToCheckOut')}
                    </div>
                  ) : (
                    recordsCheckedInNotOut.map((record) => {
                      const emp = employees.find(e => e.id === record.employeeId);
                      const displayName = language === 'ar' 
                        ? (emp?.nameAr || record.employeeNameAr) 
                        : (emp?.name || record.employeeName);
                      return (
                        <SelectItem key={record.id} value={record.employeeId}>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <span className="font-mono text-xs text-muted-foreground">{record.employeeId}</span>
                            <span className="font-medium">{displayName}</span>
                            <Badge variant="outline" className="text-xs bg-success/10 text-success">
                              {t('attendance.checkin.time')}: {record.checkIn}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCheckOutEmployee && (() => {
              const record = records.find(r => r.date === today && r.employeeId === selectedCheckOutEmployee);
              const checkInTime = record?.checkIn;
              let workHours = 0;
              let workMinutes = 0;
              
              if (checkInTime) {
                const [inH, inM] = checkInTime.split(':').map(Number);
                const [outH, outM] = [currentTime.getHours(), currentTime.getMinutes()];
                const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
                workHours = Math.floor(diffMinutes / 60);
                workMinutes = diffMinutes % 60;
              }
              
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                      <p className="text-xs text-muted-foreground">{t('attendance.checkin.time')}</p>
                      <p className="text-xl font-bold text-success">{checkInTime}</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-xs text-muted-foreground">{t('attendance.checkout.time')}</p>
                      <p className="text-xl font-bold text-destructive">
                        {currentTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t('attendance.workDuration')}</p>
                    <p className="text-3xl font-bold text-primary">{workHours}h {workMinutes}m</p>
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCheckOutDialog(false);
              setSelectedCheckOutEmployee('');
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCheckOut}
              disabled={!selectedCheckOutEmployee}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('attendance.checkout.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <SelectItem value="HQ">HQ - المقر الرئيسي</SelectItem>
                  <SelectItem value="Airport-T1">Airport Terminal 1 - صالة 1</SelectItem>
                  <SelectItem value="Airport-T2">Airport Terminal 2 - صالة 2</SelectItem>
                  <SelectItem value="Airport-T3">Airport Terminal 3 - صالة 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              {t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
