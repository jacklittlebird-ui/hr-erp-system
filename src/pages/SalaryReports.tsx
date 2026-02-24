import { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download, Printer, FileText, Building2, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { usePayrollData, ProcessedPayroll } from '@/contexts/PayrollDataContext';
import { useReportExport } from '@/hooks/useReportExport';
import { stationLocations } from '@/data/stationLocations';
import { initialDepartments } from '@/data/departments';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16', '#e11d48', '#0ea5e9', '#a855f7'];

const SalaryReports = () => {
  const { language, isRTL } = useLanguage();
  const ar = language === 'ar';
  const { payrollEntries } = usePayrollData();
  const { reportRef, handlePrint, exportToCSV, exportToPDF, exportBilingualPDF, exportBilingualCSV } = useReportExport();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [station, setStation] = useState('all');
  const [department, setDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const monthNamesEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthNames = ar ? monthNamesAr : monthNamesEn;

  // Filter payroll entries
  const filtered = useMemo(() =>
    payrollEntries.filter(e =>
      e.year === selectedYear &&
      (selectedMonth === 'all' || e.month === selectedMonth) &&
      (station === 'all' || e.stationLocation === station) &&
      (department === 'all' || e.department === department)
    ), [payrollEntries, selectedYear, selectedMonth, station, department]
  );

  // Unique departments from data
  const departments = useMemo(() => {
    const set = new Set(payrollEntries.map(e => e.department));
    return Array.from(set);
  }, [payrollEntries]);

  // Monthly aggregates
  const monthlySalaries = useMemo(() =>
    monthNamesAr.map((_, i) => {
      const m = String(i + 1).padStart(2, '0');
      const me = filtered.filter(e => e.month === m);
      return {
        month: monthNames[i],
        monthNum: m,
        basic: me.reduce((s, e) => s + e.basicSalary, 0),
        transport: me.reduce((s, e) => s + e.transportAllowance, 0),
        incentives: me.reduce((s, e) => s + e.incentives, 0),
        stationAllowance: me.reduce((s, e) => s + e.stationAllowance, 0),
        mobileAllowance: me.reduce((s, e) => s + e.mobileAllowance, 0),
        livingAllowance: me.reduce((s, e) => s + e.livingAllowance, 0),
        overtimePay: me.reduce((s, e) => s + e.overtimePay, 0),
        bonuses: me.reduce((s, e) => s + e.bonusAmount, 0),
        gross: me.reduce((s, e) => s + e.gross, 0),
        insurance: me.reduce((s, e) => s + e.employeeInsurance, 0),
        loans: me.reduce((s, e) => s + e.loanPayment, 0),
        advances: me.reduce((s, e) => s + e.advanceAmount, 0),
        mobileBill: me.reduce((s, e) => s + e.mobileBill, 0),
        leaveDeduction: me.reduce((s, e) => s + e.leaveDeduction, 0),
        penalty: me.reduce((s, e) => s + e.penaltyAmount, 0),
        totalDeductions: me.reduce((s, e) => s + e.totalDeductions, 0),
        net: me.reduce((s, e) => s + e.netSalary, 0),
        employerInsurance: me.reduce((s, e) => s + e.employerSocialInsurance, 0),
        healthInsurance: me.reduce((s, e) => s + e.healthInsurance, 0),
        incomeTax: me.reduce((s, e) => s + e.incomeTax, 0),
        count: me.length,
      };
    }), [filtered, monthNames]
  );

  const activeMonths = monthlySalaries.filter(m => m.count > 0);

  // KPIs
  const totalNet = filtered.reduce((s, e) => s + e.netSalary, 0);
  const totalGross = filtered.reduce((s, e) => s + e.gross, 0);
  const totalDeductions = filtered.reduce((s, e) => s + e.totalDeductions, 0);
  const totalEmployer = filtered.reduce((s, e) => s + e.employerSocialInsurance + e.healthInsurance + e.incomeTax, 0);
  const uniqueEmps = new Set(filtered.map(e => e.employeeId)).size;
  const avgSalary = uniqueEmps > 0 ? Math.round(totalNet / uniqueEmps) : 0;

  const stats = [
    { label: ar ? 'إجمالي الصافي' : 'Total Net', value: totalNet.toLocaleString(), icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
    { label: ar ? 'إجمالي الإجمالي' : 'Total Gross', value: totalGross.toLocaleString(), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: ar ? 'إجمالي الخصومات' : 'Total Deductions', value: totalDeductions.toLocaleString(), icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: ar ? 'مساهمات صاحب العمل' : 'Employer Cost', value: totalEmployer.toLocaleString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: ar ? 'متوسط الراتب' : 'Avg Salary', value: avgSalary.toLocaleString(), icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: ar ? 'عدد الموظفين' : 'Employees', value: String(uniqueEmps), icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  // By station
  const stationData = useMemo(() => {
    const map = new Map<string, { count: number; basic: number; gross: number; deductions: number; net: number; employer: number }>();
    filtered.forEach(e => {
      if (!map.has(e.stationLocation)) map.set(e.stationLocation, { count: 0, basic: 0, gross: 0, deductions: 0, net: 0, employer: 0 });
      const s = map.get(e.stationLocation)!;
      s.count++;
      s.basic += e.basicSalary;
      s.gross += e.gross;
      s.deductions += e.totalDeductions;
      s.net += e.netSalary;
      s.employer += e.employerSocialInsurance + e.healthInsurance + e.incomeTax;
    });
    return Array.from(map.entries()).map(([key, v], i) => {
      const st = stationLocations.find(s => s.value === key);
      return { key, name: st ? (ar ? st.labelAr : st.labelEn) : key, ...v, color: COLORS[i % COLORS.length] };
    });
  }, [filtered, ar]);

  // By department
  const deptData = useMemo(() => {
    const map = new Map<string, { count: number; gross: number; net: number; deductions: number }>();
    filtered.forEach(e => {
      if (!map.has(e.department)) map.set(e.department, { count: 0, gross: 0, net: 0, deductions: 0 });
      const s = map.get(e.department)!;
      s.count++;
      s.gross += e.gross;
      s.net += e.netSalary;
      s.deductions += e.totalDeductions;
    });
    return Array.from(map.entries()).map(([name, v], i) => ({ name, ...v, color: COLORS[i % COLORS.length] }));
  }, [filtered]);

  // Allowance/deduction breakdown
  const allowanceBreakdown = useMemo(() => [
    { name: ar ? 'بدل مواصلات' : 'Transport', value: filtered.reduce((s, e) => s + e.transportAllowance, 0), color: '#3b82f6' },
    { name: ar ? 'حوافز' : 'Incentives', value: filtered.reduce((s, e) => s + e.incentives, 0), color: '#22c55e' },
    { name: ar ? 'بدل محطة' : 'Station', value: filtered.reduce((s, e) => s + e.stationAllowance, 0), color: '#f59e0b' },
    { name: ar ? 'بدل محمول' : 'Mobile', value: filtered.reduce((s, e) => s + e.mobileAllowance, 0), color: '#8b5cf6' },
    { name: ar ? 'بدل معيشة' : 'Living', value: filtered.reduce((s, e) => s + e.livingAllowance, 0), color: '#06b6d4' },
    { name: ar ? 'أجر إضافي' : 'Overtime', value: filtered.reduce((s, e) => s + e.overtimePay, 0), color: '#ec4899' },
    { name: ar ? 'مكافآت' : 'Bonuses', value: filtered.reduce((s, e) => s + e.bonusAmount, 0), color: '#f97316' },
  ].filter(a => a.value > 0), [filtered, ar]);

  // Monthly by station aggregate
  const monthlyByStation = useMemo(() => {
    const result: Array<{ stationKey: string; stationName: string; month: string; monthNum: string; count: number; basic: number; transport: number; incentives: number; stationAllowance: number; mobileAllowance: number; livingAllowance: number; overtimePay: number; bonuses: number; gross: number; insurance: number; loans: number; advances: number; mobileBill: number; leaveDeduction: number; penalty: number; totalDeductions: number; net: number; employerInsurance: number; healthInsurance: number; incomeTax: number }> = [];
    const yearFiltered = payrollEntries.filter(e => e.year === selectedYear && (department === 'all' || e.department === department));
    const stationsInData = new Set(yearFiltered.map(e => e.stationLocation));
    stationsInData.forEach(stKey => {
      const stObj = stationLocations.find(s => s.value === stKey);
      const stLabel = stObj ? (ar ? stObj.labelAr : stObj.labelEn) : stKey;
      monthNamesAr.forEach((_, i) => {
        const m = String(i + 1).padStart(2, '0');
        const me = yearFiltered.filter(e => e.stationLocation === stKey && e.month === m);
        if (me.length === 0) return;
        result.push({
          stationKey: stKey, stationName: stLabel, month: monthNames[i], monthNum: m, count: me.length,
          basic: me.reduce((s, e) => s + e.basicSalary, 0), transport: me.reduce((s, e) => s + e.transportAllowance, 0),
          incentives: me.reduce((s, e) => s + e.incentives, 0), stationAllowance: me.reduce((s, e) => s + e.stationAllowance, 0),
          mobileAllowance: me.reduce((s, e) => s + e.mobileAllowance, 0), livingAllowance: me.reduce((s, e) => s + e.livingAllowance, 0),
          overtimePay: me.reduce((s, e) => s + e.overtimePay, 0), bonuses: me.reduce((s, e) => s + e.bonusAmount, 0),
          gross: me.reduce((s, e) => s + e.gross, 0), insurance: me.reduce((s, e) => s + e.employeeInsurance, 0),
          loans: me.reduce((s, e) => s + e.loanPayment, 0), advances: me.reduce((s, e) => s + e.advanceAmount, 0),
          mobileBill: me.reduce((s, e) => s + e.mobileBill, 0), leaveDeduction: me.reduce((s, e) => s + e.leaveDeduction, 0),
          penalty: me.reduce((s, e) => s + e.penaltyAmount, 0), totalDeductions: me.reduce((s, e) => s + e.totalDeductions, 0),
          net: me.reduce((s, e) => s + e.netSalary, 0), employerInsurance: me.reduce((s, e) => s + e.employerSocialInsurance, 0),
          healthInsurance: me.reduce((s, e) => s + e.healthInsurance, 0), incomeTax: me.reduce((s, e) => s + e.incomeTax, 0),
        });
      });
    });
    return result;
  }, [payrollEntries, selectedYear, department, monthNames, ar]);

  // Group monthlyByStation by station for printing
  const handlePrintMonthlyByStation = useCallback(() => {
    const title = ar ? `تفصيل شهري بالمحطة - ${selectedYear}` : `Monthly Detail by Station - ${selectedYear}`;
    const stationGroups = new Map<string, typeof monthlyByStation>();
    monthlyByStation.forEach(row => {
      if (!stationGroups.has(row.stationKey)) stationGroups.set(row.stationKey, []);
      stationGroups.get(row.stationKey)!.push(row);
    });
    const headerLabels = ar
      ? ['الشهر','العدد','الأساسي','مواصلات','حوافز','بدل محطة','بدل محمول','بدل معيشة','أجر إضافي','مكافآت','الإجمالي','تأمينات','قروض','سلف','فاتورة','إجازات','جزاءات','إجمالي خصومات','الصافي','تأمينات ص.ع','صحي','ضريبة']
      : ['Month','Count','Basic','Trans.','Incent.','St.All.','Mob.All.','Living','OT','Bonus','Gross','Ins.','Loans','Adv.','Bill','Leave','Pen.','Tot.Ded','Net','Emp.Ins','Health','Tax'];

    let pages = '';
    stationGroups.forEach((rows, stKey) => {
      const stName = getStationLabel(stKey);
      const totals = { count: 0, basic: 0, transport: 0, incentives: 0, stationAllowance: 0, mobileAllowance: 0, livingAllowance: 0, overtimePay: 0, bonuses: 0, gross: 0, insurance: 0, loans: 0, advances: 0, mobileBill: 0, leaveDeduction: 0, penalty: 0, totalDeductions: 0, net: 0, employerInsurance: 0, healthInsurance: 0, incomeTax: 0 };
      rows.forEach(r => { Object.keys(totals).forEach(k => { (totals as any)[k] += (r as any)[k]; }); });
      const trs = rows.map(r => `<tr>
        <td style="font-weight:600">${r.month}</td><td>${r.count}</td>
        <td>${r.basic.toLocaleString()}</td><td>${r.transport.toLocaleString()}</td><td>${r.incentives.toLocaleString()}</td>
        <td>${r.stationAllowance.toLocaleString()}</td><td>${r.mobileAllowance.toLocaleString()}</td><td>${r.livingAllowance.toLocaleString()}</td>
        <td>${r.overtimePay.toLocaleString()}</td><td>${r.bonuses.toLocaleString()}</td>
        <td style="font-weight:bold;background:#f0fdf4">${r.gross.toLocaleString()}</td>
        <td>${r.insurance.toLocaleString()}</td><td>${r.loans.toLocaleString()}</td><td>${r.advances.toLocaleString()}</td>
        <td>${r.mobileBill.toLocaleString()}</td><td>${r.leaveDeduction.toLocaleString()}</td><td>${r.penalty.toLocaleString()}</td>
        <td style="color:#dc2626">${r.totalDeductions.toLocaleString()}</td>
        <td style="font-weight:bold;background:#eff6ff">${r.net.toLocaleString()}</td>
        <td>${r.employerInsurance.toLocaleString()}</td><td>${r.healthInsurance.toLocaleString()}</td><td>${r.incomeTax.toLocaleString()}</td>
      </tr>`).join('');
      const totalRow = `<tr style="font-weight:bold;background:#f3f4f6">
        <td>${ar ? 'الإجمالي' : 'Total'}</td><td>${totals.count}</td>
        <td>${totals.basic.toLocaleString()}</td><td>${totals.transport.toLocaleString()}</td><td>${totals.incentives.toLocaleString()}</td>
        <td>${totals.stationAllowance.toLocaleString()}</td><td>${totals.mobileAllowance.toLocaleString()}</td><td>${totals.livingAllowance.toLocaleString()}</td>
        <td>${totals.overtimePay.toLocaleString()}</td><td>${totals.bonuses.toLocaleString()}</td>
        <td style="background:#dcfce7">${totals.gross.toLocaleString()}</td>
        <td>${totals.insurance.toLocaleString()}</td><td>${totals.loans.toLocaleString()}</td><td>${totals.advances.toLocaleString()}</td>
        <td>${totals.mobileBill.toLocaleString()}</td><td>${totals.leaveDeduction.toLocaleString()}</td><td>${totals.penalty.toLocaleString()}</td>
        <td style="color:#dc2626">${totals.totalDeductions.toLocaleString()}</td>
        <td style="background:#dbeafe">${totals.net.toLocaleString()}</td>
        <td>${totals.employerInsurance.toLocaleString()}</td><td>${totals.healthInsurance.toLocaleString()}</td><td>${totals.incomeTax.toLocaleString()}</td>
      </tr>`;
      pages += `<div class="station-page"><h2>${stName}</h2>
        <table><thead><tr>${headerLabels.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${trs}${totalRow}</tbody></table></div>`;
    });

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="${ar ? 'rtl' : 'ltr'}"><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Baloo Bhaijaan 2', sans-serif; padding: 15px; font-size: 10px; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 10px; }
        h2 { font-size: 15px; margin: 8px 0; padding: 6px 10px; background: #1e40af; color: white; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 10px; }
        th { background: #374151; color: white; padding: 4px 3px; font-size: 8px; white-space: nowrap; }
        td { border: 1px solid #d1d5db; padding: 3px 4px; text-align: center; }
        tr:nth-child(even) { background: #f9fafb; }
        .station-page { page-break-after: always; }
        .station-page:last-child { page-break-after: auto; }
        @media print { @page { size: landscape; margin: 8mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <h1>${title}</h1>
      <p style="text-align:center;color:#666;font-size:11px;margin-bottom:15px">${new Date().toLocaleDateString(ar ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${pages}
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }, [monthlyByStation, ar, selectedYear]);

  const deductionBreakdown = useMemo(() => [
    { name: ar ? 'تأمينات الموظف' : 'Insurance', value: filtered.reduce((s, e) => s + e.employeeInsurance, 0), color: '#ef4444' },
    { name: ar ? 'أقساط قروض' : 'Loans', value: filtered.reduce((s, e) => s + e.loanPayment, 0), color: '#f59e0b' },
    { name: ar ? 'سلف' : 'Advances', value: filtered.reduce((s, e) => s + e.advanceAmount, 0), color: '#8b5cf6' },
    { name: ar ? 'فاتورة محمول' : 'Mobile Bill', value: filtered.reduce((s, e) => s + e.mobileBill, 0), color: '#06b6d4' },
    { name: ar ? 'خصم إجازات' : 'Leave Ded.', value: filtered.reduce((s, e) => s + e.leaveDeduction, 0), color: '#ec4899' },
    { name: ar ? 'جزاءات' : 'Penalties', value: filtered.reduce((s, e) => s + e.penaltyAmount, 0), color: '#6b7280' },
  ].filter(d => d.value > 0), [filtered, ar]);

  const getStationLabel = (val: string) => {
    const st = stationLocations.find(s => s.value === val);
    return st ? (ar ? st.labelAr : st.labelEn) : val;
  };

  // Print detailed monthly report
  const handlePrintMonthlyDetail = useCallback(() => {
    const title = ar
      ? `تقرير مسير الرواتب التفصيلي - ${selectedMonth !== 'all' ? monthNamesAr[parseInt(selectedMonth) - 1] : 'السنة'} ${selectedYear}`
      : `Detailed Payroll Report - ${selectedMonth !== 'all' ? monthNamesEn[parseInt(selectedMonth) - 1] : 'Year'} ${selectedYear}`;

    const totals = {
      basic: filtered.reduce((s, e) => s + e.basicSalary, 0),
      transport: filtered.reduce((s, e) => s + e.transportAllowance, 0),
      incentives: filtered.reduce((s, e) => s + e.incentives, 0),
      stationAllow: filtered.reduce((s, e) => s + e.stationAllowance, 0),
      mobileAllow: filtered.reduce((s, e) => s + e.mobileAllowance, 0),
      living: filtered.reduce((s, e) => s + e.livingAllowance, 0),
      overtime: filtered.reduce((s, e) => s + e.overtimePay, 0),
      bonus: filtered.reduce((s, e) => s + e.bonusAmount, 0),
      gross: filtered.reduce((s, e) => s + e.gross, 0),
      insurance: filtered.reduce((s, e) => s + e.employeeInsurance, 0),
      loans: filtered.reduce((s, e) => s + e.loanPayment, 0),
      advances: filtered.reduce((s, e) => s + e.advanceAmount, 0),
      mobileBill: filtered.reduce((s, e) => s + e.mobileBill, 0),
      leaveDed: filtered.reduce((s, e) => s + e.leaveDeduction, 0),
      penalty: filtered.reduce((s, e) => s + e.penaltyAmount, 0),
      totalDed: filtered.reduce((s, e) => s + e.totalDeductions, 0),
      net: filtered.reduce((s, e) => s + e.netSalary, 0),
      empIns: filtered.reduce((s, e) => s + e.employerSocialInsurance, 0),
      health: filtered.reduce((s, e) => s + e.healthInsurance, 0),
      tax: filtered.reduce((s, e) => s + e.incomeTax, 0),
    };

    const rows = filtered.map(e => `
      <tr>
        <td>${e.employeeId}</td>
        <td>${ar ? e.employeeName : e.employeeNameEn}</td>
        <td>${e.department}</td>
        <td>${getStationLabel(e.stationLocation)}</td>
        <td>${e.basicSalary.toLocaleString()}</td>
        <td>${e.transportAllowance.toLocaleString()}</td>
        <td>${e.incentives.toLocaleString()}</td>
        <td>${e.stationAllowance.toLocaleString()}</td>
        <td>${e.mobileAllowance.toLocaleString()}</td>
        <td>${e.livingAllowance.toLocaleString()}</td>
        <td>${e.overtimePay.toLocaleString()}</td>
        <td>${e.bonusAmount.toLocaleString()}</td>
        <td style="font-weight:bold;background:#f0fdf4">${e.gross.toLocaleString()}</td>
        <td>${e.employeeInsurance.toLocaleString()}</td>
        <td>${e.loanPayment.toLocaleString()}</td>
        <td>${e.advanceAmount.toLocaleString()}</td>
        <td>${e.mobileBill.toLocaleString()}</td>
        <td>${e.leaveDeduction.toLocaleString()}</td>
        <td>${e.penaltyAmount.toLocaleString()}</td>
        <td style="color:#dc2626">${e.totalDeductions.toLocaleString()}</td>
        <td style="font-weight:bold;background:#eff6ff">${e.netSalary.toLocaleString()}</td>
        <td>${e.employerSocialInsurance.toLocaleString()}</td>
        <td>${e.healthInsurance.toLocaleString()}</td>
        <td>${e.incomeTax.toLocaleString()}</td>
      </tr>
    `).join('');

    const totalRow = `
      <tr style="font-weight:bold;background:#f3f4f6">
        <td colspan="4">${ar ? 'الإجمالي' : 'Total'}</td>
        <td>${totals.basic.toLocaleString()}</td>
        <td>${totals.transport.toLocaleString()}</td>
        <td>${totals.incentives.toLocaleString()}</td>
        <td>${totals.stationAllow.toLocaleString()}</td>
        <td>${totals.mobileAllow.toLocaleString()}</td>
        <td>${totals.living.toLocaleString()}</td>
        <td>${totals.overtime.toLocaleString()}</td>
        <td>${totals.bonus.toLocaleString()}</td>
        <td style="background:#dcfce7">${totals.gross.toLocaleString()}</td>
        <td>${totals.insurance.toLocaleString()}</td>
        <td>${totals.loans.toLocaleString()}</td>
        <td>${totals.advances.toLocaleString()}</td>
        <td>${totals.mobileBill.toLocaleString()}</td>
        <td>${totals.leaveDed.toLocaleString()}</td>
        <td>${totals.penalty.toLocaleString()}</td>
        <td style="color:#dc2626">${totals.totalDed.toLocaleString()}</td>
        <td style="background:#dbeafe">${totals.net.toLocaleString()}</td>
        <td>${totals.empIns.toLocaleString()}</td>
        <td>${totals.health.toLocaleString()}</td>
        <td>${totals.tax.toLocaleString()}</td>
      </tr>`;

    const headerLabels = ar
      ? ['الكود','الاسم','القسم','المحطة','الأساسي','مواصلات','حوافز','بدل محطة','بدل محمول','بدل معيشة','أجر إضافي','مكافآت','الإجمالي','تأمينات','قروض','سلف','فاتورة محمول','خصم إجازات','جزاءات','إجمالي الخصومات','الصافي','تأمينات صاحب العمل','تأمين صحي','ضريبة دخل']
      : ['ID','Name','Dept','Station','Basic','Transport','Incentives','Station All.','Mobile All.','Living All.','Overtime','Bonus','Gross','Insurance','Loans','Advances','Mobile Bill','Leave Ded.','Penalty','Total Ded.','Net','Emp. Ins.','Health Ins.','Income Tax'];

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="${ar ? 'rtl' : 'ltr'}"><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Baloo Bhaijaan 2', sans-serif; padding: 15px; font-size: 10px; }
        h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 15px; font-size: 12px; }
        .summary { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 15px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; text-align: center; }
        .summary-card .val { font-size: 16px; font-weight: 700; }
        .summary-card .lbl { font-size: 9px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th { background: #1e40af; color: white; padding: 4px 3px; font-size: 8px; white-space: nowrap; }
        td { border: 1px solid #d1d5db; padding: 3px 4px; text-align: center; }
        tr:nth-child(even) { background: #f9fafb; }
        @media print { @page { size: landscape; margin: 8mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <h1>${title}</h1>
      <p class="subtitle">${new Date().toLocaleDateString(ar ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <div class="summary">
        <div class="summary-card"><div class="val">${totals.gross.toLocaleString()}</div><div class="lbl">${ar ? 'إجمالي الإجمالي' : 'Total Gross'}</div></div>
        <div class="summary-card"><div class="val">${totals.totalDed.toLocaleString()}</div><div class="lbl">${ar ? 'إجمالي الخصومات' : 'Total Deductions'}</div></div>
        <div class="summary-card"><div class="val">${totals.net.toLocaleString()}</div><div class="lbl">${ar ? 'إجمالي الصافي' : 'Total Net'}</div></div>
        <div class="summary-card"><div class="val">${(totals.empIns + totals.health + totals.tax).toLocaleString()}</div><div class="lbl">${ar ? 'مساهمات صاحب العمل' : 'Employer Cost'}</div></div>
        <div class="summary-card"><div class="val">${filtered.length}</div><div class="lbl">${ar ? 'عدد السجلات' : 'Records'}</div></div>
        <div class="summary-card"><div class="val">${uniqueEmps}</div><div class="lbl">${ar ? 'عدد الموظفين' : 'Employees'}</div></div>
      </div>
      <table><thead><tr>${headerLabels.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}${totalRow}</tbody></table>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }, [filtered, ar, selectedMonth, selectedYear]);

  // Print monthly summary (totals per month)
  const handlePrintMonthlySummary = useCallback(() => {
    const title = ar ? `ملخص الرواتب الشهري - ${selectedYear}` : `Monthly Payroll Summary - ${selectedYear}`;
    const months = activeMonths;

    const headerLabels = ar
      ? ['الشهر','عدد الموظفين','الأساسي','مواصلات','حوافز','بدل محطة','بدل محمول','بدل معيشة','أجر إضافي','مكافآت','الإجمالي','تأمينات','قروض','سلف','فاتورة محمول','خصم إجازات','جزاءات','إجمالي الخصومات','الصافي','تأمينات صاحب العمل','تأمين صحي','ضريبة دخل']
      : ['Month','Employees','Basic','Transport','Incentives','Station','Mobile','Living','Overtime','Bonus','Gross','Insurance','Loans','Advances','Mobile Bill','Leave Ded.','Penalty','Total Ded.','Net','Emp. Ins.','Health Ins.','Income Tax'];

    const rows = months.map(m => `<tr>
      <td style="font-weight:600">${m.month}</td><td>${m.count}</td>
      <td>${m.basic.toLocaleString()}</td><td>${m.transport.toLocaleString()}</td>
      <td>${m.incentives.toLocaleString()}</td><td>${m.stationAllowance.toLocaleString()}</td>
      <td>${m.mobileAllowance.toLocaleString()}</td><td>${m.livingAllowance.toLocaleString()}</td>
      <td>${m.overtimePay.toLocaleString()}</td><td>${m.bonuses.toLocaleString()}</td>
      <td style="font-weight:bold;background:#f0fdf4">${m.gross.toLocaleString()}</td>
      <td>${m.insurance.toLocaleString()}</td><td>${m.loans.toLocaleString()}</td>
      <td>${m.advances.toLocaleString()}</td><td>${m.mobileBill.toLocaleString()}</td>
      <td>${m.leaveDeduction.toLocaleString()}</td><td>${m.penalty.toLocaleString()}</td>
      <td style="color:#dc2626">${m.totalDeductions.toLocaleString()}</td>
      <td style="font-weight:bold;background:#eff6ff">${m.net.toLocaleString()}</td>
      <td>${m.employerInsurance.toLocaleString()}</td><td>${m.healthInsurance.toLocaleString()}</td>
      <td>${m.incomeTax.toLocaleString()}</td>
    </tr>`).join('');

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html dir="${ar ? 'rtl' : 'ltr'}"><head><title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Baloo Bhaijaan 2', sans-serif; padding: 20px; font-size: 11px; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e40af; color: white; padding: 6px 4px; font-size: 9px; white-space: nowrap; }
        td { border: 1px solid #d1d5db; padding: 4px 5px; text-align: center; }
        tr:nth-child(even) { background: #f9fafb; }
        @media print { @page { size: landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head><body>
      <h1>${title}</h1>
      <table><thead><tr>${headerLabels.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }, [activeMonths, ar, selectedYear]);

  // Export helpers
  const getDetailExportData = () => filtered.map(e => ({
    id: e.employeeId,
    name: ar ? e.employeeName : e.employeeNameEn,
    dept: e.department,
    station: getStationLabel(e.stationLocation),
    basic: e.basicSalary, transport: e.transportAllowance, incentives: e.incentives,
    stationAllow: e.stationAllowance, mobileAllow: e.mobileAllowance, living: e.livingAllowance,
    overtime: e.overtimePay, bonus: e.bonusAmount, gross: e.gross,
    insurance: e.employeeInsurance, loans: e.loanPayment, advances: e.advanceAmount,
    mobileBill: e.mobileBill, leaveDed: e.leaveDeduction, penalty: e.penaltyAmount,
    totalDed: e.totalDeductions, net: e.netSalary,
    empIns: e.employerSocialInsurance, health: e.healthInsurance, tax: e.incomeTax,
  }));

  const getDetailColumns = () => [
    { header: ar ? 'الكود' : 'ID', key: 'id' },
    { header: ar ? 'الاسم' : 'Name', key: 'name' },
    { header: ar ? 'القسم' : 'Dept', key: 'dept' },
    { header: ar ? 'المحطة' : 'Station', key: 'station' },
    { header: ar ? 'الأساسي' : 'Basic', key: 'basic' },
    { header: ar ? 'مواصلات' : 'Transport', key: 'transport' },
    { header: ar ? 'حوافز' : 'Incentives', key: 'incentives' },
    { header: ar ? 'بدل محطة' : 'Station All.', key: 'stationAllow' },
    { header: ar ? 'بدل محمول' : 'Mobile All.', key: 'mobileAllow' },
    { header: ar ? 'بدل معيشة' : 'Living', key: 'living' },
    { header: ar ? 'أجر إضافي' : 'Overtime', key: 'overtime' },
    { header: ar ? 'مكافآت' : 'Bonus', key: 'bonus' },
    { header: ar ? 'الإجمالي' : 'Gross', key: 'gross' },
    { header: ar ? 'تأمينات' : 'Insurance', key: 'insurance' },
    { header: ar ? 'قروض' : 'Loans', key: 'loans' },
    { header: ar ? 'سلف' : 'Advances', key: 'advances' },
    { header: ar ? 'فاتورة محمول' : 'Mobile Bill', key: 'mobileBill' },
    { header: ar ? 'خصم إجازات' : 'Leave Ded.', key: 'leaveDed' },
    { header: ar ? 'جزاءات' : 'Penalty', key: 'penalty' },
    { header: ar ? 'إجمالي الخصومات' : 'Total Ded.', key: 'totalDed' },
    { header: ar ? 'الصافي' : 'Net', key: 'net' },
  ];

  const tabs = [
    { id: 'overview', label: ar ? 'نظرة عامة' : 'Overview' },
    { id: 'stations', label: ar ? 'حسب المحطة' : 'By Station' },
    { id: 'departments', label: ar ? 'حسب القسم' : 'By Department' },
    { id: 'monthly-detail', label: ar ? 'تفصيل شهري' : 'Monthly Detail' },
    { id: 'employee-detail', label: ar ? 'تفصيل الموظفين' : 'Employee Detail' },
    { id: 'monthly-station', label: ar ? 'تفصيل شهري بالمحطة' : 'Monthly by Station' },
    { id: 'allowances', label: ar ? 'تحليل البدلات والخصومات' : 'Allowances & Deductions' },
  ];

  // Filters component
  const FiltersBar = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className={cn("flex flex-wrap gap-3 items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex flex-wrap gap-3", isRTL && "flex-row-reverse")}>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: 11 }, (_, i) => String(2025 + i)).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-36"><SelectValue placeholder={ar ? 'الشهر' : 'Month'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? 'كل الأشهر' : 'All Months'}</SelectItem>
                {monthNames.map((name, i) => <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger className="w-40"><SelectValue placeholder={ar ? 'المحطة' : 'Station'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? 'جميع المحطات' : 'All Stations'}</SelectItem>
                {stationLocations.map(s => <SelectItem key={s.value} value={s.value}>{ar ? s.labelAr : s.labelEn}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-40"><SelectValue placeholder={ar ? 'القسم' : 'Department'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? 'جميع الأقسام' : 'All Departments'}</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className={cn("flex gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" onClick={handlePrintMonthlyDetail}><Printer className="w-4 h-4 mr-1" />{ar ? 'طباعة تفصيلي' : 'Print Detail'}</Button>
            <Button variant="outline" size="sm" onClick={handlePrintMonthlySummary}><Printer className="w-4 h-4 mr-1" />{ar ? 'طباعة ملخص' : 'Print Summary'}</Button>
            <Button variant="outline" size="sm" onClick={() => exportToCSV({ title: ar ? 'تقرير الرواتب' : 'Salary Report', data: getDetailExportData(), columns: getDetailColumns() })}><FileText className="w-4 h-4 mr-1" />Excel</Button>
            <Button variant="outline" size="sm" onClick={() => exportToPDF({ title: ar ? 'تقرير الرواتب' : 'Salary Report', data: getDetailExportData(), columns: getDetailColumns() })}><Download className="w-4 h-4 mr-1" />PDF</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className={cn("mb-6", isRTL && "text-right")}>
        <h1 className="text-2xl font-bold text-foreground">{ar ? 'تقارير الرواتب التحليلية' : 'Salary Analytics Reports'}</h1>
        <p className="text-muted-foreground mt-1">{ar ? 'تقارير وتحليلات تفصيلية لمسير الرواتب' : 'Detailed payroll analytics and reports'}</p>
      </div>

      <FiltersBar />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, i) => (
          <Card key={i}><CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className={cn("p-2 rounded-lg", stat.bg)}><stat.icon className={cn("w-5 h-5", stat.color)} /></div>
              <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-lg font-bold">{stat.value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="w-full justify-start mb-6 flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{tab.label}</TabsTrigger>
          ))}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{ar ? 'اتجاه الرواتب الشهري' : 'Monthly Payroll Trend'}</CardTitle></CardHeader>
              <CardContent><div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeMonths}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                    <Area type="monotone" dataKey="net" name={ar ? 'الصافي' : 'Net'} stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="gross" name={ar ? 'الإجمالي' : 'Gross'} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="totalDeductions" name={ar ? 'الخصومات' : 'Deductions'} stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{ar ? 'الرواتب حسب المحطة' : 'Salary by Station'}</CardTitle></CardHeader>
              <CardContent><div className="h-[300px]">
                {stationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={stationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="net"
                      label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                      {stationData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip formatter={(v: number) => v.toLocaleString()} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-muted-foreground">{ar ? 'لا توجد بيانات' : 'No data'}</div>}
              </div></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{ar ? 'الرواتب حسب القسم' : 'Salary by Department'}</CardTitle></CardHeader>
              <CardContent><div className="h-[300px]">
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="net"
                      label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                      {deptData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip formatter={(v: number) => v.toLocaleString()} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-muted-foreground">{ar ? 'لا توجد بيانات' : 'No data'}</div>}
              </div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Station */}
        <TabsContent value="stations">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{ar ? 'مقارنة تكاليف المحطات' : 'Station Cost Comparison'}</CardTitle></CardHeader>
              <CardContent><div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" /><XAxis type="number" fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={100} /><Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                    <Bar dataKey="gross" name={ar ? 'الإجمالي' : 'Gross'} fill="#3b82f6" />
                    <Bar dataKey="net" name={ar ? 'الصافي' : 'Net'} fill="#22c55e" />
                    <Bar dataKey="deductions" name={ar ? 'الخصومات' : 'Deductions'} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{ar ? 'تفصيل المحطات' : 'Station Details'}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'المحطة' : 'Station'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'السجلات' : 'Records'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الأساسي' : 'Basic'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الإجمالي' : 'Gross'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الصافي' : 'Net'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'صاحب العمل' : 'Employer'}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {stationData.map(s => (
                      <TableRow key={s.key}>
                        <TableCell className={cn("font-medium", isRTL && "text-right")}><div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />{s.name}</div></TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{s.count}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{s.basic.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{s.gross.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-destructive", isRTL && "text-right")}>{s.deductions.toLocaleString()}</TableCell>
                        <TableCell className={cn("font-bold", isRTL && "text-right")}>{s.net.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-blue-600", isRTL && "text-right")}>{s.employer.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Department */}
        <TabsContent value="departments">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{ar ? 'مقارنة تكاليف الأقسام' : 'Department Cost Comparison'}</CardTitle></CardHeader>
              <CardContent><div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                    <Bar dataKey="gross" name={ar ? 'الإجمالي' : 'Gross'} fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="net" name={ar ? 'الصافي' : 'Net'} fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="deductions" name={ar ? 'الخصومات' : 'Deductions'} fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{ar ? 'ملخص الأقسام' : 'Department Summary'}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'القسم' : 'Department'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'السجلات' : 'Records'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الإجمالي' : 'Gross'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الخصومات' : 'Deductions'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'الصافي' : 'Net'}</TableHead>
                    <TableHead className={cn(isRTL && "text-right")}>{ar ? 'النسبة' : '%'}</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {deptData.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className={cn("font-medium", isRTL && "text-right")}><div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />{d.name}</div></TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{d.count}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{d.gross.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-destructive", isRTL && "text-right")}>{d.deductions.toLocaleString()}</TableCell>
                        <TableCell className={cn("font-bold", isRTL && "text-right")}>{d.net.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}><Badge variant="outline">{totalNet > 0 ? ((d.net / totalNet) * 100).toFixed(1) : 0}%</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monthly Detail - aggregated totals per month */}
        <TabsContent value="monthly-detail">
          <Card>
            <CardHeader>
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <CardTitle>{ar ? 'إجماليات شهرية تفصيلية' : 'Detailed Monthly Totals'}</CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintMonthlySummary}><Printer className="w-4 h-4 mr-1" />{ar ? 'طباعة' : 'Print'}</Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table>
                <TableHeader><TableRow>
                  {[ar?'الشهر':'Month', ar?'العدد':'Count', ar?'الأساسي':'Basic', ar?'مواصلات':'Transport', ar?'حوافز':'Incentives', ar?'بدل محطة':'Station', ar?'بدل محمول':'Mobile', ar?'بدل معيشة':'Living', ar?'أجر إضافي':'OT', ar?'مكافآت':'Bonus', ar?'الإجمالي':'Gross', ar?'تأمينات':'Ins.', ar?'قروض':'Loans', ar?'سلف':'Adv.', ar?'فاتورة':'Bill', ar?'إجازات':'Leave', ar?'جزاءات':'Pen.', ar?'إجمالي خصومات':'Tot.Ded', ar?'الصافي':'Net', ar?'مساهمات صاحب العمل':'Employer Cost'].map((h, i) => (
                    <TableHead key={i} className={cn("whitespace-nowrap text-xs", isRTL && "text-right")}>{h}</TableHead>
                  ))}
                </TableRow></TableHeader>
                <TableBody>
                  {activeMonths.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className={cn("font-medium whitespace-nowrap", isRTL && "text-right")}>{m.month}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.count}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.basic.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.transport.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.incentives.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.stationAllowance.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.mobileAllowance.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.livingAllowance.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.overtimePay.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.bonuses.toLocaleString()}</TableCell>
                      <TableCell className={cn("font-bold text-green-700", isRTL && "text-right")}>{m.gross.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.insurance.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.loans.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.advances.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.mobileBill.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.leaveDeduction.toLocaleString()}</TableCell>
                      <TableCell className={cn(isRTL && "text-right")}>{m.penalty.toLocaleString()}</TableCell>
                      <TableCell className={cn("text-destructive", isRTL && "text-right")}>{m.totalDeductions.toLocaleString()}</TableCell>
                      <TableCell className={cn("font-bold text-blue-700", isRTL && "text-right")}>{m.net.toLocaleString()}</TableCell>
                      <TableCell className={cn("text-blue-600", isRTL && "text-right")}>{(m.employerInsurance + m.healthInsurance + m.incomeTax).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Monthly bar chart with all components */}
          <Card className="mt-6">
            <CardHeader><CardTitle>{ar ? 'تفصيل مكونات الرواتب الشهرية' : 'Monthly Salary Components'}</CardTitle></CardHeader>
            <CardContent><div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeMonths}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                  <Bar dataKey="basic" name={ar ? 'الأساسي' : 'Basic'} stackId="a" fill="#3b82f6" />
                  <Bar dataKey="transport" name={ar ? 'مواصلات' : 'Transport'} stackId="a" fill="#22c55e" />
                  <Bar dataKey="incentives" name={ar ? 'حوافز' : 'Incentives'} stackId="a" fill="#f59e0b" />
                  <Bar dataKey="bonuses" name={ar ? 'مكافآت' : 'Bonuses'} stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="totalDeductions" name={ar ? 'الخصومات' : 'Deductions'} fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div></CardContent>
          </Card>
        </TabsContent>

        {/* Employee Detail */}
        <TabsContent value="employee-detail">
          <Card>
            <CardHeader>
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <CardTitle>{ar ? 'بيانات الموظفين التفصيلية' : 'Employee Detailed Data'}</CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintMonthlyDetail}><Printer className="w-4 h-4 mr-1" />{ar ? 'طباعة' : 'Print'}</Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">{ar ? 'لا توجد بيانات للفترة المحددة' : 'No data for selected period'}</div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    {[ar?'الكود':'ID', ar?'الاسم':'Name', ar?'القسم':'Dept', ar?'المحطة':'Station', ar?'الشهر':'Month', ar?'الأساسي':'Basic', ar?'مواصلات':'Trans.', ar?'حوافز':'Incent.', ar?'بدل محطة':'St.All.', ar?'بدل محمول':'Mob.All.', ar?'بدل معيشة':'Living', ar?'أجر إضافي':'OT', ar?'مكافآت':'Bonus', ar?'الإجمالي':'Gross', ar?'تأمينات':'Ins.', ar?'قروض':'Loans', ar?'خصومات':'Tot.Ded', ar?'الصافي':'Net', ar?'مساهمات صاحب العمل':'Employer Cost'].map((h, i) => (
                      <TableHead key={i} className={cn("whitespace-nowrap text-xs", isRTL && "text-right")}>{h}</TableHead>
                    ))}
                  </TableRow></TableHeader>
                  <TableBody>
                    {filtered.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className={cn("font-mono text-xs", isRTL && "text-right")}>{e.employeeId}</TableCell>
                        <TableCell className={cn("font-medium whitespace-nowrap", isRTL && "text-right")}>{ar ? e.employeeName : e.employeeNameEn}</TableCell>
                        <TableCell className={cn("text-xs", isRTL && "text-right")}>{e.department}</TableCell>
                        <TableCell className={cn("text-xs", isRTL && "text-right")}>{getStationLabel(e.stationLocation)}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{monthNames[parseInt(e.month) - 1]}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.basicSalary.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.transportAllowance.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.incentives.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.stationAllowance.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.mobileAllowance.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.livingAllowance.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.overtimePay.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.bonusAmount.toLocaleString()}</TableCell>
                        <TableCell className={cn("font-bold text-green-700", isRTL && "text-right")}>{e.gross.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.employeeInsurance.toLocaleString()}</TableCell>
                        <TableCell className={cn(isRTL && "text-right")}>{e.loanPayment.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-destructive", isRTL && "text-right")}>{e.totalDeductions.toLocaleString()}</TableCell>
                        <TableCell className={cn("font-bold text-blue-700", isRTL && "text-right")}>{e.netSalary.toLocaleString()}</TableCell>
                        <TableCell className={cn("text-blue-600", isRTL && "text-right")}>{(e.employerSocialInsurance + e.healthInsurance + e.incomeTax).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly by Station */}
        <TabsContent value="monthly-station">
          <Card>
            <CardHeader>
              <div className={cn("flex justify-between items-center", isRTL && "flex-row-reverse")}>
                <CardTitle>{ar ? 'تفصيل شهري بالمحطة' : 'Monthly Detail by Station'}</CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintMonthlyByStation}><Printer className="w-4 h-4 mr-1" />{ar ? 'طباعة لكل محطة' : 'Print by Station'}</Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              {monthlyByStation.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">{ar ? 'لا توجد بيانات' : 'No data'}</div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    {[ar?'المحطة':'Station', ar?'الشهر':'Month', ar?'العدد':'Count', ar?'الأساسي':'Basic', ar?'مواصلات':'Trans.', ar?'حوافز':'Incent.', ar?'بدل محطة':'St.All.', ar?'بدل محمول':'Mob.', ar?'بدل معيشة':'Living', ar?'أجر إضافي':'OT', ar?'مكافآت':'Bonus', ar?'الإجمالي':'Gross', ar?'تأمينات':'Ins.', ar?'قروض':'Loans', ar?'إجمالي خصومات':'Tot.Ded', ar?'الصافي':'Net', ar?'صاحب العمل':'Employer'].map((h, i) => (
                      <TableHead key={i} className={cn("whitespace-nowrap text-xs", isRTL && "text-right")}>{h}</TableHead>
                    ))}
                  </TableRow></TableHeader>
                  <TableBody>
                    {(() => {
                      let lastStation = '';
                      return monthlyByStation.map((r, i) => {
                        const showStation = r.stationKey !== lastStation;
                        lastStation = r.stationKey;
                        return (
                          <TableRow key={i} className={showStation ? 'border-t-2 border-primary/30' : ''}>
                            <TableCell className={cn("font-medium whitespace-nowrap", isRTL && "text-right")}>{showStation ? r.stationName : ''}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.month}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.count}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.basic.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.transport.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.incentives.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.stationAllowance.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.mobileAllowance.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.livingAllowance.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.overtimePay.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.bonuses.toLocaleString()}</TableCell>
                            <TableCell className={cn("font-bold text-green-700", isRTL && "text-right")}>{r.gross.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.insurance.toLocaleString()}</TableCell>
                            <TableCell className={cn(isRTL && "text-right")}>{r.loans.toLocaleString()}</TableCell>
                            <TableCell className={cn("text-destructive", isRTL && "text-right")}>{r.totalDeductions.toLocaleString()}</TableCell>
                            <TableCell className={cn("font-bold text-blue-700", isRTL && "text-right")}>{r.net.toLocaleString()}</TableCell>
                            <TableCell className={cn("text-blue-600", isRTL && "text-right")}>{(r.employerInsurance + r.healthInsurance + r.incomeTax).toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Station comparison chart */}
          <Card className="mt-6">
            <CardHeader><CardTitle>{ar ? 'مقارنة صافي الرواتب الشهري بالمحطة' : 'Monthly Net Salary by Station'}</CardTitle></CardHeader>
            <CardContent><div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  const stationsInData = [...new Set(monthlyByStation.map(r => r.stationKey))];
                  return monthNamesAr.map((_, i) => {
                    const m = String(i + 1).padStart(2, '0');
                    const row: any = { month: monthNames[i] };
                    stationsInData.forEach(stKey => {
                      const match = monthlyByStation.find(r => r.stationKey === stKey && r.monthNum === m);
                      row[getStationLabel(stKey)] = match ? match.net : 0;
                    });
                    return row;
                  }).filter(r => Object.values(r).some((v, idx) => idx > 0 && (v as number) > 0));
                })()}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                  {[...new Set(monthlyByStation.map(r => r.stationKey))].map((stKey, i) => (
                    <Bar key={stKey} dataKey={getStationLabel(stKey)} fill={COLORS[i % COLORS.length]} radius={[2,2,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div></CardContent>
          </Card>
        </TabsContent>

        {/* Allowances & Deductions */}
        <TabsContent value="allowances">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{ar ? 'تحليل البدلات' : 'Allowance Breakdown'}</CardTitle></CardHeader>
              <CardContent><div className="h-[350px]">
                {allowanceBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={allowanceBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                      {allowanceBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip formatter={(v: number) => v.toLocaleString()} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-muted-foreground">{ar ? 'لا توجد بيانات' : 'No data'}</div>}
              </div></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{ar ? 'تحليل الخصومات' : 'Deduction Breakdown'}</CardTitle></CardHeader>
              <CardContent><div className="h-[350px]">
                {deductionBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={deductionBreakdown} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}>
                      {deductionBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip formatter={(v: number) => v.toLocaleString()} /></PieChart>
                  </ResponsiveContainer>
                ) : <div className="flex items-center justify-center h-full text-muted-foreground">{ar ? 'لا توجد بيانات' : 'No data'}</div>}
              </div></CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{ar ? 'مقارنة البدلات والخصومات الشهرية' : 'Monthly Allowances vs Deductions'}</CardTitle></CardHeader>
              <CardContent><div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeMonths}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                    <Bar dataKey="transport" name={ar ? 'مواصلات' : 'Transport'} stackId="a" fill="#3b82f6" />
                    <Bar dataKey="incentives" name={ar ? 'حوافز' : 'Incentives'} stackId="a" fill="#22c55e" />
                    <Bar dataKey="bonuses" name={ar ? 'مكافآت' : 'Bonuses'} stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="totalDeductions" name={ar ? 'الخصومات' : 'Deductions'} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div></CardContent>
            </Card>

            {/* Employer contributions */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>{ar ? 'مساهمات صاحب العمل الشهرية' : 'Monthly Employer Contributions'}</CardTitle></CardHeader>
              <CardContent><div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeMonths}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} /><Legend />
                    <Bar dataKey="employerInsurance" name={ar ? 'تأمينات صاحب العمل' : 'Employer Insurance'} fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="healthInsurance" name={ar ? 'تأمين صحي' : 'Health Insurance'} fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="incomeTax" name={ar ? 'ضريبة دخل' : 'Income Tax'} fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SalaryReports;
