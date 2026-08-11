import React, { useEffect, useState, useRef } from 'react';
import { 
  Calendar, Package, Image as ImageIcon, LayoutTemplate, MessageSquare, 
  LogOut, Map, Menu, X, Search, Bell, Filter, Share2, MoreVertical, 
  Settings, HelpCircle, ChevronRight, SlidersHorizontal, RefreshCw,
  TrendingUp, CheckCircle2, Clock, DollarSign, Layers, ShieldCheck,
  User, ArrowUpRight, ArrowDownRight, Volume2, VolumeX, Plus, Check, Zap,
  Compass, Mail, BookOpen,
  type LucideIcon 
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { AdminHomepageManager } from '../../components/admin/AdminHomepageManager';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { AdminGalleryManager } from '../../components/admin/AdminGalleryManager';
import { AdminPackagesManager } from '../../components/admin/AdminPackagesManager';
import { AdminBookingsManager } from '../../components/admin/AdminBookingsManager';
import { AdminFAQsManager } from '../../components/admin/AdminFAQsManager';
import { AdminSettingsManager } from '../../components/admin/AdminSettingsManager';
import { AdminDestinationManager } from '../../components/admin/AdminDestinationManager';
import { AdminEnquiriesManager } from '../../components/admin/AdminEnquiriesManager';
import { AdminCustomersManager } from '../../components/admin/AdminCustomersManager';
import { AdminCustomerStoriesManager } from '../../components/admin/AdminCustomerStoriesManager';
import { AdminOverviewManager } from '../../components/admin/AdminOverviewManager';
import { AdminGlobalSearchModal } from '../../components/admin/AdminGlobalSearchModal';
import { AdminNotificationsManager } from '../../components/admin/AdminNotificationsManager';
import { AdminNotificationDropdown } from '../../components/admin/AdminNotificationDropdown';
import { logoutUser, subscribeToCustomers } from '../../services/firebaseService';
import type { Booking, Destination, Package as TravelPackage, Payment, EnquiryDocument, CustomerDocument } from '../../types/database';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [customers, setCustomers] = useState<CustomerDocument[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Real-Time Options State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('nfa_admin_sound_enabled') !== 'false';
  });
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showMetricsBanner, setShowMetricsBanner] = useState(true);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nfa_admin_read_notifs') || '[]');
    } catch {
      return [];
    }
  });

  // Global Keyboard Shortcut Handler (Ctrl+K / Cmd+K / "/")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement?.tagName || '').toUpperCase());
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isFirstLoad = useRef(true);

  // Play synthesized audio notification chime
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1: D5 (587.33Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.22, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (e) {
      console.log('Browser audio policy prevented sound:', e);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('nfa_admin_sound_enabled', String(nextState));
    if (nextState) {
      playNotificationChime();
    }
  };

  type SidebarItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    badge?: number | string;
    section: 'menu' | 'content' | 'general';
  };

  const primaryRailItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutTemplate },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'BOOKINGS', label: 'Bookings & Leads', icon: Calendar },
    { id: 'CUSTOMERS', label: 'Customers', icon: User },
    { id: 'CUSTOMER_STORIES', label: 'Customer Stories', icon: BookOpen },
    { id: 'PACKAGES', label: 'Packages', icon: Package },
    { id: 'HOMEPAGE', label: 'Site Content', icon: Layers },
    { id: 'DESTINATIONS', label: 'Destinations', icon: Map },
    { id: 'REVIEWS', label: 'Reviews', icon: MessageSquare },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon },
  ];

  const menuItems: SidebarItem[] = [
    { id: 'DASHBOARD', label: 'Overview', icon: LayoutTemplate, section: 'menu' },
    { id: 'NOTIFICATIONS', label: 'Notifications & Follow-ups', icon: Bell, section: 'menu' },
    { id: 'BOOKINGS', label: 'Bookings & Leads', icon: Calendar, badge: bookings.length + enquiries.filter(e => e.status === 'NEW').length, section: 'menu' },
    { id: 'CUSTOMERS', label: 'Customers', icon: User, badge: customers.length, section: 'menu' },
    { id: 'CUSTOMER_STORIES', label: 'Customer Stories', icon: BookOpen, section: 'menu' },
    { id: 'PACKAGES', label: 'Packages', icon: Package, badge: packages.length, section: 'menu' },
    { id: 'REVIEWS', label: 'Reviews', icon: MessageSquare, section: 'menu' },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon, section: 'menu' }
  ];

  const contentItems: SidebarItem[] = [
    { id: 'HOMEPAGE', label: 'Site Content', icon: Layers, section: 'content' },
    { id: 'DESTINATIONS', label: 'Destinations', icon: Map, badge: destinations.length, section: 'content' }
  ];

  const generalItems: SidebarItem[] = [
    { id: 'SETTINGS', label: 'Settings', icon: Settings, section: 'general' },
    { id: 'FAQS', label: 'Help & FAQs', icon: HelpCircle, section: 'general' }
  ];

  const getTabLabel = () => {
    const allTabs = [...menuItems, ...contentItems, ...generalItems];
    return allTabs.find(t => t.id === activeTab)?.label || 'Dashboard';
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowFilterDrawer(false);
    setShowQuickActionsMenu(false);
    setShowNotificationsMenu(false);
    setShowCustomizeModal(false);
  };

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }));

    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));

      // Real-Time Sound Trigger on new bookings added after initial load
      if (!isFirstLoad.current && snapshot.docChanges().some(c => c.type === 'added')) {
        if (soundEnabled) {
          playNotificationChime();
        }
      }
      isFirstLoad.current = false;
    });

    const unsubEnquiries = onSnapshot(collection(db, 'Enquiries'), (snapshot) => {
      setEnquiries(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EnquiryDocument)));

      if (!isFirstLoad.current && snapshot.docChanges().some(c => c.type === 'added')) {
        if (soundEnabled) {
          playNotificationChime();
        }
      }
    });

    const unsubPackages = onSnapshot(collection(db, 'packages'), (snapshot) => {
      setPackages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TravelPackage)));
    });

    const unsubDestinations = onSnapshot(collection(db, 'destinations'), (snapshot) => {
      setDestinations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Destination)));
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      setPayments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
    });

    const unsubCustomers = subscribeToCustomers((loaded) => {
      setCustomers(loaded);
    });

    return () => {
      unsubBookings();
      unsubEnquiries();
      unsubPackages();
      unsubDestinations();
      unsubPayments();
      unsubCustomers();
    };
  }, [soundEnabled]);

  // Dynamic Notification List
  const notificationsList = bookings.slice(0, 8).map(b => {
    const traveler = b.primaryTraveler?.firstName ? `${b.primaryTraveler.firstName} ${b.primaryTraveler.lastName || ''}` : 'Guest Traveler';
    const pkgName = packages.find(p => p.id === b.packageId)?.title || b.packageId || 'Expedition Package';
    return {
      id: `notif_${b.id}`,
      title: b.bookingStatus === 'confirmed' ? 'Booking Confirmed' : 'New Booking Request',
      message: `${traveler} · ${pkgName}`,
      amount: b.pricing?.total ? `${b.pricing.total.toLocaleString()} ${b.pricing.currency || 'USD'}` : undefined,
      timestamp: b.createdAt ? new Date((b.createdAt as any).toMillis?.() || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      read: readNotifIds.includes(`notif_${b.id}`),
      tab: 'BOOKINGS'
    };
  });

  const unreadNotifCount = notificationsList.filter(n => !n.read).length;

  const markAllNotifsAsRead = () => {
    const allIds = notificationsList.map(n => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('nfa_admin_read_notifs', JSON.stringify(allIds));
  };

  const totalBookings = bookings.length;
  const meetingBookings = bookings.filter(b => b?.bookingStatus === 'pending' && b?.payment?.status === 'pending').length;
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p?.status === 'active').length;
  const totalDestinations = destinations.length;
  const activeDestinations = destinations.filter(d => d?.active).length;
  const totalPayments = payments.length;
  const partialFeePaid = payments.filter(p => p?.status === 'captured' && p?.isAdvancePayment).length;
  const completePaymentPaid = payments.filter(p => p?.status === 'captured' && !p?.isAdvancePayment).length;

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Banner KPI Grid (4 Cards inspired by reference layout) */}
      {showMetricsBanner && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Bookings */}
        <div className="saas-card p-5 bg-[#121212] text-[#F4BF4B] border-[#121212] relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F4BF4B]/70">Total Bookings</span>
            <div className="p-1.5 rounded-lg bg-white/10 text-[#F4BF4B]">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-white">{totalBookings.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <ArrowUpRight size={12} />
              +14%
            </span>
          </div>
          <p className="text-[11px] text-[#F4BF4B]/60 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4BF4B]"></span>
            All bookings up to date
          </p>
        </div>

        {/* Card 2: Partial Fee Paid */}
        <div className="saas-card p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Partial Fee Paid</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{partialFeePaid.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <ArrowUpRight size={12} />
              +8%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Advance payments captured
          </p>
        </div>

        {/* Card 3: Complete Paid */}
        <div className="saas-card p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Complete Paid</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{completePaymentPaid.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <ArrowUpRight size={12} />
              +25%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Full payments captured
          </p>
        </div>

        {/* Card 4: Meeting Bookings */}
        <div className="saas-card p-5 bg-white border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Meeting Bookings</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold tracking-tight text-slate-900">{meetingBookings.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pending meeting flows
          </p>
        </div>
      </div>
    )}

      {/* Secondary Operations Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Packages', value: totalPackages, icon: Package, color: 'text-indigo-600' },
          { label: 'Active Packages', value: activePackages, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Total Destinations', value: totalDestinations, icon: Map, color: 'text-blue-600' },
          { label: 'Active Destinations', value: activeDestinations, icon: ShieldCheck, color: 'text-teal-600' },
          { label: 'Total Payments', value: totalPayments, icon: DollarSign, color: 'text-amber-600' }
        ].map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.label} className="saas-card p-4 bg-white border-slate-200/70 flex items-center gap-3.5">
              <div className={`p-2 rounded-lg bg-slate-50 ${stat.color} border border-slate-100 shrink-0`}>
                <IconComponent size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Main Grid: Recent Activity Feed & Operational Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity Feed (2 cols wide) */}
        <div className="lg:col-span-2 saas-card bg-white p-5 border-slate-200/80">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity Feed</h3>
              <p className="text-xs text-slate-500">Live stream of latest client bookings and inquiries</p>
            </div>
            <button 
              onClick={() => setActiveTab('BOOKINGS')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#121212] hover:text-[#9E1B1D] transition-colors"
            >
              View All Bookings
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {bookings.slice().sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 7).map((booking) => (
              <div key={booking.id} className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60 rounded-lg px-2 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Calendar size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {booking.travelers?.[0]?.firstName ? `${booking.travelers[0].firstName} ${booking.travelers[0].lastName || ''}` : 'Guest Traveler'}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {booking.bookingType === 'meeting' ? 'Meeting' : booking.bookingType === 'reserve' ? 'Reservation' : 'Full Booking'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Package: <span className="text-slate-700 font-medium">{packages.find(p => p.id === booking.packageId)?.title || booking.packageId}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                    booking.bookingStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    booking.bookingStatus === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {booking.bookingStatus || 'pending'}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {booking.createdAt ? new Date(booking.createdAt.toMillis()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>
              </div>
            ))}

            {bookings.length === 0 && (
              <div className="py-12 text-center text-xs font-medium text-slate-400">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Summary & Operations Status */}
        <div className="space-y-4">
          <div className="saas-card bg-white p-5 border-slate-200/80">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Trip Operations Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Live Updates</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Active Packages Ratio</span>
                <span className="font-semibold text-slate-900">{activePackages} / {totalPackages}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Published Destinations</span>
                <span className="font-semibold text-slate-900">{activeDestinations} / {totalDestinations}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Payment Captures</span>
                <span className="font-semibold text-slate-900">{totalPayments} recorded</span>
              </div>
            </div>
          </div>

          <div className="saas-card bg-gradient-to-br from-[#121212] to-slate-900 text-white p-5 border-[#121212]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F4BF4B]">Quick Operations</span>
              <ShieldCheck size={18} className="text-[#F4BF4B]" />
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Manage expedition itineraries, customer bookings, destinations, and site content seamlessly from this central console.
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
              <button 
                onClick={() => setActiveTab('PACKAGES')}
                className="flex-1 px-3 py-2 bg-[#F4BF4B] text-[#121212] text-xs font-semibold rounded-lg hover:bg-amber-400 transition-colors text-center cursor-pointer"
              >
                Manage Packages
              </button>
              <button 
                onClick={() => setActiveTab('BOOKINGS')}
                className="flex-1 px-3 py-2 bg-white/10 text-white text-xs font-semibold rounded-lg hover:bg-white/20 transition-colors text-center cursor-pointer"
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'DASHBOARD') {
      return (
        <div className="saas-card bg-white p-5 lg:p-6 border-slate-200/80 shadow-xs">
          <AdminOverviewManager
            bookings={bookings}
            enquiries={enquiries}
            customers={customers}
            packages={packages}
            destinations={destinations}
            stories={[]}
            onNavigateTab={(tabId) => setActiveTab(tabId)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Section Card Shell wrapping the sub-manager components */}
        <div className="saas-card bg-white p-5 lg:p-6 border-slate-200/80 shadow-xs">
          {activeTab === 'NOTIFICATIONS' && (
            <AdminNotificationsManager
              bookings={bookings}
              enquiries={enquiries}
              customers={customers}
              packages={packages}
              destinations={destinations}
              stories={[]}
              onNavigateTab={(tabId) => setActiveTab(tabId)}
            />
          )}
          {activeTab === 'BOOKINGS' && <AdminBookingsManager />}
          {activeTab === 'CUSTOMERS' && (
            <AdminCustomersManager onOpenEnquiry={() => setActiveTab('BOOKINGS')} />
          )}
          {activeTab === 'CUSTOMER_STORIES' && <AdminCustomerStoriesManager />}
          {activeTab === 'HOMEPAGE' && <AdminHomepageManager />}
          {activeTab === 'PACKAGES' && <AdminPackagesManager />}
          {activeTab === 'DESTINATIONS' && <AdminDestinationManager />}
          {activeTab === 'REVIEWS' && <AdminReviewsManager />}
          {activeTab === 'GALLERY' && <AdminGalleryManager />}
          {activeTab === 'FAQS' && <AdminFAQsManager type="website" />}
          {activeTab === 'SETTINGS' && <AdminSettingsManager />}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#FCFBF7] text-slate-900 flex flex-col font-sans selection:bg-[#F4BF4B]">
      
      {/* GLOBAL ENTERPRISE SHELL CONTAINER */}
      <div className="flex-1 flex overflow-hidden min-w-0">

        {/* 1. PRIMARY NAVIGATION RAIL (Far Left - 64px wide on desktop) */}
        <aside className="hidden md:flex flex-col w-[64px] bg-[#121212] border-r border-slate-800 shrink-0 z-30 select-none items-center py-4 justify-between sticky top-0 h-screen overflow-y-auto">
          {/* Top Logo / App Mark */}
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className="w-10 h-10 rounded-xl bg-[#F4BF4B] text-[#121212] flex items-center justify-center font-sans font-black text-xs tracking-tight shadow-md hover:scale-105 transition-transform cursor-pointer"
              title="No Fixed Address Admin"
            >
              NFA
            </button>

            {/* Primary Rail Navigation Icons */}
            <nav className="flex flex-col gap-2">
              {primaryRailItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#F4BF4B] text-[#121212] shadow-xs font-semibold' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.label}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Utilities */}
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => handleTabChange('SETTINGS')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'SETTINGS' ? 'bg-[#F4BF4B] text-[#121212]' : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => { logoutUser(); window.location.href = '/login'; }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {/* 2. SECONDARY NAVIGATION SIDEBAR (220px-240px wide) */}
        <aside className={`fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 w-[230px] bg-white border-r border-slate-200/80 z-20 flex flex-col transition-transform duration-200 md:translate-x-0 md:overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarOpen ? 'md:flex' : ''}`}>
          
          {/* Sidebar Header & Search Box */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans font-black text-sm uppercase tracking-tight text-slate-900">NFA ADMIN</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Filter/Search Box */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 border border-slate-200 rounded px-1 py-0.2">
                ⌘F
              </span>
            </div>
          </div>

          {/* Grouped Sidebar Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Section: MENU */}
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Menu</p>
              <nav className="space-y-0.5">
                {menuItems.filter(i => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#121212] text-[#F4BF4B] font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconComponent size={16} className={isActive ? 'text-[#F4BF4B]' : 'text-slate-500'} />
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-[#F4BF4B] text-[#121212]' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section: CONTENT */}
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Content</p>
              <nav className="space-y-0.5">
                {contentItems.filter(i => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#121212] text-[#F4BF4B] font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconComponent size={16} className={isActive ? 'text-[#F4BF4B]' : 'text-slate-500'} />
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-[#F4BF4B] text-[#121212]' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Section: GENERAL */}
            <div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">General</p>
              <nav className="space-y-0.5">
                {generalItems.filter(i => !searchQuery || i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#121212] text-[#F4BF4B] font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <IconComponent size={16} className={isActive ? 'text-[#F4BF4B]' : 'text-slate-500'} />
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User / Organization Badge Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 p-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#121212] text-[#F4BF4B] flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">Admin Console</p>
                <p className="text-[10px] text-slate-500 truncate">admin@nofixedaddress.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* TOP BAR / HEADER (Inspired by reference Salesforce-one header toolbar) */}
          <header className="h-[60px] bg-white border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            
            {/* Left: Mobile Toggle & Page Title / Context */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-base font-bold text-slate-900 truncate tracking-tight">{getTabLabel()}</h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200/80 rounded-md">
                  <RefreshCw size={11} className="text-slate-400" />
                  Last Update, {lastUpdated || 'Today'}
                </span>
              </div>
            </div>

            {/* Right: SaaS Action Toolbar (Global Search, Customize, Filter, Quick Actions, Real-time Notification Bell) */}
            <div className="flex items-center gap-2 relative">

              {/* 0. GLOBAL SEARCH TRIGGER */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                aria-label="Search travellers, journeys, destinations"
              >
                <Search size={14} className="text-slate-500" />
                <span className="hidden md:inline text-slate-600 font-sans">Search travellers, journeys, destinations…</span>
                <span className="font-mono text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-500 font-bold">
                  ⌘K
                </span>
              </button>

              {/* 1. CUSTOMIZE BUTTON & POPOVER */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowCustomizeModal(!showCustomizeModal);
                    setShowFilterDrawer(false);
                    setShowQuickActionsMenu(false);
                    setShowNotificationsMenu(false);
                  }}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
                    showCustomizeModal ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal size={14} className={showCustomizeModal ? 'text-white' : 'text-slate-500'} />
                  Customize
                </button>

                {showCustomizeModal && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">Workspace Preferences</h3>
                      <button onClick={() => setShowCustomizeModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Sound Notification Toggle */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {soundEnabled ? <Volume2 size={14} className="text-emerald-600" /> : <VolumeX size={14} className="text-slate-400" />}
                            Audio Notifications
                          </p>
                          <p className="text-[10px] text-slate-500">Play chime sound on new bookings</p>
                        </div>
                        <button
                          onClick={toggleSound}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sound Test Button */}
                      <button
                        onClick={playNotificationChime}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Volume2 size={13} /> Test Notification Chime
                      </button>

                      {/* KPI Banner Toggle */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">Dashboard Metric Banner</p>
                          <p className="text-[10px] text-slate-500">Show summary KPI cards on top</p>
                        </div>
                        <button
                          onClick={() => setShowMetricsBanner(!showMetricsBanner)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer p-0.5 ${showMetricsBanner ? 'bg-slate-900' : 'bg-slate-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${showMetricsBanner ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Real-time Status */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-emerald-800">
                        <span className="font-medium text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Firestore Sockets
                        </span>
                        <span className="font-bold text-[10px] uppercase">Active</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. FILTER BUTTON & DRAWER */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowFilterDrawer(!showFilterDrawer);
                    setShowCustomizeModal(false);
                    setShowQuickActionsMenu(false);
                    setShowNotificationsMenu(false);
                  }}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
                    showFilterDrawer ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Filter size={14} className={showFilterDrawer ? 'text-white' : 'text-slate-500'} />
                  Filter
                </button>

                {showFilterDrawer && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl p-4 z-50 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">Quick Jump & Filter</h3>
                      <button onClick={() => setShowFilterDrawer(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jump to View</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'BOOKINGS', label: `Bookings (${bookings.length})` },
                            { id: 'PACKAGES', label: `Packages (${packages.length})` },
                            { id: 'DESTINATIONS', label: `Destinations (${destinations.length})` },
                            { id: 'REVIEWS', label: 'Reviews' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => handleTabChange(opt.id)}
                              className={`p-2 rounded-lg text-[11px] font-semibold transition-all border text-left cursor-pointer ${
                                activeTab === opt.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">Current tab: <strong className="text-slate-700">{getTabLabel()}</strong></span>
                        <button
                          onClick={() => setShowFilterDrawer(false)}
                          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]"
                        >
                          Close Filter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. QUICK ACTIONS GOLD BUTTON & DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowQuickActionsMenu(!showQuickActionsMenu);
                    setShowCustomizeModal(false);
                    setShowFilterDrawer(false);
                    setShowNotificationsMenu(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#121212] bg-[#F4BF4B] hover:bg-amber-400 rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Share2 size={14} />
                  Quick Actions
                </button>

                {showQuickActionsMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl p-2 z-50 divide-y divide-slate-100">
                    <div className="px-3 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Execute Workflow Action</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => handleTabChange('PACKAGES')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <div className="p-1.5 rounded bg-amber-100 text-amber-800"><Package size={14} /></div>
                        Manage Packages Inventory
                      </button>
                      <button
                        onClick={() => handleTabChange('DESTINATIONS')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <div className="p-1.5 rounded bg-blue-100 text-blue-800"><Map size={14} /></div>
                        Add / Edit Destinations
                      </button>
                      <button
                        onClick={() => handleTabChange('BOOKINGS')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-800"><Calendar size={14} /></div>
                        Inspect Customer Bookings
                      </button>
                      <button
                        onClick={() => handleTabChange('REVIEWS')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <div className="p-1.5 rounded bg-rose-100 text-rose-800"><MessageSquare size={14} /></div>
                        Manage Traveler Reviews
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              {/* 4. REAL-TIME NOTIFICATION BELL WITH DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotificationsMenu(!showNotificationsMenu);
                    setShowCustomizeModal(false);
                    setShowFilterDrawer(false);
                    setShowQuickActionsMenu(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors relative cursor-pointer ${
                    showNotificationsMenu ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    !
                  </span>
                </button>

                <AdminNotificationDropdown
                  isOpen={showNotificationsMenu}
                  onClose={() => setShowNotificationsMenu(false)}
                  bookings={bookings}
                  enquiries={enquiries}
                  customers={customers}
                  readNotifIds={[]}
                  onMarkAllAsRead={() => {}}
                  onNavigateTab={(tabId) => setActiveTab(tabId)}
                />
              </div>

            </div>
          </header>

          {/* MAIN PAGE WORKSPACE CONTENT */}
          <main className="p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex-1">
            {renderContent()}
          </main>
        </div>

      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-10 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Global Admin Search Modal */}
      <AdminGlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        bookings={bookings}
        enquiries={enquiries}
        customers={customers}
        packages={packages}
        destinations={destinations}
        stories={[]}
        onSelectResult={(result) => {
          if (result.category === 'CUSTOMER') {
            setActiveTab('CUSTOMERS');
          } else if (result.category === 'ENQUIRY' || result.category === 'BOOKING') {
            setActiveTab('BOOKINGS');
          } else if (result.category === 'JOURNEY') {
            setActiveTab('PACKAGES');
          } else if (result.category === 'DESTINATION') {
            setActiveTab('DESTINATIONS');
          } else if (result.category === 'STORY') {
            setActiveTab('CUSTOMER_STORIES');
          }
        }}
      />
    </div>
  );
};
