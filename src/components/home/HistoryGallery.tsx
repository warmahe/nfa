import React from 'react';
import { DESTINATIONS } from '../../constants';

export const HistoryGallery = () => {
  return (
    <section className="border-b-4 border-nfa-charcoal bg-nfa-charcoal py-16 overflow-hidden text-nfa-cream">
      <div className="px-8 lg:px-16 mb-12">
        <h2 className="font-brand text-5xl font-black uppercase text-nfa-gold">Archival Footage</h2>
      </div>

      <div className="flex overflow-x-auto gap-8 px-8 lg:px-16 pb-8 snap-x no-scrollbar">
        {DESTINATIONS.slice(3, 8).map((dest) => (
          <div key={dest.id} className="shrink-0 w-75 md:w-100 snap-start border-4 border-nfa-cream p-2">
            <div className="aspect-square bg-nfa-charcoal border-2 border-nfa-cream overflow-hidden">
               <img src={dest.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt={dest.name} />
            </div>
            <div className="mt-4 flex justify-between items-end">
               <span className="font-sans font-bold uppercase tracking-widest text-xs">Sector: {dest.name}</span>
               <span className="font-brand font-black text-nfa-burgundy">2024</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};