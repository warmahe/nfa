import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { subscribeToPublishedCustomerStories } from '../../services/firebaseService';
import { CustomerStory } from '../../types/database';
import { CustomerStoryCard } from '../../components/stories/CustomerStoryCard';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveStaticPageSEO } from '../../utils/seo';

export const Stories = () => {
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Real-time Subscription to Published Stories Only
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPublishedCustomerStories(
      (loadedStories) => {
        setStories(loadedStories);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to published stories:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Compute unique destinations for filtering
  const destinationFilters = useMemo(() => {
    const dests = stories
      .map((s) => s.destination)
      .filter((d): d is string => Boolean(d && d.trim() !== ''));
    return ['ALL', ...Array.from(new Set(dests))];
  }, [stories]);

  // Separate Featured and Regular stories
  const featuredStory = useMemo(() => {
    return stories.find((s) => s.featured) || (stories.length > 0 ? stories[0] : null);
  }, [stories]);

  // Filtered stories list
  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      // Filter by Destination
      if (selectedDestination !== 'ALL' && s.destination !== selectedDestination) {
        return false;
      }
      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = s.title?.toLowerCase().includes(q);
        const matchDest = s.destination?.toLowerCase().includes(q);
        const matchExcerpt = s.excerpt?.toLowerCase().includes(q);
        const matchStyle = s.travelStyle?.some((st) => st.toLowerCase().includes(q));
        return matchTitle || matchDest || matchExcerpt || matchStyle;
      }
      return true;
    });
  }, [stories, selectedDestination, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 nfa-texture selection:bg-[#F4BF4B] selection:text-[#121212]">
      <SeoHead metadata={resolveStaticPageSEO('stories')} />

      {/* ── 1. EDITORIAL HEADER ── */}
      <section className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] mb-16 border-b-4 border-[#121212] pb-12">
        <div className="flex items-center gap-3 text-[#9E1B1D] mb-6">
          <BookOpen size={20} />
          <span className="font-black text-xs uppercase tracking-[0.4em]">
            STORIES // TRAVELLER JOURNEYS
          </span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <h1 className="font-brand font-black text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.8] tracking-tighter text-[#121212]">
            TRAVELLER <br />
            <span className="text-[#F4BF4B] drop-shadow-[3px_3px_0px_#121212]">STORIES.</span>
          </h1>
          <p className="font-serif italic text-lg md:text-2xl text-slate-700 max-w-lg leading-relaxed border-l-4 border-[#9E1B1D] pl-6 py-2">
            "Journeys remembered through the eyes of the people who travelled them."
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] space-y-16">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 size={40} className="animate-spin mx-auto text-[#9E1B1D]" />
            <p className="font-black text-xs uppercase tracking-widest text-slate-500">
              Loading traveller stories...
            </p>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/15 p-12 space-y-4 max-w-2xl mx-auto bg-white shadow-[8px_8px_0px_0px_#121212]">
            <Sparkles size={48} className="mx-auto text-[#F4BF4B]" />
            <h3 className="font-brand font-black text-3xl uppercase text-[#121212]">
              NEW TRAVELLER STORIES ARE COMING SOON
            </h3>
            <p className="font-serif italic text-base text-slate-600">
              Our expedition team is crafting new journey narratives lived by our travellers. Check back soon for inspiring accounts.
            </p>
          </div>
        ) : (
          <>
            {/* ── 2. FEATURED STORY HERO ── */}
            {featuredStory && !searchQuery && selectedDestination === 'ALL' && (
              <section className="mb-16">
                <CustomerStoryCard story={featuredStory} featuredLayout={true} />
              </section>
            )}

            {/* ── 3. SEARCH & DESTINATION FILTERS ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-[#121212]/10 pb-6">
              {/* Destination Filter Buttons */}
              <div className="flex gap-4 md:gap-8 overflow-x-auto pb-2 w-full md:w-auto">
                {destinationFilters.map((dest) => (
                  <button
                    key={dest}
                    onClick={() => setSelectedDestination(dest)}
                    className={`font-black text-[11px] uppercase tracking-[0.3em] transition-all whitespace-nowrap border-b-2 pb-1 cursor-pointer ${
                      selectedDestination === dest
                        ? 'border-[#9E1B1D] text-[#9E1B1D]'
                        : 'border-transparent text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {dest === 'ALL' ? 'ALL DESTINATIONS' : dest}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-10 pr-4 py-2 bg-white border-2 border-[#121212] text-xs font-bold text-[#121212] placeholder:text-slate-400 outline-none shadow-[3px_3px_0px_0px_#121212] focus:border-[#9E1B1D]"
                />
              </div>
            </div>

            {/* ── 4. ALL STORIES GRID ── */}
            {filteredStories.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-[#121212]/20 p-8 space-y-3 bg-white">
                <p className="font-brand font-black text-xl uppercase text-[#121212]">
                  No stories match your filter criteria
                </p>
                <button
                  onClick={() => {
                    setSelectedDestination('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {filteredStories
                  .filter((s) => (searchQuery || selectedDestination !== 'ALL' ? true : s.id !== featuredStory?.id))
                  .map((story) => (
                    <CustomerStoryCard key={story.id} story={story} />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
