import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { Package } from '../../types/database';
import { PackageJourneyCard } from '../packages/PackageJourneyCard';
import { getRelatedJourneys } from '../../utils/contentDiscovery';

interface RelatedJourneysProps {
  currentJourney?: Package | null;
  allJourneys: Package[];
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllLink?: string;
}

export const RelatedJourneys: React.FC<RelatedJourneysProps> = ({
  currentJourney,
  allJourneys = [],
  title = 'MORE JOURNEYS TO EXPLORE',
  subtitle = 'YOU MAY ALSO LIKE',
  limit = 3,
  viewAllLink = '/explore?type=journeys',
}) => {
  const related = useMemo(() => {
    return getRelatedJourneys(currentJourney, allJourneys, limit);
  }, [currentJourney, allJourneys, limit]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      id="related-journeys"
      className="py-16 md:py-24 px-6 md:px-16 max-w-[1440px] mx-auto border-t-4 border-[#121212]"
      aria-label="Related Journeys"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-2">
            <Compass size={14} /> {subtitle}
          </span>
          <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9]">
            {title}
          </h2>
        </div>

        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9E1B1D] hover:underline"
        >
          EXPLORE ALL JOURNEYS <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {related.map((pkg) => (
          <PackageJourneyCard key={pkg.id || pkg.slug} pkg={pkg} />
        ))}
      </div>
    </section>
  );
};
