// SMS/WhatsApp Notification Service
// Manages SMS and WhatsApp message preferences and sending

export type NotificationMethod = "email" | "sms" | "whatsapp";
export type MessageType = "booking_confirmation" | "price_alert" | "reminder" | "promotion";

export interface SMSNotification {
  id: string;
  phoneNumber: string;
  message: string;
  messageType: MessageType;
  method: NotificationMethod;
  sentAt: string;
  status: "pending" | "sent" | "failed" | "delivered";
  bookingId?: string;
}

export interface UserNotificationPreferences {
  phoneNumber: string;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  notificationTypes: {
    bookingConfirmation: NotificationMethod[];
    priceAlerts: NotificationMethod[];
    reminders: NotificationMethod[];
    promotions: NotificationMethod[];
  };
  lastUpdated: string;
}

const NOTIFICATIONS_STORAGE_KEY = "nfa_sms_notifications";
const PREFERENCES_STORAGE_KEY = "nfa_notification_preferences";
const MAX_NOTIFICATIONS = 100;

/**
 * Generate unique notification ID
 */
const generateNotificationId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate phone number format (basic validation for Indian numbers)
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Accept formats like +91 9876543210, 9876543210, 09876543210
  const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ""));
};

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.startsWith("91")) {
    return "+91" + cleaned.slice(-10);
  }
  return "+91" + cleaned.slice(-10);
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = (): UserNotificationPreferences | null => {
  try {
    const data = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return null;
  }
};

/**
 * Save user notification preferences
 */
export const saveNotificationPreferences = (
  phoneNumber: string,
  preferences: Partial<UserNotificationPreferences>
): UserNotificationPreferences | null => {
  try {
    if (!validatePhoneNumber(phoneNumber)) {
      console.warn("Invalid phone number");
      return null;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const newPreferences: UserNotificationPreferences = {
      phoneNumber: formattedPhone,
      smsEnabled: preferences.smsEnabled ?? true,
      whatsappEnabled: preferences.whatsappEnabled ?? true,
      notificationTypes: preferences.notificationTypes || {
        bookingConfirmation: ["email", "sms"],
        priceAlerts: ["email", "sms"],
        reminders: ["sms"],
        promotions: ["email"],
      },
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));
    return newPreferences;
  } catch (error) {
    console.error("Failed to save notification preferences:", error);
    return null;
  }
};

/**
 * Add an SMS/WhatsApp notification (simulated send)
 */
export const sendNotification = (
  phoneNumber: string,
  message: string,
  messageType: MessageType,
  method: NotificationMethod,
  bookingId?: string
): SMSNotification | null => {
  try {
    if (!validatePhoneNumber(phoneNumber)) {
      console.warn("Invalid phone number");
      return null;
    }

    const notifications = getAllNotifications();

    if (notifications.length >= MAX_NOTIFICATIONS) {
      console.warn("Maximum notifications limit reached");
      return null;
    }

    const newNotification: SMSNotification = {
      id: generateNotificationId(),
      phoneNumber: formatPhoneNumber(phoneNumber),
      message,
      messageType,
      method,
      sentAt: new Date().toISOString(),
      status: "sent", // In real app, would be "pending" then "sent/failed"
      bookingId,
    };

    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    return newNotification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
};

/**
 * Get all notifications
 */
export const getAllNotifications = (): SMSNotification[] => {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
};

/**
 * Get notifications by status
 */
export const getNotificationsByStatus = (
  status: SMSNotification["status"]
): SMSNotification[] => {
  return getAllNotifications().filter((n) => n.status === status);
};

/**
 * Get notifications for a booking
 */
export const getBookingNotifications = (bookingId: string): SMSNotification[] => {
  return getAllNotifications().filter((n) => n.bookingId === bookingId);
};

/**
 * Generate booking confirmation message
 */
export const generateBookingConfirmationMessage = (
  packageTitle: string,
  bookingId: string,
  travelers: number
): string => {
  return `Hi! Your booking is confirmed. Package: ${packageTitle} (${travelers} traveler${travelers > 1 ? "s" : ""}). Booking ID: ${bookingId}. Check your email for details.`;
};

/**
 * Generate price alert message
 */
export const generatePriceAlertMessage = (
  packageTitle: string,
  oldPrice: number,
  newPrice: number,
  savings: number
): string => {
  return `Great news! ${packageTitle} price dropped to ₹${newPrice}. You save ₹${savings}! Book now: [link]`;
};

/**
 * Generate reminder message
 */
export const generateReminderMessage = (
  packageTitle: string,
  daysUntilDeparture: number
): string => {
  return `Reminder: Your ${packageTitle} trip departs in ${daysUntilDeparture} days. Confirm final details and pack your bags!`;
};

/**
 * Mark notification as delivered
 */
export const markAsDelivered = (notificationId: string): boolean => {
  try {
    const notifications = getAllNotifications();
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification) return false;

    notification.status = "delivered";
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error("Failed to mark notification as delivered:", error);
    return false;
  }
};

/**
 * Clear old notifications (older than 30 days)
 */
export const clearOldNotifications = (): number => {
  try {
    const notifications = getAllNotifications();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = notifications.filter(
      (n) => new Date(n.sentAt) > thirtyDaysAgo
    );

    const removed = notifications.length - filtered.length;
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
    return removed;
  } catch (error) {
    console.error("Failed to clear old notifications:", error);
    return 0;
  }
};

/**
 * Get notification stats
 */
export const getNotificationStats = () => {
  const notifications = getAllNotifications();
  return {
    total: notifications.length,
    sent: notifications.filter((n) => n.status === "sent").length,
    delivered: notifications.filter((n) => n.status === "delivered").length,
    failed: notifications.filter((n) => n.status === "failed").length,
    pending: notifications.filter((n) => n.status === "pending").length,
  };
};
