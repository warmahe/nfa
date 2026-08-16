import React from 'react';
import { Quote, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Review } from '../../types/database';

interface TestimonialsProps {
  customReviews?: Review[];
  heading?: string;
  sectionLabel?: string;
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  customReviews = [],
  heading = 'FIELD REPORTS',
  sectionLabel = 'VERIFIED SOCIAL PROOF',
}) => {
  if (customReviews.length === 0) {
    return null;
  }

  // Primary featured review (first in array)
  const primary = customReviews[0];
  const others = customReviews.slice(1, 3);

  const rating = Math.min(5, Math.max(1, primary.rating || 5));
  const primaryName = primary.travelerName || 'Verified Explorer';
  const primaryText = primary.content || (primary as any).testimonial || '';
  const primaryMeta = primary.destination
    ? `${primary.destination}${primary.travelYear ? ` · ${primary.travelYear}` : ''}`
    : primary.role || 'Verified Explorer';

  return (
    <section className="bg-[#F4BF4B] border-b-4 border-[#121212] overflow-hidden" aria-label="Traveller Reviews">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Heading, Badge, and Read All Reviews Link */}
        <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] flex flex-col justify-between space-y-8 bg-[#F4BF4B]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D]">
              <ShieldCheck size={16} /> {sectionLabel}
            </span>
            <h2
              className="font-brand text-4xl sm:text-6xl md:text-7xl font-black uppercase text-[#121212] leading-[0.9]"
              style={{ textShadow: '2px 2px 0px #FCFBF7' }}
            >
              {heading}
            </h2>
            <p className="font-serif italic text-base sm:text-lg text-slate-900 leading-relaxed max-w-sm">
              Real reflections and reviews shared by explorers who have journeyed with NO FIXED ADDRESS.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-6 py-3.5 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#FCFBF7] cursor-pointer"
            >
              READ ALL REVIEWS <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Testimonial Quote & Cards */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 bg-[#FCFBF7] flex flex-col justify-center space-y-8">
          {/* Main Hero Review */}
          <div className="space-y-6">
            {/* Star Rating */}
            <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < rating
                      ? 'fill-[#F4BF4B] text-[#121212]'
                      : 'text-slate-200'
                  }
                />
              ))}
            </div>

            {/* Testimonial Quote */}
            <p className="font-brand text-2xl sm:text-3xl md:text-4xl font-black italic text-[#121212] leading-tight border-l-8 border-[#9E1B1D] pl-6">
              "{primaryText}"
            </p>

            {/* Attribution */}
            <div className="flex items-center justify-between gap-4 border-t-2 border-slate-200 pt-6">
              <div className="flex items-center gap-4">
                {primary.avatar ? (
                  <img
                    src={primary.avatar}
                    className="size-14 object-cover border-2 border-[#121212] grayscale rounded-full"
                    alt={primaryName}
                  />
                ) : (
                  <div className="size-12 rounded-full bg-[#121212] text-[#F4BF4B] font-brand font-black text-lg flex items-center justify-center border-2 border-[#121212]">
                    {primaryName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                    — {primaryName}
                  </h4>
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-[#9E1B1D]">
                    {primaryMeta}
                  </p>
                </div>
              </div>

              {primary.itineraryTitle && (
                <Link
                  to={`/packages/${primary.itinerarySlug || primary.itineraryId}`}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-[#9E1B1D]"
                >
                  <span>{primary.itineraryTitle}</span> &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Secondary Reviews (if 2 or 3 reviews configured) */}
          {others.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-slate-200">
              {others.map((r) => (
                <div
                  key={r.id}
                  className="p-5 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] rounded-xl space-y-2.5"
                >
                  <div className="flex text-[#F4BF4B]">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-[#F4BF4B] text-[#121212]" />
                    ))}
                  </div>
                  <p className="font-serif italic text-xs text-slate-800 line-clamp-3 leading-relaxed">
                    "{r.content || (r as any).testimonial}"
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 pt-1 border-t border-slate-100">
                    — {r.travelerName || 'Verified Explorer'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};