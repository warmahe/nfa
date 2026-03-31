import React from 'react';
import { REVIEWS } from '../../constants';
import { Quote } from 'lucide-react';

export const Testimonials = () => {
  return (
    <section className="bg-nfa-gold border-b-4 border-nfa-charcoal grid grid-cols-1 lg:grid-cols-2">
      <div className="p-8 lg:p-16 border-b-4 lg:border-b-0 lg:border-r-4 border-nfa-charcoal flex flex-col justify-between">
         <Quote className="size-24 text-nfa-charcoal" />
         <div className="mt-12">
           <h2 className="font-brand text-5xl md:text-7xl font-black uppercase text-nfa-charcoal leading-none mb-6" style={{ textShadow: '2px 2px 0px #FCFBF7' }}>
             Field <br/> Reports
           </h2>
           <p className="font-sans font-bold uppercase tracking-widest">Verified Survivor Logs</p>
         </div>
      </div>

      <div className="p-8 lg:p-16 bg-nfa-cream flex flex-col justify-center">
         <p className="font-brand text-2xl md:text-4xl font-black italic text-nfa-charcoal leading-tight mb-8 border-l-8 border-[#9E1B1D] pl-6">
           "{REVIEWS[0].content}"
         </p>
         <div className="flex items-center gap-6 mt-8 border-t-4 border-nfa-charcoal pt-8">
            <img src={REVIEWS[0].avatar} className="size-16 object-cover border-4 border-nfa-charcoal grayscale" alt="Reviewer" />
            <div>
               <h4 className="font-brand font-black text-2xl uppercase">{REVIEWS[0].author}</h4>
               <p className="font-sans text-xs font-bold uppercase tracking-widest text-[#9E1B1D]">{REVIEWS[0].role}</p>
            </div>
         </div>
      </div>
    </section>
  );
};