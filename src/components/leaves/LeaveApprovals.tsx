import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, XCircle, User, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaveRequest } from '@/pages/Leaves';
import { toast } from '@/hooks/use-toast';

interface LeaveApprovalsProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export const LeaveApprovals = ({ requests, onApprove, onReject }: LeaveApprovalsProps) => {
  const { t, isRTL, language } = useLanguage();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = (request: LeaveRequest) => {
    onApprove(request.id);
    toast({
      title: t('leaves.approvals.approved'),
      description: t('leaves.approvals.approvedMessage'),
    });
  };

  const handleRejectClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedRequest && rejectionReason) {
      onReject(selectedRequest.id, rejectionReason);
      toast({
        title: t('leaves.approvals.rejected'),
        description: t('leaves.approvals.rejectedMessage'),
        variant: 'destructive',
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
    }
  };

  const getLeaveTypeColor = (type: LeaveRequest['leaveType']) => {
    const colors: Record<string, string> = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      casual: 'bg-green-500',
      unpaid: 'bg-gray-500',
      maternity: 'bg-pink-500',
      paternity: 'bg-purple-500',
    };
    return colors[type] || 'bg-primary';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t('leaves.approvals.title')}
            {requests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {requests.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('leaves.approvals.noPending')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border-l-4" style={{ borderLeftColor: `var(--${request.leaveType === 'annual' ? 'primary' : request.leaveType === 'sick' ? 'destructive' : 'success'})` }}>
                  <CardContent className="p-4">
                    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                      <div className="flex-1 space-y-2">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {language === 'ar' ? request.employeeNameAr : request.employeeName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {t(`dept.${request.department.toLowerCase()}`)}
                          </Badge>
                        </div>
                        
                        <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                          <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                            <Calendar className="w-3 h-3" />
                            {request.startDate} - {request.endDate}
                          </span>
                          <Badge className={cn("text-white", getLeaveTypeColor(request.leaveType))}>
                            {t(`leaves.types.${request.leaveType}`)} ({request.days} {t('leaves.days')})
                          </Badge>
                        </div>

                        <div className={cn("flex items-start gap-2 text-sm", isRTL && "flex-row-reverse")}>
                          <FileText className="w-3 h-3 mt-1 text-muted-foreground" />
                          <span>{request.reason}</span>
                        </div>
                      </div>

                      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleApprove(request)}
                        >
                          <CheckCircle className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                          {t('leaves.approvals.approve')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectClick(request)}
                        >
                          <XCircle className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                          {t('leaves.approvals.reject')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('leaves.approvals.rejectTitle')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('leaves.approvals.rejectReasonPlaceholder')}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t('employees.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!rejectionReason}>
              {t('leaves.approvals.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
