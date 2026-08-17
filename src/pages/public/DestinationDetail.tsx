import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Destination, CustomerStory, Package } from '../../types/database';
import { useDestinations } from '../../hooks/useDestinations';
import { PackageJourneyCard } from '../../components/packages/PackageJourneyCard';
import { RelatedDestinations } from '../../components/discovery/RelatedDestinations';
import { RelatedStories } from '../../components/discovery/RelatedStories';
import { useEnquiry } from '../../context/EnquiryContext';
import { MapPin, Compass, Sparkles, Sun, ArrowRight, Loader2, BedDouble, CloudRain, Thermometer, Globe, Clock, Coins, ShieldAlert, ShieldCheck, BookOpen } from 'lucide-react';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveDestinationSEO, resolveStaticPageSEO } from '../../utils/seo';

export const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openEnquiry } = useEnquiry();
  
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loadingDest, setLoadingDest] = useState(true);
  
  // Realtime package dataset for related journeys matching this destination
  const { filtered: packages } = useDestinations();

  useEffect(() => {
    if (!slug) return;
    
    const unsub = onSnapshot(
      collection(db, 'destinations'),
      (snapshot) => {
        const found = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as Destination))
          .find(d => d.slug === slug || d.id === slug);
        
        if (found && found.active === false && !window.location.search.includes('preview=true')) {
          setDestination(null);
        } else {
          setDestination(found || null);
        }
        setLoadingDest(false);
      },
      (err) => {
        console.error('Error fetching destination detail:', err);
        setLoadingDest(false);
      }
    );

    return () => unsub();
  }, [slug]);

  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [allStories, setAllStories] = useState<CustomerStory[]>([]);

  useEffect(() => {
    const unsubAllDests = onSnapshot(collection(db, 'destinations'), (snap) => {
      setAllDestinations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination)));
    });
    const unsubAllStories = onSnapshot(collection(db, 'customerStories'), (snap) => {
      setAllStories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerStory)));
    });
    return () => {
      unsubAllDests();
      unsubAllStories();
    };
  }, []);

  // Match packages that include this destination in destinations[] or itineraryCities[]
  const relatedPackages = useMemo(() => {
    if (!destination) return [];
    const nameUpper = (destination.name || '').toUpperCase();
    const countryUpper = (destination.country || '').toUpperCase();
    const slugUpper = (destination.slug || '').toUpperCase();

    return packages.filter(pkg => {
      // 1. Direct destinations array match
      const inDestinations = Array.isArray(pkg.destinations) && pkg.destinations.some(d => {
        const u = d.toUpperCase();
        return u === nameUpper || u === countryUpper || u === slugUpper;
      });

      // 2. ItineraryCities match
      const inCities = Array.isArray(pkg.itineraryCities) && pkg.itineraryCities.some(c => {
        const cityUpper = (c.city || '').toUpperCase();
        const cntryUpper = (c.country || '').toUpperCase();
        return cityUpper === nameUpper || cntryUpper === countryUpper;
      });

      return inDestinations || inCities;
    });
  }, [destination, packages]);

  if (loadingDest) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
        <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">Loading destination story...</span>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center py-32 px-6 text-center">
        <SeoHead metadata={resolveStaticPageSEO('notFound')} />
        <div className="max-w-md p-12 border-4 border-dashed border-[#121212]/20 bg-white rounded-2xl shadow-[8px_8px_0px_0px_#121212] space-y-4">
          <Compass size={40} className="mx-auto text-[#9E1B1D]" />
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
            Unable to load this destination
          </h2>
          <p className="font-sans font-medium text-xs text-slate-600">
            The destination sector you requested is currently unavailable.
          </p>
          <Link
            to="/destinations"
            className="inline-block mt-4 bg-[#121212] text-[#F4BF4B] px-8 py-3.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B]"
          >
            Explore All Destinations
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80';
  const coverImg = destination.coverImage || (destination.gallery && destination.gallery.length > 0 ? destination.gallery[0] : fallbackImage);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pb-24 text-left nfa-texture">
      {/* Dynamic SEO Meta Tags, Social Previews & Structured JSON-LD */}
      <SeoHead metadata={resolveDestinationSEO(destination)} />

      {/* ── 1. HERO BANNER ── */}
      <div className="relative w-full min-h-[60vh] md:min-h-[75vh] bg-[#121212] flex items-end justify-start overflow-hidden">
        <img
          src={coverImg}
          alt={`${destination.name} — ${destination.country}`}
          className="absolute inset-0 w-full h-full object-cover grayscale-[15%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-black/20" />

        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 py-16 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#F4BF4B] text-[#121212] border-2 border-[#121212] px-3.5 py-1 font-black text-[9px] uppercase tracking-[0.25em] flex items-center gap-1.5 shadow-md">
              <MapPin size={12} className="text-[#9E1B1D]" /> {destination.country || 'Global'}
            </span>
            {destination.continent && (
              <span className="bg-[#121212]/80 backdrop-blur-sm text-white border border-white/20 px-3 py-1 font-bold text-[9px] uppercase tracking-widest">
                {destination.continent}
              </span>
            )}
            {destination.bestTimeToVisit && (
              <span className="bg-[#9E1B1D] text-white px-3 py-1 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                <Sun size={11} /> {destination.bestTimeToVisit}
              </span>
            )}
          </div>

          <h1 className="font-brand font-black text-[clamp(3rem,8vw,7.5rem)] uppercase tracking-tighter text-white leading-[0.85] drop-shadow-md">
            {destination.name}
          </h1>

          {destination.shortDescription && (
            <p className="font-sans font-medium text-sm md:text-base text-white/90 leading-relaxed max-w-3xl italic">
              "{destination.shortDescription}"
            </p>
          )}
        </div>
      </div>

      {/* ── 2. DESTINATION STORY & NARRATIVE ── */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 space-y-16">
        
        {/* Main Narrative & Why Visit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
                Destination Story
              </span>
              <h2 className="font-brand font-black text-3xl sm:text-4xl uppercase tracking-tighter text-[#121212]">
                About {destination.name}
              </h2>
              <div className="w-16 h-1.5 bg-[#F4BF4B]" />
            </div>

            <p className="font-sans font-medium text-base text-[#121212]/85 leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>

            {/* Why Visit Section */}
            {destination.whyVisit && (
              <div className="p-8 bg-white border-4 border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B] rounded-2xl space-y-3">
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                  <Sparkles className="text-[#9E1B1D]" size={20} /> WHY VISIT {destination.name.toUpperCase()}
                </h3>
                <p className="font-sans font-medium text-sm text-slate-800 leading-relaxed italic">
                  "{destination.whyVisit}"
                </p>
              </div>
            )}
          </div>

          {/* Logistics Quick Facts Sidebar */}
          <div className="bg-white border-4 border-[#121212] p-6 rounded-2xl shadow-[6px_6px_0px_0px_#121212] space-y-5">
            <h3 className="font-brand font-black text-lg uppercase tracking-wider text-[#121212] border-b-2 border-[#121212]/10 pb-3 flex items-center gap-2">
              <Compass size={18} className="text-[#9E1B1D]" /> Essential Travel Logistics
            </h3>

            {destination.bestTimeToVisit && (
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Best Time to Visit
                </span>
                <span className="text-xs font-bold text-slate-900">{destination.bestTimeToVisit}</span>
              </div>
            )}

            {destination.bestDaysDuration && (
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Recommended Duration
                </span>
                <span className="text-xs font-bold text-slate-900">{destination.bestDaysDuration}</span>
              </div>
            )}

            {destination.timezone && (
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Timezone
                </span>
                <span className="text-xs font-bold text-slate-900">{destination.timezone}</span>
              </div>
            )}

            {destination.currency && (
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Local Currency
                </span>
                <span className="text-xs font-bold text-slate-900">{destination.currency}</span>
              </div>
            )}

            {destination.languageSpoken && destination.languageSpoken.length > 0 && (
              <div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Languages Spoken
                </span>
                <span className="text-xs font-bold text-slate-900">{destination.languageSpoken.join(', ')}</span>
              </div>
            )}

            {/* Climate summary (Rainfall & Temperature) */}
            {(destination.averageTemperature || (typeof destination.rainfall === 'number' && destination.rainfall > 0)) && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">
                  Climate & Weather
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {destination.averageTemperature && (
                    <div className="p-2.5 bg-[#FCFBF7] border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Thermometer size={14} className="text-[#9E1B1D]" />
                      <span>{destination.averageTemperature.min}°C – {destination.averageTemperature.max}°C</span>
                    </div>
                  )}
                  {typeof destination.rainfall === 'number' && destination.rainfall > 0 && (
                    <div className="p-2.5 bg-[#FCFBF7] border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CloudRain size={14} className="text-blue-600" />
                      <span>{destination.rainfall} mm/yr</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {destination.visaRequirements && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Visa & Entry Guidelines
                </span>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">{destination.visaRequirements}</p>
                <span className="text-[8px] font-medium text-slate-400 italic block mt-1">
                  * Entry requirements may vary by nationality. Our travel team will advise for your passport.
                </span>
              </div>
            )}

            <button
              onClick={() => openEnquiry({ destination: destination.name, destinationSlug: destination.slug, source: 'DESTINATION', entryPoint: 'STICKY_CARD' })}
              className="w-full bg-[#121212] text-[#F4BF4B] py-3.5 px-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-[0.25em] flex justify-center items-center gap-2 hover:bg-[#9E1B1D] hover:text-white hover:border-[#9E1B1D] transition-all shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer mt-4"
            >
              PLAN YOUR JOURNEY <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── 3. HIGHLIGHTS & LOCATIONS ── */}
        {(destination.highlights?.length || destination.locations?.length) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="p-6 bg-white border-2 border-[#121212] rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#121212]">
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#F4BF4B]" /> HIGHLIGHTS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-[#FCFBF7] border border-slate-200 rounded-lg text-xs font-bold text-slate-900">
                      <span className="size-2 rounded-full bg-[#9E1B1D]" />
                      {hl}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {destination.locations && destination.locations.length > 0 && (
              <div className="p-6 bg-white border-2 border-[#121212] rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#121212]">
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                  <MapPin size={16} className="text-[#9E1B1D]" /> EXPLORE THE DESTINATION
                </h3>
                <div className="flex flex-wrap gap-2">
                  {destination.locations.map((loc, idx) => (
                    <span key={idx} className="text-xs font-bold text-[#121212] bg-[#F4BF4B]/20 border border-[#F4BF4B] px-3.5 py-1.5 rounded-full">
                      📍 {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ── 4. EXPERIENCES & ACCOMMODATION ── */}
        {(destination.experiences?.length || destination.accommodation) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destination.experiences && destination.experiences.length > 0 && (
              <div className="p-6 bg-[#121212] text-white border-2 border-[#121212] rounded-xl space-y-4 shadow-[6px_6px_0px_0px_#F4BF4B]">
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#F4BF4B] flex items-center gap-2">
                  ✨ CURATED EXPERIENCES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.experiences.map((exp, idx) => (
                    <div key={idx} className="p-3 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-amber-100 flex items-center gap-2">
                      <span>✨</span> {exp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {destination.accommodation && (
              <div className="p-6 bg-white border-2 border-[#121212] rounded-xl space-y-4 shadow-[4px_4px_0px_0px_#121212]">
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                  <BedDouble size={18} className="text-[#F4BF4B]" /> WHERE TO STAY
                </h3>
                <p className="font-sans font-medium text-xs text-slate-800 leading-relaxed italic">
                  "{destination.accommodation}"
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* ── 5. FEATURED / RELATED JOURNEYS ── */}
        <div className="space-y-8 pt-8 border-t-4 border-[#121212]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
                Expedition Selection
              </span>
              <h2 className="font-brand font-black text-3xl uppercase tracking-tighter text-[#121212]">
                {destination.name.toUpperCase()} JOURNEYS
              </h2>
            </div>
            <Link
              to="/packages"
              className="text-xs font-bold uppercase tracking-widest text-[#9E1B1D] hover:underline flex items-center gap-1"
            >
              View All Journeys →
            </Link>
          </div>

          {relatedPackages.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-[#121212]/20 rounded-xl text-center bg-white">
              <p className="text-xs font-bold uppercase text-slate-500">
                No active journeys currently listed for {destination.name}. Contact us to design a custom expedition.
              </p>
              <button
                onClick={() => openEnquiry({ destination: destination.name, destinationSlug: destination.slug, source: 'DESTINATION', entryPoint: 'SECTION_CTA' })}
                className="mt-4 bg-[#121212] text-[#F4BF4B] px-6 py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors cursor-pointer"
              >
                PLAN CUSTOM EXPEDITION
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPackages.map(pkg => (
                <PackageJourneyCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>

        {/* ── 5.6 RELATED CUSTOMER STORIES (E48 Discovery) ── */}
        <RelatedStories
          context={{
            destination: destination.name,
            destinationSlug: destination.slug,
          }}
          allStories={allStories}
          title={`STORIES FROM ${destination.name.toUpperCase()}`}
          limit={3}
        />

        {/* ── 5.7 EXPLORE MORE DESTINATIONS (E48 Discovery) ── */}
        <RelatedDestinations
          currentDestination={destination}
          allDestinations={allDestinations}
          allJourneys={packages}
          limit={3}
        />

        {/* ── 6. DESTINATION PLANNING CTA BLOCK ── */}
        <section className="bg-[#121212] text-white p-8 md:p-12 border-4 border-[#121212] rounded-2xl shadow-[10px_10px_0px_0px_#F4BF4B] space-y-6 text-center">
          <Compass size={40} className="mx-auto text-[#F4BF4B]" />
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#F4BF4B]">
              Bespoke Journey Planning
            </span>
            <h3 className="font-brand font-black text-3xl md:text-4xl uppercase text-white tracking-tight">
              PLAN YOUR {destination.name.toUpperCase()} JOURNEY
            </h3>
            <p className="font-serif italic text-base text-slate-300">
              Ready to explore {destination.name}? Talk to our travel team to shape a private, custom expedition around you.
            </p>
          </div>

          <button
            onClick={() =>
              openEnquiry({
                destination: destination.name,
                destinationSlug: destination.slug,
                source: 'DESTINATION',
                entryPoint: 'SECTION_CTA',
              })
            }
            className="inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#FCFBF7] cursor-pointer"
          >
            PLAN YOUR JOURNEY <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
};
