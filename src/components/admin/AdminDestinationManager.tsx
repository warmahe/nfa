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

  // Shared input class
  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2";

  if (loading) {
    return <div className="text-center py-12 font-black text-sm uppercase tracking-widest text-[#121212]/40">Loading destinations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-[14px] bg-red-50 border-2 border-red-200 text-red-700 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-[14px] bg-green-50 border-2 border-green-200 text-green-700 font-bold text-xs uppercase tracking-widest flex items-center gap-3">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">Destination Management</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1">Manage travel destinations</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all"
          >
            <Plus size={16} />
            Add Destination
          </button>
        )}
      </div>

      {/* Destinations Table */}
      <div className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FCFBF7] border-b-2 border-[#121212]/10">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Country</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Continent</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Best Time</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {destinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-bold text-sm text-[#121212]/40 uppercase tracking-widest">
                    No destinations yet. Create one to get started!
                  </td>
                </tr>
              ) : (
                destinations.map(dest => (
                  <tr key={dest.id} className="border-b border-[#121212]/5 hover:bg-[#FCFBF7] transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-[#121212]">{dest.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#121212]/70">{dest.country}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#121212]/70">{dest.continent}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#121212]/70">{dest.bestTimeToVisit}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => {
                          setDestination(dest);
                          setEditing(true);
                          setShowForm(true);
                        }}
                        className="flex items-center gap-1 px-4 py-2 rounded-[12px] bg-[#F4BF4B]/10 text-[#121212] hover:bg-[#F4BF4B]/30 font-black text-[10px] uppercase tracking-widest transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(dest.id)}
                        className="flex items-center gap-1 px-4 py-2 rounded-[12px] bg-[#9E1B1D]/10 text-[#9E1B1D] hover:bg-[#9E1B1D]/20 font-black text-[10px] uppercase tracking-widest transition-colors"
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
        <div className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6 lg:p-8 space-y-8">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212]/10">
            <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
              {editing ? 'Edit Destination' : 'Create New Destination'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="p-2 rounded-[12px] hover:bg-[#121212]/5 text-[#121212]/60 hover:text-[#121212] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Basic Info */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-5">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Destination Name *</label>
                <input type="text" name="name" value={destination.name || ''} onChange={handleInputChange} placeholder="e.g., Iceland" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL Slug *</label>
                <input type="text" name="slug" value={destination.slug || ''} onChange={handleInputChange} placeholder="e.g., iceland" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" name="country" value={destination.country || ''} onChange={handleInputChange} placeholder="e.g., Iceland" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Continent</label>
                <input type="text" name="continent" value={destination.continent || ''} onChange={handleInputChange} placeholder="e.g., Europe" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Timezone</label>
                <input type="text" name="timezone" value={destination.timezone || ''} onChange={handleInputChange} placeholder="e.g., GMT" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <input type="text" name="currency" value={destination.currency || ''} onChange={handleInputChange} placeholder="e.g., ISK" className={inputClass} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" value={destination.description || ''} onChange={handleInputChange} placeholder="Full description of the destination" rows={5} className={inputClass + " resize-none"} />
              </div>
              <div>
                <label className={labelClass}>Highlights (comma separated)</label>
                <textarea value={destination.highlights?.join(',') || ''} onChange={(e) => handleArrayChange('highlights', e.target.value)} placeholder="e.g., Northern Lights, Golden Circle, Blue Lagoon" rows={2} className={inputClass + " resize-none"} />
              </div>
              <div>
                <label className={labelClass}>Languages Spoken (comma separated)</label>
                <input type="text" value={destination.languageSpoken?.join(',') || ''} onChange={(e) => handleArrayChange('languageSpoken', e.target.value)} placeholder="e.g., Icelandic, English" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Travel Info */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-5">Travel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Best Time to Visit</label>
                <input type="text" name="bestTimeToVisit" value={destination.bestTimeToVisit || ''} onChange={handleInputChange} placeholder="e.g., June to August" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Best Duration (Days)</label>
                <input type="text" name="bestDaysDuration" value={destination.bestDaysDuration || ''} onChange={handleInputChange} placeholder="e.g., 5-7 days" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Distance from Airport</label>
                <input type="text" name="distanceFromAirport" value={destination.distanceFromAirport || ''} onChange={handleInputChange} placeholder="e.g., 50 km" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Annual Rainfall (mm)</label>
                <input type="number" name="rainfall" value={destination.rainfall || 0} onChange={handleInputChange} placeholder="e.g., 600" className={inputClass} />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelClass}>Visa Requirements</label>
              <textarea name="visaRequirements" value={destination.visaRequirements || ''} onChange={handleInputChange} placeholder="Visa information and requirements" rows={3} className={inputClass + " resize-none"} />
            </div>
          </section>

          {/* Climate */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-5">Climate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Average Temperature Min (°C)</label>
                <input type="number" value={destination.averageTemperature?.min || 0} onChange={(e) => handleTemperatureChange('min', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Average Temperature Max (°C)</label>
                <input type="number" value={destination.averageTemperature?.max || 0} onChange={(e) => handleTemperatureChange('max', e.target.value)} className={inputClass} />
              </div>
            </div>
          </section>

          {/* Map & Media */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-5">Map & Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Map Latitude</label>
                <input type="number" step="0.0001" value={destination.mapCoordinates?.latitude || 0} onChange={(e) => handleCoordinatesChange('latitude', e.target.value)} placeholder="e.g., 64.9631" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Map Longitude</label>
                <input type="number" step="0.0001" value={destination.mapCoordinates?.longitude || 0} onChange={(e) => handleCoordinatesChange('longitude', e.target.value)} placeholder="e.g., -19.0208" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input type="url" name="coverImage" value={destination.coverImage || ''} onChange={handleInputChange} placeholder="https://example.com/image.jpg" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gallery URLs (one per line)</label>
                <textarea value={destination.gallery?.join('\n') || ''} onChange={(e) => setDestination(prev => ({ ...prev, gallery: e.target.value.split('\n').filter(v => v.trim()) }))} placeholder="Paste gallery image URLs, one per line" rows={3} className={inputClass + " resize-none"} />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-5">SEO Settings</h3>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>SEO Description</label>
                <textarea name="seoDescription" value={destination.seoDescription || ''} onChange={handleInputChange} placeholder="Meta description for search engines" rows={2} className={inputClass + " resize-none"} />
              </div>
              <div>
                <label className={labelClass}>SEO Keywords (comma separated)</label>
                <input type="text" value={destination.seoKeywords?.join(',') || ''} onChange={(e) => handleArrayChange('seoKeywords', e.target.value)} placeholder="e.g., Iceland, Northern Lights, Adventure" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t-2 border-[#121212]/10">
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(false);
              }}
              className="px-6 py-3 rounded-[14px] border-2 border-[#121212]/10 text-[#121212] font-black text-[11px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white disabled:opacity-50 transition-all"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Destination'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[18px] p-6 lg:p-8 max-w-sm mx-4 space-y-4 shadow-[0_24px_48px_rgba(18,18,18,0.15)]">
            <h3 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212]">Delete Destination?</h3>
            <p className="text-sm font-bold text-[#121212]/60">
              This action cannot be undone. Are you sure you want to delete this destination?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-3 rounded-[14px] border-2 border-[#121212]/10 text-[#121212] font-black text-[11px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-3 rounded-[14px] bg-[#9E1B1D] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#121212] transition-colors"
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
