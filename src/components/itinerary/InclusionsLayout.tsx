import React, { useState, useEffect } from 'react';
import { Check, Plus, Info, Compass, Coffee, CarFront, BedDouble, ArrowRight } from 'lucide-react';
import { getSubcollectionData } from '../../services/firebaseService';
import { Activity } from '../../types/database';

export const InclusionsLayout = ({ packageId }: { packageId: string }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSubcollectionData('packages', packageId, 'activities');
        setActivities((data as Activity[]).sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, [packageId]);

  const provisionGrid = [
    { title: "Discovery", icon: Compass, items: ["Entry Permits", "Local Access Fees", "Guided Routes"] },
    { title: "Meals", icon: Coffee, items: ["Daily Breakfast", "Gourmet Dinners", "Energy Kits"] },
    { title: "Transit", icon: CarFront, items: ["4x4 Custom Jeeps", "Airport Transfers", "Local Fuel"] },
    { title: "Stay", icon: BedDouble, items: ["Luxury Basecamps", "Mountain Lodges", "All Linens"] },
  ];

  if (loading) return null;

  return (
    <section className="py-24 border-t-4 border-[#121212] overflow-hidden">
      
      {/* 1. THE PROVISIONS (What's Included) */}
      <div className="mb-24">
        <div className="flex flex-col md:flex-row items-baseline gap-6 mb-12">
          <h2 className="font-brand font-black text-6xl md:text-8xl uppercase tracking-tighter text-[#121212]">The Provisions</h2>
          <span className="font-sans font-bold text-xs uppercase tracking-[0.4em] text-[#9E1B1D]">What We Provide</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {provisionGrid.map((p, idx) => (
             <div key={idx} className="relative group border-4 border-[#121212] p-8 bg-white shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="size-12 bg-[#F4BF4B] border-2 border-[#121212] flex items-center justify-center mb-8 -rotate-6 group-hover:rotate-0 transition-transform">
                   <p.icon size={24} />
                </div>
                <h4 className="font-black text-xl uppercase tracking-tight mb-4">{p.title}</h4>
                <ul className="space-y-3">
                   {p.items.map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                        <div className="size-1.5 bg-[#9E1B1D] shrink-0" /> {item}
                     </li>
                   ))}
                </ul>
             </div>
           ))}
        </div>
      </div>

      {/* 2. SIGNATURE EXPERIENCES (Activities) */}
      <div className="mb-24">
        <div className="flex flex-col md:flex-row items-baseline gap-6 mb-12">
          <h2 className="font-brand font-black text-6xl md:text-8xl uppercase tracking-tighter text-[#121212]">Signature</h2>
          <span className="font-sans font-bold text-xs uppercase tracking-[0.4em] text-[#9E1B1D]">Daily Highlights</span>
        </div>

        <div className="space-y-6">
          {activities.map((act, i) => (
            <div key={i} className={`flex flex-col lg:flex-row border-4 border-[#121212] overflow-hidden transition-all hover:bg-white shadow-[10px_10px_0px_0px_#121212] ${act.isIncluded ? 'bg-white' : 'bg-[#121212] text-white'}`}>
              
              {/* Day Badge */}
              <div className={`p-8 lg:w-48 flex flex-row lg:flex-col items-center justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] ${act.isIncluded ? 'bg-[#FCFBF7]' : 'bg-[#9E1B1D]'}`}>
                 <span className="font-sans font-black text-xs uppercase tracking-widest opacity-40 lg:mb-2">{act.isIncluded ? 'Day' : 'Extra'}</span>
                 <span className="font-brand font-black text-6xl lg:text-8xl ml-4 lg:ml-0 leading-none">{act.isIncluded ? `0${act.day}` : '+'}</span>
              </div>

              {/* Activity Info */}
              <div className="p-8 flex-1 flex flex-col justify-center">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="font-brand font-black text-3xl md:text-4xl uppercase tracking-tight leading-none">{act.title}</h3>
                    {!act.isIncluded && <span className="bg-[#F4BF4B] text-[#121212] px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-[#121212]">₹{act.price}</span>}
                 </div>
                 <p className="font-serif italic text-lg opacity-70 mb-6 max-w-2xl leading-relaxed">"{act.description}"</p>
                 <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-40">
                    <span className="flex items-center gap-2"><Compass size={12}/> Location: {act.location}</span>
                    <span className="flex items-center gap-2"><Check size={12}/> Duration: {act.duration}</span>
                 </div>
              </div>

              {/* Hover Trigger */}
              <div className="hidden lg:flex items-center px-8 border-l-4 border-[#121212] opacity-10 hover:opacity-100 transition-opacity cursor-pointer">
                 <ArrowRight size={48} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. GOOD TO KNOW (Protocol) */}
      <div className="relative">
         <div className="bg-[#F4BF4B] border-4 border-[#121212] p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center shadow-[15px_15px_0px_0px_#9E1B1D]">
            <div className="md:w-1/2">
               <h2 className="font-brand font-black text-5xl md:text-6xl uppercase tracking-tighter leading-none mb-6">Good To Know.</h2>
               <p className="font-sans font-bold text-sm uppercase tracking-widest text-[#121212]/60">Standard policies and protocols for all travelers.</p>
            </div>
            <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 "All prices in INR per person.",
                 "Mandatory Travel Insurance.",
                 "Zero-Waste Policy enforced.",
                 "Small groups: Max 6 Guests.",
                 "Cancellation up to 30 days.",
                 "Local Guides provided 24/7."
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 border-b-2 border-black/10 pb-2">
                    <div className="size-2 bg-[#9E1B1D] rotate-45 shrink-0" />
                    <span className="font-black text-[10px] uppercase tracking-widest">{item}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

    </section>
  );
};