import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, db } from '../../services/firebaseService';
import { doc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { CustomerDocument, EnquiryDocument, Package, Booking, BookingDocument, CustomerStory } from '../../types/database';
import { useEnquiry } from '../../context/EnquiryContext';
import { EditProfileModal } from '../../components/user/EditProfileModal';
import { CustomerEnquiryModal } from '../../components/user/CustomerEnquiryModal';
import {
  User as UserIcon,
  Calendar,
  MapPin,
  FileText,
  Settings,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Download,
  Heart,
  Sparkles,
  Compass,
  Clock,
  Eye,
  CheckCircle2,
  CheckCircle,
  X,
  ExternalLink,
  Lock,
  MessageCircle,
  Clock3,
  BookOpen,
  Star,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveStaticPageSEO } from '../../utils/seo';
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_EXPLANATIONS,
  BOOKING_STATUS_LABELS,
} from '../../utils/statusLabels';

const TABS = [
  { id: 'OVERVIEW', label: 'Overview' },
  { id: 'ENQUIRIES', label: 'My Enquiries' },
  { id: 'TRIPS', label: 'My Trips' },
  { id: 'HISTORY', label: 'Travel History' },
  { id: 'DOCUMENTS', label: 'Travel Documents' },
  { id: 'PROFILE', label: 'Profile & Preferences' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  NEW: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
  CONTACTED: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
  IN_DISCUSSION: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900' },
  CUSTOMIZATION: { bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-900' },
  PROPOSAL_SENT: { bg: 'bg-teal-100 border-teal-300', text: 'text-teal-900' },
  READY_TO_BOOK: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CONVERTED: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CLOSED: { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700' },
};

const BOOKING_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
  PENDING_CONFIRMATION: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
  CONFIRMED: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CANCELLED: { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-900' },
  COMPLETED: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
};

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { openEnquiry } = useEnquiry();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [customer, setCustomer] = useState<CustomerDocument | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [packagesMap, setPackagesMap] = useState<Record<string, Package>>({});
  const [publishedStories, setPublishedStories] = useState<CustomerStory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryDocument | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // 1. Realtime Listener for Customer Document
  useEffect(() => {
    if (!user) return;

    const custRef = doc(db, 'customers', user.uid);
    const unsubCustomer = onSnapshot(
      custRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setCustomer({ id: snapshot.id, ...snapshot.data() } as CustomerDocument);
        } else {
          setCustomer({
            id: user.uid,
            customerId: user.uid,
            userId: user.uid,
            customerReference: `NFA-C-${user.uid.slice(0, 5).toUpperCase()}`,
            name: user.displayName || 'Valued Traveller',
            email: user.email || '',
            totalEnquiries: 0,
            totalConvertedEnquiries: 0,
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
          } as CustomerDocument);
        }
        setLoadingData(false);
      },
      (err) => {
        console.error('Error listening to customer document:', err);
        setLoadingData(false);
      }
    );

    return () => unsubCustomer();
  }, [user]);

  // 2. Realtime Listener for User Enquiries
  useEffect(() => {
    if (!user) return;

    const unsubEnquiries = onSnapshot(
      collection(db, 'Enquiries'),
      (snapshot) => {
        const userEnquiries = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as EnquiryDocument))
          .filter(
            (e) =>
              e.customerId === user.uid ||
              e.traveller?.userId === user.uid ||
              e.traveller?.email?.toLowerCase() === user.email?.toLowerCase() ||
              (e as any).email?.toLowerCase() === user.email?.toLowerCase()
          );

        userEnquiries.sort((a, b) => {
          const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : new Date((a as any).createdAt || 0).getTime();
          const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : new Date((b as any).createdAt || 0).getTime();
          return tB - tA;
        });

        setEnquiries(userEnquiries);
      },
      (err) => console.error('Error listening to enquiries:', err)
    );

    return () => unsubEnquiries();
  }, [user]);

  // 3. Realtime Listener for User Bookings
  useEffect(() => {
    if (!user) return;

    const unsubUserBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const docs = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as Booking))
          .filter(
            (b) =>
              b.userId === user.uid ||
              b.customerId === user.uid ||
              b.primaryTraveler?.email?.toLowerCase() === user.email?.toLowerCase()
          );

        setUserBookings(docs);
      },
      (err) => console.error('Error listening to user bookings:', err)
    );

    return () => unsubUserBookings();
  }, [user]);

  // 4. Realtime Listener for Packages (to retrieve itinerary PDFs)
  useEffect(() => {
    const unsubPkgs = onSnapshot(
      collection(db, 'packages'),
      (snapshot) => {
        const map: Record<string, Package> = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = { id: d.id, ...d.data() } as Package;
        });
        setPackagesMap(map);
      },
      (err) => console.error('Error listening to packages:', err)
    );

    return () => unsubPkgs();
  }, []);

  // 5. Realtime Listener for PUBLISHED Customer Stories (E44)
  useEffect(() => {
    const q = query(
      collection(db, 'customerStories'),
      where('status', '==', 'PUBLISHED')
    );
    const unsubStories = onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as CustomerStory[];
      setPublishedStories(stories);
    });

    return () => unsubStories();
  }, []);

  const getStoryForBooking = (b: Booking) => {
    const bRef = b.bookingReference || b.id;
    return publishedStories.find(
      (s) =>
        s.bookingId === b.id ||
        s.bookingId === bRef ||
        (s as any).bookingReference === bRef ||
        (b.customerId && s.customerId === b.customerId)
    );
  };

  // Filter Bookings & Enquiries
  const activeEnquiries = useMemo(() => {
    return enquiries.filter((e) => e.status !== 'CLOSED' && e.status !== 'CONVERTED');
  }, [enquiries]);

  const upcomingTrips = useMemo(() => {
    return userBookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  }, [userBookings]);

  const completedTrips = useMemo(() => {
    return userBookings.filter((b) => b.status === 'COMPLETED');
  }, [userBookings]);

  // Next upcoming booking (confirmed preferred)
  const nextJourney = useMemo(() => {
    const confirmed = upcomingTrips.find((b) => b.status === 'CONFIRMED');
    if (confirmed) return confirmed;
    return upcomingTrips[0] || null;
  }, [upcomingTrips]);

  // Documents list: only traveller-visible documents from bookings, with package PDF fallback
  const allDocuments = useMemo(() => {
    const list: Array<{ booking: Booking; doc: BookingDocument | null; pkgPdfUrl?: string }> = [];
    userBookings.forEach((b) => {
      const visibleDocs = (b.documents || []).filter((d) => d.visibleToTraveller !== false);
      const linkedPkg = packagesMap[b.itineraryId || b.packageId || ''];
      const hasItinerary = visibleDocs.some((d) => d.category === 'ITINERARY');

      visibleDocs.forEach((d) => list.push({ booking: b, doc: d }));
      if (!hasItinerary && linkedPkg?.itineraryPDF) {
        list.push({ booking: b, doc: null, pkgPdfUrl: linkedPkg.itineraryPDF });
      }
    });
    return list;
  }, [userBookings, packagesMap]);

  const firstName = useMemo(() => {
    const fullName = customer?.name || user?.displayName || '';
    return fullName.split(' ')[0] || 'Traveller';
  }, [customer?.name, user?.displayName]);

  // WhatsApp concierge trigger
  const handleWhatsAppContact = () => {
    const adminPhone = localStorage.getItem('nfa_admin_whatsapp') || '+919876543210';
    const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
    const ref = customer?.customerReference || 'NFA-TRAVEL';
    const text = encodeURIComponent(`Hello NO FIXED ADDRESS team,\nI'm reaching out from my account (${ref}) to speak with a travel specialist.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
        <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
          Loading your journeys...
        </span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-8 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture text-left">
      <SeoHead metadata={resolveStaticPageSEO('dashboard')} />
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── MAIN CONTENT AREA (8 Cols) ── */}
        <main className="lg:col-span-8 space-y-8">
          {/* Welcome Header */}
          <header className="border-b-4 border-[#121212] pb-6 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
              <Compass size={14} /> {completedTrips.length > 0 ? 'RETURNING TRAVELLER' : 'MY ACCOUNT'}
            </div>
            <h1 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase leading-tight text-[#121212]">
              Welcome back, <span className="text-[#9E1B1D]">{firstName}</span>.
            </h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {completedTrips.length > 0
                ? "Your completed journeys, travel documents, and custom trip planning in one place."
                : "Everything related to your journeys, enquiries and travel plans in one place."}
            </p>
          </header>

          {/* Account Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="border-2 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Customer Ref
              </span>
              <div className="font-mono font-black text-base sm:text-lg text-[#121212] truncate">
                {customer?.customerReference || 'NFA-C-PENDING'}
              </div>
            </div>

            <div className="border-2 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Active Enquiries
              </span>
              <div className="font-brand font-black text-2xl sm:text-3xl text-[#9E1B1D]">
                {activeEnquiries.length}
              </div>
            </div>

            <div className="border-2 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Upcoming Trips
              </span>
              <div className="font-brand font-black text-2xl sm:text-3xl text-[#F4BF4B] drop-shadow-[1px_1px_0px_#121212]">
                {upcomingTrips.length}
              </div>
            </div>

            <div className="border-2 border-[#121212] bg-white p-5 shadow-[4px_4px_0px_0px_#121212]">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Completed Trips
              </span>
              <div className="font-brand font-black text-2xl sm:text-3xl text-emerald-700">
                {completedTrips.length}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-[3px_3px_0px_0px_#9E1B1D]'
                    : 'bg-white text-[#121212] border-[#121212] hover:bg-[#F4BF4B]/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── 1. OVERVIEW TAB ── */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8">
              {/* ACTIVE TRAVEL / NEXT ACTION */}
              <div className="border-[4px] border-[#121212] bg-white p-6 sm:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D] flex items-center gap-2">
                    <Sparkles size={16} /> YOUR NEXT JOURNEY
                  </h4>
                  {upcomingTrips.length > 0 && (
                    <button
                      onClick={() => setActiveTab('TRIPS')}
                      className="text-[9px] font-black uppercase tracking-widest text-[#121212] hover:underline cursor-pointer"
                    >
                      View All Trips ({upcomingTrips.length}) &rarr;
                    </button>
                  )}
                </div>

                {nextJourney ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {nextJourney.bookingReference || nextJourney.id}
                        </span>
                        <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                          {nextJourney.itineraryTitle || nextJourney.destination || 'Expedition Journey'}
                        </h3>
                      </div>
                      {(() => {
                        const isConfirmed = nextJourney.status === 'CONFIRMED';
                        const label = isConfirmed ? 'Confirmed' : 'Preparing for your trip';
                        const style = isConfirmed
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300';
                        return (
                          <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${style}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Destination</span>
                        <span className="text-xs font-bold text-slate-900">📍 {nextJourney.destination || 'Global'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Travel Date</span>
                        <span className="text-xs font-bold text-slate-900">🗓️ {nextJourney.travelDate || 'Flexible / TBD'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Duration</span>
                        <span className="text-xs font-bold text-slate-900">{nextJourney.duration ? `${nextJourney.duration} Days` : 'Bespoke'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Travellers</span>
                        <span className="text-xs font-bold text-slate-900">👥 {nextJourney.numberOfTravelers || 1} Person(s)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => navigate(`/my-journey/${nextJourney.id}`)}
                        className="bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer"
                      >
                        <Compass size={14} /> OPEN MY JOURNEY
                      </button>
                      <button
                        onClick={() => setActiveTab('DOCUMENTS')}
                        className="bg-[#FCFBF7] text-[#121212] px-5 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#F4BF4B]/20 transition-colors cursor-pointer"
                      >
                        <FileText size={14} className="text-[#9E1B1D]" /> TRAVEL DOCUMENTS
                      </button>
                      <button
                        onClick={() => setSelectedBooking(nextJourney)}
                        className="bg-white text-slate-700 px-4 py-3 border-2 border-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Eye size={14} /> VIEW DETAILS
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                    <Compass size={36} className="mx-auto text-slate-300" />
                    <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                      NO UPCOMING JOURNEY
                    </h4>
                    <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your next journey will appear here once your travel plans are confirmed.
                    </p>
                    <Link
                      to="/packages"
                      className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-8 py-3.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B]"
                    >
                      EXPLORE JOURNEYS <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Latest Active Travel Request (Enquiry) */}
              {activeEnquiries.length > 0 && (
                <div className="border-[3px] border-[#121212] bg-[#FCFBF7] p-6 space-y-4 shadow-[4px_4px_0px_0px_#121212]">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D] flex items-center gap-1.5">
                      <Clock size={12} /> Active Travel Request
                    </span>
                    <button
                      onClick={() => setActiveTab('ENQUIRIES')}
                      className="text-[9px] font-black uppercase text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      View All Enquiries ({activeEnquiries.length})
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="font-mono text-xs text-slate-400 font-bold">
                        {activeEnquiries[0].enquiryId || activeEnquiries[0].id}
                      </span>
                      <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                        {activeEnquiries[0].itineraryTitle || activeEnquiries[0].destination || 'Custom Request'}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {ENQUIRY_STATUS_EXPLANATIONS[activeEnquiries[0].status] || 'Under review by our travel team.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedEnquiry(activeEnquiries[0])}
                      className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                    >
                      VIEW REQUEST
                    </button>
                  </div>
                </div>
              )}

              {/* Travel Team Support Card (E43) */}
              <div className="border-[3px] border-[#121212] bg-white p-6 space-y-4 shadow-[4px_4px_0px_0px_#121212]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-emerald-600" />
                    <h4 className="font-brand font-black text-sm uppercase text-[#121212] tracking-wider">
                      TRAVEL TEAM ASSISTANCE
                    </h4>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Direct Support
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {upcomingTrips.length > 0
                    ? "Need help with your upcoming journey or arrival arrangements? Your expedition team is available directly on WhatsApp and phone."
                    : "Have questions about exploring a destination or planning a bespoke expedition? Our travel specialists are ready to assist you."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleWhatsAppContact}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle size={13} /> CONTINUE ON WHATSAPP
                  </button>
                  {upcomingTrips.length > 0 ? (
                    <button
                      onClick={() => navigate(`/my-journey/${upcomingTrips[0].id}`)}
                      className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                    >
                      OPEN MY JOURNEY
                    </button>
                  ) : (
                    <Link
                      to="/packages"
                      className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                    >
                      PLAN YOUR JOURNEY
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── 2. MY ENQUIRIES TAB ── */}
          {activeTab === 'ENQUIRIES' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    MY ENQUIRIES ({enquiries.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Travel requests and custom itineraries currently in discussion with our team.
                  </p>
                </div>
              </div>

              {enquiries.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <Compass size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                    NO ACTIVE ENQUIRIES
                  </h4>
                  <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                    Your travel requests will appear here once you enquire about a journey.
                  </p>
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[3px_3px_0px_0px_#F4BF4B]"
                  >
                    EXPLORE JOURNEYS <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq) => {
                    const st = STATUS_STYLE[enq.status] || { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-800' };
                    const label = ENQUIRY_STATUS_LABELS[enq.status] || enq.status;
                    const explanation = ENQUIRY_STATUS_EXPLANATIONS[enq.status] || 'Under review by our travel team.';

                    return (
                      <div
                        key={enq.id}
                        className="p-6 border-2 border-[#121212] bg-[#FCFBF7] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[4px_4px_0px_0px_#121212] transition-all"
                      >
                        <div className="space-y-1.5 max-w-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {enq.enquiryId || enq.id}
                            </span>
                            <span className={`px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                              {label}
                            </span>
                          </div>

                          <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                            {enq.itineraryTitle || enq.destination || 'Expedition Request'}
                          </h4>

                          <p className="text-xs font-medium text-slate-600">
                            📍 {enq.destination} • 🗓️ Travel Date: {enq.trip?.travelDate || 'Flexible'} • 👥 {enq.trip?.totalTravellers || enq.trip?.adults || 1} Traveller(s)
                          </p>

                          <p className="text-xs font-serif italic text-slate-500">
                            "{explanation}"
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[3px_3px_0px_0px_#F4BF4B] cursor-pointer shrink-0"
                        >
                          VIEW DETAILS
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 3. MY TRIPS TAB (OFFICIAL BOOKINGS) ── */}
          {activeTab === 'TRIPS' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    MY TRIPS ({upcomingTrips.length})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Your confirmed and preparing expeditions.
                  </p>
                </div>
              </div>

              {upcomingTrips.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <Calendar size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                    NO UPCOMING JOURNEYS
                  </h4>
                  <p className="text-xs font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                    Your confirmed journeys will appear here once finalized with our travel team. Requests in discussion remain under <strong>MY ENQUIRIES</strong>.
                  </p>
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[3px_3px_0px_0px_#F4BF4B]"
                  >
                    EXPLORE JOURNEYS <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => {
                    const st = BOOKING_STATUS_STYLE[trip.status || 'PENDING_CONFIRMATION'] || { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' };
                    const label = BOOKING_STATUS_LABELS[trip.status || 'PENDING_CONFIRMATION'] || trip.status;

                    return (
                      <div
                        key={trip.id}
                        className="p-6 border-2 border-[#121212] bg-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[4px_4px_0px_0px_#121212]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-black text-[#9E1B1D]">
                              {trip.bookingReference || trip.id}
                            </span>
                            <span className={`px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                              {label}
                            </span>
                          </div>

                          <h4 className="font-brand font-black text-2xl uppercase text-[#121212]">
                            {trip.itineraryTitle || trip.destination || 'Expedition Journey'}
                          </h4>

                          <p className="text-xs font-bold text-slate-600">
                            📍 {trip.destination} • 🗓️ Travel Date: {trip.travelDate || 'TBD'} • 👥 {trip.numberOfTravelers || 1} Traveller(s)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => navigate(`/my-journey/${trip.id}`)}
                            className="bg-[#121212] text-[#F4BF4B] px-4 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                          >
                            OPEN MY JOURNEY
                          </button>
                          <button
                            onClick={() => setSelectedBooking(trip)}
                            className="bg-white text-[#121212] px-3.5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            VIEW TRIP DETAILS
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 4. TRAVEL HISTORY TAB ── */}
          {activeTab === 'HISTORY' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-6 sm:p-8 space-y-6">
              <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] border-b-2 border-slate-200 pb-4">
                TRAVEL HISTORY ({completedTrips.length})
              </h3>

              {completedTrips.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <CheckCircle2 size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                    NO COMPLETED JOURNEYS YET
                  </h4>
                  <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                    Your past journeys will appear here once your expedition is completed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedTrips.map((trip) => {
                    const story = getStoryForBooking(trip);
                    return (
                      <div
                        key={trip.id}
                        className="p-6 border-2 border-[#121212] bg-[#FCFBF7] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest block mb-0.5">
                            COMPLETED EXPEDITION
                          </span>
                          <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                            {trip.itineraryTitle || trip.destination}
                          </h4>
                          <p className="text-xs font-bold text-slate-600">
                            {trip.bookingReference || trip.id} • {trip.travelDate} • {trip.destination} • {trip.numberOfTravelers || 1} Traveller(s)
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {story && (
                            <Link
                              to={`/stories/${story.slug}`}
                              className="bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-2 font-black text-[9px] uppercase tracking-widest hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                            >
                              <BookOpen size={12} /> READ YOUR TRAVEL STORY
                            </Link>
                          )}
                          <button
                            onClick={() => navigate(`/my-journey/${trip.id}`)}
                            className="bg-[#121212] text-[#F4BF4B] px-4 py-2 border border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                          >
                            VIEW JOURNEY
                          </button>
                          <button
                            onClick={() => setSelectedBooking(trip)}
                            className="bg-white text-slate-700 px-4 py-2 border border-slate-300 rounded font-bold text-[9px] uppercase tracking-widest hover:bg-slate-100 cursor-pointer"
                          >
                            TRAVEL DOCUMENTS
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Plan Another Journey CTA (E44) */}
                  <div className="p-6 bg-[#121212] text-white border-2 border-[#121212] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                    <div>
                      <span className="text-[9px] font-black uppercase text-[#F4BF4B] tracking-widest block mb-0.5">
                        PLAN YOUR NEXT JOURNEY
                      </span>
                      <h4 className="font-brand font-black text-xl uppercase text-white">
                        READY TO DISCOVER SOMEWHERE NEW?
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 font-medium">
                        Tell us what you're thinking and our specialists will help shape your next custom journey.
                      </p>
                    </div>
                    <button
                      onClick={() => openEnquiry({ source: 'DASHBOARD_TRAVEL_HISTORY' })}
                      className="bg-[#F4BF4B] text-[#121212] px-6 py-3 font-black text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                    >
                      PLAN ANOTHER JOURNEY
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 5. TRAVEL DOCUMENTS TAB ── */}
          {activeTab === 'DOCUMENTS' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-4">
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    TRAVEL DOCUMENTS
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Itineraries, trip details, and briefing documents shared by our team.
                  </p>
                </div>
              </div>

              {allDocuments.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <FileText size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212]">
                    NO TRAVEL DOCUMENTS YET
                  </h4>
                  <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                    Your travel documents will appear here as they become available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allDocuments.map(({ booking, doc: d, pkgPdfUrl }, idx) => (
                    <div
                      key={d ? d.id : `pkg-${booking.id}-${idx}`}
                      className="p-6 border-2 border-[#121212] bg-[#FCFBF7] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-12 bg-[#9E1B1D] flex items-center justify-center shrink-0">
                          <FileText size={22} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-brand font-black text-lg uppercase text-[#121212]">
                            {d ? d.title : 'Itinerary PDF'}
                          </h4>
                          <p className="text-xs font-bold text-slate-500">
                            {d ? d.category || 'Travel Document' : 'Itinerary PDF'} &bull;{' '}
                            {booking.itineraryTitle || booking.destination || 'Your Journey'}
                          </p>
                          {d?.description && (
                            <p className="text-xs text-slate-600 mt-1">{d.description}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Booking Ref: {booking.bookingReference || booking.id}
                          </p>
                        </div>
                      </div>

                      <a
                        href={d ? d.fileUrl : pkgPdfUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] shrink-0"
                      >
                        <Download size={14} /> DOWNLOAD
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 6. PROFILE & PREFERENCES TAB ── */}
          {activeTab === 'PROFILE' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    PROFILE & PREFERENCES
                  </h3>
                  <p className="font-mono text-xs font-bold text-[#9E1B1D]">
                    CUSTOMER REF: {customer?.customerReference || 'NFA-C-PENDING'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[3px_3px_0px_0px_#F4BF4B] cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4 bg-[#FCFBF7] p-5 border-2 border-slate-200 rounded-xl">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <UserIcon size={14} className="text-[#9E1B1D]" /> Personal Records
                  </h4>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Full Name
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.name || user.displayName || 'Not Provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Email Address
                    </span>
                    <p className="text-sm font-bold text-slate-900">{customer?.email || user.email}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Phone Number
                    </span>
                    <p className="text-sm font-bold text-slate-900">{customer?.phone || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Postal Address / City
                    </span>
                    <p className="text-sm font-bold text-slate-900">{customer?.address || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="space-y-4 bg-[#FCFBF7] p-5 border-2 border-slate-200 rounded-xl">
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Heart size={14} className="text-[#9E1B1D]" /> Travel Preferences
                  </h4>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Travel Style
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {Array.isArray(customer?.preferences?.preferredTravelStyle)
                        ? customer.preferences.preferredTravelStyle.join(', ')
                        : (customer?.preferences?.preferredTravelStyle || (Array.isArray(customer?.preferences?.travelStyle) ? customer.preferences.travelStyle.join(', ') : customer?.preferences?.travelStyle) || 'Flexible')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Accommodation Style
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.preferences?.accommodationPreference || customer?.preferences?.accommodationType || 'Boutique & Luxury Lodges'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Dietary Requirements
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.preferences?.dietary || 'None specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
                      Accessibility Needs
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.preferences?.accessibility || 'None specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR (4 Cols) ── */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 bg-[#121212] text-[#FCFBF7] p-8 border-4 border-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B] space-y-8">
            <div className="text-center space-y-3">
              <div className="size-20 rounded-full border-4 border-[#F4BF4B] mx-auto bg-[#9E1B1D] text-white flex items-center justify-center font-brand font-black text-3xl shadow-md">
                {(customer?.name || user.email || 'A')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-white">
                  {customer?.name || user.displayName || 'Traveller'}
                </h3>
                <p className="font-mono text-xs font-bold text-[#F4BF4B] mt-0.5">
                  {customer?.customerReference || 'NFA-C-PENDING'}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-70">
                <span>Account Status</span>
                <span className="text-emerald-400">AUTHENTICATED</span>
              </div>
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-70">
                <span>Active Enquiries</span>
                <span>{activeEnquiries.length}</span>
              </div>
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-70">
                <span>Upcoming Trips</span>
                <span>{upcomingTrips.length}</span>
              </div>
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-70">
                <span>Completed Trips</span>
                <span>{completedTrips.length}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full bg-white text-[#121212] py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors cursor-pointer"
              >
                Edit Profile
              </button>

              <button
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] text-white py-3.5 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1EBE5D] transition-colors cursor-pointer"
              >
                <MessageCircle size={16} /> TALK TO TRAVEL TEAM
              </button>

              <Link
                to="/wishlist"
                className="w-full block text-center border-2 border-white/20 text-white py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        customer={customer}
        userId={user.uid}
      />

      {/* Customer Enquiry Details Modal */}
      <CustomerEnquiryModal
        isOpen={!!selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        enquiry={selectedEnquiry}
        packageMap={packagesMap}
      />

      {/* Customer Trip Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FCFBF7] rounded-2xl p-6 sm:p-8 max-w-lg w-full border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b-2 border-[#121212] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  YOUR TRIP DETAILS
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  {selectedBooking.itineraryTitle || selectedBooking.destination || 'Expedition Journey'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-white border-2 border-[#121212] rounded-xl">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block">Booking Reference</span>
                  <span className="font-mono font-bold text-sm text-[#121212]">
                    {selectedBooking.bookingReference || selectedBooking.id}
                  </span>
                </div>
                {(() => {
                  const st = BOOKING_STATUS_STYLE[selectedBooking.status || 'PENDING_CONFIRMATION'] || { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' };
                  const label = BOOKING_STATUS_LABELS[selectedBooking.status || 'PENDING_CONFIRMATION'] || selectedBooking.status;
                  return (
                    <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                      {label}
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-white border-2 border-[#121212] rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Travel Date</span>
                  <span className="font-bold text-slate-900">{selectedBooking.travelDate || 'Flexible / TBD'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Duration</span>
                  <span className="font-bold text-slate-900">{selectedBooking.duration ? `${selectedBooking.duration} Days` : 'Custom'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination</span>
                  <span className="font-bold text-slate-900">📍 {selectedBooking.destination || 'Global'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Travellers</span>
                  <span className="font-bold text-slate-900">👥 {selectedBooking.numberOfTravelers || 1} Person(s)</span>
                </div>
              </div>

              {/* TRAVELLER-SAFE TRIP INFORMATION SECTION */}
              {(selectedBooking.travellerNotes || selectedBooking.tripInstructions || (selectedBooking.travelPreferences && (selectedBooking.travelPreferences.accommodation || selectedBooking.travelPreferences.dietary || selectedBooking.travelPreferences.accessibility || selectedBooking.travelPreferences.interests))) && (
                <div className="space-y-3 p-4 bg-white border-2 border-[#121212] rounded-xl">
                  <h4 className="font-brand font-black text-xs uppercase tracking-wider text-[#121212] flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileText size={14} className="text-[#9E1B1D]" /> TRIP INFORMATION & PREFERENCES
                  </h4>

                  {selectedBooking.tripInstructions && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Important Instructions</span>
                      <p className="text-xs font-medium text-slate-800 bg-[#FCFBF7] p-2.5 rounded border border-slate-200 leading-relaxed whitespace-pre-wrap">
                        {selectedBooking.tripInstructions}
                      </p>
                    </div>
                  )}

                  {selectedBooking.travellerNotes && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">Traveller Notes</span>
                      <p className="text-xs font-medium text-slate-800 bg-[#FCFBF7] p-2.5 rounded border border-slate-200 leading-relaxed whitespace-pre-wrap">
                        {selectedBooking.travellerNotes}
                      </p>
                    </div>
                  )}

                  {selectedBooking.travelPreferences && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {selectedBooking.travelPreferences.accommodation && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Accommodation</span>
                          <span className="font-bold text-slate-800">{selectedBooking.travelPreferences.accommodation}</span>
                        </div>
                      )}
                      {selectedBooking.travelPreferences.dietary && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Dietary</span>
                          <span className="font-bold text-slate-800">{selectedBooking.travelPreferences.dietary}</span>
                        </div>
                      )}
                      {selectedBooking.travelPreferences.accessibility && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Accessibility</span>
                          <span className="font-bold text-slate-800">{selectedBooking.travelPreferences.accessibility}</span>
                        </div>
                      )}
                      {selectedBooking.travelPreferences.interests && (
                        <div>
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Special Interests</span>
                          <span className="font-bold text-slate-800">{selectedBooking.travelPreferences.interests}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action CTAs */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (selectedBooking?.id) {
                      navigate(`/my-journey/${selectedBooking.id}`);
                      setSelectedBooking(null);
                    }
                  }}
                  className="w-full bg-[#121212] text-[#F4BF4B] p-3.5 border-2 border-[#121212] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                >
                  <Compass size={16} /> OPEN MY JOURNEY (DAY-BY-DAY)
                </button>

                {/* Traveller-visible documents */}
                {(() => {
                  const travDocs = (selectedBooking.documents || []).filter((d: BookingDocument) => d.visibleToTraveller !== false);
                  const linkedPkg = packagesMap[selectedBooking.itineraryId || selectedBooking.packageId || ''];
                  const hasItineraryDoc = travDocs.some((d: BookingDocument) => d.category === 'ITINERARY');
                  const showPkgFallback = !hasItineraryDoc && linkedPkg?.itineraryPDF;

                  if (travDocs.length === 0 && !showPkgFallback) {
                    return (
                      <div className="p-3 bg-slate-100 border border-slate-300 rounded text-center text-xs font-medium text-slate-500">
                        No travel documents available yet. Your team will upload them after confirmation.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {travDocs.map((d: BookingDocument) => (
                        <a
                          key={d.id}
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white text-[#121212] p-3 border-2 border-[#121212] font-bold text-xs flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FileText size={14} className="shrink-0 text-[#9E1B1D]" />
                            <span className="truncate">{d.title}</span>
                          </span>
                          <Download size={14} className="shrink-0" />
                        </a>
                      ))}
                      {showPkgFallback && (
                        <a
                          href={linkedPkg.itineraryPDF}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white text-[#121212] p-3 border-2 border-[#121212] font-bold text-xs flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <FileText size={14} className="shrink-0 text-[#9E1B1D]" />
                            Itinerary PDF
                          </span>
                          <Download size={14} className="shrink-0" />
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};