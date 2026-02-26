import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, User, Briefcase, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PipelineCandidate {
  id: string;
  name: string;
  position: string;
  department: string;
  stage: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired';
  daysInStage: number;
}

const initialPipeline: PipelineCandidate[] = [];

const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired'] as const;

export const HiringPipeline = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [pipeline, setPipeline] = useState<PipelineCandidate[]>(initialPipeline);
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = pipeline.filter(c => deptFilter === 'all' || c.department === deptFilter);

  const stageLabels: Record<string, string> = {
    applied: t('recruitment.pipeline.applied'),
    screening: t('recruitment.pipeline.screening'),
    interview: t('recruitment.pipeline.interview'),
    assessment: t('recruitment.pipeline.assessment'),
    offer: t('recruitment.pipeline.offer'),
    hired: t('recruitment.pipeline.hired'),
  };

  const stageColors: Record<string, string> = {
    applied: 'border-t-blue-500',
    screening: 'border-t-purple-500',
    interview: 'border-t-amber-500',
    assessment: 'border-t-cyan-500',
    offer: 'border-t-orange-500',
    hired: 'border-t-green-500',
  };

  const stageBgColors: Record<string, string> = {
    applied: 'bg-blue-50',
    screening: 'bg-purple-50',
    interview: 'bg-amber-50',
    assessment: 'bg-cyan-50',
    offer: 'bg-orange-50',
    hired: 'bg-green-50',
  };

  const moveCandidate = (candidateId: string, direction: 'forward' | 'backward') => {
    setPipeline(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const currentIndex = stages.indexOf(c.stage);
      const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0 || newIndex >= stages.length) return c;
      return { ...c, stage: stages[newIndex], daysInStage: 0 };
    }));
    toast({ title: t('recruitment.success'), description: t('recruitment.candidateMoved') });
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <h3 className="font-semibold text-lg">{t('recruitment.pipeline.title')}</h3>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('recruitment.filter.allDepts')}</SelectItem>
                <SelectItem value="تقنية المعلومات">{t('dept.it')}</SelectItem>
                <SelectItem value="الموارد البشرية">{t('dept.hr')}</SelectItem>
                <SelectItem value="المالية">{t('dept.finance')}</SelectItem>
                <SelectItem value="التسويق">{t('dept.marketing')}</SelectItem>
                <SelectItem value="العمليات">{t('dept.operations')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Board */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map(stage => {
          const stageCandidates = filtered.filter(c => c.stage === stage);
          return (
            <div key={stage} className="space-y-3">
              <Card className={cn("border-t-4", stageColors[stage])}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{stageLabels[stage]}</h4>
                    <Badge variant="secondary" className="text-xs">{stageCandidates.length}</Badge>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2 min-h-[200px]">
                {stageCandidates.map(candidate => (
                  <Card key={candidate.id} className={cn("hover:shadow-md transition-shadow", stageBgColors[stage])}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <p className="font-medium text-sm truncate">{candidate.name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{candidate.position}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{candidate.daysInStage} {t('recruitment.pipeline.days')}</p>
                        <div className={cn("flex gap-1 justify-end", isRTL && "flex-row-reverse")}>
                          {stage !== 'applied' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCandidate(candidate.id, 'backward')}>
                              {isRTL ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                            </Button>
                          )}
                          {stage !== 'hired' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCandidate(candidate.id, 'forward')}>
                              {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle>{t('recruitment.pipeline.summary')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {stages.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={cn("px-4 py-2 rounded-lg text-center", stageBgColors[stage])}>
                  <p className="text-xl font-bold">{filtered.filter(c => c.stage === stage).length}</p>
                  <p className="text-xs text-muted-foreground">{stageLabels[stage]}</p>
                </div>
                {i < stages.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
