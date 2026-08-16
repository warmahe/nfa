import React, { useState, useMemo } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Compass,
  Search,
  Filter,
  User,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  EnquiryDocument,
  Booking,
  CustomerDocument,
  Package,
} from '../../types/database';
import {
  ENQUIRY_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
} from '../../utils/statusLabels';

interface AdminWorkflowManagerProps {
  enquiries: EnquiryDocument[];
  bookings: Booking[];
  customers: CustomerDocument[];
  packages?: Package[];
  initialFilter?: string;
  onOpenCustomer?: (customerId: string) => void;
  onOpenEnquiry?: (enquiry: EnquiryDocument) => void;
  onOpenBooking?: (booking: Booking) => void;
  onOpenPreparation?: (booking: Booking) => void;
  onOpenCommunication?: (enquiry?: EnquiryDocument) => void;
}

type WorkflowStageId =
  | 'NEW'
  | 'CONTACTED'
  | 'IN_DISCUSSION'
  | 'CUSTOMIZING'
  | 'PROPOSAL_SENT'
  | 'READY_TO_BOOK'
  | 'BOOKED'
  | 'PREPARING'
  | 'TRAVELLER_BRIEFED'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

interface WorkflowItem {
  id: string;
  type: 'ENQUIRY' | 'BOOKING';
  stage: WorkflowStageId;
  travellerName: string;
  customerRef?: string;
  enquiryRef?: string;
  bookingRef?: string;
  journeyTitle: string;
  destination: string;
  travelDate: string;
  travellerCount: number;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  nextFollowUp?: string | null;
  nextAction?: string;
  checklistProgress?: { completed: number; total: number };
  riskFlags: string[];
  rawEnquiry?: EnquiryDocument;
  rawBooking?: Booking;
  rawCustomer?: CustomerDocument | null;
}

