import React, { useState } from "react";
import { EditProfileModal } from "../../components/user/EditProfileModal";
import { Calendar, Map, FileText, Settings, ArrowRight, ShieldCheck } from "lucide-react";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabs = ["OVERVIEW", "BOOKINGS", "DOCUMENTS", "PREFERENCES"];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Content */}
        <main className="lg:col-span-8">
          <header className="mb-12 border-b-4 border-[#121212] pb-8">
            <h1 className="font-brand font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-[#121212]">
              YOUR <br/><span className="text-[#9E1B1D]">JOURNAL.</span>
            </h1>
          </header>

          {/* Tab Switcher */}
          <div className="flex flex-wrap gap-2 mb-12">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${
                  activeTab === tab ? "bg-[#121212] text-[#F4BF4B] border-[#121212]" : "bg-white border-[#121212] hover:bg-[#F4BF4B]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Pane */}
          <div className="border-[4px] border-[#121212] bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_#121212]">
             {activeTab === "OVERVIEW" && (
                <div className="space-y-8">
                  <h4 className="font-black text-xs uppercase tracking-widest text-[#9E1B1D]">Next Expedition</h4>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-dashed border-[#121212] pb-8">
                    <h3 className="font-brand font-black text-4xl uppercase">Icelandic Drift</h3>
                    <div className="bg-[#9E1B1D] text-white px-4 py-2 font-black text-[9px] uppercase tracking-widest">Confirmed</div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div><p className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-2">Departure</p><p className="font-black text-xl">Oct 15, 2026</p></div>
                    <div><p className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-2">Duration</p><p className="font-black text-xl">5 Days</p></div>
                  </div>
                </div>
             )}
             {activeTab !== "OVERVIEW" && (
                <div className="py-20 text-center font-black text-xs uppercase tracking-[0.3em] opacity-40">No records in the {activeTab} sector.</div>
             )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
           <div className="sticky top-28 bg-[#121212] text-[#FCFBF7] p-8 border-4 border-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B]">
              <div className="text-center mb-10">
                 <div className="size-24 rounded-full border-4 border-[#F4BF4B] mx-auto mb-6 bg-gray-800" />
                 <h3 className="font-brand font-black text-2xl uppercase">Alex Traveler</h3>
                 <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-[#F4BF4B]">Gold Tier Explorer</p>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-8">
                 <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-60">
                    <span>Expeditions</span> <span>03</span>
                 </div>
                 <div className="flex justify-between font-black text-[10px] uppercase tracking-widest opacity-60">
                    <span>Countries</span> <span>12</span>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-10 w-full bg-white text-[#121212] py-4 font-black text-[10px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors"
              >
                Edit Profile
              </button>
           </div>
        </aside>
      </div>

      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};