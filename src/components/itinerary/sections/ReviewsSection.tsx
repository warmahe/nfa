import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { getSubcollectionData } from '../../../services/firebaseService';
import { Review, Package } from '../../../types/database';

interface ReviewsSectionProps {
  pkg: Package;
}

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? 'text-[#F4BF4B] fill-[#F4BF4B]' : 'text-[#121212]/20'}
      />
    ))}
  </div>
);

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ pkg }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pkg?.id) { setLoading(false); return; }
    getSubcollectionData<Review>('packages', pkg.id, 'reviews')
      .then(data => setReviews(data.filter(r => r.approved).sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [pkg?.id]);

  const avg = pkg?.rating?.average ?? (reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5.0);

  const totalReviews = pkg?.rating?.totalReviews ?? reviews.length;

  if (loading) return null;

  return (
    <section
      id="reviews"
      className="py-24 px-6 md:px-16 max-w-[1440px] mx-auto"
      aria-label="Reviews"
    >
      {/* Header + aggregate */}
      <div className="flex flex-col md:flex-row md:items-end gap-8 mb-16">
        <div className="flex-1">
          <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
            What Travelers Say
          </span>
          <h2 className="font-brand font-black text-[clamp(3rem,7vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
            Real Voices.
          </h2>
        </div>

        {/* Rating aggregate box */}
        <div className="border-4 border-[#121212] bg-[#121212] text-white px-10 py-8 text-center shadow-[8px_8px_0px_0px_#F4BF4B] shrink-0">
          <span className="font-brand font-black text-7xl text-[#F4BF4B] leading-none block">
            {avg.toFixed(1)}
          </span>
          <StarRating rating={Math.round(avg)} size={18} />
          <span className="block font-black text-[9px] uppercase tracking-widest text-white/40 mt-2">
            {totalReviews} Review{totalReviews !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="border-4 border-dashed border-[#121212]/20 p-16 text-center">
          <Star size={32} className="mx-auto text-[#F4BF4B] mb-4" />
          <p className="font-black text-[#121212]/30 uppercase tracking-widest text-sm">
            Be the first to share your experience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reviews.slice(0, 9).map((review, i) => (
            <div
              key={review.id || i}
              className={`border-4 border-[#121212] bg-white p-8 flex flex-col gap-5 hover:shadow-[8px_8px_0px_0px_#F4BF4B] hover:-translate-x-1 hover:-translate-y-1 transition-all ${review.featured ? 'md:col-span-2 xl:col-span-1 border-[#F4BF4B]' : ''}`}
            >
              {/* Stars + Verified */}
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} />
                {review.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-green-600">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>

              {/* Title */}
              {review.title && (
                <h3 className="font-black text-sm uppercase tracking-tight text-[#121212]">
                  {review.title}
                </h3>
              )}

              {/* Content */}
              <p className="font-serif italic text-[#121212]/70 text-sm leading-relaxed flex-1">
                "{review.content}"
              </p>

              {/* Footer */}
              <div className="border-t-2 border-[#121212]/10 pt-4 flex items-center justify-between">
                <div>
                  <span className="block font-black text-[10px] uppercase tracking-widest text-[#121212]">
                    {review.isAnonymous ? 'Anonymous Traveler' : review.travelerName}
                  </span>
                </div>
                {(review.helpfulCount > 0) && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-[#121212]/40 uppercase tracking-widest">
                    <ThumbsUp size={10} /> {review.helpfulCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
