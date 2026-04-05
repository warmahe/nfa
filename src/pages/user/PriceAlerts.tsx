import React, { useState, useEffect } from "react";
import { Bell, Trash2, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import {
  getAlerts,
  deleteAlert,
  updateAlertTargetPrice,
  PriceAlert,
} from '../../services/priceAlertService';

export const PriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [showNotification, setShowNotification] = useState("");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    const loadedAlerts = getAlerts();
    setAlerts(loadedAlerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId);
    loadAlerts();
    setShowNotification("Alert removed");
    setTimeout(() => setShowNotification(""), 3000);
  };

  const handleUpdatePrice = (alertId: string) => {
    const editNum = parseInt(editPrice) || 0;
    if (editNum > 0 && updateAlertTargetPrice(alertId, editNum)) {
      setEditingId(null);
      setEditPrice("");
      loadAlerts();
      setShowNotification("Alert updated successfully");
      setTimeout(() => setShowNotification(""), 3000);
    } else {
      setShowNotification("Failed to update alert");
      setTimeout(() => setShowNotification(""), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "watching":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            Watching
          </span>
        );
      case "price_dropped":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            ✓ Price Dropped!
          </span>
        );
      case "target_reached":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
            Target Reached
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Bell size={28} className="text-teal-700" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Price Alerts</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Monitor your favorite packages and get notified when prices drop
          </p>
        </div>

        {/* Notification Toast */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-white shadow-lg rounded-full border-l-4 border-teal-600 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
            <p className="text-gray-900 font-medium">{showNotification}</p>
          </motion.div>
        )}

        {/* Stats */}
        {alerts.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
              <p className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Total Alerts
              </p>
              <p className="text-4xl font-bold text-teal-700">{alerts.length}</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
              <p className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Packages Watched
              </p>
              <p className="text-4xl font-bold text-orange-600">
                {new Set(alerts.map((a) => a.packageId)).size}
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-soft">
              <p className="text-gray-600 text-sm font-semibold uppercase mb-2">
                Price Drops
              </p>
              <p className="text-4xl font-bold text-green-600">
                {alerts.filter((a) => a.status === "price_dropped").length}
              </p>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <motion.div
                key={alert.alertId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-100 hover:border-teal-300 rounded-2xl p-6 transition-all hover:shadow-soft-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Left Side - Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {alert.packageTitle}
                      </h3>
                      {getStatusBadge(alert.status)}
                    </div>

                    <p className="text-gray-600 mb-4">
                      📍 {alert.destination}
                    </p>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                          Current Price
                        </p>
                        <p className="text-lg font-bold text-teal-700">
                          ₹{alert.currentPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                          Target Price
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          ₹{alert.targetPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                          Savings
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{alert.currentPrice - alert.targetPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                          Created
                        </p>
                        <p className="text-sm text-gray-700">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {editingId === alert.alertId ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full md:w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="New price"
                        />
                        <button
                          onClick={() =>
                            handleUpdatePrice(alert.alertId)
                          }
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(alert.alertId);
                            setEditPrice(alert.targetPrice.toString());
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors font-semibold md:w-full"
                        >
                          <Edit2 size={16} />
                          Edit Target
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.alertId)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-semibold md:w-full"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="mb-4 p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Price Alerts Yet
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Start monitoring your favorite packages to get alerts when prices
              drop
            </p>
            <a
              href="/packages"
              className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 shadow-soft"
            >
              Browse Packages
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
};
