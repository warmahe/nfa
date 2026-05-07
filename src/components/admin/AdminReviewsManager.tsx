import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Edit2, Star, X } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, uploadImage, deleteImage } from '../../services/firebaseService';
import { Review } from '../../types/database';

export const AdminReviewsManager = () => {
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
    if (!formData.travelerName || !formData.content) return alert("All fields required");
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'global_reviews', editingId), { ...formData, updatedAt: Timestamp.now() });
      } else {
        await addDoc(collection(db, 'global_reviews'), { ...formData, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
      }
      setShowForm(false);
      setPreviewUrl('');
      loadReviews();
    } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) return alert("File too large. Max 1MB.");

    try {
      // 1. Delete old avatar if exists
      if (formData.avatar) await deleteImage(formData.avatar);
      
      // 2. Upload new
      const url = await uploadImage(file, 'avatars');
      setFormData(prev => ({ ...prev, avatar: url }));
      setPreviewUrl(url);
    } catch (error) { alert("Upload failed"); }
  };

  const handleDelete = async (id: string, avatarUrl: string) => {
    if (!window.confirm("Delete this log?")) return;
    if (avatarUrl) await deleteImage(avatarUrl);
    await deleteDoc(doc(db, 'global_reviews', id));
    loadReviews();
  };

  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">Field Logs</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1">Manage authenticated traveler reviews</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all">
          <Plus size={16} /> New Entry
        </button>
      </div>

      {showForm && (
        <div className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6 lg:p-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <input type="text" placeholder="Traveler Name" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className={inputClass} />
                 <input type="text" placeholder="Role (e.g. Verified Explorer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputClass} />
                 <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className={inputClass + " cursor-pointer"}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 <textarea placeholder="Your Review" rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className={inputClass + " resize-none"} />
                 <div className="flex items-center gap-4">
                    <div className="size-20 rounded-[14px] border-2 border-[#121212]/10 flex items-center justify-center bg-[#FCFBF7] overflow-hidden shrink-0">
                       {previewUrl || formData.avatar ? <img src={previewUrl || formData.avatar} className="w-full h-full object-cover" /> : <span className="text-[9px] uppercase font-black tracking-widest text-[#121212]/30 text-center px-1">NO<br/>IMG</span>}
                    </div>
                    <label className="flex-1 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 p-4 text-center cursor-pointer font-black text-[10px] uppercase tracking-widest transition-colors">
                       <Upload size={16} className="mx-auto mb-2"/> Upload Avatar
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-[#121212]/10">
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-[14px] bg-[#121212] text-[#F4BF4B] py-3 font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors disabled:opacity-50">
                 {saving ? 'SAVING...' : <><Save size={16}/> Save Entry</>}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 flex items-center justify-center gap-2 rounded-[14px] border-2 border-[#121212]/10 text-[#121212] py-3 font-black text-[11px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors">
                 <X size={16}/> Cancel
              </button>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:shadow-[0_16px_32px_rgba(18,18,18,0.1)] transition-all">
             <div className="flex items-center gap-4">
               <img src={r.avatar} className="size-14 rounded-full border-2 border-[#121212]/10 object-cover shrink-0" />
               <div>
                 <h4 className="font-black text-sm uppercase tracking-tight text-[#121212]">{r.travelerName}</h4>
                 <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">{r.role}</p>
                   <span className="text-[#121212]/20">|</span>
                   <div className="flex text-[#F4BF4B]">
                     {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                   </div>
                 </div>
               </div>
             </div>
             <p className="flex-1 px-0 md:px-6 text-xs font-bold text-[#121212]/50 italic line-clamp-2">"{r.content}"</p>
             <div className="flex gap-2 w-full md:w-auto shrink-0 border-t-2 border-[#121212]/10 md:border-none pt-4 md:pt-0">
               <button onClick={() => { setEditingId(r.id); setFormData(r); setShowForm(true); }} className="flex-1 md:flex-none p-3 rounded-[12px] bg-white border-2 border-[#121212]/10 text-[#121212] hover:bg-[#F4BF4B]/10 transition-colors" title="Edit">
                 <Edit2 size={16} className="mx-auto" />
               </button>
               <button onClick={() => handleDelete(r.id, r.avatar || '')} className="flex-1 md:flex-none p-3 rounded-[12px] bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white transition-colors" title="Delete">
                 <Trash2 size={16} className="mx-auto" />
               </button>
             </div>
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12 rounded-[18px] border-2 border-dashed border-[#121212]/10 bg-white">
            <Star className="mx-auto mb-3 text-[#121212]/20" size={32} />
            <p className="font-black text-sm uppercase tracking-widest text-[#121212]/60">No logs found</p>
            <p className="font-bold text-[10px] uppercase tracking-widest text-[#121212]/40 mt-1">Add your first authenticated review</p>
          </div>
        )}
      </div>
    </div>
  );
};