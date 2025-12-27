import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Batchmate } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Export field-wise name lists to Excel
 * Each field is in a separate sheet, alphabetically sorted
 */
export async function exportFieldwiseNameLists() {
  try {
    const response = await fetch(`${API_URL}/batchmates/export/fieldwise`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download fieldwise export');
    }

    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Fieldwise_Name_Lists_${new Date().toISOString().split('T')[0]}.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading fieldwise export:', error);
    return false;
  }
}

/**
 * Export raffle cut sheet to Excel
 * Single column with bordered cells for printing and cutting
 */
export async function exportRaffleCutSheet() {
  try {
    const response = await fetch(`${API_URL}/batchmates/export/raffle-cut-sheet`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download raffle cut sheet');
    }

    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `Raffle_Cut_Sheet_${new Date().toISOString().split('T')[0]}.xlsx`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading raffle cut sheet:', error);
    return false;
  }
}

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
      'Phone Confirmation': batchmate.phoneConfirmation || '',
      'Attendance': batchmate.attendance || '',
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
      { wch: 18 }, // Phone Confirmation
      { wch: 15 }, // Attendance
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
      batchmate.phoneConfirmation || '',
      batchmate.attendance || '',
    ]);

    // Add table
    autoTable(doc, {
      startY: 48,
      head: [['Full Name', 'Calling Name', 'Email', 'WhatsApp', 'Field', 'Country', 'Workplace', 'Phone Conf.', 'Attendance']],
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
