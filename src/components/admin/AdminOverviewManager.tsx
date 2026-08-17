import React, { useState, useMemo } from 'react';
import {
  LayoutTemplate, AlertCircle, Clock, Calendar, CheckCircle2,
  Users, ChevronRight, ArrowUpRight, Plus, MapPin, Package,
  BookOpen, Sparkles, AlertTriangle, ShieldCheck, Check, Filter,
  ArrowRight, PhoneCall, FileText, Compass, ExternalLink, RefreshCw,
  GitPullRequest, Star, Heart
} from 'lucide-react';
import {
  Booking, EnquiryDocument, CustomerDocument, Package as TravelPackage,
  Destination, CustomerStory
} from '../../types/database';

interface AdminOverviewManagerProps {
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

export const AdminOverviewManager: React.FC<AdminOverviewManagerProps> = ({
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
  const [tripDateRange, setTripDateRange] = useState<'7' | '30' | '90'>('30');

  // Helper for formatting timestamps safely
  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return 'Date not set';
    let dateObj: Date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      dateObj = timestamp.toDate();
    } else if (timestamp.seconds) {
      dateObj = new Date(timestamp.seconds * 1000);
    } else {
      dateObj = new Date(timestamp);
    }

    if (isNaN(dateObj.getTime())) return 'Date not set';

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

    return dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

  // Helper for human-readable Lead Statuses (E11 / E14)
  const getLeadStatusLabel = (status?: string): string => {
    switch (status) {
      case 'NEW': return 'New Enquiry';
      case 'CONTACTED': return 'Contacted';
      case 'IN_DISCUSSION': return 'In Discussion';
      case 'CUSTOMIZATION': return 'Customizing Journey';
      case 'PROPOSAL_SENT': return 'Proposal Sent';
      case 'READY_TO_BOOK': return 'Ready to Book';
      case 'CONVERTED': return 'Booked';
      case 'CLOSED': return 'Closed';
      default: return status || 'New';
    }
  };

  // Helper for human-readable Booking Statuses (E6 / E14)
  const getBookingStatusLabel = (status?: string): string => {
    switch (status) {
      case 'DRAFT': return 'Draft';
      case 'PENDING_CONFIRMATION': return 'Awaiting Confirmation';
      case 'CONFIRMED': return 'Confirmed';
      case 'CANCELLED': return 'Cancelled';
      case 'COMPLETED': return 'Completed';
      default: return status || 'Pending';
    }
  };

  // Helper for Operational Statuses (E10)
  const getOperationalStatusLabel = (status?: string): string => {
    switch (status) {
      case 'NOT_STARTED': return 'Not Started';
      case 'IN_PREPARATION': return 'In Preparation';
      case 'READY': return 'Ready for Traveller';
      case 'TRAVELLER_BRIEFED': return 'Traveller Briefed';
      case 'TRIP_IN_PROGRESS': return 'Trip in Progress';
      case 'TRIP_COMPLETED': return 'Trip Completed';
      default: return 'In Preparation';
    }
  };

  // ── 1. TODAY'S OVERVIEW KPIs ──
  const kpiData = useMemo(() => {
    const newEnquiriesCount = enquiries.filter((e) => e.status === 'NEW').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const followUpsDueCount = enquiries.filter((e) => {
      if (!e.followUpAt) return false;
      const fDate = typeof e.followUpAt === 'string' ? e.followUpAt : '';
      return fDate && fDate <= todayStr && e.status !== 'CONVERTED' && e.status !== 'CLOSED';
    }).length;

    const nowMs = Date.now();
    const daysLimitMs = (parseInt(tripDateRange, 10) || 30) * 24 * 60 * 60 * 1000;

    const upcomingBookingsCount = bookings.filter((b) => {
      if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'COMPLETED') return false;
      if (!b.travelDate) return false;
      const bTime = new Date(b.travelDate).getTime();
      return !isNaN(bTime) && bTime >= nowMs - (24 * 60 * 60 * 1000) && bTime <= nowMs + daysLimitMs;
    }).length;

    const tripsToPrepareCount = bookings.filter((b) => {
      if (b.bookingStatus !== 'CONFIRMED') return false;
      const isReady = b.operationalStatus === 'READY' || b.operationalStatus === 'TRAVELLER_BRIEFED' || b.operationalStatus === 'TRIP_COMPLETED';
      return !isReady;
    }).length;

    const activeLeadsCount = enquiries.filter((e) => e.status !== 'CONVERTED' && e.status !== 'CLOSED').length;
    const confirmedBookingsCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

    const returningTravellersCount = customers.filter((c) => {
      const cId = c.customerId || c.id;
      const cEmail = c.email?.toLowerCase();
      return bookings.some((b) => {
        const isCompleted =
          b.status === 'COMPLETED' ||
          b.bookingStatus === 'COMPLETED' ||
          b.bookingStatus === 'completed' ||
          b.operationalStatus === 'TRIP_COMPLETED';
        if (!isCompleted) return false;
        if (
          b.customerId &&
          (b.customerId === cId ||
            b.customerId === c.userId ||
            b.customerId === c.customerReference)
        )
          return true;
        if (b.userId && c.userId && b.userId === c.userId) return true;
        if (cEmail && b.primaryTraveler?.email?.toLowerCase() === cEmail) return true;
        return false;
      });
    }).length;

    return {
      newEnquiriesCount,
      followUpsDueCount,
      upcomingBookingsCount,
      tripsToPrepareCount,
      activeLeadsCount,
      confirmedBookingsCount,
      returningTravellersCount,
    };
  }, [enquiries, bookings, customers, tripDateRange]);

