import React, { useState, useEffect } from 'react';
import { Package } from '../../types/database';
import { 
  getCollectionData, 
  setDocument, 
  updateDocument 
} from '../../services/firebaseService';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Check } from 'lucide-react';

interface AdminPackageDetailsManagerProps {
  packageId?: string;
  onBack: () => void;
}

export const AdminPackageDetailsManager: React.FC<AdminPackageDetailsManagerProps> = ({
  packageId,
  onBack,
}) => {
  const [pkg, setPkg] = useState<Partial<Package> | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(!packageId);
  const [editMode, setEditMode] = useState(packageId ? false : true);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [packageId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load packages
      const pkgData = await getCollectionData('packages');
      setPackages(pkgData as Package[]);

      // Load destinations
      const destData = await getCollectionData('destinations');
      setDestinations(destData);

      // Load specific package if editing
      if (packageId) {
        const found = (pkgData as Package[]).find(p => p.id === packageId);
        if (found) {
          setPkg(found);
        }
      } else {
        // Initialize new package
        setPkg({
          title: '',
          slug: '',
          overview: '',
          description: '',
          destinations: [],
          difficulty: 'Moderate',
          duration: '',
          departureDate: '',
          maxTravelers: 10,
          status: 'draft',
          pricing: {
            basePrice: 0,
            currency: 'INR',
            seasonalPricing: [],
            groupPricing: [],
          },
          availability: {
            maxSlots: 10,
            bookings: 0,
          },
          media: {
            thumbnail: '',
            gallery: [],
            videos: [],
          },
          rating: {
            average: 0,
            totalReviews: 0,
            autoCalculated: 0,
          },
          joiningPointCount: 0,
          activitiesIncludedCount: 0,
          activitiesOptionalCount: 0,
          reviewsCount: 0,
          faqsCount: 0,
          createdBy: 'admin',
          updatedBy: 'admin',
        });
      }
    } catch (err) {
      setError('Failed to load data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value) : value;

    setPkg(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleDestinationToggle = (destId: string) => {
    setPkg(prev => ({
      ...prev,
      destinations: prev?.destinations?.includes(destId)
        ? prev.destinations.filter(d => d !== destId)
        : [...(prev?.destinations || []), destId],
    }));
  };

  const handleSave = async () => {
    if (!pkg?.title || !pkg?.slug) {
      setError('Title and slug are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (packageId) {
        // Update existing package
        await updateDocument('packages', packageId, {
          ...pkg,
          updatedBy: 'admin',
          updatedAt: new Date(),
        });
        setSuccess('Package updated successfully!');
      } else {
        // Create new package
        const newId = `pkg_${pkg.slug}_${Date.now()}`;
        await setDocument('packages', newId, {
          ...pkg,
          id: newId,
          createdBy: 'admin',
          updatedBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setSuccess('Package created successfully!');
        setPkg(prev => ({ ...prev, id: newId }));
      }

      setEditMode(false);
      loadInitialData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save package: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (packageId && !pkg) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-teal-700 hover:text-teal-900 font-semibold"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="text-red-600">Package not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {packageId ? 'Edit Package' : 'Create New Package'}
            </h2>
            {pkg?.title && (
              <p className="text-gray-600">
                {pkg.title}
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                  {pkg.status}
                </span>
              </p>
            )}
          </div>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <Edit2 size={18} />
            Edit
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
          <Check size={20} />
          <div>
            <h3 className="font-semibold">Success</h3>
            <p>{success}</p>
          </div>
        </div>
      )}

      {editMode && pkg ? (
        <div className="space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={pkg.title || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Iceland Adventure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={pkg.slug || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., iceland-adventure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overview (Short Summary)
              </label>
              <textarea
                name="overview"
                value={pkg.overview || ''}
                onChange={handleInputChange}
                placeholder="Brief summary of the package (2-3 sentences)"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                value={pkg.description || ''}
                onChange={handleInputChange}
                placeholder="Detailed description of the package"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Package Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Package Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={pkg.duration || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 Days / 4 Nights"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  name="departureDate"
                  value={pkg.departureDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={pkg.difficulty || 'Moderate'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Challenging</option>
                  <option>Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Travelers per Batch
                </label>
                <input
                  type="number"
                  name="maxTravelers"
                  value={pkg.maxTravelers || 10}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={pkg.status || 'draft'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </section>

          {/* Base Price */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💰 Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price per Person
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={pkg.pricing?.basePrice || 0}
                  onChange={(e) => {
                    setPkg(prev => ({
                      ...prev,
                      pricing: {
                        ...prev?.pricing,
                        basePrice: parseInt(e.target.value),
                      },
                    }));
                  }}
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={pkg.pricing?.currency || 'INR'}
                  onChange={(e) => {
                    setPkg(prev => ({
                      ...prev,
                      pricing: {
                        ...prev?.pricing,
                        currency: e.target.value,
                      },
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option>EUR</option>
                  <option>USD</option>
                  <option>INR</option>
                  <option>GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%) - Optional
                </label>
                <input
                  type="number"
                  value={pkg.pricing?.discount || 0}
                  onChange={(e) => {
                    setPkg(prev => ({
                      ...prev,
                      pricing: {
                        ...prev?.pricing,
                        discount: parseInt(e.target.value),
                      },
                    }));
                  }}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Destinations */}
          {destinations.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🗺️ Destinations
              </h3>
              <div className="space-y-2">
                {destinations.map((dest: any) => (
                  <label key={dest.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkg?.destinations?.includes(dest.id) || false}
                      onChange={() => handleDestinationToggle(dest.id)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="font-medium text-gray-900">{dest.name}</span>
                    <span className="text-sm text-gray-500">{dest.country}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Package'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                loadInitialData();
              }}
              className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Read-Only View */
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">{pkg?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Difficulty</p>
              <p className="text-lg font-semibold text-gray-900">{pkg?.difficulty}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{pkg?.duration}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Max Travelers</p>
              <p className="text-lg font-semibold text-gray-900">{pkg?.maxTravelers}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Overview</p>
            <p className="text-gray-900">{pkg?.overview}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">{pkg?.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Base Price</p>
            <p className="text-2xl font-bold text-teal-700">
              {pkg?.pricing?.basePrice} {pkg?.pricing?.currency}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
