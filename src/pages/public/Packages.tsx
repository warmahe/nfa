import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal, X, Map as MapIcon, Search,
  ChevronDown, Tag, Loader2, Sparkles, Compass, Bookmark
} from "lucide-react";
import { Link } from "react-router-dom";
import { useJourneyShortlist } from "../../hooks/useJourneyShortlist";
import { useDestinations } from "../../hooks/useDestinations";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../../services/wishlistService";
import { PackageJourneyCard } from "../../components/packages/PackageJourneyCard";
import { Package } from "../../types/database";
import { SeoHead } from "../../components/shared/SeoHead";
import { resolveStaticPageSEO } from "../../utils/seo";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "duration", label: "Duration" },
];

const DIFFICULTY_LEVELS = ["ALL", "Easy", "Moderate", "Challenging", "Expert"];
const REGIONS = ["ALL", "ASIA", "EUROPE", "NORDIC", "SOUTH AMERICA", "AFRICA", "AMERICAS"];

export const Packages = () => {
  const {
    filtered, loading,
    searchTerm, setSearchTerm,
    region, setRegion,
    difficulty, setDifficulty,
    sortBy, setSortBy,
    minBudget, setMinBudget,
    maxBudget, setMaxBudget,
    clearFilters
  } = useDestinations();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [travelType, setTravelType] = useState("ALL");
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});
  const { shortlistCount } = useJourneyShortlist();

  // Count active filters
  const activeFilterCount = [
    region !== "ALL", difficulty !== "ALL",
    travelType !== "ALL", minBudget !== "", maxBudget !== "",
    searchTerm !== ""
  ].filter(Boolean).length;

  const toggleWishlist = (pkg: Package) => {
    const id = pkg.id;
    if (wishlisted[id] || isInWishlist(id)) {
      removeFromWishlist(id);
      setWishlisted(prev => ({ ...prev, [id]: false }));
    } else {
      addToWishlist({
        id, destination_id: id,
        name: pkg.title,
        image: pkg.media?.thumbnail || '',
        destination: pkg.destinations?.[0] || '',
        price: `₹${pkg.pricing?.basePrice?.toLocaleString() || 0}`,
        rating: 5,
        duration: pkg.duration || '',
        category: 'Package',
      });
      setWishlisted(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleClearAll = () => {
    clearFilters();
    setTravelType("ALL");
  };

  // Separate featured journeys (first 2 when no active filters) vs all journeys
  const showFeaturedSection = activeFilterCount === 0 && filtered.length > 2;
  const featuredPackages = showFeaturedSection ? filtered.slice(0, 2) : [];
  const gridPackages = showFeaturedSection ? filtered.slice(2) : filtered;

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-2 pb-24 nfa-texture text-left">
      <SeoHead metadata={resolveStaticPageSEO('packages')} />

      {/* ── EDITORIAL PAGE HEADER ── */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12 pt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-4 border-[#121212] pb-10">
          <div>
            <p className="font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3 flex items-center gap-2">
              <Compass size={14} /> Curated Expeditions
            </p>
            <h1 className="font-brand font-black uppercase text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.85] tracking-tighter text-[#121212]">
              CURATED<br /><span className="text-[#F4BF4B] drop-shadow-[3px_3px_0px_#121212]">JOURNEYS.</span>
            </h1>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/60 mt-4 max-w-xl">
              Curated journeys designed around places, experiences and time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/40" />
              <input
                type="text"
                placeholder="Search journeys..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[#121212] bg-white font-black text-[10px] uppercase tracking-widest outline-none focus:bg-[#F4BF4B]/10"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none border-2 border-[#121212] bg-white pl-4 pr-10 py-3 font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative flex items-center gap-3 bg-[#121212] text-[#FCFBF7] px-6 py-3 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <SlidersHorizontal size={16} className="text-[#F4BF4B]" />
              <span className="font-black text-[10px] uppercase tracking-widest">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 size-5 bg-[#9E1B1D] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {searchTerm && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")}><X size={12} /></button>
              </span>
            )}
            {region !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Region: {region}
                <button onClick={() => setRegion("ALL")}><X size={12} /></button>
              </span>
            )}
            {difficulty !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Difficulty: {difficulty}
                <button onClick={() => setDifficulty("ALL")}><X size={12} /></button>
              </span>
            )}
            {(minBudget !== "" || maxBudget !== "") && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Budget: {minBudget || '0'} – {maxBudget || '∞'}
                <button onClick={() => { setMinBudget(""); setMaxBudget(""); }}><X size={12} /></button>
              </span>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[#9E1B1D] text-[9px] font-black uppercase tracking-widest hover:underline"
            >
              <X size={10} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT STREAM ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">Loading journeys...</span>
        </div>
      ) : filtered.length === 0 ? (
        /* EDITORIAL EMPTY STATE */
        <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
          <div className="max-w-md mx-auto p-12 border-4 border-dashed border-[#121212]/20 bg-white rounded-2xl shadow-[8px_8px_0px_0px_#121212] space-y-4">
            <Sparkles size={40} className="mx-auto text-[#9E1B1D]" />
            <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
              NO JOURNEYS AVAILABLE YET
            </h3>
            <p className="font-sans font-medium text-xs text-slate-600 leading-relaxed">
              We're currently preparing new journeys matching your search criteria. Please adjust your filters or check back soon.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAll}
                className="mt-4 bg-[#121212] text-[#F4BF4B] px-8 py-3.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B]"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-6 space-y-16">
          
          {/* ── FEATURED JOURNEYS SECTION ── */}
          {showFeaturedSection && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-[#121212]/10 pb-4">
                <Sparkles size={16} className="text-[#9E1B1D]" />
                <h2 className="font-brand font-black text-xl uppercase tracking-wider text-[#121212]">
                  FEATURED JOURNEYS
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPackages.map((pkg) => (
                  <PackageJourneyCard
                    key={pkg.id}
                    pkg={pkg}
                    wishlisted={wishlisted[pkg.id] || isInWishlist(pkg.id)}
                    onToggleWishlist={toggleWishlist}
                    isFeatured={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── ALL JOURNEYS GRID ── */}
          <div className="space-y-8">
            {showFeaturedSection && (
              <div className="flex items-center gap-3 border-b-2 border-[#121212]/10 pb-4">
                <Compass size={16} className="text-[#121212]" />
                <h2 className="font-brand font-black text-xl uppercase tracking-wider text-[#121212]">
                  ALL CURATED JOURNEYS ({gridPackages.length})
                </h2>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPackages.map((pkg) => (
                <PackageJourneyCard
                  key={pkg.id}
                  pkg={pkg}
                  wishlisted={wishlisted[pkg.id] || isInWishlist(pkg.id)}
                  onToggleWishlist={toggleWishlist}
                  isFeatured={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER DRAWER ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-[#121212]/60 backdrop-blur-sm z-[1000]"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#FCFBF7] z-[1001] border-l-[6px] border-[#121212] shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-brand font-black text-4xl uppercase tracking-tighter">FILTERS</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Budget Range */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5 flex items-center gap-2">
                    Budget Range (₹)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-50 block mb-1">Min</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minBudget}
                        onChange={e => setMinBudget(e.target.value ? Number(e.target.value) : "")}
                        className="w-full border-2 border-[#121212] p-3 font-bold outline-none focus:bg-[#F4BF4B]/10 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-50 block mb-1">Max</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={maxBudget}
                        onChange={e => setMaxBudget(e.target.value ? Number(e.target.value) : "")}
                        className="w-full border-2 border-[#121212] p-3 font-bold outline-none focus:bg-[#F4BF4B]/10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Region */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5 flex items-center gap-2">
                    <MapIcon size={12} /> Region
                  </h4>
                  <div className="flex flex-col gap-1">
                    {REGIONS.map(r => (
                      <button
                        key={r} onClick={() => setRegion(r)}
                        className={`text-left px-5 py-3 font-bold text-xs tracking-widest border-2 transition-all ${
                          region === r ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-transparent hover:border-[#121212]/20'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5 flex items-center gap-2">
                    Difficulty Level
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map(d => (
                      <button
                        key={d} onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                          difficulty === d ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]' : 'bg-white text-[#121212] border-[#121212]/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-8 border-t-4 border-[#121212] bg-white flex gap-4">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-4 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B]"
                >
                  Apply Filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Shortlist Indicator Toolbar (E49) */}
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
