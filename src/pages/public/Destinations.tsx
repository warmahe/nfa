import React, { useState, useMemo } from "react";
import { SlidersHorizontal, X, MapPin, Search, ChevronDown, Compass, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDestinationsData } from "../../hooks/useDestinationsData";
import { OperationalCard } from "../../components/destinations/OperationalCard";

const REGIONS = ["ALL", "EUROPE", "ASIA", "NORDIC", "AFRICA", "SOUTH AMERICA", "AMERICAS"];

export const Destinations = () => {
  const { destinations, loading } = useDestinationsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter destinations by active status, region, and search term
  const filtered = useMemo(() => {
    return destinations.filter(dest => {
      // 1. Must be active (or default to true if undefined)
      const isActive = dest.active !== false;
      if (!isActive) return false;

      // 2. Region match
      const regionMatch = selectedRegion === "ALL" ||
        dest.country?.toUpperCase().includes(selectedRegion.toUpperCase()) ||
        dest.continent?.toUpperCase().includes(selectedRegion.toUpperCase());

      // 3. Search match
      const searchMatch = searchTerm === "" ||
        dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return regionMatch && searchMatch;
    });
  }, [destinations, selectedRegion, searchTerm]);

  const activeFilterCount = [
    selectedRegion !== "ALL",
    searchTerm !== ""
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("ALL");
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-2 pb-24 nfa-texture text-left">

      {/* ── EDITORIAL HEADER ── */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12 pt-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-4 border-[#121212] pb-10">
          <div>
            <p className="font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3 flex items-center gap-2">
              <Compass size={14} /> Expedition Discovery
            </p>
            <h1 className="font-brand font-black uppercase text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.85] tracking-tighter text-[#121212]">
              EXPLORE<br /><span className="text-[#F4BF4B] drop-shadow-[3px_3px_0px_#121212]">DESTINATIONS.</span>
            </h1>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/60 mt-4 max-w-xl">
              Places worth going further for. Explore destinations through curated journeys, experiences and stays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/40" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[#121212] bg-white font-black text-[10px] uppercase tracking-widest outline-none focus:bg-[#F4BF4B]/10"
              />
            </div>

            {/* Region Select */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="appearance-none border-2 border-[#121212] bg-white pl-4 pr-10 py-3 font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r === 'ALL' ? 'ALL REGIONS' : r}</option>)}
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
            {selectedRegion !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                Region: {selectedRegion}
                <button onClick={() => setSelectedRegion("ALL")}><X size={12} /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
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
          <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">Loading destinations...</span>
        </div>
      ) : filtered.length === 0 ? (
        /* EDITORIAL EMPTY STATE */
        <div className="max-w-[1440px] mx-auto px-6 py-24 text-center">
          <div className="max-w-md mx-auto p-12 border-4 border-dashed border-[#121212]/20 bg-white rounded-2xl shadow-[8px_8px_0px_0px_#121212] space-y-4">
            <Sparkles size={40} className="mx-auto text-[#9E1B1D]" />
            <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
              NO DESTINATIONS AVAILABLE
            </h3>
            <p className="font-sans font-medium text-xs text-slate-600 leading-relaxed">
              We're currently preparing new destination discovery sectors matching your criteria. Please check back soon.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-[#121212] text-[#F4BF4B] px-8 py-3.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B]"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(dest => (
              <OperationalCard key={dest.id || dest.slug} dest={dest} />
            ))}
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
              className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#FCFBF7] z-[1001] border-l-[6px] border-[#121212] shadow-2xl flex flex-col overflow-y-auto"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-brand font-black text-4xl uppercase tracking-tighter">PARAMETERS</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Region Selection */}
                <div className="mb-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-5 flex items-center gap-2">
                    <MapPin size={14} /> Region / Continent
                  </h4>
                  <div className="flex flex-col gap-1">
                    {REGIONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRegion(r)}
                        className={`text-left px-5 py-3 font-bold text-xs tracking-widest border-2 transition-all ${
                          selectedRegion === r ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-transparent hover:border-[#121212]/20'
                        }`}
                      >
                        {r === 'ALL' ? 'ALL REGIONS' : r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-8 border-t-4 border-[#121212] bg-white flex gap-4">
                <button
                  onClick={clearFilters}
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
    </div>
  );
};