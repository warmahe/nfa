import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, Tag } from 'lucide-react';
import { Package, TripPricingDate } from '../../../types/database';

interface PricingDatesProps {
  pkg: Package;
}

const statusConfig: Record<TripPricingDate['status'], { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-[#121212]', bg: 'bg-[#F4BF4B] border-[#121212]' },
  limited: { label: 'Limited Seats', color: 'text-[#FCFBF7]', bg: 'bg-[#9E1B1D] border-[#121212]' },
  sold_out: { label: 'Sold Out', color: 'text-[#121212]/50', bg: 'bg-[#121212]/10 border-[#121212]/20' },
  coming_soon: { label: 'Coming Soon', color: 'text-[#121212]', bg: 'bg-white border-[#121212]' },
};

export const PricingDates: React.FC<PricingDatesProps> = ({ pkg }) => {
  const dates = pkg?.pricingDates || [];
  if (dates.length === 0) return null;
  const currency = pkg?.pricing?.currency || 'INR';

  return (
    <section
      id="pricing"
      className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto bg-[#FCFBF7]"
      aria-label="Trip dates and pricing"
    >
      <div className="mb-16 text-center">
        <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212] bg-[#F4BF4B] mb-6 shadow-[4px_4px_0_0_#121212]">
          Investment
        </span>
        <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85] mb-8">
          Dates & Pricing
        </h2>
        <div className="w-full max-w-md h-2 bg-[repeating-linear-gradient(45deg,#121212,#121212_10px,transparent_10px,transparent_20px)] mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dates.map((d, i) => {
          const config = statusConfig[d.status];
          const isSoldOut = d.status === 'sold_out';
          const isComingSoon = d.status === 'coming_soon';

          return (
            <div
              key={i}
              className={`relative bg-[#FCFBF7] border-4 border-[#121212] flex flex-col hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#9E1B1D] shadow-[8px_8px_0px_0px_#121212] transition-all duration-300 ${isSoldOut ? 'opacity-60 grayscale' : ''}`}
            >
              {/* Tag Hole Motif */}
              <div className="h-12 border-b-4 border-dashed border-[#121212] flex items-center justify-center relative bg-[#121212]/5">
                 <div className="w-4 h-4 rounded-full bg-[#FCFBF7] border-4 border-[#121212]" />
              </div>

              <div className="p-8 flex flex-col gap-6 flex-1">
                {/* Status badge */}
                <div className={`self-center px-4 py-1.5 border-2 font-mono font-black text-[10px] uppercase tracking-[0.2em] shadow-[2px_2px_0_0_#121212] flex items-center gap-2 ${config.color} ${config.bg}`}>
                  {d.status === 'limited' && <AlertCircle size={12} />}
                  {config.label}
                </div>

                {/* Date range */}
                <div className="text-center mt-4">
                  <span className="block font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212]/50 mb-2">Departure Window</span>
                  <p className="font-brand font-black text-2xl md:text-3xl uppercase tracking-tighter text-[#121212] leading-none">
                    {d.date_range}
                  </p>
                  {d.notes && (
                    <p className="mt-3 font-sans font-bold text-[10px] text-[#9E1B1D] uppercase tracking-widest bg-[#9E1B1D]/10 inline-block px-3 py-1 border border-[#9E1B1D]/20">
                      {d.notes}
                    </p>
                  )}
                </div>

                <div className="flex-1" />

                {/* Price */}
                <div className="border-t-4 border-[#121212] pt-6 flex flex-col items-center gap-4">
                  <div className="text-center">
                    <span className="block font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212]/50 mb-1">
                      Per Explorer
                    </span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display font-black text-4xl text-[#121212] tracking-tighter">
                        {(d.price || pkg?.pricing?.basePrice || 0).toLocaleString()}
                      </span>
                      <span className="text-[#121212] font-black text-sm">{d.currency || currency}</span>
                    </div>
                  </div>

                  {!isSoldOut && (
                    <Link
                      to={`/booking/${pkg?.id}`}
                      className="w-full bg-[#121212] text-[#FCFBF7] py-4 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors border-2 border-[#121212] group"
                    >
                      {isComingSoon ? 'Get Notified' : 'Secure Spot'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
