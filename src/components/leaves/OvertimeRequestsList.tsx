import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OvertimeRequest } from '@/types/leaves';

interface OvertimeRequestsListProps {
  requests: OvertimeRequest[];
}

export const OvertimeRequestsList = ({ requests }: OvertimeRequestsListProps) => {
  const { t, isRTL, language } = useLanguage();

  const getStatusBadge = (status: OvertimeRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
            <Clock className="w-3 h-3 mr-1" />
            {t('leaves.status.pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('leaves.status.approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('leaves.status.rejected')}
          </Badge>
        );
    }
  };

  const getOvertimeTypeBadge = (type: OvertimeRequest['overtimeType']) => {
    const colors: Record<string, string> = {
      regular: 'bg-blue-100 text-blue-700 border-blue-300',
      holiday: 'bg-red-100 text-red-700 border-red-300',
      weekend: 'bg-green-100 text-green-700 border-green-300',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {t(`leaves.overtimeTypes.${type}`)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          {t('leaves.overtime.listTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.employee')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.department')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.type')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.overtime.date')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.overtime.hours')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.overtime.reason')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {t('leaves.overtime.noRequests')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? request.employeeNameAr : request.employeeName}
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>{getOvertimeTypeBadge(request.overtimeType)}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.hours} {t('leaveBalance.hours')}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
