import React, { useState } from "react";
import { useDestinations } from "../../hooks/useDestinations";
import { OperationalCard } from "../../components/destinations/OperationalCard";
import { DestinationMap } from "../../components/destinations/DestinationMap";
import { SlidersHorizontal, X, Target, Map as MapIcon, Grid, ChevronDown, Search, CreditCard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const REGIONS = ["ALL", "NORDIC", "ASIA", "SOUTH AMERICA", "AFRICA", "EUROPE", "AMERICAS"];
const DIFFICULTIES = ["ALL", "EASY", "MODERATE", "CHALLENGING", "EXPERT"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "duration", label: "Duration" },
];

export const Destinations = () => {
  const {
    filtered, loading,
    searchTerm, setSearchTerm,
    region, setRegion,
    difficulty, setDifficulty,
    sortBy, setSortBy,
    minBudget, setMinBudget,
    maxBudget, setMaxBudget,
    viewMode, setViewMode,
    clearFilters,
  } = useDestinations();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = [
    region !== "ALL",
    difficulty !== "ALL",
    minBudget !== "",
    maxBudget !== "",
    searchTerm !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-2 pb-24 nfa-texture">

      {/* ── 1. HEADER SECTION ── */}
      <div className="max-w-[1440px] mx-auto px-6 mb-12 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-4 border-[#121212] pb-10">
          <div className="relative">
            <h1 className="font-brand font-black uppercase text-[clamp(3.5rem,8vw,8rem)] leading-[0.8] tracking-tighter text-[#121212]">
              TARGET <br />
              <span className="text-[#F4BF4B] drop-shadow-[2px_2px_0px_#121212]">SECTORS.</span>
            </h1>
            {!loading && (
              <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] opacity-50 mt-4">
                {filtered.length} active destinations
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#121212]/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-3 border-2 border-[#121212] bg-white font-black text-[10px] uppercase tracking-widest outline-none focus:bg-[#F4BF4B]/10 w-40"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none border-2 border-[#121212] bg-white pl-4 pr-8 py-3 font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
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

            {/* Modular Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="relative group flex items-center gap-4 bg-[#121212] text-[#FCFBF7] px-8 py-4 border-2 border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <span className="font-sans font-black text-xs uppercase tracking-widest">Adjust Parameters</span>
              <SlidersHorizontal size={18} className="text-[#F4BF4B]" />
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
                "{searchTerm}" <button onClick={() => setSearchTerm("")}><X size={10} /></button>
              </span>
            )}
            {region !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                {region} <button onClick={() => setRegion("ALL")}><X size={10} /></button>
              </span>
            )}
            {difficulty !== "ALL" && (
              <span className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                {difficulty} <button onClick={() => setDifficulty("ALL")}><X size={10} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-[#9E1B1D] text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
              <X size={10} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── 2. CONTENT ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
        </div>
      ) : viewMode === "map" ? (
        <div className="max-w-[1440px] mx-auto px-6">
          <DestinationMap packages={filtered} height="65vh" />
        </div>
      ) : (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-[#121212]/10">
              <p className="font-black uppercase tracking-widest text-xs text-[#121212]/40 mb-6">No destinations match your parameters.</p>
              <button onClick={clearFilters} className="bg-[#121212] text-[#F4BF4B] px-8 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors">
                Reset Filters
              </button>
            </div>
          ) : (
            filtered.map(dest => (
              <OperationalCard key={dest.id} dest={dest} />
            ))
          )}
        </div>
      )}

      {/* ── 3. SLIDE-IN FILTER DRAWER ── */}
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
              className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-[#FCFBF7] z-[1001] border-l-[6px] border-[#121212] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="font-brand font-black text-4xl uppercase tracking-tighter">PARAMETERS</h2>
                  <button onClick={() => setIsFilterOpen(false)} className="p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Budget */}
                <div className="mb-10">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-6 flex items-center gap-2">
                    <CreditCard size={14} /> Budget Range (₹)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-50 block mb-1">Min</label>
                      <input
                        type="number" placeholder="0" value={minBudget}
                        onChange={e => setMinBudget(e.target.value ? Number(e.target.value) : "")}
                        className="w-full border-2 border-[#121212] p-3 font-bold outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest opacity-50 block mb-1">Max</label>
                      <input
                        type="number" placeholder="∞" value={maxBudget}
                        onChange={e => setMaxBudget(e.target.value ? Number(e.target.value) : "")}
                        className="w-full border-2 border-[#121212] p-3 font-bold outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Region Select */}
                <div className="mb-10">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-6 flex items-center gap-2">
                    <MapIcon size={14} /> Select Sector
                  </h4>
                  <div className="flex flex-col gap-2">
                    {REGIONS.map(r => (
                      <button
                        key={r} onClick={() => setRegion(r)}
                        className={`text-left px-6 py-4 font-bold text-xs tracking-widest border-2 transition-all ${
                          region === r ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-transparent hover:border-[#121212]/20'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Select */}
                <div className="mb-10">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-[#9E1B1D] mb-6 flex items-center gap-2">
                    <Target size={14} /> Intensity Level
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d} onClick={() => setDifficulty(d)}
                        className={`px-4 py-2 font-black text-[9px] tracking-tighter border-2 transition-all ${
                          difficulty === d ? 'bg-[#121212] text-[#FCFBF7] border-[#121212]' : 'border-[#121212]/20 hover:border-[#121212]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t-4 border-[#121212] flex gap-3">
                <button onClick={clearFilters} className="flex-1 py-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] hover:text-[#FCFBF7] transition-colors">
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-[2] bg-[#9E1B1D] text-white py-6 font-sans font-black text-sm uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#121212]"
                >
                  Apply Parameters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};