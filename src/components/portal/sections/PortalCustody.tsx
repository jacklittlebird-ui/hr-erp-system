import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Package, CheckCircle, Laptop } from 'lucide-react';
import { usePortalEmployee } from '@/hooks/usePortalEmployee';
import { supabase } from '@/integrations/supabase/client';

interface AssignedAsset {
  id: string;
  assetCode: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  model: string;
  condition: string;
  status: string;
}

export const PortalCustody = () => {
  const PORTAL_EMPLOYEE_ID = usePortalEmployee();
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const [assets, setAssets] = useState<AssignedAsset[]>([]);

  useEffect(() => {
    if (!PORTAL_EMPLOYEE_ID) return;
    const fetchAssets = async () => {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('assigned_to', PORTAL_EMPLOYEE_ID);
      if (data) {
        setAssets(data.map(a => ({
          id: a.id,
          assetCode: a.asset_code,
          nameEn: a.name_en,
          nameAr: a.name_ar,
          brand: a.brand || '',
          model: a.model || '',
          condition: a.condition || 'good',
          status: a.status,
        })));
      }
    };
    fetchAssets();
  }, [PORTAL_EMPLOYEE_ID]);

  const assigned = assets.filter(a => a.status === 'assigned').length;
  const available = assets.filter(a => a.status !== 'assigned').length;

  return (
    <div className="space-y-6">
      <h1 className={cn("text-2xl font-bold", isRTL && "text-right")}>{ar ? 'العهد والأصول' : 'Custody & Assets'}</h1>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{assigned}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'بحوزتي' : 'Assigned'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Package className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
          <p className="text-2xl font-bold">{assets.length}</p>
          <p className="text-xs text-muted-foreground">{ar ? 'إجمالي' : 'Total'}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Laptop className="w-5 h-5 text-primary" />{ar ? 'الأصول المعيّنة لي' : 'Assets Assigned to Me'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{ar ? 'لا توجد أصول معيّنة' : 'No assets assigned'}</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الكود' : 'Code'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الاسم' : 'Name'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الماركة' : 'Brand'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الموديل' : 'Model'}</TableHead>
                <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الحالة' : 'Condition'}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {assets.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono">{a.assetCode}</TableCell>
                    <TableCell className="font-medium">{ar ? a.nameAr : a.nameEn}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>{a.model}</TableCell>
                    <TableCell><Badge variant="outline">{a.condition}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
