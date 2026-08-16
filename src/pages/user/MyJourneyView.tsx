import React, { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
  Phone,
  MessageSquare,
  Building,
  Check,
  X,
  Eye,
  ShieldCheck,
  Navigation,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Globe,
  Star,
} from 'lucide-react';
import { doc, onSnapshot, query, collection, where, getDocs } from 'firebase/firestore';
import { useAuth, db } from '../../services/firebaseService';
import { Booking, Package, ItineraryCity, ItineraryDay, BookingDocument, CustomerStory, Destination } from '../../types/database';
import { normalizeItinerary } from '../../utils/itineraryNormalizer';
import { HotelCard } from '../../components/itinerary/HotelCard';
import { HotelGallery } from '../../components/itinerary/HotelGallery';
import { PackageJourneyCard } from '../../components/packages/PackageJourneyCard';
import { TravellerFeedbackModal } from '../../components/user/TravellerFeedbackModal';
import { useEnquiry } from '../../context/EnquiryContext';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveStaticPageSEO } from '../../utils/seo';

const DOC_CATEGORY_LABELS: Record<string, string> = {
  ITINERARY: 'Itinerary PDF',
  TRAVEL_DOCUMENT: 'Travel Document',
  HOTEL: 'Accommodation Voucher',
  TRANSFER: 'Transfer Voucher',
  ACTIVITY: 'Activity Ticket',
  BOOKING_CONFIRMATION: 'Booking Confirmation',
  TRAVEL_VOUCHER: 'Travel Voucher',
  ADDITIONAL: 'Additional Document',
  OTHER: 'General Travel Document',
};

