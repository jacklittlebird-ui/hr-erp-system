import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, CheckCircle, XCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionRequest } from '@/types/leaves';

interface PermissionRequestsListProps {
  requests: PermissionRequest[];
  onDelete?: (id: string) => void;
}

export const PermissionRequestsList = ({ requests, onDelete }: PermissionRequestsListProps) => {
  const { t, isRTL, language } = useLanguage();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: PermissionRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning"><Clock className="w-3 h-3 mr-1" />{t('leaves.status.pending')}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success"><CheckCircle className="w-3 h-3 mr-1" />{t('leaves.status.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive"><XCircle className="w-3 h-3 mr-1" />{t('leaves.status.rejected')}</Badge>;
    }
  };

  const getPermTypeBadge = (type: PermissionRequest['permissionType']) => {
    const colors: Record<string, string> = {
      early_leave: 'bg-orange-100 text-orange-700 border-orange-300',
      late_arrival: 'bg-blue-100 text-blue-700 border-blue-300',
      personal: 'bg-green-100 text-green-700 border-green-300',
      medical: 'bg-red-100 text-red-700 border-red-300',
    };
    return <Badge variant="outline" className={colors[type]}>{t(`leaves.permTypes.${type}`)}</Badge>;
  };

  return (
    <>
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
                  {onDelete && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={onDelete ? 9 : 8} className="text-center text-muted-foreground py-8">
                      {t('leaves.permissions.noRequests')}
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{language === 'ar' ? request.employeeNameAr : request.employeeName}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{getPermTypeBadge(request.permissionType)}</TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>{request.fromTime}</TableCell>
                      <TableCell>{request.toTime}</TableCell>
                      <TableCell>{request.durationHours} {t('leaveBalance.hours')}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      {onDelete && (
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(request.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</AlertDialogTitle>
            <AlertDialogDescription>{language === 'ar' ? 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this request? This action cannot be undone.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteId && onDelete) { onDelete(deleteId); setDeleteId(null); } }}>
              {language === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
