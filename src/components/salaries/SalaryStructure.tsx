import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Settings, Users, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SalaryGrade {
  id: string;
  gradeNameAr: string;
  gradeNameEn: string;
  level: string;
  minSalary: number;
  maxSalary: number;
  housingPercent: number;
  transportFixed: number;
  mealFixed: number;
  employeesCount: number;
  isActive: boolean;
}

export const SalaryStructure = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [grades] = useState<SalaryGrade[]>([
    { id: '1', gradeNameAr: 'المدير التنفيذي', gradeNameEn: 'Executive Director', level: 'A1', minSalary: 25000, maxSalary: 40000, housingPercent: 30, transportFixed: 1500, mealFixed: 500, employeesCount: 2, isActive: true },
    { id: '2', gradeNameAr: 'مدير إدارة', gradeNameEn: 'Department Manager', level: 'A2', minSalary: 18000, maxSalary: 28000, housingPercent: 25, transportFixed: 1200, mealFixed: 400, employeesCount: 8, isActive: true },
    { id: '3', gradeNameAr: 'رئيس قسم', gradeNameEn: 'Section Head', level: 'B1', minSalary: 12000, maxSalary: 20000, housingPercent: 20, transportFixed: 800, mealFixed: 350, employeesCount: 15, isActive: true },
    { id: '4', gradeNameAr: 'أخصائي أول', gradeNameEn: 'Senior Specialist', level: 'B2', minSalary: 9000, maxSalary: 15000, housingPercent: 20, transportFixed: 600, mealFixed: 300, employeesCount: 35, isActive: true },
    { id: '5', gradeNameAr: 'أخصائي', gradeNameEn: 'Specialist', level: 'C1', minSalary: 6000, maxSalary: 10000, housingPercent: 15, transportFixed: 500, mealFixed: 300, employeesCount: 50, isActive: true },
    { id: '6', gradeNameAr: 'موظف', gradeNameEn: 'Employee', level: 'C2', minSalary: 4000, maxSalary: 7000, housingPercent: 15, transportFixed: 400, mealFixed: 250, employeesCount: 40, isActive: true },
    { id: '7', gradeNameAr: 'متدرب', gradeNameEn: 'Trainee', level: 'D1', minSalary: 2500, maxSalary: 4000, housingPercent: 10, transportFixed: 300, mealFixed: 200, employeesCount: 10, isActive: true },
  ]);

  const totalEmployees = grades.reduce((sum, g) => sum + g.employeesCount, 0);

  const handleAdd = () => {
    toast({ title: t('common.success'), description: t('salaries.gradeAdded') });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-primary/10">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaries.totalGrades')}</p>
                <p className="text-2xl font-bold">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaries.totalAssigned')}</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
              <div className="p-3 rounded-lg bg-green-100">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('salaries.salaryRange')}</p>
                <p className="text-2xl font-bold">2,500 - 40,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
            <CardTitle>{t('salaries.gradesTitle')}</CardTitle>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('salaries.addGrade')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className={cn(isRTL && "text-right")}>{t('salaries.addGrade')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('salaries.gradeNameAr')}</Label>
                      <Input className={cn(isRTL && "text-right")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.gradeNameEn')}</Label>
                      <Input />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('salaries.gradeLevel')}</Label>
                      <Input placeholder="e.g. A1" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.minSalary')}</Label>
                      <Input type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.maxSalary')}</Label>
                      <Input type="number" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('salaries.housingPercent')}</Label>
                      <Input type="number" placeholder="%" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.transportFixed')}</Label>
                      <Input type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('salaries.mealFixed')}</Label>
                      <Input type="number" />
                    </div>
                  </div>
                  <Button onClick={handleAdd} className="w-full">{t('common.save')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.gradeLevel')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.gradeName')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.minSalary')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.maxSalary')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.housingPercent')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.transportFixed')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.mealFixed')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('salaries.employeesInGrade')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map(grade => (
                <TableRow key={grade.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{grade.level}</Badge>
                  </TableCell>
                  <TableCell className={cn("font-medium", isRTL && "text-right")}>
                    {isRTL ? grade.gradeNameAr : grade.gradeNameEn}
                  </TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{grade.minSalary.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{grade.maxSalary.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{grade.housingPercent}%</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{grade.transportFixed.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>{grade.mealFixed.toLocaleString()}</TableCell>
                  <TableCell className={cn(isRTL && "text-right")}>
                    <Badge variant="secondary">{grade.employeesCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
