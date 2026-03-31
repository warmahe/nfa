import React from 'react';

export const TheJourney = () => {
  const steps = [
    { num: "01", title: "THE CALL", desc: "Submit your application. We don't take everyone. We take the ready." },
    { num: "02", title: "THE VETTING", desc: "A 1-on-1 session to ensure your spirit matches the collective's frequency." },
    { num: "03", title: "THE PREP", desc: "Digital briefing, gear lists, and connection with your future cohort." },
    { num: "04", title: "THE DROP", desc: "Arrival at the extraction point. No turning back." }
  ];

  return (
    <section className="bg-[#D83333] py-20 md:py-32 px-4 lg:px-12 text-nfa-cream border-t border-[#9E1B1D]">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center">
        
        <h2 className="font-brand font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase text-center mb-16 shadow-nfa-charcoal/10 drop-shadow-md">
          THE JOURNEY.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {steps.map((step) => (
            <div key={step.num} className="border-2 border-nfa-cream/30 p-6 md:p-8 hover:bg-white/10 transition-colors">
               <span className="font-sans font-light text-5xl md:text-6xl lg:text-7xl opacity-50 block mb-6">{step.num}</span>
               <h3 className="font-sans font-black text-2xl uppercase tracking-tighter mb-4">{step.title}</h3>
               <p className="font-sans text-[11px] md:text-xs font-bold uppercase tracking-widest leading-relaxed opacity-90">{step.desc}</p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};