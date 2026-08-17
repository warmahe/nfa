import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Package, Destination, CustomerStory } from '../../types/database';
import { PackageJourneyCard } from '../../components/packages/PackageJourneyCard';
import { CustomerStoryCard } from '../../components/stories/CustomerStoryCard';
import { useEnquiry } from '../../context/EnquiryContext';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveExploreSEO } from '../../utils/seo';
import {
  Compass,
  MapPin,
  BookOpen,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Clock,
  Layers,
  ChevronDown,
  Bookmark,
} from 'lucide-react';
import { useJourneyShortlist } from '../../hooks/useJourneyShortlist';

type ExploreTab = 'journeys' | 'destinations' | 'stories';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openEnquiryModal } = useEnquiry();
  const { shortlistCount } = useJourneyShortlist();

  // Active Tab from URL
  const activeTab = (searchParams.get('type') as ExploreTab) || 'journeys';

  // Realtime Datasets
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscriptions to canonical collections
  useEffect(() => {
    setLoading(true);

    const unsubPackages = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package));
        setPackages(list.filter((p) => p.status !== 'draft' && (p as any).active !== false));
      },
      (err) => console.error('Error fetching packages in Explore:', err)
    );

    const unsubDestinations = onSnapshot(
      collection(db, 'destinations'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
        setDestinations(list.filter((d) => d.active !== false));
      },
      (err) => console.error('Error fetching destinations in Explore:', err)
    );

    const unsubStories = onSnapshot(
      collection(db, 'customerStories'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerStory));
        setStories(list.filter((s) => s.status === 'PUBLISHED'));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching stories in Explore:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubPackages();
      unsubDestinations();
      unsubStories();
    };
  }, []);

  // Filter & Search Params from URL
  const searchQuery = searchParams.get('search') || '';
  const selectedDestination = searchParams.get('destination') || 'ALL';
  const selectedStyle = searchParams.get('style') || 'ALL';
  const selectedDuration = searchParams.get('duration') || 'ALL';
  const selectedDifficulty = searchParams.get('difficulty') || 'ALL';
  const selectedRegion = searchParams.get('region') || 'ALL';
  const selectedRating = searchParams.get('rating') || 'ALL';
  const sortBy = searchParams.get('sort') || 'RECOMMENDED';

  // Helper to update search params preserving existing keys
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (tab: ExploreTab) => {
    const next = new URLSearchParams();
    next.set('type', tab);
    if (searchQuery) next.set('search', searchQuery);
    setSearchParams(next, { replace: true });
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    next.set('type', activeTab);
    setSearchParams(next, { replace: true });
  };

  // ── FILTER POPULATION DERIVATIONS (Only actual values from data) ──
  const destinationOptions = useMemo(() => {
    const set = new Set<string>();
    packages.forEach((p) => (p.destinations || []).forEach((d) => set.add(d)));
    destinations.forEach((d) => set.add(d.name));
    return Array.from(set).sort();
  }, [packages, destinations]);

  const styleOptions = useMemo(() => {
    const set = new Set<string>();
    packages.forEach((p) => {
      if (Array.isArray(p.travelStyle)) {
        p.travelStyle.forEach((s) => set.add(s));
      } else if (p.travelStyle) {
        set.add(p.travelStyle);
      }
      if (p.style) set.add(p.style);
    });
    return Array.from(set).sort();
  }, [packages]);

  const difficultyOptions = useMemo(() => {
    const set = new Set<string>();
    packages.forEach((p) => {
      if (p.difficulty) set.add(p.difficulty);
    });
    return Array.from(set).sort();
  }, [packages]);

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.region) set.add(d.region);
      if (d.country) set.add(d.country);
    });
    return Array.from(set).sort();
  }, [destinations]);

  // ── FILTERED & SORTED RESULTS ──

  // 1. Filtered Journeys
  const filteredJourneys = useMemo(() => {
    return packages
      .filter((pkg) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (pkg.title || '').toLowerCase().includes(q);
          const matchDesc = (pkg.description || pkg.tagline || '').toLowerCase().includes(q);
          const matchDest = (pkg.destinations || []).some((d) => d.toLowerCase().includes(q));
          const pkgStyle = (Array.isArray(pkg.travelStyle) ? pkg.travelStyle.join(' ') : pkg.travelStyle || pkg.style || '').toLowerCase();
          const matchStyle = pkgStyle.includes(q);
          const matchInterests = (pkg.interests || []).some((i) => i.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchDest && !matchStyle && !matchInterests) {
            return false;
          }
        }

        // Destination Filter
        if (selectedDestination !== 'ALL') {
          const match = (pkg.destinations || []).some(
            (d) => d.toLowerCase() === selectedDestination.toLowerCase()
          );
          if (!match) return false;
        }

        // Travel Style Filter
        if (selectedStyle !== 'ALL') {
          const style = (Array.isArray(pkg.travelStyle) ? pkg.travelStyle.join(' ') : pkg.travelStyle || pkg.style || '').toLowerCase();
          if (!style.includes(selectedStyle.toLowerCase())) return false;
        }

        // Difficulty Filter
        if (selectedDifficulty !== 'ALL') {
          const diff = (pkg.difficulty || '').toLowerCase();
          if (diff !== selectedDifficulty.toLowerCase()) return false;
        }

        // Duration Filter
        if (selectedDuration !== 'ALL') {
          const days = typeof pkg.durationDays === 'number' ? pkg.durationDays : parseInt(String(pkg.duration || 0), 10) || 0;
          if (selectedDuration === 'UNDER_7' && days >= 7) return false;
          if (selectedDuration === '7_10' && (days < 7 || days > 10)) return false;
          if (selectedDuration === '11_14' && (days < 11 || days > 14)) return false;
          if (selectedDuration === 'OVER_14' && days <= 14) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') {
          return (a.pricing?.basePrice || 0) - (b.pricing?.basePrice || 0);
        }
        if (sortBy === 'PRICE_DESC') {
          return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
        }
        if (sortBy === 'DURATION_ASC') {
          const aDays = typeof a.durationDays === 'number' ? a.durationDays : parseInt(String(a.duration || 0), 10) || 0;
          const bDays = typeof b.durationDays === 'number' ? b.durationDays : parseInt(String(b.duration || 0), 10) || 0;
          return aDays - bDays;
        }
        if (sortBy === 'DURATION_DESC') {
          const aDays = typeof a.durationDays === 'number' ? a.durationDays : parseInt(String(a.duration || 0), 10) || 0;
          const bDays = typeof b.durationDays === 'number' ? b.durationDays : parseInt(String(b.duration || 0), 10) || 0;
          return bDays - aDays;
        }
        if (sortBy === 'NEWEST') {
          return (b.createdAt as any) - (a.createdAt as any);
        }
        return 0;
      });
  }, [packages, searchQuery, selectedDestination, selectedStyle, selectedDifficulty, selectedDuration, sortBy]);

  // 2. Filtered Destinations
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((dest) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (dest.name || '').toLowerCase().includes(q);
          const matchCountry = (dest.country || '').toLowerCase().includes(q);
          const matchRegion = (dest.region || '').toLowerCase().includes(q);
          const matchDesc = (dest.description || dest.tagline || '').toLowerCase().includes(q);
          if (!matchName && !matchCountry && !matchRegion && !matchDesc) return false;
        }

        if (selectedRegion !== 'ALL') {
          const r = (dest.region || dest.country || '').toLowerCase();
          if (r !== selectedRegion.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'A_Z') return a.name.localeCompare(b.name);
        if (sortBy === 'Z_A') return b.name.localeCompare(a.name);
        return 0; // RECOMMENDED
      });
  }, [destinations, searchQuery, selectedRegion, sortBy]);

  // 3. Filtered Stories
  const filteredStories = useMemo(() => {
    return stories
      .filter((story) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (story.title || '').toLowerCase().includes(q);
          const matchDest = (story.destination || '').toLowerCase().includes(q);
          const matchExcerpt = (story.excerpt || story.customerQuote || '').toLowerCase().includes(q);
          const matchAuthor = (story.customerName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDest && !matchExcerpt && !matchAuthor) return false;
        }

        if (selectedDestination !== 'ALL') {
          const dest = (story.destination || '').toLowerCase();
          if (dest !== selectedDestination.toLowerCase() && !dest.includes(selectedDestination.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'A_Z') return a.title.localeCompare(b.title);
        if (sortBy === 'NEWEST') return (b.createdAt as any) - (a.createdAt as any);
        // Default FEATURED
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return b.featured ? 1 : -1;
        }
        return 0;
      });
  }, [stories, searchQuery, selectedDestination, sortBy]);

  const activeCount =
    activeTab === 'journeys'
      ? filteredJourneys.length
      : activeTab === 'destinations'
      ? filteredDestinations.length
      : filteredStories.length;

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedDestination !== 'ALL' ||
    selectedStyle !== 'ALL' ||
    selectedDuration !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedRegion !== 'ALL' ||
    selectedRating !== 'ALL';

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 font-sans selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Dynamic SEO Meta Tags */}
      <SeoHead metadata={resolveExploreSEO()} />

      {/* ── 1. EDITORIAL HERO HEADER ── */}
      <section className="bg-[#121212] text-white border-b-4 border-[#9E1B1D] pt-28 pb-16 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-[0.3em]">
              <Compass size={14} /> PUBLIC DISCOVERY DIRECTORY
            </span>
          </div>

          <h1 className="font-brand font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-[0.88] text-[#FCFBF7]">
            EXPLORE YOUR <br />
            <span className="text-[#F4BF4B]">NEXT JOURNEY.</span>
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Browse journeys, destinations and traveller experiences to find inspiration for your next expedition.
          </p>

          {/* Tab Navigation Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {[
              { id: 'journeys', label: `JOURNEYS (${packages.length})`, icon: Compass },
              { id: 'destinations', label: `DESTINATIONS (${destinations.length})`, icon: MapPin },
              { id: 'stories', label: `STORIES (${stories.length})`, icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as ExploreTab)}
                  className={`px-5 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer border-2 ${
                    isActive
                      ? 'bg-[#F4BF4B] text-[#121212] border-[#F4BF4B] shadow-[4px_4px_0px_0px_#9E1B1D]'
                      : 'bg-white/5 text-white/70 border-white/20 hover:border-white/60 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. SEARCH & FILTER CONTROLS BAR ── */}
      <section className="bg-white border-b-4 border-[#121212] sticky top-20 z-40 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-xl">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="Search journeys, destinations, and stories..."
                className="w-full pl-10 pr-10 py-3 bg-[#FCFBF7] border-2 border-[#121212] rounded-none text-xs font-bold text-[#121212] placeholder:text-slate-400 outline-none focus:bg-white shadow-[3px_3px_0px_0px_#121212]"
              />
              {searchQuery && (
                <button
                  onClick={() => updateParam('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#121212]"
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Destination Filter */}
              {destinationOptions.length > 0 && (
                <select
                  value={selectedDestination}
                  onChange={(e) => updateParam('destination', e.target.value)}
                  className="px-3 py-2.5 bg-[#FCFBF7] border-2 border-[#121212] text-xs font-bold uppercase text-[#121212] outline-none cursor-pointer"
                >
                  <option value="ALL">All Destinations</option>
                  {destinationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              {/* Travel Style Filter (Journeys Tab) */}
              {activeTab === 'journeys' && styleOptions.length > 0 && (
                <select
                  value={selectedStyle}
                  onChange={(e) => updateParam('style', e.target.value)}
                  className="px-3 py-2.5 bg-[#FCFBF7] border-2 border-[#121212] text-xs font-bold uppercase text-[#121212] outline-none cursor-pointer"
                >
                  <option value="ALL">All Travel Styles</option>
                  {styleOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}

              {/* Duration Filter (Journeys Tab) */}
              {activeTab === 'journeys' && (
                <select
                  value={selectedDuration}
                  onChange={(e) => updateParam('duration', e.target.value)}
                  className="px-3 py-2.5 bg-[#FCFBF7] border-2 border-[#121212] text-xs font-bold uppercase text-[#121212] outline-none cursor-pointer"
                >
                  <option value="ALL">Any Duration</option>
                  <option value="UNDER_7">&lt; 7 Days</option>
                  <option value="7_10">7 – 10 Days</option>
                  <option value="11_14">11 – 14 Days</option>
                  <option value="OVER_14">15+ Days</option>
                </select>
              )}

              {/* Region Filter (Destinations Tab) */}
              {activeTab === 'destinations' && regionOptions.length > 0 && (
                <select
                  value={selectedRegion}
                  onChange={(e) => updateParam('region', e.target.value)}
                  className="px-3 py-2.5 bg-[#FCFBF7] border-2 border-[#121212] text-xs font-bold uppercase text-[#121212] outline-none cursor-pointer"
                >
                  <option value="ALL">All Regions</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}

              {/* Sort Order Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-500 hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="px-3 py-2.5 bg-[#FCFBF7] border-2 border-[#121212] text-xs font-bold uppercase text-[#121212] outline-none cursor-pointer"
                >
                  {activeTab === 'journeys' && (
                    <>
                      <option value="RECOMMENDED">Recommended</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="DURATION_ASC">Duration: Short to Long</option>
                      <option value="DURATION_DESC">Duration: Long to Short</option>
                      <option value="NEWEST">Newest</option>
                    </>
                  )}
                  {activeTab === 'destinations' && (
                    <>
                      <option value="RECOMMENDED">Recommended</option>
                      <option value="A_Z">A – Z</option>
                      <option value="Z_A">Z – A</option>
                    </>
                  )}
                  {activeTab === 'stories' && (
                    <>
                      <option value="FEATURED">Featured Stories</option>
                      <option value="NEWEST">Newest</option>
                      <option value="A_Z">A – Z</option>
                    </>
                  )}
                </select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2.5 bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-black uppercase tracking-wider hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Active Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider pt-1 border-t border-slate-100">
            <span>
              Showing {activeCount} {activeTab}
              {hasActiveFilters ? ' matching your filters' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. RESULTS GRID / MAIN CONTENT ── */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-16">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Compass size={36} className="mx-auto text-[#9E1B1D] animate-spin" />
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
              Loading {activeTab}...
            </p>
          </div>
        ) : activeCount === 0 ? (
          /* Empty State */
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/20 p-12 bg-white space-y-4 max-w-xl mx-auto shadow-[8px_8px_0px_0px_#F4BF4B]">
            <Compass size={40} className="mx-auto text-slate-400" />
            <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
              {activeTab === 'journeys' && 'No journeys match these filters.'}
              {activeTab === 'destinations' && 'No destinations match your search.'}
              {activeTab === 'stories' && 'No traveller stories match your selection.'}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to discover more expeditions.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={14} /> CLEAR ALL FILTERS
              </button>
            )}
          </div>
        ) : (
          /* Render Active Tab Results */
          <div>
            {activeTab === 'journeys' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredJourneys.map((pkg) => (
                  <PackageJourneyCard key={pkg.id || pkg.slug} pkg={pkg} />
                ))}
              </div>
            )}

            {activeTab === 'destinations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredDestinations.map((dest) => {
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
                            EXPLORE DESTINATION <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {activeTab === 'stories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredStories.map((story) => (
                  <CustomerStoryCard key={story.id || story.slug} story={story} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── 4. BESPOKE JOURNEY PLANNING ESCAPE HATCH (E35 Enquiry Integration) ── */}
      <section className="border-t-4 border-[#121212] bg-[#121212] text-white py-20 px-6 md:px-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <Sparkles size={40} className="mx-auto text-[#F4BF4B]" />
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B]">
              BESPOKE EXPEDITIONS
            </span>
            <h2 className="font-brand font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              CAN'T FIND YOUR EXACT JOURNEY?
            </h2>
            <p className="font-serif italic text-base text-slate-300 leading-relaxed">
              Every expedition we craft is private and made-to-measure. Tell us where you dream of going and our travel team will design it for you.
            </p>
          </div>

          <button
            onClick={() =>
              openEnquiryModal({
                source: 'EXPLORE_DIRECTORY',
                entryPoint: 'EXPLORE_PAGE_CTA',
              })
            }
            className="inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[6px_6px_0px_0px_#9E1B1D] cursor-pointer"
          >
            PLAN YOUR JOURNEY <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── 5. FLOATING SHORTLIST INDICATOR TOOLBAR (E49) ── */}
      {shortlistCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#121212] text-white p-3 sm:px-5 sm:py-3.5 border-2 border-[#F4BF4B] shadow-[6px_6px_0px_0px_#9E1B1D] flex items-center gap-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="fill-[#F4BF4B] text-[#F4BF4B]" />
              <span className="font-black text-xs uppercase tracking-wider text-[#F4BF4B]">
                {shortlistCount} {shortlistCount === 1 ? 'Journey' : 'Journeys'} Shortlisted
              </span>
            </div>

            <div className="flex items-center gap-2">
              {shortlistCount >= 2 && (
                <Link
                  to="/compare"
                  className="px-3.5 py-1.5 bg-[#F4BF4B] text-[#121212] font-black text-[10px] uppercase tracking-wider hover:bg-white transition-colors"
                >
                  COMPARE
                </Link>
              )}
              <Link
                to="/shortlist"
                className="px-3.5 py-1.5 bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-white/20 transition-colors"
              >
                VIEW SHORTLIST
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
