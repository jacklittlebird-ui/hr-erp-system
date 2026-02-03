import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X, ChevronLeft, ChevronRight, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CourseSyllabus {
  id: string;
  courseName: string;
  provider: string;
  courseCode: string;
  editedBy: string;
  courseDuration: string;
  courseObjective: string;
  courseAdministration: string;
  exercises: string;
  basicTopics: string;
  intermediateTopics: string;
  advancedTopics: string;
  reference: string;
  examination: string;
}

const mockSyllabi: CourseSyllabus[] = [
  {
    id: '1',
    courseName: 'Covid-19 Operational planning guideline',
    provider: 'WHO',
    courseCode: 'covid19',
    editedBy: 'Hossam Hagag',
    courseDuration: '2 days',
    courseObjective: 'Understand COVID-19 operational protocols and safety measures',
    courseAdministration: 'Training Department',
    exercises: 'Practical exercises on PPE usage',
    basicTopics: 'Introduction to COVID-19\nTransmission methods\nPrevention basics',
    intermediateTopics: 'Workplace safety protocols\nRisk assessment\nContact tracing',
    advancedTopics: 'Emergency response\nCrisis management\nRecovery procedures',
    reference: 'WHO Guidelines 2020\nICAO Health Guidelines',
    examination: 'Written exam + Practical assessment',
  },
  {
    id: '2',
    courseName: 'Dangerous Goods Handling',
    provider: 'IATA',
    courseCode: 'DGR001',
    editedBy: 'Ahmed Mostafa',
    courseDuration: '5 days',
    courseObjective: 'Safe handling of dangerous goods in aviation',
    courseAdministration: 'Operations Training',
    exercises: 'Classification exercises\nPackaging practicals',
    basicTopics: 'Introduction to DG\nClassification basics',
    intermediateTopics: 'Packaging requirements\nDocumentation',
    advancedTopics: 'Emergency procedures\nIncident handling',
    reference: 'IATA DGR Manual',
    examination: 'Written + Practical',
  },
];

export const CoursesSyllabus = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [syllabi, setSyllabi] = useState<CourseSyllabus[]>(mockSyllabi);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddMode, setIsAddMode] = useState(false);
  const [formData, setFormData] = useState<CourseSyllabus>(syllabi[0]);

  const handleNew = () => {
    setIsAddMode(true);
    setFormData({
      id: String(syllabi.length + 1),
      courseName: '',
      provider: '',
      courseCode: '',
      editedBy: '',
      courseDuration: '',
      courseObjective: '',
      courseAdministration: '',
      exercises: '',
      basicTopics: '',
      intermediateTopics: '',
      advancedTopics: '',
      reference: '',
      examination: '',
    });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(syllabi.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    setFormData(syllabi[newIndex]);
  };

  const handleSave = () => {
    if (!formData.courseName || !formData.courseCode) {
      toast({
        title: t('common.error'),
        description: t('training.fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (isAddMode) {
      setSyllabi([...syllabi, formData]);
      setCurrentIndex(syllabi.length);
      toast({ title: t('common.success'), description: t('training.syllabus.added') });
    } else {
      setSyllabi(syllabi.map(s => s.id === formData.id ? formData : s));
      toast({ title: t('common.success'), description: t('training.syllabus.updated') });
    }
    setIsAddMode(false);
  };

  const handleDelete = () => {
    if (syllabi.length <= 1) return;
    setSyllabi(syllabi.filter(s => s.id !== formData.id));
    setCurrentIndex(0);
    setFormData(syllabi[0]);
    toast({ title: t('common.success'), description: t('training.syllabus.deleted') });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('training.syllabus.title')}</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('training.syllabus.editedBy')}:</span>
          <Select value={formData.editedBy} onValueChange={(val) => setFormData({ ...formData, editedBy: val })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hossam Hagag">Hossam Hagag</SelectItem>
              <SelectItem value="Ahmed Mostafa">Ahmed Mostafa</SelectItem>
              <SelectItem value="Mohamed Ali">Mohamed Ali</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={handleDelete} disabled={syllabi.length <= 1}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} disabled={currentIndex === 0 || isAddMode}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} disabled={currentIndex === syllabi.length - 1 || isAddMode}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label>{t('training.courseName')}</Label>
            <Input
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('training.provider')}</Label>
            <Input
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('training.syllabus.courseCode')}</Label>
            <Input
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Column 1 - Course Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">{t('training.syllabus.courseInfo')}</h3>
            <div>
              <Label>{t('training.syllabus.duration')}</Label>
              <Input
                value={formData.courseDuration}
                onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('training.syllabus.objective')}</Label>
              <Textarea
                value={formData.courseObjective}
                onChange={(e) => setFormData({ ...formData, courseObjective: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>{t('training.syllabus.administration')}</Label>
              <Textarea
                value={formData.courseAdministration}
                onChange={(e) => setFormData({ ...formData, courseAdministration: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>{t('training.syllabus.exercises')}</Label>
              <Textarea
                value={formData.exercises}
                onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <h4 className="text-md font-semibold text-destructive mt-4">{t('training.syllabus.examination')}</h4>
              <Textarea
                value={formData.examination}
                onChange={(e) => setFormData({ ...formData, examination: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Column 2 - Topics */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">{t('training.syllabus.basicTopics')}</h3>
              <Textarea
                value={formData.basicTopics}
                onChange={(e) => setFormData({ ...formData, basicTopics: e.target.value })}
                rows={8}
                className="mt-2"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive">{t('training.syllabus.intermediateTopics')}</h3>
              <Textarea
                value={formData.intermediateTopics}
                onChange={(e) => setFormData({ ...formData, intermediateTopics: e.target.value })}
                rows={8}
                className="mt-2"
              />
            </div>
          </div>

          {/* Column 3 - Advanced & Reference */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary">{t('training.syllabus.advancedTopics')}</h3>
              <Textarea
                value={formData.advancedTopics}
                onChange={(e) => setFormData({ ...formData, advancedTopics: e.target.value })}
                rows={8}
                className="mt-2"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">{t('training.syllabus.reference')}</h3>
              <Textarea
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                rows={8}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {!isAddMode && `${t('training.trainers.record')} ${currentIndex + 1} ${t('common.of')} ${syllabi.length}`}
          </span>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDelete} disabled={syllabi.length <= 1}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