export const MyJourneyView: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { openEnquiry } = useEnquiry();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [relatedStory, setRelatedStory] = useState<CustomerStory | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [loadingPkg, setLoadingPkg] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<BookingDocument | { title: string; fileUrl: string; category?: string } | null>(null);

  // Feedback Modal State (E46)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

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

  // 3. Realtime Listener for Linked PUBLISHED Customer Story
  useEffect(() => {
    if (!booking) return;

    const bRef = booking.bookingReference || booking.id;
    const q = query(
      collection(db, 'customerStories'),
      where('status', '==', 'PUBLISHED')
    );

    const unsubStories = onSnapshot(q, (snapshot) => {
      const publishedStories = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CustomerStory[];

      const matched = publishedStories.find(
        (s) =>
          s.bookingId === booking.id ||
          s.bookingId === bRef ||
          (s as any).bookingReference === bRef ||
          (booking.customerId && s.customerId === booking.customerId)
      );

      setRelatedStory(matched || null);
    });

    return () => unsubStories();
  }, [booking]);

  // 4. Realtime Listener for Published Packages (Discovery for Completed Trips)
  useEffect(() => {
    const unsubPkgs = onSnapshot(collection(db, 'packages'), (snap) => {
      const pkgs = snap.docs.map((d) => normalizeItinerary({ id: d.id, ...d.data() } as Package));
      setAllPackages(pkgs);
    });

    const unsubDests = onSnapshot(collection(db, 'destinations'), (snap) => {
      const dests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
      setAllDestinations(dests);
    });

    return () => {
      unsubPkgs();
      unsubDests();
    };
  }, []);

  // Related Packages (Max 3 published packages, prioritizing same destination or style, excluding current)
  const relatedPackages = useMemo(() => {
    if (!allPackages.length) return [];
    const currentPkgId = booking?.itineraryId || booking?.packageId;
    const currentDest = booking?.destination?.toLowerCase() || '';
    const currentStyle = (pkg?.travelStyle || booking?.travelPreferences?.accommodation || '').toLowerCase();

    const candidates = allPackages.filter((p) => {
      const isPublished = (p as any).published !== false && (p as any).status !== 'DRAFT';
      if (!isPublished) return false;
      if (p.id === currentPkgId || (booking?.itinerarySlug && p.slug === booking.itinerarySlug)) return false;
      return true;
    });

    return candidates
      .sort((a, b) => {
        const aSameDest = a.destination?.toLowerCase().includes(currentDest) ? 1 : 0;
        const bSameDest = b.destination?.toLowerCase().includes(currentDest) ? 1 : 0;
        if (aSameDest !== bSameDest) return bSameDest - aSameDest;

        const aSameStyle = a.travelStyle?.toLowerCase().includes(currentStyle) ? 1 : 0;
        const bSameStyle = b.travelStyle?.toLowerCase().includes(currentStyle) ? 1 : 0;
        return bSameStyle - aSameStyle;
      })
      .slice(0, 3);
  }, [allPackages, booking, pkg]);

  // Related Destinations (Max 3 published destinations)
  const relatedDestinations = useMemo(() => {
    if (!allDestinations.length) return [];
    const candidates = allDestinations.filter((d) => (d as any).published !== false);
    return candidates.slice(0, 3);
  }, [allDestinations]);

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

  // ── Derive Customer-Friendly Status ──
  const getCustomerStatusInfo = (b: Booking) => {
    if (b.status === 'CANCELLED' || b.bookingStatus === 'cancelled') {
      return {
        label: 'JOURNEY CANCELLED',
        desc: 'This journey reservation has been cancelled.',
        bg: 'bg-rose-100 border-rose-300 text-rose-900',
        icon: XCircle,
      };
    }
    if (b.status === 'COMPLETED' || b.bookingStatus === 'completed' || b.operationalStatus === 'TRIP_COMPLETED') {
      return {
        label: 'JOURNEY COMPLETE',
        desc: 'We hope you had a wonderful journey with NO FIXED ADDRESS.',
        bg: 'bg-slate-100 border-slate-300 text-slate-800',
        icon: CheckCircle,
      };
    }
    if (b.operationalStatus === 'TRIP_IN_PROGRESS') {
      return {
        label: "YOU'RE CURRENTLY TRAVELLING",
        desc: 'Enjoy your bespoke expedition! Our dedicated support line remains at your service.',
        bg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
        icon: Compass,
      };
    }
    if (b.operationalStatus === 'TRAVELLER_BRIEFED') {
      return {
        label: 'JOURNEY READY & BRIEFED',
        desc: 'Your journey is ready and your pre-departure briefing consultation is complete.',
        bg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
        icon: CheckCircle2,
      };
    }
    if (b.operationalStatus === 'READY') {
      return {
        label: 'JOURNEY READY FOR TRAVEL',
        desc: 'All reservations, routes, and travel documents are finalized for your departure.',
        bg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
        icon: CheckCircle2,
      };
    }
    if (b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed') {
      return {
        label: 'PREPARING YOUR JOURNEY',
        desc: 'Our travel team is actively preparing your custom route, stays, and documents.',
        bg: 'bg-blue-100 border-blue-300 text-blue-900',
        icon: Clock3,
      };
    }
    return {
      label: 'RESERVATION UNDER REVIEW',
      desc: 'Your expedition reservation is under final review with our travel team.',
      bg: 'bg-amber-100 border-amber-300 text-amber-900',
      icon: Clock3,
    };
  };

  const statusInfo = getCustomerStatusInfo(booking);
  const StatusIcon = statusInfo.icon;
  const isTravellingNow = booking.operationalStatus === 'TRIP_IN_PROGRESS';
  const isCompleted = booking.status === 'COMPLETED' || booking.bookingStatus === 'completed' || booking.operationalStatus === 'TRIP_COMPLETED';

  // Documents
  const travDocs = (booking.documents || []).filter((d: BookingDocument) => d.visibleToTraveller !== false);
  const hasItineraryDoc = travDocs.some((d: BookingDocument) => d.category === 'ITINERARY');
  const showPkgFallback = !hasItineraryDoc && !!pkg?.itineraryPDF;
  const allTravellerDocs = [...travDocs];
  if (showPkgFallback) {
    allTravellerDocs.push({
      id: 'pkg-itinerary-pdf',
      title: `${pkg?.title || 'Official Itinerary'} — PDF`,
      category: 'ITINERARY',
      fileUrl: pkg!.itineraryPDF!,
      visibleToTraveller: true,
      uploadedAt: booking.createdAt,
    } as BookingDocument);
  }

  // Safe WhatsApp Link Generator
  const buildWhatsAppHandoffUrl = () => {
    const ref = booking.bookingReference || booking.id;
    const traveller = booking.primaryTraveler?.name || 'Traveller';
    const journey = booking.itineraryTitle || booking.destination || 'Expedition';
    const dest = booking.destination || 'Global';
    const dates = booking.travelDate || 'Dates TBD';
    const phone = localStorage.getItem('nfa_admin_whatsapp')?.replace(/\D/g, '') || '919876543210';
    
    const text = encodeURIComponent(
      `Hello NO FIXED ADDRESS Travel Team,\n\nI need help with my journey.\n\nTraveller: ${traveller}\nBooking Reference: ${ref}\nJourney: ${journey}\nDestination: ${dest}\nTravel Dates: ${dates}\n\nCould you please assist me?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Plan Another Journey Trigger
  const handlePlanAnotherJourney = () => {
    openEnquiry({
      source: 'COMPLETED_JOURNEY_REPEAT',
      destination: booking.destination,
      itineraryTitle: booking.itineraryTitle,
    });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#121212] pb-24 text-left">
      {/* Protected Customer Booking Route — noindex, nofollow */}
      <SeoHead metadata={resolveStaticPageSEO('myJourney')} />
      
      {/* ── TOP NAV BAR ── */}
      <div className="bg-[#121212] text-white border-b-4 border-[#F4BF4B] py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-md">
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
            <span className={`px-3 py-1 rounded font-black text-[10px] uppercase tracking-widest border ${statusInfo.bg} flex items-center gap-1.5`}>
              <StatusIcon size={12} /> {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── STATUS BANNER ── */}
      <div className="bg-[#FCFBF7] border-b-2 border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles size={14} className="text-[#9E1B1D] shrink-0" />
          <span>{statusInfo.desc}</span>
        </div>
      </div>

      {/* ── HERO HEADER / FOCAL JOURNEY CARD ── */}
      <section id="journey-overview" className="bg-[#121212] text-white py-12 px-4 sm:px-8 border-b-4 border-[#121212] relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="font-brand font-black text-xs uppercase tracking-[0.3em] text-[#F4BF4B] block">
              {isCompleted ? 'EXPEDITION ARCHIVE' : 'TRAVEL INFORMATION & ASSISTANCE CENTER'}
            </span>
            <h1 className="font-brand font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tighter text-white leading-tight">
              {booking.itineraryTitle || booking.destination || 'Expedition Journey'}
            </h1>
          </div>

          {/* Key Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xs">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Destination</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                📍 {booking.destination || 'Global'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Travel Dates</span>
              <span className="font-bold text-sm text-[#F4BF4B] flex items-center gap-1 mt-0.5">
                🗓️ {booking.travelDate || 'Flexible / TBD'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Duration</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                ⏱️ {booking.duration ? `${booking.duration} Days` : 'Custom'}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Traveller(s)</span>
              <span className="font-bold text-sm text-white flex items-center gap-1 mt-0.5">
                👥 {booking.numberOfTravelers || 1} Person(s)
              </span>
            </div>
          </div>

          {/* Quick Action Jump Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {booking.itinerarySlug && (
              <Link
                to={`/itinerary/${booking.itinerarySlug}`}
                target="_blank"
                className="px-4 py-2.5 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink size={14} /> View Journey Plan
              </Link>
            )}

            <a
              href="#travel-documents"
              className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1.5"
            >
              <FileText size={14} className="text-[#F4BF4B]" /> Travel Documents ({allTravellerDocs.length})
            </a>

            {isCompleted && (
              <button
                onClick={handlePlanAnotherJourney}
                className="px-4 py-2.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Compass size={14} /> Plan Another Journey
              </button>
            )}

            {isCompleted && relatedStory && relatedStory.status === 'PUBLISHED' && (
              <Link
                to={`/stories/${relatedStory.slug}`}
                className="px-4 py-2.5 bg-amber-400 text-[#121212] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen size={14} /> Read Your Travel Story
              </Link>
            )}

            {!isCompleted && (
              <a
                href="#support-assistance"
                className="px-4 py-2.5 bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                <Phone size={14} className="text-[#F4BF4B]" /> Need Help / Support
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── TRAVEL INFORMATION SHORTCUT NAVIGATION ── */}
      <nav aria-label="Journey Sections" className="bg-white border-b-2 border-slate-200 py-3 px-4 sm:px-8 sticky top-[60px] z-20 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto text-[11px] font-black uppercase tracking-wider text-slate-600 scrollbar-none">
          <a href="#journey-overview" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#121212] hover:text-white transition-colors shrink-0">
            Overview
          </a>
          {!isCompleted && (
            <a href="#before-you-travel" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#121212] hover:text-white transition-colors shrink-0">
              Before You Travel
            </a>
          )}
          {!isCompleted && (
            <a href="#arrival-transfer" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#121212] hover:text-white transition-colors shrink-0">
              Arrival & Transfer
            </a>
          )}
          <a href="#where-youll-stay" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#121212] hover:text-white transition-colors shrink-0">
            Where You Stayed
          </a>
          <a href="#travel-documents" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#121212] hover:text-white transition-colors shrink-0">
            Travel Documents
          </a>
          {isCompleted && (
            <a href="#discover-next" className="px-3 py-1.5 rounded-lg bg-[#F4BF4B]/20 text-[#121212] border border-[#F4BF4B] hover:bg-[#121212] hover:text-white transition-colors shrink-0">
              Explore Next
            </a>
          )}
          <a href="#support-assistance" className="px-3 py-1.5 rounded-lg bg-rose-50 text-[#9E1B1D] border border-rose-200 hover:bg-[#9E1B1D] hover:text-white transition-colors shrink-0">
            {isCompleted ? 'Memories & Assistance' : 'Support & Help'}
          </a>
        </div>
      </nav>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 space-y-12">

        {/* ── 1. PRE-DEPARTURE GUIDANCE (ACTIVE TRIPS ONLY) ── */}
        {!isCompleted && (
          <section id="before-you-travel" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
              <div className="p-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg">
                <Compass size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  PRE-DEPARTURE READINESS
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  BEFORE YOU TRAVEL
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Review these key steps before your departure to ensure a seamless and unforgettable journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 1. Review Journey Plan
                </span>
                <p className="text-slate-600 text-[11px]">
                  Familiarize yourself with your daily highlights, timings, and route.
                </p>
              </div>

              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 2. Download Documents
                </span>
                <p className="text-slate-600 text-[11px]">
                  Save your official Itinerary PDF and vouchers for offline access.
                </p>
              </div>

              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 3. Review Stays
                </span>
                <p className="text-slate-600 text-[11px]">
                  Check accommodation check-in details, locations, and included amenities.
                </p>
              </div>

              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 4. Arrival Instructions
                </span>
                <p className="text-slate-600 text-[11px]">
                  Read packing advice, meeting points, and arrival guidance below.
                </p>
              </div>

              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 5. Booking Reference
                </span>
                <p className="text-slate-600 text-[11px]">
                  Keep ref <strong className="text-[#9E1B1D]">{booking.bookingReference || booking.id}</strong> handy when speaking to your team.
                </p>
              </div>

              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-1">
                <span className="font-black text-slate-900 block flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> 6. Pre-Departure Contact
                </span>
                <p className="text-slate-600 text-[11px]">
                  Reach our team on WhatsApp anytime for questions or adjustments.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── 2. ARRIVAL & TRANSFER (ACTIVE TRIPS ONLY) ── */}
        {!isCompleted && (
          <section id="arrival-transfer" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
              <div className="p-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg">
                <Plane size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  LOGISTICS & TRANSFERS
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  ARRIVAL & TRANSFER ASSISTANCE
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {booking.tripInstructions ? (
                <div className="p-5 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {booking.tripInstructions}
                </div>
              ) : (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 italic">
                  Arrival and transfer details will appear here once finalized by your travel team.
                </div>
              )}

              {pkg?.startLocation && (
                <div className="p-4 bg-[#FCFBF7] border border-slate-300 rounded-xl space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">
                    OFFICIAL EXPEDITION MEETING POINT
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    📍 {pkg.startLocation}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 3. TRAVEL INSTRUCTIONS & PREFERENCES ── */}
        {(booking.travellerNotes || booking.travelPreferences) && (
          <section className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#9E1B1D] space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
              <div className="p-2.5 bg-[#9E1B1D] text-white rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  CONFIRMED TRIP DETAILS
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  TRAVELLER NOTES & PREFERENCES
                </h3>
              </div>
            </div>

            <div className="space-y-6 text-xs">
              {booking.travellerNotes && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    YOUR SPECIAL TRAVEL NOTES
                  </span>
                  <div className="p-5 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                    {booking.travellerNotes}
                  </div>
                </div>
              )}

              {booking.travelPreferences && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                    YOUR CONFIRMED TRAVEL PREFERENCES
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {booking.travelPreferences.accommodation && (
                      <div className="p-3 bg-[#FCFBF7] border border-slate-300 rounded-lg">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Stay Style</span>
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
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Accessibility</span>
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
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 4. ACCOMMODATION & STAYS (WHERE YOU'LL STAY) ── */}
        <section id="where-youll-stay" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
            <div className="p-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg">
              <Building size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                {isCompleted ? 'EXPEDITION ACCOMMODATIONS' : 'CURATED STAYS'}
              </span>
              <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                {isCompleted ? 'WHERE YOU STAYED' : "WHERE YOU'LL STAY"}
              </h3>
            </div>
          </div>

          {(() => {
            const hotelsList = (pkg?.itineraryDays || [])
              .map((day) => day.hotel)
              .filter((h): h is NonNullable<typeof h> => !!h && !!h.name);

            const uniqueHotels = Array.from(
              new Map(hotelsList.map((h) => [h.name, h])).values()
            );

            if (uniqueHotels.length === 0) {
              return (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-500">
                  {isCompleted
                    ? 'Accommodation archive is stored securely with your travel records.'
                    : 'Your accommodation details are being finalized by our travel team.'}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uniqueHotels.map((hotel, idx) => (
                  <HotelCard
                    key={`${hotel.name}-${idx}`}
                    hotel={hotel}
                    onOpenGallery={handleOpenHotelGallery}
                  />
                ))}
              </div>
            );
          })()}
        </section>

        {/* ── 5. TRAVEL DOCUMENTS CENTER (PERMANENT RETENTION) ── */}
        <section id="travel-documents" className="bg-[#121212] text-white p-8 border-4 border-[#121212] rounded-2xl space-y-6 shadow-[8px_8px_0px_0px_#F4BF4B]">
          <div className="flex items-center justify-between border-b border-white/20 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Download size={28} className="text-[#F4BF4B]" />
              <div>
                <h3 className="font-brand font-black text-2xl uppercase text-white">
                  TRAVEL DOCUMENTS
                </h3>
                <p className="text-xs font-medium text-slate-300">
                  Official itinerary PDFs, vouchers, and confirmed travel passes (permanently retained).
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded bg-[#F4BF4B] text-[#121212] font-black text-[10px] uppercase tracking-widest">
              {allTravellerDocs.length > 0 ? `${allTravellerDocs.length} DOCUMENT(S) ARCHIVED` : 'NO DOCUMENTS'}
            </span>
          </div>

          {allTravellerDocs.length === 0 ? (
            <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center space-y-2">
              <FileText size={32} className="mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-300">
                {isCompleted ? 'No documents were uploaded for this trip.' : 'Your travel documents are being prepared by our team.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allTravellerDocs.map((docItem) => (
                <div
                  key={docItem.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/10 border border-white/20 rounded-xl gap-4 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 bg-[#F4BF4B] rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-[#121212]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white uppercase tracking-wide truncate">
                        {docItem.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {DOC_CATEGORY_LABELS[docItem.category] || docItem.category || 'Travel Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewDoc(docItem)}
                      className="px-3 py-1.5 bg-white/10 text-[#F4BF4B] border border-white/20 rounded-lg font-bold text-xs uppercase hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} /> Preview
                    </button>

                    <a
                      href={docItem.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-[#F4BF4B] text-[#121212] rounded-lg font-black text-xs uppercase hover:bg-white transition-colors flex items-center gap-1.5"
                    >
                      <Download size={13} /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 6. HOW WAS YOUR JOURNEY? (FEEDBACK & REVIEW - E46) ── */}
        {isCompleted && (
          <section id="feedback-review" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
              <div className="p-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg">
                <MessageSquare size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  EXPEDITION REFLECTIONS
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  HOW WAS YOUR JOURNEY?
                </h3>
              </div>
            </div>

            {booking.feedback?.submitted ? (
              <div className="p-6 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      FEEDBACK SHARED
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: booking.feedback.overallRating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Thank you for sharing your reflections with NO FIXED ADDRESS.
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Submitted on {booking.feedback.submittedAt ? new Date(booking.feedback.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
                  </p>
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  View / Update Feedback
                </button>
              </div>
            ) : (
              <div className="p-6 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 max-w-lg">
                  <h4 className="font-brand font-black text-base uppercase text-slate-900">
                    We'd love to hear how your journey with NO FIXED ADDRESS went.
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Your reflections help us celebrate our local expedition leaders and continually refine our private routes.
                  </p>
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer shadow-sm shrink-0 flex items-center gap-2"
                >
                  <Sparkles size={14} /> SHARE YOUR EXPERIENCE
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── 7. WHERE COULD YOU GO NEXT? (COMPLETED TRIPS DISCOVERY - E44) ── */}
        {isCompleted && (
          <section id="discover-next" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#F4BF4B] space-y-8">
            <div className="border-b-2 border-[#121212] pb-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  FUTURE EXPEDITIONS
                </span>
                <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                  WHERE COULD YOU GO NEXT?
                </h3>
              </div>
              <Link
                to="/packages"
                className="text-xs font-black uppercase tracking-wider text-[#9E1B1D] hover:underline flex items-center gap-1"
              >
                Explore All Journeys &rarr;
              </Link>
            </div>

            {/* Related Journeys */}
            {relatedPackages.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-brand font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Compass size={16} className="text-[#9E1B1D]" /> CURATED EXPEDITIONS FOR RETURNING TRAVELLERS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPackages.map((rp) => (
                    <PackageJourneyCard key={rp.id} pkg={rp} />
                  ))}
                </div>
              </div>
            )}

            {/* Related Destinations */}
            {relatedDestinations.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-brand font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Globe size={16} className="text-[#9E1B1D]" /> BREATHTAKING DESTINATIONS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedDestinations.map((dest) => (
                    <Link
                      key={dest.id}
                      to={`/destinations/${dest.slug}`}
                      className="group p-4 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl hover:shadow-[4px_4px_0px_0px_#121212] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        {dest.heroImage && (
                          <div className="h-32 rounded-lg overflow-hidden border border-slate-200">
                            <img
                              src={dest.heroImage}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                          {dest.country || 'Destination'}
                        </span>
                        <h5 className="font-brand font-black text-lg uppercase text-slate-900 group-hover:text-[#9E1B1D] transition-colors">
                          {dest.name}
                        </h5>
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-wider pt-3 block">
                        Explore Destination &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── 7. POST-TRIP CTA: PLAN ANOTHER JOURNEY (E44) ── */}
        {isCompleted && (
          <section className="bg-[#121212] text-white p-8 border-4 border-[#121212] rounded-2xl shadow-[8px_8px_0px_0px_#9E1B1D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="font-brand font-black text-xs uppercase tracking-widest text-[#F4BF4B] block">
                RETURNING TRAVELLER PRIVILEGES
              </span>
              <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-white leading-tight">
                PLAN YOUR NEXT JOURNEY
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Ready to discover somewhere new? Tell us what you're thinking and our specialists will help shape your next custom journey.
              </p>
            </div>

            <button
              onClick={handlePlanAnotherJourney}
              className="px-8 py-4 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-[4px_4px_0px_0px_#9E1B1D] shrink-0 cursor-pointer flex items-center gap-2"
            >
              <Compass size={16} /> PLAN ANOTHER JOURNEY
            </button>
          </section>
        )}

        {/* ── 8. STATUS-AWARE TRAVELLER SUPPORT & ASSISTANCE (E43) ── */}
        <section id="support-assistance" className="bg-white border-4 border-[#121212] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-[#121212] pb-4">
            <div className="p-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg">
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                {isTravellingNow
                  ? 'IN-TRIP ASSISTANCE'
                  : isCompleted
                  ? 'EXPEDITION MEMORIES & SUPPORT'
                  : 'PRE-DEPARTURE SUPPORT'}
              </span>
              <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                {isTravellingNow
                  ? 'TRAVELLING NOW?'
                  : isCompleted
                  ? 'HOW WAS YOUR JOURNEY?'
                  : 'NEED HELP WITH YOUR JOURNEY?'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {isTravellingNow
              ? "We're here if you need help during your journey. Your dedicated expedition team is standing by on WhatsApp and phone for immediate assistance."
              : isCompleted
              ? 'We hope you had a wonderful expedition with NO FIXED ADDRESS. Your travel history and travel documents remain permanently accessible here for future reference.'
              : 'Our travel team is here to help with questions about your journey, travel arrangements, documents, or arrival plans.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {!isCompleted ? (
              <>
                <a
                  href={buildWhatsAppHandoffUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <MessageSquare size={16} /> CONTINUE ON WHATSAPP
                </a>

                <a
                  href="tel:+919876543210"
                  className="px-6 py-3.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone size={16} /> CALL TRAVEL TEAM
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> VIEW TRAVEL HISTORY
                </Link>

                {relatedStory && relatedStory.status === 'PUBLISHED' && (
                  <Link
                    to={`/stories/${relatedStory.slug}`}
                    className="px-6 py-3.5 bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-200 transition-colors flex items-center gap-2"
                  >
                    <BookOpen size={16} /> READ YOUR TRAVEL STORY
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── IN-BROWSER PDF PREVIEW MODAL ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-4 border-[#121212] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-[12px_12px_0px_0px_#F4BF4B]">
            {/* Modal Header */}
            <div className="p-4 bg-[#121212] text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={18} className="text-[#F4BF4B] shrink-0" />
                <span className="font-brand font-black text-sm uppercase truncate">
                  {previewDoc.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase rounded hover:bg-white transition-colors flex items-center gap-1"
                >
                  <Download size={12} /> Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body / Iframe Embed */}
            <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
              <iframe
                src={previewDoc.fileUrl}
                title={previewDoc.title}
                className="w-full h-full rounded border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── HOTEL GALLERY LIGHTBOX MODAL (B5) ── */}
      <HotelGallery
        isOpen={hotelGalleryState.isOpen}
        onClose={() => setHotelGalleryState((prev) => ({ ...prev, isOpen: false }))}
        images={hotelGalleryState.images}
        initialIndex={hotelGalleryState.initialIndex}
        hotelName={hotelGalleryState.hotelName}
        location={hotelGalleryState.location}
      />

      {/* ── TRAVELLER FEEDBACK MODAL (E46) ── */}
      {booking && (
        <TravellerFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          booking={booking}
        />
      )}
    </div>
  );
};
