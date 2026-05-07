import React, { useEffect, useState } from 'react';
import { Calendar, Package, Image as ImageIcon, LayoutTemplate, MessageSquare, LogOut, Map, Menu, X, Plus, type LucideIcon } from 'lucide-react';
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
import { logoutUser } from '../../services/firebaseService';
import type { Booking, Destination, Package as TravelPackage, Payment } from '../../types/database';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  type SidebarItem = {
    id: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  };

  const menuItems: SidebarItem[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutTemplate },
    { id: 'PACKAGES', label: 'Packages', icon: Package },
    { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
    { id: 'REVIEWS', label: 'Field Logs', icon: MessageSquare },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon }
  ];

  const contentItems: SidebarItem[] = [
    { id: 'HOMEPAGE', label: 'Site Content', icon: LayoutTemplate },
    { id: 'DESTINATIONS', label: 'Destinations', icon: Map }
  ];

  const generalItems: SidebarItem[] = [
    { id: 'SETTINGS', label: 'Settings', icon: LayoutTemplate },
    { id: 'FAQS', label: 'Help', icon: MessageSquare }
  ];

  const getTabLabel = () => {
    const allTabs = [...menuItems, ...contentItems, ...generalItems];
    return allTabs.find(t => t.id === activeTab)?.label || 'Dashboard';
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
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

    return () => {
      unsubBookings();
      unsubPackages();
      unsubDestinations();
      unsubPayments();
    };
  }, []);

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
      <div>
        <h1 className="font-brand font-black text-4xl uppercase tracking-tight text-[#121212]">Dashboard</h1>
        <p className="text-sm font-bold text-[#121212]/60 uppercase tracking-widest mt-2">Overview of your travel operations.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-[18px] bg-[#121212] text-[#F4BF4B] p-6 shadow-[0_12px_24px_rgba(18,18,18,0.12)]">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#F4BF4B]/70">Total Bookings</p>
          <div className="flex items-end justify-between mt-4">
            <p className="text-4xl font-black">{totalBookings.toLocaleString()}</p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F4BF4B]/60 mt-3">All booking records</p>
        </div>
        {[
          { label: 'Partial Fee Paid', value: partialFeePaid, note: 'Advance payments captured' },
          { label: 'Complete Paid', value: completePaymentPaid, note: 'Full payments captured' },
          { label: 'Meeting Bookings', value: meetingBookings, note: 'Pending meeting flows' }
        ].map((stat) => (
          <div key={stat.label} className="rounded-[18px] bg-white p-6 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#121212]/60">{stat.label}</p>
            <div className="flex items-end justify-between mt-4">
              <p className="text-3xl font-black text-[#121212]">{stat.value.toLocaleString()}</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-3">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: 'Total Packages', value: totalPackages },
          { label: 'Active Packages', value: activePackages },
          { label: 'Total Destinations', value: totalDestinations },
          { label: 'Active Destinations', value: activeDestinations },
          { label: 'Total Payments', value: totalPayments }
        ].map((stat) => (
          <div key={stat.label} className="rounded-[18px] bg-white p-5 border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60">{stat.label}</p>
            <p className="mt-3 text-2xl font-black text-[#121212]">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="mt-12">
        <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] mb-6">Recent Activity</h2>
        <div className="bg-white border-2 border-[#121212] shadow-[8px_8px_0_0_#121212]">
          {bookings.slice().sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 10).map((booking, idx) => (
            <div key={booking.id} className={`p-4 flex items-start gap-4 ${idx !== 0 ? 'border-t-2 border-[#121212]/10' : ''}`}>
              <div className="bg-[#121212] p-2 rounded-lg shrink-0 mt-1">
                <Calendar size={16} className="text-[#F4BF4B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm uppercase tracking-wider text-[#121212] truncate">
                  {booking.bookingType === 'meeting' ? 'New Meeting Scheduled' : booking.bookingType === 'reserve' ? 'New Reservation' : 'New Full Booking'}
                </p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Lead: {booking.travelers?.[0]?.firstName} {booking.travelers?.[0]?.lastName} • Package: {packages.find(p => p.id === booking.packageId)?.title || booking.packageId}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Status: {booking.bookingStatus}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    Payment: {booking.payment?.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {booking.createdAt ? new Date(booking.createdAt.toMillis()).toLocaleDateString() : 'Unknown Date'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {booking.createdAt ? new Date(booking.createdAt.toMillis()).toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              No recent activity recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'DASHBOARD') {
      return renderDashboard();
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-brand font-black text-3xl uppercase tracking-tight text-[#121212]">{getTabLabel()}</h1>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#121212]/60 mt-2">Manage expedition content and operations</p>
        </div>

        <div className="bg-white rounded-[18px] border-2 border-[#121212]/10 p-6 lg:p-8 shadow-[0_12px_24px_rgba(18,18,18,0.06)]">
          {activeTab === 'HOMEPAGE' && <AdminHomepageManager />}
          {activeTab === 'PACKAGES' && <AdminPackagesManager />}
          {activeTab === 'DESTINATIONS' && <AdminDestinationManager />}
          {activeTab === 'REVIEWS' && <AdminReviewsManager />}
          {activeTab === 'GALLERY' && <AdminGalleryManager />}
          {activeTab === 'BOOKINGS' && <AdminBookingsManager />}
          {activeTab === 'FAQS' && <AdminFAQsManager type="website" />}
          {activeTab === 'SETTINGS' && <AdminSettingsManager />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] nfa-texture selection:bg-[#F4BF4B]">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 lg:hidden z-40 p-2 hover:bg-[#FCFBF7] rounded-lg transition-colors"
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Fixed Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r-2 border-[#121212]/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="px-5 pt-6 pb-4 border-b border-[#121212]/10">
            <h2 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212]">NFA</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 space-y-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40">Menu</p>
              <nav className="mt-3 space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-[0.12em] transition-all ${
                        activeTab === item.id
                          ? 'bg-[#121212] text-[#F4BF4B]'
                          : 'text-[#121212] hover:bg-[#FCFBF7]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={16} className="shrink-0" />
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40">Content</p>
              <nav className="mt-3 space-y-1">
                {contentItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-[0.12em] transition-all ${
                        activeTab === item.id
                          ? 'bg-[#121212] text-[#F4BF4B]'
                          : 'text-[#121212] hover:bg-[#FCFBF7]'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40">General</p>
              <nav className="mt-3 space-y-1">
                {generalItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-[0.12em] transition-all ${
                        activeTab === item.id
                          ? 'bg-[#121212] text-[#F4BF4B]'
                          : 'text-[#121212] hover:bg-[#FCFBF7]'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => { logoutUser(); window.location.href = '/login'; }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-[0.12em] text-[#9E1B1D] hover:bg-[#FCFBF7] transition-all"
                >
                  <LogOut size={16} className="shrink-0" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-0 lg:ml-64 pt-6 pb-12 transition-all duration-300">
        <div className="px-6 lg:px-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
