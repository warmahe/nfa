import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Edit2, Star, X } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, uploadImage, deleteImage } from '../../services/firebaseService';
import { Review } from '../../types/database';
import { useAdminDialog } from './AdminDialogContext';

export const AdminReviewsManager = () => {
  const { confirm, toast } = useAdminDialog();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Review>>({
    travelerName: '',
    role: 'Verified Explorer',
    content: '',
    rating: 5,
    avatar: '',
    approved: true
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'global_reviews'));
      setReviews(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.travelerName || !formData.content) return toast("All fields required", "error");
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'global_reviews', editingId), { ...formData, updatedAt: Timestamp.now() });
        toast("Field log entry updated successfully.", "success");
      } else {
        await addDoc(collection(db, 'global_reviews'), { ...formData, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
        toast("New field log entry created.", "success");
      }
      setShowForm(false);
      setPreviewUrl('');
      loadReviews();
    } catch (e: any) {
      toast("Error saving field log: " + e.message, "error");
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) return toast("File too large. Max 1MB allowed.", "error");

    try {
      // 1. Delete old avatar if exists
      if (formData.avatar) await deleteImage(formData.avatar);
      
      // 2. Upload new
      const url = await uploadImage(file, 'avatars');
      setFormData(prev => ({ ...prev, avatar: url }));
      setPreviewUrl(url);
      toast("Avatar uploaded successfully.", "success");
    } catch (error) { toast("Upload failed", "error"); }
  };

  const handleDelete = async (id: string, avatarUrl: string) => {
    confirm({
      title: "Delete Review Log",
      message: "Are you sure you want to delete this traveler field log?",
      type: "danger",
      confirmText: "Delete Entry",
      onConfirm: async () => {
        if (avatarUrl) await deleteImage(avatarUrl);
        await deleteDoc(doc(db, 'global_reviews', id));
        loadReviews();
        toast("Field log deleted successfully.", "success");
      }
    });
  };

  const inputClass = "saas-input w-full text-xs text-slate-900 font-sans";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight">Reviews</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage authenticated traveler reviews and feedback</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); }} 
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#121212] text-[#F4BF4B] font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {showForm && (
        <div className="saas-card bg-white border-slate-200/80 p-5 space-y-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Traveler Name</label>
                   <input type="text" placeholder="Traveler Name" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className={inputClass} />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Badge</label>
                   <input type="text" placeholder="Role (e.g. Verified Explorer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputClass} />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                   <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className={inputClass + " cursor-pointer"}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                   </select>
                 </div>
              </div>
              <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Review Content</label>
                   <textarea placeholder="Write review content here..." rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className={inputClass + " resize-none"} />
                 </div>
                 <div className="flex items-center gap-3 pt-1">
                    <div className="w-14 h-14 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                       {previewUrl || formData.avatar ? <img src={previewUrl || formData.avatar} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 text-center font-medium">No Img</span>}
                    </div>
                    <label className="flex-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 p-3 text-center cursor-pointer font-semibold text-xs text-slate-700 transition-colors flex items-center justify-center gap-2">
                       <Upload size={14} className="text-slate-500" /> Upload Avatar
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#121212] text-[#F4BF4B] py-2 font-semibold text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer">
                 {saving ? 'Saving...' : <><Save size={15}/> Save Entry</>}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer">
                 Cancel
              </button>
           </div>
        </div>
      )}

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="saas-card bg-white p-4.5 border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-all">
             <div className="flex items-center gap-3.5 min-w-0">
               {r.avatar ? (
                 <img src={r.avatar} className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0" />
               ) : (
                 <div className="w-11 h-11 rounded-full bg-[#121212] text-[#F4BF4B] font-bold text-sm flex items-center justify-center shrink-0">
                   {r.travelerName?.[0] || 'N'}
                 </div>
               )}
               <div className="min-w-0">
                 <h4 className="font-sans font-bold text-sm text-slate-900 truncate">{r.travelerName}</h4>
                 <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                   <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9E1B1D] bg-rose-50 px-2 py-0.2 rounded border border-rose-100">{r.role}</span>
                   <span className="text-slate-300">|</span>
                   <div className="flex text-amber-400">
                     {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                   </div>
                 </div>
               </div>
             </div>

             <p className="flex-1 px-0 md:px-4 text-xs font-normal text-slate-600 italic line-clamp-2">"{r.content}"</p>

             <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t border-slate-100 md:border-none pt-3 md:pt-0">
               <button 
                 onClick={() => { setEditingId(r.id); setFormData(r); setShowForm(true); }} 
                 className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer" 
                 title="Edit Review"
               >
                 <Edit2 size={15} />
               </button>
               <button 
                 onClick={() => handleDelete(r.id, r.avatar || '')} 
                 className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer" 
                 title="Delete Review"
               >
                 <Trash2 size={15} />
               </button>
             </div>
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12 saas-card bg-slate-50/50 border-dashed border-slate-200">
            <Star className="mx-auto mb-2.5 text-slate-300" size={28} />
            <p className="font-semibold text-xs text-slate-600">No logs found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Add your first authenticated traveler review</p>
          </div>
        )}
      </div>
    </div>
  );
};