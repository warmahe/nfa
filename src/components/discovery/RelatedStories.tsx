import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { CustomerStory } from '../../types/database';
import { CustomerStoryCard } from '../stories/CustomerStoryCard';
import { getRelatedStories, StoryDiscoveryContext } from '../../utils/contentDiscovery';

interface RelatedStoriesProps {
  context: StoryDiscoveryContext;
  allStories: CustomerStory[];
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllLink?: string;
}

export const RelatedStories: React.FC<RelatedStoriesProps> = ({
  context,
  allStories = [],
  title = 'MORE TRAVELLER STORIES',
  subtitle = 'FIELD REPORTS & MEMOIRS',
  limit = 3,
  viewAllLink = '/explore?type=stories',
}) => {
  const related = useMemo(() => {
    return getRelatedStories(context, allStories, limit);
  }, [context, allStories, limit]);

  if (related.length === 0) {
    return null;
  }

  return (
    <section
      id="related-stories"
      className="py-16 md:py-24 px-6 md:px-16 max-w-[1440px] mx-auto border-t-4 border-[#121212]"
      aria-label="Related Customer Stories"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-2">
            <BookOpen size={14} /> {subtitle}
          </span>
          <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9]">
            {title}
          </h2>
        </div>

        <Link
          to={viewAllLink}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#9E1B1D] hover:underline"
        >
          READ ALL STORIES <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {related.map((story) => (
          <CustomerStoryCard key={story.id || story.slug} story={story} />
        ))}
      </div>
    </section>
  );
};
