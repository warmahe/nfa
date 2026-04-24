import React, { useState, useEffect } from 'react';
import { Destination } from '../../types/database';
import {
  getCollectionData,
  setDocument,
  updateDocument,
  deleteDocument,
} from '../../services/firebaseService';
import { ArrowLeft, Plus, Edit2, Trash2, X, Save, Check } from 'lucide-react';

interface AdminDestinationManagerProps {
  destinationId?: string;
  onBack?: () => void;
}

export const AdminDestinationManager: React.FC<AdminDestinationManagerProps> = ({
  destinationId,
  onBack,
}) => {
  const [destination, setDestination] = useState<Partial<Destination> | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!destinationId);
  const [showForm, setShowForm] = useState(!destinationId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const data = await getCollectionData('destinations');
      setDestinations(data as Destination[]);

      if (destinationId) {
        const found = (data as Destination[]).find(d => d.id === destinationId);
        if (found) {
          setDestination(found);
        }
      } else {
        setDestination({
          name: '',
          slug: '',
          country: '',
          continent: '',
          timezone: '',
          description: '',
          highlights: [],
          bestTimeToVisit: '',
          visaRequirements: '',
          currency: '',
          languageSpoken: [],
          averageTemperature: { min: 0, max: 0 },
          rainfall: 0,
          bestDaysDuration: '',
          distanceFromAirport: '',
          coverImage: '',
          gallery: [],
          mapCoordinates: { latitude: 0, longitude: 0 },
          seoDescription: '',
          seoKeywords: [],
        });
      }
    } catch (err) {
      setError('Failed to load destinations: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field?: string
  ) => {
    const name = field || e.target.name;
    const value = e.target.value;
    const type = e.target.type;
    const finalValue = type === 'number' ? parseFloat(value) : value;

    setDestination(prev => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const arr = value.split(',').map(v => v.trim());
    setDestination(prev => ({
      ...prev,
      [field]: arr,
    }));
  };

  const handleCoordinatesChange = (field: 'latitude' | 'longitude', value: string) => {
    setDestination(prev => ({
      ...prev,
      mapCoordinates: {
        ...prev?.mapCoordinates,
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleTemperatureChange = (field: 'min' | 'max', value: string) => {
    setDestination(prev => ({
      ...prev,
      averageTemperature: {
        ...prev?.averageTemperature,
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSave = async () => {
    if (!destination?.name || !destination?.slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (destinationId) {
        await updateDocument('destinations', destinationId, {
          ...destination,
          updatedAt: new Date(),
        });
        setSuccess('Destination updated successfully!');
      } else {
        const newId = `dest_${destination.slug}_${Date.now()}`;
        await setDocument('destinations', newId, {
          ...destination,
          id: newId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setSuccess('Destination created successfully!');
      }

      setEditing(false);
      loadDestinations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument('destinations', id);
      setSuccess('Destination deleted successfully!');
      loadDestinations();
      setDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete: ' + (err as Error).message);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading destinations...</div>;
  }

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">🌍 Destination Management</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <Plus size={18} />
            Add New Destination
          </button>
        )}
      </div>

      {/* Destinations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Continent</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Best Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-600">
                    No destinations yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                destinations.map(dest => (
                  <tr key={dest.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dest.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dest.country}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dest.continent}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dest.bestTimeToVisit}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => {
                          setDestination(dest);
                          setEditing(true);
                          setShowForm(true);
                        }}
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(dest.id)}
                        className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form */}
      {showForm && destination && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              {editing ? 'Edit Destination' : 'Create New Destination'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={destination.name || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Iceland"
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
                  value={destination.slug || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., iceland"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={destination.country || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Iceland"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Continent</label>
                <input
                  type="text"
                  name="continent"
                  value={destination.continent || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Europe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  type="text"
                  name="timezone"
                  value={destination.timezone || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., GMT"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={destination.currency || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., ISK"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={destination.description || ''}
                  onChange={handleInputChange}
                  placeholder="Full description of the destination"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights (comma separated)
                </label>
                <textarea
                  value={destination.highlights?.join(',') || ''}
                  onChange={(e) => handleArrayChange('highlights', e.target.value)}
                  placeholder="e.g., Northern Lights, Golden Circle, Blue Lagoon"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={destination.languageSpoken?.join(',') || ''}
                  onChange={(e) => handleArrayChange('languageSpoken', e.target.value)}
                  placeholder="e.g., Icelandic, English"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Travel Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✈️ Travel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  name="bestTimeToVisit"
                  value={destination.bestTimeToVisit || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., June to August"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Best Duration (Days)
                </label>
                <input
                  type="text"
                  name="bestDaysDuration"
                  value={destination.bestDaysDuration || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 5-7 days"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance from Airport
                </label>
                <input
                  type="text"
                  name="distanceFromAirport"
                  value={destination.distanceFromAirport || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 50 km"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="rainfall"
                  value={destination.rainfall || 0}
                  onChange={handleInputChange}
                  placeholder="e.g., 600"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Requirements</label>
              <textarea
                name="visaRequirements"
                value={destination.visaRequirements || ''}
                onChange={handleInputChange}
                placeholder="Visa information and requirements"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </section>

          {/* Climate */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌡️ Climate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Temperature Min (°C)
                </label>
                <input
                  type="number"
                  value={destination.averageTemperature?.min || 0}
                  onChange={(e) => handleTemperatureChange('min', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Temperature Max (°C)
                </label>
                <input
                  type="number"
                  value={destination.averageTemperature?.max || 0}
                  onChange={(e) => handleTemperatureChange('max', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Map & Media */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📌 Map & Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={destination.mapCoordinates?.latitude || 0}
                  onChange={(e) => handleCoordinatesChange('latitude', e.target.value)}
                  placeholder="e.g., 64.9631"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={destination.mapCoordinates?.longitude || 0}
                  onChange={(e) => handleCoordinatesChange('longitude', e.target.value)}
                  placeholder="e.g., -19.0208"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  name="coverImage"
                  value={destination.coverImage || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery URLs (one per line)
                </label>
                <textarea
                  value={destination.gallery?.join('\n') || ''}
                  onChange={(e) => setDestination(prev => ({ ...prev, gallery: e.target.value.split('\n').filter(v => v.trim()) }))}
                  placeholder="Paste gallery image URLs, one per line"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                <textarea
                  name="seoDescription"
                  value={destination.seoDescription || ''}
                  onChange={handleInputChange}
                  placeholder="Meta description for search engines"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={destination.seoKeywords?.join(',') || ''}
                  onChange={(e) => handleArrayChange('seoKeywords', e.target.value)}
                  placeholder="e.g., Iceland, Northern Lights, Adventure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Destination'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Destination?</h3>
            <p className="text-gray-600">
              This action cannot be undone. Are you sure you want to delete this destination?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
