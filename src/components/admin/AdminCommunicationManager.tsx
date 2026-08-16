import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  User,
  Compass,
  ArrowRight,
  ChevronRight,
  Sparkles,
  X,
  Plus,
  RefreshCw,
  Clock3,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import {
  EnquiryDocument,
  Booking,
  CustomerDocument,
  EnquiryActivity,
} from '../../types/database';
import {
  ENQUIRY_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
} from '../../utils/statusLabels';

interface AdminCommunicationManagerProps {
  enquiries: EnquiryDocument[];
  bookings: Booking[];
  customers: CustomerDocument[];
  initialFilter?: string;
  onOpenCustomer?: (customerId: string) => void;
  onOpenEnquiry?: (enquiry: EnquiryDocument) => void;
  onOpenBooking?: (booking: Booking) => void;
}

type FollowUpFilter = 'ALL' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'NO_FOLLOWUP';
type StageFilter = 'ALL' | 'ACTIVE_LEADS' | 'BOOKED_TRAVELLERS';

const COMMON_NEXT_ACTIONS = [
  'Confirm travel dates',
  'Discuss itinerary details',
  'Suggest accommodation options',
  'Confirm traveller preferences',
  'Discuss budget expectations',
  'Share tailored proposal',
  'Follow up on sent proposal',
  'Confirm booking details',
  'Conduct traveller briefing',
  'Review travel documents',
  'Other',
];

