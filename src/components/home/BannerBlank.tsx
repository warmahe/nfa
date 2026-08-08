import React from 'react';
import { motion } from 'motion/react';
import { FileText } from 'lucide-react';

export const BannerBlank = () => {
    return (
        <section className="bg-[#FCFBF7] py-20 md:py-28 px-[clamp(1rem,4vw,3rem)] border-b-4 border-[#121212] text-[#121212]">
            <div className="max-w-5xl mx-auto border-4 border-[#121212] bg-white p-8 md:p-16 shadow-[10px_10px_0px_0px_#121212] relative">
                <div className="flex items-center gap-3 mb-6 bg-[#121212] text-[#F4BF4B] px-4 py-1.5 w-fit">
                    <FileText size={16} />
                    <span className="font-sans font-black text-[10px] uppercase tracking-[0.3em]">Blank Canvas Protocol</span>
                </div>

                <h2 className="font-brand font-black text-[clamp(2.2rem,5vw,4.5rem)] uppercase leading-[0.9] tracking-tighter mb-8">
                    EVERY TRIP <br className="hidden sm:block" /><span className="text-[#9E1B1D]">STARTS BLANK.</span>
                </h2>

                <p className="font-sans font-bold text-base md:text-xl text-[#121212]/80 leading-relaxed border-l-4 border-[#F4BF4B] pl-6 md:pl-8">
                    We don't work off templates like most others do. No fixed route, no group you're slotted into, nothing copied from someone else's trip to save us time. <br /><br />
                    We start with a blank page and your name on it. Then we ask what the next fifteen days should feel like, who's coming with you, what you actually want out of it. The trip gets built from there, step by step. <br /><br />
                    <span className="text-[#9E1B1D]">This is travel that fits you. Not the other way round.</span>
                </p>
            </div>
        </section>
    );
};