import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { getCollectionData } from '../../../services/firebaseService';
import { Package } from '../../../types/database';
import { PACKAGES } from '../../../utils/constants';

interface RelatedTripsProps {
  pkg: Package;
}

export const RelatedTrips: React.FC<RelatedTripsProps> = ({ pkg }) => {
  const [relatedPkgs, setRelatedPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getCollectionData<Package>('packages');
        let filtered: any[] = [];

        if (pkg?.relatedTripIds && pkg.relatedTripIds.length > 0) {
          filtered = all.filter(p => pkg.relatedTripIds!.includes(p.id) && p.id !== pkg.id);
        }

        // Fallback: latest active packages excluding current
        if (filtered.length < 3) {
          const extras = all.filter(p => p.id !== pkg?.id && p.status === 'active');
          filtered = [...filtered, ...extras].slice(0, 4);
        }

        // If still empty, use static fallback
        if (filtered.length === 0) {
          filtered = PACKAGES.filter(p => p.id !== pkg?.id).slice(0, 3);
        }

        setRelatedPkgs(filtered.slice(0, 4));
      } catch {
        // Fallback to static
        setRelatedPkgs(PACKAGES.filter(p => p.id !== pkg?.id).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pkg?.id, pkg?.relatedTripIds]);

  if (loading || relatedPkgs.length === 0) return null;

  return (
    <section
      id="related"
      className="py-24 px-6 md:px-16 bg-white border-t-4 border-[#121212]"
      aria-label="Related trips"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
              Keep Exploring
            </span>
            <h2 className="font-brand font-black text-[clamp(3rem,6vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
              Related<br />Journeys.
            </h2>
          </div>
          <Link
            to="/destinations"
            className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.3em] text-[#121212] border-b-2 border-[#F4BF4B] pb-1 hover:text-[#9E1B1D] transition-colors self-start sm:self-end"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedPkgs.map((p, i) => {
            const thumbnail = p?.media?.thumbnail || `https://images.unsplash.com/photo-150428039036${i}-361c6d9f38f4?w=600&q=80`;
            const price = p?.pricing?.basePrice || 0;
            const currency = p?.pricing?.currency || 'INR';

            return (
              <Link
                key={p.id || i}
                to={`/itinerary/${p.slug || p.id}`}
                className="group border-4 border-[#121212] bg-white flex flex-col hover:shadow-[8px_8px_0px_0px_#F4BF4B] hover:-translate-x-1 hover:-translate-y-1 transition-all"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3] border-b-4 border-[#121212]">
                  <img
                    src={thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Destination tag */}
                  <div className="absolute bottom-3 left-3 bg-[#121212] text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                    {p?.destinations?.[0] || 'Explore'}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212] leading-tight">
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#121212]/40">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {p.duration || '7 Days'}
                    </span>
                    {p?.rating?.average && (
                      <span className="flex items-center gap-1">
                        <Star size={10} fill="currentColor" className="text-[#F4BF4B]" /> {p.rating.average}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t-2 border-[#121212]/10 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-[#121212]/30">From</span>
                      <span className="font-brand font-black text-2xl text-[#121212]">
                        {price.toLocaleString()} <span className="text-sm text-[#121212]/40">{currency}</span>
                      </span>
                    </div>
                    <div className="size-10 bg-[#121212] text-[#F4BF4B] flex items-center justify-center group-hover:bg-[#9E1B1D] transition-colors">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
