import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Save, Eye, X, Check, ArrowRight, RefreshCw, Compass } from 'lucide-react';
import { updateDocument, db } from '../../services/firebaseService';
import { doc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { Package } from '../../types/database';
import { normalizeItinerary } from '../../utils/itineraryNormalizer';

// Section components (strict order per spec)
import { HeroSection } from '../../components/itinerary/sections/HeroSection';
import { QuickInfoBar } from '../../components/itinerary/sections/QuickInfoBar';
import { AboutTrip } from '../../components/itinerary/sections/AboutTrip';
import { HighlightsSection } from '../../components/itinerary/sections/HighlightsSection';
import { GallerySection } from '../../components/itinerary/sections/GallerySection';
import { ItineraryCities } from '../../components/itinerary/sections/ItineraryCities';
import { InclusionsExclusions } from '../../components/itinerary/sections/InclusionsExclusions';
import { DownloadCTA } from '../../components/itinerary/sections/DownloadCTA';
import { PricingDates } from '../../components/itinerary/sections/PricingDates';
import { ReviewsSection } from '../../components/itinerary/sections/ReviewsSection';
import { FAQSection } from '../../components/itinerary/sections/FAQSection';
import { RelatedTrips } from '../../components/itinerary/sections/RelatedTrips';
import { JoiningPointsDisplay } from '../../components/itinerary/JoiningPointsDisplay';
import { HotelGallery } from '../../components/itinerary/HotelGallery';
import { StickyPriceCard } from '../../components/itinerary/StickyPriceCard';

// ─────────────────────────────────────────────────────────────────────────────

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [rawPkg, setRawPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Hotel Gallery / Lightbox state
  const [hotelGalleryState, setHotelGalleryState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    hotelName?: string;
    location?: string;
  }>({ isOpen: false, images: [], initialIndex: 0 });

  const handleOpenHotelGallery = (images: string[], initialIndex = 0, hotelName?: string, location?: string) => {
    setHotelGalleryState({
      isOpen: true,
      images,
      initialIndex,
      hotelName,
      location,
    });
  };

  // ─── Load package from Firestore with real-time listener ────────────────
  useEffect(() => {
    if (!id) return;

    let unsubscribe: any = null;

    const setupListener = async () => {
      setLoading(true);
      setError(false);
      setNotFound(false);

      try {
        // Try finding by Document ID first
        const docRef = doc(db, 'packages', id);
        
        // Set up real-time listener
        unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            setRawPkg({ id: snapshot.id, ...snapshot.data() } as Package);
            setLoading(false);
          } else {
            // If not found by ID, try by slug
            const q = query(collection(db, 'packages'), where('slug', '==', id));
            const unsubscribeQuery = onSnapshot(q, (querySnap) => {
              if (!querySnap.empty) {
                const docData = querySnap.docs[0];
                setRawPkg({ id: docData.id, ...docData.data() } as Package);
              } else {
                setNotFound(true);
              }
              setLoading(false);
            }, (err) => {
              console.error("Error listening to slug query:", err);
              setError(true);
              setLoading(false);
            });

            return () => unsubscribeQuery();
          }
        }, (err) => {
          console.error("Error listening to package:", err);
          setError(true);
          setLoading(false);
        });
      } catch (err: any) {
        console.error("Error setting up listener:", err);
        setError(true);
        setLoading(false);
      }
    };

    setupListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  // Normalize package data
  const pkg = rawPkg ? normalizeItinerary(rawPkg) : null;

  // ─── Update document title dynamically ────────────────────────────────────
  useEffect(() => {
    if (pkg?.title) {
      document.title = `${pkg.title} | No Fixed Address`;
    } else {
      document.title = 'Itinerary Detail | No Fixed Address';
    }
  }, [pkg?.title]);

  // ─── Admin save ───────────────────────────────────────────────────────────
  const handleGlobalSave = async () => {
    if (!pkg) return;
    setSaveStatus('saving');
    try {
      await updateDocument('packages', pkg.id, {
        ...pkg,
        updatedAt: new Date() as any,
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      alert('Failed to save changes.');
      setSaveStatus('idle');
    }
  };

  // ─── Loading State (Human-friendly Skeleton) ──────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="size-16 bg-[#121212] text-[#F4BF4B] flex items-center justify-center mx-auto rounded-full border-4 border-[#F4BF4B] animate-pulse">
            <Compass size={32} className="animate-spin" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-1.5 bg-[#F4BF4B] mx-auto rounded-full animate-pulse" />
            <h2 className="font-brand font-black text-2xl uppercase tracking-widest text-[#121212]">Loading...</h2>
            <p className="font-sans font-bold text-xs uppercase tracking-wider text-gray-400">Loading journey...</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State (No Raw Technical Errors Exposed) ───────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="max-w-md bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#9E1B1D]">
          <div className="size-12 bg-[#9E1B1D]/10 text-[#9E1B1D] rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={24} />
          </div>
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] mb-2">
            We couldn't load this journey.
          </h2>
          <p className="font-sans text-xs uppercase tracking-wider font-bold text-gray-500 mb-6">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#121212] text-[#F4BF4B] px-8 py-3.5 font-black uppercase text-xs tracking-widest hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors border-2 border-[#121212] flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ─── Not Found State ──────────────────────────────────────────────────────
  if (notFound || !pkg) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="max-w-md bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#F4BF4B]">
          <h2 className="font-brand font-black text-3xl uppercase tracking-tight text-[#9E1B1D] mb-3">
            Itinerary Not Found
          </h2>
          <p className="font-sans text-xs uppercase tracking-wider font-bold text-gray-600 mb-8">
            Sorry, we couldn't find the itinerary you're looking for.
          </p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-[#121212] text-white px-8 py-4 font-black uppercase text-xs tracking-widest hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors border-2 border-[#121212]"
          >
            View All Itineraries <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ─── Page render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FCFBF7] nfa-texture selection:bg-nfa-gold">

      {/* ── ADMIN LIVE EDITOR TOOLBAR ── */}
      {isEditing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#121212] border-2 border-[#F4BF4B] p-4 flex items-center gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] animate-in slide-in-from-top-10 duration-500">
          <div className="flex items-center gap-4 border-r border-white/20 pr-8">
            <div className="w-3 h-3 bg-[#F4BF4B] animate-pulse rounded-full" />
            <span className="text-white font-black text-[10px] uppercase tracking-widest">Live Editor Active</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGlobalSave}
              disabled={saveStatus === 'saving'}
              className="bg-[#F4BF4B] text-[#121212] px-6 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
            >
              {saveStatus === 'saving'
                ? 'Processing…'
                : saveStatus === 'success'
                  ? <><Check size={14} /> Saved</>
                  : <><Save size={14} /> Commit Changes</>
              }
            </button>
            <Link
              to={`/itinerary/${pkg.slug}`}
              className="bg-white/10 text-white px-6 py-2 border border-white/20 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Eye size={14} /> Preview
            </Link>
            <Link to="/admin" className="text-white/40 hover:text-white transition-colors" title="Exit to Admin">
              <X size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. HERO ── */}
      <HeroSection pkg={pkg} />

      {/* ── 2. QUICK INFO BAR ── */}
      <QuickInfoBar pkg={pkg} />

      {/* ── 3. CORE ITINERARY JOURNEY WITH STICKY PRICE CARD ── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
          
          {/* Main Editorial & Itinerary Column (lg:col-span-8) */}
          <div className="lg:col-span-8 min-w-0 space-y-12">
            <AboutTrip pkg={pkg} />

            {/* Highlights Section */}
            <HighlightsSection pkg={pkg} />

            {/* Gallery Section */}
            <GallerySection pkg={pkg} />

            {/* Itinerary Timeline */}
            <ItineraryCities pkg={pkg} onOpenGallery={handleOpenHotelGallery} />

            {/* Joining Points */}
            <JoiningPointsDisplay packageId={pkg.id} packageTitle={pkg.title} isEditing={isEditing} />

            {/* Inclusions & Exclusions */}
            <InclusionsExclusions pkg={pkg} />
          </div>

          {/* Right Column: Sticky Price Card (lg:col-span-4) */}
          <div className="hidden lg:block lg:col-span-4 h-full">
            <StickyPriceCard pkg={pkg} />
          </div>

        </div>
      </div>

      {/* ── 8. DOWNLOAD CTA ── */}
      <DownloadCTA pkg={pkg} />

      {/* ── 9. DATES & PRICING ── */}
      <PricingDates pkg={pkg} />

      {/* ── 10. REVIEWS ── */}
      <ReviewsSection pkg={pkg} />

      {/* ── 11. FAQs ── */}
      <FAQSection pkg={pkg} />

      {/* ── 12. RELATED TRIPS ── */}
      <RelatedTrips pkg={pkg} />

      {/* ── HOTEL GALLERY LIGHTBOX MODAL (B5) ── */}
      <HotelGallery
        isOpen={hotelGalleryState.isOpen}
        images={hotelGalleryState.images}
        initialIndex={hotelGalleryState.initialIndex}
        hotelName={hotelGalleryState.hotelName}
        location={hotelGalleryState.location}
        onClose={() => setHotelGalleryState(prev => ({ ...prev, isOpen: false }))}
      />

      {/* ── MOBILE & TABLET RESPONSIVE STICKY CARD (B6) ── */}
      {!isEditing && (
        <StickyPriceCard pkg={pkg} />
      )}

      {/* Bottom padding for mobile sticky bar safe area */}
      <div className="md:hidden h-20" />
    </div>
  );
};

export default ItineraryDetail;