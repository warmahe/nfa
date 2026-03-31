import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { PackagePricing, PricingTier, GroupPricingTier } from '../../types/database';

interface AdminPricingManagerProps {
  packageId: string;
  packageTitle: string;
  pricing: PackagePricing;
  onPricingUpdate: (pricing: PackagePricing) => Promise<void>;
}

export const AdminPricingManager: React.FC<AdminPricingManagerProps> = ({
  packageId,
  packageTitle,
  pricing,
  onPricingUpdate,
}) => {
  const [editPricing, setEditPricing] = useState<PackagePricing>(pricing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'base' | 'seasonal' | 'group'>('base');
  const [editingSeasonalId, setEditingSeasonalId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  // Base Price Section
  const handleBasePriceChange = (field: string, value: any) => {
    setEditPricing(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Seasonal Pricing
  const addSeasonalTier = () => {
    const newTier: PricingTier = {
      season: 'New Season',
      pricePerPerson: pricing.basePrice,
      startDate: new Date() as any,
      endDate: new Date() as any,
    };
    setEditPricing(prev => ({
      ...prev,
      seasonalPricing: [...(prev.seasonalPricing || []), newTier],
    }));
  };

  const updateSeasonalTier = (index: number, field: string, value: any) => {
    const updated = [...(editPricing.seasonalPricing || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditPricing(prev => ({
      ...prev,
      seasonalPricing: updated,
    }));
  };

  const removeSeasonalTier = (index: number) => {
    setEditPricing(prev => ({
      ...prev,
      seasonalPricing: prev.seasonalPricing?.filter((_, i) => i !== index),
    }));
  };

  // Group Pricing
  const addGroupTier = () => {
    const newTier: GroupPricingTier = {
      minPeople: 5,
      percentDiscount: 10,
    };
    setEditPricing(prev => ({
      ...prev,
      groupPricing: [...(prev.groupPricing || []), newTier],
    }));
  };

  const updateGroupTier = (index: number, field: string, value: any) => {
    const updated = [...(editPricing.groupPricing || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditPricing(prev => ({
      ...prev,
      groupPricing: updated,
    }));
  };

  const removeGroupTier = (index: number) => {
    setEditPricing(prev => ({
      ...prev,
      groupPricing: prev.groupPricing?.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await onPricingUpdate(editPricing);
      setSuccess('Pricing updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save pricing: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          💰 Pricing Manager
        </h3>
        <p className="text-gray-600">
          Manage all pricing options for {packageTitle}
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ {success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 flex-wrap">
        <button
          onClick={() => setActiveTab('base')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'base'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Base Pricing
        </button>
        <button
          onClick={() => setActiveTab('seasonal')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'seasonal'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Seasonal Pricing ({editPricing.seasonalPricing?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('group')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'group'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Group Discounts ({editPricing.groupPricing?.length || 0})
        </button>
      </div>

      {/* Base Pricing Tab */}
      {activeTab === 'base' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Standard Pricing
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price per Person
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editPricing.basePrice}
                    onChange={(e) => handleBasePriceChange('basePrice', parseInt(e.target.value))}
                    min="0"
                    step="100"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    {editPricing.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={editPricing.currency}
                  onChange={(e) => handleBasePriceChange('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option>INR</option>
                  <option>EUR</option>
                  <option>USD</option>
                  <option>GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%) - Overall
                </label>
                <input
                  type="number"
                  value={editPricing.discount || 0}
                  onChange={(e) => handleBasePriceChange('discount', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-900">
                💡 <strong>Price after discount:</strong>{' '}
                {editPricing.basePrice - (editPricing.basePrice * (editPricing.discount || 0)) / 100}{' '}
                {editPricing.currency}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seasonal Pricing Tab */}
      {activeTab === 'seasonal' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              ⛅ Seasonal Price Tiers
            </h4>
            <p className="text-sm text-gray-600">
              Set different prices for different seasons/dates
            </p>
          </div>

          {editPricing.seasonalPricing && editPricing.seasonalPricing.length > 0 && (
            <div className="space-y-4">
              {editPricing.seasonalPricing.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900">{tier.season}</h5>
                    <button
                      onClick={() => removeSeasonalTier(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Season Name
                      </label>
                      <input
                        type="text"
                        value={tier.season}
                        onChange={(e) =>
                          updateSeasonalTier(idx, 'season', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price per Person
                      </label>
                      <input
                        type="number"
                        value={tier.pricePerPerson}
                        onChange={(e) =>
                          updateSeasonalTier(idx, 'pricePerPerson', parseInt(e.target.value))
                        }
                        min="0"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Multiplier (if any)
                      </label>
                      <input
                        type="number"
                        value={tier.priceMultiplier || 1}
                        onChange={(e) =>
                          updateSeasonalTier(idx, 'priceMultiplier', parseFloat(e.target.value))
                        }
                        min="0.5"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addSeasonalTier}
            className="flex items-center gap-2 bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold py-2 px-4 rounded-lg transition-colors w-full justify-center"
          >
            <Plus size={18} />
            Add Seasonal Tier
          </button>
        </div>
      )}

      {/* Group Pricing Tab */}
      {activeTab === 'group' && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              👥 Group Discounts
            </h4>
            <p className="text-sm text-gray-600">
              Offer discounts for larger groups
            </p>
          </div>

          {editPricing.groupPricing && editPricing.groupPricing.length > 0 && (
            <div className="space-y-3">
              {editPricing.groupPricing.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      {tier.minPeople}+ people
                    </p>
                    <p className="font-semibold text-gray-900">
                      {tier.percentDiscount}% discount
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tier.minPeople}
                      onChange={(e) =>
                        updateGroupTier(idx, 'minPeople', parseInt(e.target.value))
                      }
                      placeholder="Min people"
                      min="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      value={tier.percentDiscount}
                      onChange={(e) =>
                        updateGroupTier(idx, 'percentDiscount', parseInt(e.target.value))
                      }
                      placeholder="Discount %"
                      min="0"
                      max="100"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => removeGroupTier(idx)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addGroupTier}
            className="flex items-center gap-2 bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold py-2 px-4 rounded-lg transition-colors w-full justify-center"
          >
            <Plus size={18} />
            Add Group Discount
          </button>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Example:</strong> If someone books for 5+ people, they
              get 10% discount on the total.
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Pricing'}
        </button>
      </div>
    </div>
  );
};
