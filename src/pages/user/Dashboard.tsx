import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, db } from '../../services/firebaseService';
import { doc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { CustomerDocument, EnquiryDocument, Package, Booking, BookingDocument } from '../../types/database';
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
  EyeOff,
  CheckCircle2,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'OVERVIEW', label: 'Overview' },
  { id: 'ENQUIRIES', label: 'My Enquiries' },
  { id: 'TRIPS', label: 'My Trips' },
  { id: 'HISTORY', label: 'Travel History' },
  { id: 'DOCUMENTS', label: 'Documents' },
  { id: 'PROFILE', label: 'Profile & Preferences' },
];

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  NEW: { label: 'New', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
  CONTACTED: { label: 'Contacted', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
  IN_DISCUSSION: { label: 'In discussion', bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900' },
  CUSTOMIZATION: { label: 'Journey being customized', bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-900' },
  PROPOSAL_SENT: { label: 'Proposal sent', bg: 'bg-teal-100 border-teal-300', text: 'text-teal-900' },
  READY_TO_BOOK: { label: 'Ready to book', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CONVERTED: { label: 'Booked', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CLOSED: { label: 'Closed', bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700' },
};

const BOOKING_STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Draft', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
  PENDING_CONFIRMATION: { label: 'Awaiting confirmation', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-100 border-rose-300', text: 'text-rose-900' },
  COMPLETED: { label: 'Completed', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
};

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [customer, setCustomer] = useState<CustomerDocument | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [packagesMap, setPackagesMap] = useState<Record<string, Package>>({});
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
          // Gracefully fallback to basic profile from auth user
          setCustomer({
            id: user.uid,
            userId: user.uid,
            name: user.displayName || 'Authenticated Traveller',
            email: user.email || '',
            createdAt: new Date().toISOString(),
          } as Customer);
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
          .map(d => ({ id: d.id, ...d.data() } as Enquiry))
          .filter(e => e.customerId === user.uid || e.traveller?.userId === user.uid || e.email?.toLowerCase() === user.email?.toLowerCase() || e.traveller?.email?.toLowerCase() === user.email?.toLowerCase());

        // Sort by createdAt descending
        userEnquiries.sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        setEnquiries(userEnquiries);
      },
      (err) => {
        console.error('Error listening to user enquiries:', err);
      }
    );

    return () => unsubEnquiries();
  }, [user]);

  // 3. Realtime Listener for User Bookings (E6)
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubUserBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const docs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as Booking))
          .filter(b => b.userId === user.uid || b.customerId === user.uid || b.primaryTraveler?.email?.toLowerCase() === user.email?.toLowerCase());

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
        snapshot.docs.forEach(d => {
          map[d.id] = { id: d.id, ...d.data() } as Package;
        });
        setPackagesMap(map);
      },
      (err) => console.error('Error listening to packages:', err)
    );

    return () => unsubPkgs();
  }, []);

  // Filter Enquiries & Bookings
  const planningEnquiries = useMemo(() => {
    return enquiries.filter(e => e.status !== 'CLOSED' && e.status !== 'CONVERTED');
  }, [enquiries]);

  const activeTrips = useMemo(() => {
    return userBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  }, [userBookings]);

  // Truthful Travel History: Only COMPLETED bookings appear in history
  const travelHistory = useMemo(() => {
    return userBookings.filter(b => b.status === 'COMPLETED' || b.bookingStatus === 'completed');
  }, [userBookings]);

  const documentsList = useMemo(() => {
    return enquiries
      .filter(e => e.itineraryId && packagesMap[e.itineraryId]?.itineraryPDF)
      .map(e => ({
        enquiry: e,
        pkg: packagesMap[e.itineraryId!],
      }));
  }, [enquiries, packagesMap]);

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
        <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
          Loading your account...
        </span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-8 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture text-left">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ── MAIN CONTENT AREA ── */}
        <main className="lg:col-span-8 space-y-8">
          
          {/* Header */}
          <header className="border-b-4 border-[#121212] pb-8 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
              <Compass size={14} /> MY TRAVEL JOURNAL
            </div>
            <h1 className="font-brand font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-[#121212]">
              MY ACCOUNT & <br />
              <span className="text-[#F4BF4B] drop-shadow-[3px_3px_0px_#121212]">EXPEDITIONS.</span>
            </h1>
          </header>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${
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
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212]">
                  <div className="font-brand font-black text-3xl md:text-4xl text-[#9E1B1D] mb-1">
                    {enquiries.length}
                  </div>
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-500">Total Enquiries</p>
                </div>

                <div className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212]">
                  <div className="font-brand font-black text-3xl md:text-4xl text-[#F4BF4B] drop-shadow-[1px_1px_0px_#121212] mb-1">
                    {activeTrips.length}
                  </div>
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-500">Active Bookings</p>
                </div>

                <div className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212] col-span-2 md:col-span-1">
                  <div className="font-brand font-black text-3xl md:text-4xl text-[#121212] mb-1">
                    {travelHistory.length}
                  </div>
                  <p className="font-black text-[9px] uppercase tracking-widest text-slate-500">Completed Trips</p>
                </div>
              </div>

              {/* Latest Active Expedition Card */}
              <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
                <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D] flex items-center gap-2">
                    <Sparkles size={16} /> Latest Active Expedition
                  </h4>
                  {enquiries.length > 0 && (
                    <button
                      onClick={() => setActiveTab('ENQUIRIES')}
                      className="text-[9px] font-black uppercase tracking-widest text-[#121212] hover:underline"
                    >
                      View All Enquiries →
                    </button>
                  )}
                </div>

                {enquiries.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {enquiries[0].enquiryId || enquiries[0].id}
                        </span>
                        <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
                          {enquiries[0].itineraryTitle || enquiries[0].destination || 'Expedition Request'}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${STATUS_LABELS[enquiries[0].status]?.bg || 'bg-gray-100'} ${STATUS_LABELS[enquiries[0].status]?.text || 'text-gray-800'}`}>
                        {STATUS_LABELS[enquiries[0].status]?.label || enquiries[0].status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Destination</span>
                        <span className="text-xs font-bold text-slate-900">{enquiries[0].destination || 'Global'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Travel Date</span>
                        <span className="text-xs font-bold text-slate-900">{enquiries[0].trip?.travelDate || 'Flexible'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Travellers</span>
                        <span className="text-xs font-bold text-slate-900">{enquiries[0].trip?.totalTravellers || enquiries[0].trip?.adults || 1} Traveller(s)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEnquiry(enquiries[0])}
                      className="mt-4 bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B]"
                    >
                      <Eye size={14} /> VIEW ENQUIRY DETAILS
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                    <Compass size={40} className="mx-auto text-slate-300" />
                    <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                      NO ENQUIRIES YET
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      When you enquire about a journey, it will appear here.
                    </p>
                    <Link
                      to="/packages"
                      className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-8 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[4px_4px_0px_0px_#F4BF4B]"
                    >
                      Explore Journeys <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/packages"
                  className="border-[3px] border-[#121212] bg-white p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#F4BF4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <Compass size={20} className="text-[#9E1B1D] shrink-0" />
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-widest text-[#121212]">Browse All Journeys</h5>
                    <p className="text-[9px] font-bold uppercase text-slate-400">Explore curated itineraries</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-400" />
                </Link>

                <Link
                  to="/destinations"
                  className="border-[3px] border-[#121212] bg-white p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#F4BF4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <MapPin size={20} className="text-[#9E1B1D] shrink-0" />
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-widest text-[#121212]">Explore Destinations</h5>
                    <p className="text-[9px] font-bold uppercase text-slate-400">Discover target sectors</p>
                  </div>
                  <ArrowRight size={16} className="ml-auto text-slate-400" />
                </Link>
              </div>
            </div>
          )}

          {/* ── 2. MY ENQUIRIES TAB ── */}
          {activeTab === 'ENQUIRIES' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  MY ENQUIRIES ({enquiries.length})
                </h3>
              </div>

              {enquiries.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <Compass size={40} className="mx-auto text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                    NO ENQUIRIES YET
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    When you enquire about a journey, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map(enq => {
                    const st = STATUS_LABELS[enq.status] || { label: enq.status, bg: 'bg-gray-100', text: 'text-gray-800' };
                    return (
                      <div
                        key={enq.id}
                        className="p-6 border-2 border-[#121212] bg-[#FCFBF7] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[4px_4px_0px_0px_#121212] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {enq.enquiryId || enq.id}
                            </span>
                            <span className={`px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                              {st.label}
                            </span>
                          </div>

                          <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                            {enq.itineraryTitle || enq.destination || 'Expedition Request'}
                          </h4>

                          <p className="text-xs font-bold text-slate-600">
                            📍 {enq.destination} • 🗓️ Travel Date: {enq.trip?.travelDate || 'Flexible Date'} • 👥 {enq.trip?.totalTravellers || enq.trip?.adults || 1} Traveller(s)
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[3px_3px_0px_0px_#F4BF4B]"
                        >
                          [ VIEW DETAILS ]
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 3. MY TRIPS TAB (E6 BOOKING LIFECYCLE) ── */}
          {activeTab === 'TRIPS' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  MY TRIPS & OFFICIAL BOOKINGS ({activeTrips.length})
                </h3>
              </div>

              {activeTrips.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <Calendar size={40} className="mx-auto text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                    NO BOOKED TRIPS YET
                  </p>
                  <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
                    Your active enquiries remain under <strong>MY ENQUIRIES</strong> while in discussion. Official confirmed bookings will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTrips.map(trip => {
                    const st = BOOKING_STATUS_LABELS[trip.status || 'PENDING_CONFIRMATION'] || { label: trip.status || 'PENDING', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' };
                    return (
                      <div
                        key={trip.id}
                        className="p-6 border-2 border-[#121212] bg-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-[4px_4px_0px_0px_#121212]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-[#9E1B1D]">
                              {trip.bookingReference || trip.id}
                            </span>
                            <span className={`px-2.5 py-0.5 font-black text-[9px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                              {st.label}
                            </span>
                          </div>

                          <h4 className="font-brand font-black text-2xl uppercase text-[#121212]">
                            {trip.itineraryTitle || trip.destination || 'Expedition Journey'}
                          </h4>

                          <p className="text-xs font-bold text-slate-600">
                            📍 {trip.destination} • 🗓️ Travel Date: {trip.travelDate || 'TBD'} • 👥 {trip.numberOfTravelers || 1} Traveller(s)
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] font-black uppercase text-slate-400 block">Agreed Rate</span>
                            <span className="text-sm font-black text-[#9E1B1D]">
                              {trip.agreedPrice ? `₹${trip.agreedPrice.toLocaleString()}` : 'Standard Rate'}
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/my-journey/${trip.id}`)}
                            className="bg-[#121212] text-[#F4BF4B] px-4 py-2 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                          >
                            [ OPEN JOURNEY ]
                          </button>

                          <button
                            onClick={() => setSelectedBooking(trip)}
                            className="bg-white text-[#121212] px-3 py-2 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 transition-colors"
                          >
                            Details
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
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-8 space-y-6">
              <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                TRAVEL HISTORY ({travelHistory.length})
              </h3>

              {travelHistory.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                    NO TRAVEL HISTORY YET
                  </p>
                  <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                    Your journeys will appear here once a trip is completed/recorded.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {travelHistory.map(trip => (
                    <div key={trip.id} className="p-6 border-2 border-[#121212] bg-[#FCFBF7] rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest">
                          COMPLETED EXPEDITION
                        </span>
                        <h4 className="font-brand font-black text-xl uppercase text-[#121212]">
                          {trip.itineraryTitle || trip.destination}
                        </h4>
                        <p className="text-xs font-bold text-slate-600">
                          {trip.bookingReference || trip.id} • {trip.travelDate} • {trip.destination}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded font-black text-[9px] uppercase tracking-widest">
                          COMPLETED
                        </span>
                        <button
                          onClick={() => navigate(`/my-journey/${trip.id}`)}
                          className="bg-[#121212] text-[#F4BF4B] px-3 py-1.5 border border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
                        >
                          Journey
                        </button>
                        <button
                          onClick={() => setSelectedBooking(trip)}
                          className="bg-white text-slate-700 px-3 py-1.5 border border-slate-300 rounded font-bold text-[9px] uppercase tracking-widest hover:bg-slate-100"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 5. DOCUMENTS TAB ── */}
          {activeTab === 'DOCUMENTS' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-8 space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-4">
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  MY TRAVEL DOCUMENTS
                </h3>
                <span className="font-mono text-xs font-bold text-slate-400">
                  Managed by your expedition team
                </span>
              </div>

              {userBookings.length === 0 ? (
                <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                  <FileText size={40} className="mx-auto text-slate-300" />
                  <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                    NO DOCUMENTS AVAILABLE
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Official travel documents shared by your concierge team will appear here.
                  </p>
                </div>
              ) : (() => {
                // Build combined document list: booking-level docs + package PDF fallback
                const allDocs: Array<{ booking: Booking; doc: BookingDocument | null; pkgPdfUrl?: string }> = [];

                userBookings.forEach((booking) => {
                  const bookingDocs = (booking.documents || []).filter((d) => d.visibleToTraveller);
                  const linkedPkg = packagesMap[booking.itineraryId || booking.packageId || ''];
                  const hasItineraryDoc = bookingDocs.some((d) => d.category === 'ITINERARY');

                  // Add booking-level documents
                  bookingDocs.forEach((d) => {
                    allDocs.push({ booking, doc: d });
                  });

                  // Add package PDF fallback if no booking-level itinerary exists
                  if (!hasItineraryDoc && linkedPkg?.itineraryPDF) {
                    allDocs.push({ booking, doc: null, pkgPdfUrl: linkedPkg.itineraryPDF });
                  }
                });

                if (allDocs.length === 0) {
                  return (
                    <div className="py-16 text-center border-4 border-dashed border-[#121212]/10 space-y-3">
                      <Lock size={40} className="mx-auto text-slate-300" />
                      <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                        NO DOCUMENTS SHARED YET
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        Your concierge will upload your travel documents once your booking is confirmed.
                      </p>
                    </div>
                  );
                }

                const DOC_CATEGORY_LABELS: Record<string, string> = {
                  ITINERARY: 'Itinerary PDF',
                  BOOKING_CONFIRMATION: 'Booking Confirmation',
                  TRAVEL_VOUCHER: 'Travel Voucher',
                  ADDITIONAL: 'Additional Document',
                };

                return (
                  <div className="space-y-4">
                    {allDocs.map(({ booking, doc: d, pkgPdfUrl }, index) => (
                      <div
                        key={d ? d.id : `pkg-${booking.id}`}
                        className="p-6 border-2 border-[#121212] bg-[#FCFBF7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
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
                              {d ? DOC_CATEGORY_LABELS[d.category] || d.category : 'Itinerary PDF'}
                              {' '}&bull;{' '}
                              {booking.itineraryTitle || booking.destination || 'Your Journey'}
                            </p>
                            {d?.description && (
                              <p className="text-xs text-slate-500 mt-1">{d.description}</p>
                            )}
                            {!d && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Booking Ref: {booking.bookingReference || booking.id}</p>
                            )}
                          </div>
                        </div>

                        <a
                          href={d ? d.fileUrl : pkgPdfUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#121212] text-[#F4BF4B] px-6 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] shrink-0"
                        >
                          <Download size={14} /> VIEW / DOWNLOAD
                        </a>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── 6. PROFILE & PREFERENCES TAB ── */}
          {activeTab === 'PROFILE' && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] p-8 space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4">
                <div>
                  <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                    PROFILE & PREFERENCES
                  </h3>
                  <p className="font-mono text-xs font-bold text-[#9E1B1D]">
                    CUSTOMER ID: {customer?.customerReference || 'NFA-C-PENDING'}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[3px_3px_0px_0px_#F4BF4B]"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Personal Records</h4>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Full Name</span>
                    <p className="text-sm font-bold text-slate-900">{customer?.name || user.displayName || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address</span>
                    <p className="text-sm font-bold text-slate-900">{customer?.email || user.email}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Phone Number</span>
                    <p className="text-sm font-bold text-slate-900">{customer?.phone || 'Not Provided'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Postal Address</span>
                    <p className="text-sm font-bold text-slate-900">{customer?.address || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Travel Preferences</h4>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Special Interests & Preferences</span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.preferences?.preferences || customer?.preferences?.specialRequests || 'No preferences set yet'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Accommodation Preference</span>
                    <p className="text-sm font-bold text-slate-900">
                      {customer?.preferences?.accommodationType || 'No preference set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
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
                <span>Total Enquiries</span>
                <span>{enquiries.length}</span>
              </div>
              <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-70">
                <span>Active Bookings</span>
                <span>{activeTrips.length}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full bg-white text-[#121212] py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors"
              >
                Edit Profile
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

      {/* Customer Trip Details Modal (E7) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FCFBF7] rounded-2xl p-6 sm:p-8 max-w-lg w-full border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] space-y-6 text-left relative">
            <div className="flex items-start justify-between border-b-2 border-[#121212] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  MY TRIP DETAIL
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
                  const st = BOOKING_STATUS_LABELS[selectedBooking.status || 'PENDING_CONFIRMATION'] || { label: selectedBooking.status || 'PENDING', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' };
                  return (
                    <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest border ${st.bg} ${st.text}`}>
                      {st.label}
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

              {/* E8 TRAVELLER-SAFE TRIP INFORMATION SECTION */}
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
                          <span className="text-[9px] font-black uppercase text-slate-400 block">Dietary Requirements</span>
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
                  <Compass size={16} /> VIEW MY JOURNEY (DAY-BY-DAY)
                </button>

                {selectedBooking.itineraryId && (
                  <a
                    href={`/itinerary/${selectedBooking.itinerarySlug || selectedBooking.itineraryId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white text-[#121212] p-3.5 border-2 border-[#121212] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink size={16} /> PUBLIC ITINERARY PAGE
                  </a>
                )}

                {/* E12 TRAVEL DOCUMENTS */}
                {(() => {
                  const travDocs = (selectedBooking.documents || []).filter((d: BookingDocument) => d.visibleToTraveller);
                  const linkedPkg = packagesMap[selectedBooking.itineraryId || selectedBooking.packageId || ''];
                  const hasItineraryDoc = travDocs.some((d: BookingDocument) => d.category === 'ITINERARY');
                  const showPkgFallback = !hasItineraryDoc && linkedPkg?.itineraryPDF;
                  const DOC_LABELS: Record<string, string> = {
                    ITINERARY: 'Itinerary PDF',
                    BOOKING_CONFIRMATION: 'Booking Confirmation',
                    TRAVEL_VOUCHER: 'Travel Voucher',
                    ADDITIONAL: 'Additional Document',
                  };

                  if (travDocs.length === 0 && !showPkgFallback) {
                    return (
                      <div className="p-3 bg-slate-100 border border-slate-300 rounded text-center text-xs font-medium text-slate-500">
                        No travel documents available yet. Your concierge will upload them after confirmation.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {/* Booking-level documents */}
                      {travDocs.map((d: BookingDocument) => (
                        <a
                          key={d.id}
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white text-[#121212] p-3.5 border-2 border-[#121212] font-bold text-xs flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FileText size={14} className="shrink-0 text-[#9E1B1D]" />
                            <span className="truncate">{d.title}</span>
                          </span>
                          <Download size={14} className="shrink-0" />
                        </a>
                      ))}
                      {/* Package PDF fallback */}
                      {showPkgFallback && (
                        <a
                          href={linkedPkg.itineraryPDF}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-white text-[#121212] p-3.5 border-2 border-[#121212] font-bold text-xs flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors"
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