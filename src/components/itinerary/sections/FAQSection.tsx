import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getSubcollectionData } from '../../../services/firebaseService';
import { FAQ, Package } from '../../../types/database';

interface FAQSectionProps {
  pkg: Package;
}

const DEFAULT_FAQS: Omit<FAQ, keyof import('../../../types/database').BaseDocument | 'helpfulCount' | 'unhelpfulCount' | 'active' | 'order'>[] = [
  { question: 'Is prior trekking experience required?', answer: 'No prior trekking experience is needed for most of our trips. We cater to all fitness levels and provide full briefings before each activity.' },
  { question: 'What is the cancellation policy?', answer: 'You can cancel up to 30 days before departure for a full refund minus a 5% processing fee. Cancellations within 30 days are non-refundable but can be transferred.' },
  { question: 'Are visa & flights included?', answer: 'No, flights and visa fees are not included. We provide detailed visa guidance specific to your nationality as part of the pre-departure briefing.' },
  { question: 'What should I pack?', answer: 'We send a detailed packing list after booking. General essentials include layered clothing, comfortable trekking shoes, a rain jacket, and a basic first-aid kit.' },
  { question: 'Is travel insurance mandatory?', answer: 'Yes, all participants are required to have comprehensive travel insurance covering emergency evacuation and medical expenses.' },
];

export const FAQSection: React.FC<FAQSectionProps> = ({ pkg }) => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!pkg?.id) { setFaqs(DEFAULT_FAQS as any[]); setLoading(false); return; }
    getSubcollectionData<FAQ>('packages', pkg.id, 'faqs')
      .then(data => {
        const sorted = data.filter(f => f.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
        setFaqs(sorted.length > 0 ? sorted : DEFAULT_FAQS as any[]);
      })
      .catch(() => setFaqs(DEFAULT_FAQS as any[]))
      .finally(() => setLoading(false));
  }, [pkg?.id]);

  if (loading) return null;

  return (
    <section
      id="faqs"
      className="py-24 px-6 md:px-16 bg-[#121212] overflow-hidden"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Left header */}
          <div className="lg:col-span-1">
            <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#F4BF4B] mb-4">
              Got Questions?
            </span>
            <h2 className="font-brand font-black text-5xl md:text-6xl uppercase tracking-tighter text-white leading-[0.85] mb-6">
              FAQ.
            </h2>
            <p className="font-sans font-bold text-white/40 text-xs uppercase tracking-widest leading-relaxed max-w-xs">
              Still have questions? Drop us a message and our team will get back to you within 24 hours.
            </p>
          </div>

          {/* FAQ accordion */}
          <div className="lg:col-span-2 space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10 last:border-0">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-start gap-4 py-6 text-left group"
                  aria-expanded={openIndex === i}
                  id={`faq-btn-${i}`}
                  aria-controls={`faq-panel-${i}`}
                >
                  {/* Number */}
                  <span className="font-brand font-black text-2xl text-white/20 group-hover:text-[#F4BF4B] transition-colors shrink-0 w-10 text-right leading-none mt-0.5">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>

                  <span className="flex-1 font-black text-sm uppercase tracking-tight text-white/80 group-hover:text-white transition-colors leading-tight pt-0.5">
                    {faq.question}
                  </span>

                  <div className="shrink-0 mt-0.5 size-6 border border-white/20 flex items-center justify-center group-hover:border-[#F4BF4B] group-hover:text-[#F4BF4B] transition-colors text-white/40">
                    {openIndex === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                {openIndex === i && (
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className="pb-6 pl-14 pr-10 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <p className="font-serif italic text-white/60 text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
