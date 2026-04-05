import React, { useState, useEffect } from "react";
import { Bell, MessageSquare, Phone, Check, X, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  validatePhoneNumber,
  formatPhoneNumber,
  UserNotificationPreferences,
  NotificationMethod,
} from '../../services/smsService';

interface NotificationPreferencesProps {
  onSaved?: (preferences: UserNotificationPreferences) => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSaved,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [notificationTypes, setNotificationTypes] = useState({
    bookingConfirmation: ["email", "sms"] as NotificationMethod[],
    priceAlerts: ["email", "sms"] as NotificationMethod[],
    reminders: ["sms"] as NotificationMethod[],
    promotions: ["email"] as NotificationMethod[],
  });

  useEffect(() => {
    const preferences = getNotificationPreferences();
    if (preferences) {
      setPhoneNumber(preferences.phoneNumber);
      setSmsEnabled(preferences.smsEnabled);
      setWhatsappEnabled(preferences.whatsappEnabled);
      setNotificationTypes(preferences.notificationTypes);
    }
    setIsLoading(false);
  }, []);

  const handleSave = () => {
    setError("");
    setSuccess(false);

    // Validate phone number
    if (phoneNumber.trim() && !validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number (10 digits starting with 6-9)");
      return;
    }

    if (!phoneNumber.trim() && (smsEnabled || whatsappEnabled)) {
      setError("Phone number is required for SMS/WhatsApp notifications");
      return;
    }

    const result = saveNotificationPreferences(phoneNumber, {
      smsEnabled,
      whatsappEnabled,
      notificationTypes,
    });

    if (result) {
      setSuccess(true);
      onSaved?.(result);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError("Failed to save preferences");
    }
  };

  const toggleNotificationMethod = (
    type: keyof typeof notificationTypes,
    method: NotificationMethod
  ) => {
    setNotificationTypes((prev) => {
      const current = [...prev[type]];
      const index = current.indexOf(method);

      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(method);
      }

      return {
        ...prev,
        [type]: current,
      };
    });
  };

  const hasNotificationMethod = (
    type: keyof typeof notificationTypes,
    method: NotificationMethod
  ): boolean => {
    return notificationTypes[type].includes(method);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading preferences...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-full">
          <Bell size={24} className="text-blue-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Notification Preferences
          </h2>
          <p className="text-gray-600 text-sm">
            Manage how you receive booking confirmations and alerts
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3"
        >
          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-900">Preferences Saved!</p>
            <p className="text-sm text-green-800">
              Your notification settings have been updated.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Phone Number Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Phone size={20} className="text-blue-600" />
          Phone Number
        </h3>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError("");
              }}
              placeholder="Enter your phone number (10 digits)"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 font-medium"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Save
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2">
          💡 Format: 10 digits (e.g., 9876543210) or with country code (+91 9876543210)
        </p>
      </div>

      {/* Notification Methods */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          Notification Methods
        </h3>

        <div className="space-y-4">
          {/* SMS Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="font-bold text-gray-900">SMS Messages</p>
              <p className="text-sm text-gray-600">
                Receive notifications via SMS
              </p>
            </div>
            <button
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                smsEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  smsEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* WhatsApp Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="font-bold text-gray-900">WhatsApp Messages</p>
              <p className="text-sm text-gray-600">
                Receive notifications via WhatsApp
              </p>
            </div>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                whatsappEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  whatsappEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          What to Notify Me About
        </h3>

        <div className="space-y-6">
          {/* Booking Confirmation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-bold text-gray-900 mb-3">
              ✓ Booking Confirmations
            </p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod(
                    "bookingConfirmation",
                    "email"
                  )}
                  onChange={() =>
                    toggleNotificationMethod("bookingConfirmation", "email")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("bookingConfirmation", "sms")}
                  onChange={() =>
                    toggleNotificationMethod("bookingConfirmation", "sms")
                  }
                  disabled={!smsEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod(
                    "bookingConfirmation",
                    "whatsapp"
                  )}
                  onChange={() =>
                    toggleNotificationMethod("bookingConfirmation", "whatsapp")
                  }
                  disabled={!whatsappEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp
                </span>
              </label>
            </div>
          </div>

          {/* Price Alerts */}
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="font-bold text-gray-900 mb-3">💰 Price Alerts</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("priceAlerts", "email")}
                  onChange={() =>
                    toggleNotificationMethod("priceAlerts", "email")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("priceAlerts", "sms")}
                  onChange={() =>
                    toggleNotificationMethod("priceAlerts", "sms")
                  }
                  disabled={!smsEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("priceAlerts", "whatsapp")}
                  onChange={() =>
                    toggleNotificationMethod("priceAlerts", "whatsapp")
                  }
                  disabled={!whatsappEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp
                </span>
              </label>
            </div>
          </div>

          {/* Reminders */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="font-bold text-gray-900 mb-3">🔔 Reminders</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("reminders", "email")}
                  onChange={() =>
                    toggleNotificationMethod("reminders", "email")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("reminders", "sms")}
                  onChange={() =>
                    toggleNotificationMethod("reminders", "sms")
                  }
                  disabled={!smsEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("reminders", "whatsapp")}
                  onChange={() =>
                    toggleNotificationMethod("reminders", "whatsapp")
                  }
                  disabled={!whatsappEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp
                </span>
              </label>
            </div>
          </div>

          {/* Promotions */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-bold text-gray-900 mb-3">✨ Promotions</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("promotions", "email")}
                  onChange={() =>
                    toggleNotificationMethod("promotions", "email")
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("promotions", "sms")}
                  onChange={() =>
                    toggleNotificationMethod("promotions", "sms")
                  }
                  disabled={!smsEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">SMS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotificationMethod("promotions", "whatsapp")}
                  onChange={() =>
                    toggleNotificationMethod("promotions", "whatsapp")
                  }
                  disabled={!whatsappEnabled}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-sm font-medium text-gray-700">
                  WhatsApp
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-soft"
      >
        Save Preferences
      </button>
    </div>
  );
};
