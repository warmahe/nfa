// Price Alert Service
// Manages user price alerts with localStorage persistence

export type AlertType = "price_drop" | "availability";
export type AlertStatus = "watching" | "price_dropped" | "target_reached";

export interface PriceAlert {
  alertId: string;
  packageId: string;
  packageTitle: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  notified: boolean;
  status: AlertStatus;
  alertType: AlertType;
  destination: string;
}

const STORAGE_KEY = "nfa_price_alerts";
const MAX_ALERTS = 20;

/**
 * Generate unique alert ID
 */
const generateAlertId = (): string => {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse price string to number (e.g., "₹5,299" -> 5299)
 */
const parsePrice = (priceStr: string): number => {
  const numStr = priceStr.replace(/[^0-9]/g, "");
  return parseInt(numStr) || 0;
};

/**
 * Get all price alerts
 */
export const getAlerts = (): PriceAlert[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get price alerts:", error);
    return [];
  }
};

/**
 * Create a new price alert
 * Returns the created alert or null if max limit reached
 */
export const createAlert = (
  packageId: string,
  packageTitle: string,
  destination: string,
  currentPrice: string,
  targetPrice: number
): PriceAlert | null => {
  try {
    const alerts = getAlerts();

    // Check max limit
    if (alerts.length >= MAX_ALERTS) {
      console.warn("Maximum alerts limit reached");
      return null;
    }

    const parsedCurrentPrice = parsePrice(currentPrice);

    // Validate target price
    if (targetPrice >= parsedCurrentPrice) {
      console.warn("Target price must be lower than current price");
      return null;
    }

    const newAlert: PriceAlert = {
      alertId: generateAlertId(),
      packageId,
      packageTitle,
      destination,
      currentPrice: parsedCurrentPrice,
      targetPrice,
      createdAt: new Date().toISOString(),
      notified: false,
      status: "watching",
      alertType: "price_drop",
    };

    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    return newAlert;
  } catch (error) {
    console.error("Failed to create price alert:", error);
    return null;
  }
};

/**
 * Get alerts for a specific package
 */
export const getAlertsByPackage = (packageId: string): PriceAlert[] => {
  return getAlerts().filter((alert) => alert.packageId === packageId);
};

/**
 * Delete a specific alert
 */
export const deleteAlert = (alertId: string): boolean => {
  try {
    const alerts = getAlerts();
    const filtered = alerts.filter((alert) => alert.alertId !== alertId);
    if (filtered.length < alerts.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete alert:", error);
    return false;
  }
};

/**
 * Update alert target price
 */
export const updateAlertTargetPrice = (
  alertId: string,
  newTargetPrice: number
): boolean => {
  try {
    const alerts = getAlerts();
    const alert = alerts.find((a) => a.alertId === alertId);

    if (!alert) return false;

    // Validate new target price
    if (newTargetPrice >= alert.currentPrice) {
      console.warn("Target price must be lower than current price");
      return false;
    }

    alert.targetPrice = newTargetPrice;
    alert.status = "watching"; // Reset status when price is updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    return true;
  } catch (error) {
    console.error("Failed to update alert:", error);
    return false;
  }
};

/**
 * Check for price drops (simulated - in real app would call API)
 * Returns alerts where price dropped below target
 */
export const checkPriceDrops = (): PriceAlert[] => {
  try {
    const alerts = getAlerts();

    // Simulate price check (in real app, this would fetch from API)
    // For now, we'll mark some alerts as price_dropped if not already notified
    return alerts.filter((alert) => {
      // Random chance of price drop for demo purposes
      if (!alert.notified && Math.random() > 0.7) {
        return alert.currentPrice > alert.targetPrice;
      }
      return false;
    });
  } catch (error) {
    console.error("Failed to check price drops:", error);
    return [];
  }
};

/**
 * Mark alert as notified
 */
export const markAsNotified = (alertId: string): boolean => {
  try {
    const alerts = getAlerts();
    const alert = alerts.find((a) => a.alertId === alertId);

    if (!alert) return false;

    alert.notified = true;
    alert.status = "price_dropped";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    return true;
  } catch (error) {
    console.error("Failed to mark alert as notified:", error);
    return false;
  }
};

/**
 * Get unread alerts (not yet notified)
 */
export const getUnreadAlerts = (): PriceAlert[] => {
  return getAlerts().filter((alert) => !alert.notified);
};

/**
 * Get count of unread alerts
 */
export const getUnreadAlertCount = (): number => {
  return getUnreadAlerts().length;
};

/**
 * Clear all alerts
 */
export const clearAllAlerts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear alerts:", error);
  }
};

/**
 * Check if alert exists for package
 */
export const hasAlertForPackage = (packageId: string): boolean => {
  return getAlerts().some((alert) => alert.packageId === packageId);
};

/**
 * Get max allowed alerts
 */
export const getMaxAlerts = (): number => {
  return MAX_ALERTS;
};
