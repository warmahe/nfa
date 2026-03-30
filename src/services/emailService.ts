// Email Service for sending notifications
// In production, this would integrate with SendGrid, AWS SES, or similar SMTP service

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  type: 'booking' | 'confirmation' | 'reminder' | 'itinerary';
  body: string;
  htmlBody: string;
  sentAt: string;
  status: 'sent' | 'failed';
  bookingId?: string;
}

const STORAGE_KEY = 'nfa_email_notifications';

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = (
  email: string,
  bookingId: string,
  packageTitle: string,
  destination: string,
  price: string,
  checkoutDate: string,
  travelers: number
): EmailNotification => {
  const emailId = `${bookingId}_${Date.now()}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0F766E; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; border: 1px solid #e5e7eb; margin: 20px 0; }
          .details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .button { display: inline-block; background: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for booking with No Fixed Address Travel! Your adventure awaits. Here are your booking details:</p>
            
            <div class="details">
              <p><strong>Booking Reference:</strong> ${bookingId}</p>
              <p><strong>Package:</strong> ${packageTitle}</p>
              <p><strong>Destination:</strong> ${destination}</p>
              <p><strong>Total Price:</strong> ${price}</p>
              <p><strong>Departure Date:</strong> ${checkoutDate}</p>
              <p><strong>Number of Travelers:</strong> ${travelers}</p>
            </div>
            
            <p><strong>What Happens Next?</strong></p>
            <ul>
              <li>You will receive your detailed itinerary within 24 hours</li>
              <li>Our team will contact you to confirm travel requirements</li>
              <li>Travel insurance documents will be emailed separately</li>
              <li>Access your booking anytime from your dashboard</li>
            </ul>
            
            <p>
              <a href="https://nofixedaddress.travel/dashboard" class="button">View Your Booking</a>
            </p>
            
            <p>Questions? Our 24/7 support team is here to help:</p>
            <ul>
              <li>Email: support@nofixedaddress.travel</li>
              <li>WhatsApp: +91-XXXXXXXXXX</li>
              <li>Phone: +91-XXXXXXXXXX</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 No Fixed Address. All rights reserved.<br/>
            This is a confirmation email. Please keep it for your records.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const textBody = `
BOOKING CONFIRMED!

Hello,

Thank you for booking with No Fixed Address Travel!

Booking Details:
- Reference: ${bookingId}
- Package: ${packageTitle}
- Destination: ${destination}
- Price: ${price}
- Departure: ${checkoutDate}
- Travelers: ${travelers}

What Happens Next:
1. Detailed itinerary within 24 hours
2. Our team will contact you to confirm travel requirements
3. Travel insurance documents will be emailed separately
4. Access your booking anytime from your dashboard

Questions? Contact us:
- Email: support@nofixedaddress.travel
- WhatsApp: +91-XXXXXXXXXX
- Phone: +91-XXXXXXXXXX

© 2026 No Fixed Address. All rights reserved.
  `;
  
  const notification: EmailNotification = {
    id: emailId,
    to: email,
    subject: `Booking Confirmed - ${packageTitle} (${bookingId})`,
    type: 'booking',
    body: textBody,
    htmlBody: htmlBody,
    sentAt: new Date().toISOString(),
    status: 'sent',
    bookingId: bookingId
  };
  
  // Store in localStorage
  const notifications = getAllEmailNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  // Log to console for debugging
  console.log('📧 Email Sent:', {
    to: email,
    subject: notification.subject,
    bookingId: bookingId,
    timestamp: new Date().toLocaleString()
  });
  
  return notification;
};

/**
 * Send itinerary email (after 24 hours)
 */
export const sendItineraryEmail = (
  email: string,
  bookingId: string,
  packageTitle: string,
  itineraryData: string
): EmailNotification => {
  const emailId = `${bookingId}_itinerary_${Date.now()}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0F766E; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; border: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Your Journey Awaits!</h1>
          </div>
          <div class="content">
            <p>Your detailed itinerary for <strong>${packageTitle}</strong> is ready.</p>
            <p>Reference: <strong>${bookingId}</strong></p>
            <p>${itineraryData}</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const notification: EmailNotification = {
    id: emailId,
    to: email,
    subject: `Your Detailed Itinerary - ${packageTitle}`,
    type: 'itinerary',
    body: `Your itinerary for ${packageTitle} is attached.`,
    htmlBody: htmlBody,
    sentAt: new Date().toISOString(),
    status: 'sent',
    bookingId: bookingId
  };
  
  const notifications = getAllEmailNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  console.log('📧 Itinerary Email Sent:', {
    to: email,
    bookingId: bookingId
  });
  
  return notification;
};

/**
 * Send reminder email
 */
export const sendReminderEmail = (
  email: string,
  bookingId: string,
  packageTitle: string,
  departureDate: string
): EmailNotification => {
  const emailId = `${bookingId}_reminder_${Date.now()}`;
  
  const notification: EmailNotification = {
    id: emailId,
    to: email,
    subject: `Travel Reminder - ${packageTitle} in 7 days`,
    type: 'reminder',
    body: `Your adventure to ${packageTitle} is starting on ${departureDate}. Final preparations checklist attached.`,
    htmlBody: `<p>Your adventure is starting soon!</p>`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    bookingId: bookingId
  };
  
  const notifications = getAllEmailNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  return notification;
};

/**
 * Get all email notifications
 */
export const getAllEmailNotifications = (): EmailNotification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Get notifications for a specific booking
 */
export const getBookingEmails = (bookingId: string): EmailNotification[] => {
  return getAllEmailNotifications().filter(n => n.bookingId === bookingId);
};

/**
 * Get unread email count
 */
export const getUnreadEmailCount = (): number => {
  return getAllEmailNotifications().length;
};

/**
 * Clear all notifications (for testing)
 */
export const clearAllNotifications = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('✓ All email notifications cleared');
};
