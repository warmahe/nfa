import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Compass,
  MapPin,
  Clock,
  Users,
  Download,
  ShieldAlert,
  AlertCircle,
  FileText,
  Sparkles,
  Plane,
  Train,
  Bus,
  Ship,
  Car,
  Utensils,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { doc, onSnapshot, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuth, db } from '../../services/firebaseService';
import { Booking, Package, ItineraryCity, ItineraryDay, BookingDocument } from '../../types/database';
import { normalizeItinerary } from '../../utils/itineraryNormalizer';
import { HotelCard } from '../../components/itinerary/HotelCard';
import { HotelGallery } from '../../components/itinerary/HotelGallery';

const BOOKING_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  CONFIRMED: { label: 'CONFIRMED EXPEDITION', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', icon: CheckCircle2 },
  COMPLETED: { label: 'COMPLETED EXPEDITION', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', icon: CheckCircle },
  PENDING_CONFIRMATION: { label: 'PENDING CONFIRMATION', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900', icon: Clock3 },
  DRAFT: { label: 'DRAFT EXPEDITION', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', icon: Clock3 },
  CANCELLED: { label: 'EXPEDITION CANCELLED', bg: 'bg-rose-100 border-rose-300', text: 'text-rose-900', icon: XCircle },
};

export const MyJourneyView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [loadingPkg, setLoadingPkg] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Hotel Gallery State
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

  // 1. Realtime Booking Listener with Security Check
  useEffect(() => {
    if (!bookingId || authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setLoadingBooking(true);
    const bRef = doc(db, 'bookings', bookingId);
    
    const unsubBooking = onSnapshot(
      bRef,
      (snapshot) => {
        setLoadingBooking(false);
        if (!snapshot.exists()) {
          setNotFound(true);
          return;
        }

        const bData = { id: snapshot.id, ...snapshot.data() } as Booking;
        
        // Authorization check: User must own the booking
        const isOwner =
          (bData.customerId && bData.customerId === user.uid) ||
          (bData.userId && bData.userId === user.uid) ||
          (bData.primaryTraveler?.email && user.email && bData.primaryTraveler.email.toLowerCase() === user.email.toLowerCase());
        if (!isOwner) {
          setUnauthorized(true);
          return;
        }

        setUnauthorized(false);
        setNotFound(false);
        setBooking(bData);
      },
      (err) => {
        console.error('Error listening to booking:', err);
        setLoadingBooking(false);
        setNotFound(true);
      }
    );

    return () => unsubBooking();
  }, [bookingId, user, authLoading, navigate]);

  // 2. Realtime Package Listener based on booking's itineraryId/packageId
  useEffect(() => {
    if (!booking) return;

    setLoadingPkg(true);
    const pkgId = booking.itineraryId || booking.packageId;

    if (pkgId) {
      const pRef = doc(db, 'packages', pkgId);
      const unsubPkg = onSnapshot(
        pRef,
        (snapshot) => {
          setLoadingPkg(false);
          if (snapshot.exists()) {
            const raw = { id: snapshot.id, ...snapshot.data() } as Package;
            setPkg(normalizeItinerary(raw));
          } else {
            // Fallback: try finding package by slug
            if (booking.itinerarySlug) {
              const q = query(collection(db, 'packages'), where('slug', '==', booking.itinerarySlug));
              getDocs(q).then((snap) => {
                if (!snap.empty) {
                  const raw = { id: snap.docs[0].id, ...snap.docs[0].data() } as Package;
                  setPkg(normalizeItinerary(raw));
                } else {
                  setPkg(null);
                }
              }).catch(() => setPkg(null));
            } else {
              setPkg(null);
            }
          }
        },
        (err) => {
          console.error('Error listening to package:', err);
          setLoadingPkg(false);
          setPkg(null);
        }
      );
      return () => unsubPkg();
    } else {
      setLoadingPkg(false);
      setPkg(null);
    }
  }, [booking]);

  // Loading Screen
  if (authLoading || loadingBooking) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Compass size={48} className="animate-spin text-[#9E1B1D]" />
        <h3 className="font-brand font-black text-xl uppercase tracking-wider text-[#121212]">
          Loading your journey...
        </h3>
        <p className="text-xs font-medium text-slate-500">Retrieving authentic trip details...</p>
      </div>
    );
  }

  // Unauthorized Access Screen
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212] space-y-4">
          <ShieldAlert size={56} className="mx-auto text-[#9E1B1D]" />
          <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
            THIS JOURNEY IS NOT AVAILABLE
          </h3>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            You do not have access to this journey. Please ensure you are logged into the account associated with this booking.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  // Booking Not Found Screen
  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border-4 border-[#121212] p-8 shadow-[8px_8px_0px_0px_#121212] space-y-4">
          <AlertCircle size={56} className="mx-auto text-amber-600" />
          <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
            BOOKING NOT FOUND
          </h3>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            We could not locate this booking record. It may have been archived or removed.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = BOOKING_STATUS_CONFIG[booking.status || 'PENDING_CONFIRMATION'] || {
    label: booking.status || 'PENDING',
    bg: 'bg-amber-100 border-amber-300',
    text: 'text-amber-900',
    icon: Clock3
  };
  const StatusIcon = statusConfig.icon;

  const isCancelled = booking.status === 'CANCELLED';
  const isPending = booking.status === 'PENDING_CONFIRMATION' || booking.status === 'DRAFT';

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#121212] pb-24 text-left">
      {/* ── TOP NAV BAR ── */}
      <div className="bg-[#121212] text-white border-b-4 border-[#F4BF4B] py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F4BF4B] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> RETURN TO DASHBOARD
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#F4BF4B] bg-white/10 px-3 py-1 rounded border border-white/20">
              {booking.bookingReference || booking.id}
            </span>
            <span className={`px-3 py-1 rounded font-black text-[10px] uppercase tracking-widest border ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1.5`}>
              <StatusIcon size={12} /> {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── STATUS BANNERS ── */}
      {isCancelled && (
        <div className="bg-rose-900 text-white p-4 text-center border-b-4 border-[#121212]">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 font-brand font-black text-sm uppercase tracking-widest">
            <XCircle size={18} /> JOURNEY CANCELLED — THIS BOOKING HAS BEEN CANCELLED
          </div>
        </div>
      )}

      {isPending && (
        <div className="bg-amber-400 text-[#121212] p-4 text-center border-b-4 border-[#121212]">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 font-brand font-black text-xs uppercase tracking-widest">
            <Clock3 size={16} /> BOOKING PENDING CONFIRMATION — YOUR EXPEDITION RESERVATION IS UNDER FINAL REVIEW
          </div>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <section className="bg-[#121212] text-white py-12 px-4 sm:px-8 border-b-4 border-[#121212] relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="font-brand font-black text-xs uppercase tracking-[0.3em] text-[#F4BF4B] block">
              MY EXPEDITION JOURNEY
            </span>
            <h1 className="font-brand font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-white leading-tight">
              {booking.itineraryTitle || booking.destination || 'Expedition Journey'}
            </h1>
          </div>

          {/* Key Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Target Destination</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                📍 {booking.destination || 'Global'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Confirmed Travel Date</span>
              <span className="font-bold text-sm text-[#F4BF4B] flex items-center gap-1 mt-0.5">
                🗓️ {booking.travelDate || 'Flexible / TBD'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Trip Duration</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                ⏱️ {booking.duration ? `${booking.duration} Days` : 'Custom'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Party Size</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                👥 {booking.numberOfTravelers || 1} Traveller(s)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-12">

        {/* ── 1. TRAVELLER-SAFE TRIP INFORMATION (E8 Category B) ── */}
        {(booking.travellerNotes || booking.tripInstructions || (booking.travelPreferences && (booking.travelPreferences.accommodation || booking.travelPreferences.dietary || booking.travelPreferences.accessibility || booking.travelPreferences.interests))) && (
          <section className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#9E1B1D] space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
              <div className="p-2.5 bg-[#9E1B1D] text-white rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  PERSONALIZED TRIP INFORMATION
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  TRAVELLER NOTES & PREFERENCES
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {booking.tripInstructions && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    IMPORTANT TRIP INSTRUCTIONS / ARRIVAL GUIDANCE
                  </span>
                  <p className="p-4 bg-[#FCFBF7] border-2 border-[#121212] font-medium text-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {booking.tripInstructions}
                  </p>
                </div>
              )}

              {booking.travellerNotes && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    SPECIAL TRAVELLER NOTES
                  </span>
                  <p className="p-4 bg-[#FCFBF7] border-2 border-[#121212] font-medium text-slate-900 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {booking.travellerNotes}
                  </p>
                </div>
              )}

              {booking.travelPreferences && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {booking.travelPreferences.accommodation && (
                    <div className="p-3 bg-[#FCFBF7] border border-slate-300 rounded-lg">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Accommodation Preference</span>
                      <span className="font-bold text-slate-900">{booking.travelPreferences.accommodation}</span>
                    </div>
                  )}
                  {booking.travelPreferences.dietary && (
                    <div className="p-3 bg-[#FCFBF7] border border-slate-300 rounded-lg">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Dietary Requirements</span>
                      <span className="font-bold text-slate-900">{booking.travelPreferences.dietary}</span>
                    </div>
                  )}
                  {booking.travelPreferences.accessibility && (
                    <div className="p-3 bg-[#FCFBF7] border border-slate-300 rounded-lg">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Accessibility Needs</span>
                      <span className="font-bold text-slate-900">{booking.travelPreferences.accessibility}</span>
                    </div>
                  )}
                  {booking.travelPreferences.interests && (
                    <div className="p-3 bg-[#FCFBF7] border border-slate-300 rounded-lg">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Special Interests</span>
                      <span className="font-bold text-slate-900">{booking.travelPreferences.interests}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 2. EDITORIAL JOURNEY OVERVIEW ── */}
        {pkg && (pkg.editorialIntro || pkg.overview || pkg.description || pkg.editorialHighlights?.length) && (
          <section className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="border-b-2 border-slate-200 pb-4">
              <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block mb-1">
                EDITORIAL SYNOPSIS
              </span>
              <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                ABOUT THIS JOURNEY
              </h3>
            </div>

            {pkg.editorialIntro && (
              <p className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed border-l-4 border-[#F4BF4B] pl-4">
                "{pkg.editorialIntro}"
              </p>
            )}

            {(pkg.overview || pkg.description) && (
              <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                {pkg.overview || pkg.description}
              </p>
            )}

            {/* Travel Style / Best For Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {pkg.travelStyle && (
                <span className="px-3 py-1.5 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest border border-[#121212]">
                  STYLE: {pkg.travelStyle}
                </span>
              )}
              {pkg.bestFor && (
                <span className="px-3 py-1.5 bg-[#FCFBF7] text-[#121212] font-black text-[10px] uppercase tracking-widest border-2 border-[#121212]">
                  BEST FOR: {pkg.bestFor}
                </span>
              )}
              {pkg.bestTime && (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-widest border border-amber-300">
                  BEST SEASON: {pkg.bestTime}
                </span>
              )}
            </div>

            {/* Editorial Highlights */}
            {pkg.editorialHighlights && pkg.editorialHighlights.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-brand font-black text-xs uppercase tracking-widest text-[#9E1B1D] flex items-center gap-1.5">
                  <Sparkles size={14} /> CURATED HIGHLIGHTS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pkg.editorialHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 bg-[#FCFBF7] border border-slate-200 rounded-lg">
                      <span className="font-mono text-xs font-bold text-[#9E1B1D]">0{idx + 1}.</span>
                      <span className="text-xs font-semibold text-slate-800">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── 3. JOURNEY ROUTE / STOPS (E2 Architecture) ── */}
        {pkg?.itineraryCities && pkg.itineraryCities.length > 0 && (
          <section className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#F4BF4B] space-y-6">
            <div className="border-b-2 border-slate-200 pb-4">
              <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block mb-1">
                JOURNEY ROUTE & DESTINATIONS
              </span>
              <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                {pkg.itineraryCities.length} CURATED STOPS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pkg.itineraryCities.map((stop, index) => (
                <div
                  key={stop.city || index}
                  className="border-2 border-[#121212] bg-[#FCFBF7] rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#121212] space-y-4 flex flex-col justify-between"
                >
                  {stop.heroImage && (
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={stop.heroImage}
                        alt={stop.city || 'Journey Stop'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-[#121212] text-[#F4BF4B] font-brand font-black text-xs uppercase tracking-widest px-2.5 py-1 border border-[#F4BF4B]">
                        STOP {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  <div className="p-4 space-y-2 flex-grow">
                    {!stop.heroImage && (
                      <span className="font-brand font-black text-xs uppercase tracking-widest text-[#9E1B1D] block">
                        STOP {String(index + 1).padStart(2, '0')}
                      </span>
                    )}

                    <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                      {stop.city}
                    </h4>

                    {stop.nights && stop.nights > 0 && (
                      <span className="inline-block px-2.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] uppercase tracking-wider rounded-full">
                        {stop.nights} {stop.nights === 1 ? 'Night' : 'Nights'}
                      </span>
                    )}

                    {stop.description && (
                      <p className="text-xs font-medium text-slate-600 line-clamp-3 leading-relaxed pt-1">
                        {stop.description}
                      </p>
                    )}

                    {stop.arrivalTransfer && (
                      <div className="text-[10px] font-bold text-slate-700 bg-slate-100 p-2 rounded border border-slate-200 flex items-center gap-1 mt-2">
                        <Compass size={12} /> Transfer: {typeof stop.arrivalTransfer === 'string' ? stop.arrivalTransfer : (stop.arrivalTransfer as any)?.text || ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. DAY-BY-DAY EXPEDITION ITINERARY ── */}
        {(() => {
          const allDays = (pkg?.itineraryCities && pkg.itineraryCities.length > 0)
            ? pkg.itineraryCities.flatMap(c => c.days || [])
            : [];

          if (!pkg || allDays.length === 0) {
            return (
              <section className="bg-amber-50 border-4 border-amber-300 p-8 rounded-2xl text-center space-y-3">
                <AlertCircle size={40} className="mx-auto text-amber-800" />
                <h4 className="font-brand font-black text-xl uppercase text-amber-950">
                  ITINERARY DAY SCHEDULE UNAVAILABLE
                </h4>
                <p className="text-xs font-medium text-amber-800 max-w-md mx-auto leading-relaxed">
                  Your booking is valid and confirmed. The detailed day-by-day itinerary content is currently being finalized by our curation team.
                </p>
              </section>
            );
          }

          return (
            <section className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-8">
              <div className="border-b-2 border-[#121212] pb-4">
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block mb-1">
                  DAY-BY-DAY SCHEDULE
                </span>
                <h3 className="font-brand font-black text-3xl sm:text-4xl uppercase text-[#121212]">
                  EXPEDITION ITINERARY ({allDays.length} DAYS)
                </h3>
              </div>

              <div className="space-y-8">
                {allDays.map((day, idx) => (
                <div
                  key={day.day || idx}
                  className="p-6 border-3 border-[#121212] bg-[#FCFBF7] rounded-2xl space-y-6 shadow-[6px_6px_0px_0px_#121212]"
                >
                  {/* Day Header */}
                  <div className="space-y-2 border-b border-slate-200 pb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-brand font-black text-xs uppercase tracking-[0.25em] text-white bg-[#9E1B1D] px-3 py-1 rounded border border-[#9E1B1D]">
                        DAY {String(day.day).padStart(2, '0')}
                      </span>
                      {day.location && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#121212] bg-[#F4BF4B] border border-[#121212] px-2.5 py-0.5 rounded-full">
                          <MapPin size={10} /> {day.location}
                        </span>
                      )}
                      {day.transfer && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
                          <Compass size={10} /> {day.transfer}
                        </span>
                      )}
                    </div>

                    <h4 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212]">
                      {day.title}
                    </h4>
                  </div>

                  {/* Day Description */}
                  {day.description && (
                    <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                      {day.description}
                    </p>
                  )}

                  {/* Highlights */}
                  {day.highlights && day.highlights.length > 0 && (
                    <div className="space-y-2 p-4 bg-white border-2 border-[#121212] rounded-xl">
                      <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                        TODAY'S HIGHLIGHTS
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {day.highlights.map((hl, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>{hl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Curated Experiences & Activities */}
                  {((day.experiences && day.experiences.length > 0) || (day.activities && day.activities.length > 0)) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {day.experiences && day.experiences.length > 0 && (
                        <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase text-amber-900 tracking-widest flex items-center gap-1">
                            <Sparkles size={12} /> CURATED EXPERIENCES
                          </span>
                          <ul className="space-y-1 text-xs font-bold text-slate-900">
                            {day.experiences.map((exp, eIdx) => (
                              <li key={eIdx} className="flex items-center gap-2">
                                <span className="text-[#9E1B1D]">•</span> {exp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {day.activities && day.activities.length > 0 && (
                        <div className="p-4 bg-white border-2 border-[#121212] rounded-xl space-y-2">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">
                            SCHEDULED ACTIVITIES
                          </span>
                          <ul className="space-y-1 text-xs font-medium text-slate-800">
                            {day.activities.map((act, aIdx) => (
                              <li key={aIdx} className="flex items-center gap-2">
                                <span className="text-[#F4BF4B] font-bold">✓</span> {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meals */}
                  {day.meals && day.meals.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-3 border border-slate-300 rounded-lg">
                      <Utensils size={14} className="text-[#9E1B1D]" />
                      <span className="text-[10px] font-black uppercase text-slate-400">INCLUDED MEALS:</span>
                      <span className="uppercase tracking-wider font-extrabold text-[#121212]">
                        {day.meals.join(' • ')}
                      </span>
                    </div>
                  )}

                  {/* Hotel Accommodation Card */}
                  {day.hotel && (
                    <div className="pt-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">
                        ACCOMMODATION & STAY
                      </span>
                      <HotelCard
                        hotel={day.hotel}
                        onOpenGallery={handleOpenHotelGallery}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

        {/* ── 5. TRAVEL DOCUMENTS (E12) ── */}
        {(() => {
          const travDocs = (booking.documents || []).filter((d: BookingDocument) => d.visibleToTraveller);
          const hasItineraryDoc = travDocs.some((d: BookingDocument) => d.category === 'ITINERARY');
          const showPkgFallback = !hasItineraryDoc && !!pkg?.itineraryPDF;

          const DOC_LABELS: Record<string, string> = {
            ITINERARY: 'Itinerary PDF',
            BOOKING_CONFIRMATION: 'Booking Confirmation',
            TRAVEL_VOUCHER: 'Travel Voucher',
            ADDITIONAL: 'Additional Document',
          };

          const hasDocs = travDocs.length > 0 || showPkgFallback;

          return (
            <section className="bg-[#121212] text-white p-8 border-4 border-[#121212] rounded-2xl space-y-6 shadow-[8px_8px_0px_0px_#F4BF4B]">
              <div className="flex items-center gap-3">
                <Download size={32} className="text-[#F4BF4B]" />
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase text-white">
                    TRAVEL DOCUMENTS
                  </h3>
                  <p className="text-xs font-medium text-slate-300">
                    Shared by your expedition team. Download for offline access.
                  </p>
                </div>
              </div>

              {!hasDocs ? (
                <div className="p-4 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-slate-300 text-center">
                  Your travel documents will appear here once your booking is confirmed.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Booking-level docs */}
                  {travDocs.map((d: BookingDocument) => (
                    <a
                      key={d.id}
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/10 border border-white/20 hover:bg-[#F4BF4B]/10 hover:border-[#F4BF4B]/50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-10 bg-[#F4BF4B] rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-[#121212]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm text-white uppercase tracking-wide truncate group-hover:text-[#F4BF4B] transition-colors">{d.title}</p>
                          <p className="text-[10px] text-slate-400">{DOC_LABELS[d.category] || d.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-bold text-[#F4BF4B] uppercase hidden sm:block">Download</span>
                        <Download size={16} className="text-[#F4BF4B]" />
                      </div>
                    </a>
                  ))}

                  {/* Package PDF fallback */}
                  {showPkgFallback && (
                    <a
                      href={pkg!.itineraryPDF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/10 border border-white/20 hover:bg-[#F4BF4B]/10 hover:border-[#F4BF4B]/50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#F4BF4B] rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-[#121212]" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-white uppercase tracking-wide group-hover:text-[#F4BF4B] transition-colors">Official Itinerary PDF</p>
                          <p className="text-[10px] text-slate-400">Complete day-by-day journey plan</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-[10px] font-bold text-[#F4BF4B] uppercase hidden sm:block">Download</span>
                        <Download size={16} className="text-[#F4BF4B]" />
                      </div>
                    </a>
                  )}
                </div>
              )}
            </section>
          );
        })()}
      </main>

      {/* ── HOTEL GALLERY LIGHTBOX MODAL (B5) ── */}
      <HotelGallery
        isOpen={hotelGalleryState.isOpen}
        onClose={() => setHotelGalleryState((prev) => ({ ...prev, isOpen: false }))}
        images={hotelGalleryState.images}
        initialIndex={hotelGalleryState.initialIndex}
        hotelName={hotelGalleryState.hotelName}
        location={hotelGalleryState.location}
      />
    </div>
  );
};
