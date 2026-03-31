import React from 'react';
import { REVIEWS } from '../../constants';
import { Quote } from 'lucide-react';

export const Voices = () => {
  return (
    <section className="bg-nfa-gold py-24 md:py-32 px-4 lg:px-12 text-nfa-charcoal border-b-2 border-nfa-charcoal">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center">
        
        <div className="border border-nfa-charcoal/30 px-6 py-2 mb-10 text-[10px] font-bold uppercase tracking-[0.3em] text-nfa-charcoal">
          The Collective
        </div>
        
        <h2 className="font-brand font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase text-center mb-20 leading-[0.85]">
          VOICES FROM <br/> THE FIELD.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          {REVIEWS.slice(0, 3).map((review, i) => (
            <div key={i} className="flex flex-col group">
              <Quote size={48} className="text-[#D83333] mb-6 drop-shadow-sm opacity-80" strokeWidth={1.5} />
              
              <p className="font-brand italic text-2xl md:text-3xl leading-snug text-nfa-charcoal mb-8 flex-1">
                "{review.content}"
              </p>
              
              <div className="border-t-4 border-nfa-charcoal pt-6">
                 <h4 className="font-brand font-black text-lg md:text-xl uppercase">{review.author}</h4>
                 <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-nfa-charcoal/60 mt-1">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};