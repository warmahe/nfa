import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell, Check, AlertCircle, Clock, Calendar, Compass, Users,
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck,
  Filter, CheckSquare, RefreshCw, X
} from 'lucide-react';
import {
  Booking, EnquiryDocument, CustomerDocument, Package as TravelPackage,
  Destination, CustomerStory
} from '../../types/database';

export type NotificationCategory =
  | 'NEW_ENQUIRY'
  | 'FOLLOW_UP_DUE'
  | 'FOLLOW_UP_OVERDUE'
  | 'HIGH_PRIORITY_LEAD'
  | 'URGENT_LEAD'
  | 'BOOKING_CREATED'
  | 'BOOKING_AWAITING_CONFIRMATION'
  | 'UPCOMING_TRIP'
  | 'TRIP_PREPARATION'
  | 'TRAVELLER_BRIEFING'
  | 'LEAD_STATUS_CHANGED'
  | 'BOOKING_STATUS_CHANGED'
  | 'TRIP_INFORMATION_UPDATED';

export interface AdminNotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  travellerName: string;
  journeyTitle: string;
  reference: string;
  message: string;
  timestamp: any;
  priorityScore: number;
  read: boolean;
  rawEnquiry?: EnquiryDocument;
  rawBooking?: Booking;
  rawCustomer?: CustomerDocument;
}

interface AdminNotificationsManagerProps {
  bookings: Booking[];
  enquiries: EnquiryDocument[];
  customers: CustomerDocument[];
  packages: TravelPackage[];
  destinations: Destination[];
  stories: CustomerStory[];
  onNavigateTab: (tabId: string, filterOptions?: any) => void;
  onOpenBookingModal?: (booking: Booking) => void;
  onOpenEnquiryModal?: (enquiry: EnquiryDocument) => void;
}

const READ_NOTIFICATIONS_KEY = 'nfa_admin_read_notifications';

