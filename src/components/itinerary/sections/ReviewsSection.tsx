import React, { useEffect, useState, useMemo } from 'react';
import { Star, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, getSubcollectionData } from '../../../services/firebaseService';
import { Review, Package } from '../../../types/database';
import { TravellerReviewCard } from '../../reviews/TravellerReviewCard';

interface ReviewsSectionProps {
  pkg: Package;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ pkg }) => {
  const [globalReviews, setGlobalReviews] = useState<Review[]>([]);
  const [subcollectionReviews, setSubcollectionReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to canonical global_reviews
  useEffect(() => {
    if (!pkg?.id) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, 'global_reviews'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Review[];

        // Filter only for this journey and strictly published
        const matching = list.filter((r) => {
          if (r.approved === false || r.status === 'ARCHIVED') return false;
          if (!r.content && !(r as any).testimonial) return false;

          const matchId = r.itineraryId && (r.itineraryId === pkg.id || r.itineraryId === pkg.slug);
          const matchSlug = r.itinerarySlug && (r.itinerarySlug === pkg.slug || r.itinerarySlug === pkg.id);
          const matchTitle = r.itineraryTitle && pkg.title && r.itineraryTitle.toLowerCase() === pkg.title.toLowerCase();

          return Boolean(matchId || matchSlug || matchTitle);
        });

        setGlobalReviews(matching);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching global_reviews in ReviewsSection:', err);
        setLoading(false);
      }
    );

    // Fallback check on subcollection
    getSubcollectionData<Review>('packages', pkg.id, 'reviews')
      .then((data) => setSubcollectionReviews(data.filter((r) => r.approved)))
      .catch(() => setSubcollectionReviews([]));

    return () => unsub();
  }, [pkg?.id, pkg?.slug, pkg?.title]);

  // Combine unique reviews
  const allReviews = useMemo(() => {
    const map = new Map<string, Review>();
    globalReviews.forEach((r) => map.set(r.id, r));
    subcollectionReviews.forEach((r) => {
      if (!map.has(r.id)) map.set(r.id, r);
    });
    return Array.from(map.values());
  }, [globalReviews, subcollectionReviews]);

  // If loading or no matching reviews exist, hide section gracefully
  if (loading || allReviews.length === 0) {
    return null;
  }

  const avg =
    allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / allReviews.length;

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 px-6 md:px-16 max-w-[1440px] mx-auto border-t-4 border-[#121212]"
      aria-label="Traveller Reviews"
    >
      {/* Header + Aggregate Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 border-b-4 border-[#121212] pb-8">
        <div>
          <span className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
            <ShieldCheck size={16} /> WHAT TRAVELLERS SAY
          </span>
          <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,4.5rem)] uppercase tracking-tighter text-[#121212] leading-[0.88]">
            TRAVELLERS WHO HAVE <br />
            <span className="text-[#9E1B1D]">JOURNEYED WITH US.</span>
          </h2>
        </div>

        {/* Aggregate Badge & Links */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
          <div className="border-4 border-[#121212] bg-[#121212] text-white px-8 py-5 text-center shadow-[6px_6px_0px_0px_#F4BF4B]">
            <div className="flex items-center justify-center gap-2">
              <span className="font-brand font-black text-4xl text-[#F4BF4B] leading-none">
                {avg.toFixed(1)}
              </span>
              <div className="flex text-[#F4BF4B]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(avg) ? 'fill-[#F4BF4B]' : 'text-slate-600'
                    }
                  />
                ))}
              </div>
            </div>
            <span className="block font-black text-[9px] uppercase tracking-widest text-white/50 mt-1">
              {allReviews.length} Verified Review{allReviews.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#121212] px-6 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-[4px_4px_0px_0px_#121212]"
          >
            READ ALL REVIEWS <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {allReviews.slice(0, 6).map((review) => (
          <TravellerReviewCard
            key={review.id}
            review={{
              ...review,
              itineraryTitle: review.itineraryTitle || pkg.title,
              itinerarySlug: review.itinerarySlug || pkg.slug,
            }}
          />
        ))}
      </div>
    </section>
  );
};
