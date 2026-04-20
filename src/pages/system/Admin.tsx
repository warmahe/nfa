import React, { useState } from 'react';
import { Database, Calendar, Package, Image as ImageIcon, LayoutTemplate, RefreshCw, MessageSquare, LogOut } from 'lucide-react';
import { AdminBookingManager } from '../../components/admin/AdminBookingManager';
import { ComprehensiveAdminDashboard } from '../../components/admin/ComprehensiveAdminDashboard';
import { AdminHomepageManager } from '../../components/admin/AdminHomepageManager';
import { initializeFirestoreDatabase } from '../../services/firebaseSeeder';
import { AdminReviewsManager } from '../../components/admin/AdminReviewsManager';
import { AdminGalleryManager } from '../../components/admin/AdminGalleryManager';
import { logoutUser } from '../../services/firebaseService';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('HOMEPAGE');
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    if (window.confirm("This will populate your database with sample data. Continue?")) {
      setSeeding(true);
      try {
        await initializeFirestoreDatabase();
        alert("Database seeded successfully.");
      } catch (err) {
        alert("Error: " + err);
      } finally {
        setSeeding(false);
      }
    }
  };

  const tabs = [
    { id: 'HOMEPAGE', label: 'Site Content', icon: LayoutTemplate },
    { id: 'DASHBOARD', label: 'Packages', icon: Package },
    { id: 'BOOKINGS', label: 'Bookings', icon: Calendar },
    { id: 'REVIEWS', label: 'Field Logs', icon: MessageSquare },
    { id: 'DATABASE', label: 'Database', icon: Database },
    { id: 'GALLERY', label: 'Gallery', icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-28 px-[clamp(1rem,4vw,3rem)] pb-20 nfa-texture">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-6xl uppercase tracking-tighter text-[#121212]">
             Admin <span className="text-[#9E1B1D]">Terminal.</span>
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
               <LogOut size={16} /> Terminate Session
             </button>
           </aside>

           <div className="lg:col-span-9 border-4 border-[#121212] bg-white p-8 shadow-[8px_8px_0px_0px_#121212]">
              {activeTab === 'HOMEPAGE' && <AdminHomepageManager />}
              {activeTab === 'DASHBOARD' && <ComprehensiveAdminDashboard />}
              {activeTab === 'BOOKINGS' && <AdminBookingManager />}
              {activeTab === 'REVIEWS' && <AdminReviewsManager />}
              {activeTab === 'GALLERY' && <AdminGalleryManager />}
              {activeTab === 'DATABASE' && (
                <div className="p-12 text-center space-y-8">
                   <h2 className="font-brand font-black text-3xl uppercase">System Maintenance</h2>
                   <p className="font-sans font-bold text-xs uppercase tracking-widest text-gray-500 max-w-md mx-auto">
                     Populate your Firestore collections with the default operational data set.
                   </p>
                   <button 
                    onClick={handleSeed}
                    disabled={seeding}
                    className="bg-[#121212] text-[#F4BF4B] px-10 py-5 font-black text-xs uppercase tracking-widest flex items-center gap-4 mx-auto hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[6px_6px_0_0_#F4BF4B]"
                   >
                     <RefreshCw size={18} className={seeding ? "animate-spin" : ""} />
                     {seeding ? "PROCESSING..." : "SEED DATABASE"}
                   </button>
                </div>
              )}
              {activeTab === 'GALLERY' && <div className="p-12 text-center font-black uppercase">Gallery Archive Management</div>}
           </div>
        </div>
      </div>
    </div>
  );
};