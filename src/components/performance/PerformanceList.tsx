import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Search, Eye, Edit, Star, FileText, Plus, Printer, Download, FileSpreadsheet } from 'lucide-react';
import { useReportExport } from '@/hooks/useReportExport';
import { mockEmployees } from '@/data/mockEmployees';

const stationLocations = [
  { value: 'aswan', labelAr: 'أسوان', labelEn: 'Aswan' },
  { value: 'asyut', labelAr: 'أسيوط', labelEn: 'Asyut' },
  { value: 'alex', labelAr: 'الإسكندرية', labelEn: 'Alexandria' },
  { value: 'luxor', labelAr: 'الأقصر', labelEn: 'Luxor' },
  { value: 'cairo', labelAr: 'القاهرة', labelEn: 'Cairo' },
  { value: 'hurghada', labelAr: 'الغردقة', labelEn: 'Hurghada' },
  { value: 'hq1', labelAr: 'المركز الرئيسي 1', labelEn: 'HQ 1' },
  { value: 'hq2', labelAr: 'المركز الرئيسي 2', labelEn: 'HQ 2' },
  { value: 'sharm', labelAr: 'شرم الشيخ', labelEn: 'Sharm El Sheikh' },
  { value: 'sohag', labelAr: 'سوهاج', labelEn: 'Sohag' },
  { value: 'marsa', labelAr: 'مرسى علم', labelEn: 'Marsa Alam' },
];

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  station: string;
  quarter: string;
  year: string;
  score: number;
  status: 'draft' | 'submitted' | 'approved';
  reviewer: string;
  reviewDate: string;
  strengths?: string;
  improvements?: string;
  goals?: string;
  managerComments?: string;
  criteria?: { name: string; score: number; weight: number }[];
}

