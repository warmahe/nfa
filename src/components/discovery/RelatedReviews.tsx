import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Review } from '../../types/database';
import { TravellerReviewCard } from '../reviews/TravellerReviewCard';
import { getRelatedReviews, ReviewDiscoveryContext } from '../../utils/contentDiscovery';

interface RelatedReviewsProps {
  context: ReviewDiscoveryContext;
  allReviews: Review[];
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllLink?: string;
}

export const RelatedReviews: React.FC<RelatedReviewsProps> = ({
  context,
  allReviews = [],
  title = 'WHAT TRAVELLERS SAY',
  subtitle = 'VERIFIED SOCIAL PROOF',
  limit = 3,
  viewAllLink = '/reviews',
}) => {
  const related = useMemo(() => {
    return getRelatedReviews(context, allReviews, limit);
  }, [context, allReviews, limit]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      id="related-reviews"
      className="py-16 md:py-24 px-6 md:px-16 max-w-[1440px] mx-auto border-t-4 border-[#121212]"
      aria-label="Related Reviews"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-2">
            <ShieldCheck size={14} /> {subtitle}
          </span>
          <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9]">
            {title}
          </h2>
        </div>

        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9E1B1D] hover:underline"
        >
          VIEW ALL REVIEWS ({allReviews.length}) <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {related.map((review) => (
          <TravellerReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
};
