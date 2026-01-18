import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Star, Save, Send, Users, Target, Lightbulb, TrendingUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

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

const mockEmployees = [
  { id: '1', name: 'أحمد محمد علي', department: 'تقنية المعلومات' },
  { id: '2', name: 'فاطمة علي حسن', department: 'الموارد البشرية' },
  { id: '3', name: 'محمد حسن أحمد', department: 'المبيعات' },
  { id: '4', name: 'سارة أحمد محمد', department: 'المالية' },
];

const quarters = [
  { value: 'Q1-2024', label: 'Q1 2024 (يناير - مارس)' },
  { value: 'Q2-2024', label: 'Q2 2024 (أبريل - يونيو)' },
  { value: 'Q3-2024', label: 'Q3 2024 (يوليو - سبتمبر)' },
  { value: 'Q4-2024', label: 'Q4 2024 (أكتوبر - ديسمبر)' },
];

export const PerformanceReviewForm = () => {
  const { t, isRTL, language } = useLanguage();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [criteria, setCriteria] = useState<CriteriaScore[]>(initialCriteria);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [goals, setGoals] = useState('');
  const [managerComments, setManagerComments] = useState('');

  const handleScoreChange = (id: string, newScore: number[]) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, score: newScore[0] } : c
    ));
  };

  const calculateOverallScore = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = criteria.reduce((sum, c) => sum + (c.score * c.weight), 0);
    return (weightedSum / totalWeight).toFixed(2);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return { label: t('performance.score.excellent'), color: 'text-stat-green' };
    if (score >= 3.5) return { label: t('performance.score.veryGood'), color: 'text-stat-blue' };
    if (score >= 2.5) return { label: t('performance.score.good'), color: 'text-stat-yellow' };
    if (score >= 1.5) return { label: t('performance.score.acceptable'), color: 'text-stat-coral' };
    return { label: t('performance.score.poor'), color: 'text-destructive' };
  };

  const overallScore = parseFloat(calculateOverallScore());
  const scoreInfo = getScoreLabel(overallScore);

  const handleSaveDraft = () => {
    toast.success(t('performance.form.draftSaved'));
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !selectedQuarter) {
      toast.error(t('performance.form.fillRequired'));
      return;
    }
    toast.success(t('performance.form.submitted'));
  };

  return (
    <div className="space-y-6">
      {/* Employee & Quarter Selection */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Users className="w-5 h-5 text-primary" />
            {t('performance.form.selectEmployee')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('performance.form.employee')}</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder={t('performance.form.selectEmployeePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('performance.form.quarter')}</Label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('performance.form.selectQuarterPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map(q => (
                    <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="w-5 h-5 text-primary" />
            {t('performance.form.criteria')}
          </CardTitle>
          <CardDescription>{t('performance.form.criteriaDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-3">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Label className="text-base font-medium">
                    {language === 'ar' ? criterion.nameAr : criterion.name}
                  </Label>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {criterion.weight}%
                  </span>
                </div>
                <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-5 h-5 cursor-pointer transition-colors",
                        star <= criterion.score 
                          ? "text-stat-yellow fill-stat-yellow" 
                          : "text-muted-foreground"
                      )}
                      onClick={() => handleScoreChange(criterion.id, [star])}
                    />
                  ))}
                  <span className="font-bold text-lg w-8 text-center">{criterion.score}</span>
                </div>
              </div>
              <Slider
                value={[criterion.score]}
                min={1}
                max={5}
                step={0.5}
                onValueChange={(value) => handleScoreChange(criterion.id, value)}
                className="w-full"
              />
            </div>
          ))}

          {/* Overall Score Display */}
          <div className={cn(
            "flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Star className="w-6 h-6 text-stat-yellow fill-stat-yellow" />
              <span className="font-semibold text-lg">{t('performance.form.overallScore')}</span>
            </div>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <span className={cn("font-bold text-2xl", scoreInfo.color)}>{overallScore}</span>
              <span className={cn("text-sm font-medium px-2 py-1 rounded", scoreInfo.color, "bg-current/10")}>
                {scoreInfo.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2 text-stat-green", isRTL && "flex-row-reverse")}>
              <TrendingUp className="w-5 h-5" />
              {t('performance.form.strengths')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder={t('performance.form.strengthsPlaceholder')}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-2 text-stat-coral", isRTL && "flex-row-reverse")}>
              <Lightbulb className="w-5 h-5" />
              {t('performance.form.improvements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder={t('performance.form.improvementsPlaceholder')}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Goals & Manager Comments */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="w-5 h-5 text-primary" />
            {t('performance.form.nextQuarterGoals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder={t('performance.form.goalsPlaceholder')}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <MessageSquare className="w-5 h-5 text-primary" />
            {t('performance.form.managerComments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={managerComments}
            onChange={(e) => setManagerComments(e.target.value)}
            placeholder={t('performance.form.managerCommentsPlaceholder')}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className={cn("flex gap-3", isRTL ? "flex-row-reverse justify-start" : "justify-end")}>
        <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
          <Save className="w-4 h-4" />
          {t('performance.form.saveDraft')}
        </Button>
        <Button onClick={handleSubmit} className="gap-2 bg-stat-green hover:bg-stat-green/90">
          <Send className="w-4 h-4" />
          {t('performance.form.submit')}
        </Button>
      </div>
    </div>
  );
};
