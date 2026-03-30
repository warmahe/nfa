import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { createAlert, hasAlertForPackage, deleteAlert, getAlertsByPackage } from "../services/priceAlertService";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageTitle: string;
  destination: string;
  currentPrice: string;
  onAlertCreated?: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  packageId,
  packageTitle,
  destination,
  currentPrice,
  onAlertCreated,
}) => {
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasExistingAlert, setHasExistingAlert] = useState(false);

  const currentPriceNum = parseInt(currentPrice.replace(/[^0-9]/g, "")) || 0;
  const suggestedPrice = Math.round(currentPriceNum * 0.9); // 10% discount

  useEffect(() => {
    if (isOpen) {
      setTargetPrice(suggestedPrice.toString());
      setError("");
      setSuccess(false);
      setHasExistingAlert(hasAlertForPackage(packageId));
    }
  }, [isOpen, packageId, suggestedPrice]);

  const handleCreateAlert = () => {
    setError("");
    const targetNum = parseInt(targetPrice) || 0;

    // Validation
    if (!targetPrice || targetNum === 0) {
      setError("Please enter a valid target price");
      return;
    }

    if (targetNum >= currentPriceNum) {
      setError("Target price must be lower than current price");
      return;
    }

    const alert = createAlert(
      packageId,
      packageTitle,
      destination,
      currentPrice,
      targetNum
    );

    if (alert) {
      setSuccess(true);
      setHasExistingAlert(true);
      onAlertCreated?.();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError("Failed to create alert. You may have reached the limit.");
    }
  };

  const handleRemoveAlert = () => {
    const alerts = getAlertsByPackage(packageId);
    if (alerts.length > 0) {
      deleteAlert(alerts[0].alertId);
      setHasExistingAlert(false);
      onAlertCreated?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-orange-50">
          <h2 className="text-2xl font-bold text-gray-900">Price Alert</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Package Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
              Package
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {packageTitle}
            </h3>
            <p className="text-sm text-gray-600">Destination: {destination}</p>
          </div>

          {/* Current Price Display */}
          <div className="mb-6">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
              Current Price
            </p>
            <div className="text-3xl font-bold text-teal-700">{currentPrice}</div>
          </div>

          {/* Success State */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-green-900">Alert Created!</p>
                <p className="text-sm text-green-800">
                  We'll notify you when the price drops below ₹{targetPrice}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Target Price Input */}
          {!success && (
            <div className="mb-6">
              <label className="block text-xs text-gray-600 font-semibold uppercase mb-3">
                Target Price (Alert when price drops below)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-600 font-bold text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => {
                    setTargetPrice(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-lg font-bold text-gray-900 transition-colors"
                  placeholder="Enter target price"
                />
              </div>

              {/* Suggestion */}
              <div className="mt-2 text-xs text-gray-600">
                <p>
                  💡 Suggested price (10% off):{" "}
                  <span className="font-bold text-teal-600">₹{suggestedPrice}</span>
                </p>
              </div>

              {/* Price Difference */}
              {targetPrice && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                  <p className="text-gray-900">
                    You'll save{" "}
                    <span className="font-bold text-green-600">
                      ₹{currentPriceNum - parseInt(targetPrice)}
                    </span>{" "}
                    compared to current price
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-200 font-bold rounded-lg transition-colors"
          >
            {success ? "Close" : "Cancel"}
          </button>

          {!success && (
            <>
              {hasExistingAlert ? (
                <button
                  onClick={handleRemoveAlert}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-lg transition-colors"
                >
                  Remove Alert
                </button>
              ) : (
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold rounded-lg transition-colors transform hover:scale-105"
                >
                  Create Alert
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
