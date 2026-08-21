import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Package } from '../../types/database';
import { useJourneyShortlist } from '../../hooks/useJourneyShortlist';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveStaticPageSEO } from '../../utils/seo';
import {
  Bookmark,
  Trash2,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
  Clock,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Calendar,
} from 'lucide-react';

export const Shortlist: React.FC = () => {
  const navigate = useNavigate();
  const {
    shortlistedIds,
    removeFromShortlist,
    clearShortlist,
    shortlistCount,
  } = useJourneyShortlist();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; title: string } | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Realtime subscription to canonical packages collection
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package));
        // Filter out draft / inactive items
        setPackages(list.filter((p) => p.status !== 'draft' && (p as any).active !== false));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching packages in Shortlist:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Resolve shortlisted journeys against canonical packages
  const activeShortlistedPackages = useMemo(() => {
    return shortlistedIds
      .map((id) => packages.find((p) => p.id === id || p.slug === id))
      .filter((p): p is Package => Boolean(p));
  }, [shortlistedIds, packages]);

  // Keep selectedForCompare in sync with active items
  useEffect(() => {
    setSelectedForCompare((prev) =>
      prev.filter((id) => activeShortlistedPackages.some((p) => p.id === id))
    );
  }, [activeShortlistedPackages]);

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          // If already 3, replace the last one or prevent
          return [...prev.slice(1), id];
        }
        return [...prev, id];
      }
    });
  };

  const handleCompareClick = () => {
    let idsToCompare = selectedForCompare;
    if (idsToCompare.length < 2) {
      // Default to first 2 or 3 active items
      idsToCompare = activeShortlistedPackages.slice(0, 3).map((p) => p.id);
    }
    if (idsToCompare.length >= 2) {
      navigate(`/compare?ids=${idsToCompare.join(',')}`);
    }
  };

  const isCompareReady =
    selectedForCompare.length >= 2 || activeShortlistedPackages.length >= 2;

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 font-sans selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Dynamic SEO Meta (noindex, nofollow for user shortlist state) */}
      <SeoHead
        metadata={{
          title: 'Your Journey Shortlist | NO FIXED ADDRESS',
          description: "Keep the journeys you're considering in one place and compare them when you're ready.",
          type: 'website',
          robots: 'noindex, nofollow',
          canonicalUrl: 'https://nofixedaddress.cc/shortlist',
        }}
      />

      {/* ── 1. HEADER ── */}
      <section className="bg-[#121212] text-white border-b-4 border-[#9E1B1D] pt-28 pb-16 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-[0.3em]">
              <Bookmark size={14} className="fill-white" /> TRAVELLER SHORTLIST
            </span>
          </div>

          <h1 className="font-brand font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-[0.88] text-[#FCFBF7]">
            YOUR JOURNEY <br />
            <span className="text-[#F4BF4B]">SHORTLIST.</span>
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Keep the journeys you're considering in one place and compare them when you're ready.
          </p>
        </div>
      </section>

      {/* ── 2. MAIN CONTENT ── */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-16 space-y-8">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Bookmark size={36} className="mx-auto text-[#9E1B1D] animate-pulse" />
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
              Loading your shortlist...
            </p>
          </div>
        ) : activeShortlistedPackages.length === 0 ? (
          /* Empty Shortlist State */
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/20 p-12 bg-white space-y-6 max-w-xl mx-auto shadow-[8px_8px_0px_0px_#F4BF4B]">
            <Bookmark size={48} className="mx-auto text-slate-300" />
            <div className="space-y-2">
              <h2 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                YOUR SHORTLIST IS EMPTY
              </h2>
              <p className="font-serif italic text-sm text-slate-600 max-w-sm mx-auto">
                Save journeys you're considering and compare them side-by-side when you're ready.
              </p>
            </div>
            <Link
              to="/explore?type=journeys"
              className="inline-flex items-center gap-3 bg-[#121212] text-[#F4BF4B] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#121212]"
            >
              EXPLORE JOURNEYS <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* Active Shortlist Grid & Actions */
          <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border-2 border-[#121212] shadow-xs">
              <div className="flex items-center gap-3">
                <span className="font-black text-xs uppercase text-slate-900">
                  {activeShortlistedPackages.length} of 5 Journeys Saved
                </span>
                {selectedForCompare.length > 0 && (
                  <span className="text-xs font-bold text-[#9E1B1D]">
                    ({selectedForCompare.length} selected for comparison)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(true)}
                  className="px-4 py-2 text-xs font-bold uppercase text-slate-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Clear Shortlist
                </button>

                <Link
                  to="/explore?type=journeys"
                  className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs uppercase rounded hover:bg-slate-200 transition-colors"
                >
                  Explore More
                </Link>

                <button
                  type="button"
                  disabled={!isCompareReady}
                  onClick={handleCompareClick}
                  className="px-6 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <ArrowUpDown size={14} />
                  COMPARE JOURNEYS ({selectedForCompare.length >= 2 ? selectedForCompare.length : Math.min(3, activeShortlistedPackages.length)})
                </button>
              </div>
            </div>

            {/* Journeys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {activeShortlistedPackages.map((pkg) => {
                const isSelected = selectedForCompare.includes(pkg.id);
                const cover =
                  pkg.media?.thumbnail ||
                  (pkg.media?.gallery && pkg.media.gallery[0]) ||
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';

                const destination = (pkg.destinations && pkg.destinations[0]) || (pkg as any).destination || 'Expedition';
                const isPricingEnabled = Boolean(pkg.pricing?.showPricing || (pkg as any).showPricing);
                const price = isPricingEnabled ? pkg.pricing?.basePrice : undefined;
                const currency = pkg.pricing?.currency || 'INR';

                return (
                  <div
                    key={pkg.id}
                    className={`border-4 bg-white flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#9E1B1D] shadow-[8px_8px_0px_0px_#9E1B1D]'
                        : 'border-[#121212] shadow-[6px_6px_0px_0px_#121212]'
                    }`}
                  >
                    {/* Card Header Image */}
                    <div className="relative aspect-[16/10] overflow-hidden border-b-4 border-[#121212] bg-[#121212]">
                      <img
                        src={cover}
                        alt={pkg.title}
                        className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-500"
                      />

                      {/* Select for Compare Checkbox Overlay */}
                      <button
                        type="button"
                        onClick={() => handleToggleCompare(pkg.id)}
                        className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md border-2 border-[#121212] cursor-pointer ${
                          isSelected
                            ? 'bg-[#9E1B1D] text-white'
                            : 'bg-white text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="size-3.5 accent-[#9E1B1D] cursor-pointer pointer-events-none"
                        />
                        <span>{isSelected ? 'SELECTED' : 'SELECT TO COMPARE'}</span>
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => setItemToRemove({ id: pkg.id, title: pkg.title })}
                        aria-label={`Remove ${pkg.title} from shortlist`}
                        className="absolute top-3 right-3 size-8 bg-white/90 text-slate-800 hover:bg-rose-600 hover:text-white border-2 border-[#121212] flex items-center justify-center transition-colors shadow-md cursor-pointer"
                        title="Remove from shortlist"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Duration & Departure Tags */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                        {pkg.duration && (
                          <div className="bg-[#121212] text-[#F4BF4B] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {pkg.duration}
                          </div>
                        )}
                        {(() => {
                          const today = new Date().toISOString().split('T')[0];
                          const nextDep = pkg.availability?.departures
                            ?.filter((d) => d.date >= today && d.status !== 'CLOSED')
                            ?.sort((a, b) => a.date.localeCompare(b.date))?.[0];
                          if (nextDep) {
                            const formatted = new Date(nextDep.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            });
                            return (
                              <div className="bg-[#121212]/90 backdrop-blur-sm text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={10} className="text-[#F4BF4B]" /> Next: {formatted}
                              </div>
                            );
                          }
                          if (pkg.availability?.mode === 'PRIVATE_FLEXIBLE') {
                            return (
                              <div className="bg-[#121212]/90 backdrop-blur-sm text-[#F4BF4B] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Calendar size={10} /> Flexible Dates
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#9E1B1D]">
                          <MapPin size={11} /> {destination}
                          {pkg.travelStyle && <span>&bull; {pkg.travelStyle}</span>}
                        </div>

                        <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                          {pkg.title}
                        </h3>

                        <p className="font-serif italic text-xs text-slate-700 line-clamp-2 leading-relaxed">
                          "{pkg.editorialIntro || pkg.overview || pkg.description || 'A bespoke handcrafted journey.'}"
                        </p>
                      </div>

                      {/* Footer Info & Explore Link */}
                      <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block">
                            STARTING FROM
                          </span>
                          <span className="font-brand font-black text-base text-[#121212]">
                            {price ? `${currency === 'INR' ? '₹' : currency}${price.toLocaleString()}` : 'On Request'}
                          </span>
                        </div>

                        <Link
                          to={`/itinerary/${pkg.slug || pkg.id}`}
                          className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          EXPLORE <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── 3. REMOVAL CONFIRMATION MODAL ── */}
      {itemToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border-4 border-[#121212] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-brand font-black text-lg uppercase text-slate-900 flex items-center gap-2">
                <Trash2 size={18} className="text-[#9E1B1D]" /> REMOVE FROM SHORTLIST?
              </h3>
              <button
                onClick={() => setItemToRemove(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove <strong className="text-slate-900">"{itemToRemove.title}"</strong> from your saved shortlist?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs uppercase rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                KEEP JOURNEY
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromShortlist(itemToRemove.id);
                  setItemToRemove(null);
                }}
                className="px-5 py-2 bg-[#9E1B1D] text-white font-bold text-xs uppercase rounded-lg hover:bg-rose-900 cursor-pointer"
              >
                REMOVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. CLEAR ALL CONFIRMATION MODAL ── */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border-4 border-[#121212] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-brand font-black text-lg uppercase text-slate-900 flex items-center gap-2">
                <Trash2 size={18} className="text-[#9E1B1D]" /> CLEAR ENTIRE SHORTLIST?
              </h3>
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This will remove all {activeShortlistedPackages.length} saved journeys from your browser. Are you sure?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs uppercase rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                KEEP SHORTLIST
              </button>
              <button
                type="button"
                onClick={() => {
                  clearShortlist();
                  setConfirmClearOpen(false);
                }}
                className="px-5 py-2 bg-[#9E1B1D] text-white font-bold text-xs uppercase rounded-lg hover:bg-rose-900 cursor-pointer"
              >
                CLEAR SHORTLIST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
