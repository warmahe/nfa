import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Info, AlertCircle, Map as MapIcon } from 'lucide-react';
import { getSubcollectionData } from '../../services/firebaseService';
import { JoiningPoint } from '../../types/database';

interface JoiningPointsDisplayProps {
  packageId: string;
  packageTitle: string;
}

export const JoiningPointsDisplay: React.FC<JoiningPointsDisplayProps> = ({ packageId }) => {
  const [points, setPoints] = useState<JoiningPoint[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubcollectionData('packages', packageId, 'joiningPoints');
        const sorted = (data as JoiningPoint[]).sort((a, b) => (a.order || 0) - (b.order || 0));
        setPoints(sorted);
        if (sorted.length > 0) setSelectedId(sorted[0].id);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, [packageId]);

  if (loading || points.length === 0) return null;

  const activePoint = points.find((p) => p.id === selectedId) || points[0];

  return (
    <section className="py-12 border-t-4 border-[#121212]">
      <h2 className="font-brand font-black text-4xl uppercase text-[#121212] mb-8">Starting Locations</h2>

      {/* Grid for Selection and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Selectors */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/40 mb-4">Choose Departure</p>
          {points.map((point) => (
            <button
              key={point.id}
              onClick={() => setSelectedId(point.id)}
              className={`w-full text-left p-4 border-2 font-bold text-sm transition-all flex justify-between items-center ${
                selectedId === point.id
                  ? 'border-[#121212] bg-[#F4BF4B] shadow-[4px_4px_0px_0px_#121212] -translate-x-1 -translate-y-1'
                  : 'border-[#121212]/10 bg-white hover:border-[#121212]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} /> {point.city}
              </div>
              {point.included ? <span className="text-[9px] uppercase font-black opacity-40">Included</span> : <span className="text-[9px] uppercase font-black text-[#9E1B1D]">+ {point.additionalCost}</span>}
            </button>
          ))}
        </div>

        {/* Right: Details Card */}
        <div className="lg:col-span-8 bg-white border-4 border-[#121212] p-6 md:p-10 shadow-[8px_8px_0px_0px_#121212]">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 border-b border-gray-100 pb-8">
            <div>
               <h3 className="font-brand font-black text-3xl uppercase mb-2">{activePoint.location}</h3>
               <p className="flex items-center gap-2 text-sm font-bold text-[#121212]/60 uppercase tracking-widest">
                  <Clock size={16} className="text-[#9E1B1D]"/> Meeting Time: {activePoint.pickupTime}
               </p>
            </div>
            <div className="bg-[#121212] text-white px-6 py-4 flex flex-col items-center justify-center min-w-[140px]">
               <span className="text-[8px] font-black tracking-widest uppercase opacity-50 mb-1">Status</span>
               <span className="font-bold text-xs">READY FOR PICKUP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h4 className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Info size={14}/> Instructions</h4>
                <p className="text-sm leading-relaxed text-gray-600 italic font-serif">"{activePoint.instructions}"</p>
             </div>
             <div className="aspect-video bg-gray-100 border-2 border-[#121212] overflow-hidden flex items-center justify-center grayscale">
                <MapIcon size={32} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-30 ml-2">Static Map Preview</span>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};