import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Save, Eye, X, Check, ArrowRight } from 'lucide-react';
import { updateDocument } from '../../services/firebaseService';
import { Package } from '../../types/database';
import { PACKAGES } from '../../utils/constants';

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

// ─────────────────────────────────────────────────────────────────────────────

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [travelers, setTravelers] = useState(1);

  // ─── Load package (static-first, no Firestore dependency) ────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const staticPkg = PACKAGES.find(p => p.id === id || p.slug === id);
      if (staticPkg) {
        setPkg(staticPkg as unknown as Package);
      } else {
        setError('Package not found. Check the URL and try again.');
      }
    } catch (err) {
      setError('Failed to load package data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  // ─── States ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-1 bg-[#F4BF4B] mx-auto animate-pulse" />
          <span className="font-black text-xl uppercase tracking-widest text-[#121212]">Loading Journey…</span>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center gap-6 px-6">
        <div className="font-black text-2xl uppercase tracking-widest text-[#9E1B1D] text-center">
          {error || 'Package not found'}
        </div>
        <Link
          to="/destinations"
          className="bg-[#121212] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors"
        >
          Return to Destinations
        </Link>
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

      {/* ── 3. ABOUT TRIP ── */}
      <AboutTrip pkg={pkg} />

      {/* ── 4. HIGHLIGHTS ── */}
      <HighlightsSection pkg={pkg} />

      {/* ── 5. GALLERY ── */}
      <GallerySection pkg={pkg} />

      {/* ── 6. ITINERARY (critical) ── */}
      <ItineraryCities pkg={pkg} />

      {/* Joining Points (existing subcollection display) */}
      <div className="px-6 md:px-16 max-w-[1440px] mx-auto pb-12">
        <JoiningPointsDisplay packageId={pkg.id} packageTitle={pkg.title} isEditing={isEditing} />
      </div>

      {/* ── 7. INCLUSIONS / EXCLUSIONS ── */}
      <InclusionsExclusions pkg={pkg} />

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

      {/* ── MOBILE STICKY CTA ── */}
      {!isEditing && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212] border-t-4 border-[#F4BF4B] p-5 z-[100] flex justify-between items-center shadow-2xl">
          <div>
            <span className="text-[8px] font-black text-white/40 block tracking-widest uppercase">Investment</span>
            <span className="text-2xl font-black text-[#F4BF4B]">
              {(pkg.pricing?.basePrice || 0).toLocaleString()} {pkg.pricing?.currency || 'INR'}
            </span>
          </div>
          <Link
            to={`/booking/${pkg.id}`}
            className="bg-[#F4BF4B] text-[#121212] px-8 py-3 font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-transform"
          >
            Book Now <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Bottom padding for mobile sticky CTA */}
      <div className="lg:hidden h-24" />
    </div>
  );
};

export default ItineraryDetail;