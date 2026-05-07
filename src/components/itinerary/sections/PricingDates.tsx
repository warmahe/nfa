import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Package, TripPricingDate } from '../../../types/database';

interface PricingDatesProps {
  pkg: Package;
}

const statusConfig: Record<TripPricingDate['status'], { label: string; color: string; bg: string }> = {
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  limited: { label: 'Limited Seats', color: 'text-[#9E1B1D]', bg: 'bg-red-50 border-red-200' },
  sold_out: { label: 'Sold Out', color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200' },
  coming_soon: { label: 'Coming Soon', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

export const PricingDates: React.FC<PricingDatesProps> = ({ pkg }) => {
  const dates = pkg?.pricingDates || [];
  if (dates.length === 0) return null;
  const currency = pkg?.pricing?.currency || 'INR';

  return (
    <section
      id="pricing"
      className="py-24 px-6 md:px-16 bg-[#FCFBF7]"
      aria-label="Trip dates and pricing"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12">
          <div>
            <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
              Departure Windows
            </span>
            <h2 className="font-brand font-black text-[clamp(3rem,7vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
              Dates &<br />Pricing.
            </h2>
          </div>
        </div>

        {/* Price cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dates.map((d, i) => {
            const config = statusConfig[d.status];
            const isSoldOut = d.status === 'sold_out';
            const isComingSoon = d.status === 'coming_soon';

            return (
              <div
                key={i}
                className={`border-4 border-[#121212] bg-white p-8 flex flex-col gap-6 shadow-[6px_6px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isSoldOut ? 'opacity-50' : ''}`}
              >
                {/* Status badge */}
                <div className={`self-start px-3 py-1 border text-[9px] font-black uppercase tracking-widest ${config.color} ${config.bg}`}>
                  {d.status === 'limited' && <AlertCircle size={9} className="inline mr-1" />}
                  {config.label}
                </div>

                {/* Date range */}
                <div>
                  <span className="block font-black text-[10px] uppercase tracking-widest text-[#121212]/40 mb-1">Departure</span>
                  <p className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                    {d.date_range}
                  </p>
                  {d.notes && (
                    <p className="mt-1 font-sans font-bold text-[10px] text-[#9E1B1D] uppercase tracking-widest">
                      {d.notes}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="border-t-2 border-[#121212]/10 pt-6 flex items-end justify-between">
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-[#121212]/40 mb-1">
                      Per Person
                    </span>
                    <span className="font-display font-black text-4xl text-[#121212] tracking-tighter">
                      {(d.price || pkg?.pricing?.basePrice || 0).toLocaleString()}
                    </span>
                    <span className="text-[#121212]/40 font-black text-sm ml-1">{d.currency || currency}</span>
                  </div>

                  {!isSoldOut && (
                    <Link
                      to={`/booking/${pkg?.id}`}
                      className="bg-[#121212] text-[#F4BF4B] px-5 py-3 font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[#9E1B1D] transition-colors border-2 border-[#121212] group"
                    >
                      {isComingSoon ? 'Notify Me' : 'Book Now'}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};
