import React, { useState, useEffect } from "react";
import { EditProfileModal } from "../../components/user/EditProfileModal";
import { Calendar, Map, FileText, Settings, ArrowRight, ShieldCheck, Loader2, Download, Bell, Heart, Star, Package } from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebaseService";
import { Booking } from "../../types/database";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { generateBookingPDF, BookingInvoice } from "../../services/pdfService";

const TABS = ["Overview", "My Bookings", "My Documents", "Settings"];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700 border-green-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "BOOKINGS" || activeTab === "OVERVIEW") {
      setLoading(true);
      getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(20)))
        .then(snap => setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking))))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const upcomingBooking = bookings.find(b => b.bookingStatus === 'confirmed');
  const completedBookings = bookings.filter(b => b.bookingStatus === 'completed');
  const totalSpent = bookings.reduce((acc, b) => acc + (b.pricing?.total || 0), 0);

  const handleDownloadInvoice = async (booking: Booking) => {
    setDownloadingId(booking.id);
    try {
      const invoice: BookingInvoice = {
        bookingId: booking.id,
        packageTitle: booking.packageId || 'NFA Expedition',
        destination: (booking as any).destinations?.[0] || 'Global',
        travelDate: booking.checkinDate ? new Date((booking.checkinDate as any).toDate?.() || booking.checkinDate).toLocaleDateString('en-IN') : 'TBD',
        travelers: `${booking.primaryTraveler?.firstName} ${booking.primaryTraveler?.lastName}`,
        travelersCount: booking.numberOfTravelers || 1,
        basePrice: `₹${(booking.pricing?.basePricePerPerson || 0).toLocaleString()}`,
        insurance: booking.pricing?.insurance || false,
        insurancePrice: booking.pricing?.insuranceCost ? `₹${booking.pricing.insuranceCost.toLocaleString()}` : undefined,
        serviceFee: `₹${(booking.pricing?.serviceFee || 0).toLocaleString()}`,
        totalPrice: `₹${(booking.pricing?.total || 0).toLocaleString()}`,
        leadTravelerEmail: booking.primaryTraveler?.email || '',
        leadTravelerPhone: booking.primaryTraveler?.phone,
        bookingDate: booking.createdAt ? new Date((booking.createdAt as any).toDate?.() || booking.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
      };
      await generateBookingPDF(invoice, `NFA-Invoice-${booking.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ── MAIN CONTENT ── */}
        <main className="lg:col-span-8">
          <header className="mb-12 border-b-4 border-[#121212] pb-8">
            <h1 className="font-brand font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-[#121212]">
              YOUR <br /><span className="text-[#9E1B1D]">JOURNAL.</span>
            </h1>
          </header>

          {/* Tab Switcher */}
          <div className="flex flex-wrap gap-2 mb-12">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${
                  activeTab === tab ? "bg-[#121212] text-[#F4BF4B] border-[#121212]" : "bg-white border-[#121212] hover:bg-[#F4BF4B]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Total Bookings", value: bookings.length },
                  { label: "Completed Trips", value: completedBookings.length },
                  { label: "Total Invested", value: `₹${totalSpent.toLocaleString()}` },
                ].map(stat => (
                  <div key={stat.label} className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212]">
                    <div className="font-brand font-black text-3xl md:text-4xl text-[#9E1B1D] mb-2">{stat.value}</div>
                    <p className="font-black text-[9px] uppercase tracking-widest opacity-50">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Next Expedition */}
              <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212]">
                <h4 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D] mb-6">Next Expedition</h4>
                {loading ? (
                  <div className="flex items-center gap-3 opacity-40">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-black text-xs uppercase">Loading...</span>
                  </div>
                ) : upcomingBooking ? (
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-dashed border-[#121212] pb-8 mb-8">
                      <div>
                        <h3 className="font-brand font-black text-4xl uppercase">{upcomingBooking.id}</h3>
                        <p className="font-black text-[10px] uppercase tracking-widest text-[#121212]/50 mt-1">
                          Booking ref • {upcomingBooking.numberOfTravelers} traveler{upcomingBooking.numberOfTravelers > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className={`font-black text-[9px] uppercase px-4 py-2 border ${STATUS_COLORS[upcomingBooking.bookingStatus]}`}>
                        {upcomingBooking.bookingStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-center">
                      <div>
                        <p className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-2">Primary Traveler</p>
                        <p className="font-black text-lg uppercase">{upcomingBooking.primaryTraveler?.firstName} {upcomingBooking.primaryTraveler?.lastName}</p>
                      </div>
                      <div>
                        <p className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-2">Total Paid</p>
                        <p className="font-black text-lg text-[#9E1B1D]">₹{(upcomingBooking.pricing?.total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border-4 border-dashed border-[#121212]/10">
                    <Package size={40} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black text-xs uppercase tracking-widest opacity-30 mb-6">No upcoming expeditions</p>
                    <Link to="/destinations" className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-8 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors">
                      Browse Expeditions <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "My Wishlist", href: "/wishlist", icon: Heart },
                  { label: "Price Alerts", href: "/price-alerts", icon: Bell },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    to={href}
                    className="border-[3px] border-[#121212] bg-white p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#F4BF4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                  >
                    <Icon size={20} className="text-[#9E1B1D] shrink-0" />
                    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
                    <ArrowRight size={14} className="ml-auto opacity-40" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === "BOOKINGS" && (
            <div className="border-[4px] border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212]">
              <div className="p-6 border-b-2 border-[#121212]/10">
                <h3 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D]">All Bookings</h3>
              </div>
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#9E1B1D]" size={32} /></div>
              ) : bookings.length === 0 ? (
                <div className="p-20 text-center font-black text-xs uppercase tracking-[0.3em] opacity-40">No booking records found.</div>
              ) : (
                <div className="divide-y-2 divide-[#121212]/10">
                  {bookings.map(booking => (
                    <div key={booking.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{booking.id}</p>
                        <p className="font-black text-[9px] uppercase tracking-widest text-[#121212]/40 mt-1">
                          {booking.primaryTraveler?.firstName} {booking.primaryTraveler?.lastName} • {booking.numberOfTravelers} traveler{booking.numberOfTravelers > 1 ? 's' : ''}
                        </p>
                        <p className="font-black text-xs uppercase tracking-widest text-[#9E1B1D] mt-1">₹{(booking.pricing?.total || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black text-[9px] uppercase px-3 py-1 border ${STATUS_COLORS[booking.bookingStatus] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {booking.bookingStatus}
                        </span>
                        <button
                          onClick={() => handleDownloadInvoice(booking)}
                          disabled={downloadingId === booking.id}
                          className="flex items-center gap-2 p-2.5 border-2 border-[#121212] hover:bg-[#F4BF4B] transition-colors disabled:opacity-50"
                          title="Download Invoice"
                        >
                          {downloadingId === booking.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {activeTab === "DOCUMENTS" && (
            <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212]">
              <h3 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D] mb-8">My Documents</h3>
              {bookings.length === 0 ? (
                <div className="py-20 text-center font-black text-xs uppercase tracking-[0.3em] opacity-40">No documents available.</div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex justify-between items-center border-b-2 border-[#121212]/10 pb-4">
                      <div className="flex items-center gap-4">
                        <FileText size={20} className="text-[#9E1B1D]" />
                        <div>
                          <p className="font-black text-xs uppercase tracking-tight">Invoice — {booking.id}</p>
                          <p className="font-black text-[9px] uppercase tracking-widest opacity-40">PDF • Booking Confirmation</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(booking)}
                        disabled={downloadingId === booking.id}
                        className="flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-5 py-2 font-black text-[9px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors disabled:opacity-50"
                      >
                        {downloadingId === booking.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PREFERENCES TAB ── */}
          {activeTab === "PREFERENCES" && (
            <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212] space-y-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D]">Account Preferences</h3>
              {[
                { label: "Email Notifications", desc: "Booking updates, price alerts, newsletters", defaultChecked: true },
                { label: "Price Alert Emails", desc: "Notify me when watched prices drop", defaultChecked: true },
                { label: "SMS Alerts", desc: "Trip reminders and departure day updates", defaultChecked: false },
                { label: "Marketing Communications", desc: "New expeditions, exclusive offers", defaultChecked: false },
              ].map(pref => (
                <label key={pref.label} className="flex items-start gap-6 cursor-pointer group">
                  <div className="relative shrink-0 mt-1">
                    <input type="checkbox" defaultChecked={pref.defaultChecked} className="sr-only peer" />
                    <div className="size-6 border-2 border-[#121212] peer-checked:bg-[#F4BF4B] transition-colors" />
                    <ShieldCheck size={12} className="absolute inset-0 m-auto opacity-0 peer-checked:opacity-100" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{pref.label}</p>
                    <p className="font-sans text-[10px] uppercase tracking-widest opacity-50 mt-1">{pref.desc}</p>
                  </div>
                </label>
              ))}
              <button className="mt-6 bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors">
                Save Preferences
              </button>
            </div>
          )}
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 bg-[#121212] text-[#FCFBF7] p-8 border-4 border-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B]">
            <div className="text-center mb-10">
              <div className="size-24 rounded-full border-4 border-[#F4BF4B] mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="font-brand font-black text-3xl text-[#F4BF4B]">A</span>
              </div>
              <h3 className="font-brand font-black text-2xl uppercase">Alex Traveler</h3>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#F4BF4B] mt-1">Gold Tier Explorer</p>
            </div>
            <div className="space-y-4 border-t border-white/10 pt-8">
              {[
                { label: "Expeditions", value: bookings.length || 3 },
                { label: "Countries", value: 12 },
                { label: "Total Invested", value: `₹${(totalSpent || 148500).toLocaleString()}` },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-60">
                  <span>{stat.label}</span>
                  <span>{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-white text-[#121212] py-4 font-black text-[10px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors"
              >
                Edit Profile
              </button>
              <Link
                to="/wishlist"
                className="w-full block text-center border-2 border-white/20 text-white py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                View Wishlist
              </Link>
              <Link
                to="/price-alerts"
                className="w-full block text-center border-2 border-white/20 text-white py-3.5 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Price Alerts
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};