const CONTACT_METHODS = [
  { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
  { id: 'PHONE', label: 'Phone Call', icon: Phone },
  { id: 'EMAIL', label: 'Direct Email', icon: Mail },
  { id: 'IN_PERSON', label: 'In Person', icon: User },
  { id: 'OTHER', label: 'Other Channel', icon: Compass },
];

const CONTACT_RESULTS = [
  'Spoke with traveller',
  'Message sent',
  'No response / Missed call',
  'Traveller requested callback',
  'Traveller requested more information',
  'Traveller is ready to proceed',
  'Traveller is not ready yet',
  'Other',
];

export const AdminCommunicationManager: React.FC<AdminCommunicationManagerProps> = ({
  enquiries = [],
  bookings = [],
  customers = [],
  initialFilter = 'ALL',
  onOpenCustomer,
  onOpenEnquiry,
  onOpenBooking,
}) => {
  // ── Filters & Search ──
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpFilter>(
    (initialFilter as FollowUpFilter) || 'ALL'
  );
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // ── Record Contact Modal State ──
  const [recordingTarget, setRecordingTarget] = useState<EnquiryDocument | null>(null);
  const [contactMethod, setContactMethod] = useState<string>('WHATSAPP');
  const [contactResult, setContactResult] = useState<string>('Spoke with traveller');
  const [conversationNotes, setConversationNotes] = useState<string>('');
  const [nextActionInput, setNextActionInput] = useState<string>('Follow up on proposal');
  const [customNextAction, setCustomNextAction] = useState<string>('');
  const [followUpOption, setFollowUpOption] = useState<'TODAY' | 'TOMORROW' | '3_DAYS' | 'WEEK' | 'CUSTOM' | 'NONE'>('3_DAYS');
  const [customFollowUpDate, setCustomFollowUpDate] = useState<string>('');
  const [savingContact, setSavingContact] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Today Date String (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Helper to extract clean YYYY-MM-DD string from followUpAt
  const getFollowUpDateStr = (followUpAt: any): string | null => {
    if (!followUpAt) return null;
    if (typeof followUpAt === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(followUpAt)) {
        return followUpAt.split('T')[0];
      }
      const d = new Date(followUpAt);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      return null;
    }
    if (followUpAt.toDate && typeof followUpAt.toDate === 'function') {
      return followUpAt.toDate().toISOString().split('T')[0];
    }
    if (followUpAt.seconds) {
      return new Date(followUpAt.seconds * 1000).toISOString().split('T')[0];
    }
    return null;
  };

  // Helper to get relative follow-up label & urgency
  const getFollowUpUrgency = (dateStr: string | null) => {
    if (!dateStr) {
      return {
        label: 'No follow-up set',
        urgency: 'NONE' as const,
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
      };
    }

    if (dateStr === todayStr) {
      return {
        label: 'Due Today',
        urgency: 'TODAY' as const,
        bg: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      };
    }

    const todayDate = new Date(todayStr).getTime();
    const targetDate = new Date(dateStr).getTime();
    const diffDays = Math.round((targetDate - todayDate) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        label: `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`,
        urgency: 'OVERDUE' as const,
        bg: 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse',
      };
    }

    if (diffDays === 1) {
      return {
        label: 'Tomorrow',
        urgency: 'UPCOMING' as const,
        bg: 'bg-blue-100 text-blue-900 border-blue-200',
      };
    }

    if (diffDays <= 7) {
      return {
        label: `In ${diffDays} days`,
        urgency: 'UPCOMING' as const,
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
      };
    }

    return {
      label: new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      urgency: 'UPCOMING' as const,
      bg: 'bg-slate-100 text-slate-800 border-slate-200',
    };
  };

  // Map customers for lookup
  const customersMap = useMemo(() => {
    const map: Record<string, CustomerDocument> = {};
    customers.forEach((c) => {
      if (c.id) map[c.id] = c;
      if (c.customerId) map[c.customerId] = c;
      if (c.userId) map[c.userId] = c;
    });
    return map;
  }, [customers]);

  // Derived Follow-Up Items from Enquiries (active leads + booked travellers)
  const allFollowUpItems = useMemo(() => {
    return enquiries
      .filter((e) => e.status !== 'CLOSED')
      .map((e) => {
        const dateStr = getFollowUpDateStr(e.followUpAt);
        const urgencyInfo = getFollowUpUrgency(dateStr);
        const linkedCustomer =
          customersMap[e.customerId || ''] ||
          customersMap[e.traveller?.userId || ''] ||
          customers.find(
            (c) =>
              c.email &&
              e.traveller?.email &&
              c.email.toLowerCase() === e.traveller.email.toLowerCase()
          );

        const linkedBooking = bookings.find(
          (b) =>
            b.id === e.bookingId ||
            b.bookingReference === e.bookingId ||
            (b.customerId && b.customerId === linkedCustomer?.customerId)
        );

        return {
          enquiry: e,
          customer: linkedCustomer || null,
          booking: linkedBooking || null,
          followUpDateStr: dateStr,
          urgencyInfo,
          priority: e.priority || 'NORMAL',
        };
      });
  }, [enquiries, customers, bookings, customersMap, todayStr]);

  // Dynamic Summary Metrics
  const metrics = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let noFollowUp = 0;

    allFollowUpItems.forEach((item) => {
      if (item.urgencyInfo.urgency === 'TODAY') dueToday++;
      else if (item.urgencyInfo.urgency === 'OVERDUE') overdue++;
      else if (item.urgencyInfo.urgency === 'UPCOMING') upcoming++;
      else noFollowUp++;
    });

    return {
      dueToday,
      overdue,
      upcoming,
      noFollowUp,
      totalActive: allFollowUpItems.length,
    };
  }, [allFollowUpItems]);

  // Filtered & Sorted Queue
  const filteredQueue = useMemo(() => {
    return allFollowUpItems
      .filter((item) => {
        // 1. Follow-up Filter
        if (followUpFilter === 'DUE_TODAY' && item.urgencyInfo.urgency !== 'TODAY') return false;
        if (followUpFilter === 'OVERDUE' && item.urgencyInfo.urgency !== 'OVERDUE') return false;
        if (followUpFilter === 'UPCOMING' && item.urgencyInfo.urgency !== 'UPCOMING') return false;
        if (followUpFilter === 'NO_FOLLOWUP' && item.urgencyInfo.urgency !== 'NONE') return false;

        // 2. Stage Filter
        if (stageFilter === 'ACTIVE_LEADS' && item.enquiry.status === 'CONVERTED') return false;
        if (stageFilter === 'BOOKED_TRAVELLERS' && item.enquiry.status !== 'CONVERTED') return false;

        // 3. Priority Filter
        if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;

        // 4. Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = item.enquiry.traveller?.name?.toLowerCase() || '';
          const ref = (item.enquiry.enquiryId || item.enquiry.id || '').toLowerCase();
          const custRef = (item.customer?.customerReference || '').toLowerCase();
          const dest = (item.enquiry.destination || '').toLowerCase();
          const title = (item.enquiry.itineraryTitle || '').toLowerCase();

          if (
            !name.includes(q) &&
            !ref.includes(q) &&
            !custRef.includes(q) &&
            !dest.includes(q) &&
            !title.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Priority weight: URGENT (4) > HIGH (3) > NORMAL (2) > LOW (1)
        const priorityWeight = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        const pA = priorityWeight[a.priority as keyof typeof priorityWeight] || 2;
        const pB = priorityWeight[b.priority as keyof typeof priorityWeight] || 2;

        if (pA !== pB) return pB - pA;

        // Urgency weight: OVERDUE (3) > TODAY (2) > UPCOMING (1) > NONE (0)
        const urgencyWeight = { OVERDUE: 3, TODAY: 2, UPCOMING: 1, NONE: 0 };
        const uA = urgencyWeight[a.urgencyInfo.urgency];
        const uB = urgencyWeight[b.urgencyInfo.urgency];

        if (uA !== uB) return uB - uA;

        // Date sorting
        if (a.followUpDateStr && b.followUpDateStr) {
          return a.followUpDateStr.localeCompare(b.followUpDateStr);
        }
        return 0;
      });
  }, [allFollowUpItems, followUpFilter, stageFilter, priorityFilter, searchQuery]);

  // Derived Recent Contacts Stream across all enquiries
  const recentContactsStream = useMemo(() => {
    const list: Array<{
      enquiry: EnquiryDocument;
      activity: EnquiryActivity;
      date: Date;
    }> = [];

    enquiries.forEach((e) => {
      if (Array.isArray((e as any).activityHistory)) {
        (e as any).activityHistory.forEach((act: EnquiryActivity) => {
          if (
            act.type === 'TRAVELLER_CONTACTED' ||
            act.type === 'CONTACTED' ||
            act.type === 'WHATSAPP_OPENED' ||
            act.type === 'PHONE_INITIATED' ||
            act.type === 'EMAIL_OPENED' ||
            act.type === 'FOLLOW_UP_SET'
          ) {
            const time = (act.createdAt as any)?.toMillis
              ? (act.createdAt as any).toMillis()
              : new Date((act.createdAt as any) || 0).getTime();
            list.push({ enquiry: e, activity: act, date: new Date(time) });
          }
        });
      }
    });

    return list.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [enquiries]);

  // WhatsApp Action: Manual trigger with safe prefilled message
  const handleWhatsAppAction = (enq: EnquiryDocument) => {
    const phone = enq.traveller?.phone?.replace(/\D/g, '') || '';
    if (!phone) {
      alert('No valid phone number for this traveller.');
      return;
    }

    const name = enq.traveller?.name?.split(' ')[0] || 'there';
    const dest = enq.itineraryTitle || enq.destination || 'your journey';
    const date = enq.trip?.travelDate || 'your upcoming travel';
    const ref = enq.enquiryId || enq.id;

    const message = `Hello ${name}, this is the NO FIXED ADDRESS travel team regarding your ${dest} plans (${ref}). We wanted to follow up with you on your preferred dates (${date}). How can we assist you today?`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  // Open Record Contact Modal
  const handleOpenRecordContact = (enq: EnquiryDocument) => {
    setRecordingTarget(enq);
    setContactMethod('WHATSAPP');
    setContactResult('Spoke with traveller');
    setConversationNotes('');
    setNextActionInput(enq.nextAction || 'Discuss itinerary details');
    setCustomNextAction('');
    setFollowUpOption('3_DAYS');
    setCustomFollowUpDate('');
  };

  // Save Recorded Contact to Firestore
  const handleSaveContact = async () => {
    if (!recordingTarget?.id) return;
    setSavingContact(true);

    try {
      const finalNextAction =
        nextActionInput === 'Other' && customNextAction.trim()
          ? customNextAction.trim()
          : nextActionInput;

      // Calculate next followUpAt date string
      let calculatedFollowUpDate: string | null = null;
      const now = new Date();

      if (followUpOption === 'TODAY') {
        calculatedFollowUpDate = todayStr;
      } else if (followUpOption === 'TOMORROW') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        calculatedFollowUpDate = tomorrow.toISOString().split('T')[0];
      } else if (followUpOption === '3_DAYS') {
        const in3 = new Date(now);
        in3.setDate(in3.getDate() + 3);
        calculatedFollowUpDate = in3.toISOString().split('T')[0];
      } else if (followUpOption === 'WEEK') {
        const in7 = new Date(now);
        in7.setDate(in7.getDate() + 7);
        calculatedFollowUpDate = in7.toISOString().split('T')[0];
      } else if (followUpOption === 'CUSTOM' && customFollowUpDate) {
        calculatedFollowUpDate = customFollowUpDate;
      } else if (followUpOption === 'NONE') {
        calculatedFollowUpDate = null;
      }

      const activityEntry: EnquiryActivity = {
        enquiryId: recordingTarget.id,
        type: 'TRAVELLER_CONTACTED',
        actorId: 'admin',
        actorName: 'Travel Team Specialist',
        metadata: {
          channel: contactMethod,
          noteSnippet: conversationNotes.trim()
            ? `[${contactResult}] ${conversationNotes.trim()}`
            : contactResult,
          nextAction: finalNextAction,
          followUpAt: calculatedFollowUpDate || 'Cleared',
        },
        createdAt: Timestamp.now(),
      };

      const docRef = doc(db, 'Enquiries', recordingTarget.id);
      await updateDoc(docRef, {
        lastContactedAt: serverTimestamp(),
        lastContactedBy: 'Travel Team Specialist',
        lastContactedChannel: contactMethod as any,
        nextAction: finalNextAction,
        followUpAt: calculatedFollowUpDate,
        activityHistory: arrayUnion(activityEntry),
        updatedAt: serverTimestamp(),
      });

      setActionSuccess(`Contact recorded for ${recordingTarget.traveller?.name || 'traveller'}.`);
      setRecordingTarget(null);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Error recording contact:', err);
      alert('Unable to record contact. Please try again.');
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">
              Traveller Communication & Follow-up Workspace
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage traveller contact queues, conversation logs, follow-up scheduling, and next actions
          </p>
        </div>
      </div>

      {/* Dynamic Summary Cards (Clickable Quick Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFollowUpFilter('DUE_TODAY')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            followUpFilter === 'DUE_TODAY'
              ? 'bg-amber-500 text-[#121212] border-amber-600 font-bold shadow-md'
              : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Due Today</span>
            <Clock size={14} />
          </div>
          <span className="font-brand font-black text-2xl tracking-tight">{metrics.dueToday}</span>
        </button>

        <button
          onClick={() => setFollowUpFilter('OVERDUE')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            followUpFilter === 'OVERDUE'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md'
              : 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider">Overdue</span>
            <AlertCircle size={14} />
          </div>
          <span className="font-brand font-black text-2xl tracking-tight">{metrics.overdue}</span>
        </button>

        <button
          onClick={() => setFollowUpFilter('UPCOMING')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            followUpFilter === 'UPCOMING'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
            <Calendar size={14} />
          </div>
          <span className="font-brand font-black text-2xl tracking-tight">{metrics.upcoming}</span>
        </button>

        <button
          onClick={() => setFollowUpFilter('NO_FOLLOWUP')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            followUpFilter === 'NO_FOLLOWUP'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No Follow-up</span>
            <Clock3 size={14} />
          </div>
          <span className="font-brand font-black text-2xl tracking-tight">{metrics.noFollowUp}</span>
        </button>

        <button
          onClick={() => setFollowUpFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            followUpFilter === 'ALL'
              ? 'bg-[#121212] text-white border-[#121212] shadow-md'
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active</span>
            <Users size={14} />
          </div>
          <span className="font-brand font-black text-2xl tracking-tight">{metrics.totalActive}</span>
        </button>
      </div>

      {/* Main Grid: Follow-Up Queue (8 Cols) & Recent Contacts Stream (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── FOLLOW-UP QUEUE (8 Cols) ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Traveller name, reference, destination..."
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value as StageFilter)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Stage: All</option>
                  <option value="ACTIVE_LEADS">Active Leads Only</option>
                  <option value="BOOKED_TRAVELLERS">Booked Travellers Only</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Priority: All</option>
                  <option value="URGENT">Urgent Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards List */}
          {filteredQueue.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3 bg-white p-8">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <h4 className="font-brand font-black text-lg uppercase text-slate-900">
                NO FOLLOW-UPS IN THIS QUEUE
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active travellers match the selected filter. Change filters to see other enquiries or schedule follow-ups.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map(({ enquiry: enq, customer, booking, urgencyInfo, priority }) => {
                const isBooked = enq.status === 'CONVERTED';
                const statusLabel = isBooked ? 'Booked Traveller' : ENQUIRY_STATUS_LABELS[enq.status] || enq.status;

                return (
                  <div
                    key={enq.id}
                    className="p-5 bg-white border-2 border-slate-200 rounded-xl space-y-4 shadow-xs hover:border-slate-400 transition-all text-left"
                  >
                    {/* Top Row: References & Badges */}
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs text-[#9E1B1D]">
                          {enq.enquiryId || enq.id}
                        </span>
                        {customer?.customerReference && (
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {customer.customerReference}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-300">
                          {statusLabel}
                        </span>
                        {priority === 'URGENT' || priority === 'HIGH' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">
                            {priority} PRIORITY
                          </span>
                        ) : null}
                      </div>

                      {/* Urgency Badge */}
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase border ${urgencyInfo.bg}`}>
                        {urgencyInfo.label}
                      </span>
                    </div>

                    {/* Middle Row: Traveller & Journey Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                          Traveller
                        </span>
                        <h4 className="font-brand font-black text-lg uppercase text-slate-900">
                          {enq.traveller?.name || 'Traveller'}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">
                          {enq.traveller?.phone || 'No phone'} &bull; {enq.traveller?.email || 'No email'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">
                          Journey & Travel Date
                        </span>
                        <h4 className="font-brand font-black text-base uppercase text-slate-900">
                          {enq.itineraryTitle || enq.destination || 'Expedition'}
                        </h4>
                        <p className="text-xs text-slate-600">
                          📍 {enq.destination} &bull; 🗓️ {enq.trip?.travelDate || (enq as any).travelDate || 'Flexible'}
                        </p>
                      </div>
                    </div>

                    {/* Next Action Box */}
                    <div className="p-3 bg-[#FCFBF7] border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                          Next Action
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {enq.nextAction || 'Set next conversation action'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenRecordContact(enq)}
                        className="bg-[#121212] text-[#F4BF4B] px-3.5 py-1.5 rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        RECORD CONTACT
                      </button>
                    </div>

                    {/* Action Bar (One-click contact triggers) */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {enq.traveller?.phone ? (
                          <button
                            onClick={() => handleWhatsAppAction(enq)}
                            className="px-3 py-1.5 bg-[#25D366] text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#20bd5a] transition-colors cursor-pointer"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </button>
                        ) : null}

                        {enq.traveller?.phone ? (
                          <a
                            href={`tel:${enq.traveller.phone}`}
                            className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                          >
                            <Phone size={13} /> Call
                          </a>
                        ) : null}

                        {enq.traveller?.email ? (
                          <a
                            href={`mailto:${enq.traveller.email}?subject=${encodeURIComponent(
                              `NO FIXED ADDRESS — ${enq.itineraryTitle || enq.destination || 'Expedition'} (${enq.enquiryId || enq.id})`
                            )}`}
                            className="px-3 py-1.5 bg-slate-100 text-slate-800 border border-slate-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                          >
                            <Mail size={13} /> Email
                          </a>
                        ) : null}
                      </div>

                      {/* Workspace Jump Links */}
                      <div className="flex items-center gap-2 text-xs">
                        {customer && onOpenCustomer ? (
                          <button
                            onClick={() => onOpenCustomer(customer.id || customer.customerId)}
                            className="font-bold text-slate-600 hover:text-slate-900 underline text-[10px] uppercase cursor-pointer"
                          >
                            Customer 360 &rarr;
                          </button>
                        ) : null}

                        {onOpenEnquiry ? (
                          <button
                            onClick={() => onOpenEnquiry(enq)}
                            className="font-bold text-slate-600 hover:text-slate-900 underline text-[10px] uppercase cursor-pointer"
                          >
                            Lead Workspace &rarr;
                          </button>
                        ) : null}

                        {booking && onOpenBooking ? (
                          <button
                            onClick={() => onOpenBooking(booking)}
                            className="font-bold text-[#9E1B1D] hover:underline text-[10px] uppercase cursor-pointer"
                          >
                            Booking Workspace &rarr;
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RECENT CONTACTS STREAM (4 Cols) ── */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-2">
                <Clock3 size={16} className="text-[#9E1B1D]" /> RECENT CONVERSATIONS
              </h3>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Live Timeline
              </span>
            </div>

            {recentContactsStream.length === 0 ? (
              <div className="py-10 text-center text-xs font-medium text-slate-400 space-y-1">
                <MessageSquare size={24} className="mx-auto text-slate-300 mb-2" />
                <p>No recent contact logs recorded.</p>
                <p className="text-[10px]">Use "RECORD CONTACT" to log conversations.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-3">
                {recentContactsStream.map(({ enquiry: enq, activity: act, date }, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {enq.traveller?.name || 'Traveller'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                      <span>{act.metadata?.channel || 'Contact'}</span>
                      <span>&bull;</span>
                      <span className="text-[#9E1B1D]">{enq.enquiryId || enq.id}</span>
                    </div>

                    {act.metadata?.noteSnippet && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed italic">
                        "{act.metadata.noteSnippet}"
                      </p>
                    )}

                    {act.metadata?.nextAction && (
                      <p className="text-[10px] font-bold text-slate-600">
                        Next: {act.metadata.nextAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECORD TRAVELLER CONTACT MODAL ── */}
      {recordingTarget && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FCFBF7] rounded-2xl p-6 sm:p-8 max-w-lg w-full border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] space-y-6 text-left relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-[#121212] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  COMMUNICATION LOG
                </span>
                <h3 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  RECORD TRAVELLER CONTACT
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  {recordingTarget.traveller?.name} &bull; {recordingTarget.enquiryId || recordingTarget.id} &bull; {recordingTarget.destination}
                </p>
              </div>
              <button
                onClick={() => setRecordingTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* 1. Contact Method */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Contact Channel
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CONTACT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setContactMethod(m.id)}
                      className={`p-2 rounded-lg border text-center font-bold text-[10px] uppercase transition-all cursor-pointer ${
                        contactMethod === m.id
                          ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Contact Result */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Conversation Outcome
                </label>
                <select
                  value={contactResult}
                  onChange={(e) => setContactResult(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none cursor-pointer"
                >
                  {CONTACT_RESULTS.map((r, idx) => (
                    <option key={idx} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Conversation Notes */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Conversation Notes & Briefing
                </label>
                <textarea
                  rows={3}
                  value={conversationNotes}
                  onChange={(e) => setConversationNotes(e.target.value)}
                  placeholder="Record summary of traveller requirements, questions, or decisions..."
                  className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

              {/* 4. Next Action */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Next Action
                </label>
                <select
                  value={nextActionInput}
                  onChange={(e) => setNextActionInput(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none cursor-pointer mb-2"
                >
                  {COMMON_NEXT_ACTIONS.map((a, idx) => (
                    <option key={idx} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                {nextActionInput === 'Other' && (
                  <input
                    type="text"
                    value={customNextAction}
                    onChange={(e) => setCustomNextAction(e.target.value)}
                    placeholder="Enter custom next action..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none"
                  />
                )}
              </div>

              {/* 5. Next Follow-Up Scheduling */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Next Follow-up Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
                  {[
                    { id: 'TODAY', label: 'Today' },
                    { id: 'TOMORROW', label: 'Tomorrow' },
                    { id: '3_DAYS', label: 'In 3 Days' },
                    { id: 'WEEK', label: 'In 1 Week' },
                    { id: 'CUSTOM', label: 'Custom' },
                    { id: 'NONE', label: 'No Follow-up' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFollowUpOption(opt.id as any)}
                      className={`p-2 rounded border text-center font-bold text-[9px] uppercase transition-all cursor-pointer ${
                        followUpOption === opt.id
                          ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {followUpOption === 'CUSTOM' && (
                  <input
                    type="date"
                    value={customFollowUpDate}
                    onChange={(e) => setCustomFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecordingTarget(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveContact}
                  disabled={savingContact}
                  className="px-6 py-2.5 bg-[#121212] text-[#F4BF4B] rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingContact ? 'Saving...' : 'SAVE CONVERSATION'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
