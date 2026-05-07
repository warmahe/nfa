import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface BookingInvoice {
  bookingId: string;
  packageTitle: string;
  destination: string;
  travelDate: string;
  travelers: string;
  travelersCount: number;
  basePrice: string;
  insurance: boolean;
  insurancePrice?: string;
  serviceFee: string;
  totalPrice: string;
  leadTravelerEmail: string;
  leadTravelerPhone?: string;
  bookingDate: string;
}

/**
 * Generate a professional PDF invoice for a booking confirmation
 */
export const generateBookingPDF = async (invoiceData: BookingInvoice, filename: string = 'booking-confirmation.pdf') => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Company Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 118, 110); // Teal color
    doc.text('NO FIXED ADDRESS', 20, yPosition);
    
    yPosition += 8;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Your Gateway to Unforgettable Adventures', 20, yPosition);

    // Booking Confirmation Title
    yPosition += 15;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(50, 50, 50);
    doc.text('BOOKING CONFIRMATION', 20, yPosition);

    // Booking Reference Box
    yPosition += 12;
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.5);
    doc.rect(20, yPosition, pageWidth - 40, 25);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('BOOKING REFERENCE', 25, yPosition + 8);
    
    doc.setFont('Courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(invoiceData.bookingId, 25, yPosition + 18);

    // Section 1: Trip Details
    yPosition += 35;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text('TRIP DETAILS', 20, yPosition);

    yPosition += 10;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const tripDetails = [
      [`Package:`, invoiceData.packageTitle],
      [`Destination:`, invoiceData.destination],
      [`Travel Date:`, invoiceData.travelDate],
      [`Number of Travelers:`, invoiceData.travelersCount.toString()],
      [`Travelers:`, invoiceData.travelers],
      [`Booking Date:`, invoiceData.bookingDate],
    ];

    tripDetails.forEach(([label, value]) => {
      doc.text(label, 25, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 7;
    });

    // Section 2: Pricing Breakdown
    yPosition += 5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text('PRICING BREAKDOWN', 20, yPosition);

    yPosition += 10;
    const pricingDetails = [
      [`Base Price per Person:`, invoiceData.basePrice],
      [`Number of Travelers:`, `${invoiceData.travelersCount} x`],
      [`Subtotal:`, ''],
      ...(invoiceData.insurance ? [[`Travel Insurance:`, invoiceData.insurancePrice || '']] : []),
      [`Service Fee:`, invoiceData.serviceFee],
    ];

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    pricingDetails.forEach(([label, value]) => {
      if (label === 'Subtotal:') {
        doc.setFont('Helvetica', 'bold');
        const subtotal = parseInt(invoiceData.basePrice.replace(/[^0-9]/g, '')) * invoiceData.travelersCount;
        doc.text(label, 25, yPosition);
        doc.text(`₹${subtotal.toLocaleString('en-IN')}`, 130, yPosition);
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.text(label, 25, yPosition);
        doc.text(value, 130, yPosition);
      }
      yPosition += 7;
    });

    // Total Price Box
    yPosition += 5;
    doc.setFont('Helvetica', 'bold');
    doc.setFillColor(240, 248, 245); // Light teal background
    doc.rect(20, yPosition, pageWidth - 40, 12, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text('TOTAL AMOUNT', 25, yPosition + 8);
    
    doc.setFontSize(14);
    doc.text(invoiceData.totalPrice, 130, yPosition + 8);

    // Section 3: Contact Information
    yPosition += 20;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text('LEAD TRAVELER CONTACT', 20, yPosition);

    yPosition += 10;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`Email: ${invoiceData.leadTravelerEmail}`, 25, yPosition);
    
    if (invoiceData.leadTravelerPhone) {
      yPosition += 7;
      doc.text(`Phone: ${invoiceData.leadTravelerPhone}`, 25, yPosition);
    }

    // Footer
    yPosition = pageHeight - 30;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Next Steps:', 20, yPosition);
    yPosition += 6;
    doc.setFontSize(8);
    doc.text('• You will receive a detailed itinerary within 24 hours', 22, yPosition);
    yPosition += 5;
    doc.text('• Our team will contact you for final confirmations', 22, yPosition);
    yPosition += 5;
    doc.text('• Download travel documents from your dashboard', 22, yPosition);
    yPosition += 5;
    doc.text('• Travel insurance coverage begins from your travel date', 22, yPosition);

    // Bottom border
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 5, pageWidth - 20, pageHeight - 5);

    // Save the PDF
    doc.save(filename);
    console.log(`✓ PDF generated successfully: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF from HTML element
 */
export const generatePDFFromElement = async (elementId: string, filename: string = 'document.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    console.log(`✓ PDF generated from element: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF from element:', error);
    throw error;
  }
};

/**
 * Download booking confirmation as PDF
 */
export const downloadBookingConfirmation = (invoiceData: BookingInvoice) => {
  const filename = `NFA-Booking-${invoiceData.bookingId.split('-')[1]}.pdf`;
  generateBookingPDF(invoiceData, filename);
};
