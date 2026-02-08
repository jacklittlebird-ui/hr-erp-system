import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MissionRequest } from '@/types/leaves';

interface MissionRequestsListProps {
  requests: MissionRequest[];
}

export const MissionRequestsList = ({ requests }: MissionRequestsListProps) => {
  const { t, isRTL, language } = useLanguage();

  const getStatusBadge = (status: MissionRequest['status']) => {
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

  const getMissionTypeBadge = (type: MissionRequest['missionType']) => {
    const colors: Record<string, string> = {
      internal: 'bg-blue-100 text-blue-700 border-blue-300',
      external: 'bg-purple-100 text-purple-700 border-purple-300',
      training: 'bg-green-100 text-green-700 border-green-300',
      meeting: 'bg-orange-100 text-orange-700 border-orange-300',
      client_visit: 'bg-pink-100 text-pink-700 border-pink-300',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {t(`leaves.missionTypes.${type}`)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          {t('leaves.missions.listTitle')}
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
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.missions.date')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.missions.destination')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.missions.reason')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('leaves.list.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {t('leaves.missions.noRequests')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {language === 'ar' ? request.employeeNameAr : request.employeeName}
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>{getMissionTypeBadge(request.missionType)}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.destination || '-'}</TableCell>
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
