import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import { Destination, Package } from '../../types/database';
import { getRelatedDestinations } from '../../utils/contentDiscovery';

interface RelatedDestinationsProps {
  currentDestination?: Destination | null;
  allDestinations: Destination[];
  allJourneys?: Package[];
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllLink?: string;
}

export const RelatedDestinations: React.FC<RelatedDestinationsProps> = ({
  currentDestination,
  allDestinations = [],
  allJourneys = [],
  title = 'EXPLORE MORE DESTINATIONS',
  subtitle = 'WHERE ELSE COULD YOU GO?',
  limit = 3,
  viewAllLink = '/explore?type=destinations',
}) => {
  const related = useMemo(() => {
    return getRelatedDestinations(currentDestination, allDestinations, allJourneys, limit);
  }, [currentDestination, allDestinations, allJourneys, limit]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      id="related-destinations"
      className="py-16 md:py-24 px-6 md:px-16 max-w-[1440px] mx-auto border-t-4 border-[#121212]"
      aria-label="Related Destinations"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-2">
            <MapPin size={14} /> {subtitle}
          </span>
          <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9]">
            {title}
          </h2>
        </div>

        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9E1B1D] hover:underline"
        >
          VIEW ALL DESTINATIONS <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {related.map((dest) => {
          const cover =
            dest.heroImage ||
            dest.coverImage ||
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

          return (
            <Link
              key={dest.id || dest.slug}
              to={`/destinations/${dest.slug || dest.id}`}
              className="group flex flex-col border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] hover:shadow-[10px_10px_0px_0px_#F4BF4B] hover:-translate-x-1 hover:-translate-y-1 transition-all overflow-hidden"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden border-b-4 border-[#121212] bg-[#121212]">
                <img
                  src={cover}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale-[20%] group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-[#121212] text-white px-2.5 py-1 font-black text-[9px] uppercase tracking-widest">
                  {dest.country || dest.region || 'Expedition'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] group-hover:text-[#9E1B1D] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="font-serif italic text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {dest.tagline || dest.description || 'Remarkable landscape and cultural discovery.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    {dest.idealDuration || 'Bespoke Season'}
                  </span>
                  <span className="font-black text-xs uppercase tracking-widest text-[#121212] group-hover:text-[#9E1B1D] flex items-center gap-1">
                    EXPLORE <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
