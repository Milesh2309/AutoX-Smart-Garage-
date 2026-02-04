import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF invoice
 * @param {Object} billingData - Billing record data
 * @param {Object} customerData - Customer information
 * @returns {jsPDF} - PDF document
 */
export const generateInvoicePDF = (billingData, customerData = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Color scheme
  const primaryColor = [41, 128, 185]; // Blue
  const grayColor = [52, 73, 94]; // Dark gray
  const lightGray = [236, 240, 241]; // Light gray

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company name and logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('GARAGE SERVICES', margin, 20);
  doc.setFontSize(10);
  doc.text('Professional Auto Care & Maintenance', margin, 28);

  // Reset text color
  doc.setTextColor(...grayColor);

  // Invoice title and number
  doc.setFontSize(16);
  doc.text('INVOICE', pageWidth - margin - 40, 20);
  doc.setFontSize(10);
  doc.text(`Invoice #: ${billingData.invoiceNumber}`, pageWidth - margin - 40, 28);

  // Invoice details
  const invoiceDetailsY = 50;
  doc.setFontSize(9);
  doc.text(`Date: ${new Date(billingData.paymentDate).toLocaleDateString()}`, margin, invoiceDetailsY);
  doc.text(
    `Status: ${billingData.paymentStatus.toUpperCase()}`,
    pageWidth / 2,
    invoiceDetailsY
  );

  // Customer information
  const customerY = 65;
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('CUSTOMER INFORMATION', margin, customerY);

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(`Name: ${customerData.name || 'N/A'}`, margin, customerY + 8);
  doc.text(`Email: ${customerData.email || 'N/A'}`, margin, customerY + 14);
  doc.text(`Phone: ${customerData.phone || 'N/A'}`, margin, customerY + 20);
  doc.text(`Address: ${customerData.address || 'N/A'}`, margin, customerY + 26);

  // Service details table
  const tableY = 105;
  autoTable(doc, {
    startY: tableY,
    head: [['Service', 'Amount', 'Tax', 'Total']],
    body: [
      [
        billingData.serviceName || 'Service',
        `₹${billingData.amount}`,
        `₹${billingData.tax || 0}`,
        `₹${billingData.totalAmount}`,
      ],
    ],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    margin: margin,
  });

  // Total summary
  const summaryY = doc.internal.pageSize.getHeight() - 100;
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('PAYMENT SUMMARY', pageWidth - margin - 50, summaryY);

  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(
    `Subtotal: ₹${billingData.amount}`,
    pageWidth - margin - 50,
    summaryY + 8
  );
  doc.text(
    `Tax: ₹${billingData.tax || 0}`,
    pageWidth - margin - 50,
    summaryY + 14
  );

  // Total box
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth - margin - 60, summaryY + 20, 55, 12, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFontStyle('bold');
  doc.text(
    `Total: ₹${billingData.totalAmount}`,
    pageWidth - margin - 58,
    summaryY + 27
  );

  // Payment information
  const paymentY = summaryY + 40;
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text('PAYMENT METHOD', margin, paymentY);
  doc.text(`Method: ${billingData.paymentMethod || 'N/A'}`, margin, paymentY + 6);
  doc.text(`Transaction ID: ${billingData.transactionId}`, margin, paymentY + 12);

  // Refund information if applicable
  if (billingData.refundStatus !== 'none' && billingData.refundAmount > 0) {
    const refundY = paymentY + 25;
    doc.setTextColor(220, 53, 69); // Red
    doc.text('REFUND INFORMATION', margin, refundY);
    doc.setTextColor(...grayColor);
    doc.text(`Status: ${billingData.refundStatus}`, margin, refundY + 6);
    doc.text(`Amount: ₹${billingData.refundAmount}`, margin, refundY + 12);
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(189, 195, 199); // Light gray
  doc.text('Thank you for your business!', pageWidth / 2, footerY, {
    align: 'center',
  });
  doc.text(
    'For support, contact: support@garageservices.com',
    pageWidth / 2,
    footerY + 5,
    {
      align: 'center',
    }
  );

  return doc;
};

/**
 * Download invoice as PDF
 * @param {Object} billingData - Billing record data
 * @param {Object} customerData - Customer information
 */
export const downloadInvoicePDF = (billingData, customerData = {}) => {
  const doc = generateInvoicePDF(billingData, customerData);
  doc.save(`${billingData.invoiceNumber}.pdf`);
};

/**
 * Generate billing report PDF
 * @param {Array} records - Array of billing records
 * @param {Object} summary - Report summary data
 * @returns {jsPDF} - PDF document
 */
export const generateBillingReportPDF = (records, summary = {}) => {
  const doc = new jsPDF('l'); // Landscape
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const primaryColor = [41, 128, 185];
  const grayColor = [52, 73, 94];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('BILLING REPORT', margin, 15);

  // Summary
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    pageWidth - margin - 50,
    15
  );

  // Summary statistics
  const summaryY = 35;
  doc.setFillColor(236, 240, 241);
  doc.rect(margin, summaryY, pageWidth - 2 * margin, 20, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFontStyle('bold');
  doc.text(`Total Amount: ₹${summary.totalAmount || 0}`, margin + 5, summaryY + 7);
  doc.text(
    `Total Transactions: ${summary.totalTransactions || 0}`,
    pageWidth / 2 - 20,
    summaryY + 7
  );
  doc.text(
    `Completed: ${summary.completedPayments || 0}`,
    pageWidth - margin - 60,
    summaryY + 7
  );
  doc.text(
    `Total Refunds: ₹${summary.totalRefunds || 0}`,
    margin + 5,
    summaryY + 14
  );

  // Records table
  const tableY = summaryY + 25;
  const tableData = records.map((record) => [
    record.invoiceNumber,
    record.userId || 'N/A',
    record.serviceName,
    `₹${record.amount}`,
    record.paymentMethod,
    record.paymentStatus,
    new Date(record.paymentDate).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [
      [
        'Invoice #',
        'Customer ID',
        'Service',
        'Amount',
        'Method',
        'Status',
        'Date',
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: margin,
    columnStyles: {
      3: { halign: 'right' },
    },
  });

  return doc;
};

/**
 * Download billing report PDF
 * @param {Array} records - Array of billing records
 * @param {Object} summary - Report summary data
 */
export const downloadBillingReportPDF = (records, summary = {}) => {
  const doc = generateBillingReportPDF(records, summary);
  doc.save(`billing-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};
