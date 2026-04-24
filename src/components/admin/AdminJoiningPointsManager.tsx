import React, { useState, useEffect } from 'react';
import {
  getSubcollectionData,
  setSubcollectionDocument,
  updateSubcollectionDocument,
  deleteSubcollectionDocument,
} from '../../services/firebaseService';
import { JoiningPoint } from '../../types/database';

interface AdminJoiningPointsManagerProps {
  packageId: string;
}

export const AdminJoiningPointsManager: React.FC<AdminJoiningPointsManagerProps> = ({
  packageId,
}) => {
  const [joiningPoints, setJoiningPoints] = useState<JoiningPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<JoiningPoint>>({
    city: '',
    location: '',
    coordinates: { latitude: 0, longitude: 0 },
    pickupTime: '',
    instructions: '',
    included: true,
    additionalCost: 0,
    active: true,
    order: 1,
  });

  // Load joining points
  useEffect(() => {
    loadJoiningPoints();
  }, [packageId]);

  const loadJoiningPoints = async () => {
    try {
      setLoading(true);
      const data = await getSubcollectionData('packages', packageId, 'joiningPoints');
      const sorted = (data as JoiningPoint[]).sort((a, b) => (a.order || 0) - (b.order || 0));
      setJoiningPoints(sorted);
    } catch (error) {
      console.error('Error loading joining points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      city: '',
      location: '',
      coordinates: { latitude: 0, longitude: 0 },
      pickupTime: '',
      instructions: '',
      included: true,
      additionalCost: 0,
      active: true,
      order: joiningPoints.length + 1,
    });
    setShowForm(true);
  };

  const handleEditClick = (point: JoiningPoint) => {
    setEditingId(point.id);
    setFormData(point);
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name.startsWith('coordinates.')) {
      const coordKey = name.replace('coordinates.', '') as 'latitude' | 'longitude';
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates!,
          [coordKey]: parseFloat(value),
        },
      });
    } else if (name === 'order' || name === 'additionalCost') {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.city || !formData.location) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingId) {
        // Update existing
        await updateSubcollectionDocument(
          'packages',
          packageId,
          'joiningPoints',
          editingId,
          formData as JoiningPoint
        );
      } else {
        // Create new
        const newId = `joining-point-${Date.now()}`;
        await setSubcollectionDocument(
          'packages',
          packageId,
          'joiningPoints',
          newId,
          {
            ...formData,
            id: newId,
          } as JoiningPoint
        );
      }

      setShowForm(false);
      loadJoiningPoints();
    } catch (error) {
      console.error('Error saving joining point:', error);
      alert('Error saving joining point');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this joining point?')) {
      try {
        await deleteSubcollectionDocument('packages', packageId, 'joiningPoints', id);
        loadJoiningPoints();
      } catch (error) {
        console.error('Error deleting joining point:', error);
        alert('Error deleting joining point');
      }
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newPoints = [...joiningPoints];
    [newPoints[index], newPoints[index - 1]] = [newPoints[index - 1], newPoints[index]];

    // Update orders in database
    for (let i = 0; i < newPoints.length; i++) {
      await updateSubcollectionDocument(
        'packages',
        packageId,
        'joiningPoints',
        newPoints[i].id,
        {
          ...newPoints[i],
          order: i + 1,
        } as JoiningPoint
      );
    }

    setJoiningPoints(newPoints);
  };

  const handleMoveDown = async (index: number) => {
    if (index === joiningPoints.length - 1) return;
    const newPoints = [...joiningPoints];
    [newPoints[index], newPoints[index + 1]] = [newPoints[index + 1], newPoints[index]];

    // Update orders in database
    for (let i = 0; i < newPoints.length; i++) {
      await updateSubcollectionDocument(
        'packages',
        packageId,
        'joiningPoints',
        newPoints[i].id,
        {
          ...newPoints[i],
          order: i + 1,
        } as JoiningPoint
      );
    }

    setJoiningPoints(newPoints);
  };

  if (loading) {
    return <div className="p-4">Loading joining points...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Joining Points</h2>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Joining Point
        </button>
      </div>

      {/* Joining Points Table */}
      {joiningPoints.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-4 py-2 border">Order</th>
                <th className="text-left px-4 py-2 border">City</th>
                <th className="text-left px-4 py-2 border">Location</th>
                <th className="text-left px-4 py-2 border">Pickup Time</th>
                <th className="text-left px-4 py-2 border">Type</th>
                <th className="text-left px-4 py-2 border">Cost</th>
                <th className="text-left px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {joiningPoints.map((point, index) => (
                <tr key={point.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border font-semibold">{point.city}</td>
                  <td className="px-4 py-2 border">{point.location}</td>
                  <td className="px-4 py-2 border">{point.pickupTime}</td>
                  <td className="px-4 py-2 border">
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      point.included ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {point.included ? 'Included' : 'Optional'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    {point.included ? 'Free' : `+€${point.additionalCost || 0}`}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(point)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(point.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === joiningPoints.length - 1}
                        className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white px-2 py-1 rounded text-sm"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No joining points yet. Create your first one!
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Joining Point' : 'Add New Joining Point'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., Reykjavik"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-semibold mb-2">Pickup Time</label>
                <input
                  type="text"
                  name="pickupTime"
                  value={formData.pickupTime || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., 10:00 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., Keflavik International Airport"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-sm font-semibold mb-2">Latitude</label>
                <input
                  type="number"
                  name="coordinates.latitude"
                  step="0.0001"
                  value={formData.coordinates?.latitude || ''}
                  onChange={handleFormChange}
                  placeholder="64.1379"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Longitude</label>
                <input
                  type="number"
                  name="coordinates.longitude"
                  step="0.0001"
                  value={formData.coordinates?.longitude || ''}
                  onChange={handleFormChange}
                  placeholder="-21.9413"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Instructions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions || ''}
                  onChange={handleFormChange}
                  placeholder="Pickup instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Included Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="included"
                  checked={formData.included || false}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded"
                />
                <label className="ml-2 text-sm font-semibold">Included in package price</label>
              </div>

              {/* Additional Cost */}
              {!formData.included && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Additional Cost (EUR)</label>
                  <input
                    type="number"
                    name="additionalCost"
                    value={formData.additionalCost || 0}
                    onChange={handleFormChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold mb-2">Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order || 1}
                  onChange={handleFormChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active !== false}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded"
                />
                <label className="ml-2 text-sm font-semibold">Active</label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                {editingId ? 'Update' : 'Create'} Joining Point
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
