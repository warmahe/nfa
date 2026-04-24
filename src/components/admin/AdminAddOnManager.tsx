import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Edit2, X, Check } from 'lucide-react';
import { AddOn } from '../../types/database';
import { getCollectionData, setDocument, updateDocument, deleteDocument } from '../../services/firebaseService';

export const AdminAddOnManager: React.FC = () => {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<AddOn>>({
    name: '',
    description: '',
    category: 'Experience',
    price: 0,
    currency: 'INR',
    active: true,
    createdBy: 'admin',
    updatedBy: 'admin',
  });

  const categories = ['Experience', 'Training', 'Accommodation', 'Transport', 'Meal', 'Activity'];

  useEffect(() => {
    loadAddOns();
  }, []);

  const loadAddOns = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCollectionData('addOns');
      setAddOns(data as AddOn[]);
    } catch (err) {
      setError('Failed to load add-ons: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: 'Experience',
      price: 0,
      currency: 'INR',
      active: true,
      createdBy: 'admin',
      updatedBy: 'admin',
    });
    setShowForm(true);
  };

  const handleEdit = (addOn: AddOn) => {
    setEditingId(addOn.id);
    setFormData(addOn);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name?.trim()) {
        setError('Please enter add-on name');
        return;
      }
      if (!formData.description?.trim()) {
        setError('Please enter description');
        return;
      }
      if (!formData.price || formData.price <= 0) {
        setError('Please enter valid price');
        return;
      }

      setSaving(true);
      setError('');

      if (editingId) {
        // Update existing
        await updateDocument('addOns', editingId, {
          ...formData,
          updatedBy: 'admin',
          updatedAt: new Date(),
        });
        setSuccess('Add-on updated successfully!');
      } else {
        // Create new
        const newId = `addon_${formData.name?.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
        await setDocument('addOns', newId, {
          ...formData,
          id: newId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setSuccess('Add-on created successfully!');
      }

      setTimeout(() => setSuccess(''), 3000);
      setShowForm(false);
      loadAddOns();
    } catch (err) {
      setError('Failed to save: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      setError('');
      await deleteDocument('addOns', id);
      setSuccess('Add-on deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setDeleteConfirm(null);
      loadAddOns();
    } catch (err) {
      setError('Failed to delete: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading add-ons...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">🎁 Add-On Enhancements</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add New Enhancement
        </button>
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

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Add-On' : 'Create New Add-On'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Professional Photography"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category || 'Experience'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ({formData.currency}) *
              </label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="8999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={formData.currency || 'INR'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="INR"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this add-on enhancement..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active !== false}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Add-On'}
            </button>
          </div>
        </div>
      )}

      {/* Add-ons List */}
      <div className="space-y-3">
        {addOns.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-medium">No add-ons found. Create your first one!</p>
          </div>
        ) : (
          addOns.map(addOn => (
            <div
              key={addOn.id}
              className="bg-white rounded-lg p-6 border border-gray-200 flex items-start justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{addOn.name}</h3>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                    {addOn.category}
                  </span>
                  {!addOn.active && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{addOn.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-semibold text-teal-700 text-lg">
                    {addOn.currency} {addOn.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleEdit(addOn)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(addOn.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete This Add-On?</h3>
            <p className="text-gray-600">
              This action cannot be undone. Are you sure you want to delete this add-on enhancement?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
