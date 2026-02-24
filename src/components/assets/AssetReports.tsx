import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Printer, FileSpreadsheet, Download, Package, DollarSign, Wrench, TrendingUp, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePersistedState } from '@/hooks/usePersistedState';
import { useReportExport } from '@/hooks/useReportExport';
import { mockEmployees } from '@/data/mockEmployees';
import { stationLocations } from '@/data/stationLocations';
import type { Asset } from './AssetRegistry';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const initialAssets: Asset[] = [
  { id: '1', assetCode: 'AST-001', nameAr: 'لابتوب Dell Latitude', nameEn: 'Dell Latitude Laptop', category: 'laptop', brand: 'Dell', model: 'Latitude 5540', serialNumber: 'DL-2026-001', purchaseDate: '2025-06-15', purchasePrice: 25000, status: 'assigned', condition: 'good', location: 'القاهرة', notes: '', assignedTo: 'Emp001' },
  { id: '2', assetCode: 'AST-002', nameAr: 'شاشة Samsung', nameEn: 'Samsung Monitor', category: 'desktop', brand: 'Samsung', model: '27" 4K', serialNumber: 'SM-2025-045', purchaseDate: '2025-03-20', purchasePrice: 8000, status: 'available', condition: 'new', location: 'القاهرة', notes: '' },
  { id: '3', assetCode: 'AST-003', nameAr: 'طابعة HP LaserJet', nameEn: 'HP LaserJet Printer', category: 'printer', brand: 'HP', model: 'LaserJet Pro M404', serialNumber: 'HP-2024-112', purchaseDate: '2024-11-10', purchasePrice: 12000, status: 'maintenance', condition: 'fair', location: 'الإسكندرية', notes: '' },
  { id: '4', assetCode: 'AST-004', nameAr: 'هاتف iPhone 15', nameEn: 'iPhone 15 Pro', category: 'phone', brand: 'Apple', model: 'iPhone 15 Pro', serialNumber: 'AP-2025-078', purchaseDate: '2025-09-01', purchasePrice: 45000, status: 'assigned', condition: 'new', location: 'القاهرة', notes: '', assignedTo: 'Emp001' },
  { id: '5', assetCode: 'AST-005', nameAr: 'مكتب خشبي', nameEn: 'Wooden Desk', category: 'furniture', brand: 'IKEA', model: 'MALM', serialNumber: 'IK-2024-033', purchaseDate: '2024-06-01', purchasePrice: 5000, status: 'assigned', condition: 'good', location: 'القاهرة', notes: '', assignedTo: 'Emp002' },
  { id: '6', assetCode: 'AST-006', nameAr: 'لابتوب Lenovo ThinkPad', nameEn: 'Lenovo ThinkPad', category: 'laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon', serialNumber: 'LN-2025-022', purchaseDate: '2025-01-15', purchasePrice: 32000, status: 'available', condition: 'new', location: 'القاهرة', notes: '' },
  { id: '7', assetCode: 'AST-007', nameAr: 'سيارة تويوتا كورولا', nameEn: 'Toyota Corolla', category: 'vehicle', brand: 'Toyota', model: 'Corolla 2025', serialNumber: 'TY-2025-003', purchaseDate: '2025-04-01', purchasePrice: 450000, status: 'assigned', condition: 'new', location: 'القاهرة', notes: '', assignedTo: 'Emp004' },
  { id: '8', assetCode: 'AST-008', nameAr: 'جهاز كمبيوتر HP', nameEn: 'HP Desktop PC', category: 'desktop', brand: 'HP', model: 'ProDesk 400 G7', serialNumber: 'HP-2024-089', purchaseDate: '2024-08-20', purchasePrice: 15000, status: 'retired', condition: 'poor', location: 'القاهرة', notes: '' },
];

