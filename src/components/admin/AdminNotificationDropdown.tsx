import React, { useMemo } from 'react';
import { Bell, CheckSquare, Clock, ArrowRight, X, Sparkles } from 'lucide-react';
import { Booking, EnquiryDocument, CustomerDocument } from '../../types/database';

interface AdminNotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  enquiries: EnquiryDocument[];
  customers: CustomerDocument[];
  readNotifIds: string[];
  onMarkAllAsRead: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenBookingModal?: (booking: Booking) => void;
  onOpenEnquiryModal?: (enquiry: EnquiryDocument) => void;
}

export const AdminNotificationDropdown: React.FC<AdminNotificationDropdownProps> = ({
  isOpen,
  onClose,
  bookings = [],
  enquiries = [],
  customers = [],
  readNotifIds = [],
  onMarkAllAsRead,
  onNavigateTab,
  onOpenBookingModal,
  onOpenEnquiryModal,
}) => {
  const notifications = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      traveller: string;
      journey: string;
      ref: string;
      message: string;
      time: string;
      read: boolean;
      rawEnquiry?: EnquiryDocument;
      rawBooking?: Booking;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Enquiries
    enquiries.forEach((e) => {
      const ref = e.enquiryReference || e.id;
      const traveller = e.traveller?.name || 'Traveller';
      const journey = e.tripSummary?.itineraryTitle || e.tripSummary?.destination || 'Expedition';

      if (e.status === 'NEW') {
        const id = `new_enq_${e.id}`;
        items.push({
          id,
          title: 'New Enquiry Received',
          traveller,
          journey,
          ref,
          message: 'Received new traveller request.',
          time: 'Today',
          read: readNotifIds.includes(id),
          rawEnquiry: e,
        });
      }

      if (e.followUpAt && e.status !== 'CONVERTED' && e.status !== 'CLOSED') {
        const fDate = typeof e.followUpAt === 'string' ? e.followUpAt : '';
        if (fDate && fDate <= todayStr) {
          const isOverdue = fDate < todayStr;
          const id = isOverdue ? `fup_overdue_${e.id}` : `fup_due_${e.id}`;
          items.push({
            id,
            title: isOverdue ? 'Follow-up Overdue' : 'Follow-up Due Today',
            traveller,
            journey,
            ref,
            message: `Scheduled follow-up date: ${fDate}`,
            time: isOverdue ? 'Overdue' : 'Today',
            read: readNotifIds.includes(id),
            rawEnquiry: e,
          });
        }
      }
    });

    // Bookings
    bookings.forEach((b) => {
      const ref = b.bookingReference || b.id;
      const traveller = b.travelers?.[0]?.firstName ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}` : 'Traveller';
      const journey = b.destination || 'Expedition Booking';

      if (b.bookingStatus === 'PENDING_CONFIRMATION') {
        const id = `await_confirm_${b.id}`;
        items.push({
          id,
          title: 'Booking Awaiting Confirmation',
          traveller,
          journey,
          ref,
          message: 'Submitted booking needs admin review.',
          time: 'Action required',
          read: readNotifIds.includes(id),
          rawBooking: b,
        });
      }
    });

    return items;
  }, [enquiries, bookings, readNotifIds]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border-2 border-slate-900 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#9E1B1D]" />
          <h3 className="font-brand font-black text-xs text-slate-900 uppercase tracking-wider">
            NOTIFICATIONS ({unreadCount})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs font-bold text-slate-400">
            No active notifications.
          </div>
        ) : (
          notifications.slice(0, 6).map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onClose();
                if (n.rawEnquiry && onOpenEnquiryModal) onOpenEnquiryModal(n.rawEnquiry);
                else if (n.rawBooking && onOpenBookingModal) onOpenBookingModal(n.rawBooking);
                else onNavigateTab('BOOKINGS');
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                !n.read ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-brand font-black text-[11px] text-slate-900 uppercase">{n.title}</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">{n.ref}</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{n.traveller} &bull; <span className="text-slate-600 font-normal">{n.journey}</span></p>
              <p className="text-[11px] text-slate-500 font-medium">{n.message}</p>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            onClose();
            onNavigateTab('NOTIFICATIONS');
          }}
          className="text-xs font-black uppercase tracking-wider text-slate-900 hover:text-[#9E1B1D] flex items-center justify-center gap-1 w-full cursor-pointer"
        >
          VIEW ALL NOTIFICATIONS &rarr;
        </button>
      </div>
    </div>
  );
};
