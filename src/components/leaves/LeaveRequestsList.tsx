import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveRequest } from '@/pages/Leaves';

interface LeaveRequestsListProps {
  requests: LeaveRequest[];
}

export const LeaveRequestsList = ({ requests }: LeaveRequestsListProps) => {
  const { t, isRTL, language } = useLanguage();

  const getStatusBadge = (status: LeaveRequest['status']) => {
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

  const getLeaveTypeBadge = (type: LeaveRequest['leaveType']) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-100 text-blue-700 border-blue-300',
      sick: 'bg-red-100 text-red-700 border-red-300',
      casual: 'bg-green-100 text-green-700 border-green-300',
      unpaid: 'bg-gray-100 text-gray-700 border-gray-300',
      maternity: 'bg-pink-100 text-pink-700 border-pink-300',
      paternity: 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {t(`leaves.types.${type}`)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t('leaves.list.title')}
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
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.startDate')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.endDate')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.days')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {t('leaves.list.noRequests')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? request.employeeNameAr : request.employeeName}
                    </TableCell>
                    <TableCell>{t(`dept.${request.department.toLowerCase()}`)}</TableCell>
                    <TableCell>{getLeaveTypeBadge(request.leaveType)}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell>{request.days}</TableCell>
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
