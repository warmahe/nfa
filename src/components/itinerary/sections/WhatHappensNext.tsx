import React from 'react';
import { MessageSquare, FileCheck2, Compass, ShieldCheck, PhoneCall, ArrowRight, Sparkles } from 'lucide-react';
import { Package } from '../../../types/database';
import { useEnquiry } from '../../../context/EnquiryContext';

interface WhatHappensNextProps {
  pkg: Package;
}

const STEPS = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Tell Us Your Travel Ideas',
    description: "Share your intended dates, travel party, and wish list via our simple enquiry. No payment or account is required.",
  },
  {
    step: '02',
    icon: PhoneCall,
    title: 'Personal Consultation',
    description: 'Our private travel specialists review your request and connect directly via WhatsApp or phone to understand your vision.',
  },
  {
    step: '03',
    icon: Compass,
    title: 'Tailored Route & Stays',
    description: 'We shape the day-by-day itinerary, boutique accommodations, and curated private experiences around your pace.',
  },
  {
    step: '04',
    icon: FileCheck2,
    title: 'Confirm At Your Own Pace',
    description: 'Review transparent starting prices and finalize your bespoke journey with complete confidence and human assistance.',
  },
  {
    step: '05',
    icon: ShieldCheck,
    title: 'Pre-Trip Briefing & Support',
    description: 'Receive your complete travel itinerary dossier, essential local advice, and 24/7 on-ground concierge support throughout.',
  },
];

export const WhatHappensNext: React.FC<WhatHappensNextProps> = ({ pkg }) => {
  const { openEnquiry } = useEnquiry();

  const handleEnquire = () => {
    openEnquiry({
      pkg,
      itineraryTitle: pkg.title,
      itineraryId: pkg.id,
      itinerarySlug: pkg.slug,
      destination: pkg.destinations?.[0],
      duration: pkg.duration,
      price: pkg.pricing?.basePrice,
      currency: pkg.pricing?.currency,
      source: 'ITINERARY',
      entryPoint: 'SECTION_CTA',
    });
  };

  return (
    <section
      id="how-it-works"
      className="py-20 px-6 md:px-16 bg-[#121212] text-white border-y-4 border-[#F4BF4B] relative overflow-hidden"
      aria-label="What happens after you enquire"
    >
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-white/10 pb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F4BF4B] block mb-2">
              Decision Support & Trust
            </span>
            <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-none">
              WHAT HAPPENS AFTER <br />
              <span className="text-[#F4BF4B]">YOU ENQUIRE.</span>
            </h2>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/60 max-w-md">
            Planning a private expedition should feel effortless. Here is how our travel team works with you from first idea to final return.
          </p>
        </div>

        {/* 5-Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border-2 border-white/15 p-6 space-y-4 hover:border-[#F4BF4B] hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-2xl text-[#F4BF4B]">
                      {s.step}
                    </span>
                    <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-[#F4BF4B]">
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 className="font-brand font-black text-lg uppercase tracking-tight text-white leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs font-medium text-white/70 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Footer with Direct CTA */}
        <div className="p-8 bg-white/5 border-2 border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F4BF4B] block flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles size={12} /> Bespoke Travel Consultation
            </span>
            <p className="font-sans font-bold text-xs text-white/80">
              Ready to discuss {pkg.title}? Let's tailor the journey around you.
            </p>
          </div>

          <button
            onClick={handleEnquire}
            className="w-full sm:w-auto bg-[#F4BF4B] text-[#121212] px-8 py-4 font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-[4px_4px_0px_0px_#121212] border-2 border-[#121212] cursor-pointer shrink-0"
          >
            PLAN THIS JOURNEY <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
