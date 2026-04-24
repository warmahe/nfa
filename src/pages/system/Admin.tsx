import React, { useState } from 'react';
import { LayoutTemplate, Package, Calendar, MessageSquare, ImageIcon, LogOut } from 'lucide-react';
import { AdminHomepageManager } from '../../components/admin/AdminHomepageManager';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { AdminBookingManager } from '../../components/admin/AdminBookingManager';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { AdminGalleryManager } from '../../components/admin/AdminGalleryManager';
import { logoutUser } from '../../services/firebaseService';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('HOMEPAGE');

  const tabs = [
    { id: 'HOMEPAGE', label: 'Site Content', icon: LayoutTemplate },
    { id: 'DASHBOARD', label: 'Packages', icon: Package },
    { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
    { id: 'REVIEWS', label: 'Field Logs', icon: MessageSquare },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-28 px-4 md:px-8 pb-20 nfa-texture">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-12 border-b-4 border-[#121212] pb-8 flex justify-between items-end">
           <h1 className="font-brand font-black text-4xl md:text-6xl uppercase tracking-tighter">Admin <span className="text-[#9E1B1D]">Terminal.</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <aside className="lg:col-span-3 space-y-2">
             {tabs.map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 p-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-[#121212] text-[#F4BF4B] translate-x-1 shadow-[4px_4px_0_0_#9E1B1D]" : "bg-white hover:bg-[#F4BF4B]"}`}>
                 <tab.icon size={16} /> {tab.label}
               </button>
             ))}
             <button onClick={() => { logoutUser(); window.location.href = '/login'; }} className="w-full flex items-center gap-4 p-4 border-2 border-red-600 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all mt-10">
               <LogOut size={16} /> Log out
             </button>
           </aside>

           <div className="lg:col-span-9">
              {activeTab === 'HOMEPAGE' && <div className="border-4 border-[#121212] bg-white p-6 md:p-10 shadow-[8px_8px_0_0_#121212]"><AdminHomepageManager /></div>}
              {activeTab === 'DASHBOARD' && <AdminDashboard />}
              {activeTab === 'BOOKINGS' && <div className="border-4 border-[#121212] bg-white p-6 md:p-10 shadow-[8px_8px_0_0_#121212]"><AdminBookingManager /></div>}
              {activeTab === 'REVIEWS' && <div className="border-4 border-[#121212] bg-white p-6 md:p-10 shadow-[8px_8px_0_0_#121212]"><AdminReviewsManager /></div>}
              {activeTab === 'GALLERY' && <div className="border-4 border-[#121212] bg-white p-6 md:p-10 shadow-[8px_8px_0_0_#121212]"><AdminGalleryManager /></div>}
           </div>
        </div>
      </div>
    </div>
  );
};