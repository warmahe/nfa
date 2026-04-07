import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { User, Calendar, CreditCard, ArrowRight, ArrowLeft, Check, Info } from "lucide-react";
import { DESTINATIONS, PACKAGES } from "../../utils/constants";

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Find trip details
  const destination = DESTINATIONS.find(d => d.id === id);
  const pkg = PACKAGES.find(p => p.id === id) || PACKAGES[0];
  const priceInt = parseInt(pkg.price.replace(/[^0-9]/g, ''));

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-20 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1200px] mx-auto">
        
        {/* ================================== */}
        {/* HEADER & PROGRESS                 */}
        {/* ================================== */}
        <header className="mb-12 border-b-4 border-[#121212] pb-8">
           <h1 className="font-brand font-black text-4xl md:text-7xl uppercase tracking-tighter text-[#121212]">
             Trip <br/><span className="text-[#9E1B1D]">Registration.</span>
           </h1>
           
           <div className="flex gap-4 mt-10 overflow-x-auto pb-2">
              {[
                { n: 1, label: "Your Details", icon: User },
                { n: 2, label: "Trip Review", icon: Calendar },
                { n: 3, label: "Finalize", icon: CreditCard }
              ].map((s) => (
                <div key={s.n} className={`flex items-center gap-3 shrink-0 transition-all ${step >= s.n ? 'opacity-100' : 'opacity-30'}`}>
                   <div className={`size-10 border-2 border-[#121212] flex items-center justify-center font-black ${step >= s.n ? 'bg-[#F4BF4B]' : 'bg-white'}`}>
                      {step > s.n ? <Check size={18}/> : s.n}
                   </div>
                   <span className="font-black text-[10px] uppercase tracking-widest hidden sm:block">{s.label}</span>
                   {s.n < 3 && <div className="w-8 h-0.5 bg-[#121212]/20 mx-2 hidden md:block" />}
                </div>
              ))}
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ================================== */}
          {/* FORM AREA (Step Logic)            */}
          {/* ================================== */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  <h2 className="font-brand font-black text-3xl uppercase tracking-tight mb-8">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">First Name</label>
                       <input type="text" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Last Name</label>
                       <input type="text" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">Email Address</label>
                     <input type="email" className="bg-white border-2 border-[#121212] p-4 font-bold outline-none focus:bg-[#FCFBF7] focus:shadow-[4px_4px_0_0_#F4BF4B] transition-all" />
                  </div>
                  <button onClick={nextStep} className="w-full md:w-fit bg-[#121212] text-[#F4BF4B] px-12 py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                     Continue To Review
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                   <h2 className="font-brand font-black text-3xl uppercase tracking-tight mb-8">Confirm Details</h2>
                   <div className="border-4 border-[#121212] bg-[#F4BF4B] p-8 shadow-[8px_8px_0_0_#121212]">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                           <p className="text-[10px] font-black uppercase opacity-60 mb-1">Trip Name</p>
                           <h3 className="font-brand font-black text-3xl uppercase leading-none">{pkg.title}</h3>
                        </div>
                        <span className="bg-[#121212] text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest">Active Search</span>
                      </div>
                      <div className="grid grid-cols-2 gap-8 border-t-2 border-[#121212]/10 pt-6">
                         <div>
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Check In</p>
                            <p className="font-bold uppercase tracking-widest text-sm">Oct 15, 2026</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase opacity-60 mb-1">Check Out</p>
                            <p className="font-bold uppercase tracking-widest text-sm">Oct 20, 2026</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={prevStep} className="p-5 border-2 border-[#121212] hover:bg-white transition-colors">
                         <ArrowLeft size={20}/>
                      </button>
                      <button onClick={nextStep} className="flex-1 bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-widest border-2 border-[#121212] shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                         Proceed To Payment
                      </button>
                   </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8 text-center py-12">
                   <div className="size-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0_0_#121212] border-2 border-white">
                      <Check size={40} strokeWidth={3}/>
                   </div>
                   <h2 className="font-brand font-black text-5xl uppercase tracking-tight mb-4 text-[#121212]">Ready to Depart</h2>
                   <p className="font-serif italic text-xl text-gray-500 mb-12 max-w-md mx-auto">Your registration details have been validated. We are ready to secure your spot.</p>
                   <button onClick={() => navigate('/dashboard')} className="w-full bg-[#121212] text-[#F4BF4B] py-6 font-black text-sm uppercase tracking-widest shadow-[8px_8px_0_0_#9E1B1D]">
                      COMPLETE FINAL PAYMENT
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ================================== */}
          {/* SIDEBAR: SUMMARY LEDGER           */}
          {/* ================================== */}
          <div className="lg:col-span-5 sticky top-28">
             <div className="border-[4px] border-[#121212] bg-white p-8 shadow-[12px_12px_0_0_#121212]">
                <h4 className="font-black text-xs uppercase tracking-[0.3em] text-[#9E1B1D] mb-8 border-b-2 border-gray-100 pb-4 flex items-center gap-3">
                   <Info size={16}/> Summary Ledger
                </h4>
                
                <div className="space-y-6">
                   <div className="flex gap-6 items-center">
                      <div className="size-20 border-2 border-[#121212] bg-[#121212] shrink-0 overflow-hidden">
                         <img src={pkg.image} className="w-full h-full object-cover opacity-80" alt="summary"/>
                      </div>
                      <div>
                         <p className="font-black text-xs uppercase tracking-tight">{pkg.title}</p>
                         <p className="font-bold text-[9px] uppercase tracking-widest text-[#121212]/40 mt-1">{pkg.duration} // {pkg.destination}</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t-2 border-dashed border-[#121212]/10 space-y-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                         <span>Transfer Cost</span>
                         <span>{pkg.price}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight opacity-60">
                         <span>Registry Fee</span>
                         <span>₹150</span>
                      </div>
                      <div className="flex justify-between items-end pt-6 border-t-2 border-[#121212]">
                         <span className="font-black text-sm uppercase tracking-widest">Total Investment</span>
                         <span className="font-brand font-black text-4xl text-[#9E1B1D]">₹{(priceInt + 150).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-10 p-4 bg-[#FCFBF7] border border-dashed border-[#121212]/20 text-[9px] font-bold uppercase tracking-widest leading-relaxed text-gray-400">
                   By completing this form, you acknowledge that NFA trips are physically demanding and require a non-tourist mindset.
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;