export const AssetReports = () => {
  const { t, isRTL, language } = useLanguage();
  const ar = language === 'ar';
  const [assets] = usePersistedState<Asset[]>('hr_asset_registry', initialAssets);
  const { reportRef, handlePrint, exportToCSV, exportToPDF } = useReportExport();

  const getEmpName = (empId?: string) => {
    if (!empId) return ar ? 'غير معيّن' : 'Unassigned';
    const emp = mockEmployees.find(e => e.employeeId === empId);
    return emp ? (ar ? emp.nameAr : emp.nameEn) : empId;
  };

  const totalValue = useMemo(() => assets.reduce((s, a) => s + a.purchasePrice, 0), [assets]);
  const assignedCount = useMemo(() => assets.filter(a => a.status === 'assigned').length, [assets]);
  const availableCount = useMemo(() => assets.filter(a => a.status === 'available').length, [assets]);
  const maintenanceCount = useMemo(() => assets.filter(a => a.status === 'maintenance').length, [assets]);
  const retiredCount = useMemo(() => assets.filter(a => a.status === 'retired').length, [assets]);
  const utilization = assets.length > 0 ? Math.round((assignedCount / assets.length) * 100) : 0;

  // By category
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    assets.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
    return Object.entries(cats).map(([key, value], i) => ({
      name: t(`assets.category.${key}`),
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [assets, t]);

  // By status
  const statusData = useMemo(() => [
    { status: t('assets.status.available'), count: availableCount },
    { status: t('assets.status.assigned'), count: assignedCount },
    { status: t('assets.status.maintenance'), count: maintenanceCount },
    { status: t('assets.status.retired'), count: retiredCount },
  ], [availableCount, assignedCount, maintenanceCount, retiredCount, t]);

  // By station/location
  const stationData = useMemo(() => {
    const locMap: Record<string, { count: number; value: number }> = {};
    assets.forEach(a => {
      const loc = a.location || (ar ? 'غير محدد' : 'Unknown');
      if (!locMap[loc]) locMap[loc] = { count: 0, value: 0 };
      locMap[loc].count += 1;
      locMap[loc].value += a.purchasePrice;
    });
    return Object.entries(locMap).map(([location, data]) => ({
      location,
      count: data.count,
      value: data.value,
    })).sort((a, b) => b.count - a.count);
  }, [assets, ar]);

  // By condition
  const conditionData = useMemo(() => {
    const conds: Record<string, number> = {};
    assets.forEach(a => { conds[a.condition] = (conds[a.condition] || 0) + 1; });
    return Object.entries(conds).map(([key, value], i) => ({
      name: t(`assets.condition.${key}`),
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [assets, t]);

  const stats = [
    { label: ar ? 'إجمالي الأصول' : 'Total Assets', value: String(assets.length), icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: ar ? 'إجمالي القيمة' : 'Total Value', value: `${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: ar ? 'قيد الصيانة' : 'In Maintenance', value: String(maintenanceCount), icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: ar ? 'نسبة الاستخدام' : 'Utilization', value: `${utilization}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const exportColumns = [
    { header: ar ? 'الكود' : 'Code', key: 'assetCode' },
    { header: ar ? 'الاسم' : 'Name', key: 'name' },
    { header: ar ? 'التصنيف' : 'Category', key: 'categoryLabel' },
    { header: ar ? 'الماركة' : 'Brand', key: 'brand' },
    { header: ar ? 'الموقع' : 'Location', key: 'location' },
    { header: ar ? 'الحالة' : 'Status', key: 'statusLabel' },
    { header: ar ? 'معيّن لـ' : 'Assigned To', key: 'assignedName' },
    { header: ar ? 'سعر الشراء' : 'Price', key: 'purchasePrice' },
  ];

  const exportData = assets.map(a => ({
    assetCode: a.assetCode,
    name: ar ? a.nameAr : a.nameEn,
    categoryLabel: t(`assets.category.${a.category}`),
    brand: a.brand,
    location: a.location,
    statusLabel: t(`assets.status.${a.status}`),
    assignedName: getEmpName(a.assignedTo),
    purchasePrice: a.purchasePrice.toLocaleString(),
  }));

  const handleExportCSV = () => exportToCSV({ title: ar ? 'تقرير الأصول' : 'Assets Report', data: exportData, columns: exportColumns, fileName: 'assets_report' });
  const handleExportPDF = () => exportToPDF({ title: ar ? 'تقرير الأصول' : 'Assets Report', data: exportData, columns: exportColumns, fileName: 'assets_report' });
  const handlePrintReport = () => handlePrint(ar ? 'تقرير الأصول' : 'Assets Report');

  return (
    <div className="space-y-6">
      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-wrap gap-3 items-center justify-end", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" onClick={handlePrintReport} className="gap-1.5">
              <Printer className="w-4 h-4" />{ar ? 'طباعة' : 'Print'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
              <Download className="w-4 h-4" />PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                <div className={cn("p-3 rounded-lg", stat.bg)}><stat.icon className={cn("w-6 h-6", stat.color)} /></div>
                <div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{ar ? 'الأصول حسب التصنيف' : 'Assets by Category'}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{ar ? 'الأصول حسب الحالة' : 'Assets by Status'}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" name={ar ? 'العدد' : 'Count'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{ar ? 'الأصول حسب الحالة الفنية' : 'Assets by Condition'}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={conditionData} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}>
                    {conditionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <MapPin className="w-5 h-5 text-primary" />
            {ar ? 'الأصول حسب الموقع/المحطة' : 'Assets by Station/Location'}
          </CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="location" type="category" fontSize={12} width={100} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="count" name={ar ? 'العدد' : 'Count'} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Details Table */}
      <Card>
        <CardHeader><CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <MapPin className="w-5 h-5 text-primary" />
          {ar ? 'تفاصيل الأصول حسب الموقع' : 'Asset Details by Location'}
        </CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{ar ? 'الموقع' : 'Location'}</TableHead>
                <TableHead>{ar ? 'عدد الأصول' : 'Asset Count'}</TableHead>
                <TableHead>{ar ? 'إجمالي القيمة' : 'Total Value'}</TableHead>
                <TableHead>{ar ? 'النسبة' : 'Percentage'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stationData.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.location}</TableCell>
                  <TableCell>{s.count}</TableCell>
                  <TableCell>{s.value.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{assets.length > 0 ? Math.round((s.count / assets.length) * 100) : 0}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>{ar ? 'الإجمالي' : 'Total'}</TableCell>
                <TableCell>{assets.length}</TableCell>
                <TableCell>{totalValue.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</TableCell>
                <TableCell><Badge>100%</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Full Asset List for Print */}
      <Card>
        <CardHeader><CardTitle>{ar ? 'قائمة الأصول التفصيلية' : 'Detailed Asset List'}</CardTitle></CardHeader>
        <CardContent>
          <div ref={reportRef} className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{ar ? 'الكود' : 'Code'}</TableHead>
                  <TableHead>{ar ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{ar ? 'التصنيف' : 'Category'}</TableHead>
                  <TableHead>{ar ? 'الماركة' : 'Brand'}</TableHead>
                  <TableHead>{ar ? 'الموقع' : 'Location'}</TableHead>
                  <TableHead>{ar ? 'معيّن لـ' : 'Assigned To'}</TableHead>
                  <TableHead>{ar ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{ar ? 'السعر' : 'Price'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-sm">{a.assetCode}</TableCell>
                    <TableCell className="font-medium">{ar ? a.nameAr : a.nameEn}</TableCell>
                    <TableCell>{t(`assets.category.${a.category}`)}</TableCell>
                    <TableCell>{a.brand}</TableCell>
                    <TableCell>{a.location}</TableCell>
                    <TableCell>{getEmpName(a.assignedTo)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        a.status === 'assigned' && 'bg-blue-100 text-blue-700',
                        a.status === 'available' && 'bg-green-100 text-green-700',
                        a.status === 'maintenance' && 'bg-amber-100 text-amber-700',
                        a.status === 'retired' && 'bg-red-100 text-red-700',
                      )}>{t(`assets.status.${a.status}`)}</Badge>
                    </TableCell>
                    <TableCell>{a.purchasePrice.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={7}>{ar ? 'الإجمالي' : 'Total'}</TableCell>
                  <TableCell>{totalValue.toLocaleString()} {ar ? 'ج.م' : 'EGP'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
