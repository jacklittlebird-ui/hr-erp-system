import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  provider: string;
  category: string;
  duration: string;
  method: 'classroom' | 'online' | 'cbt' | 'ojt' | 'blended';
  validityPeriod: string;
  status: 'active' | 'inactive';
  description: string;
}

const mockCourses: Course[] = [
  { id: '1', code: 'ER-001', nameEn: 'Emergency Response', nameAr: 'الاستجابة للطوارئ', provider: 'Link Aero Training', category: 'Safety', duration: '2 days', method: 'classroom', validityPeriod: '3 years', status: 'active', description: 'Emergency response procedures for ground operations' },
  { id: '2', code: 'DGR-001', nameEn: 'Dangerous Goods Handling', nameAr: 'التعامل مع البضائع الخطرة', provider: 'IATA', category: 'Safety', duration: '5 days', method: 'classroom', validityPeriod: '2 years', status: 'active', description: 'IATA certified dangerous goods training' },
  { id: '3', code: 'SEC-001', nameEn: 'Aviation Security', nameAr: 'أمن الطيران', provider: 'ECAA', category: 'Security', duration: '3 days', method: 'blended', validityPeriod: '2 years', status: 'active', description: 'Aviation security awareness and procedures' },
  { id: '4', code: 'RMP-001', nameEn: 'Ramp Safety', nameAr: 'سلامة الساحة', provider: 'Internal', category: 'Safety', duration: '1 day', method: 'ojt', validityPeriod: '1 year', status: 'active', description: 'Ramp area safety procedures' },
  { id: '5', code: 'CRM-001', nameEn: 'Crew Resource Management', nameAr: 'إدارة موارد الطاقم', provider: 'Link Aero Training', category: 'Human Factors', duration: '2 days', method: 'classroom', validityPeriod: '3 years', status: 'inactive', description: 'Team communication and decision making' },
];

const methodLabels = {
  classroom: { en: 'Class Room', ar: 'فصل دراسي', abbr: 'CR' },
  online: { en: 'Self Study', ar: 'دراسة ذاتية', abbr: 'SS' },
  cbt: { en: 'Computer Based Training', ar: 'تدريب حاسوبي', abbr: 'CBT' },
  ojt: { en: 'On Job Training', ar: 'تدريب على رأس العمل', abbr: 'OJT' },
  blended: { en: 'Blended', ar: 'مدمج', abbr: 'BL' },
};

export const CoursesList = () => {
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({});

  const filteredCourses = courses.filter(course => {
    const searchMatch = course.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.nameAr.includes(searchQuery) ||
                        course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = !filterCategory || filterCategory === 'all' || course.category === filterCategory;
    const statusMatch = !filterStatus || filterStatus === 'all' || course.status === filterStatus;
    return searchMatch && categoryMatch && statusMatch;
  });

  const handleNew = () => {
    setSelectedCourse(null);
    setIsViewMode(false);
    setFormData({
      id: String(courses.length + 1),
      code: '',
      nameEn: '',
      nameAr: '',
      provider: '',
      category: 'Safety',
      duration: '',
      method: 'classroom',
      validityPeriod: '',
      status: 'active',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsViewMode(false);
    setFormData(course);
    setIsDialogOpen(true);
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setIsViewMode(true);
    setFormData(course);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.nameEn) {
      toast({ title: t('common.error'), description: t('training.fillRequired'), variant: 'destructive' });
      return;
    }

    if (selectedCourse) {
      setCourses(courses.map(c => c.id === selectedCourse.id ? formData as Course : c));
      toast({ title: t('common.success'), description: t('training.courses.updated') });
    } else {
      setCourses([...courses, formData as Course]);
      toast({ title: t('common.success'), description: t('training.courses.added') });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    toast({ title: t('common.success'), description: t('training.courses.deleted') });
  };

  const getMethodBadge = (method: string) => {
    const m = methodLabels[method as keyof typeof methodLabels];
    return <Badge variant="outline">{m?.abbr || method}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('training.courses.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('training.courses.filterCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="Safety">{t('training.category.safety')}</SelectItem>
                <SelectItem value="Security">{t('training.category.security')}</SelectItem>
                <SelectItem value="Human Factors">{t('training.category.humanFactors')}</SelectItem>
                <SelectItem value="Technical">{t('training.category.technical')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('training.courses.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('training.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('training.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t('training.courses.add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('training.courses.code')}</TableHead>
                <TableHead>{t('training.courses.name')}</TableHead>
                <TableHead>{t('training.provider')}</TableHead>
                <TableHead>{t('training.courses.category')}</TableHead>
                <TableHead>{t('training.courses.duration')}</TableHead>
                <TableHead>{t('training.courses.method')}</TableHead>
                <TableHead>{t('training.courses.validity')}</TableHead>
                <TableHead>{t('training.courses.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map(course => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono">{course.code}</TableCell>
                  <TableCell className="font-medium">
                    {language === 'ar' ? course.nameAr : course.nameEn}
                  </TableCell>
                  <TableCell>{course.provider}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>{getMethodBadge(course.method)}</TableCell>
                  <TableCell>{course.validityPeriod}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status === 'active' ? t('training.status.active') : t('training.status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(course)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {t('training.courses.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Methods Legend */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <p><strong>{t('training.courses.methodsLegend')}:</strong></p>
        <p className="mt-1">
          {Object.entries(methodLabels).map(([key, val], i) => (
            <span key={key}>
              {val.abbr}= {language === 'ar' ? val.ar : val.en}
              {i < Object.keys(methodLabels).length - 1 ? '  |  ' : ''}
            </span>
          ))}
        </p>
      </div>

      {/* Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? t('training.courses.view') : selectedCourse ? t('training.courses.edit') : t('training.courses.add')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('training.courses.code')}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>{t('training.provider')}</Label>
              <Input
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>{t('training.courses.nameEn')}</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>{t('training.courses.nameAr')}</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                disabled={isViewMode}
                dir="rtl"
              />
            </div>
            <div>
              <Label>{t('training.courses.category')}</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })} disabled={isViewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Safety">{t('training.category.safety')}</SelectItem>
                  <SelectItem value="Security">{t('training.category.security')}</SelectItem>
                  <SelectItem value="Human Factors">{t('training.category.humanFactors')}</SelectItem>
                  <SelectItem value="Technical">{t('training.category.technical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('training.courses.duration')}</Label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div>
              <Label>{t('training.courses.method')}</Label>
              <Select value={formData.method} onValueChange={(val: Course['method']) => setFormData({ ...formData, method: val })} disabled={isViewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(methodLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{language === 'ar' ? val.ar : val.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('training.courses.validity')}</Label>
              <Input
                value={formData.validityPeriod}
                onChange={(e) => setFormData({ ...formData, validityPeriod: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div className="col-span-2">
              <Label>{t('training.courses.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isViewMode}
                rows={3}
              />
            </div>
            <div>
              <Label>{t('training.courses.status')}</Label>
              <Select value={formData.status} onValueChange={(val: 'active' | 'inactive') => setFormData({ ...formData, status: val })} disabled={isViewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('training.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('training.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
            {!isViewMode && <Button onClick={handleSave}>{t('common.save')}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