const STAGES: Array<{ id: WorkflowStageId; label: string; bg: string; text: string; dotColor: string }> = [
  { id: 'NEW', label: 'New Enquiries', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900', dotColor: 'bg-amber-500' },
  { id: 'CONTACTED', label: 'Contacted', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900', dotColor: 'bg-blue-500' },
  { id: 'IN_DISCUSSION', label: 'In Discussion', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-900', dotColor: 'bg-purple-500' },
  { id: 'CUSTOMIZING', label: 'Customizing', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-900', dotColor: 'bg-indigo-500' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-900', dotColor: 'bg-teal-500' },
  { id: 'READY_TO_BOOK', label: 'Ready To Book', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-950', dotColor: 'bg-emerald-500' },
  { id: 'BOOKED', label: 'Booked / Pending', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-950', dotColor: 'bg-amber-600' },
  { id: 'PREPARING', label: 'Trip Preparation', bg: 'bg-blue-50 border-blue-300', text: 'text-blue-950', dotColor: 'bg-blue-600' },
  { id: 'TRAVELLER_BRIEFED', label: 'Traveller Briefed', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-950', dotColor: 'bg-emerald-600' },
];

export const AdminWorkflowManager: React.FC<AdminWorkflowManagerProps> = ({
  enquiries = [],
  bookings = [],
  customers = [],
  packages = [],
  initialFilter = 'ALL',
  onOpenCustomer,
  onOpenEnquiry,
  onOpenBooking,
  onOpenPreparation,
  onOpenCommunication,
}) => {
  // ── Filters & View State ──
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | '7' | '30' | '90'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeMobileStage, setActiveMobileStage] = useState<WorkflowStageId>('NEW');

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

  // Today Date String
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to extract follow-up string
  const getFollowUpStr = (followUpAt: any): string | null => {
    if (!followUpAt) return null;
    if (typeof followUpAt === 'string') return followUpAt.split('T')[0];
    if (followUpAt.toDate) return followUpAt.toDate().toISOString().split('T')[0];
    if (followUpAt.seconds) return new Date(followUpAt.seconds * 1000).toISOString().split('T')[0];
    return null;
  };

  // Helper to calculate checklist progress
  const getChecklistProgress = (b: Booking) => {
    if (!b.operationalChecklist) return { completed: 0, total: 9 };
    const values = Object.values(b.operationalChecklist);
    const completed = values.filter((v) => v === true).length;
    return { completed, total: 9 };
  };

  // Helper to generate risk flags for upcoming trips
  const getBookingRiskFlags = (b: Booking): string[] => {
    const flags: string[] = [];
    if (!b.travelDate) return flags;

    const bDate = new Date(b.travelDate).getTime();
    if (isNaN(bDate)) return flags;

    const now = Date.now();
    const daysUntil = Math.round((bDate - now) / (1000 * 3600 * 24));
    const checklist = getChecklistProgress(b);

    if (daysUntil <= 14 && daysUntil >= 0 && checklist.completed < 6) {
      flags.push('Trip Date Approaching (Prep Incomplete)');
    }
    if (daysUntil <= 7 && daysUntil >= 0 && b.operationalChecklist?.travellerBriefed !== true && b.operationalStatus !== 'TRAVELLER_BRIEFED') {
      flags.push('Traveller Briefing Pending');
    }
    if (b.operationalChecklist?.documentsReady !== true && (!b.documents || b.documents.length === 0)) {
      flags.push('Documents Needed');
    }

    return flags;
  };

  // ── Unified De-duplicated Workflow Items ──
  const allWorkflowItems = useMemo(() => {
    const items: WorkflowItem[] = [];

    // 1. Process Bookings first (highest lifecycle priority)
    const convertedEnquiryIds = new Set<string>();

    bookings.forEach((b) => {
      const linkedCustomer =
        customersMap[b.customerId || ''] ||
        customersMap[b.userId || ''] ||
        customers.find(
          (c) =>
            c.email &&
            b.primaryTraveler?.email &&
            c.email.toLowerCase() === b.primaryTraveler.email.toLowerCase()
        );

      let stage: WorkflowStageId = 'BOOKED';
      const bStatus = b.status || (b.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION');

      if (bStatus === 'COMPLETED' || b.bookingStatus === 'completed' || b.operationalStatus === 'TRIP_COMPLETED') {
        stage = 'COMPLETED';
      } else if (bStatus === 'CANCELLED' || b.bookingStatus === 'cancelled') {
        stage = 'CANCELLED';
      } else if (b.operationalStatus === 'TRAVELLER_BRIEFED') {
        stage = 'TRAVELLER_BRIEFED';
      } else if (bStatus === 'CONFIRMED') {
        stage = 'PREPARING';
      } else {
        stage = 'BOOKED';
      }

      if (b.enquiryId) convertedEnquiryIds.add(b.enquiryId);
      if (b.packageId) {
        // Also tag linked enquiries matching customer + package
      }

      const riskFlags = getBookingRiskFlags(b);
      const checklistProgress = getChecklistProgress(b);

      items.push({
        id: b.id,
        type: 'BOOKING',
        stage,
        travellerName:
          b.primaryTraveler?.firstName
            ? `${b.primaryTraveler.firstName} ${b.primaryTraveler.lastName || ''}`
            : linkedCustomer?.name || 'Valued Traveller',
        customerRef: linkedCustomer?.customerReference,
        enquiryRef: (b as any).enquiryReference || (b as any).enquiryId,
        bookingRef: b.bookingReference || b.id,
        journeyTitle: b.itineraryTitle || b.destination || 'Expedition Journey',
        destination: b.destination || 'Global',
        travelDate: b.travelDate || 'Date TBD',
        travellerCount: b.numberOfTravelers || b.travelers?.length || 1,
        priority: (b as any).priority || 'NORMAL',
        nextFollowUp: null,
        nextAction:
          stage === 'TRAVELLER_BRIEFED'
            ? 'Ready for departure'
            : stage === 'PREPARING'
            ? `${checklistProgress.completed} of 9 preparation steps done`
            : 'Awaiting confirmation',
        checklistProgress,
        riskFlags,
        rawBooking: b,
        rawCustomer: linkedCustomer,
      });
    });

    // 2. Process Enquiries (skip converted enquiries represented by bookings)
    enquiries.forEach((e) => {
      if (e.status === 'CONVERTED' || (e.bookingId && bookings.some((b) => b.id === e.bookingId || b.bookingReference === e.bookingId))) {
        return; // Already represented in booking cards
      }

      let stage: WorkflowStageId = 'NEW';
      if (e.status === 'CLOSED') stage = 'CLOSED';
      else if (e.status === 'READY_TO_BOOK') stage = 'READY_TO_BOOK';
      else if (e.status === 'PROPOSAL_SENT') stage = 'PROPOSAL_SENT';
      else if (e.status === 'CUSTOMIZATION') stage = 'CUSTOMIZING';
      else if (e.status === 'IN_DISCUSSION') stage = 'IN_DISCUSSION';
      else if (e.status === 'CONTACTED') stage = 'CONTACTED';
      else stage = 'NEW';

      const linkedCustomer =
        customersMap[e.customerId || ''] ||
        customersMap[e.traveller?.userId || ''] ||
        customers.find(
          (c) =>
            c.email &&
            e.traveller?.email &&
            c.email.toLowerCase() === e.traveller.email.toLowerCase()
        );

      const fDate = getFollowUpStr(e.followUpAt);
      const riskFlags: string[] = [];

      if (fDate && fDate < todayStr) {
        riskFlags.push('Follow-up Overdue');
      }
      if (e.status === 'PROPOSAL_SENT' && (e as any).proposalSentAt) {
        const pDate = (e as any).proposalSentAt.toDate ? (e as any).proposalSentAt.toDate().getTime() : new Date((e as any).proposalSentAt).getTime();
        const diffDays = Math.round((Date.now() - pDate) / (1000 * 3600 * 24));
        if (diffDays >= 3) {
          riskFlags.push('Proposal Needs Follow-up');
        }
      }

      items.push({
        id: e.id || e.enquiryId,
        type: 'ENQUIRY',
        stage,
        travellerName: e.traveller?.name || 'Explorer',
        customerRef: linkedCustomer?.customerReference,
        enquiryRef: e.enquiryId || e.id,
        bookingRef: undefined,
        journeyTitle: e.itineraryTitle || e.destination || 'Expedition Request',
        destination: e.destination || 'Global',
        travelDate: e.trip?.travelDate || (e as any).travelDate || 'Flexible',
        travellerCount: e.trip?.totalTravellers || e.trip?.adults || 1,
        priority: e.priority || 'NORMAL',
        nextFollowUp: fDate,
        nextAction: e.nextAction || 'Set next action',
        riskFlags,
        rawEnquiry: e,
        rawCustomer: linkedCustomer,
      });
    });

    return items;
  }, [bookings, enquiries, customersMap, customers, todayStr]);

  // ── Top Summary Metrics Cards ──
  const summaryCounts = useMemo(() => {
    let newEnquiries = 0;
    let needsContact = 0;
    let inDiscussion = 0;
    let proposalsToFollowUp = 0;
    let readyToBook = 0;
    let bookedJourneys = 0;
    let tripsToPrepare = 0;
    let travellersToBrief = 0;

    allWorkflowItems.forEach((item) => {
      if (item.stage === 'NEW') newEnquiries++;
      if (item.stage === 'CONTACTED') needsContact++;
      if (item.stage === 'IN_DISCUSSION' || item.stage === 'CUSTOMIZING') inDiscussion++;
      if (item.stage === 'PROPOSAL_SENT') proposalsToFollowUp++;
      if (item.stage === 'READY_TO_BOOK') readyToBook++;
      if (item.stage === 'BOOKED') bookedJourneys++;
      if (item.stage === 'PREPARING') tripsToPrepare++;
      if (item.stage === 'TRAVELLER_BRIEFED' || (item.stage === 'PREPARING' && item.riskFlags.includes('Traveller Briefing Pending'))) {
        travellersToBrief++;
      }
    });

    return {
      newEnquiries,
      needsContact,
      inDiscussion,
      proposalsToFollowUp,
      readyToBook,
      bookedJourneys,
      tripsToPrepare,
      travellersToBrief,
    };
  }, [allWorkflowItems]);

  // ── Filtered Workflow Items ──
  const filteredItems = useMemo(() => {
    return allWorkflowItems.filter((item) => {
      // 1. Stage Visibility Filters
      if (item.stage === 'CLOSED' && !showClosed) return false;
      if (item.stage === 'CANCELLED' && !showCancelled) return false;
      if (item.stage === 'COMPLETED' && !showCompleted) return false;

      // 2. Main Active Filters
      if (activeFilter === 'NEEDS_ATTENTION') {
        const hasRisk = item.riskFlags.length > 0;
        const isUrgent = item.priority === 'URGENT' || item.priority === 'HIGH';
        const isReadyToBook = item.stage === 'READY_TO_BOOK';
        if (!hasRisk && !isUrgent && !isReadyToBook) return false;
      } else if (activeFilter === 'ENQUIRIES') {
        if (item.type !== 'ENQUIRY') return false;
      } else if (activeFilter === 'READY_TO_BOOK') {
        if (item.stage !== 'READY_TO_BOOK') return false;
      } else if (activeFilter === 'BOOKINGS') {
        if (item.type !== 'BOOKING') return false;
      } else if (activeFilter === 'TRIPS_TO_PREPARE') {
        if (item.stage !== 'PREPARING') return false;
      } else if (activeFilter === 'TRAVELLERS_TO_BRIEF') {
        if (item.stage !== 'TRAVELLER_BRIEFED' && !item.riskFlags.includes('Traveller Briefing Pending')) return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

      // 4. Date Range Filter
      if (dateRangeFilter !== 'ALL' && item.travelDate && item.travelDate !== 'Flexible' && item.travelDate !== 'Date TBD') {
        const tDate = new Date(item.travelDate).getTime();
        if (!isNaN(tDate)) {
          const daysLimit = parseInt(dateRangeFilter, 10);
          const limitMs = daysLimit * 24 * 60 * 60 * 1000;
          const diff = tDate - Date.now();
          if (diff < 0 || diff > limitMs) return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = item.travellerName.toLowerCase();
        const custRef = (item.customerRef || '').toLowerCase();
        const enqRef = (item.enquiryRef || '').toLowerCase();
        const bookRef = (item.bookingRef || '').toLowerCase();
        const journey = item.journeyTitle.toLowerCase();
        const dest = item.destination.toLowerCase();

        if (
          !name.includes(q) &&
          !custRef.includes(q) &&
          !enqRef.includes(q) &&
          !bookRef.includes(q) &&
          !journey.includes(q) &&
          !dest.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    allWorkflowItems,
    activeFilter,
    priorityFilter,
    dateRangeFilter,
    searchQuery,
    showClosed,
    showCancelled,
    showCompleted,
  ]);

  // Group items by stage for column rendering
  const stageColumns = useMemo(() => {
    const map: Record<WorkflowStageId, WorkflowItem[]> = {
      NEW: [],
      CONTACTED: [],
      IN_DISCUSSION: [],
      CUSTOMIZING: [],
      PROPOSAL_SENT: [],
      READY_TO_BOOK: [],
      BOOKED: [],
      PREPARING: [],
      TRAVELLER_BRIEFED: [],
      COMPLETED: [],
      CLOSED: [],
      CANCELLED: [],
    };

    filteredItems.forEach((item) => {
      if (map[item.stage]) {
        map[item.stage].push(item);
      }
    });

    return map;
  }, [filteredItems]);

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">
              Traveller Workflow
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live • 9 Stages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            See where each traveller is in their journey from first enquiry to completed trip.
          </p>
        </div>
      </div>

      {/* Dynamic Summary Cards Grid (Clickable Filter Buttons) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => setActiveFilter(activeFilter === 'NEW' ? 'ALL' : 'NEW')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'NEW'
              ? 'bg-amber-500 text-[#121212] border-amber-600 font-bold shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">New Enquiries</span>
          <span className="font-brand font-black text-xl text-amber-900">{summaryCounts.newEnquiries}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'CONTACTED' ? 'ALL' : 'CONTACTED')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'CONTACTED'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-blue-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Needs Contact</span>
          <span className="font-brand font-black text-xl text-blue-900">{summaryCounts.needsContact}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'IN_DISCUSSION' ? 'ALL' : 'IN_DISCUSSION')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'IN_DISCUSSION'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-purple-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">In Discussion</span>
          <span className="font-brand font-black text-xl text-purple-900">{summaryCounts.inDiscussion}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'PROPOSAL_SENT' ? 'ALL' : 'PROPOSAL_SENT')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'PROPOSAL_SENT'
              ? 'bg-teal-600 text-white border-teal-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-teal-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Proposals</span>
          <span className="font-brand font-black text-xl text-teal-900">{summaryCounts.proposalsToFollowUp}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'READY_TO_BOOK' ? 'ALL' : 'READY_TO_BOOK')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'READY_TO_BOOK'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-emerald-800 block mb-0.5">Ready To Book</span>
          <span className="font-brand font-black text-xl text-emerald-900">{summaryCounts.readyToBook}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'BOOKED' ? 'ALL' : 'BOOKED')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'BOOKED'
              ? 'bg-amber-600 text-white border-amber-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-amber-800 block mb-0.5">Booked Trips</span>
          <span className="font-brand font-black text-xl text-amber-900">{summaryCounts.bookedJourneys}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'TRIPS_TO_PREPARE' ? 'ALL' : 'TRIPS_TO_PREPARE')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'TRIPS_TO_PREPARE'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-blue-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-blue-800 block mb-0.5">To Prepare</span>
          <span className="font-brand font-black text-xl text-blue-900">{summaryCounts.tripsToPrepare}</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'TRAVELLERS_TO_BRIEF' ? 'ALL' : 'TRAVELLERS_TO_BRIEF')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'TRAVELLERS_TO_BRIEF'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[9px] font-black uppercase text-emerald-800 block mb-0.5">Briefings</span>
          <span className="font-brand font-black text-xl text-emerald-900">{summaryCounts.travellersToBrief}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflow by traveller name, customer ref, booking ref, destination..."
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
              <option value="ALL">Filter: All Active</option>
              <option value="NEEDS_ATTENTION">Needs Attention Today</option>
              <option value="ENQUIRIES">Enquiries Only</option>
              <option value="READY_TO_BOOK">Ready To Book</option>
              <option value="BOOKINGS">Bookings Only</option>
              <option value="TRIPS_TO_PREPARE">Trips To Prepare</option>
              <option value="TRAVELLERS_TO_BRIEF">Travellers To Brief</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Priority: All</option>
              <option value="URGENT">Urgent Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">Travel: Any Date</option>
              <option value="7">Next 7 Days</option>
              <option value="30">Next 30 Days</option>
              <option value="90">Next 90 Days</option>
            </select>
          </div>
        </div>

        {/* Toggles for Historical Stages */}
        <div className="flex items-center gap-4 pt-1 text-xs border-t border-slate-100 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded text-[#121212]"
            />
            Show Completed Trips
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
              className="rounded text-[#121212]"
            />
            Show Closed Enquiries
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
              className="rounded text-[#121212]"
            />
            Show Cancelled Bookings
          </label>
        </div>
      </div>

      {/* ── MOBILE / TABLET STAGE SELECTOR TABS ── */}
      <div className="lg:hidden flex overflow-x-auto gap-1 border-b border-slate-200 pb-2">
        {STAGES.map((s) => {
          const count = stageColumns[s.id]?.length || 0;
          return (
            <button
              key={s.id}
              onClick={() => setActiveMobileStage(s.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeMobileStage === s.id
                  ? 'bg-[#121212] text-[#F4BF4B]'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <span className={`size-2 rounded-full ${s.dotColor}`}></span>
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── WORKFLOW KANBAN BOARD ── */}
      <div className="hidden lg:flex gap-3 overflow-x-auto pb-6 min-h-[600px]">
        {STAGES.map((stage) => {
          const items = stageColumns[stage.id] || [];

          return (
            <div
              key={stage.id}
              className="w-[300px] shrink-0 bg-[#FCFBF7] border-2 border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-xs"
            >
              {/* Stage Header */}
              <div className={`p-3.5 border-b-2 flex items-center justify-between ${stage.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${stage.dotColor}`}></span>
                  <h4 className={`font-brand font-black text-xs uppercase tracking-wider ${stage.text}`}>
                    {stage.label}
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white/80 rounded-full border border-slate-300">
                  {items.length}
                </span>
              </div>

              {/* Stage Cards List */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-xs font-bold uppercase text-slate-300 border-2 border-dashed border-slate-200 rounded-xl">
                    Empty
                  </div>
                ) : (
                  items.map((item) => (
                    <WorkflowCard
                      key={item.id}
                      item={item}
                      onOpenCustomer={onOpenCustomer}
                      onOpenEnquiry={onOpenEnquiry}
                      onOpenBooking={onOpenBooking}
                      onOpenPreparation={onOpenPreparation}
                      onOpenCommunication={onOpenCommunication}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MOBILE / TABLET SINGLE COLUMN VIEW ── */}
      <div className="lg:hidden space-y-3">
        {(() => {
          const items = stageColumns[activeMobileStage] || [];
          if (items.length === 0) {
            return (
              <div className="py-12 text-center text-xs font-bold uppercase text-slate-400 bg-white border border-slate-200 rounded-xl">
                No travellers currently in this stage.
              </div>
            );
          }
          return items.map((item) => (
            <WorkflowCard
              key={item.id}
              item={item}
              onOpenCustomer={onOpenCustomer}
              onOpenEnquiry={onOpenEnquiry}
              onOpenBooking={onOpenBooking}
              onOpenPreparation={onOpenPreparation}
              onOpenCommunication={onOpenCommunication}
            />
          ));
        })()}
      </div>
    </div>
  );
};

interface WorkflowCardProps {
  item: WorkflowItem;
  onOpenCustomer?: (customerId: string) => void;
  onOpenEnquiry?: (enquiry: EnquiryDocument) => void;
  onOpenBooking?: (booking: Booking) => void;
  onOpenPreparation?: (booking: Booking) => void;
  onOpenCommunication?: (enquiry?: EnquiryDocument) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  item,
  onOpenCustomer,
  onOpenEnquiry,
  onOpenBooking,
  onOpenPreparation,
  onOpenCommunication,
}) => {
  return (
    <div className="p-4 bg-white border-2 border-[#121212] rounded-xl space-y-3 text-left shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] transition-all">
      {/* Top Header: Name & Priority */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h5 className="font-brand font-black text-sm uppercase text-slate-900 leading-tight">
            {item.travellerName}
          </h5>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 font-bold mt-0.5">
            {item.customerRef && <span>{item.customerRef}</span>}
            {item.bookingRef ? (
              <span className="text-[#9E1B1D]">{item.bookingRef}</span>
            ) : item.enquiryRef ? (
              <span className="text-[#9E1B1D]">{item.enquiryRef}</span>
            ) : null}
          </div>
        </div>

        {item.priority === 'URGENT' || item.priority === 'HIGH' ? (
          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 text-[8px] font-black uppercase rounded shrink-0">
            {item.priority}
          </span>
        ) : null}
      </div>

      {/* Journey & Travel Details */}
      <div className="space-y-1 text-xs">
        <h6 className="font-bold text-slate-900 truncate">
          {item.journeyTitle}
        </h6>
        <p className="text-slate-500 text-[11px]">
          📍 {item.destination} &bull; 🗓️ {item.travelDate}
        </p>
      </div>

      {/* Operational Checklist / Next Action Box */}
      {item.checklistProgress && item.type === 'BOOKING' ? (
        <div className="p-2 bg-[#FCFBF7] rounded border border-slate-200 text-[11px] space-y-1">
          <div className="flex justify-between items-center text-[10px] font-black uppercase">
            <span className="text-slate-400">Prep Checklist</span>
            <span className="text-blue-900">{item.checklistProgress.completed} / {item.checklistProgress.total}</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#121212] h-full transition-all"
              style={{ width: `${(item.checklistProgress.completed / item.checklistProgress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : item.nextAction ? (
        <div className="p-2 bg-[#FCFBF7] rounded border border-slate-200 text-[11px]">
          <span className="text-[9px] font-black uppercase text-slate-400 block">Next Action</span>
          <span className="font-bold text-slate-900 block truncate">{item.nextAction}</span>
        </div>
      ) : null}

      {/* Risk Flags */}
      {item.riskFlags.length > 0 && (
        <div className="space-y-1">
          {item.riskFlags.map((flag, idx) => (
            <div
              key={idx}
              className="px-2 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 text-[9px] font-bold rounded flex items-center gap-1"
            >
              <AlertCircle size={10} className="text-rose-600 shrink-0" />
              <span className="truncate">{flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contextual Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {item.type === 'ENQUIRY' && item.rawEnquiry && onOpenEnquiry && (
            <button
              onClick={() => onOpenEnquiry(item.rawEnquiry!)}
              className="px-2.5 py-1 bg-[#121212] text-[#F4BF4B] font-black text-[9px] uppercase rounded hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            >
              Open Lead
            </button>
          )}

          {item.type === 'BOOKING' && item.rawBooking && onOpenBooking && (
            <button
              onClick={() => onOpenBooking(item.rawBooking!)}
              className="px-2.5 py-1 bg-[#121212] text-[#F4BF4B] font-black text-[9px] uppercase rounded hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            >
              Open Booking
            </button>
          )}

          {item.type === 'BOOKING' && item.rawBooking && onOpenPreparation && (
            <button
              onClick={() => onOpenPreparation(item.rawBooking!)}
              className="px-2 py-1 bg-blue-50 text-blue-900 border border-blue-200 font-bold text-[9px] uppercase rounded hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Prep
            </button>
          )}

          {onOpenCommunication && item.rawEnquiry && (
            <button
              onClick={() => onOpenCommunication(item.rawEnquiry)}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              title="Contact / Follow-up"
            >
              <MessageSquare size={13} />
            </button>
          )}
        </div>

        {item.rawCustomer && onOpenCustomer && (
          <button
            onClick={() => onOpenCustomer(item.rawCustomer!.id || item.rawCustomer!.customerId)}
            className="text-[9px] font-bold text-slate-500 hover:text-slate-900 underline uppercase cursor-pointer"
          >
            Customer &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
