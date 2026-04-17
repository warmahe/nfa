import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, Star, Check, AlertCircle, User } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, uploadImage } from '../../services/firebaseService';
import { Review } from '../../types/database';

export const AdminReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState<Partial<Review>>({
    travelerName: '',
    role: 'Verified Explorer',
    content: '',
    rating: 5,
    avatar: '',
    approved: true,
    featured: false
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'global_reviews'));
      const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      setReviews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.travelerName || !formData.content) return alert("Missing required fields");
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'global_reviews', editingId), { ...formData, updatedAt: Timestamp.now() });
      } else {
        await addDoc(collection(db, 'global_reviews'), { 
          ...formData, 
          createdAt: Timestamp.now(), 
          updatedAt: Timestamp.now() 
        });
      }
      setShowForm(false);
      setEditingId(null);
      loadReviews();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      console.log("Attempting to upload file:", file.name);
      const url = await uploadImage(file, 'avatars');
      setFormData(prev => ({ ...prev, avatar: url }));
      alert("✅ Avatar uploaded successfully!");
    } catch (error: any) {
      console.error("FULL UPLOAD ERROR:", error);
      // This will pop up on your screen with the exact Firebase reason
      alert(`❌ UPLOAD FAILED: ${error.message || JSON.stringify(error)}`);
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    await deleteDoc(doc(db, 'global_reviews', id));
    loadReviews();
  };

  if (loading) return <div className="p-8 font-black uppercase text-gray-400 text-xs tracking-widest">Loading Logs...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-brand font-black text-4xl uppercase">Field Logs</h2>
        <button onClick={() => { setEditingId(null); setFormData({ travelerName: '', role: 'Verified Explorer', content: '', rating: 5, avatar: '', approved: true }); setShowForm(true); }} className="bg-[#121212] text-[#F4BF4B] px-6 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0_0_#F4BF4B]">
          <Plus size={16}/> New Entry
        </button>
      </div>

      {showForm && (
        <div className="border-4 border-[#121212] p-8 bg-gray-50 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <input type="text" placeholder="TRAVELER NAME" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs outline-none focus:border-[#121212]" />
                 <input type="text" placeholder="ROLE (e.g. Photographer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs outline-none focus:border-[#121212]" />
                 <select value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full p-4 border-2 border-gray-300 font-bold uppercase text-xs outline-none">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                 </select>
              </div>
              <div className="space-y-4">
                 <textarea placeholder="REVIEW CONTENT" rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-4 border-2 border-gray-300 font-bold text-sm outline-none focus:border-[#121212]" />
                 <div className="flex gap-4">
                    <input type="text" placeholder="AVATAR URL" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} className="flex-1 p-3 border-2 border-gray-300 text-xs" />
                    <label className="bg-white border-2 border-[#121212] px-4 py-2 cursor-pointer font-black text-[10px] uppercase flex items-center gap-2">
                       {uploadingAvatar ? '...' : <><Upload size={14}/> File</>}
                       <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                 </div>
              </div>
           </div>
           <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button onClick={handleSave} disabled={saving} className="bg-[#121212] text-white px-8 py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_0_#9E1B1D]">
                {saving ? 'PROCESSING...' : 'SAVE ENTRY'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-xs uppercase tracking-widest border-2 border-gray-300">Cancel</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {reviews.map(r => (
          <div key={r.id} className="border-2 border-[#121212] p-6 bg-white flex justify-between items-center group">
            <div className="flex items-center gap-6">
               <div className="size-16 border-2 border-[#121212] bg-gray-100 overflow-hidden">
                  {r.avatar ? <img src={r.avatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-300" />}
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase">{r.travelerName}</h4>
                  <p className="text-[10px] font-bold uppercase text-[#9E1B1D]">{r.role} // {r.rating} Stars</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic max-w-xl">"{r.content}"</p>
               </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setEditingId(r.id); setFormData(r); setShowForm(true); }} className="p-2 border-2 border-[#121212] hover:bg-[#F4BF4B] transition-colors"><Star size={16}/></button>
               <button onClick={() => handleDelete(r.id)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};