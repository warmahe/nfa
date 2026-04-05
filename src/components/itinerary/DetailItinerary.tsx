import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { ItineraryMap } from '../destinations/ItineraryMap';

const ITINERARY_DAYS = [
  { day: 1, title: "ARRIVAL & DISCOVERY", desc: "Touch down and meet the team. We head straight to the base camp for orientation and a local welcome dinner." },
  { day: 2, title: "INTO THE WILD", desc: "First true day of the journey. We trek through ancient valleys and set up our first off-grid camp." },
  { day: 3, title: "THE PEAK", desc: "The most challenging day. We ascend to the highest viewpoint for a 360-degree look at the landscape." },
  { day: 4, title: "CULTURAL IMMERSION", desc: "Meeting local families. Sharing stories and learning traditional survival skills." },
  { day: 5, title: "SAFE PASSAGE HOME", desc: "Final reflections by the fire before heading back to the airport." }
];

export const DetailItinerary = ({ destination }: { destination: string }) => {
  const [openDay, setOpenDay] = useState<number | null>(1);

  return (
    <section>
      <h2 className="font-brand font-black text-4xl uppercase text-[#121212] mb-10">The Journey</h2>
      
      <div className="mb-12">
        <ItineraryMap destination={destination} />
      </div>

      <div className="space-y-4">
        {ITINERARY_DAYS.map((item) => (
          <div key={item.day} className={`border-2 border-[#121212] transition-all ${openDay === item.day ? 'bg-white shadow-[6px_6px_0px_0px_#F4BF4B]' : 'bg-[#FCFBF7]'}`}>
            <button 
              onClick={() => setOpenDay(openDay === item.day ? null : item.day)}
              className="w-full p-6 flex justify-between items-center group"
            >
              <div className="flex items-center gap-6">
                <span className="font-brand font-black text-3xl text-[#9E1B1D] opacity-40 group-hover:opacity-100 transition-opacity">0{item.day}</span>
                <h3 className="font-black text-lg uppercase tracking-tight">{item.title}</h3>
              </div>
              {openDay === item.day ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
            </button>
            
            {openDay === item.day && (
              <div className="px-6 pb-8 md:pl-[104px] animate-in fade-in slide-in-from-top-2 duration-300">
                 <p className="font-serif italic text-lg text-gray-600 leading-relaxed border-l-2 border-[#F4BF4B] pl-6 max-w-2xl">
                   "{item.desc}"
                 </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};