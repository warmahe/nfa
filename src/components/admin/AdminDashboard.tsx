import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Plus, Trash2, Package as PackageIcon } from 'lucide-react';
import { AdminPackageEditor } from './AdminPackageEditor';

export const AdminDashboard = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'packages'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPackages(data.sort((a: any, b: any) => a.title?.localeCompare(b.title)));
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } finally { setLoading(false); }
  };

  const createPackage = async () => {
    const title = prompt("ENTER EXPEDITION NAME:");
    if (!title) return;
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    try {
      const docRef = await addDoc(collection(db, 'packages'), {
        title: title.toUpperCase(),
        slug,
        price: '₹0',
        duration: '0 DAYS',
        description: '',
        itinerary: [],
        joiningPoints: [],
        status: 'draft',
        createdAt: Timestamp.now()
      });
      loadPackages();
      setSelectedId(docRef.id);
    } catch (err) { alert("ERROR DEPLOYING SECTOR."); }
  };

  const deletePackage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("PURGE THIS SECTOR PERMANENTLY?")) return;
    await deleteDoc(doc(db, 'packages', id));
    if (selectedId === id) setSelectedId(null);
    loadPackages();
  };

  if (loading) return <div className="p-20 font-black uppercase opacity-20 text-center">Scanning Database...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-3 space-y-4">
        <button onClick={createPackage} className="w-full bg-[#F4BF4B] border-4 border-[#121212] py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2">
          <Plus size={16}/> New Expedition
        </button>
        <div className="space-y-2">
          {packages.map(p => (
            <div key={p.id} onClick={() => setSelectedId(p.id)} className={`p-4 border-2 cursor-pointer transition-all flex justify-between items-center group ${selectedId === p.id ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-[4px_4px_0_0_#9E1B1D]' : 'bg-white border-gray-200'}`}>
              <span className="font-black text-[10px] uppercase truncate pr-2">{p.title}</span>
              <button onClick={(e) => deletePackage(p.id, e)} className="opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-9 border-4 border-[#121212] bg-white p-6 md:p-10 shadow-[8px_8px_0_0_#121212]">
        {selectedId ? <AdminPackageEditor key={selectedId} packageId={selectedId} /> : <div className="h-96 flex flex-col items-center justify-center opacity-20"><PackageIcon size={64}/><h2 className="font-brand font-black text-2xl uppercase">Select Sector</h2></div>}
      </div>
    </div>
  );
};