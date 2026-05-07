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

  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all";

  if (loading) {
    return <div className="text-center py-8 font-black text-sm uppercase tracking-widest text-[#121212]/40">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
            Frequently Asked Questions
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1">
            Manage {type === 'website' ? 'Website FAQs' : `FAQs for ${packageTitle}`}
          </p>
        </div>
        <button
          onClick={handleAddFAQ}
          className="flex items-center gap-2 px-5 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all"
        >
          + Add FAQ
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-[14px] bg-red-50 border-2 border-red-200 text-red-700 font-bold text-xs uppercase tracking-widest">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-[14px] bg-green-50 border-2 border-green-200 text-green-700 font-bold text-xs uppercase tracking-widest">
          ✓ {success}
        </div>
      )}

      {/* FAQ Form Inline */}
      {showForm && (
        <div className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212]/10">
            <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-2 rounded-[12px] hover:bg-[#121212]/5 text-[#121212]/60 hover:text-[#121212] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                Question <span className="text-[#9E1B1D]">*</span>
              </label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, question: e.target.value }))
                }
                placeholder="e.g., What is included in the package?"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                Answer <span className="text-[#9E1B1D]">*</span>
              </label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Detailed answer to the question..."
                rows={6}
                className={inputClass + " resize-none"}
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-[14px] border-2 border-[#121212]/10 bg-[#FCFBF7]">
                <input
                  type="checkbox"
                  checked={formData.active || false}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, active: e.target.checked }))
                  }
                  className="w-5 h-5 accent-[#121212] rounded"
                />
                <span className="font-bold text-xs uppercase tracking-widest text-[#121212]">Active</span>
              </label>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#121212]/60 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))
                  }
                  min="0"
                  className="w-24 px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-sm text-[#121212] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-6 border-t-2 border-[#121212]/10">
            <button
              onClick={handleSaveFAQ}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-[#121212] text-[#F4BF4B] py-3 font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border-2 border-[#121212]/10 text-[#121212] py-3 font-black text-[11px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors"
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
              className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] overflow-hidden"
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
                      <span className="font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full bg-[#121212]/10 text-[#121212]/50">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40">
                    👍 {faq.helpfulCount || 0} | 👎 {faq.unhelpfulCount || 0}
                  </p>
                </div>
                {expandedId === faq.id ? (
                  <ChevronUp className="text-[#121212]/30 flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-[#121212]/30 flex-shrink-0" size={20} />
                )}
              </button>

              {/* FAQ Content */}
              {expandedId === faq.id && (
                <div className="border-t-2 border-[#121212]/10 p-6 bg-[#FCFBF7] space-y-5">
                  <div>
                    <p className="font-bold text-sm text-[#121212] whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t-2 border-[#121212]/10">
                    <button
                      onClick={() => handleEditFAQ(faq)}
                      className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-white border-2 border-[#121212]/10 text-[#121212] hover:bg-[#F4BF4B]/10 font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 rounded-[18px] border-2 border-dashed border-[#121212]/10 bg-white">
            <p className="font-black text-sm uppercase tracking-widest text-[#121212]/60 mb-1">No FAQs yet.</p>
            <p className="font-bold text-[10px] uppercase tracking-widest text-[#121212]/40">Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