  // ── 2. NEEDS ATTENTION URGENT PRIORITY STREAM ──
  const attentionItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'OVERDUE_FOLLOWUP' | 'NEW_ENQUIRY' | 'TRIP_PREP' | 'TRAVELLER_BRIEFING' | 'PENDING_CONFIRMATION';
      title: string;
      travellerName: string;
      reference: string;
      context: string;
      urgency: 'high' | 'medium' | 'normal';
      rawEnquiry?: EnquiryDocument;
      rawBooking?: Booking;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Overdue / Due Follow-ups
    enquiries.forEach((e) => {
      if (e.followUpAt && e.status !== 'CONVERTED' && e.status !== 'CLOSED') {
        const fDate = typeof e.followUpAt === 'string' ? e.followUpAt : '';
        if (fDate && fDate <= todayStr) {
          const isOverdue = fDate < todayStr;
          items.push({
            id: `followup_${e.id}`,
            type: 'OVERDUE_FOLLOWUP',
            title: isOverdue ? 'Follow-up Overdue' : 'Follow-up Due Today',
            travellerName: e.traveller?.name || 'Traveller',
            reference: e.enquiryReference || e.id,
            context: `Scheduled follow-up: ${fDate}`,
            urgency: isOverdue ? 'high' : 'medium',
            rawEnquiry: e,
          });
        }
      }
    });

    // 2. New Enquiries
    enquiries.forEach((e) => {
      if (e.status === 'NEW') {
        items.push({
          id: `new_enquiry_${e.id}`,
          type: 'NEW_ENQUIRY',
          title: 'New Enquiry Received',
          travellerName: e.traveller?.name || 'Traveller',
          reference: e.enquiryReference || e.id,
          context: `Received ${formatTimeAgo(e.createdAt)}`,
          urgency: 'high',
          rawEnquiry: e,
        });
      }
    });

    // 3. Bookings Needing Preparation or Briefing
    bookings.forEach((b) => {
      if (b.bookingStatus === 'CONFIRMED') {
        const isReady = b.operationalStatus === 'READY' || b.operationalStatus === 'TRAVELLER_BRIEFED' || b.operationalStatus === 'TRIP_COMPLETED';
        if (!isReady) {
          let completed = 0;
          if (b.operationalChecklist) {
            Object.values(b.operationalChecklist).forEach((v) => {
              if (v === true) completed++;
            });
          }
          items.push({
            id: `prep_${b.id}`,
            type: 'TRIP_PREP',
            title: 'Trip Preparation Incomplete',
            travellerName: b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller',
            reference: b.bookingReference || b.id,
            context: `${completed} of 9 preparation steps complete`,
            urgency: 'medium',
            rawBooking: b,
          });
        }

        if (b.operationalChecklist?.travellerBriefed !== true && b.operationalStatus !== 'TRAVELLER_BRIEFED' && b.operationalStatus !== 'TRIP_COMPLETED') {
          items.push({
            id: `briefing_${b.id}`,
            type: 'TRAVELLER_BRIEFING',
            title: 'Traveller Briefing Pending',
            travellerName: b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller',
            reference: b.bookingReference || b.id,
            context: `Travel Date: ${formatDateDisplay(b.travelDate)}`,
            urgency: 'medium',
            rawBooking: b,
          });
        }
      } else if (b.bookingStatus === 'PENDING_CONFIRMATION') {
        items.push({
          id: `confirm_${b.id}`,
          type: 'PENDING_CONFIRMATION',
          title: 'Booking Awaiting Confirmation',
          travellerName: b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller',
          reference: b.bookingReference || b.id,
          context: `Submitted ${formatTimeAgo(b.createdAt)}`,
          urgency: 'high',
          rawBooking: b,
        });
      }
    });

