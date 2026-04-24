import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Plus, Trash2, Map } from 'lucide-react';

export const AdminDestinationManager = () => {
  const [dests, setDests] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    const snap = await getDocs(collection(db, 'destinations'));
    setDests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addDest = async () => {
    if (!newName) return;
    const id = newName.toLowerCase().replace(/\s+/g, '-');
    await setDoc(doc(db, 'destinations', id), { name: newName.toUpperCase(), id });
    setNewName('');
    setShowAdd(false);
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="font-brand font-black text-4xl uppercase">Regional Registry</h2>
        <button onClick={() => setShowAdd(true)} className="bg-[#121212] text-[#F4BF4B] px-6 py-3 font-black text-xs uppercase">+ New Region</button>
      </div>

      {showAdd && (
        <div className="p-6 border-4 border-[#121212] bg-gray-50 flex gap-4">
          <input className="flex-1 p-4 border-2 border-[#121212] uppercase font-bold" placeholder="REGION NAME" value={newName} onChange={e => setNewName(e.target.value)} />
          <button onClick={addDest} className="bg-green-600 text-white px-8 font-black uppercase text-xs shadow-[4px_4px_0_0_#000]">Create</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dests.map(d => (
          <div key={d.id} className="p-6 border-2 border-[#121212] bg-white flex justify-between items-center group shadow-[4px_4px_0_0_#121212]">
             <div className="flex items-center gap-4 text-[#121212]">
                <Map size={20} className="text-[#9E1B1D]" />
                <span className="font-black text-sm uppercase tracking-tighter">{d.name}</span>
             </div>
             <button onClick={async () => { if(window.confirm("Delete region?")) { await deleteDoc(doc(db, 'destinations', d.id)); load(); } }} className="opacity-0 group-hover:opacity-100 text-red-600">
               <Trash2 size={16}/>
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};