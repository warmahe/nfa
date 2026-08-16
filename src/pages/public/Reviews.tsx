import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  Filter,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../services/firebaseService';
import { Review } from '../../types/database';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveStaticPageSEO } from '../../utils/seo';
import { TravellerReviewCard } from '../../components/reviews/TravellerReviewCard';

export const Reviews: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDest = searchParams.get('destination') || 'ALL';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters state
  const [starFilter, setStarFilter] = useState<'ALL' | '5' | '4' | '3' | '2' | '1'>('ALL');
  const [selectedDestination, setSelectedDestination] = useState<string>(initialDest);
  const [searchQuery, setSearchQuery] = useState('');

  // Realtime subscription to canonical global_reviews
  useEffect(() => {
    setLoading(true);
    setLoadError(null);

    const unsub = onSnapshot(
      collection(db, 'global_reviews'),
      (snap) => {
        const rawReviews = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Review[];

        // Only explicitly approved and non-archived reviews
        const published = rawReviews.filter(
          (r) =>
            r.approved !== false &&
            r.status !== 'ARCHIVED' &&
            Boolean(r.content || (r as any).testimonial)
        );

        // Sort by displayOrder asc (if set) then by publishedAt / createdAt desc
        published.sort((a, b) => {
          if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
            return a.displayOrder - b.displayOrder;
          }
          if (a.displayOrder !== undefined) return -1;
          if (b.displayOrder !== undefined) return 1;

          const timeA = (a.createdAt as any)?.toMillis
            ? (a.createdAt as any).toMillis()
            : new Date((a.publishedAt as any) || (a.createdAt as any) || 0).getTime();
          const timeB = (b.createdAt as any)?.toMillis
            ? (b.createdAt as any).toMillis()
            : new Date((b.publishedAt as any) || (b.createdAt as any) || 0).getTime();
          return timeB - timeA;
        });

        setReviews(published);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading global_reviews:', err);
        setLoadError('Reviews are temporarily unavailable.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Update destination filter from URL search params if changed
  useEffect(() => {
    const dest = searchParams.get('destination');
    if (dest) {
      setSelectedDestination(dest);
    }
  }, [searchParams]);

  // Derived statistics (strict calculations from real published reviews)
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        avgRating: '0.0',
        totalCount: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        distributionPct: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const rNum = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      dist[rNum] = (dist[rNum] || 0) + 1;
      sum += r.rating || 5;
    });

    const avg = (sum / total).toFixed(1);
    const distPct: Record<number, number> = {
      5: Math.round((dist[5] / total) * 100),
      4: Math.round((dist[4] / total) * 100),
      3: Math.round((dist[3] / total) * 100),
      2: Math.round((dist[2] / total) * 100),
      1: Math.round((dist[1] / total) * 100),
    };

    return {
      avgRating: avg,
      totalCount: total,
      distribution: dist,
      distributionPct: distPct,
    };
  }, [reviews]);

  // Derived distinct destinations from published reviews
  const availableDestinations = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => {
      if (r.destination?.trim()) {
        set.add(r.destination.trim());
      }
    });
    return Array.from(set).sort();
  }, [reviews]);

  // Featured reviews
  const featuredReviews = useMemo(() => {
    return reviews.filter((r) => r.featured === true);
  }, [reviews]);

  // Filtered reviews list
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Star filter
      if (starFilter !== 'ALL') {
        const starNum = parseInt(starFilter, 10);
        if (Math.round(r.rating || 5) !== starNum) return false;
      }

      // Destination filter
      if (selectedDestination !== 'ALL') {
        if (!r.destination || r.destination.toLowerCase() !== selectedDestination.toLowerCase()) {
          return false;
        }
      }

      // Search query (public safe fields: title, destination, traveller display name, review text)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = (r.content || (r as any).testimonial || '').toLowerCase();
        const traveler = (r.travelerName || '').toLowerCase();
        const journey = (r.itineraryTitle || '').toLowerCase();
        const dest = (r.destination || '').toLowerCase();

        if (
          !text.includes(q) &&
          !traveler.includes(q) &&
          !journey.includes(q) &&
          !dest.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, starFilter, selectedDestination, searchQuery]);

  // Structured Data Schema for Reviews & AggregateRating
  const structuredData = useMemo(() => {
    if (reviews.length === 0) return undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'NO FIXED ADDRESS',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.avgRating,
        bestRating: '5',
        worstRating: '1',
        ratingCount: stats.totalCount,
      },
      review: reviews.slice(0, 10).map((r) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(r.rating || 5),
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Person',
          name: r.travelerName || 'Verified Explorer',
        },
        reviewBody: r.content || (r as any).testimonial || '',
        datePublished: r.publishedAt
          ? new Date(r.publishedAt as any).toISOString().split('T')[0]
          : undefined,
      })),
    };
  }, [reviews, stats]);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-[#F4BF4B]">
      <SeoHead
        metadata={resolveStaticPageSEO('reviews')}
        structuredData={structuredData}
      />

      <div className="max-w-[1440px] mx-auto space-y-16">
        {/* ── 1. EDITORIAL PAGE HEADER & AGGREGATE SUMMARY ── */}
        <header className="border-b-[4px] border-[#121212] pb-12">
          <div className="flex items-center gap-3 text-[#9E1B1D] mb-4">
            <ShieldCheck size={20} />
            <span className="font-black text-[10px] uppercase tracking-[0.4em]">
              Verified Social Proof
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="font-brand font-black text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.88] uppercase tracking-tighter text-[#121212]">
                TRAVELLER <br />
                <span className="text-[#9E1B1D]">REVIEWS.</span>
              </h1>
              <p className="font-serif italic text-lg md:text-xl text-slate-700 max-w-2xl leading-relaxed">
                "Stories and experiences shared by travellers who have journeyed with NO FIXED ADDRESS."
              </p>
            </div>

            {/* Live Aggregate Rating Box */}
            <div className="lg:col-span-5 bg-[#121212] text-white p-6 sm:p-8 border-4 border-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B] rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F4BF4B] block mb-1">
                    OVERALL REPUTATION
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-brand font-black text-5xl sm:text-6xl text-white">
                      {stats.avgRating}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">/ 5.0</span>
                  </div>

                  <div className="flex items-center gap-1 mt-2" role="img" aria-label={`Average rating ${stats.avgRating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.round(Number(stats.avgRating))
                            ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                            : 'text-slate-600'
                        }
                      />
                    ))}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                    Based on {stats.totalCount} verified traveller review{stats.totalCount === 1 ? '' : 's'}
                  </p>
                </div>

                {/* Rating Distribution Bars */}
                {stats.totalCount > 0 && (
                  <div className="space-y-1.5 min-w-[150px] border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[10px] font-mono">
                        <span className="w-3 font-bold text-slate-400">{s}★</span>
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden w-20">
                          <div
                            className="bg-[#F4BF4B] h-full rounded-full transition-all duration-500"
                            style={{ width: `${stats.distributionPct[s as keyof typeof stats.distributionPct]}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-slate-400">
                          {stats.distribution[s as keyof typeof stats.distribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. FEATURED REVIEWS HERO SECTION (IF AVAILABLE) ── */}
        {!loading && featuredReviews.length > 0 && starFilter === 'ALL' && selectedDestination === 'ALL' && !searchQuery && (
          <section aria-labelledby="featured-reviews-heading" className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#9E1B1D]" />
                <h2 id="featured-reviews-heading" className="font-brand font-black text-xl md:text-2xl uppercase tracking-tight text-[#121212]">
                  FEATURED EXPERIENCES
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                EDITOR'S SELECTION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredReviews.slice(0, 3).map((review) => (
                <TravellerReviewCard
                  key={`feat-${review.id}`}
                  review={review}
                  featuredHighlight={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. FILTER & SEARCH CONTROLS ── */}
        <section aria-label="Review filtering controls" className="bg-white border-4 border-[#121212] p-6 shadow-[6px_6px_0px_0px_#121212] rounded-xl space-y-6">
          {/* Top Filter Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Star Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
                <Filter size={12} /> Rating:
              </span>
              {(['ALL', '5', '4', '3', '2', '1'] as const).map((star) => (
                <button
                  key={star}
                  onClick={() => setStarFilter(star)}
                  className={`px-3 py-1.5 font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    starFilter === star
                      ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-[2px_2px_0px_0px_#F4BF4B]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-800'
                  }`}
                  aria-pressed={starFilter === star}
                >
                  {star === 'ALL' ? 'ALL REVIEWS' : `${star} STARS`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search traveller reviews..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#121212] transition-colors"
                aria-label="Search reviews"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-800"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Destination Filter Pills (Only rendered if destination data exists) */}
          {availableDestinations.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 flex items-center gap-1">
                <MapPin size={12} /> Destination:
              </span>
              <button
                onClick={() => {
                  setSelectedDestination('ALL');
                  setSearchParams({});
                }}
                className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  selectedDestination === 'ALL'
                    ? 'bg-[#9E1B1D] text-white border-[#9E1B1D]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-800'
                }`}
              >
                ALL REGIONS
              </button>
              {availableDestinations.map((dest) => (
                <button
                  key={dest}
                  onClick={() => {
                    setSelectedDestination(dest);
                    setSearchParams({ destination: dest });
                  }}
                  className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider border-2 transition-all cursor-pointer ${
                    selectedDestination.toLowerCase() === dest.toLowerCase()
                      ? 'bg-[#9E1B1D] text-white border-[#9E1B1D]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-800'
                  }`}
                >
                  📍 {dest}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── 4. REVIEWS GRID / EMPTY / LOADING STATES ── */}
        {loading ? (
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/20 rounded-2xl p-12 space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#9E1B1D] mx-auto" />
            <p className="font-black text-xs uppercase tracking-widest text-slate-600">
              Loading traveller reviews...
            </p>
          </div>
        ) : loadError ? (
          <div className="py-16 text-center border-4 border-rose-300 bg-rose-50 rounded-2xl p-12 space-y-4">
            <p className="font-bold text-sm text-rose-800 uppercase">
              {loadError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/20 rounded-2xl p-12 space-y-4 bg-white">
            <Star size={36} className="mx-auto text-slate-300" />
            <div className="space-y-1">
              <h3 className="font-brand font-black text-lg uppercase text-slate-800">
                {reviews.length === 0
                  ? 'Traveller reviews will appear here as more journeys are completed.'
                  : 'No reviews found matching your selected filters.'}
              </h3>
              <p className="font-serif italic text-sm text-slate-500 max-w-md mx-auto">
                {reviews.length === 0
                  ? 'All reviews on this page are authentic feedback shared by verified travellers who completed journeys with NO FIXED ADDRESS.'
                  : 'Try adjusting your rating or destination filters to explore more traveller reflections.'}
              </p>
            </div>
            {(starFilter !== 'ALL' || selectedDestination !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setStarFilter('ALL');
                  setSelectedDestination('ALL');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="px-5 py-2 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
              >
                RESET FILTERS
              </button>
            )}
          </div>
        ) : (
          <section aria-label="Traveller reviews list" className="space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>
                Showing {filteredReviews.length} of {reviews.length} Review{reviews.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredReviews.map((review) => (
                <TravellerReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};