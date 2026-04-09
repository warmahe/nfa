import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Check, Target, User, Calendar, ShieldCheck } from "lucide-react";
import { PACKAGES } from "../../utils/constants";

export const Booking = () => {
  const { id } = useParams();
  const pkg = PACKAGES.find(p => p.id === id) || PACKAGES[0];
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: FORM SECTION */}
        <div className="lg:col-span-8">
           <div className="flex items-center gap-3 mb-10 border-b-4 border-[#121212] pb-6">
              <span className="font-black text-[10px] uppercase tracking-[0.3em] bg-[#121212] text-[#F4BF4B] px-3 py-1">Mission Setup // 0{step}</span>
              <h1 className="font-brand font-black text-3xl uppercase tracking-tighter">Registration</h1>
           </div>

           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                 <h2 className="font-brand font-black text-4xl uppercase mb-8">Personnel Data</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="FULL NAME" className="border-4 border-[#121212] p-5 font-black uppercase tracking-widest text-xs outline-none focus:bg-[#F4BF4B]/10" />
                    <input type="email" placeholder="EMAIL ADDRESS" className="border-4 border-[#121212] p-5 font-black uppercase tracking-widest text-xs outline-none focus:bg-[#F4BF4B]/10" />
                 </div>
                 <button onClick={() => setStep(2)} className="bg-[#121212] text-[#F4BF4B] px-10 py-5 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#9E1B1D] hover:shadow-none transition-all">
                   Deploy Parameters <ArrowRight size={16} className="inline ml-2"/>
                 </button>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                 <h2 className="font-brand font-black text-4xl uppercase mb-8">Expedition Confirmation</h2>
                 <div className="border-4 border-[#121212] p-8 bg-white shadow-[6px_6px_0px_0px_#121212]">
                    <h3 className="font-black uppercase tracking-widest mb-4">{pkg.title}</h3>
                    <p className="font-serif italic text-sm mb-6">{pkg.description}</p>
                    <div className="flex justify-between border-t-2 border-[#121212] pt-4 font-black uppercase text-xs">
                       <span>Total Personnel</span>
                       <span>01</span>
                    </div>
                 </div>
                 <button onClick={() => setStep(3)} className="bg-[#9E1B1D] text-white px-10 py-5 font-black uppercase text-xs tracking-widest border-4 border-[#121212] hover:bg-[#121212] transition-all">
                   Finalize Registration
                 </button>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border-4 border-dashed border-[#121212]/30">
                  <ShieldCheck size={64} className="mx-auto text-[#9E1B1D] mb-6"/>
                  <h2 className="font-brand font-black text-4xl uppercase mb-4">Transmission Sent.</h2>
                  <p className="font-sans font-bold uppercase text-[10px] tracking-[0.2em] opacity-60">We will verify your profile within 24 hours.</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* RIGHT: LEDGER SIDEBAR */}
        <div className="lg:col-span-4">
           <div className="sticky top-28 border-[4px] border-[#121212] bg-[#F4BF4B] p-8 shadow-[8px_8px_0px_0px_#121212]">
              <div className="flex items-center gap-3 mb-8 border-b-2 border-[#121212] pb-4">
                <Target size={20}/>
                <h3 className="font-black uppercase tracking-widest text-sm">Mission Ledger</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between font-black text-xs uppercase tracking-widest">
                   <span>Package</span>
                   <span>{pkg.title}</span>
                </div>
                <div className="flex justify-between font-black text-xs uppercase tracking-widest">
                   <span>Investment</span>
                   <span>{pkg.price}</span>
                </div>
                <div className="pt-6 border-t-2 border-[#121212] flex justify-between items-center">
                   <span className="font-black text-xs uppercase tracking-widest">Total</span>
                   <span className="font-brand font-black text-4xl">{pkg.price}</span>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};