import React from 'react';
import { Star, MapPin, Compass, ArrowRight, CheckCircle2, Sparkles, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Review } from '../../types/database';

interface TravellerReviewCardProps {
  review: Review;
  compact?: boolean;
  featuredHighlight?: boolean;
}

export const TravellerReviewCard: React.FC<TravellerReviewCardProps> = ({
  review,
  compact = false,
  featuredHighlight = false,
}) => {
  const rating = Math.min(5, Math.max(1, review.rating || 5));
  const displayName = review.travelerName || 'Verified Explorer';
  const testimonial = review.content || (review as any).testimonial || '';

  // Extract travel year safely
  const travelYear = review.travelYear || (review.travelDate ? new Date(review.travelDate).getFullYear() : null);

  // Subtitle / context (e.g., "Italy · 2026" or "Verified Explorer")
  const metaParts: string[] = [];
  if (review.destination) metaParts.push(review.destination);
  if (travelYear) metaParts.push(String(travelYear));
  const metaSubtitle = metaParts.length > 0 ? metaParts.join(' · ') : (review.role || 'Verified Explorer');

  return (
    <article
      className={`relative flex flex-col h-full bg-white border-4 border-[#121212] p-6 sm:p-8 transition-all ${
        featuredHighlight || review.featured
          ? 'shadow-[8px_8px_0px_0px_#F4BF4B] hover:shadow-[10px_10px_0px_0px_#F4BF4B] hover:-translate-x-0.5 hover:-translate-y-0.5 ring-2 ring-[#F4BF4B]/40'
          : 'shadow-[6px_6px_0px_0px_#121212] hover:shadow-[8px_8px_0px_0px_#121212] hover:-translate-x-0.5 hover:-translate-y-0.5'
      }`}
      aria-label={`Review by ${displayName}, rated ${rating} out of 5 stars`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-slate-100">
        {/* Star Rating with Semantic ARIA */}
        <div
          className="flex items-center gap-1"
          role="img"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={compact ? 14 : 16}
              className={
                i < rating
                  ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                  : 'text-slate-200'
              }
              aria-hidden="true"
            />
          ))}
          <span className="font-mono font-bold text-xs text-slate-700 ml-1">
            {rating}.0
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          {review.featured && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
              <Sparkles size={10} className="text-amber-600" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 size={10} className="text-emerald-600" /> Verified
          </span>
        </div>
      </div>

      {/* Testimonial Quote */}
      <div className="flex-1 space-y-3 mb-6">
        <Quote className="text-[#9E1B1D]/20 size-8 shrink-0 -scale-x-100" />
        <p className="font-serif italic text-base sm:text-lg text-slate-900 leading-relaxed pl-1">
          "{testimonial}"
        </p>
      </div>

      {/* Attribution & Journey Context Footer */}
      <div className="mt-auto pt-4 border-t-2 border-slate-100 space-y-3">
        {/* Traveller Attribution */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-brand font-black text-sm uppercase tracking-wider text-[#121212]">
              — {displayName}
            </h4>
            <p className="text-[11px] font-bold text-[#9E1B1D] uppercase tracking-wider">
              {metaSubtitle}
            </p>
          </div>

          {review.avatar && (
            <img
              src={review.avatar}
              alt=""
              aria-hidden="true"
              className="size-10 rounded-full object-cover border-2 border-[#121212] shrink-0"
            />
          )}
        </div>

        {/* Associated Links */}
        {(review.itineraryTitle || review.itinerarySlug || review.destination) && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest">
            {review.itineraryTitle && (
              <Link
                to={`/packages/${review.itinerarySlug || review.itineraryId}`}
                className="inline-flex items-center gap-1 text-[#121212] hover:text-[#9E1B1D] transition-colors py-1 group/link"
              >
                <Compass size={12} className="text-[#9E1B1D]" />
                <span className="truncate max-w-[180px]">{review.itineraryTitle}</span>
                <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {review.destination && (
              <Link
                to={`/destinations/${review.destinationSlug || review.destination.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#9E1B1D] transition-colors py-1 ml-auto group/link"
              >
                <MapPin size={12} className="text-[#F4BF4B]" />
                <span>{review.destination}</span>
                <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
