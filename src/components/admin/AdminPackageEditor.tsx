import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, ArrowLeft, Loader2, MapPin, Zap } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, deleteImage } from '../../services/firebaseService';
import { Notification } from '../shared/Notification';

export const AdminPackageEditor = ({ packageId }: { packageId: string }) => {
  const [pkg, setPkg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('SPECS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'packages', packageId));
      if (snap.exists()) {
        const data = snap.data();
        setPkg({
          title: data.title || '', price: data.price || '', duration: data.duration || '',
          description: data.description || '', difficulty: data.difficulty || '',
          groupSize: data.groupSize || '', bestTime: data.bestTime || '',
          itinerary: data.itinerary || [], joiningPoints: data.joiningPoints || [],
          activities: data.activities || []
        });
      }
      setLoading(false);
    };
    load();
  }, [packageId]);

  const notify = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'packages', packageId), pkg);
      notify("EXPEDITION DATA SYNCED.", "success");
    } catch (err) { notify("SYNC FAILED.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-10 font-black uppercase opacity-20">Scanning Sector...</div>;

  return (
    <div className="space-y-8">
      {notification && <Notification text={notification.text} type={notification.type} />}

      {/* SUB-NAV */}
      <div className="flex justify-between items-center border-b-4 border-[#121212] pb-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {['SPECS', 'ITINERARY', 'LOGISTICS'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`font-black text-[10px] uppercase tracking-widest pb-2 border-b-4 transition-all ${activeTab === t ? 'border-[#9E1B1D] text-[#9E1B1D]' : 'border-transparent text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-[#121212] text-[#F4BF4B] px-8 py-3 font-black text-xs uppercase shadow-[4px_4px_0_0_#9E1B1D]">
          {saving ? 'SYNCING...' : 'SAVE ALL'}
        </button>
      </div>

      {/* 1. SPECS VIEW */}
      {activeTab === 'SPECS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="font-black text-[10px] uppercase opacity-40">Mission Title</label>
            <input className="w-full p-4 border-2 border-gray-200 outline-none focus:border-[#121212] font-bold" value={pkg.title} onChange={e => setPkg({...pkg, title: e.target.value})} />
            <label className="font-black text-[10px] uppercase opacity-40">Description</label>
            <textarea rows={6} className="w-full p-4 border-2 border-gray-200 font-serif italic text-lg" value={pkg.description} onChange={e => setPkg({...pkg, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4 h-fit">
            {['price', 'duration', 'difficulty', 'groupSize', 'bestTime'].map(f => (
              <div key={f} className="space-y-2">
                <label className="font-black text-[10px] uppercase opacity-40">{f}</label>
                <input className="w-full p-3 border-2 border-gray-200 font-bold uppercase text-xs" value={pkg[f]} onChange={e => setPkg({...pkg, [f]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ITINERARY VIEW */}
      {activeTab === 'ITINERARY' && (
        <div className="space-y-4">
          <button onClick={() => setPkg({...pkg, itinerary: [...pkg.itinerary, { day: pkg.itinerary.length + 1, title: '', desc: '' }]})} className="w-full py-4 border-2 border-dashed border-gray-300 font-black text-[10px] uppercase">+ Add Day</button>
          {pkg.itinerary.map((day: any, idx: number) => (
            <div key={idx} className="border-2 border-[#121212] p-6 flex flex-col md:flex-row gap-6 bg-white shadow-[4px_4px_0_0_#F4BF4B]">
               <span className="font-brand font-black text-5xl opacity-20">0{day.day}</span>
               <div className="flex-1 space-y-4">
                  <input className="w-full bg-transparent border-b-2 border-gray-100 font-black uppercase text-xl outline-none focus:border-[#121212]" value={day.title} placeholder="PHASE OBJECTIVE" onChange={e => {
                    const ni = [...pkg.itinerary]; ni[idx].title = e.target.value; setPkg({...pkg, itinerary: ni});
                  }} />
                  <textarea className="w-full bg-transparent text-sm outline-none" rows={2} value={day.desc} placeholder="Intel details..." onChange={e => {
                    const ni = [...pkg.itinerary]; ni[idx].desc = e.target.value; setPkg({...pkg, itinerary: ni});
                  }} />
               </div>
               <button onClick={() => {
                 const ni = pkg.itinerary.filter((_:any, i:number) => i !== idx).map((d:any, i:number) => ({...d, day: i+1}));
                 setPkg({...pkg, itinerary: ni});
               }} className="text-red-600"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      )}

      {/* 3. LOGISTICS (Joining Points) */}
      {activeTab === 'LOGISTICS' && (
        <div className="space-y-6">
           <button onClick={() => setPkg({...pkg, joiningPoints: [...(pkg.joiningPoints || []), { city: '', time: '', location: '' }]})} className="w-full py-4 border-2 border-dashed border-gray-300 font-black text-[10px] uppercase">+ Add Pickup Point</button>
           {pkg.joiningPoints?.map((pt: any, idx: number) => (
             <div key={idx} className="border-2 border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 relative">
                <input className="p-3 border border-gray-300 uppercase font-black text-[10px]" placeholder="CITY" value={pt.city} onChange={e => {
                  const nj = [...pkg.joiningPoints]; nj[idx].city = e.target.value; setPkg({...pkg, joiningPoints: nj});
                }} />
                <input className="p-3 border border-gray-300 uppercase font-black text-[10px]" placeholder="TIME" value={pt.time} onChange={e => {
                  const nj = [...pkg.joiningPoints]; nj[idx].time = e.target.value; setPkg({...pkg, joiningPoints: nj});
                }} />
                <input className="p-3 border border-gray-300 uppercase font-black text-[10px]" placeholder="LOCATION NAME" value={pt.location} onChange={e => {
                  const nj = [...pkg.joiningPoints]; nj[idx].location = e.target.value; setPkg({...pkg, joiningPoints: nj});
                }} />
                <button onClick={() => {
                  const nj = pkg.joiningPoints.filter((_:any, i:number) => i !== idx);
                  setPkg({...pkg, joiningPoints: nj});
                }} className="absolute -top-3 -right-3 bg-red-600 text-white p-1 rounded-full"><Trash2 size={12}/></button>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};