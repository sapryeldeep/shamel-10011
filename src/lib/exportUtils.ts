/**
 * Universal Export & Print Utility for Shamel Medical Platform
 * Supports Arabic UTF-8 BOM CSV/Excel, Clean Print Window, and PDF Export
 */

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
}

/**
 * Exports data to CSV/Excel with UTF-8 BOM so Microsoft Excel renders Arabic perfectly without garbled text.
 */
export function exportToExcel(data: Record<string, any>[], columns: ExportColumn[], filename: string = 'export') {
  if (!data || data.length === 0) {
    alert('لا توجد بيانات متاحة للتصدير!');
    return;
  }

  // Header row
  const headerRow = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (col.format) {
        val = col.format(val, row);
      } else if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  facilityName?: string;
  doctorName?: string;
  facilityPhone?: string;
  facilityAddress?: string;
  logoUrl?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  summaryCards?: { label: string; value: string | number; colorClass?: string }[];
  footerNotes?: string;
}

/**
 * Opens a clean, high-contrast, beautiful print view with Arabic typography.
 */
export function printReport(options: PrintReportOptions) {
  const {
    title,
    subtitle = 'تقرير رسمي صادر من المنظومة الطبية الشاملة',
    facilityName = 'المنظومة الطبية التخصصية',
    doctorName,
    facilityPhone,
    facilityAddress,
    logoUrl,
    columns,
    data,
    summaryCards = [],
    footerNotes = 'تم استخراج هذا التقرير آلياً عبر النظام الطبي الشامل والمعتمد'
  } = options;

  const printDate = new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const summaryHtml = summaryCards.length > 0 ? `
    <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
      ${summaryCards.map(card => `
        <div style="flex: 1; min-width: 150px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px;">${card.label}</div>
          <div style="font-size: 18px; color: #0f172a; font-weight: 800;">${card.value}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const tableHeaderHtml = `
    <thead>
      <tr style="background-color: #0f172a; color: #ffffff;">
        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; width: 40px; font-size: 12px;">#</th>
        ${columns.map(col => `
          <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-size: 12px; font-weight: 700;">
            ${col.label}
          </th>
        `).join('')}
      </tr>
    </thead>
  `;

  const tableBodyHtml = `
    <tbody>
      ${data.length === 0 ? `
        <tr>
          <td colspan="${columns.length + 1}" style="padding: 20px; text-align: center; color: #94a3b8; font-size: 13px;">
            لا توجد بيانات متاحة في هذا التقرير
          </td>
        </tr>
      ` : data.map((row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; font-weight: 600;">
            ${idx + 1}
          </td>
          ${columns.map(col => {
            let val = row[col.key];
            if (col.format) {
              val = col.format(val, row);
            } else if (val === null || val === undefined) {
              val = '-';
            }
            return `
              <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: #1e293b;">
                ${String(val)}
              </td>
            `;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة للطباعة.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${facilityName}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
        }
        body {
          margin: 0;
          padding: 20px;
          color: #0f172a;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.5;
        }
        @media print {
          body {
            padding: 10px;
          }
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          .no-print {
            display: none !important;
          }
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <!-- Top Action Bar -->
      <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 8px 20px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ طباعة التقرير / حفظ PDF
          </button>
          <button onclick="window.close()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; font-size: 13px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-right: 8px;">
            إغلاق
          </button>
        </div>
        <span style="font-size: 12px; color: #64748b; font-weight: 600;">معاينة الطباعة والتصدير</span>
      </div>

      <!-- Facility Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${logoUrl ? `<img src="${logoUrl}" style="max-height: 60px; max-width: 120px; object-fit: contain;" />` : `
            <div style="width: 50px; height: 50px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 22px; font-weight: 900;">
              H
            </div>
          `}
          <div>
            <h1 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 900; color: #0f172a;">${facilityName}</h1>
            ${doctorName ? `<div style="font-size: 12px; color: #2563eb; font-weight: 700;">${doctorName}</div>` : ''}
            ${facilityAddress ? `<div style="font-size: 11px; color: #64748b;">${facilityAddress}</div>` : ''}
          </div>
        </div>
        <div style="text-align: left; font-size: 11px; color: #64748b;">
          <div><strong>تاريخ الإصدار:</strong> ${printDate}</div>
          ${facilityPhone ? `<div><strong>الهاتف:</strong> ${facilityPhone}</div>` : ''}
          <div style="margin-top: 4px; display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px;">
            نسخة رسمية معتمدة
          </div>
        </div>
      </div>

      <!-- Report Title -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 800; color: #0f172a; text-decoration: underline; text-underline-offset: 6px;">
          ${title}
        </h2>
        <p style="margin: 0; font-size: 12px; color: #64748b;">${subtitle}</p>
      </div>

      <!-- Summary Stats -->
      ${summaryHtml}

      <!-- Main Data Table -->
      <table>
        ${tableHeaderHtml}
        ${tableBodyHtml}
      </table>

      <!-- Footer & Signatures -->
      <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="font-size: 11px; color: #64748b; max-width: 60%;">
          <p style="margin: 0 0 4px 0;"><strong>ملاحظات:</strong> ${footerNotes}</p>
          <p style="margin: 0; font-size: 10px; color: #94a3b8;">شامل للحلول الطبية الذكية • نظام الإدارة المتكامل</p>
        </div>
        <div style="text-align: center; width: 180px;">
          <div style="font-size: 11px; font-weight: 700; margin-bottom: 40px;">توقيع المسؤول / الختم</div>
          <div style="border-top: 1px dashed #94a3b8; width: 100%;"></div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Direct PDF Export Helper - Opens window ready to print/save to PDF
 */
export function exportToPdf(options: PrintReportOptions) {
  printReport({
    ...options,
    subtitle: `${options.subtitle || ''} (مستند PDF معتمد)`
  });
}