const mockReviews: PerformanceReview[] = [
  { id: '1', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', department: 'الإدارة', station: 'cairo', quarter: 'Q4', year: '2025', score: 4.5, status: 'approved', reviewer: 'محمد السيد', reviewDate: '2025-12-15', strengths: 'أداء ممتاز في إدارة الفريق', improvements: 'تحسين مهارات العرض', goals: 'قيادة مشروع جديد', managerComments: 'موظف متميز', criteria: [{ name: 'جودة العمل', score: 5, weight: 25 }, { name: 'الإنتاجية', score: 4, weight: 20 }, { name: 'العمل الجماعي', score: 5, weight: 20 }, { name: 'التواصل', score: 4, weight: 15 }, { name: 'المبادرة', score: 4, weight: 10 }, { name: 'الحضور والالتزام', score: 5, weight: 10 }] },
  { id: '2', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', department: 'تقنية المعلومات', station: 'hq1', quarter: 'Q4', year: '2025', score: 4.2, status: 'approved', reviewer: 'أحمد حسن', reviewDate: '2025-12-14', strengths: 'إتقان البرمجة', improvements: 'التوثيق', goals: 'تعلم تقنيات جديدة', criteria: [{ name: 'جودة العمل', score: 4, weight: 25 }, { name: 'الإنتاجية', score: 4, weight: 20 }, { name: 'العمل الجماعي', score: 5, weight: 20 }, { name: 'التواصل', score: 4, weight: 15 }, { name: 'المبادرة', score: 4, weight: 10 }, { name: 'الحضور والالتزام', score: 4, weight: 10 }] },
  { id: '3', employeeId: 'Emp003', employeeName: 'سارة أحمد حسن', department: 'الإدارة', station: 'alex', quarter: 'Q4', year: '2025', score: 3.8, status: 'submitted', reviewer: 'علي محمود', reviewDate: '2025-12-13' },
  { id: '4', employeeId: 'Emp004', employeeName: 'شريف منير', department: 'المبيعات', station: 'hurghada', quarter: 'Q4', year: '2025', score: 4.0, status: 'submitted', reviewer: 'هدى علي', reviewDate: '2025-12-12' },
  { id: '5', employeeId: 'Emp001', employeeName: 'جلال عبد الرازق عبد العليم', department: 'الإدارة', station: 'cairo', quarter: 'Q3', year: '2025', score: 3.5, status: 'draft', reviewer: 'محمد عبدالله', reviewDate: '2025-09-11' },
  { id: '6', employeeId: 'Emp002', employeeName: 'أحمد محمد علي', department: 'تقنية المعلومات', station: 'hq1', quarter: 'Q3', year: '2025', score: 4.3, status: 'approved', reviewer: 'سمير أحمد', reviewDate: '2025-09-20' },
  { id: '7', employeeId: 'Emp003', employeeName: 'سارة أحمد حسن', department: 'الإدارة', station: 'alex', quarter: 'Q3', year: '2025', score: 4.1, status: 'approved', reviewer: 'محمد السيد', reviewDate: '2025-09-18' },
];

const years = Array.from({ length: 11 }, (_, i) => String(2025 + i));

export const PerformanceList = () => {
  const { t, isRTL, language } = useLanguage();
  const { exportToCSV, exportToPDF, handlePrint, reportRef } = useReportExport();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [viewReview, setViewReview] = useState<PerformanceReview | null>(null);

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.employeeName.includes(searchQuery) || 
                         review.department.includes(searchQuery) ||
                         review.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesQuarter = quarterFilter === 'all' || review.quarter === quarterFilter;
    const matchesYear = yearFilter === 'all' || review.year === yearFilter;
    const matchesStation = stationFilter === 'all' || review.station === stationFilter;
    return matchesSearch && matchesStatus && matchesQuarter && matchesYear && matchesStation;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-stat-green/10 text-stat-green hover:bg-stat-green/20">{t('performance.status.approved')}</Badge>;
      case 'submitted':
        return <Badge className="bg-stat-blue/10 text-stat-blue hover:bg-stat-blue/20">{t('performance.status.submitted')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t('performance.status.draft')}</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-stat-green';
    if (score >= 3.5) return 'text-stat-blue';
    if (score >= 2.5) return 'text-stat-yellow';
    return 'text-stat-coral';
  };

  const getStationLabel = (stationValue: string) => {
    const station = stationLocations.find(s => s.value === stationValue);
    return station ? (language === 'ar' ? station.labelAr : station.labelEn) : stationValue;
  };

  const handleExportCSV = () => {
    exportToCSV({
      title: language === 'ar' ? 'تقييمات الأداء' : 'Performance Reviews',
      columns: [
        { header: t('performance.list.employee'), key: 'employeeName' },
        { header: t('performance.list.department'), key: 'department' },
        { header: language === 'ar' ? 'المحطة' : 'Station', key: 'station' },
        { header: t('performance.list.quarter'), key: 'quarter' },
        { header: language === 'ar' ? 'السنة' : 'Year', key: 'year' },
        { header: t('performance.list.score'), key: 'score' },
        { header: t('performance.list.status'), key: 'statusLabel' },
        { header: t('performance.list.reviewer'), key: 'reviewer' },
      ],
      data: filteredReviews.map(r => ({
        ...r,
        station: getStationLabel(r.station),
        statusLabel: t(`performance.status.${r.status}`),
      })),
      fileName: 'performance_reviews',
    });
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: language === 'ar' ? 'تقييمات الأداء' : 'Performance Reviews',
      columns: [
        { header: t('performance.list.employee'), key: 'employeeName' },
        { header: t('performance.list.department'), key: 'department' },
        { header: language === 'ar' ? 'المحطة' : 'Station', key: 'station' },
        { header: t('performance.list.score'), key: 'score' },
        { header: t('performance.list.status'), key: 'statusLabel' },
      ],
      data: filteredReviews.map(r => ({
        ...r,
        station: getStationLabel(r.station),
        statusLabel: t(`performance.status.${r.status}`),
      })),
      fileName: 'performance_reviews',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row justify-between gap-3", isRTL && "sm:flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <FileText className="w-5 h-5 text-primary" />
              {t('performance.list.title')}
            </CardTitle>
            <div className={cn("flex gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <Button variant="outline" size="sm" onClick={() => handlePrint(language === 'ar' ? 'تقييمات الأداء' : 'Performance Reviews')} className="gap-1.5">
                <Printer className="w-4 h-4" />
                {language === 'ar' ? 'طباعة' : 'Print'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className={cn("flex flex-col sm:flex-row gap-3 flex-wrap", isRTL && "sm:flex-row-reverse")}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('performance.list.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder={language === 'ar' ? 'السنة' : 'Year'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع السنوات' : 'All Years'}</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={quarterFilter} onValueChange={setQuarterFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder={t('performance.list.quarter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('performance.list.allQuarters')}</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q1">Q1</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder={t('performance.list.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('performance.list.allStatuses')}</SelectItem>
                <SelectItem value="approved">{t('performance.status.approved')}</SelectItem>
                <SelectItem value="submitted">{t('performance.status.submitted')}</SelectItem>
                <SelectItem value="draft">{t('performance.status.draft')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={language === 'ar' ? 'المحطة/الموقع' : 'Station/Location'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                {stationLocations.map(s => (
                  <SelectItem key={s.value} value={s.value}>{language === 'ar' ? s.labelAr : s.labelEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden" ref={reportRef}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.employee')}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.department')}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{language === 'ar' ? 'المحطة' : 'Station'}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{language === 'ar' ? 'الفترة' : 'Period'}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.score')}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.status')}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.reviewer')}</TableHead>
                  <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{review.employeeName}</TableCell>
                    <TableCell>{review.department}</TableCell>
                    <TableCell>{getStationLabel(review.station)}</TableCell>
                    <TableCell>{review.quarter} {review.year}</TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Star className={cn("w-4 h-4 fill-current", getScoreColor(review.score))} />
                        <span className={cn("font-bold", getScoreColor(review.score))}>{review.score}</span>
                        <Progress value={review.score * 20} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>{review.reviewer}</TableCell>
                    <TableCell>
                      <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewReview(review)} title={language === 'ar' ? 'عرض' : 'View'}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={language === 'ar' ? 'تعديل' : 'Edit'}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('performance.list.noResults')}
            </div>
          )}

          {/* Summary */}
          <div className={cn("flex gap-4 text-sm text-muted-foreground pt-2 border-t", isRTL && "flex-row-reverse")}>
            <span>{language === 'ar' ? 'إجمالي النتائج:' : 'Total Results:'} <strong className="text-foreground">{filteredReviews.length}</strong></span>
            <span>{language === 'ar' ? 'متوسط التقييم:' : 'Average Score:'} <strong className="text-foreground">{filteredReviews.length > 0 ? (filteredReviews.reduce((s, r) => s + r.score, 0) / filteredReviews.length).toFixed(1) : '0'}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={!!viewReview} onOpenChange={() => setViewReview(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Star className="w-5 h-5 text-stat-yellow fill-stat-yellow" />
              {language === 'ar' ? 'تفاصيل التقييم' : 'Review Details'}
            </DialogTitle>
          </DialogHeader>
          {viewReview && (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{t('performance.list.employee')}</p>
                  <p className="font-semibold">{viewReview.employeeName}</p>
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{t('performance.list.department')}</p>
                  <p className="font-semibold">{viewReview.department}</p>
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المحطة' : 'Station'}</p>
                  <p className="font-semibold">{getStationLabel(viewReview.station)}</p>
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الفترة' : 'Period'}</p>
                  <p className="font-semibold">{viewReview.quarter} {viewReview.year}</p>
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{t('performance.list.reviewer')}</p>
                  <p className="font-semibold">{viewReview.reviewer}</p>
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <p className="text-sm text-muted-foreground">{t('performance.list.status')}</p>
                  {getStatusBadge(viewReview.status)}
                </div>
              </div>

              {/* Overall Score */}
              <div className={cn("flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20", isRTL && "flex-row-reverse")}>
                <span className="font-semibold text-lg">{language === 'ar' ? 'التقييم الإجمالي' : 'Overall Score'}</span>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn("w-5 h-5", s <= Math.floor(viewReview.score) ? "text-stat-yellow fill-stat-yellow" : "text-muted")} />
                  ))}
                  <span className={cn("font-bold text-2xl ms-2", getScoreColor(viewReview.score))}>{viewReview.score}/5</span>
                </div>
              </div>

              {/* Criteria breakdown */}
              {viewReview.criteria && (
                <div className="space-y-3">
                  <h4 className={cn("font-semibold", isRTL && "text-right")}>{language === 'ar' ? 'تفصيل المعايير' : 'Criteria Breakdown'}</h4>
                  {viewReview.criteria.map((c, i) => (
                    <div key={i} className={cn("flex items-center justify-between gap-3", isRTL && "flex-row-reverse")}>
                      <span className="text-sm flex-1">{c.name} <span className="text-muted-foreground text-xs">({c.weight}%)</span></span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={cn("w-3.5 h-3.5", s <= c.score ? "text-stat-yellow fill-stat-yellow" : "text-muted")} />
                        ))}
                        <span className="font-bold text-sm w-6 text-center">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comments sections */}
              {viewReview.strengths && (
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <h4 className="font-semibold text-stat-green">{language === 'ar' ? 'نقاط القوة' : 'Strengths'}</h4>
                  <p className="text-sm bg-stat-green/5 p-3 rounded-lg border border-stat-green/20">{viewReview.strengths}</p>
                </div>
              )}
              {viewReview.improvements && (
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <h4 className="font-semibold text-stat-coral">{language === 'ar' ? 'مجالات التحسين' : 'Areas for Improvement'}</h4>
                  <p className="text-sm bg-stat-coral/5 p-3 rounded-lg border border-stat-coral/20">{viewReview.improvements}</p>
                </div>
              )}
              {viewReview.goals && (
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <h4 className="font-semibold text-primary">{language === 'ar' ? 'الأهداف القادمة' : 'Next Goals'}</h4>
                  <p className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/20">{viewReview.goals}</p>
                </div>
              )}
              {viewReview.managerComments && (
                <div className={cn("space-y-1", isRTL && "text-right")}>
                  <h4 className="font-semibold">{language === 'ar' ? 'ملاحظات المدير' : 'Manager Comments'}</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{viewReview.managerComments}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
