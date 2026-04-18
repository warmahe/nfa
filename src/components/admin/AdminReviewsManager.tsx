import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Star, X } from 'lucide-react';
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
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-brand font-black text-3xl uppercase">Field Logs</h2>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="w-full sm:w-auto bg-[#121212] text-[#F4BF4B] px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] transition-all">
          + New Entry
        </button>
      </div>

      {showForm && (
        <div className="border-4 border-[#121212] p-6 bg-white space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <input type="text" placeholder="TRAVELER NAME" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs" />
                 <input type="text" placeholder="ROLE" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs" />
                 <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 <textarea placeholder="REVIEW CONTENT" rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold text-sm" />
                 <div className="flex items-center gap-4">
                    <div className="size-20 border-2 border-[#121212] flex items-center justify-center bg-gray-100 overflow-hidden shrink-0">
                       {previewUrl || formData.avatar ? <img src={previewUrl || formData.avatar} className="w-full h-full object-cover" /> : <span className="text-[9px] uppercase font-bold">No Image</span>}
                    </div>
                    <label className="flex-1 border-2 border-[#121212] p-4 text-center cursor-pointer font-black text-[10px] uppercase hover:bg-gray-100">
                       <Upload size={16} className="mx-auto mb-1"/> Upload Avatar
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
              </div>
           </div>
           <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#121212] text-white py-4 font-black text-xs uppercase tracking-widest">{saving ? '...' : 'Save'}</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border-2 border-gray-300 py-4 font-black text-xs uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="border-2 border-[#121212] p-6 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex items-center gap-4">
               <img src={r.avatar} className="size-16 border-2 border-[#121212] object-cover shrink-0" />
               <div>
                 <h4 className="font-black text-sm uppercase">{r.travelerName}</h4>
                 <p className="text-[10px] font-bold uppercase text-[#9E1B1D]">{r.role}</p>
               </div>
             </div>
             <div className="flex gap-2 w-full sm:w-auto">
               <button onClick={() => { setEditingId(r.id); setFormData(r); setShowForm(true); }} className="flex-1 sm:flex-none p-4 border-2 border-[#121212] hover:bg-gray-100"><Star size={16}/></button>
               <button onClick={() => handleDelete(r.id, r.avatar || '')} className="flex-1 sm:flex-none p-4 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors"><Trash2 size={16}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};