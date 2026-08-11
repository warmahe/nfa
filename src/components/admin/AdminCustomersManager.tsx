import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Users,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Tag,
  SlidersHorizontal,
  RefreshCw,
  Clock,
  UserCheck,
  Edit3,
  Save,
  ChevronRight,
  ShieldCheck,
  History,
  FileText,
  MapPin,
  Heart,
  Coffee,
} from 'lucide-react';
import { db, subscribeToCustomers, updateCustomerProfile } from '../../services/firebaseService';
import { CustomerDocument, EnquiryDocument, Booking } from '../../types/database';

interface AdminCustomersManagerProps {
  onOpenEnquiry?: (enquiry: EnquiryDocument) => void;
}

export const AdminCustomersManager: React.FC<AdminCustomersManagerProps> = ({ onOpenEnquiry }) => {
  // ── State ──
  const [customers, setCustomers] = useState<CustomerDocument[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // ── Selected Customer (Customer 360 Drawer) ──
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDocument | null>(null);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'enquiries' | 'bookings' | 'history'>('profile');

  // ── Search & Filter ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'enquiries'>('newest');

  // ── Editing State ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<CustomerDocument>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Real-time Listeners ──
  useEffect(() => {
    setLoading(true);

    // Listener A: Customers Collection
    const unsubCustomers = subscribeToCustomers(
      (loadedCustomers) => {
        setCustomers(loadedCustomers);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading customers:', err);
        setError('Unable to load customer records.');
        setLoading(false);
      }
    );

    // Listener B: Enquiries Collection (for Customer ↔ Enquiry association)
    const unsubEnquiries = onSnapshot(
      collection(db, 'Enquiries'),
      (snap) => {
        const loadedE: EnquiryDocument[] = [];
        snap.forEach((d) => loadedE.push({ id: d.id, ...(d.data() as Omit<EnquiryDocument, 'id'>) }));
        setEnquiries(loadedE);
      },
      (err) => console.error('Enquiries listener notice:', err)
    );

    // Listener C: Bookings Collection
    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snap) => {
        const loadedB: Booking[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
        setBookings(loadedB);
      },
      (err) => console.error('Bookings listener notice:', err)
    );

    return () => {
      unsubCustomers();
      unsubEnquiries();
      unsubBookings();
    };
  }, []);

  // Update selected customer if underlying record updates
  useEffect(() => {
    if (selectedCustomer?.id) {
      const updated = customers.find((c) => c.id === selectedCustomer.id || c.customerId === selectedCustomer.customerId);
      if (updated) setSelectedCustomer(updated);
    }
  }, [customers]);

  // Sync editing form when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setEditFormData({
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || '',
        preferences: { ...(selectedCustomer.preferences || {}) },
      });
      setIsEditingProfile(false);
    }
  }, [selectedCustomer]);

  // ── Derive Customer's Associated Enquiries ──
  const customerEnquiries = useMemo(() => {
    if (!selectedCustomer) return [];
    const cId = selectedCustomer.customerId || selectedCustomer.id;
    const cEmail = selectedCustomer.email?.toLowerCase();
    const cPhone = selectedCustomer.phone?.replace(/\D/g, '');

    return enquiries.filter((e) => {
      // 1. Direct customerId link
      if (e.customerId && e.customerId === cId) return true;
      // 2. UserId link
      if (e.traveller?.userId && selectedCustomer.userId && e.traveller.userId === selectedCustomer.userId) return true;
      // 3. Email link
      if (cEmail && e.traveller?.email?.toLowerCase() === cEmail) return true;
      // 4. Phone link
      if (cPhone && e.traveller?.phone && e.traveller.phone.replace(/\D/g, '') === cPhone) return true;

      return false;
    }).sort((a, b) => {
      const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
      const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
      const validA = isNaN(timeA) ? 0 : timeA;
      const validB = isNaN(timeB) ? 0 : timeB;
      return validB - validA;
    });
  }, [selectedCustomer, enquiries]);

  // Active Enquiries (NEW, CONTACTED, IN_DISCUSSION)
  const activeEnquiries = useMemo(() => {
    return customerEnquiries.filter((e) => e.status === 'NEW' || e.status === 'CONTACTED' || e.status === 'IN_DISCUSSION');
  }, [customerEnquiries]);

  // Converted Enquiries (CONVERTED)
  const convertedEnquiries = useMemo(() => {
    return customerEnquiries.filter((e) => e.status === 'CONVERTED');
  }, [customerEnquiries]);

  // Customer Bookings (E6)
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return bookings.filter((b) => {
      if (b.customerId && (b.customerId === selectedCustomer.customerId || b.customerId === selectedCustomer.id || b.customerId === selectedCustomer.userId)) return true;
      if (b.userId && selectedCustomer.userId && b.userId === selectedCustomer.userId) return true;
      if (selectedCustomer.email && b.primaryTraveler?.email?.toLowerCase() === selectedCustomer.email.toLowerCase()) return true;
      return false;
    });
  }, [selectedCustomer, bookings]);

  // Dynamic KPI Stats
  const stats = useMemo(() => {
    const total = customers.length;
    let withActive = 0;
    let withConverted = 0;
    let recentlyActive = 0;
    const now = new Date();

    customers.forEach((c) => {
      const cEnquiries = enquiries.filter((e) => {
        if (e.customerId && (e.customerId === c.customerId || e.customerId === c.id)) return true;
        if (e.traveller?.userId && c.userId && e.traveller.userId === c.userId) return true;
        if (c.email && e.traveller?.email?.toLowerCase() === c.email.toLowerCase()) return true;
        return false;
      });

      if (cEnquiries.some((e) => e.status === 'NEW' || e.status === 'CONTACTED' || e.status === 'IN_DISCUSSION')) {
        withActive++;
      }
      if (cEnquiries.some((e) => e.status === 'CONVERTED')) {
        withConverted++;
      }

      if (c.lastEnquiryAt) {
        const lastDate = (c.lastEnquiryAt as any)?.toDate ? (c.lastEnquiryAt as any).toDate() : new Date(c.lastEnquiryAt as any);
        if (!isNaN(lastDate.getTime())) {
          const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays <= 30) recentlyActive++;
        }
      }
    });

    return { total, withActive, withConverted, recentlyActive };
  }, [customers, enquiries]);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    const now = new Date();

    return customers
      .filter((c) => {
        const cEnquiries = enquiries.filter((e) => {
          if (e.customerId && (e.customerId === c.customerId || e.customerId === c.id)) return true;
          if (e.traveller?.userId && c.userId && e.traveller.userId === c.userId) return true;
          if (c.email && e.traveller?.email?.toLowerCase() === c.email.toLowerCase()) return true;
          return false;
        });

        const hasActive = cEnquiries.some((e) => e.status === 'NEW' || e.status === 'CONTACTED' || e.status === 'IN_DISCUSSION');
        const hasConverted = cEnquiries.some((e) => e.status === 'CONVERTED');

        if (statusFilter === 'HAS_ACTIVE_ENQUIRY' && !hasActive) return false;
        if (statusFilter === 'CONVERTED' && !hasConverted) return false;
        if (statusFilter === 'NO_ACTIVE' && hasActive) return false;

        if (statusFilter === 'RECENTLY_ACTIVE') {
          if (!c.lastEnquiryAt) return false;
          const d = (c.lastEnquiryAt as any)?.toDate ? (c.lastEnquiryAt as any).toDate() : new Date(c.lastEnquiryAt as any);
          if (isNaN(d.getTime())) return false;
          const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
          if (diffDays > 30) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.name?.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchPhone = c.phone?.toLowerCase().includes(q);
          const matchRef = c.customerReference?.toLowerCase().includes(q);

          if (!matchName && !matchEmail && !matchPhone && !matchRef) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'enquiries') {
          return (b.totalEnquiries || 0) - (a.totalEnquiries || 0);
        }

        const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
        const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
        const validA = isNaN(timeA) ? 0 : timeA;
        const validB = isNaN(timeB) ? 0 : timeB;
        return sortOrder === 'newest' ? validB - validA : validA - validB;
      });
  }, [customers, enquiries, searchQuery, statusFilter, sortOrder]);

  // Handlers
  const handleSaveProfile = async () => {
    if (!selectedCustomer?.id && !selectedCustomer?.customerId) return;
    const targetId = selectedCustomer.id || selectedCustomer.customerId;

    setSavingProfile(true);
    setError(null);

    try {
      await updateCustomerProfile(targetId, editFormData);
      setActionSuccess('Customer profile updated successfully.');
      setIsEditingProfile(false);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving customer profile:', err);
      setError('Unable to save customer details. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (ts: any): string => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (ts: any): string => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const buildCustomerWhatsAppUrl = (customer: CustomerDocument): string => {
    const phone = customer.phone?.replace(/\D/g, '') || '';
    if (!phone) return '';
    const message = `Hello ${customer.name || 'Explorer'},\n\nThis is No Fixed Address Operations. We hope you are doing well!\n\nRegards,\nNo Fixed Address Operations`;
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Toast Alerts */}
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

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs font-bold flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 underline text-[10px] font-black uppercase">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">Customer Management / Customer 360</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live • Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reusable customer profiles, travel preferences & associated expedition enquiry histories
          </p>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-[#121212] text-white border-[#121212] shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Customers</span>
          <span className="font-brand font-black text-2xl tracking-tight">{stats.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter('HAS_ACTIVE_ENQUIRY')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'HAS_ACTIVE_ENQUIRY'
              ? 'bg-amber-500 text-[#121212] border-amber-600 font-bold shadow-md'
              : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900/80 block mb-1">Active Leads</span>
          <span className="font-brand font-black text-2xl text-amber-950 tracking-tight">{stats.withActive}</span>
        </div>

        <div
          onClick={() => setStatusFilter('CONVERTED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'CONVERTED'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/80 block mb-1">Converted Enquiries</span>
          <span className="font-brand font-black text-2xl text-emerald-950 tracking-tight">{stats.withConverted}</span>
        </div>

        <div
          onClick={() => setStatusFilter('RECENTLY_ACTIVE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'RECENTLY_ACTIVE'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md'
              : 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900/70 block mb-1">Active (30 Days)</span>
          <span className="font-brand font-black text-2xl text-blue-950 tracking-tight">{stats.recentlyActive}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer Name, Email, Phone, or Customer Ref (NFA-C-XXXXX)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="ALL">Status: All</option>
              <option value="HAS_ACTIVE_ENQUIRY">Has Active Lead</option>
              <option value="CONVERTED">Converted Traveller</option>
              <option value="NO_ACTIVE">No Active Lead</option>
              <option value="RECENTLY_ACTIVE">Recently Active</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="newest">↓ Newest First</option>
              <option value="oldest">↑ Oldest First</option>
              <option value="enquiries">Most Enquiries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="animate-spin text-slate-400 mx-auto" size={28} />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-slate-200 p-8">
          <div className="size-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users size={28} />
          </div>
          <div>
            <h4 className="font-brand font-black text-lg uppercase text-slate-800">No Customers Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No customer profiles match your search criteria. Customers are created automatically when authenticated travellers submit an enquiry.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Customer Ref</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Total Enquiries</th>
                    <th className="py-3.5 px-4">Last Enquiry</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCustomers.map((customer) => {
                    const waUrl = buildCustomerWhatsAppUrl(customer);

                    return (
                      <tr
                        key={customer.id || customer.customerId}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 group-hover:border-slate-400">
                            {customer.customerReference || 'NFA-C-REF'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {customer.name || 'Explorer'}
                          {customer.marketingConsent && (
                            <span className="ml-2 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                              Opt-in
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {customer.email || 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {customer.phone || 'N/A'}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {customer.totalEnquiries || 1} Enquiry(s)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatDate(customer.lastEnquiryAt || customer.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800"
                            >
                              Customer 360
                            </button>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                                title="Contact via WhatsApp"
                              >
                                <MessageSquare size={15} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id || customer.customerId}
                onClick={() => setSelectedCustomer(customer)}
                className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-left shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {customer.customerReference || 'NFA-C-REF'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {customer.totalEnquiries || 1} Enquiry(s)
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{customer.name || 'Explorer'}</h4>
                  <p className="text-xs text-slate-500">{customer.email} • {customer.phone}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Last enquiry: {formatDate(customer.lastEnquiryAt || customer.createdAt)}
                  </span>
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold"
                  >
                    Customer 360
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CUSTOMER 360 SLIDE-OVER DRAWER ── */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 text-left"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
        >
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-black text-lg bg-slate-100 text-slate-900 px-3 py-1 rounded border border-slate-300">
                    {selectedCustomer.customerReference || 'NFA-C-PROFILE'}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Verified Customer
                  </span>
                </div>
                <h2 className="font-brand font-black text-xl text-slate-900 uppercase">{selectedCustomer.name}</h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                  Customer since {formatDate(selectedCustomer.createdAt)} • Last Enquiry {formatDate(selectedCustomer.lastEnquiryAt || selectedCustomer.createdAt)}
                </span>
              </div>

              <button onClick={() => setSelectedCustomer(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {selectedCustomer.phone ? (
                <a
                  href={buildCustomerWhatsAppUrl(selectedCustomer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageSquare size={15} /> WhatsApp
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Phone
                </button>
              )}

              {selectedCustomer.email ? (
                <a
                  href={`mailto:${selectedCustomer.email}?subject=${encodeURIComponent(`No Fixed Address Expedition Support`)}`}
                  className="p-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Mail size={15} /> Direct Email
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Email
                </button>
              )}

              {selectedCustomer.phone ? (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-2.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Phone size={15} /> Call Phone
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Phone
                </button>
              )}
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-200 shrink-0">
              <button
                onClick={() => setDrawerTab('profile')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                  drawerTab === 'profile' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Profile & Preferences
              </button>
              <button
                onClick={() => setDrawerTab('enquiries')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  drawerTab === 'enquiries' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Enquiries ({customerEnquiries.length})
              </button>
              <button
                onClick={() => setDrawerTab('bookings')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  drawerTab === 'bookings' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Bookings ({customerBookings.length})
              </button>
              <button
                onClick={() => setDrawerTab('history')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  drawerTab === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Travel History ({convertedEnquiries.length})
              </button>
            </div>

            {/* TAB CONTENT 1: PROFILE & PREFERENCES */}
            {drawerTab === 'profile' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Profile Controls Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserCheck size={14} /> Personal Contact & Preferences
                  </span>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="px-3 py-1 bg-slate-900 text-amber-400 text-xs font-bold rounded flex items-center gap-1 hover:bg-slate-800"
                      >
                        <Save size={13} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile View vs Edit Form */}
                {!isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">Contact Info</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                          <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                          <span className="font-bold text-slate-900">{selectedCustomer.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone Number</span>
                          <span className="font-bold text-slate-900">{selectedCustomer.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">City / Address</span>
                          <span className="font-bold text-slate-900">{selectedCustomer.address || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">Travel Preferences</h4>
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Preferred Travel Style</span>
                          <span className="font-bold text-slate-900">{selectedCustomer.preferences?.travelStyle || 'Standard Expedition'}</span>
                        </div>

                        {selectedCustomer.preferences?.preferredDestinations && selectedCustomer.preferences.preferredDestinations.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Preferred Destinations</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCustomer.preferences.preferredDestinations.map((dest, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-800">
                                  📍 {dest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">City / Address</label>
                        <input
                          type="text"
                          value={editFormData.address || ''}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, address: e.target.value }))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: ASSOCIATED ENQUIRIES */}
            {drawerTab === 'enquiries' && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Associated Expedition Enquiries ({customerEnquiries.length})
                </h4>

                {customerEnquiries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    No enquiries associated with this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                            {enquiry.enquiryId || 'NFA-REF'}
                          </span>
                          <span className="font-bold text-slate-700">{enquiry.status}</span>
                        </div>

                        <div className="font-bold text-slate-900 text-sm">{enquiry.itineraryTitle || 'General Expedition'}</div>
                        <div className="text-slate-600">📍 {enquiry.destination || 'Global'} • Travel Date: {enquiry.trip?.travelDate || 'TBD'}</div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-900">
                            Logged on {formatDate(enquiry.createdAt)}
                          </span>

                          {onOpenEnquiry && (
                            <button
                              onClick={() => {
                                setSelectedCustomer(null);
                                onOpenEnquiry(enquiry);
                              }}
                              className="px-3 py-1 bg-slate-900 text-amber-400 font-bold rounded text-[11px] hover:bg-slate-800 flex items-center gap-1"
                            >
                              Open Lead Workspace <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2.5: LINKED BOOKINGS (E6) */}
            {drawerTab === 'bookings' && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Official Bookings ({customerBookings.length})
                </h4>

                {customerBookings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    No official booking documents linked to this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerBookings.map((booking) => (
                      <div key={booking.id} className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs border-2 border-slate-900">
                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                          <span className="font-mono font-bold bg-[#F4BF4B] text-[#121212] px-2 py-0.5 rounded text-[11px]">
                            {booking.bookingReference || booking.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-500 uppercase">
                            {booking.status || booking.bookingStatus || 'PENDING'}
                          </span>
                        </div>

                        <div className="font-brand font-black text-lg uppercase text-white">
                          {booking.itineraryTitle || booking.destination || 'Expedition Journey'}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                          <div>📍 Destination: <strong>{booking.destination || 'Global'}</strong></div>
                          <div>🗓️ Travel Date: <strong>{booking.travelDate || 'TBD'}</strong></div>
                          <div>👥 Travellers: <strong>{booking.numberOfTravelers || 1} Person(s)</strong></div>
                          <div>💰 Agreed Price: <strong>{booking.agreedPrice ? `₹${booking.agreedPrice.toLocaleString()}` : 'Standard Rate'}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: TRAVEL HISTORY */}
            {drawerTab === 'history' && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                  Converted Expedition History ({convertedEnquiries.length})
                </h4>

                {convertedEnquiries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    No converted travel enquiries recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {convertedEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950">
                            ✓ CONVERTED ENQUIRY
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{enquiry.enquiryId}</span>
                        </div>

                        <div className="font-brand font-black text-base text-slate-900 uppercase">
                          {enquiry.itineraryTitle || 'General Expedition'}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                          <div>📍 Destination: <strong>{enquiry.destination || 'Global'}</strong></div>
                          <div>🗓️ Travel Date: <strong>{enquiry.trip?.travelDate || 'TBD'}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
