import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal, X, Map as MapIcon, Grid, Search, ArrowUpRight,
  Clock, Target, CreditCard, ChevronDown, Heart, Tag, Loader2, Star
} from "lucide-react";
import { useDestinations } from "../../hooks/useDestinations";
import { DestinationMap } from "../../components/destinations/DestinationMap";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../../services/wishlistService";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
  { value: "duration", label: "Duration" },
];

const TRAVEL_TYPES = ["ALL", "Adventure", "Luxury", "Wildlife", "Cultural", "Beach", "Mountain"];
const DIFFICULTY_LEVELS = ["ALL", "Easy", "Moderate", "Challenging", "Expert"];
const REGIONS = ["ALL", "ASIA", "EUROPE", "NORDIC", "SOUTH AMERICA", "AFRICA", "AMERICAS"];
const SEASONS = ["ALL", "Summer", "Winter", "Spring", "Autumn", "Year-Round"];

export const Packages = () => {
  const {
    filtered, loading,
    searchTerm, setSearchTerm,
    region, setRegion,
    difficulty, setDifficulty,
    sortBy, setSortBy,
    minBudget, setMinBudget,
    maxBudget, setMaxBudget,
    viewMode, setViewMode,
    clearFilters
  } = useDestinations();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [travelType, setTravelType] = useState("ALL");
  const [season, setSeason] = useState("ALL");
  const [wishlisted, setWishlisted] = useState<Record<string, boolean>>({});

  // Count active filters
  const activeFilterCount = [
    region !== "ALL", difficulty !== "ALL",
    travelType !== "ALL", season !== "ALL",
    minBudget !== "", maxBudget !== "",
    searchTerm !== ""
  ].filter(Boolean).length;

  const toggleWishlist = (pkg: any) => {
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
        rating: pkg.rating?.average || 0,
        duration: pkg.duration || '',
        category: 'Package',
      });
      setWishlisted(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleClearAll = () => {
    clearFilters();
    setTravelType("ALL");
    setSeason("ALL");
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-2 pb-24 nfa-texture">

      {/* ── HEADER ── */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12 pt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-4 border-[#121212] pb-10">
          <div>
            <p className="font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3 flex items-center gap-2">
              <Tag size={12} /> Curated Expeditions
            </p>
            <h1 className="font-brand font-black uppercase text-[clamp(3rem,7vw,7rem)] leading-[0.8] tracking-tighter text-[#121212]">
              ALL<br /><span className="text-[#F4BF4B] drop-shadow-[2px_2px_0px_#121212]">PACKAGES.</span>
            </h1>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/50 mt-4">
              {loading ? '...' : `${filtered.length} expeditions available`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/40" />
              <input
                type="text"
                placeholder="Search packages..."
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

            {/* View Toggle */}
            <div className="flex border-2 border-[#121212]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-colors ${viewMode === "grid" ? "bg-[#121212] text-[#F4BF4B]" : "bg-white hover:bg-gray-100"}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-3 border-l-2 border-[#121212] transition-colors ${viewMode === "map" ? "bg-[#121212] text-[#F4BF4B]" : "bg-white hover:bg-gray-100"}`}
                title="Map View"
              >
                <MapIcon size={16} />
              </button>
            </div>

            {/* Filter Button */}
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
            {travelType !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Type: {travelType}
                <button onClick={() => setTravelType("ALL")}><X size={12} /></button>
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

      {/* ── CONTENT: GRID or MAP ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
        </div>
      ) : viewMode === "map" ? (
        <div className="max-w-[1440px] mx-auto px-6">
          <DestinationMap packages={filtered} />
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="col-span-full py-24 text-center border-4 border-dashed border-[#121212]/10">
                <X size={40} className="mx-auto text-[#9E1B1D]/30 mb-4" />
                <p className="font-black uppercase tracking-widest text-xs text-[#121212]/40">No packages match your filters.</p>
                <button onClick={handleClearAll} className="mt-6 bg-[#121212] text-[#F4BF4B] px-8 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors">
                  Clear All Filters
                </button>
              </div>
            ) : filtered.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-[3px] border-[#121212] bg-white shadow-[6px_6px_0px_0px_#121212] flex flex-col overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] border-b-[3px] border-[#121212] bg-[#121212] overflow-hidden shrink-0">
                  <img
                    src={pkg.media?.thumbnail || `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600`}
                    className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    alt={pkg.title}
                  />
                  <div className="absolute top-3 left-3 bg-[#F4BF4B] border-2 border-[#121212] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                    {pkg.destinations?.[0] || 'Global'}
                  </div>
                  {/* Wishlist Heart */}
                  <button
                    onClick={() => toggleWishlist(pkg)}
                    className={`absolute top-3 right-3 size-8 flex items-center justify-center border-2 border-[#121212] transition-colors ${
                      wishlisted[pkg.id] || isInWishlist(pkg.id)
                        ? 'bg-[#9E1B1D] text-white'
                        : 'bg-white text-[#121212] hover:bg-[#9E1B1D] hover:text-white'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart size={14} fill={wishlisted[pkg.id] || isInWishlist(pkg.id) ? 'currentColor' : 'none'} />
                  </button>
                  {pkg.rating?.average > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#121212] text-[#F4BF4B] px-2 py-1 text-[9px] font-black">
                      <Star size={10} fill="currentColor" /> {pkg.rating.average.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Data */}
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="font-brand font-black text-2xl uppercase leading-none mb-4 tracking-tighter">
                    {pkg.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-[#121212]/10 pt-4 mb-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
                        <Clock size={9} /> Duration
                      </span>
                      <span className="text-xs font-bold uppercase">{pkg.duration}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
                        <Target size={9} /> Difficulty
                      </span>
                      <span className="text-xs font-bold uppercase">{pkg.difficulty}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest flex items-center gap-1">
                        <CreditCard size={9} /> Investment
                      </span>
                      <span className="text-xs font-bold uppercase text-[#9E1B1D]">
                        {pkg.pricing?.basePrice ? `₹${pkg.pricing.basePrice.toLocaleString()}` : 'Contact'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black uppercase text-[#121212]/40 tracking-widest">Travelers</span>
                      <span className="text-xs font-bold uppercase">{pkg.maxTravelers || '—'}</span>
                    </div>
                  </div>

                  <Link
                    to={`/itinerary/${pkg.slug || pkg.id}`}
                    className="mt-auto w-full bg-[#121212] text-[#FCFBF7] py-3.5 px-4 font-sans font-black text-[10px] uppercase tracking-[0.3em] flex justify-between items-center hover:bg-[#9E1B1D] transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    View Expedition <ArrowUpRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
                    <CreditCard size={12} /> Budget Range (₹)
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
                    <Target size={12} /> Difficulty Level
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map(d => (
                      <button
                        key={d} onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 font-black text-[9px] tracking-widest border-2 transition-all ${
                          difficulty === d ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-[#121212]/20 hover:border-[#121212]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Type */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5">Travel Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_TYPES.map(t => (
                      <button
                        key={t} onClick={() => setTravelType(t)}
                        className={`px-4 py-2 font-black text-[9px] tracking-widest border-2 transition-all ${
                          travelType === t ? 'bg-[#F4BF4B] border-[#121212]' : 'border-[#121212]/20 hover:border-[#121212]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Best Season */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5">Best Season</h4>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map(s => (
                      <button
                        key={s} onClick={() => setSeason(s)}
                        className={`px-4 py-2 font-black text-[9px] tracking-widest border-2 transition-all ${
                          season === s ? 'bg-[#F4BF4B] border-[#121212]' : 'border-[#121212]/20 hover:border-[#121212]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t-4 border-[#121212] flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] hover:text-[#FCFBF7] transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] bg-[#9E1B1D] text-white py-4 font-sans font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#121212]"
                >
                  Apply ({filtered.length} results)
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
