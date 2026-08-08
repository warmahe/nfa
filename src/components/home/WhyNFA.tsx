import React from 'react';
import { DollarSign, ShieldCheck, Key, Settings } from 'lucide-react';

export const WhyNFA = () => {
    const points = [
        {
            icon: DollarSign,
            title: "THE PRICE.",
            body: "Every trip is priced on what it actually costs, not what a package can be marked up to. No bundled fees hiding inside a round number. Ask us for the breakdown, we'll show you exactly what goes where."
        },
        {
            icon: ShieldCheck,
            title: "HOW WE'RE CHEAPER.",
            body: "No agents stacked between you and the ground, no packaged margins built in to cover someone else's overhead. We deal directly, so the savings actually reach you instead of disappearing into someone's commission."
        },
        {
            icon: Key,
            title: "THE ACCESS.",
            body: "Stays and experiences you won't find by searching, built off years of relationships on the ground."
        },
        {
            icon: Settings,
            title: "THE FIT.",
            body: "Nothing templated, nothing pulled off a shelf. Every trip is built around you, start to finish."
        }
    ];

    return (
        <section className="bg-[#FCFBF7] py-20 md:py-32 px-[clamp(1rem,4vw,3rem)] border-t-4 border-[#121212] text-[#121212]">
            <div className="max-w-[1440px] mx-auto">

                {/* Banner 6 Header */}
                <div className="mb-16 text-center max-w-2xl mx-auto">
                    <span className="bg-[#F4BF4B] border-2 border-[#121212] px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.3em] shadow-[3px_3px_0px_0px_#121212] inline-block mb-4">
                        Direct & Transparent
                    </span>
                    <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-none tracking-tighter">
                        WHY <span className="text-[#9E1B1D]">NFA.</span>
                    </h2>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {points.map((pt, i) => (
                        <div key={i} className="border-4 border-[#121212] bg-white p-8 md:p-10 shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
                            <div>
                                <div className="size-12 bg-[#F4BF4B] border-2 border-[#121212] flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#121212]">
                                    <pt.icon size={22} className="text-[#121212]" />
                                </div>
                                <h3 className="font-brand font-black text-2xl md:text-3xl uppercase tracking-tight mb-4">{pt.title}</h3>
                                <p className="font-sans font-bold text-sm text-[#121212]/80 leading-relaxed">{pt.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};