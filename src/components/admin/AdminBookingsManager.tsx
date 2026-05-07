import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Calendar, ChevronDown, CheckCircle, 
  Download, Mail, FileText, AlertTriangle, ArrowRight, Save
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, updateDoc, doc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import type { Booking } from '../../types/database';

export const AdminBookingsManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searching, setSearching] = useState('');
  const [internalNotesText, setInternalNotesText] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    bookingStatus: 'all',
    bookingType: 'all',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error('Firebase listener error:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        'payment.status': newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating booking:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleAddInternalNote = async (booking: Booking) => {
    if (!internalNotesText.trim()) return;
    setUpdating(booking.id);
    try {
      const updated = booking.internalNotes ? `${booking.internalNotes}\n---\n${internalNotesText}` : internalNotesText;
      await updateDoc(doc(db, 'bookings', booking.id), {
        internalNotes: updated,
        updatedAt: serverTimestamp()
      });
      setInternalNotesText('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleExportBooking = (booking: Booking) => {
    const dataStr = JSON.stringify(booking, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `booking-${booking.id}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendConfirmationEmail = async (booking: Booking) => {
    setUpdating(booking.id);
    try {
      const response = await fetch('/.netlify/functions/sendConfirmationEmail', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        await updateDoc(doc(db, 'bookings', booking.id), { 
          confirmationEmailSent: true,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setUpdating(null);
    }
  };

  // Filters
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      refunded: 'bg-gray-100 text-gray-600 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      not_required: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[status] || colors.pending;
  };

  const getBookingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-50 text-orange-700 border-orange-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      'no_show': 'bg-gray-100 text-gray-600 border-gray-200',
      meeting_requested: 'bg-violet-50 text-violet-700 border-violet-200'
    };
    return colors[status] || colors.pending;
  };

  const getBookingTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      meeting: 'bg-[#F4BF4B]/20 text-[#121212] border-[#F4BF4B]',
      reserve: 'bg-blue-50 text-blue-700 border-blue-200',
      book: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const labels: Record<string, string> = { meeting: '📞 Meeting', reserve: '🛡️ Reserved', book: '✅ Full Booking' };
    return { style: styles[type] || styles.book, label: labels[type] || type };
  };

  const filteredBookings = (bookings || []).filter(booking => {
    if (!booking) return false;
    let matches = true;
    
    // Payment status filter
    if (filters.paymentStatus !== 'all') {
      matches = matches && booking?.payment?.status === filters.paymentStatus;
    }
    
    // Booking status filter
    if (filters.bookingStatus !== 'all') {
      matches = matches && booking?.bookingStatus === filters.bookingStatus;
    }
    
    // Booking type filter
    if (filters.bookingType !== 'all') {
      matches = matches && (booking as any)?.bookingType === filters.bookingType;
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const bookingDate = booking?.createdAt instanceof Timestamp 
        ? (booking.createdAt as any).toDate() 
        : new Date(booking?.createdAt || new Date());
      const now = new Date();
      const diffDays = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (filters.dateRange === '7days' && diffDays > 7) matches = false;
      if (filters.dateRange === '30days' && diffDays > 30) matches = false;
      if (filters.dateRange === '90days' && diffDays > 90) matches = false;
    }
    
    // Search filter
    if (searching) {
      const search = searching.toLowerCase();
      matches = matches && (
        booking?.primaryTraveler?.firstName?.toLowerCase().includes(search) ||
        booking?.primaryTraveler?.lastName?.toLowerCase().includes(search) ||
        booking?.primaryTraveler?.email?.toLowerCase().includes(search) ||
        booking?.id?.toLowerCase().includes(search)
      );
    }
    
    return matches;
  });

  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all";
  const selectClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] font-bold text-[11px] uppercase tracking-widest text-[#121212] transition-all cursor-pointer";

  return (
    <div className="space-y-6 w-full">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
        <div className="rounded-[18px] bg-[#121212] text-[#F4BF4B] p-5 shadow-[0_12px_24px_rgba(18,18,18,0.12)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#F4BF4B]/70">Total</p>
          <p className="text-3xl font-black mt-2">{(bookings || []).length}</p>
        </div>
        <div className="rounded-[18px] bg-white p-5 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Meetings</p>
          <p className="text-3xl font-black text-[#121212] mt-2">{(bookings || []).filter(b => (b as any)?.bookingType === 'meeting').length}</p>
        </div>
        <div className="rounded-[18px] bg-white p-5 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Reserved</p>
          <p className="text-3xl font-black text-[#121212] mt-2">{(bookings || []).filter(b => (b as any)?.bookingType === 'reserve').length}</p>
        </div>
        <div className="rounded-[18px] bg-white p-5 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Full Bookings</p>
          <p className="text-3xl font-black text-[#121212] mt-2">{(bookings || []).filter(b => (b as any)?.bookingType === 'book').length}</p>
        </div>
        <div className="rounded-[18px] bg-white p-5 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">Revenue</p>
          <p className="text-2xl font-black text-[#121212] mt-2">{(bookings || []).reduce((sum, b) => sum + ((b?.pricing as any)?.amountPaid || b?.pricing?.total || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#121212]/30" />
          <input
            type="text"
            placeholder="Search by name, email, or booking ID..."
            value={searching}
            onChange={(e) => setSearching(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full rounded-[14px] border-2 border-[#121212]/10 bg-white px-4 py-3 font-black text-[11px] uppercase tracking-widest text-[#121212]/60 hover:bg-[#FCFBF7] transition-colors flex items-center justify-between"
        >
          <span>Advanced Filters</span>
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Payment Status</label>
              <select value={filters.paymentStatus} onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))} className={selectClass}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Booking Status</label>
              <select value={filters.bookingStatus} onChange={(e) => setFilters(prev => ({ ...prev, bookingStatus: e.target.value }))} className={selectClass}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="meeting_requested">Meeting Requested</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Booking Type</label>
              <select value={filters.bookingType} onChange={(e) => setFilters(prev => ({ ...prev, bookingType: e.target.value }))} className={selectClass}>
                <option value="all">All Types</option>
                <option value="meeting">Meeting</option>
                <option value="reserve">Reserved</option>
                <option value="book">Full Booking</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60 block mb-2">Date Range</label>
              <select value={filters.dateRange} onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))} className={selectClass}>
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4 w-full min-h-[500px]">
        {loading ? (
          <div className="text-center py-20 rounded-[18px] border-2 border-dashed border-[#121212]/10">
            <Users size={48} className="mx-auto text-[#121212]/20 mb-4" />
            <p className="text-[#121212]/40 font-bold text-sm uppercase tracking-widest">Scanning Global Bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? filteredBookings.map(booking => (
          <div key={booking.id} className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] overflow-hidden hover:shadow-[0_16px_32px_rgba(18,18,18,0.1)] transition-all">
            {/* Header - Clickable to expand */}
            <div 
              className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6"
              onClick={() => setExpandedId(expandedId === booking?.id ? null : booking?.id || null)}
            >
              <div className="space-y-3 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-[9px] font-black text-[#9E1B1D] bg-[#9E1B1D]/5 px-3 py-1 rounded-full tracking-widest uppercase">
                    REF: {booking?.id?.substring(0, 8).toUpperCase() || 'N/A'}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(booking?.payment?.status)}`}>
                    {booking?.payment?.status || 'unknown'}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${getBookingStatusColor(booking?.bookingStatus)}`}>
                    {booking?.bookingStatus || 'unknown'}
                  </span>
                  {(booking as any)?.bookingType && (() => {
                    const badge = getBookingTypeBadge((booking as any).bookingType);
                    return <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${badge.style}`}>{badge.label}</span>;
                  })()}
                </div>
                <div>
                  <h3 className="font-brand font-black text-xl sm:text-2xl uppercase leading-[0.9] tracking-tighter text-[#121212]">{booking?.primaryTraveler?.firstName || 'N/A'} {booking?.primaryTraveler?.lastName || ''}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40 mt-1 break-all">{booking?.primaryTraveler?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 shrink-0 border-t-2 sm:border-t-0 sm:border-l-2 border-[#121212]/10 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <span className="text-[10px] font-black uppercase text-[#121212]/40 tracking-widest">Package:</span>
                <span className="font-black text-sm uppercase tracking-tight text-[#121212]">{booking?.packageId || 'N/A'}</span>
                <span className="font-bold text-xs uppercase text-[#9E1B1D] whitespace-nowrap">
                  {new Date((booking?.checkinDate as unknown as any)?.seconds ? (booking.checkinDate as any).toDate() : booking?.checkinDate || new Date()).toLocaleDateString()}
                </span>
                <div className="mt-2 font-brand font-black text-lg sm:text-xl text-[#F4BF4B]">
                  {(booking?.pricing?.total || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}
                </div>
              </div>

              <ChevronDown size={24} className={`text-[#121212]/20 transition-transform hidden sm:block ${expandedId === booking?.id ? 'rotate-180' : ''}`} />
            </div>

            {/* Extended Details */}
            {expandedId === booking.id && (
              <div className="p-5 sm:p-6 border-t-2 border-[#121212]/10 bg-[#FCFBF7] space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* Travelers */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4 flex items-center gap-2">
                        <Users size={14} /> Mission Personnel ({booking?.travelers?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {Array.isArray(booking?.travelers) && booking?.travelers.map((t, idx) => (
                          <div key={idx} className="bg-white rounded-[14px] border-2 border-[#121212]/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <p className="font-bold text-xs uppercase">{t?.firstName || 'N/A'} {t?.lastName || ''}</p>
                              <p className="text-[9px] font-bold text-[#121212]/40 tracking-widest">{t?.age || '?'} YRS • PPT: {t?.passportNumber || 'N/A'}</p>
                            </div>
                            {booking?.primaryTraveler?.email === t?.email && <span className="bg-[#121212] text-[#F4BF4B] text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">LEAD</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4 flex items-center gap-2">
                        <AlertTriangle size={14} /> Medical / Diet Logs
                      </h4>
                      <p className="bg-amber-50 text-amber-800 rounded-[14px] border border-amber-200 p-4 font-bold text-xs italic break-words">
                        "{booking.specialRequests || 'No special requirements reported.'}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6 sm:space-y-8">
                    {/* Financial Breakdown */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4 flex items-center gap-2">
                        <FileText size={14} /> Financial Ledger
                      </h4>
                      <div className="bg-white rounded-[14px] border-2 border-[#121212]/10 p-5 space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between font-bold text-[#121212]/50 uppercase tracking-widest">
                          <span>Base Protocol</span>
                          <span>{(booking?.pricing?.basePriceTotal || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                        </div>
                        {(booking?.pricing?.insuranceCost || 0) > 0 && (
                          <div className="flex justify-between font-bold text-[#121212]/50 uppercase tracking-widest">
                            <span>Risk Coverage</span>
                            <span>+ {(booking?.pricing?.insuranceCost || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-[#121212]/50 uppercase tracking-widest pt-2 border-t border-[#121212]/10">
                          <span>Subtotal</span>
                          <span>{(booking?.pricing?.subtotal || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#9E1B1D] uppercase tracking-widest">
                          <span>Taxes / Fees</span>
                          <span>+ {(booking?.pricing?.serviceFee || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                        </div>
                        <div className="flex justify-between font-black uppercase tracking-widest pt-3 border-t-2 border-[#121212]/10">
                          <span>Gross Total</span>
                          <span className="text-[#121212]">{(booking?.pricing?.total || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                        </div>
                        {(booking?.pricing as any)?.amountPaid !== undefined && (
                          <div className="flex justify-between font-bold text-emerald-600 uppercase tracking-widest">
                            <span>Amount Paid</span>
                            <span>{((booking?.pricing as any)?.amountPaid || 0).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                          </div>
                        )}
                        {(booking as any)?.bookingType === 'reserve' && (
                          <div className="flex justify-between font-bold text-amber-600 uppercase tracking-widest">
                            <span>Balance Due</span>
                            <span>{((booking?.pricing?.total || 0) - ((booking?.pricing as any)?.amountPaid || 0)).toLocaleString()} {booking?.pricing?.currency || 'USD'}</span>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row justify-between gap-2 text-[10px] font-black uppercase tracking-widest bg-[#FCFBF7] rounded-[10px] p-3 mt-3 text-[#121212]/50">
                          <span>Payment Method</span>
                          <span className="break-all">{booking?.payment?.method || 'N/A'} (ID: {booking?.payment?.transactionId || 'UNKNOWN'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">Command Actions</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleUpdateStatus(booking?.id || '', 'completed')}
                          disabled={updating === booking?.id || booking?.payment?.status === 'completed'}
                          className="flex flex-col items-center gap-1 rounded-[14px] bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 p-3 font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={16} /> Mark Completed
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(booking?.id || '', 'refunded')}
                          disabled={updating === booking?.id || booking?.payment?.status === 'refunded'}
                          className="flex flex-col items-center gap-1 rounded-[14px] bg-white border-2 border-[#121212]/10 text-[#121212]/50 hover:bg-[#121212]/5 p-3 font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowRight size={16} /> Issue Refund
                        </button>
                        <button 
                          onClick={() => handleExportBooking(booking)}
                          className="flex flex-col items-center gap-1 rounded-[14px] bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50 p-3 font-black text-[10px] uppercase tracking-widest transition-colors"
                        >
                          <Download size={16} /> Export
                        </button>
                        <button 
                          onClick={() => handleSendConfirmationEmail(booking)}
                          disabled={updating === booking?.id || booking?.confirmationEmailSent}
                          className="flex flex-col items-center gap-1 rounded-[14px] bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 p-3 font-black text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Mail size={16} /> Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Notes Section */}
                <div className="border-t-2 border-[#121212]/10 pt-6 sm:pt-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4">Internal Notes</h4>
                  <div className="space-y-3">
                    {booking?.internalNotes && (
                      <div className="bg-white rounded-[14px] border-2 border-[#121212]/10 p-4 max-h-40 overflow-y-auto">
                        <p className="text-xs text-[#121212] whitespace-pre-wrap">{booking?.internalNotes}</p>
                      </div>
                    )}
                    <textarea
                      placeholder="Add internal note..."
                      value={internalNotesText}
                      onChange={(e) => setInternalNotesText(e.target.value)}
                      className="w-full p-4 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-xs text-[#121212] transition-all resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => handleAddInternalNote(booking)}
                      disabled={!internalNotesText.trim() || updating === booking?.id}
                      className="w-full rounded-[14px] bg-[#121212] text-[#F4BF4B] p-3 font-black text-[11px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-20 rounded-[18px] border-2 border-dashed border-[#121212]/10">
            <Users size={48} className="mx-auto text-[#121212]/20 mb-4" />
            <p className="text-[#121212]/40 font-bold text-sm uppercase tracking-widest">No bookings found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
