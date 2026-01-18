import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Search, Filter, Eye, Edit, Star, FileText } from 'lucide-react';

interface PerformanceReview {
  id: string;
  employeeName: string;
  department: string;
  quarter: string;
  score: number;
  status: 'draft' | 'submitted' | 'approved';
  reviewer: string;
  reviewDate: string;
}

const mockReviews: PerformanceReview[] = [
  { id: '1', employeeName: 'أحمد محمد علي', department: 'تقنية المعلومات', quarter: 'Q4 2024', score: 4.5, status: 'approved', reviewer: 'محمد السيد', reviewDate: '2024-12-15' },
  { id: '2', employeeName: 'فاطمة علي حسن', department: 'الموارد البشرية', quarter: 'Q4 2024', score: 4.2, status: 'approved', reviewer: 'أحمد حسن', reviewDate: '2024-12-14' },
  { id: '3', employeeName: 'محمد حسن أحمد', department: 'المبيعات', quarter: 'Q4 2024', score: 3.8, status: 'submitted', reviewer: 'علي محمود', reviewDate: '2024-12-13' },
  { id: '4', employeeName: 'سارة أحمد محمد', department: 'المالية', quarter: 'Q4 2024', score: 4.0, status: 'submitted', reviewer: 'هدى علي', reviewDate: '2024-12-12' },
  { id: '5', employeeName: 'عمر خالد إبراهيم', department: 'العمليات', quarter: 'Q4 2024', score: 3.5, status: 'draft', reviewer: 'محمد عبدالله', reviewDate: '2024-12-11' },
  { id: '6', employeeName: 'نورا حسين', department: 'التسويق', quarter: 'Q3 2024', score: 4.3, status: 'approved', reviewer: 'سمير أحمد', reviewDate: '2024-09-20' },
  { id: '7', employeeName: 'خالد محمود', department: 'تقنية المعلومات', quarter: 'Q3 2024', score: 4.1, status: 'approved', reviewer: 'محمد السيد', reviewDate: '2024-09-18' },
];

export const PerformanceList = () => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = review.employeeName.includes(searchQuery) || 
                         review.department.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesQuarter = quarterFilter === 'all' || review.quarter === quarterFilter;
    return matchesSearch && matchesStatus && matchesQuarter;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <FileText className="w-5 h-5 text-primary" />
          {t('performance.list.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4",
          isRTL && "sm:flex-row-reverse"
        )}>
          <div className="relative flex-1">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={t('performance.list.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('performance.list.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('performance.list.allStatuses')}</SelectItem>
              <SelectItem value="approved">{t('performance.status.approved')}</SelectItem>
              <SelectItem value="submitted">{t('performance.status.submitted')}</SelectItem>
              <SelectItem value="draft">{t('performance.status.draft')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={quarterFilter} onValueChange={setQuarterFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('performance.list.quarter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('performance.list.allQuarters')}</SelectItem>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.employee')}</TableHead>
                <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.department')}</TableHead>
                <TableHead className={isRTL ? "text-right" : ""}>{t('performance.list.quarter')}</TableHead>
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
                  <TableCell>{review.quarter}</TableCell>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </CardContent>
    </Card>
  );
};
