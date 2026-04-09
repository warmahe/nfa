import React, { useState } from "react";
import { Calendar, Map, FileText, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const tabs = ["OVERVIEW", "BOOKINGS", "DOCUMENTS", "PREFERENCES"];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-none text-[#121212] mb-4">
             Welcome, Alex.
           </h1>
           <p className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-[#121212]/50">
             Your adventure archive and upcoming departures.
           </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mb-12 border-b-2 border-[#121212]/10 pb-4">
           {tabs.map(tab => (
             <button 
               key={tab} 
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] border-2 transition-all ${
                 activeTab === tab ? "bg-[#121212] text-[#F4BF4B] border-[#121212]" : "bg-white border-transparent hover:border-[#121212]"
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              
              {/* Trip Snapshot */}
              <section>
                 <h3 className="font-brand font-black text-2xl uppercase mb-6 flex items-center gap-3">
                   <Calendar className="text-[#9E1B1D]" /> Next Departure
                 </h3>
                 <div className="border-4 border-[#121212] bg-white p-8 shadow-[6px_6px_0px_0px_#121212]">
                    <div className="flex justify-between items-start mb-6">
                       <h4 className="font-brand font-black text-3xl uppercase">The Icelandic Drift</h4>
                       <span className="bg-[#9E1B1D] text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest">Confirmed</span>
                    </div>
                    <div className="grid grid-cols-2 gap-8 border-t-2 border-[#121212]/10 pt-6">
                       <div>
                          <p className="font-sans text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Departure</p>
                          <p className="font-bold">Oct 15, 2026</p>
                       </div>
                       <div>
                          <p className="font-sans text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                          <p className="font-bold">Awaiting Briefing</p>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Past Trips */}
              <section>
                 <h3 className="font-brand font-black text-2xl uppercase mb-6 flex items-center gap-3">
                   <Map className="text-[#9E1B1D]" /> Past Journeys
                 </h3>
                 <div className="space-y-4">
                    {["The Nepalese Void", "Atacama Descent"].map(trip => (
                       <div key={trip} className="border-2 border-[#121212] p-6 flex justify-between items-center hover:bg-[#F4BF4B] transition-colors group">
                          <span className="font-black uppercase tracking-widest text-sm">{trip}</span>
                          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Sidebar: Profile Summary */}
           <aside className="border-4 border-[#121212] bg-[#121212] text-white p-8 h-fit shadow-[8px_8px_0px_0px_#F4BF4B]">
              <div className="text-center mb-8">
                 <div className="size-24 rounded-full border-4 border-[#F4BF4B] mx-auto mb-6 overflow-hidden bg-gray-300" />
                 <h3 className="font-brand font-black text-2xl uppercase">Alex Traveler</h3>
                 <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#F4BF4B]">Gold Tier Explorer</p>
              </div>
              
              <div className="space-y-4 border-t border-white/10 pt-8">
                 <div className="flex justify-between font-sans text-xs font-bold uppercase tracking-widest">
                    <span>Expeditions</span> <span>03</span>
                 </div>
                 <div className="flex justify-between font-sans text-xs font-bold uppercase tracking-widest">
                    <span>Countries</span> <span>12</span>
                 </div>
              </div>
              
              <Link to="/settings" className="mt-10 w-full bg-white text-[#121212] py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#F4BF4B] transition-colors">
                <Settings size={14}/> Edit Profile
              </Link>
           </aside>
        </div>
      </div>
    </div>
  );
};