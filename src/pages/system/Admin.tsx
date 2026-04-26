import React, { useState } from 'react';
import { Calendar, Package, Image as ImageIcon, LayoutTemplate, MessageSquare, LogOut } from 'lucide-react';
import { AdminHomepageManager } from '../../components/admin/AdminHomepageManager';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { AdminGalleryManager } from '../../components/admin/AdminGalleryManager';
import { AdminPackagesManager } from '../../components/admin/AdminPackagesManager';
import { logoutUser } from '../../services/firebaseService';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('HOMEPAGE');



  const tabs = [
    { id: 'HOMEPAGE', label: 'Site Content', icon: LayoutTemplate },
    { id: 'PACKAGES', label: 'Packages', icon: Package },
    { id: 'REVIEWS', label: 'Field Logs', icon: MessageSquare },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-28 px-[clamp(1rem,4vw,3rem)] pb-20 nfa-texture">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-6xl uppercase tracking-tighter text-[#121212]">
             Admin <span className="text-[#9E1B1D]">Control Panel.</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <aside className="lg:col-span-3 space-y-2">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-4 p-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                   activeTab === tab.id ? "bg-[#121212] text-[#F4BF4B] translate-x-1" : "bg-white hover:bg-[#F4BF4B]"
                 }`}
               >
                 <tab.icon size={16} /> {tab.label}
               </button>
             ))}
             <button 
               onClick={() => { logoutUser(); window.location.href = '/login'; }}
               className="w-full flex items-center gap-4 p-4 border-2 border-red-600 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all mt-10"
             >
               <LogOut size={16} /> Exit Session
             </button>
           </aside>

           <div className="lg:col-span-9 border-4 border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212]">
              {activeTab === 'HOMEPAGE' && <AdminHomepageManager />}
              {activeTab === 'PACKAGES' && <AdminPackagesManager />}
              {activeTab === 'REVIEWS' && <AdminReviewsManager />}
              {activeTab === 'GALLERY' && <AdminGalleryManager />}

           </div>
        </div>
      </div>
    </div>
  );
};