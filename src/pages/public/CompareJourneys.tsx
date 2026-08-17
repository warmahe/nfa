import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Package } from '../../types/database';
import { useJourneyShortlist } from '../../hooks/useJourneyShortlist';
import { useEnquiry } from '../../context/EnquiryContext';
import { SeoHead } from '../../components/shared/SeoHead';
import {
  ArrowUpDown,
  ArrowLeft,
  X,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  BedDouble,
  Sun,
  ShieldCheck,
  Star,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

export const CompareJourneys: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openEnquiryModal } = useEnquiry();
  const { removeFromShortlist } = useJourneyShortlist();

  // Get package IDs from URL
  const rawIds = (searchParams.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Maximum 3 journeys compared at once
  const comparedIds = useMemo(() => Array.from(new Set(rawIds)).slice(0, 3), [rawIds]);

  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<number>(0);

  // Realtime subscription to packages
  useEffect(() => {
    setLoading(true);

    const unsubPkgs = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package));
        setAllPackages(list.filter((p) => p.status !== 'draft' && (p as any).active !== false));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching packages in Compare:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubPkgs();
    };
  }, []);

  // Resolve compared packages against canonical data
  const comparedPackages = useMemo(() => {
    return comparedIds
      .map((id) => allPackages.find((p) => p.id === id || p.slug === id))
      .filter((p): p is Package => Boolean(p));
  }, [comparedIds, allPackages]);

  // Remove a journey from comparison
  const handleRemoveFromCompare = (idToRemove: string) => {
    const nextIds = comparedIds.filter((id) => {
      const pkg = allPackages.find((p) => p.id === id || p.slug === id);
      return id !== idToRemove && pkg?.id !== idToRemove && pkg?.slug !== idToRemove;
    });

    if (nextIds.length > 0) {
      setSearchParams({ ids: nextIds.join(',') }, { replace: true });
    } else {
      navigate('/shortlist');
    }
  };

  // Check if a row has distinct values across compared packages
  const hasDifference = (extractor: (pkg: Package) => any): boolean => {
    if (comparedPackages.length < 2) return false;
    const firstVal = JSON.stringify(extractor(comparedPackages[0]));
    return comparedPackages.slice(1).some((p) => JSON.stringify(extractor(p)) !== firstVal);
  };

  // Enquiry for a single journey
  const handleEnquireJourney = (pkg: Package) => {
    openEnquiryModal({
      source: 'JOURNEY_COMPARISON',
      entryPoint: 'COMPARISON_CTA',
      itineraryId: pkg.id,
      itinerarySlug: pkg.slug,
      itineraryTitle: pkg.title,
      destination: (pkg.destinations && pkg.destinations[0]) || pkg.destination,
      duration: pkg.duration,
      price: pkg.pricing?.basePrice,
      currency: pkg.pricing?.currency || 'INR',
    });
  };

  // Multi-Journey Enquiry option
  const handleMultiJourneyEnquiry = () => {
    const titles = comparedPackages.map((p) => p.title).join(', ');
    const primary = comparedPackages[0];

    openEnquiryModal({
      source: 'JOURNEY_COMPARISON',
      entryPoint: 'MULTI_JOURNEY_COMPARISON_CTA',
      itineraryId: primary?.id,
      itinerarySlug: primary?.slug,
      itineraryTitle: `Considering Multiple Expeditions: ${titles}`,
      destination: comparedPackages.map((p) => p.destinations?.[0] || p.destination).filter(Boolean).join(', '),
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-slate-900 font-sans selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Dynamic SEO Meta (noindex, nofollow for comparison state) */}
      <SeoHead
        metadata={{
          title: 'Compare Journeys | NO FIXED ADDRESS',
          description: 'Compare bespoke travel journeys and explore the details before planning your journey.',
          type: 'website',
          robots: 'noindex, nofollow',
          canonicalUrl: 'https://nofixedaddress.cc/compare',
        }}
      />

      {/* ── 1. HEADER ── */}
      <section className="bg-[#121212] text-white border-b-4 border-[#9E1B1D] pt-28 pb-16 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-[0.3em]">
                <ArrowUpDown size={14} /> EXPEDITION COMPARISON
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
              <Link
                to="/shortlist"
                className="text-slate-300 hover:text-[#F4BF4B] flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back to Shortlist
              </Link>
              <Link
                to="/explore?type=journeys"
                className="text-slate-300 hover:text-[#F4BF4B] flex items-center gap-1.5"
              >
                Explore More <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <h1 className="font-brand font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter leading-[0.88] text-[#FCFBF7]">
            COMPARE YOUR <br />
            <span className="text-[#F4BF4B]">JOURNEYS.</span>
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            See the key differences at a glance before choosing the journey you'd like to explore further.
          </p>
        </div>
      </section>

      {/* ── 2. COMPARISON BODY ── */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-16 py-12 md:py-16">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <ArrowUpDown size={36} className="mx-auto text-[#9E1B1D] animate-bounce" />
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
              Preparing journey comparison...
            </p>
          </div>
        ) : comparedPackages.length < 2 ? (
          /* Need at least 2 journeys */
          <div className="py-24 text-center border-4 border-dashed border-[#121212]/20 p-12 bg-white space-y-6 max-w-xl mx-auto shadow-[8px_8px_0px_0px_#F4BF4B]">
            <ArrowUpDown size={48} className="mx-auto text-slate-300" />
            <div className="space-y-2">
              <h2 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                SELECT AT LEAST TWO JOURNEYS
              </h2>
              <p className="font-serif italic text-sm text-slate-600 max-w-sm mx-auto">
                {rawIds.length > 0
                  ? "One or more of the journeys you're comparing is no longer available."
                  : 'Add journeys to your shortlist to compare their routes, styles, and highlights side-by-side.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shortlist"
                className="px-6 py-3 bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-wider hover:bg-slate-200"
              >
                View Shortlist
              </Link>
              <Link
                to="/explore?type=journeys"
                className="px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider hover:bg-[#9E1B1D] hover:text-white"
              >
                Explore Journeys
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Notice if user selected more than 3 */}
            {rawIds.length > 3 && (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>Displaying the first 3 selected journeys (maximum comparison limit).</span>
                <Link to="/shortlist" className="underline hover:text-[#9E1B1D]">
                  Manage Shortlist
                </Link>
              </div>
            )}

            {/* ── MOBILE JOURNEY SELECTOR TABS ── */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {comparedPackages.map((pkg, idx) => (
                <button
                  key={pkg.id}
                  onClick={() => setMobileActiveTab(idx)}
                  className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-lg border-2 whitespace-nowrap cursor-pointer ${
                    mobileActiveTab === idx
                      ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {pkg.title}
                </button>
              ))}
            </div>

            {/* ── DESKTOP & TABLET COMPARISON TABLE ── */}
            <div className="bg-white border-4 border-[#121212] shadow-[10px_10px_0px_0px_#121212] overflow-hidden">
              
              {/* 1. STICKY JOURNEY HEADERS / HERO CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-4 border-b-4 border-[#121212] bg-[#FCFBF7]">
                <div className="hidden lg:flex p-6 flex-col justify-end bg-slate-100 border-r-4 border-[#121212]">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-1">
                    SIDE-BY-SIDE
                  </span>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    Expedition Overview
                  </h3>
                </div>

                {comparedPackages.map((pkg, idx) => {
                  // Mobile view: only show active tab column
                  const isMobileVisible = mobileActiveTab === idx;
                  const cover =
                    pkg.media?.thumbnail ||
                    (pkg.media?.gallery && pkg.media.gallery[0]) ||
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';

                  const price = pkg.pricing?.basePrice;
                  const currency = pkg.pricing?.currency || 'INR';

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 flex flex-col justify-between space-y-4 ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${!isMobileVisible ? 'hidden lg:flex' : 'flex'}`}
                    >
                      <div className="space-y-3">
                        {/* Remove Action */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D]">
                            JOURNEY {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCompare(pkg.id)}
                            className="size-7 bg-slate-100 hover:bg-rose-100 hover:text-rose-900 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Image Thumbnail */}
                        <div className="aspect-[16/9] border-2 border-[#121212] overflow-hidden bg-[#121212]">
                          <img
                            src={cover}
                            alt={pkg.title}
                            className="w-full h-full object-cover grayscale-[10%]"
                          />
                        </div>

                        {/* Title & Destination */}
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#9E1B1D] block">
                            {pkg.destinations?.[0] || pkg.destination || 'Expedition'}
                          </span>
                          <h4 className="font-brand font-black text-xl sm:text-2xl uppercase tracking-tight text-[#121212] mt-0.5">
                            {pkg.title}
                          </h4>
                        </div>
                      </div>

                      {/* Primary Column CTA */}
                      <div className="pt-3 border-t-2 border-slate-100 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleEnquireJourney(pkg)}
                          className="w-full py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          ENQUIRE NOW <ArrowRight size={14} />
                        </button>
                        <Link
                          to={`/itinerary/${pkg.slug || pkg.id}`}
                          className="text-center text-[10px] font-black uppercase tracking-wider text-slate-600 hover:text-[#9E1B1D] py-1"
                        >
                          View Full Itinerary →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── 2. SECTION: JOURNEY BASICS ── */}
              <div className="border-b-4 border-[#121212]">
                <div className="bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                  <Compass size={14} /> 1. JOURNEY BASICS
                </div>

                {/* Duration Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200 ${
                    hasDifference((p) => p.duration || p.durationDays) ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Duration
                  </div>
                  {comparedPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`p-4 font-bold text-xs text-slate-900 ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                    >
                      {pkg.duration || (pkg.durationDays ? `${pkg.durationDays} Days` : '—')}
                    </div>
                  ))}
                </div>

                {/* Travel Style Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200 ${
                    hasDifference((p) => p.travelStyle || p.style) ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Travel Style
                  </div>
                  {comparedPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`p-4 font-bold text-xs text-slate-900 ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                    >
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded font-black text-[10px] uppercase">
                        {pkg.travelStyle || pkg.style || 'Custom Bespoke'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Difficulty Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200 ${
                    hasDifference((p) => p.difficulty) ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Physical Level
                  </div>
                  {comparedPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`p-4 font-bold text-xs text-slate-900 ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                    >
                      {pkg.difficulty || 'Easy / Moderate'}
                    </div>
                  ))}
                </div>

                {/* Group Size Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200 ${
                    hasDifference((p) => p.maxTravelers || p.groupSize) ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Party Size
                  </div>
                  {comparedPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`p-4 font-bold text-xs text-slate-900 ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                    >
                      {pkg.maxTravelers ? `Max ${pkg.maxTravelers} Travellers` : 'Private / Tailored Party'}
                    </div>
                  ))}
                </div>

                {/* Travel Format Row (E50) */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200 ${
                    hasDifference((p) => p.availability?.mode || 'PRIVATE_FLEXIBLE') ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Travel Format
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const mode = pkg.availability?.mode || 'PRIVATE_FLEXIBLE';
                    const modeLabel =
                      mode === 'FIXED_DEPARTURES'
                        ? 'Fixed Departures'
                        : mode === 'BOTH'
                        ? 'Fixed + Flexible'
                        : 'Private Flexible';
                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 font-bold text-xs text-slate-900 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        {modeLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Next Upcoming Departure Row (E50) */}
                <div className="grid grid-cols-1 lg:grid-cols-4">
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Next Departure
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const today = new Date().toISOString().split('T')[0];
                    const nextDep = pkg.availability?.departures
                      ?.filter((d) => d.date >= today && d.status !== 'CLOSED')
                      ?.sort((a, b) => a.date.localeCompare(b.date))?.[0];

                    const nextDepText = nextDep
                      ? new Date(nextDep.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : pkg.availability?.mode === 'PRIVATE_FLEXIBLE'
                      ? 'Flexible Dates'
                      : 'On Request';

                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 font-bold text-xs text-slate-900 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        {nextDepText}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 3. SECTION: ROUTE & STOPS ── */}
              <div className="border-b-4 border-[#121212]">
                <div className="bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                  <MapPin size={14} /> 2. ROUTE & DESTINATIONS
                </div>

                {/* Cities / Stops Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 border-b border-slate-200">
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Route Stops
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const cities =
                      Array.isArray(pkg.itineraryCities) && pkg.itineraryCities.length > 0
                        ? pkg.itineraryCities.map((c) => c.city).filter(Boolean)
                        : pkg.destinations || [];

                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 font-medium text-xs text-slate-800 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        {cities.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {cities.map((city, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold"
                              >
                                {city}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>{pkg.destination || 'Expedition Route'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Route Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-4">
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Route Narrative
                  </div>
                  {comparedPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className={`p-4 font-serif italic text-xs text-slate-700 leading-relaxed ${
                        idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                      } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                    >
                      "{pkg.overview || pkg.editorialIntro || pkg.description || 'Bespoke custom-crafted itinerary.'}"
                    </div>
                  ))}
                </div>
              </div>

              {/* ── 4. SECTION: ACCOMMODATION & STAYS ── */}
              <div className="border-b-4 border-[#121212]">
                <div className="bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                  <BedDouble size={14} /> 3. ACCOMMODATION & STAYS
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4">
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Stays Style
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const hotels = pkg.hotels || pkg.accommodations || [];
                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 font-medium text-xs text-slate-800 space-y-2 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        <p className="font-bold text-slate-900">
                          {pkg.accommodationStyle || 'Handpicked Luxury Lodges & Boutique Stays'}
                        </p>
                        {Array.isArray(hotels) && hotels.length > 0 && (
                          <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                            {hotels.slice(0, 3).map((h: any, hIdx: number) => (
                              <li key={hIdx} className="truncate">
                                {typeof h === 'string' ? h : h.name || h.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 5. SECTION: EXPERIENCES & HIGHLIGHTS ── */}
              <div className="border-b-4 border-[#121212]">
                <div className="bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                  <Sparkles size={14} /> 4. EXPERIENCES & HIGHLIGHTS
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4">
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Key Activities
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const highlights =
                      pkg.editorialHighlights ||
                      (Array.isArray(pkg.highlights)
                        ? pkg.highlights.map((h) => h.text).filter(Boolean)
                        : []);

                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 font-medium text-xs text-slate-800 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        {highlights.length > 0 ? (
                          <ul className="space-y-1.5">
                            {highlights.slice(0, 4).map((hl, hlIdx) => (
                              <li key={hlIdx} className="flex items-start gap-1.5">
                                <Sparkles size={11} className="text-[#F4BF4B] shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{hl}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-500">Curated private excursions & masterclasses</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 6. SECTION: PRICING & VALUE ── */}
              <div className="border-b-4 border-[#121212]">
                <div className="bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-2">
                  <ShieldCheck size={14} /> 5. INVESTMENT & TRANSPARENCY
                </div>

                <div
                  className={`grid grid-cols-1 lg:grid-cols-4 ${
                    hasDifference((p) => p.pricing?.basePrice) ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="p-4 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-600 border-r-0 lg:border-r-4 border-[#121212] flex items-center">
                    Starting From
                  </div>
                  {comparedPackages.map((pkg, idx) => {
                    const price = pkg.pricing?.basePrice;
                    const currency = pkg.pricing?.currency || 'INR';

                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 space-y-1 ${
                          idx < comparedPackages.length - 1 ? 'lg:border-r-4 border-[#121212]' : ''
                        } ${mobileActiveTab !== idx ? 'hidden lg:block' : 'block'}`}
                      >
                        <span className="font-brand font-black text-2xl text-[#121212] block">
                          {price
                            ? `${currency === 'INR' ? '₹' : currency}${price.toLocaleString()}`
                            : 'Price on Request'}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium italic">
                          * Indicative per-person bespoke tier. Includes private guides, luxury stays & transfers.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 8. MULTI-JOURNEY ENQUIRY CALLOUT ── */}
            <section className="bg-[#121212] text-white p-8 md:p-12 border-4 border-[#121212] rounded-2xl shadow-[10px_10px_0px_0px_#F4BF4B] space-y-6 text-center">
              <Compass size={40} className="mx-auto text-[#F4BF4B]" />
              <div className="space-y-2 max-w-xl mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F4BF4B]">
                  BESPOKE DECISION SUPPORT
                </span>
                <h3 className="font-brand font-black text-3xl md:text-4xl uppercase text-white tracking-tight">
                  UNDECIDED BETWEEN THESE EXPEDITIONS?
                </h3>
                <p className="font-serif italic text-base text-slate-300">
                  Talk with our journey architects. We can combine routes, extend stays, or design a hybrid itinerary completely around you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleMultiJourneyEnquiry}
                className="inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#FCFBF7] cursor-pointer"
              >
                TALK TO US ABOUT THESE JOURNEYS <ArrowRight size={16} />
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
