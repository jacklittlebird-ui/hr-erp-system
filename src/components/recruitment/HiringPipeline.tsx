import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecruitmentData, StageEvaluation } from '@/contexts/RecruitmentDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, User, Briefcase, ChevronRight, Star, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const stages = ['new', 'screening', 'interview', 'offer', 'hired'] as const;

export const HiringPipeline = () => {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { candidates, setCandidates } = useRecruitmentData();

  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState<number>(0);
  const [evalSalary, setEvalSalary] = useState('');
  const [evalStage, setEvalStage] = useState('');

  const stageLabels: Record<string, string> = {
    new: t('recruitment.candidateStatus.new'),
    screening: t('recruitment.candidateStatus.screening'),
    interview: t('recruitment.candidateStatus.interview'),
    offer: t('recruitment.candidateStatus.offer'),
    hired: t('recruitment.candidateStatus.hired'),
  };

  const stageColors: Record<string, string> = {
    new: 'border-t-blue-500',
    screening: 'border-t-purple-500',
    interview: 'border-t-amber-500',
    offer: 'border-t-orange-500',
    hired: 'border-t-green-500',
  };

  const stageBgColors: Record<string, string> = {
    new: 'bg-blue-50 dark:bg-blue-950/30',
    screening: 'bg-purple-50 dark:bg-purple-950/30',
    interview: 'bg-amber-50 dark:bg-amber-950/30',
    offer: 'bg-orange-50 dark:bg-orange-950/30',
    hired: 'bg-green-50 dark:bg-green-950/30',
  };

  const pipelineCandidates = candidates.filter(c => c.status !== 'rejected');

  const moveCandidate = (candidateId: string, direction: 'forward' | 'backward') => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const currentIndex = stages.indexOf(c.status as any);
      if (currentIndex === -1) return c;
      const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
      if (newIndex < 0 || newIndex >= stages.length) return c;
      return { ...c, status: stages[newIndex] };
    }));
    toast({ title: t('recruitment.success'), description: t('recruitment.candidateMoved') });
  };

  const openEvalDialog = (candidateId: string, stage: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    const existing = candidate?.stageEvaluations?.[stage];
    setSelectedCandidate(candidateId);
    setEvalStage(stage);
    setEvalNotes(existing?.notes || '');
    setEvalRating(existing?.rating || 0);
    setEvalSalary(existing?.proposedSalary?.toString() || '');
  };

  const saveEvaluation = () => {
    if (!selectedCandidate) return;
    const evaluation: StageEvaluation = {
      notes: evalNotes,
      rating: evalRating,
      proposedSalary: evalSalary ? parseFloat(evalSalary) : undefined,
      evaluatedAt: new Date().toISOString(),
    };
    setCandidates(prev => prev.map(c => {
      if (c.id !== selectedCandidate) return c;
      return {
        ...c,
        stageEvaluations: { ...c.stageEvaluations, [evalStage]: evaluation },
      };
    }));
    setSelectedCandidate(null);
    toast({
      title: isRTL ? 'تم الحفظ' : 'Saved',
      description: isRTL ? 'تم حفظ التقييم بنجاح' : 'Evaluation saved successfully',
    });
  };

  const candidate = candidates.find(c => c.id === selectedCandidate);

  const hasEvaluation = (candidateId: string, stage: string) => {
    const c = candidates.find(x => x.id === candidateId);
    return c?.stageEvaluations?.[stage]?.notes ? true : false;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">{t('recruitment.pipeline.title')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isRTL ? `إجمالي المرشحين: ${pipelineCandidates.length}` : `Total candidates: ${pipelineCandidates.length}`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map(stage => {
          const stageCandidates = pipelineCandidates.filter(c => c.status === stage);
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
                {stageCandidates.map(cand => (
                  <Card
                    key={cand.id}
                    className={cn("hover:shadow-md transition-shadow cursor-pointer", stageBgColors[stage])}
                    onClick={() => openEvalDialog(cand.id, stage)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <p className="font-medium text-sm truncate">{isRTL ? cand.nameAr : cand.nameEn || cand.nameAr}</p>
                          {hasEvaluation(cand.id, stage) && (
                            <MessageSquare className="w-3 h-3 text-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{cand.appliedPosition}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cand.department}</p>
                        {cand.stageEvaluations?.[stage]?.rating ? (
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={cn("w-3 h-3", s <= (cand.stageEvaluations?.[stage]?.rating || 0) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30")} />
                            ))}
                          </div>
                        ) : null}
                        <div className={cn("flex gap-1 justify-end", isRTL && "flex-row-reverse")} onClick={e => e.stopPropagation()}>
                          {stage !== 'new' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCandidate(cand.id, 'backward')}>
                              {isRTL ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                            </Button>
                          )}
                          {stage !== 'hired' && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveCandidate(cand.id, 'forward')}>
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

      {/* Evaluation Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? `تقييم المرشح - ${stageLabels[evalStage]}` : `Candidate Evaluation - ${stageLabels[evalStage]}`}
            </DialogTitle>
          </DialogHeader>
          {candidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{isRTL ? candidate.nameAr : candidate.nameEn || candidate.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{candidate.appliedPosition}</p>
                </div>
              </div>

              {/* Previous stage evaluations */}
              {(() => {
                const currentIdx = stages.indexOf(evalStage as any);
                const prevEvals = stages.slice(0, currentIdx).filter(s => candidate.stageEvaluations?.[s]?.notes);
                if (prevEvals.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">{isRTL ? 'تقييمات سابقة' : 'Previous Evaluations'}</Label>
                    {prevEvals.map(s => {
                      const ev = candidate.stageEvaluations![s];
                      return (
                        <div key={s} className="p-2 rounded border text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{stageLabels[s]}</span>
                            {ev.rating ? (
                              <div className="flex gap-0.5">{[1,2,3,4,5].map(x => <Star key={x} className={cn("w-3 h-3", x <= ev.rating! ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30")} />)}</div>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground">{ev.notes}</p>
                          {ev.proposedSalary ? <p className="text-primary font-medium">{isRTL ? `الراتب المقترح: ${ev.proposedSalary}` : `Proposed Salary: ${ev.proposedSalary}`}</p> : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="space-y-2">
                <Label>{isRTL ? 'التقييم (من 5)' : 'Rating (out of 5)'}</Label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setEvalRating(s)} className="p-1 hover:scale-110 transition-transform">
                      <Star className={cn("w-6 h-6", s <= evalRating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30")} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'الراتب المقترح' : 'Proposed Salary'}</Label>
                <Input type="number" value={evalSalary} onChange={e => setEvalSalary(e.target.value)} placeholder={isRTL ? 'أدخل الراتب المقترح' : 'Enter proposed salary'} />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'ملاحظات التقييم' : 'Evaluation Notes'}</Label>
                <Textarea value={evalNotes} onChange={e => setEvalNotes(e.target.value)} placeholder={isRTL ? 'اكتب ملاحظات التقييم لهذه المرحلة...' : 'Write evaluation notes for this stage...'} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCandidate(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={saveEvaluation}>{isRTL ? 'حفظ التقييم' : 'Save Evaluation'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>{t('recruitment.pipeline.summary')}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {stages.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div className={cn("px-4 py-2 rounded-lg text-center", stageBgColors[stage])}>
                  <p className="text-xl font-bold">{pipelineCandidates.filter(c => c.status === stage).length}</p>
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
