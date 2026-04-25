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

  return (
    <div className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#121212] pb-6">
        <div>
          <h2 className="font-brand font-black text-2xl md:text-3xl uppercase tracking-tight text-[#121212]">Field Logs</h2>
          <p className="font-bold text-xs uppercase tracking-widest text-gray-500 mt-2">Manage Authenticated Traveler Reviews</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="w-full sm:w-auto bg-[#121212] text-[#F4BF4B] px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B] flex items-center justify-center gap-2">
          <Plus size={16} /> NEW ENTRY
        </button>
      </div>

      {showForm && (
        <div className="border-4 border-[#121212] p-6 md:p-8 bg-white shadow-[8px_8px_0px_0px_#121212] space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                 <input type="text" placeholder="TRAVELER NAME" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full p-4 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-black uppercase text-xs tracking-widest transition-colors" />
                 <input type="text" placeholder="ROLE (e.g. Verified Explorer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-black uppercase text-xs tracking-widest transition-colors" />
                 <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full p-4 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-black uppercase text-xs tracking-widest transition-colors cursor-pointer">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} STARS</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 <textarea placeholder="REVIEW CONTENT" rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] font-bold text-sm transition-colors resize-none" />
                 <div className="flex items-center gap-4">
                    <div className="size-20 border-2 border-[#121212] flex items-center justify-center bg-[#FCFBF7] overflow-hidden shrink-0 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                       {previewUrl || formData.avatar ? <img src={previewUrl || formData.avatar} className="w-full h-full object-cover grayscale-[30%]" /> : <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 text-center px-1">NO<br/>IMG</span>}
                    </div>
                    <label className="flex-1 border-2 border-[#121212] bg-white hover:bg-[#F4BF4B] p-4 text-center cursor-pointer font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] transition-colors">
                       <Upload size={16} className="mx-auto mb-2"/> UPLOAD AVATAR
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-4 border-[#121212]">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#F4BF4B] transition-colors flex items-center justify-center gap-2">
                 {saving ? 'SAVING...' : <><Save size={16}/> SAVE ENTRY</>}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-white border-2 border-[#121212] text-[#121212] hover:bg-gray-100 py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] transition-colors flex items-center justify-center gap-2">
                 <X size={16}/> CANCEL
              </button>
           </div>
        </div>
      )}

      <div className="space-y-6">
        {reviews.map(r => (
          <div key={r.id} className="border-2 border-[#121212] p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[4px_4px_0px_0px_#121212]">
             <div className="flex items-center gap-4">
               <img src={r.avatar} className="size-16 border-2 border-[#121212] object-cover shrink-0 grayscale-[30%]" />
               <div>
                 <h4 className="font-black text-base uppercase tracking-tight text-[#121212]">{r.travelerName}</h4>
                 <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">{r.role}</p>
                   <span className="text-gray-300">|</span>
                   <div className="flex text-[#F4BF4B]">
                     {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                   </div>
                 </div>
               </div>
             </div>
             <p className="flex-1 px-0 md:px-6 text-xs font-bold text-gray-600 italic line-clamp-2">"{r.content}"</p>
             <div className="flex gap-3 w-full md:w-auto shrink-0 border-t-2 border-[#121212] md:border-none pt-4 md:pt-0">
               <button onClick={() => { setEditingId(r.id); setFormData(r); setShowForm(true); }} className="flex-1 md:flex-none p-3 bg-white border-2 border-[#121212] text-[#121212] hover:bg-[#F4BF4B] transition-colors shadow-[2px_2px_0px_0px_#121212]" title="Edit">
                 <Edit2 size={16} className="mx-auto" />
               </button>
               <button onClick={() => handleDelete(r.id, r.avatar || '')} className="flex-1 md:flex-none p-3 bg-[#121212] border-2 border-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[2px_2px_0px_0px_#F4BF4B]" title="Delete">
                 <Trash2 size={16} className="mx-auto" />
               </button>
             </div>
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-[#121212] bg-white">
            <Star className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="font-black text-sm uppercase tracking-widest text-[#121212]">No logs found</p>
            <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 mt-1">Add your first authenticated review</p>
          </div>
        )}
      </div>
    </div>
  );
};