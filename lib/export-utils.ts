import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Batchmate } from './types';

export function exportToExcel(data: Batchmate[], filename: string = 'batchmates-report') {
  try {
    // Prepare data for Excel
    const excelData = data.map(batchmate => ({
      'Full Name': batchmate.fullName || '',
      'Calling Name': batchmate.callingName || '',
      'Nick Name': batchmate.nickName || '',
      'Email': batchmate.email || '',
      'WhatsApp Mobile': batchmate.whatsappMobile || '',
      'Mobile': batchmate.mobile || '',
      'Field': batchmate.field || '',
      'Country': batchmate.country || '',
      'Address': batchmate.address || '',
      'Working Place': batchmate.workingPlace || '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 30 }, // Full Name
      { wch: 20 }, // Calling Name
      { wch: 15 }, // Nick Name
      { wch: 30 }, // Email
      { wch: 18 }, // WhatsApp
      { wch: 18 }, // Mobile
      { wch: 25 }, // Field
      { wch: 20 }, // Country
      { wch: 35 }, // Address
      { wch: 30 }, // Working Place
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Batchmates');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fullFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

export function exportToPDF(data: Batchmate[], filename: string = 'batchmates-report') {
  try {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.text('93/94 Batch of University of Moratuwa', 14, 22);
    
    doc.setFontSize(12);
    doc.text('Batchmates Report', 14, 30);
    
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString();
    doc.text(`Generated on: ${date}`, 14, 36);
    doc.text(`Total Records: ${data.length}`, 14, 42);

    // Prepare table data
    const tableData = data.map(batchmate => [
      batchmate.fullName || '',
      batchmate.callingName || '',
      batchmate.email || '',
      batchmate.whatsappMobile || '',
      batchmate.field || '',
      batchmate.country || '',
      batchmate.workingPlace || '',
    ]);

    // Add table
    autoTable(doc, {
      startY: 48,
      head: [['Full Name', 'Calling Name', 'Email', 'WhatsApp', 'Field', 'Country', 'Workplace']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 48 },
    });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.pdf`;

    // Download file
    doc.save(fullFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}
