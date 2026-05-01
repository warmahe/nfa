import React, { useState } from 'react';
import { Check, X, Home, Truck, Utensils, Shield, User, Camera, Map, Coffee, Star, Gift, PlaneLanding, DollarSign, CreditCard, ShieldOff, WifiOff } from 'lucide-react';
import { Package, RichInclusionExclusion } from '../../../types/database';

interface InclusionsExclusionsProps {
  pkg: Package;
}

const IconRenderer: React.FC<{ name?: string }> = ({ name }) => {
  switch (name) {
    case 'Home': return <Home size={18} />;
    case 'Truck': return <Truck size={18} />;
    case 'Utensils': return <Utensils size={18} />;
    case 'Shield': return <Shield size={18} />;
    case 'User': return <User size={18} />;
    case 'Camera': return <Camera size={18} />;
    case 'Map': return <Map size={18} />;
    case 'Coffee': return <Coffee size={18} />;
    case 'Star': return <Star size={18} />;
    case 'Gift': return <Gift size={18} />;
    case 'PlaneLanding': return <PlaneLanding size={18} />;
    case 'DollarSign': return <DollarSign size={18} />;
    case 'CreditCard': return <CreditCard size={18} />;
    case 'ShieldOff': return <ShieldOff size={18} />;
    case 'WifiOff': return <WifiOff size={18} />;
    case 'Check': return <Check size={18} />;
    case 'X': return <X size={18} />;
    default: return <Check size={18} />;
  }
};

export const InclusionsExclusions: React.FC<InclusionsExclusionsProps> = ({ pkg }) => {
  const [activeTab, setActiveTab] = useState<'inclusions' | 'exclusions'>('inclusions');

  const inclusionsRich = pkg?.inclusionsRich || [];
  const exclusionsRich = pkg?.exclusionsRich || [];
  const legacyInclusions = pkg?.inclusions || [];
  const legacyExclusions = pkg?.exclusions || [];

  const groupedInclusions = inclusionsRich.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, RichInclusionExclusion[]>);

  const groupedExclusions = exclusionsRich.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, RichInclusionExclusion[]>);

  const hasContent = inclusionsRich.length > 0 || exclusionsRich.length > 0 || legacyInclusions.length > 0 || legacyExclusions.length > 0;
  if (!hasContent) return null;

  return (
    <section id="inclusions" className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto bg-[#FCFBF7]">
      <div className="border-4 border-[#121212] bg-[#FCFBF7] shadow-[12px_12px_0_0_#121212] p-8 md:p-12 relative overflow-hidden">
        
        {/* Background stamp */}
        <div className="absolute top-10 right-10 opacity-5 pointer-events-none rotate-12">
          <Shield size={200} />
        </div>

        {/* Header */}
        <div className="mb-12 relative z-10">
          <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212] bg-[#F4BF4B] mb-6 shadow-[4px_4px_0_0_#121212]">
            What's Covered / What's Not
          </span>
          <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85]">
            Provisions & <br />Omissions
          </h2>
        </div>

        {/* Tab bar (Clipboard style) */}
        <div className="flex flex-col sm:flex-row border-4 border-[#121212] mb-12 w-full sm:w-fit relative z-10 bg-white shadow-[6px_6px_0_0_#121212]">
          <button
            onClick={() => setActiveTab('inclusions')}
            className={`px-8 md:px-12 py-5 font-brand font-black text-sm md:text-lg uppercase tracking-wide transition-all sm:border-r-4 border-[#121212] ${
              activeTab === 'inclusions'
                ? 'bg-[#121212] text-[#F4BF4B]'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            Tactical Provisions ({inclusionsRich.length || legacyInclusions.length})
          </button>
          <button
            onClick={() => setActiveTab('exclusions')}
            className={`px-8 md:px-12 py-5 font-brand font-black text-sm md:text-lg uppercase tracking-wide transition-all border-t-4 sm:border-t-0 border-[#121212] ${
              activeTab === 'exclusions'
                ? 'bg-[#9E1B1D] text-[#FCFBF7]'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            Operational Omissions ({exclusionsRich.length || legacyExclusions.length})
          </button>
        </div>

        {/* Content panel */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          {activeTab === 'inclusions' ? (
            inclusionsRich.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedInclusions).map(([category, items], ci) => (
                  <div key={ci} className="space-y-4">
                    <h4 className="font-brand font-black text-2xl uppercase tracking-tighter text-[#121212] flex items-center gap-3 border-b-4 border-[#121212] pb-2">
                      <div className="size-4 bg-[#F4BF4B] border-2 border-[#121212]" /> {category}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-2 border-dashed border-[#121212]/30 hover:border-[#121212] hover:bg-[#F4BF4B] transition-colors bg-white group">
                          <div className="size-10 bg-white border-2 border-[#121212] flex items-center justify-center text-[#121212] group-hover:scale-110 transition-transform">
                            <IconRenderer name={item.icon} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wide text-[#121212]">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback to legacy inclusions */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {legacyInclusions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 border-4 border-[#121212] bg-[#F4BF4B]/10 hover:bg-[#F4BF4B] transition-colors">
                    <div className="bg-[#121212] text-[#F4BF4B] p-1 shrink-0 mt-1">
                       <Check size={16} strokeWidth={4} />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide text-[#121212]">{item}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            exclusionsRich.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedExclusions).map(([category, items], ci) => (
                  <div key={ci} className="space-y-4">
                    <h4 className="font-brand font-black text-2xl uppercase tracking-tighter text-[#121212] flex items-center gap-3 border-b-4 border-[#121212] pb-2">
                      <div className="size-4 bg-[#9E1B1D] border-2 border-[#121212]" /> {category}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-2 border-dashed border-[#121212]/30 hover:border-[#121212] hover:bg-[#9E1B1D]/10 transition-colors bg-white group">
                          <div className="size-10 bg-white border-2 border-[#121212] flex items-center justify-center text-[#9E1B1D] group-hover:scale-110 transition-transform">
                            <IconRenderer name={item.icon} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wide text-[#121212]">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback to legacy exclusions */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {legacyExclusions.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 border-4 border-[#121212] bg-[#9E1B1D]/5 hover:bg-[#9E1B1D]/10 transition-colors">
                    <div className="bg-[#9E1B1D] text-white p-1 shrink-0 mt-1">
                       <X size={16} strokeWidth={4} />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide text-[#121212]/70">{item}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};
