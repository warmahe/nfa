import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { getSubcollectionData } from '../../../services/firebaseService';
import { FAQ, Package } from '../../../types/database';

interface FAQSectionProps {
  pkg: Package;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ pkg }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!pkg?.id) { setLoading(false); return; }
    getSubcollectionData<FAQ>('packages', pkg.id, 'faqs')
      .then(data => {
        const sorted = data.filter(f => f.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
        setFaqs(sorted);
      })
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, [pkg?.id]);

  if (loading || faqs.length === 0) return null;

  return (
    <section
      id="faqs"
      className="py-24 px-6 md:px-16 bg-[#FCFBF7] border-t-4 border-[#121212]"
      aria-label="Trip Essentials"
    >
      <div className="max-w-[900px] mx-auto">
        {/* Simple Header Area */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">
            <MapPin size={12} strokeWidth={3} /> Trip Essentials
          </span>
          <h2 className="font-brand font-black text-5xl md:text-6xl uppercase tracking-tighter text-[#121212] leading-none">
            Common Questions.
          </h2>
          <p className="mt-6 font-bold text-gray-500 text-xs md:text-sm uppercase tracking-widest max-w-lg mx-auto">
            Everything you need to know about the logistics, gear, and requirements before we depart.
          </p>
        </div>

        {/* Simplified Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className={`border-4 border-[#121212] transition-all duration-300 ${
                  isOpen ? 'bg-white shadow-[6px_6px_0_0_#F4BF4B]' : 'bg-white hover:border-[#F4BF4B]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
                  aria-expanded={isOpen}
                >
                  <div className="flex gap-6 items-center">
                     <span className={`hidden sm:block font-brand font-black text-2xl transition-colors ${
                       isOpen ? 'text-[#F4BF4B]' : 'text-gray-200'
                     }`}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className={`font-black text-sm md:text-lg uppercase tracking-tight leading-tight ${
                      isOpen ? 'text-[#121212]' : 'text-[#121212]/70'
                    }`}>
                      {faq.question}
                    </span>
                  </div>
                  
                  <div className={`shrink-0 size-10 border-2 border-[#121212] flex items-center justify-center transition-all ${
                    isOpen ? 'bg-[#121212] text-white shadow-[2px_2px_0_0_#F4BF4B]' : 'bg-white text-[#121212]'
                  }`}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 md:px-20 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="pt-4 border-t-2 border-gray-50">
                      <p className="font-serif italic text-gray-600 text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Help */}
        <div className="mt-16 p-8 border-2 border-dashed border-[#121212]/10 text-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             Still have questions? Our support team is standing by.
           </p>
           <button className="mt-4 font-black text-xs uppercase tracking-widest text-[#121212] border-b-2 border-[#F4BF4B] pb-1 hover:text-[#9E1B1D] transition-colors">
             Contact HQ
           </button>
        </div>
      </div>
    </section>
  );
};
