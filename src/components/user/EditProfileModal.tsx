import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className="bg-[#FCFBF7] border-[4px] border-[#121212] w-full max-w-lg p-8 shadow-[12px_12px_0px_0px_#9E1B1D] relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
            <X size={20} />
          </button>

          <h2 className="font-brand font-black text-4xl uppercase mb-8">Update Records</h2>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase tracking-widest opacity-40">First Name</label>
                <input className="border-2 border-[#121212] p-4 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10" defaultValue="Alex" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-black text-[9px] uppercase tracking-widest opacity-40">Last Name</label>
                <input className="border-2 border-[#121212] p-4 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10" defaultValue="Traveler" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-black text-[9px] uppercase tracking-widest opacity-40">Email</label>
              <input type="email" className="border-2 border-[#121212] p-4 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10" defaultValue="alex@nfa.com" />
            </div>
            <button className="w-full bg-[#121212] text-[#F4BF4B] py-5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#9E1B1D] transition-colors shadow-[4px_4px_0px_0px_#F4BF4B]">
              <Save size={16} /> Save Changes
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};