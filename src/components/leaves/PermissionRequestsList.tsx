import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionRequest } from '@/types/leaves';

interface PermissionRequestsListProps {
  requests: PermissionRequest[];
}

export const PermissionRequestsList = ({ requests }: PermissionRequestsListProps) => {
  const { t, isRTL, language } = useLanguage();

  const getStatusBadge = (status: PermissionRequest['status']) => {
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

  const getPermTypeBadge = (type: PermissionRequest['permissionType']) => {
    const colors: Record<string, string> = {
      early_leave: 'bg-orange-100 text-orange-700 border-orange-300',
      late_arrival: 'bg-blue-100 text-blue-700 border-blue-300',
      personal: 'bg-green-100 text-green-700 border-green-300',
      medical: 'bg-red-100 text-red-700 border-red-300',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {t(`leaves.permTypes.${type}`)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          {t('leaves.permissions.listTitle')}
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
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.permissions.date')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.permissions.fromTime')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.permissions.toTime')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.permissions.duration')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {t('leaves.permissions.noRequests')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? request.employeeNameAr : request.employeeName}
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>{getPermTypeBadge(request.permissionType)}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.fromTime}</TableCell>
                    <TableCell>{request.toTime}</TableCell>
                    <TableCell>{request.durationHours} {t('leaveBalance.hours')}</TableCell>
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