    // Sort by Urgency (high first)
    return items.sort((a, b) => {
      if (a.urgency === 'high' && b.urgency !== 'high') return -1;
      if (a.urgency !== 'high' && b.urgency === 'high') return 1;
      return 0;
    });
  }, [enquiries, bookings]);

  // ── 3. SALES LEAD PIPELINE ──
  const pipelineMetrics = useMemo(() => {
    const stages: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      IN_DISCUSSION: 0,
      CUSTOMIZATION: 0,
      PROPOSAL_SENT: 0,
      READY_TO_BOOK: 0,
      CONVERTED: 0,
      CLOSED: 0,
    };

    enquiries.forEach((e) => {
      const st = e.status || 'NEW';
      if (stages[st] !== undefined) {
        stages[st]++;
      }
    });

    const totalLeads = enquiries.length;
    const converted = stages.CONVERTED || 0;
    const closed = stages.CLOSED || 0;
    const activeLeads = totalLeads - closed;

    const conversionRate = activeLeads > 0 ? ((converted / activeLeads) * 100).toFixed(1) + '%' : '—';

    return {
      stages,
      totalLeads,
      converted,
      closed,
      conversionRate,
    };
  }, [enquiries]);

  // ── 4. UPCOMING TRIPS ──
  const upcomingTripsList = useMemo(() => {
    const nowMs = Date.now();
    const daysLimitMs = (parseInt(tripDateRange, 10) || 30) * 24 * 60 * 60 * 1000;

    return bookings
      .filter((b) => {
        if (b.bookingStatus === 'CANCELLED' || b.bookingStatus === 'COMPLETED') return false;
        if (!b.travelDate) return false;
        const bTime = new Date(b.travelDate).getTime();
        return !isNaN(bTime) && bTime >= nowMs - (24 * 60 * 60 * 1000) && bTime <= nowMs + daysLimitMs;
      })
      .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime());
  }, [bookings, tripDateRange]);

  // ── 5. TRIP PREPARATION & BRIEFING ──
  const prepTripsList = useMemo(() => {
    return bookings.filter((b) => b.bookingStatus === 'CONFIRMED');
  }, [bookings]);

  return (
    <div className="space-y-6 text-left">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <LayoutTemplate size={24} className="text-[#9E1B1D]" /> TRAVEL OPERATIONS OVERVIEW
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Realtime operational status, upcoming trips, lead pipeline, and urgent traveller tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('BOOKINGS')}
            className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            VIEW ALL ENQUIRIES & BOOKINGS
          </button>
        </div>
      </div>

      {/* ── 1. TODAY'S OVERVIEW KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => onNavigateTab('BOOKINGS', { filter: 'NEW' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Enquiries</span>
            <AlertCircle size={16} className="text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpiData.newEnquiriesCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Received today</p>
        </button>

        <button
          onClick={() => onNavigateTab('COMMUNICATIONS', { filter: 'DUE_TODAY' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Follow-ups Due</span>
            <Clock size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpiData.followUpsDueCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Need attention</p>
        </button>

        <button
          onClick={() => onNavigateTab('BOOKINGS', { filter: 'UPCOMING' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Trips</span>
            <Calendar size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpiData.upcomingBookingsCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Next {tripDateRange} days</p>
        </button>

        <button
          onClick={() => onNavigateTab('TRIP_PREPARATION', { tripPrepFilter: 'TRIPS_TO_PREPARE' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trips To Prepare</span>
            <Compass size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpiData.tripsToPrepareCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Not ready yet</p>
        </button>

        <button
          onClick={() => onNavigateTab('BOOKINGS')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Leads</span>
            <Sparkles size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpiData.activeLeadsCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">In pipeline</p>
        </button>

        <button
          onClick={() => onNavigateTab('BOOKINGS', { filter: 'CONFIRMED' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed</span>
            <CheckCircle2 size={16} className="text-emerald-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-emerald-800 mt-1">{kpiData.confirmedBookingsCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Booked trips</p>
        </button>

        <button
          onClick={() => onNavigateTab('CUSTOMERS', { customerFilter: 'RETURNING_TRAVELLERS' })}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-slate-400 transition-all text-left group cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Returning</span>
            <Heart size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-black text-2xl text-purple-900 mt-1">{kpiData.returningTravellersCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Completed &ge; 1 trip</p>
        </button>
      </div>

      {/* ── 2. NEEDS ATTENTION SECTION ── */}
      <div className="saas-card bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-brand font-black text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-600" /> NEEDS ATTENTION TODAY
            </h3>
            <p className="text-xs text-slate-500 font-medium">Urgent tasks requiring immediate team response.</p>
          </div>
          <span className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 font-black text-[10px] uppercase rounded-md">
            {attentionItems.length} ACTION ITEMS
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <p className="font-brand font-black text-base uppercase text-slate-900">YOU'RE ALL CAUGHT UP.</p>
            <p className="text-xs font-medium text-slate-500">No enquiries or trips currently need your attention.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 font-black text-[9px] uppercase rounded ${
                        item.urgency === 'high' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{item.reference}</span>
                  </div>
                  <p className="font-brand font-black text-sm text-slate-900 truncate">{item.travellerName}</p>
                  <p className="text-xs text-slate-500 font-medium truncate">{item.context}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (item.rawEnquiry && onOpenEnquiryModal) {
                      onOpenEnquiryModal(item.rawEnquiry);
                    } else if (item.rawBooking && onOpenBookingModal) {
                      onOpenBookingModal(item.rawBooking);
                    } else {
                      onNavigateTab('BOOKINGS');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {item.rawBooking ? 'OPEN BOOKING' : 'OPEN LEAD'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. SALES LEAD PIPELINE ── */}
      <div className="saas-card bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-brand font-black text-base text-slate-900 uppercase tracking-tight">
              LEAD SALES PIPELINE
            </h3>
            <p className="text-xs text-slate-500 font-medium">Realtime breakdown of active traveller enquiries by stage.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-slate-600">
              Conversion Rate: <span className="font-black text-emerald-700">{pipelineMetrics.conversionRate}</span>
            </div>
            <button
              onClick={() => onNavigateTab('WORKFLOW')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121212] text-[#F4BF4B] rounded-lg font-black text-xs uppercase tracking-wider hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            >
              <GitPullRequest size={13} /> View Workflow
            </button>
          </div>
        </div>

        {/* Pipeline Stage Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { key: 'NEW', label: 'New', count: pipelineMetrics.stages.NEW, bg: 'bg-rose-50 text-rose-900 border-rose-200' },
            { key: 'CONTACTED', label: 'Contacted', count: pipelineMetrics.stages.CONTACTED, bg: 'bg-amber-50 text-amber-900 border-amber-200' },
            { key: 'IN_DISCUSSION', label: 'In Discussion', count: pipelineMetrics.stages.IN_DISCUSSION, bg: 'bg-blue-50 text-blue-900 border-blue-200' },
            { key: 'CUSTOMIZATION', label: 'Customizing', count: pipelineMetrics.stages.CUSTOMIZATION, bg: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
            { key: 'PROPOSAL_SENT', label: 'Proposal Sent', count: pipelineMetrics.stages.PROPOSAL_SENT, bg: 'bg-purple-50 text-purple-900 border-purple-200' },
            { key: 'READY_TO_BOOK', label: 'Ready to Book', count: pipelineMetrics.stages.READY_TO_BOOK, bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
            { key: 'CONVERTED', label: 'Booked', count: pipelineMetrics.stages.CONVERTED, bg: 'bg-emerald-600 text-white border-emerald-700' },
            { key: 'CLOSED', label: 'Closed', count: pipelineMetrics.stages.CLOSED, bg: 'bg-slate-100 text-slate-600 border-slate-200' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => onNavigateTab('BOOKINGS', { stage: st.key })}
              className={`p-3 border rounded-xl text-center hover:opacity-90 transition-all cursor-pointer ${st.bg}`}
            >
              <p className="font-black text-xl leading-none">{st.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-1 truncate">{st.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. UPCOMING TRIPS & TRIP PREPARATION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Trips */}
        <div className="saas-card bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-brand font-black text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" /> UPCOMING TRIPS
              </h3>
              <p className="text-xs text-slate-500 font-medium">Confirmed upcoming departures.</p>
            </div>

            <div className="flex gap-1">
              {['7', '30', '90'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTripDateRange(range as any)}
                  className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                    tripDateRange === range ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range}D
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {upcomingTripsList.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">
                No upcoming trips in the next {tripDateRange} days.
              </div>
            ) : (
              upcomingTripsList.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-brand font-black text-sm text-slate-900 truncate">
                      {b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      📍 {b.destination || 'Expedition'} &bull; {formatDateDisplay(b.travelDate)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenBookingModal) onOpenBookingModal(b);
                      else onNavigateTab('BOOKINGS');
                    }}
                    className="px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg shrink-0 cursor-pointer"
                  >
                    OPEN BOOKING
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Trip Preparation Progress */}
        <div className="saas-card bg-white p-5 border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-brand font-black text-base text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Compass size={18} className="text-blue-600" /> TRIP PREPARATION & BRIEFING
              </h3>
              <p className="text-xs text-slate-500 font-medium">Operational checklist readiness for confirmed trips.</p>
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {prepTripsList.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">
                No confirmed trips currently in operational preparation.
              </div>
            ) : (
              prepTripsList.map((b) => {
                let completed = 0;
                if (b.operationalChecklist) {
                  Object.values(b.operationalChecklist).forEach((v) => {
                    if (v === true) completed++;
                  });
                }
                const isBriefed = b.operationalChecklist?.travellerBriefed === true || b.operationalStatus === 'TRAVELLER_BRIEFED';

                return (
                  <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-brand font-black text-sm text-slate-900">
                          {b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Ref: {b.bookingReference || b.id} &bull; Date: {formatDateDisplay(b.travelDate)}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 font-black text-[10px] uppercase rounded-md ${
                          isBriefed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isBriefed ? 'BRIEFED' : 'BRIEFING PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700">Checklist: {completed} / 9 Complete</span>
                      <button
                        onClick={() => {
                          if (onOpenBookingModal) onOpenBookingModal(b);
                          else onNavigateTab('BOOKINGS');
                        }}
                        className="text-[11px] font-bold text-slate-900 hover:text-[#9E1B1D] underline cursor-pointer"
                      >
                        OPEN TRIP OPERATIONS &rarr;
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── 5. QUICK ACTIONS & RECENT ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1 col) */}
        <div className="saas-card bg-slate-900 text-white p-5 border border-slate-900 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-brand font-black text-sm uppercase text-[#F4BF4B]">QUICK ACTIONS</span>
            <Sparkles size={16} className="text-[#F4BF4B]" />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateTab('PACKAGES')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>+ ADD JOURNEY PACKAGE</span>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => onNavigateTab('DESTINATIONS')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>+ ADD DESTINATION</span>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => onNavigateTab('BOOKINGS')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>VIEW ENQUIRIES & LEADS</span>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => onNavigateTab('CUSTOMER_STORIES')}
              className="w-full p-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>+ ADD CUSTOMER STORY</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Recent Enquiries & Activity Feed (2 cols) */}
        <div className="lg:col-span-2 saas-card bg-white p-5 border border-slate-200/80 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-brand font-black text-base text-slate-900 uppercase tracking-tight">
                RECENT ACTIVITY & ENQUIRIES
              </h3>
              <p className="text-xs text-slate-500 font-medium">Live feed of incoming traveller requests.</p>
            </div>
            <button
              onClick={() => onNavigateTab('BOOKINGS')}
              className="text-xs font-bold text-slate-900 hover:text-[#9E1B1D] flex items-center gap-1 cursor-pointer"
            >
              VIEW ALL <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {enquiries.slice(0, 5).map((e) => (
              <div key={e.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-brand font-black text-xs text-slate-900">{e.traveller?.name || 'Traveller'}</span>
                    <span className="px-2 py-0.5 bg-slate-200 font-bold text-[9px] uppercase rounded">
                      {getLeadStatusLabel(e.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    {e.tripSummary?.itineraryTitle || e.tripSummary?.destination || 'Expedition Request'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-slate-400">{formatTimeAgo(e.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
