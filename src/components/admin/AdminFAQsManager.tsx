import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getCollectionData,
  getSubcollectionData,
  setDocument,
  updateDocument,
  deleteDocument,
  setSubcollectionDocument,
  updateSubcollectionDocument,
  deleteSubcollectionDocument,
} from '../../services/firebaseService';
import { FAQ } from '../../types/database';
import { useAdminDialog } from './AdminDialogContext';

interface AdminFAQsManagerProps {
  packageId?: string;
  packageTitle?: string;
  type?: 'website' | 'package';
}

export const AdminFAQsManager: React.FC<AdminFAQsManagerProps> = ({
  packageId,
  packageTitle,
  type = 'website',
}) => {
  const { confirm, toast } = useAdminDialog();
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
        toast('FAQ created successfully!', 'success');
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
    confirm({
      title: "Delete Global FAQ Entry",
      message: "Are you sure you want to delete this FAQ entry from the knowledge base?",
      type: "danger",
      confirmText: "Delete FAQ",
      onConfirm: async () => {
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
          toast('FAQ deleted successfully!', 'success');
          loadFAQs();
        } catch (err) {
          toast('Failed to delete FAQ: ' + (err as Error).message, 'error');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const inputClass = "saas-input w-full text-xs text-slate-900 font-sans";

  if (loading) {
    return <div className="text-center py-8 font-medium text-xs text-slate-400 uppercase tracking-wider">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage {type === 'website' ? 'Website FAQs' : `FAQs for ${packageTitle}`}
          </p>
        </div>
        <button
          onClick={handleAddFAQ}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#121212] text-[#F4BF4B] font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs flex items-center gap-2">
          ✓ {success}
        </div>
      )}

      {/* FAQ Form Inline */}
      {showForm && (
        <div className="saas-card bg-white border-slate-200/80 p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-sans font-bold text-base text-slate-900">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question <span className="text-rose-500">*</span>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Answer <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Detailed answer to the question..."
                rows={5}
                className={inputClass + " resize-none"}
              />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <input
                  type="checkbox"
                  checked={formData.active || false}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, active: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#121212] rounded cursor-pointer"
                />
                <span className="font-semibold text-xs text-slate-800">Active</span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))
                  }
                  min="0"
                  className="w-24 saas-input text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={handleSaveFAQ}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#121212] text-[#F4BF4B] py-2 font-semibold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-2.5">
        {faqs.length > 0 ? (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className="saas-card bg-white border-slate-200/80 overflow-hidden"
            >
              {/* FAQ Header */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === faq.id ? null : faq.id)
                }
                className={`w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors focus:outline-none cursor-pointer ${expandedId === faq.id ? 'bg-slate-50/50' : ''}`}
              >
                <div className="text-left flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-sans font-semibold text-xs text-slate-900 truncate">
                      {faq.question}
                    </h4>
                    {!faq.active && (
                      <span className="font-semibold text-[10px] uppercase px-2 py-0.2 rounded bg-slate-100 text-slate-500">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Helpful: 👍 {faq.helpfulCount || 0} | 👎 {faq.unhelpfulCount || 0}
                  </p>
                </div>
                {expandedId === faq.id ? (
                  <ChevronUp className="text-slate-400 flex-shrink-0" size={18} />
                ) : (
                  <ChevronDown className="text-slate-400 flex-shrink-0" size={18} />
                )}
              </button>

              {/* FAQ Content */}
              {expandedId === faq.id && (
                <div className="border-t border-slate-100 p-4.5 bg-slate-50/30 space-y-4">
                  <div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleEditFAQ(faq)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer"
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
          <div className="text-center py-12 saas-card bg-slate-50/50 border-dashed border-slate-200">
            <p className="font-semibold text-xs text-slate-600 mb-0.5">No FAQs yet.</p>
            <p className="text-[11px] text-slate-400">Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
