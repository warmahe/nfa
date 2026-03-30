import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getSubcollectionData, setSubcollectionDocument, deleteSubcollectionDocument, updateSubcollectionDocument } from '../../services/firebaseService';
import { Activity } from '../../types/database';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  highlights: string[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

interface AdminItineraryBuilderProps {
  packageId: string;
  packageTitle: string;
  duration: string; // e.g., "5 Days / 4 Nights"
}

export const AdminItineraryBuilder: React.FC<AdminItineraryBuilderProps> = ({
  packageId,
  packageTitle,
  duration,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: '',
    description: '',
    day: 1,
    duration: '',
    startTime: '',
    location: '',
    icon: 'hiking',
    isIncluded: true,
    active: true,
    order: 0,
  });

  const daysCount = parseInt(duration.split(' ')[0]) || 5;

  useEffect(() => {
    loadActivities();
  }, [packageId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await getSubcollectionData('packages', packageId, 'activities');
      setActivities(data as Activity[]);
    } catch (err) {
      setError('Failed to load activities: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = () => {
    setEditingActivityId(null);
    setFormData({
      title: '',
      description: '',
      day: 1,
      duration: '',
      startTime: '',
      location: '',
      icon: 'hiking',
      isIncluded: true,
      active: true,
      order: activities.length + 1,
    });
    setShowForm(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setFormData(activity);
    setShowForm(true);
  };

  const handleSaveActivity = async () => {
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingActivityId) {
        // Update
        await updateSubcollectionDocument(
          'packages',
          packageId,
          'activities',
          editingActivityId,
          {
            ...formData,
            updatedAt: new Date(),
          }
        );
        setSuccess('Activity updated!');
      } else {
        // Create
        const newId = `activity_${Date.now()}`;
        await setSubcollectionDocument(
          'packages',
          packageId,
          'activities',
          newId,
          {
            ...formData,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        );
        setSuccess('Activity created!');
      }

      loadActivities();
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save activity: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    try {
      setSaving(true);
      await deleteSubcollectionDocument(
        'packages',
        packageId,
        'activities',
        activityId
      );
      setSuccess('Activity deleted!');
      loadActivities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete activity: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const getActivitiesByDay = (day: number) => {
    return activities.filter(a => a.day === day).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading itinerary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          📅 Itinerary Builder
        </h3>
        <p className="text-gray-600">
          Build day-by-day itinerary for {packageTitle} ({duration})
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

      {/* Add Activity Button */}
      <button
        onClick={handleAddActivity}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        <Plus size={18} />
        Add Activity
      </button>

      {/* Activity Form Modal */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {editingActivityId ? 'Edit Activity' : 'Add New Activity'}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Golden Circle Tour"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day *
              </label>
              <select
                value={formData.day || 1}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, day: parseInt(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {Array.from({ length: daysCount }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Day {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, duration: e.target.value }))
                }
                placeholder="e.g., Full Day, 3 hours"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, startTime: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., Reykjavik, Iceland"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={formData.icon || 'hiking'}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, icon: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="hiking">Hiking</option>
                <option value="photography">Photography</option>
                <option value="cultural">Cultural</option>
                <option value="adventure">Adventure</option>
                <option value="nature">Nature</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Detailed description of the activity"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isIncluded || false}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, isIncluded: e.target.checked }))
                }
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Included in Package
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active || false}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, active: e.target.checked }))
                }
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveActivity}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
            >
              <Save size={18} />
              Save Activity
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Day-by-Day Itinerary */}
      <div className="space-y-4">
        {Array.from({ length: daysCount }).map((_, dayIndex) => {
          const day = dayIndex + 1;
          const dayActivities = getActivitiesByDay(day);
          const isExpanded = expandedDay === day;

          return (
            <div
              key={day}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-900">
                    📍 Day {day}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {dayActivities.length} activity/activities
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-gray-400" />
                ) : (
                  <ChevronDown className="text-gray-400" />
                )}
              </button>

              {/* Day Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-4 space-y-4 bg-gray-50">
                  {dayActivities.length > 0 ? (
                    <div className="space-y-3">
                      {dayActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-gray-900">
                                {activity.title}
                              </h5>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  activity.isIncluded
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {activity.isIncluded ? 'Included' : 'Optional'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                            <div className="text-sm text-gray-500 mt-2 space-y-1">
                              {activity.startTime && (
                                <p>⏰ {activity.startTime}</p>
                              )}
                              {activity.duration && (
                                <p>⏱️ {activity.duration}</p>
                              )}
                              {activity.location && (
                                <p>📍 {activity.location}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditActivity(activity)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="text-red-600 hover:text-red-800 p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No activities for this day
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
