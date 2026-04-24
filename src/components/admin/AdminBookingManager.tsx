import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { User, Calendar, CreditCard, Trash2, CheckCircle } from 'lucide-react';

export const AdminBookingManager = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    const snap = await getDocs(collection(db, 'bookings'));
    setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'bookings', id), { status });
    loadBookings();
  };

  if (loading) return <div className="p-10 font-black uppercase opacity-20">Accessing Ledgers...</div>;

  return (
    <div className="space-y-6">
      <h2 className="font-brand font-black text-4xl uppercase mb-8">Manifesto Ledger</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookings.map(b => (
          <div key={b.id} className="border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0_0_#121212] space-y-4">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
               <div>
                  <h4 className="font-black text-lg uppercase leading-none">{b.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{b.email}</p>
               </div>
               <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700 border-green-700' : 'bg-yellow-100 text-yellow-700 border-yellow-700'}`}>
                 {b.status}
               </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-tight text-gray-600">
               <div className="flex items-center gap-2"><Calendar size={14}/> {b.startDate}</div>
               <div className="flex items-center gap-2 text-[#9E1B1D]"><CreditCard size={14}/> ₹{b.amountPaid?.toLocaleString()}</div>
               <div className="col-span-2 flex items-center gap-2 border-t pt-2"><Zap size={14}/> {b.packageTitle}</div>
            </div>
            <div className="flex gap-2 pt-4">
               <button onClick={() => updateStatus(b.id, 'Confirmed')} className="flex-1 bg-[#121212] text-white py-2 font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-colors">Confirm</button>
               <button onClick={async () => { if(window.confirm("Purge booking?")) { await deleteDoc(doc(db, 'bookings', b.id)); loadBookings(); } }} className="p-2 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                 <Trash2 size={16}/>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};