import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { PackageAvailability } from '../../types/database';

interface AdminAvailabilityManagerProps {
  packageId: string;
  packageTitle: string;
  availability: PackageAvailability;
  maxTravelers: number;
  onAvailabilityUpdate: (availability: PackageAvailability) => Promise<void>;
}

export const AdminAvailabilityManager: React.FC<AdminAvailabilityManagerProps> = ({
  packageId,
  packageTitle,
  availability,
  maxTravelers,
  onAvailabilityUpdate,
}) => {
  const [editAvailability, setEditAvailability] = useState<PackageAvailability>(availability);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const remainingSlots = editAvailability.maxSlots - editAvailability.bookings;
  const occupancyPercent = Math.round(
    (editAvailability.bookings / editAvailability.maxSlots) * 100
  );

  const handleMaxSlotsChange = (value: number) => {
    if (value < editAvailability.bookings) {
      setError(
        `Cannot set max slots below current bookings (${editAvailability.bookings})`
      );
      return;
    }
    setError('');
    setEditAvailability(prev => ({
      ...prev,
      maxSlots: value,
    }));
  };

  const handleBookingsChange = (value: number) => {
    if (value > editAvailability.maxSlots) {
      setError('Bookings cannot exceed max slots');
      return;
    }
    if (value < 0) {
      setError('Bookings cannot be negative');
      return;
    }
    setError('');
    setEditAvailability(prev => ({
      ...prev,
      bookings: value,
    }));
  };

  const handleSave = async () => {
    if (editAvailability.maxSlots < 1) {
      setError('Max slots must be at least 1');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onAvailabilityUpdate(editAvailability);
      setSuccess('Availability updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save availability: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          📊 Availability & Capacity
        </h3>
        <p className="text-gray-600">
          Manage slots and bookings for {packageTitle}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ {success}
        </div>
      )}

      {/* Main Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Max Slots */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎫 Maximum Slots (Batch Size)
          </label>
          <p className="text-sm text-gray-600 mb-4">
            How many travelers can join in one batch/departure
          </p>
          <input
            type="number"
            value={editAvailability.maxSlots}
            onChange={(e) => handleMaxSlotsChange(parseInt(e.target.value))}
            min="1"
            max="50"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-semibold"
          />
          <p className="text-xs text-gray-500 mt-2">
            Must be between 1 and 50
          </p>
        </div>

        {/* Current Bookings */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👥 Current Bookings
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Automatically updated from booking records (edit manually if needed)
          </p>
          <input
            type="number"
            value={editAvailability.bookings}
            onChange={(e) => handleBookingsChange(parseInt(e.target.value))}
            min="0"
            max={editAvailability.maxSlots}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg font-semibold"
          />
          <p className="text-xs text-gray-500 mt-2">
            Cannot exceed max slots ({editAvailability.maxSlots})
          </p>
        </div>
      </div>

      {/* Occupancy Visualization */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
        <h4 className="font-semibold text-gray-900">📈 Occupancy Status</h4>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Occupancy Rate
              </span>
              <span className="text-sm font-bold text-gray-900">
                {occupancyPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  occupancyPercent >= 90
                    ? 'bg-red-600'
                    : occupancyPercent >= 70
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {editAvailability.bookings}
              </p>
              <p className="text-xs text-blue-700 font-medium">Booked</p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {remainingSlots}
              </p>
              <p className="text-xs text-green-700 font-medium">Available</p>
            </div>

            <div className="text-center p-3 bg-gray-100 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {editAvailability.maxSlots}
              </p>
              <p className="text-xs text-gray-700 font-medium">Total</p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                remainingSlots > 0
                  ? occupancyPercent >= 90
                    ? 'bg-red-600'
                    : 'bg-green-600'
                  : 'bg-red-600'
              }`}
            />
            <span className="text-sm font-medium text-gray-900">
              {remainingSlots <= 0
                ? '🔴 Fully Booked'
                : remainingSlots <= 2
                ? '🟡 Almost Full'
                : '🟢 Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <h4 className="font-semibold text-blue-900">💡 About Capacity</h4>
        <ul className="text-sm text-blue-900 space-y-2">
          <li>
            • <strong>Max Slots:</strong> Number of travelers per batch/departure
          </li>
          <li>
            • <strong>Bookings:</strong> Current confirmed travelers for this batch
          </li>
          <li>
            • When available slots = 0, the package shows as "Fully Booked"
          </li>
          <li>
            • You can create multiple batches with different start dates
          </li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving || !!error}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};
