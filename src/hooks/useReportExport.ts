import { useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface ExportColumn {
  header: string;
  key: string;
}

interface ReportExportOptions {
  title: string;
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  fileName?: string;
}

export const useReportExport = () => {
  const { t, isRTL } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback((title: string) => {
    const printContent = reportRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Cairo', 'Inter', sans-serif; padding: 20px; direction: ${isRTL ? 'rtl' : 'ltr'}; }
          h1 { text-align: center; margin-bottom: 20px; font-size: 24px; }
          .print-date { text-align: center; color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 13px; }
          th { background-color: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: 700; }
          .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="print-date">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }, [isRTL]);

  const exportToCSV = useCallback(({ title, data, columns, fileName }: ReportExportOptions) => {
    if (!data.length) {
      toast({ title: t('reports.noData') || 'No data to export', variant: 'destructive' });
      return;
    }

    const BOM = '\uFEFF';
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col.key];
        const strVal = String(val ?? '');
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = BOM + [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || title}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: t('reports.exportSuccess') || 'Export completed successfully' });
  }, [t]);

  const exportToPDF = useCallback(({ title, data, columns, fileName }: ReportExportOptions) => {
    if (!data.length) {
      toast({ title: t('reports.noData') || 'No data to export', variant: 'destructive' });
      return;
    }

    const tableRows = data.map(row =>
      `<tr>${columns.map(col => `<td>${String(row[col.key] ?? '')}</td>`).join('')}</tr>`
    ).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Cairo', 'Inter', sans-serif; padding: 30px; direction: ${isRTL ? 'rtl' : 'ltr'}; }
          h1 { text-align: center; margin-bottom: 8px; font-size: 22px; color: #1f2937; }
          .subtitle { text-align: center; color: #6b7280; margin-bottom: 24px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 12px; }
          th { background-color: #1e40af; color: white; font-weight: 600; }
          tr:nth-child(even) { background-color: #f0f4ff; }
          .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 11px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="subtitle">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <table>
          <thead><tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <p class="footer">${t('reports.generatedBy') || 'Generated by HR System'}</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: t('reports.popupBlocked') || 'Please allow popups', variant: 'destructive' });
      return;
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast({ title: t('reports.exportSuccess') || 'Export completed successfully' });
  }, [isRTL, t]);

  return { reportRef, handlePrint, exportToCSV, exportToPDF };
};
