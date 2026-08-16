import React, { useState, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  User,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  FileText,
  Building,
  Utensils,
  Accessibility,
  Info,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import {
  Booking,
  CustomerDocument,
  Package,
} from '../../types/database';

interface AdminTripPreparationManagerProps {
  bookings: Booking[];
  customers: CustomerDocument[];
  packages?: Package[];
  initialFilter?: string;
  onOpenBooking?: (booking: Booking) => void;
  onOpenCustomer?: (customerId: string) => void;
  onOpenPackage?: (packageId: string) => void;
  onOpenCommunication?: (booking: Booking) => void;
}

const CHECKLIST_CONFIG: Array<{
  key: keyof NonNullable<Booking['operationalChecklist']>;
  label: string;
  description: string;
  actionType: 'CUSTOMER' | 'BOOKING' | 'JOURNEY' | 'DOCS' | 'CONTACT';
}> = [
  { key: 'travellerDetailsVerified', label: '1. Traveller details verified', description: 'Names, passports, contact details confirmed', actionType: 'CUSTOMER' },
  { key: 'travelDatesVerified', label: '2. Travel dates verified', description: 'Check-in, checkout, duration alignment', actionType: 'BOOKING' },
  { key: 'itineraryReviewed', label: '3. Journey reviewed', description: 'Route, timings, joining points confirmed', actionType: 'JOURNEY' },
  { key: 'accommodationReviewed', label: '4. Accommodation reviewed', description: 'Stays, room categories, vouchers verified', actionType: 'BOOKING' },
  { key: 'specialRequirementsReviewed', label: '5. Special requirements reviewed', description: 'Dietary, mobility, special celebrations noted', actionType: 'BOOKING' },
  { key: 'travellerInstructionsPrepared', label: '6. Traveller instructions prepared', description: 'Packing, emergency contacts, local guidelines', actionType: 'BOOKING' },
  { key: 'documentsReady', label: '7. Travel documents ready', description: 'Traveller-visible itinerary PDF & vouchers uploaded', actionType: 'DOCS' },
  { key: 'travellerBriefed', label: '8. Traveller briefed', description: 'Pre-departure phone/WhatsApp consultation completed', actionType: 'CONTACT' },
  { key: 'finalConfirmationCompleted', label: '9. Final confirmation completed', description: 'All systems green, ready for departure', actionType: 'BOOKING' },
];

export const AdminTripPreparationManager: React.FC<AdminTripPreparationManagerProps> = ({
  bookings = [],
  customers = [],
  packages = [],
  initialFilter = 'ALL',
  onOpenBooking,
  onOpenCustomer,
  onOpenPackage,
  onOpenCommunication,
}) => {
  // ── State ──
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [timeFilter, setTimeFilter] = useState<'ALL' | '7' | '14' | '30' | 'LATER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Map customers for fast lookup
  const customersMap = useMemo(() => {
    const map: Record<string, CustomerDocument> = {};
    customers.forEach((c) => {
      if (c.id) map[c.id] = c;
      if (c.customerId) map[c.customerId] = c;
      if (c.userId) map[c.userId] = c;
    });
    return map;
  }, [customers]);

  // Packages map
  const packagesMap = useMemo(() => {
    const map: Record<string, Package> = {};
    packages.forEach((p) => {
      if (p.id) map[p.id] = p;
    });
    return map;
  }, [packages]);

  // Today Date String & Timestamp
  const now = useMemo(() => Date.now(), []);

  // Helper to calculate days until departure
  const getDaysUntilDeparture = (travelDate?: string): number | null => {
    if (!travelDate) return null;
    const tDate = new Date(travelDate).getTime();
    if (isNaN(tDate)) return null;
    return Math.round((tDate - now) / (1000 * 3600 * 24));
  };

  // Helper to calculate checklist progress
  const getChecklistCount = (b: Booking): number => {
    if (!b.operationalChecklist) return 0;
    return Object.values(b.operationalChecklist).filter((v) => v === true).length;
  };

  // Helper to check traveller visible documents
  const getTravellerVisibleDocs = (b: Booking) => {
    return (b.documents || []).filter((d) => d.visibleToTraveller !== false);
  };

  // Filter confirmed upcoming bookings
  const confirmedUpcomingBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bStatus = b.status || (b.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION');
      if (bStatus === 'CANCELLED' || b.bookingStatus === 'cancelled') return false;
      if (bStatus === 'COMPLETED' || b.bookingStatus === 'completed' || b.operationalStatus === 'TRIP_COMPLETED') return false;
      return true;
    });
  }, [bookings]);

  // ── Summary KPI Calculations ──
  const summaryKPIs = useMemo(() => {
    let tripsToPrepare = 0;
    let inPreparation = 0;
    let readyForTraveller = 0;
    let departingIn7Days = 0;
    let documentsNeeded = 0;
    let briefingsPending = 0;

    confirmedUpcomingBookings.forEach((b) => {
      const days = getDaysUntilDeparture(b.travelDate);
      const count = getChecklistCount(b);
      const visibleDocs = getTravellerVisibleDocs(b);
      const isBriefed = b.operationalChecklist?.travellerBriefed === true || b.operationalStatus === 'TRAVELLER_BRIEFED';
      const isReady = b.operationalStatus === 'READY' || (count === 9 && b.accommodationReadiness === 'READY');

      if (b.operationalStatus !== 'READY' && b.operationalStatus !== 'TRAVELLER_BRIEFED') {
        tripsToPrepare++;
      }
      if (b.operationalStatus === 'IN_PREPARATION' || (count > 0 && count < 9)) {
        inPreparation++;
      }
      if (isReady) {
        readyForTraveller++;
      }
      if (days !== null && days >= 0 && days <= 7) {
        departingIn7Days++;
      }
      if (visibleDocs.length === 0 && b.operationalChecklist?.documentsReady !== true) {
        documentsNeeded++;
      }
      if (!isBriefed) {
        briefingsPending++;
      }
    });

    return {
      tripsToPrepare,
      inPreparation,
      readyForTraveller,
      departingIn7Days,
      documentsNeeded,
      briefingsPending,
    };
  }, [confirmedUpcomingBookings, now]);

  // ── Filtered & Sorted Preparation Queue ──
  const filteredBookings = useMemo(() => {
    return confirmedUpcomingBookings
      .filter((b) => {
        const days = getDaysUntilDeparture(b.travelDate);
        const count = getChecklistCount(b);
        const visibleDocs = getTravellerVisibleDocs(b);
        const isBriefed = b.operationalChecklist?.travellerBriefed === true || b.operationalStatus === 'TRAVELLER_BRIEFED';
        const isReady = b.operationalStatus === 'READY' || (count === 9 && b.accommodationReadiness === 'READY');

        // 1. Summary Card Filter
        if (activeFilter === 'TRIPS_TO_PREPARE') {
          if (isReady || isBriefed) return false;
        } else if (activeFilter === 'IN_PREPARATION') {
          if (b.operationalStatus !== 'IN_PREPARATION' && (count === 0 || count === 9)) return false;
        } else if (activeFilter === 'READY_FOR_TRAVELLER') {
          if (!isReady) return false;
        } else if (activeFilter === 'DEPARTING_7_DAYS') {
          if (days === null || days < 0 || days > 7) return false;
        } else if (activeFilter === 'DOCUMENTS_NEEDED') {
          if (visibleDocs.length > 0 || b.operationalChecklist?.documentsReady === true) return false;
        } else if (activeFilter === 'BRIEFINGS_PENDING') {
          if (isBriefed) return false;
        } else if (activeFilter === 'NEEDS_ATTENTION') {
          const hasRisk = (days !== null && days <= 14 && count < 6) || !isBriefed || visibleDocs.length === 0;
          if (!hasRisk) return false;
        }

        // 2. Status Dropdown Filter
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'NOT_STARTED' && (b.operationalStatus !== 'NOT_STARTED' && count > 0)) return false;
          if (statusFilter === 'IN_PREPARATION' && b.operationalStatus !== 'IN_PREPARATION') return false;
          if (statusFilter === 'READY' && b.operationalStatus !== 'READY') return false;
          if (statusFilter === 'TRAVELLER_BRIEFED' && b.operationalStatus !== 'TRAVELLER_BRIEFED') return false;
        }

        // 3. Time Filter
        if (timeFilter !== 'ALL') {
          if (days === null) return false;
          if (timeFilter === '7' && (days < 0 || days > 7)) return false;
          if (timeFilter === '14' && (days < 0 || days > 14)) return false;
          if (timeFilter === '30' && (days < 0 || days > 30)) return false;
          if (timeFilter === 'LATER' && days <= 30) return false;
        }

        // 4. Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const pName = b.primaryTraveler?.firstName
            ? `${b.primaryTraveler.firstName} ${b.primaryTraveler.lastName || ''}`.toLowerCase()
            : '';
          const bRef = (b.bookingReference || b.id || '').toLowerCase();
          const journey = (b.itineraryTitle || '').toLowerCase();
          const dest = (b.destination || '').toLowerCase();
          const customer = customersMap[b.customerId || ''] || customersMap[b.userId || ''];
          const cName = (customer?.name || '').toLowerCase();
          const cRef = (customer?.customerReference || '').toLowerCase();

          if (
            !pName.includes(q) &&
            !bRef.includes(q) &&
            !journey.includes(q) &&
            !dest.includes(q) &&
            !cName.includes(q) &&
            !cRef.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Sort Priority:
        // 1. Departing tomorrow/soonest
        // 2. Prep incomplete
        // 3. Briefing pending
        // 4. Priority (URGENT -> HIGH -> NORMAL -> LOW)
        const daysA = getDaysUntilDeparture(a.travelDate) ?? 9999;
        const daysB = getDaysUntilDeparture(b.travelDate) ?? 9999;

        if (daysA !== daysB) {
          return daysA - daysB;
        }

        const countA = getChecklistCount(a);
        const countB = getChecklistCount(b);
        return countA - countB;
      });
  }, [
    confirmedUpcomingBookings,
    activeFilter,
    statusFilter,
    timeFilter,
    searchQuery,
    customersMap,
    now,
  ]);

  // ── Atomic Checklist Toggle Handler ──
  const handleToggleChecklist = async (
    bookingId: string,
    field: keyof NonNullable<Booking['operationalChecklist']>,
    currentValue: boolean | undefined
  ) => {
    setUpdatingField(`${bookingId}-${field}`);
    setActionError(null);

    try {
      const newValue = !currentValue;
      const updates: Record<string, any> = {
        [`operationalChecklist.${field}`]: newValue,
        updatedAt: serverTimestamp(),
      };

      // If updating checklist and operationalStatus is NOT_STARTED, move to IN_PREPARATION
      const targetBooking = bookings.find((b) => b.id === bookingId);
      if (
        targetBooking &&
        (!targetBooking.operationalStatus || targetBooking.operationalStatus === 'NOT_STARTED') &&
        newValue === true
      ) {
        updates.operationalStatus = 'IN_PREPARATION';
      }

      await updateDoc(doc(db, 'bookings', bookingId), updates);
      setActionSuccess('Trip checklist updated.');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      console.error('Error updating checklist:', err);
      setActionError('Failed to update checklist item. Please try again.');
    } finally {
      setUpdatingField(null);
    }
  };

  // ── Update Accommodation Readiness ──
  const handleSetAccommodationReadiness = async (
    bookingId: string,
    readiness: 'NOT_REVIEWED' | 'REVIEWED' | 'READY'
  ) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        accommodationReadiness: readiness,
        updatedAt: serverTimestamp(),
      });
      setActionSuccess(`Accommodation marked as ${readiness}.`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      console.error('Error updating accommodation readiness:', err);
      setActionError('Failed to update accommodation readiness.');
    }
  };

  // ── Explicit Status Transition: MARK READY FOR TRAVELLER ──
  const handleMarkReadyForTraveller = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        operationalStatus: 'READY',
        updatedAt: serverTimestamp(),
      });
      setActionSuccess('Booking explicitly marked READY FOR TRAVELLER.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error setting READY status:', err);
      setActionError('Failed to update trip readiness.');
    }
  };

  // ── Explicit Status Transition: MARK TRAVELLER BRIEFED ──
  const handleMarkTravellerBriefed = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        operationalStatus: 'TRAVELLER_BRIEFED',
        ['operationalChecklist.travellerBriefed']: true,
        updatedAt: serverTimestamp(),
      });
      setActionSuccess('Traveller marked BRIEFED and pre-departure consultation recorded.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error marking traveller briefed:', err);
      setActionError('Failed to mark traveller briefed.');
    }
  };

  // Helper for safe WhatsApp briefing trigger
  const buildBriefingWhatsAppUrl = (b: Booking, customer?: CustomerDocument | null) => {
    const phone = (b.primaryTraveler?.phone || customer?.phone || '').replace(/[^0-9+]/g, '');
    const name = b.primaryTraveler?.firstName || customer?.name || 'Traveller';
    const text = encodeURIComponent(
      `Hello ${name}, this is the NO FIXED ADDRESS Travel Team regarding your upcoming journey to ${b.destination || 'your destination'} (Ref: ${b.bookingReference || b.id}). We are completing your pre-departure briefing and finalizing your journey details.`
    );
    return `https://wa.me/${phone.replace('+', '')}?text=${text}`;
  };

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">
              Trip Preparation
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              <Compass size={12} className="text-blue-600" /> Operational Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prepare every confirmed journey before the traveller leaves.
          </p>
        </div>

        {actionSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-2">
            <Check size={14} className="text-emerald-600" /> {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="px-3 py-1.5 bg-rose-50 text-rose-900 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-600" /> {actionError}
          </div>
        )}
      </div>

      {/* Real-Time Summary KPI Cards (Clickable Filter Buttons) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <button
          onClick={() => setActiveFilter(activeFilter === 'TRIPS_TO_PREPARE' ? 'ALL' : 'TRIPS_TO_PREPARE')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'TRIPS_TO_PREPARE'
              ? 'bg-[#121212] text-[#F4BF4B] border-slate-900 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Trips To Prepare</span>
          <span className="font-brand font-black text-2xl">{summaryKPIs.tripsToPrepare}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'IN_PREPARATION' ? 'ALL' : 'IN_PREPARATION')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'IN_PREPARATION'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-blue-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">In Preparation</span>
          <span className="font-brand font-black text-2xl text-blue-900">{summaryKPIs.inPreparation}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'READY_FOR_TRAVELLER' ? 'ALL' : 'READY_FOR_TRAVELLER')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'READY_FOR_TRAVELLER'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-emerald-800 block mb-0.5">Ready For Traveller</span>
          <span className="font-brand font-black text-2xl text-emerald-900">{summaryKPIs.readyForTraveller}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'DEPARTING_7_DAYS' ? 'ALL' : 'DEPARTING_7_DAYS')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'DEPARTING_7_DAYS'
              ? 'bg-amber-600 text-white border-amber-700 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-amber-800 block mb-0.5">Departing In 7 Days</span>
          <span className="font-brand font-black text-2xl text-amber-900">{summaryKPIs.departingIn7Days}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'DOCUMENTS_NEEDED' ? 'ALL' : 'DOCUMENTS_NEEDED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'DOCUMENTS_NEEDED'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-rose-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-rose-800 block mb-0.5">Documents Needed</span>
          <span className="font-brand font-black text-2xl text-rose-900">{summaryKPIs.documentsNeeded}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'BRIEFINGS_PENDING' ? 'ALL' : 'BRIEFINGS_PENDING')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'BRIEFINGS_PENDING'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md font-bold'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-purple-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-purple-800 block mb-0.5">Briefings Pending</span>
          <span className="font-brand font-black text-2xl text-purple-900">{summaryKPIs.briefingsPending}</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters, Range */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search preparation queue by traveller, booking ref, destination, customer..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Filter: All Upcoming</option>
              <option value="NEEDS_ATTENTION">Needs Operational Attention</option>
              <option value="TRIPS_TO_PREPARE">Trips To Prepare</option>
              <option value="IN_PREPARATION">In Preparation</option>
              <option value="READY_FOR_TRAVELLER">Ready For Traveller</option>
              <option value="DEPARTING_7_DAYS">Departing in 7 Days</option>
              <option value="DOCUMENTS_NEEDED">Documents Needed</option>
              <option value="BRIEFINGS_PENDING">Briefings Pending</option>
            </select>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Departure: All Dates</option>
              <option value="7">Within 7 Days</option>
              <option value="14">Within 14 Days</option>
              <option value="30">Within 30 Days</option>
              <option value="LATER">30+ Days Away</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Operational Status: All</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PREPARATION">In Preparation</option>
              <option value="READY">Ready for Traveller</option>
              <option value="TRAVELLER_BRIEFED">Traveller Briefed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preparation Queue List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <Compass size={32} className="mx-auto text-slate-300 mb-2" />
            <h4 className="font-brand font-black text-base uppercase text-slate-700">
              No Trips Matching Criteria
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All confirmed journeys are fully aligned, or adjust the filter above to view other upcoming journeys.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const customer = customersMap[booking.customerId || ''] || customersMap[booking.userId || ''];
            const daysUntil = getDaysUntilDeparture(booking.travelDate);
            const checklistCount = getChecklistCount(booking);
            const visibleDocs = getTravellerVisibleDocs(booking);
            const isBriefed = booking.operationalChecklist?.travellerBriefed === true || booking.operationalStatus === 'TRAVELLER_BRIEFED';
            const isFullyReady = checklistCount === 9 && booking.accommodationReadiness === 'READY';
            const isExpanded = expandedBookingId === booking.id;

            // Urgency Badge
            let urgencyBadge: { label: string; bg: string; text: string } | null = null;
            if (daysUntil !== null) {
              if (daysUntil === 1) {
                urgencyBadge = { label: 'DEPARTURE TOMORROW', bg: 'bg-rose-600 text-white animate-pulse', text: 'text-white' };
              } else if (daysUntil <= 7 && daysUntil >= 0) {
                urgencyBadge = { label: `DEPARTURE IN ${daysUntil} DAYS`, bg: 'bg-rose-100 border border-rose-300 text-rose-900', text: 'text-rose-900' };
              } else if (daysUntil <= 14 && daysUntil > 7) {
                urgencyBadge = { label: `DEPARTURE IN ${daysUntil} DAYS`, bg: 'bg-amber-100 border border-amber-300 text-amber-900', text: 'text-amber-900' };
              }
            }

            // Attention Flags
            const attentionFlags: string[] = [];
            if (daysUntil !== null && daysUntil <= 14 && daysUntil >= 0 && checklistCount < 6) {
              attentionFlags.push('Preparation Needs Attention');
            }
            if (daysUntil !== null && daysUntil <= 7 && daysUntil >= 0 && !isBriefed) {
              attentionFlags.push('Briefing Still Pending');
            }
            if (visibleDocs.length === 0 && booking.operationalChecklist?.documentsReady !== true) {
              attentionFlags.push('Documents Still Needed');
            }

            return (
              <div
                key={booking.id}
                className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Main Card Header */}
                <div className="p-5 lg:p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Traveller & Journey Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs bg-slate-100 text-slate-900 px-2.5 py-0.5 rounded border border-slate-300">
                          {booking.bookingReference || booking.id}
                        </span>
                        {customer?.customerReference && (
                          <span className="font-mono text-xs text-slate-500 font-bold">
                            {customer.customerReference}
                          </span>
                        )}
                        {urgencyBadge && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${urgencyBadge.bg}`}>
                            {urgencyBadge.label}
                          </span>
                        )}
                      </div>

                      <h3 className="font-brand font-black text-xl uppercase text-slate-900 leading-tight">
                        {booking.primaryTraveler?.firstName
                          ? `${booking.primaryTraveler.firstName} ${booking.primaryTraveler.lastName || ''}`
                          : customer?.name || 'Valued Traveller'}
                      </h3>

                      <p className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{booking.itineraryTitle || 'Expedition'}</span>
                        &bull; <span>📍 {booking.destination || 'Global'}</span>
                        &bull; <span>🗓️ {booking.travelDate || 'Date TBD'}</span>
                        &bull; <span>⏳ {booking.duration || 'Duration TBD'}</span>
                        &bull; <span>👥 {booking.numberOfTravelers || 1} Travellers</span>
                      </p>
                    </div>

                    {/* Operational Summary Badges & Quick Action */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Operational Status Badge */}
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[120px]">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                          Preparation
                        </span>
                        <span className="font-brand font-black text-sm uppercase text-slate-900">
                          {booking.operationalStatus === 'READY'
                            ? 'READY FOR TRAVELLER'
                            : booking.operationalStatus === 'TRAVELLER_BRIEFED'
                            ? 'TRAVELLER BRIEFED'
                            : booking.operationalStatus === 'IN_PREPARATION'
                            ? 'IN PREPARATION'
                            : 'NOT STARTED'}
                        </span>
                      </div>

                      {/* Checklist Progress Ring/Counter */}
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[100px]">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                          Checklist
                        </span>
                        <span className="font-brand font-black text-sm text-blue-900">
                          {checklistCount} / 9 Complete
                        </span>
                      </div>

                      {/* Expand / Collapse Button */}
                      <button
                        onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                        className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#9E1B1D] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {isExpanded ? 'Hide Preparation' : 'Manage Preparation'}
                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Attention Warnings */}
                  {attentionFlags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {attentionFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 bg-rose-50 text-rose-900 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          <AlertTriangle size={12} className="text-rose-600 shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Readiness Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-[#FCFBF7] rounded border border-slate-200">
                      <Building size={14} className="text-slate-500" />
                      <span className="font-bold text-slate-700">Accommodation:</span>
                      <span className="font-black uppercase text-slate-900">
                        {booking.accommodationReadiness || 'NOT_REVIEWED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-[#FCFBF7] rounded border border-slate-200">
                      <FileText size={14} className="text-slate-500" />
                      <span className="font-bold text-slate-700">Documents:</span>
                      <span className="font-black uppercase text-slate-900">
                        {visibleDocs.length > 0 || booking.operationalChecklist?.documentsReady
                          ? `${visibleDocs.length} Ready`
                          : 'Needed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-[#FCFBF7] rounded border border-slate-200">
                      <MessageSquare size={14} className="text-slate-500" />
                      <span className="font-bold text-slate-700">Briefing:</span>
                      <span className="font-black uppercase text-slate-900">
                        {isBriefed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── EXPANDED PREPARATION WORKSPACE ── */}
                {isExpanded && (
                  <div className="bg-[#FCFBF7] border-t-2 border-slate-200 p-5 lg:p-6 space-y-6">
                    {/* 1. Trip Preparation Checklist */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                        <div>
                          <h4 className="font-brand font-black text-base uppercase text-slate-900">
                            Trip Preparation Checklist
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            Complete all 9 operational preparation steps prior to departure.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded">
                            {checklistCount} of 9 Complete
                          </span>
                        </div>
                      </div>

                      {/* Checklist Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CHECKLIST_CONFIG.map((item) => {
                          const isChecked = booking.operationalChecklist?.[item.key] === true;
                          const isUpdating = updatingField === `${booking.id}-${item.key}`;

                          return (
                            <div
                              key={item.key}
                              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                                isChecked
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : 'bg-white border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <button
                                onClick={() => handleToggleChecklist(booking.id, item.key, isChecked)}
                                disabled={isUpdating}
                                className={`mt-0.5 size-5 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  isChecked
                                    ? 'bg-emerald-600 border-emerald-700 text-white'
                                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                                }`}
                              >
                                {isChecked && <Check size={14} className="stroke-[3]" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-bold block leading-tight ${isChecked ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {item.description}
                                </span>

                                {/* Contextual Action Link */}
                                <div className="mt-2">
                                  {item.actionType === 'CUSTOMER' && onOpenCustomer && (
                                    <button
                                      onClick={() => onOpenCustomer(booking.customerId || booking.userId || '')}
                                      className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      Open Customer &rarr;
                                    </button>
                                  )}
                                  {item.actionType === 'BOOKING' && onOpenBooking && (
                                    <button
                                      onClick={() => onOpenBooking(booking)}
                                      className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      Open Booking Details &rarr;
                                    </button>
                                  )}
                                  {item.actionType === 'JOURNEY' && onOpenPackage && booking.packageId && (
                                    <button
                                      onClick={() => onOpenPackage(booking.packageId!)}
                                      className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      View Journey &rarr;
                                    </button>
                                  )}
                                  {item.actionType === 'DOCS' && onOpenBooking && (
                                    <button
                                      onClick={() => onOpenBooking(booking)}
                                      className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      Manage Documents &rarr;
                                    </button>
                                  )}
                                  {item.actionType === 'CONTACT' && onOpenCommunication && (
                                    <button
                                      onClick={() => onOpenCommunication(booking)}
                                      className="text-[9px] font-bold text-blue-700 hover:underline uppercase"
                                    >
                                      Contact Workspace &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Accommodation & Document Readiness Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Accommodation Readiness */}
                      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                            <Building size={16} className="text-[#9E1B1D]" /> Accommodation Readiness
                          </h5>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                            {booking.accommodationReadiness || 'NOT_REVIEWED'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Verify room reservations, check-in vouchers, and special stay requirements.
                        </p>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {(['NOT_REVIEWED', 'REVIEWED', 'READY'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => handleSetAccommodationReadiness(booking.id, lvl)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                (booking.accommodationReadiness || 'NOT_REVIEWED') === lvl
                                  ? 'bg-[#121212] text-[#F4BF4B] border border-slate-900 shadow-xs'
                                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Mark {lvl.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Travel Documents Readiness */}
                      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h5 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                            <FileText size={16} className="text-[#9E1B1D]" /> Travel Documents ({visibleDocs.length})
                          </h5>
                          {onOpenBooking && (
                            <button
                              onClick={() => onOpenBooking(booking)}
                              className="text-[10px] font-bold text-blue-700 hover:underline uppercase"
                            >
                              + Upload / Manage
                            </button>
                          )}
                        </div>

                        {visibleDocs.length === 0 ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-bold">
                            ⚠️ No traveller-visible documents uploaded yet. Ensure Itinerary PDF is attached.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {visibleDocs.slice(0, 3).map((d) => (
                              <div
                                key={d.id}
                                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs"
                              >
                                <span className="font-bold text-slate-900 truncate">{d.title}</span>
                                <a
                                  href={d.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-[#9E1B1D] hover:underline flex items-center gap-1 shrink-0"
                                >
                                  <Download size={11} /> Download
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Traveller Information & Instructions Preview */}
                    <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
                      <h5 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Info size={16} className="text-[#9E1B1D]" /> Traveller Preferences & Instructions Preview
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                            Dietary Requirements
                          </span>
                          <span className="font-bold text-slate-800">
                            {booking.travelPreferences?.dietary || customer?.preferences?.dietary || 'None specified'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                            Accessibility & Mobility
                          </span>
                          <span className="font-bold text-slate-800">
                            {booking.travelPreferences?.accessibility || customer?.preferences?.accessibility || 'Standard'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                            Special Requests
                          </span>
                          <span className="font-bold text-slate-800 truncate block">
                            {booking.specialRequests || 'None'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                            Trip Instructions
                          </span>
                          <span className="font-bold text-slate-800 truncate block">
                            {booking.tripInstructions || 'Standard guidelines prepared'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Traveller Briefing & Final Readiness Action Bar */}
                    <div className="p-5 bg-gradient-to-r from-[#121212] to-slate-900 text-white rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F4BF4B] block">
                          FINAL PRE-DEPARTURE READINESS
                        </span>
                        <h4 className="font-brand font-black text-lg uppercase text-white">
                          {isFullyReady ? 'All 9 Items & Stays Verified' : `${9 - checklistCount} Item(s) Incomplete`}
                        </h4>
                        <p className="text-xs text-slate-300">
                          {isBriefed
                            ? 'Traveller has been formally briefed for departure.'
                            : 'Perform traveller pre-departure briefing via WhatsApp / phone consultation.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Quick Briefing Triggers */}
                        <a
                          href={buildBriefingWhatsAppUrl(booking, customer)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-emerald-500 transition-colors"
                        >
                          <MessageSquare size={13} /> WhatsApp Briefing
                        </a>

                        {booking.primaryTraveler?.phone && (
                          <a
                            href={`tel:${booking.primaryTraveler.phone}`}
                            className="px-3 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-slate-700 transition-colors"
                          >
                            <Phone size={13} /> Call
                          </a>
                        )}

                        {!isBriefed && (
                          <button
                            onClick={() => handleMarkTravellerBriefed(booking.id)}
                            className="px-3.5 py-2 bg-amber-500 text-[#121212] rounded-lg font-black text-xs uppercase hover:bg-amber-400 transition-colors cursor-pointer"
                          >
                            Mark Briefed
                          </button>
                        )}

                        {booking.operationalStatus !== 'READY' && isFullyReady && (
                          <button
                            onClick={() => handleMarkReadyForTraveller(booking.id)}
                            className="px-4 py-2 bg-[#F4BF4B] text-[#121212] rounded-lg font-black text-xs uppercase hover:bg-white transition-colors cursor-pointer shadow-md"
                          >
                            MARK READY FOR TRAVELLER
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
