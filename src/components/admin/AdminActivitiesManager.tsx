import React, { useState, useEffect } from 'react';
import {
  getSubcollectionData,
  setSubcollectionDocument,
  updateSubcollectionDocument,
  deleteSubcollectionDocument,
} from '../../services/firebaseService';
import { Activity } from '../../types/database';

interface AdminActivitiesManagerProps {
  packageId: string;
}

export const AdminActivitiesManager: React.FC<AdminActivitiesManagerProps> = ({
  packageId,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'included' | 'optional'>('all');
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: '',
    description: '',
    location: '',
    icon: 'scenic',
    day: 1,
    duration: '',
    startTime: '',
    isIncluded: true,
    price: 0,
    currency: 'INR',
    ageRestriction: 'All ages',
    active: true,
    order: 1,
  });

  // Load activities
  useEffect(() => {
    loadActivities();
  }, [packageId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getSubcollectionData('packages', packageId, 'activities');
      const sorted = (data as Activity[]).sort((a, b) => (a.order || 0) - (b.order || 0));
      setActivities(sorted);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (isIncluded: boolean = true) => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      icon: 'scenic',
      day: 1,
      duration: '',
      startTime: '',
      isIncluded,
      price: isIncluded ? undefined : 0,
      currency: 'INR',
      ageRestriction: 'All ages',
      active: true,
      order: activities.filter((a) => a.isIncluded === isIncluded).length + 1,
    });
    setShowForm(true);
  };

  const handleEditClick = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData(activity);
    setShowForm(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isIncluded') {
        setFormData({
          ...formData,
          isIncluded: checked,
          price: checked ? undefined : 0,
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else if (name === 'price' || name === 'day' || name === 'order') {
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
      if (!formData.title || !formData.description) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingId) {
        // Update existing
        await updateSubcollectionDocument(
          'packages',
          packageId,
          'activities',
          editingId,
          formData as Activity
        );
      } else {
        // Create new
        const newId = `activity-${Date.now()}`;
        await setSubcollectionDocument(
          'packages',
          packageId,
          'activities',
          newId,
          {
            ...formData,
            id: newId,
          } as Activity
        );
      }

      setShowForm(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Error saving activity');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteSubcollectionDocument('packages', packageId, 'activities', id);
        loadActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Error deleting activity');
      }
    }
  };

  const handleMoveUp = async (index: number, isIncluded: boolean) => {
    const filtered = activities.filter((a) => a.isIncluded === isIncluded);
    if (index === 0) return;

    const newFiltered = [...filtered];
    [newFiltered[index], newFiltered[index - 1]] = [newFiltered[index - 1], newFiltered[index]];

    // Update orders in database for filtered items
    for (let i = 0; i < newFiltered.length; i++) {
      await updateSubcollectionDocument(
        'packages',
        packageId,
        'activities',
        newFiltered[i].id,
        {
          ...newFiltered[i],
          order: i + 1,
        } as Activity
      );
    }

    loadActivities();
  };

  const handleMoveDown = async (index: number, isIncluded: boolean) => {
    const filtered = activities.filter((a) => a.isIncluded === isIncluded);
    if (index === filtered.length - 1) return;

    const newFiltered = [...filtered];
    [newFiltered[index], newFiltered[index + 1]] = [newFiltered[index + 1], newFiltered[index]];

    // Update orders in database for filtered items
    for (let i = 0; i < newFiltered.length; i++) {
      await updateSubcollectionDocument(
        'packages',
        packageId,
        'activities',
        newFiltered[i].id,
        {
          ...newFiltered[i],
          order: i + 1,
        } as Activity
      );
    }

    loadActivities();
  };

  const includedActivities = activities.filter((a) => a.isIncluded);
  const optionalActivities = activities.filter((a) => !a.isIncluded);

  if (loading) {
    return <div className="p-4">Loading activities...</div>;
  }

  const ActivityTable = ({
    items,
    title,
    isIncluded,
  }: {
    items: Activity[];
    title: string;
    isIncluded: boolean;
  }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-bold ${isIncluded ? 'text-green-600' : 'text-orange-600'}`}>
          {title} ({items.length})
        </h3>
        <button
          onClick={() => handleAddClick(isIncluded)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          + Add
        </button>
      </div>

      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-4 py-2 border">Day</th>
                <th className="text-left px-4 py-2 border">Title</th>
                <th className="text-left px-4 py-2 border">Duration</th>
                <th className="text-left px-4 py-2 border">Start Time</th>
                {!isIncluded && <th className="text-left px-4 py-2 border">Price</th>}
                <th className="text-left px-4 py-2 border">Age Restriction</th>
                <th className="text-left px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((activity, index) => (
                <tr key={activity.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center font-semibold">Day {activity.day}</td>
                  <td className="px-4 py-2 border font-semibold">{activity.title}</td>
                  <td className="px-4 py-2 border">{activity.duration}</td>
                  <td className="px-4 py-2 border">{activity.startTime}</td>
                  {!isIncluded && (
                    <td className="px-4 py-2 border">
                      {activity.price ? `${activity.price} ${activity.currency}` : 'Free'}
                    </td>
                  )}
                  <td className="px-4 py-2 border text-sm">{activity.ageRestriction}</td>
                  <td className="px-4 py-2 border">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleEditClick(activity)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleMoveUp(index, isIncluded)}
                        disabled={index === 0}
                        className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white px-1.5 py-1 rounded text-xs"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(index, isIncluded)}
                        disabled={index === items.length - 1}
                        className="bg-gray-400 hover:bg-gray-500 disabled:opacity-50 text-white px-1.5 py-1 rounded text-xs"
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
        <div className="text-center py-6 text-gray-500 border border-dashed rounded">
          No {title.toLowerCase()} yet.
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Activities Management</h2>
        <div className="flex gap-2">
          {(['all', 'included', 'optional'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Included Activities */}
      {(filterType === 'all' || filterType === 'included') && (
        <ActivityTable
          items={includedActivities}
          title="✓ Included Activities"
          isIncluded={true}
        />
      )}

      {/* Optional Activities */}
      {(filterType === 'all' || filterType === 'optional') && (
        <ActivityTable
          items={optionalActivities}
          title="$ Optional Activities"
          isIncluded={false}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Activity' : 'Add New Activity'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., Golden Circle Tour"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  placeholder="Activity description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-semibold mb-2">Day</label>
                <select
                  name="day"
                  value={formData.day || 1}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                    <option key={d} value={d}>
                      Day {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold mb-2">Start Time</label>
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., 08:00 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold mb-2">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., Full Day, 3 hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., South Iceland"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold mb-2">Icon</label>
                <select
                  name="icon"
                  value={formData.icon || 'scenic'}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scenic">Scenic</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="photography">Photography</option>
                  <option value="cultural">Cultural</option>
                  <option value="food">Food</option>
                </select>
              </div>

              {/* Age Restriction */}
              <div>
                <label className="block text-sm font-semibold mb-2">Age Restriction</label>
                <input
                  type="text"
                  name="ageRestriction"
                  value={formData.ageRestriction || ''}
                  onChange={handleFormChange}
                  placeholder="e.g., Ages 8+, good fitness"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Included Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isIncluded"
                  checked={formData.isIncluded || false}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded"
                />
                <label className="ml-2 text-sm font-semibold">Included in package</label>
              </div>

              {/* Price (only if optional) */}
              {!formData.isIncluded && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleFormChange}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency || 'INR'}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </>
              )}

              {/* Active */}
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
                {editingId ? 'Update' : 'Create'} Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
