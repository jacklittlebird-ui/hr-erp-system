import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { List, Search, CalendarIcon, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceRecord } from '@/pages/Attendance';
import { format } from 'date-fns';

interface AttendanceListProps {
  records: AttendanceRecord[];
}

export const AttendanceList = ({ records }: AttendanceListProps) => {
  const { t, isRTL, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date>();

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles: Record<string, string> = {
      present: 'bg-success/10 text-success border-success',
      absent: 'bg-destructive/10 text-destructive border-destructive',
      late: 'bg-warning/10 text-warning border-warning',
      'early-leave': 'bg-orange-100 text-orange-700 border-orange-300',
      'on-leave': 'bg-blue-100 text-blue-700 border-blue-300',
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {t(`attendance.status.${status}`)}
      </Badge>
    );
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeNameAr.includes(searchTerm) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    const matchesDate = !dateFilter || record.date === format(dateFilter, 'yyyy-MM-dd');

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort by date descending
  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          {t('attendance.list.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className={cn("flex flex-wrap gap-4 mb-6", isRTL && "flex-row-reverse")}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input
              placeholder={t('attendance.list.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(isRTL ? "pr-10" : "pl-10")}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('attendance.list.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('attendance.list.allStatuses')}</SelectItem>
              <SelectItem value="present">{t('attendance.status.present')}</SelectItem>
              <SelectItem value="absent">{t('attendance.status.absent')}</SelectItem>
              <SelectItem value="late">{t('attendance.status.late')}</SelectItem>
              <SelectItem value="early-leave">{t('attendance.status.early-leave')}</SelectItem>
              <SelectItem value="on-leave">{t('attendance.status.on-leave')}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left", !dateFilter && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter ? format(dateFilter, 'PPP') : t('attendance.list.pickDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)}>
              {t('attendance.list.clearDate')}
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.date')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.employee')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.department')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.checkIn')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.checkOut')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.workHours')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.overtime')}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{t('attendance.list.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {t('attendance.list.noRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                sortedRecords.slice(0, 20).map((record, index) => (
                  <TableRow key={`${record.id}-${record.date}-${index}`}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell className="font-medium">
                      {language === 'ar' ? record.employeeNameAr : record.employeeName}
                    </TableCell>
                    <TableCell>{t(`dept.${record.department.toLowerCase()}`)}</TableCell>
                    <TableCell>{record.checkIn || '-'}</TableCell>
                    <TableCell>{record.checkOut || '-'}</TableCell>
                    <TableCell>{record.workHours}h</TableCell>
                    <TableCell>
                      {record.overtime > 0 ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          +{record.overtime}h
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
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
