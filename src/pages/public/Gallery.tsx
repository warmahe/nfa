import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Database, FolderKanban, Map } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';

export const Gallery = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'gallery'));
        if (snap.exists()) setFolders(snap.data().items || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen bg-nfa-cream p-20 font-black uppercase">Loading Archives...</div>;

  return (
    <div className="min-h-screen bg-nfa-cream text-nfa-charcoal nfa-texture pt-10 pb-24">
      <div className="max-w-[1440px] mx-auto px-[clamp(0.5rem,3vw,3rem)]">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-20 border-b-[4px] border-nfa-charcoal pb-8">
           <div>
             <h1 className="font-brand font-black uppercase text-[clamp(2.5rem,8vw,7rem)] leading-[0.8] tracking-tighter">
                CLASSIFIED <br/> <span className="text-[#9E1B1D]">GALLERY.</span>
             </h1>
           </div>
           <p className="font-sans font-bold uppercase tracking-[0.1em] text-sm text-[#121212]/70 max-w-sm border-l-[3px] border-[#9E1B1D] pl-4">
             Digital extraction zones organized by sector. Access files to review geographic conditions.
           </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {folders.map((trip) => (
            <Link key={trip.id} to={`/gallery/${trip.destination.toLowerCase()}`} className="group border-[2px] md:border-[4px] border-nfa-charcoal bg-[#FCFBF7] p-2 md:p-3 shadow-[4px_4px_0px_0px_#121212] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col">
              <div className="flex justify-between items-center mb-3">
                 <span className="font-sans font-black text-xs uppercase tracking-widest truncate">{trip.title}</span>
                 <div className="font-mono text-[10px] uppercase font-bold text-nfa-charcoal/40">
                   {trip.images?.length || 0} FILES
                 </div>
              </div>
              <div className="relative aspect-[4/3] border-2 md:border-[3px] border-nfa-charcoal overflow-hidden mb-4 bg-gray-200">
                 <img src={trip.url} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" alt={trip.title}/>
              </div>
              <div className="border-t-[2px] border-nfa-charcoal/20 pt-3 flex justify-between items-center mt-auto">
                <span className="font-sans font-bold text-[9px] uppercase tracking-[0.2em] text-[#9E1B1D]">View Sector Archives</span>
                <span className="font-brand font-black text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};