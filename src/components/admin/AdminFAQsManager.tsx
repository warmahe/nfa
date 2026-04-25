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
    <div className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[#121212] pb-6">
        <div>
          <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tight text-[#121212] mb-2">
            ❓ Frequently Asked Questions
          </h3>
          <p className="font-bold text-xs uppercase tracking-widest text-gray-500">
            Manage {type === 'website' ? 'Website FAQs' : `FAQs for ${packageTitle}`}
          </p>
        </div>

        {/* Add FAQ Button */}
        <button
          onClick={handleAddFAQ}
          className="bg-[#121212] hover:bg-[#9E1B1D] text-[#F4BF4B] hover:text-white font-black text-xs uppercase tracking-widest py-3 px-6 shadow-[4px_4px_0px_0px_#F4BF4B] transition-all whitespace-nowrap"
        >
          + ADD FAQ
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 font-bold text-xs uppercase tracking-widest">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border-2 border-green-500 text-green-700 font-bold text-xs uppercase tracking-widest">
          ✓ {success}
        </div>
      )}

      {/* FAQ Form Inline */}
      {showForm && (
        <div className="bg-white border-2 border-[#121212] p-6 shadow-[4px_4px_0px_0px_#121212] space-y-6 mb-8">
          <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-4">
            <h4 className="font-black text-xl uppercase tracking-tight text-[#121212]">
              {editingId ? '✏️ EDIT FAQ' : '📍 ADD NEW FAQ'}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="text-[#121212] hover:text-[#9E1B1D] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-bold text-[10px] uppercase tracking-widest text-[#121212] mb-2">
                Question <span className="text-[#9E1B1D]">*</span>
              </label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, question: e.target.value }))
                }
                placeholder="e.g., What is included in the package?"
                className="w-full p-3 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-[10px] uppercase tracking-widest text-[#121212] mb-2">
                Answer <span className="text-[#9E1B1D]">*</span>
              </label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Detailed answer to the question..."
                rows={6}
                className="w-full p-3 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-bold text-sm"
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-[#121212] bg-[#FCFBF7]">
                <input
                  type="checkbox"
                  checked={formData.active || false}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, active: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#121212]"
                />
                <span className="font-bold text-xs uppercase tracking-widest text-[#121212]">Active</span>
              </label>

              <div>
                <label className="block font-bold text-[10px] uppercase tracking-widest text-[#121212] mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))
                  }
                  min="0"
                  className="w-24 p-3 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t-2 border-[#121212]">
            <button
              onClick={handleSaveFAQ}
              disabled={saving}
              className="bg-[#121212] hover:bg-[#9E1B1D] text-[#F4BF4B] hover:text-white font-black text-xs uppercase tracking-widest py-3 px-8 shadow-[4px_4px_0px_0px_#F4BF4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? 'SAVING...' : 'SAVE FAQ'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-white border-2 border-[#121212] text-[#121212] hover:bg-gray-100 font-black text-xs uppercase tracking-widest py-3 px-6 shadow-[4px_4px_0px_0px_#121212] transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs.length > 0 ? (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] overflow-hidden"
            >
              {/* FAQ Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === faq.id ? null : faq.id)
                }
                className={`w-full px-6 py-4 flex items-center justify-between hover:bg-[#FCFBF7] transition-colors focus:outline-none ${expandedId === faq.id ? 'bg-[#FCFBF7]' : ''}`}
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-sm uppercase text-[#121212]">
                      {faq.question}
                    </h4>
                    {!faq.active && (
                      <span className="font-black text-[10px] uppercase tracking-widest px-2 py-1 bg-[#121212] text-white">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500">
                    👍 {faq.helpfulCount || 0} | 👎 {faq.unhelpfulCount || 0}
                  </p>
                </div>
                {expandedId === faq.id ? (
                  <ChevronUp className="text-[#121212] flex-shrink-0" size={24} />
                ) : (
                  <ChevronDown className="text-[#121212] flex-shrink-0" size={24} />
                )}
              </button>

              {/* FAQ Content */}
              {expandedId === faq.id && (
                <div className="border-t-2 border-[#121212] p-6 bg-[#FCFBF7] space-y-6">
                  <div>
                    <p className="font-bold text-sm text-[#121212] whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                    <button
                      onClick={() => handleEditFAQ(faq)}
                      className="bg-white hover:bg-[#F4BF4B] border-2 border-[#121212] text-[#121212] font-black text-[10px] uppercase px-4 py-2 shadow-[2px_2px_0px_0px_#121212] transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="bg-[#121212] hover:bg-[#9E1B1D] text-[#F4BF4B] hover:text-white border-2 border-[#121212] font-black text-[10px] uppercase px-4 py-2 shadow-[2px_2px_0px_0px_#F4BF4B] transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-[#121212] bg-white">
            <p className="font-black text-sm uppercase tracking-widest text-[#121212] mb-1">No FAQs yet.</p>
            <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500">Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
