import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getSubcollectionData, 
  setSubcollectionDocument, 
  deleteSubcollectionDocument, 
  updateSubcollectionDocument,
  getCollectionData,
  setDocument,
  updateDocument,
  deleteDocument
} from '../../services/firebaseService';
import { FAQ } from '../../types/database';

interface AdminFAQsManagerProps {
  type?: 'website' | 'itinerary';
  packageId?: string;
  packageTitle?: string;
}

export const AdminFAQsManager: React.FC<AdminFAQsManagerProps> = ({
  type = 'itinerary',
  packageId,
  packageTitle,
}) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    active: true,
    order: 0,
    helpfulCount: 0,
    unhelpfulCount: 0,
  });

  useEffect(() => {
    loadFAQs();
  }, [type, packageId]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      if (type === 'website') {
        const data = await getCollectionData('website_faqs');
        setFaqs((data as FAQ[]).sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else if (packageId) {
        const data = await getSubcollectionData('packages', packageId, 'faqs');
        setFaqs((data as FAQ[]).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (err) {
      setError('Failed to load FAQs: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFAQ = () => {
    setEditingId(null);
    setFormData({
      question: '',
      answer: '',
      active: true,
      order: faqs.length + 1,
      helpfulCount: 0,
      unhelpfulCount: 0,
    });
    setShowForm(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData(faq);
    setShowForm(true);
  };

  const handleSaveFAQ = async () => {
    if (!formData.question || !formData.answer) {
      setError('Question and answer are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        // Update
        if (type === 'website') {
          await updateDocument('website_faqs', editingId, {
            ...formData,
            updatedAt: new Date(),
          });
        } else if (packageId) {
          await updateSubcollectionDocument(
            'packages',
            packageId,
            'faqs',
            editingId,
            {
              ...formData,
              updatedAt: new Date(),
            }
          );
        }
        setSuccess('FAQ updated!');
      } else {
        // Create
        const newId = `faq_${Date.now()}`;
        if (type === 'website') {
          await setDocument('website_faqs', newId, {
            ...formData,
            id: newId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else if (packageId) {
          await setSubcollectionDocument(
            'packages',
            packageId,
            'faqs',
            newId,
            {
              ...formData,
              id: newId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          );
        }
        setSuccess('FAQ created!');
      }

      loadFAQs();
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save FAQ: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFAQ = async (faqId: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      setSaving(true);
      if (type === 'website') {
        await deleteDocument('website_faqs', faqId);
      } else if (packageId) {
        await deleteSubcollectionDocument(
          'packages',
          packageId,
          'faqs',
          faqId
        );
      }
      setSuccess('FAQ deleted!');
      loadFAQs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete FAQ: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ❓ Frequently Asked Questions
        </h3>
        <p className="text-gray-600">
          Manage {type === 'website' ? 'Website FAQs' : `FAQs for ${packageTitle}`}
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

      {/* Add FAQ Button */}
      <button
        onClick={handleAddFAQ}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        <Plus size={18} />
        Add FAQ
      </button>

      {/* FAQ Form Modal */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, question: e.target.value }))
              }
              placeholder="e.g., What is included in the package?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer || ''}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, answer: e.target.value }))
              }
              placeholder="Detailed answer to the question..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))
                }
                min="0"
                className="w-16 px-3 py-1 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveFAQ}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400"
            >
              <Save size={18} />
              Save FAQ
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

      {/* FAQs List */}
      <div className="space-y-3">
        {faqs.length > 0 ? (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* FAQ Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === faq.id ? null : faq.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {faq.question}
                    </h4>
                    {!faq.active && (
                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    👍 {faq.helpfulCount} | 👎 {faq.unhelpfulCount}
                  </p>
                </div>
                {expandedId === faq.id ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* FAQ Content */}
              {expandedId === faq.id && (
                <div className="border-t border-gray-200 px-6 py-4 space-y-4 bg-gray-50">
                  <div>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFAQ(faq)}
                      className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No FAQs yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
};
