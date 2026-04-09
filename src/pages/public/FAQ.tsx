import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, HelpCircle, X } from 'lucide-react';
import { FAQ_DATA } from '../../utils/constants';

export const FAQ = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = ["ALL", ...Array.from(new Set(FAQ_DATA.map(f => f.category)))];

  // Filtering Logic
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === "ALL" || faq.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-[1000px] mx-auto">
        
        {/* HEADER */}
        <div className="border-b-[4px] border-[#121212] pb-12 mb-12">
          <div className="flex items-center gap-3 text-[#9E1B1D] mb-4">
             <HelpCircle size={18} />
             <span className="font-black text-[10px] uppercase tracking-[0.3em]">Operational Intelligence</span>
          </div>
          <h1 className="font-brand font-black text-[clamp(2.5rem,7vw,6rem)] leading-[0.85] uppercase tracking-tighter text-[#121212]">
            FIELD <br/><span className="text-[#9E1B1D]">QUERY.</span>
          </h1>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="mb-12 space-y-6">
          <div className="relative border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212]">
             <input 
               type="text" 
               placeholder="SEARCH ARCHIVES..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white p-6 font-black uppercase tracking-widest text-xs md:text-sm outline-none"
             />
             <Search className="absolute right-6 top-6 text-[#121212]" size={20} />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest transition-all ${
                  activeCategory === cat ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-white hover:bg-[#F4BF4B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ LIST */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div key={faq.id} className="border-2 border-[#121212] bg-white shadow-[4px_4px_0px_0px_#121212]">
                <button 
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full p-6 md:p-8 flex justify-between items-center group"
                >
                  <span className="font-brand font-black text-lg md:text-xl uppercase tracking-tight text-left pr-4">
                    {faq.question}
                  </span>
                  <div className={`size-8 shrink-0 flex items-center justify-center border-2 border-[#121212] ${openId === faq.id ? 'bg-[#F4BF4B]' : ''}`}>
                    <ChevronDown size={16} className={`transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
<AnimatePresence initial={false}>
  {openId === faq.id && (
    <motion.div 
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ 
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 } 
      }}
      className="overflow-hidden"
    >
      <div className="px-8 pb-8 pt-2 font-serif text-lg leading-relaxed text-[#121212]/80 border-t-2 border-dashed border-[#121212]/10">
        {faq.answer}
      </div>
    </motion.div>
  )}
</AnimatePresence>
              </div>
            ))
          ) : (
            <div className="p-20 text-center border-4 border-dashed border-[#121212]/20">
               <X size={32} className="mx-auto text-[#9E1B1D] mb-4"/>
               <p className="font-black uppercase tracking-widest text-xs">No records matching query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};