export const AdminNotificationsManager: React.FC<AdminNotificationsManagerProps> = ({
  bookings = [],
  enquiries = [],
  customers = [],
  packages = [],
  destinations = [],
  stories = [],
  onNavigateTab,
  onOpenBookingModal,
  onOpenEnquiryModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FOLLOW-UPS' | 'LEADS' | 'BOOKINGS' | 'TRIPS' | 'UNREAD'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(READ_NOTIFICATIONS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const markAsRead = (id: string) => {
    if (!readNotifIds.includes(id)) {
      const next = [...readNotifIds, id];
      setReadNotifIds(next);
      try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(next));
      } catch (e) {}
    }
  };

  const markAllAsRead = (allIds: string[]) => {
    const next = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(next);
    try {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  // Helper for formatting time
  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Just now';
    let dateObj: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }

    if (isNaN(dateObj.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatDateDisplay = (dateStr?: string | any): string => {
    if (!dateStr) return 'Date not set';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return formatTimeAgo(dateStr);
  };

  // Derive notifications from canonical realtime streams
  const notifications = useMemo(() => {
    const items: AdminNotificationItem[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const nowMs = Date.now();

    // 1. Enquiries stream notifications
    enquiries.forEach((e) => {
      const ref = e.enquiryReference || e.id;
      const traveller = e.traveller?.name || 'Traveller';
      const journey = e.tripSummary?.itineraryTitle || e.tripSummary?.destination || 'Expedition Request';

      // NEW_ENQUIRY
      if (e.status === 'NEW') {
        const id = `new_enq_${e.id}`;
        items.push({
          id,
          category: 'NEW_ENQUIRY',
          title: 'New Traveller Enquiry Received',
          travellerName: traveller,
          journeyTitle: journey,
          reference: ref,
          message: `Enquiry received for ${journey}.`,
          timestamp: e.createdAt,
          priorityScore: 90,
          read: readNotifIds.includes(id),
          rawEnquiry: e,
        });
      }

      // FOLLOW_UP_OVERDUE vs FOLLOW_UP_DUE
      if (e.followUpAt && e.status !== 'CONVERTED' && e.status !== 'CLOSED') {
        const fDate = typeof e.followUpAt === 'string' ? e.followUpAt : '';
        if (fDate) {
          if (fDate < todayStr) {
            const id = `fup_overdue_${e.id}`;
            items.push({
              id,
              category: 'FOLLOW_UP_OVERDUE',
              title: 'Follow-up Overdue',
              travellerName: traveller,
              journeyTitle: journey,
              reference: ref,
              message: `Follow-up was scheduled for ${fDate}.`,
              timestamp: e.updatedAt || e.createdAt,
              priorityScore: 100,
              read: readNotifIds.includes(id),
              rawEnquiry: e,
            });
          } else if (fDate === todayStr) {
            const id = `fup_due_${e.id}`;
            items.push({
              id,
              category: 'FOLLOW_UP_DUE',
              title: 'Follow-up Scheduled Today',
              travellerName: traveller,
              journeyTitle: journey,
              reference: ref,
              message: `Follow-up with ${traveller} is scheduled for today.`,
              timestamp: e.updatedAt || e.createdAt,
              priorityScore: 95,
              read: readNotifIds.includes(id),
              rawEnquiry: e,
            });
          }
        }
      }

      // URGENT_LEAD / HIGH_PRIORITY_LEAD
      if (e.priority === 'URGENT' || e.priority === 'HIGH' || e.status === 'READY_TO_BOOK') {
        const id = `prio_lead_${e.id}`;
        items.push({
          id,
          category: e.priority === 'URGENT' || e.status === 'READY_TO_BOOK' ? 'URGENT_LEAD' : 'HIGH_PRIORITY_LEAD',
          title: e.status === 'READY_TO_BOOK' ? 'Traveller Ready to Book' : 'High Priority Lead Attention',
          travellerName: traveller,
          journeyTitle: journey,
          reference: ref,
          message: e.status === 'READY_TO_BOOK' ? `${traveller} is ready to book ${journey}.` : `High priority lead for ${journey}.`,
          timestamp: e.updatedAt || e.createdAt,
          priorityScore: e.priority === 'URGENT' ? 98 : 85,
          read: readNotifIds.includes(id),
          rawEnquiry: e,
        });
      }
    });

    // 2. Bookings stream notifications
    bookings.forEach((b) => {
      const ref = b.bookingReference || b.id;
      const traveller = b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller';
      const journey = b.destination || 'Expedition Booking';

      // BOOKING_AWAITING_CONFIRMATION
      if (b.bookingStatus === 'PENDING_CONFIRMATION') {
        const id = `await_confirm_${b.id}`;
        items.push({
          id,
          category: 'BOOKING_AWAITING_CONFIRMATION',
          title: 'Booking Awaiting Confirmation',
          travellerName: traveller,
          journeyTitle: journey,
          reference: ref,
          message: `Booking ${ref} is waiting for admin confirmation.`,
          timestamp: b.createdAt,
          priorityScore: 88,
          read: readNotifIds.includes(id),
          rawBooking: b,
        });
      }

      // UPCOMING_TRIP (next 30 days)
      if (b.bookingStatus === 'CONFIRMED' && b.travelDate) {
        const bTime = new Date(b.travelDate).getTime();
        if (!isNaN(bTime) && bTime >= nowMs - (24 * 60 * 60 * 1000) && bTime <= nowMs + (30 * 24 * 60 * 60 * 1000)) {
          const id = `upcoming_trip_${b.id}`;
          items.push({
            id,
            category: 'UPCOMING_TRIP',
            title: 'Upcoming Departure',
            travellerName: traveller,
            journeyTitle: journey,
            reference: ref,
            message: `Travel Date: ${formatDateDisplay(b.travelDate)}.`,
            timestamp: b.createdAt,
            priorityScore: 70,
            read: readNotifIds.includes(id),
            rawBooking: b,
          });
        }
      }

      // TRIP_PREPARATION & TRAVELLER_BRIEFING
      if (b.bookingStatus === 'CONFIRMED') {
        const isReady = b.operationalStatus === 'READY' || b.operationalStatus === 'TRAVELLER_BRIEFED' || b.operationalStatus === 'TRIP_COMPLETED';
        if (!isReady) {
          let completed = 0;
          if (b.operationalChecklist) {
            Object.values(b.operationalChecklist).forEach((v) => { if (v === true) completed++; });
          }
          const id = `prep_notif_${b.id}`;
          items.push({
            id,
            category: 'TRIP_PREPARATION',
            title: 'Trip Preparation Incomplete',
            travellerName: traveller,
            journeyTitle: journey,
            reference: ref,
            message: `${completed} of 9 preparation steps completed.`,
            timestamp: b.createdAt,
            priorityScore: 75,
            read: readNotifIds.includes(id),
            rawBooking: b,
          });
        }

        if (b.operationalChecklist?.travellerBriefed !== true && b.operationalStatus !== 'TRAVELLER_BRIEFED' && b.operationalStatus !== 'TRIP_COMPLETED') {
          const id = `brief_notif_${b.id}`;
          items.push({
            id,
            category: 'TRAVELLER_BRIEFING',
            title: 'Traveller Briefing Pending',
            travellerName: traveller,
            journeyTitle: journey,
            reference: ref,
            message: `Pre-departure briefing pending for ${traveller}.`,
            timestamp: b.createdAt,
            priorityScore: 80,
            read: readNotifIds.includes(id),
            rawBooking: b,
          });
        }
      }
    });

    // Sort by priorityScore DESC, then timestamp DESC
    return items.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [enquiries, bookings, readNotifIds]);

  // Filtered List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'UNREAD') return !n.read;
      if (activeFilter === 'FOLLOW-UPS') return n.category === 'FOLLOW_UP_DUE' || n.category === 'FOLLOW_UP_OVERDUE';
      if (activeFilter === 'LEADS') return n.category === 'NEW_ENQUIRY' || n.category === 'HIGH_PRIORITY_LEAD' || n.category === 'URGENT_LEAD';
      if (activeFilter === 'BOOKINGS') return n.category === 'BOOKING_CREATED' || n.category === 'BOOKING_AWAITING_CONFIRMATION' || n.category === 'BOOKING_STATUS_CHANGED';
      if (activeFilter === 'TRIPS') return n.category === 'UPCOMING_TRIP' || n.category === 'TRIP_PREPARATION' || n.category === 'TRAVELLER_BRIEFING';
      return true;
    });
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 text-left">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Bell size={24} className="text-[#9E1B1D]" /> NOTIFICATIONS & FOLLOW-UP CENTER
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Stay on top of enquiries, overdue follow-ups, traveller briefings, and upcoming departures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead(notifications.map((n) => n.id))}
              className="px-4 py-2 bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare size={15} /> MARK ALL AS READ ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: `ALL (${notifications.length})` },
          { id: 'UNREAD', label: `UNREAD (${unreadCount})` },
          { id: 'FOLLOW-UPS', label: 'FOLLOW-UPS' },
          { id: 'LEADS', label: 'NEW LEADS' },
          { id: 'BOOKINGS', label: 'BOOKINGS' },
          { id: 'TRIPS', label: 'TRIP OPS' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl border transition-all cursor-pointer shrink-0 ${
              activeFilter === f.id
                ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="saas-card bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <p className="font-brand font-black text-base uppercase text-slate-900">YOU'RE ALL CAUGHT UP.</p>
            <p className="text-xs font-medium text-slate-500">
              New enquiries, follow-ups, and trip updates will appear here automatically.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.read
                  ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                    n.category === 'FOLLOW_UP_OVERDUE' || n.category === 'URGENT_LEAD'
                      ? 'bg-rose-600 text-white'
                      : n.category === 'FOLLOW_UP_DUE'
                      ? 'bg-amber-500 text-white'
                      : n.category === 'NEW_ENQUIRY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-[#F4BF4B]'
                  }`}
                >
                  {n.category.includes('FOLLOW_UP') ? <Clock size={18} /> : <Bell size={18} />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-brand font-black text-xs uppercase tracking-wider text-slate-900">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase rounded">
                        NEW
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{n.reference}</span>
                  </div>

                  <p className="font-brand font-black text-sm text-slate-900 truncate">
                    {n.travellerName} &bull; <span className="text-slate-600 font-medium">{n.journeyTitle}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-medium">{n.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <span className="text-[10px] font-bold text-slate-400">{formatTimeAgo(n.timestamp)}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.id);
                    if (n.rawEnquiry && onOpenEnquiryModal) {
                      onOpenEnquiryModal(n.rawEnquiry);
                    } else if (n.rawBooking && onOpenBookingModal) {
                      onOpenBookingModal(n.rawBooking);
                    } else {
                      onNavigateTab('BOOKINGS');
                    }
                  }}
                  className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {n.rawBooking ? 'OPEN BOOKING' : 'OPEN LEAD'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
