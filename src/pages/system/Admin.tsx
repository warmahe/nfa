import React, { useState } from 'react';
import { Database, Calendar, Package, FileText, Image as ImageIcon } from 'lucide-react';
import { AdminBookingManager } from '../../components/admin/AdminBookingManager';
import { ComprehensiveAdminDashboard } from '../../components/admin/ComprehensiveAdminDashboard';
// Add other imports as needed

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  const tabs = [
    { id: 'DASHBOARD', label: 'Overview', icon: Database },
    { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
    { id: 'PACKAGES', label: 'Packages', icon: Package },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-28 px-[clamp(1rem,4vw,3rem)] pb-20 nfa-texture">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-6xl uppercase tracking-tighter text-[#121212]">
             Admin <span className="text-[#9E1B1D]">Terminal.</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Sidebar */}
           <aside className="lg:col-span-3 space-y-2">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-4 p-4 border-2 border-[#121212] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                   activeTab === tab ? "bg-[#121212] text-[#F4BF4B] translate-x-1" : "bg-white hover:bg-[#F4BF4B]"
                 }`}
               >
                 <tab.icon size={16} /> {tab.label}
               </button>
             ))}
           </aside>

           {/* Content Area */}
           <div className="lg:col-span-9 border-4 border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212]">
              {activeTab === 'DASHBOARD' && <ComprehensiveAdminDashboard />}
              {activeTab === 'BOOKINGS' && <AdminBookingManager />}
              {activeTab === 'PACKAGES' && <div className="p-12 text-center font-black uppercase">Package Editor Interface</div>}
              {activeTab === 'GALLERY' && <div className="p-12 text-center font-black uppercase">Gallery Archive Management</div>}
           </div>
        </div>
      </div>
    </div>
  );
};