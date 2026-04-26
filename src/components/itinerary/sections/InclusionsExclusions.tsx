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

  // Group rich items by category
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
    <section id="inclusions" className="py-24 px-6 md:px-16 bg-white border-y-4 border-[#121212]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-3">
            Mission Briefing
          </span>
          <h2 className="font-brand font-black text-[clamp(3rem,7vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
            Assets & <br />Liabilities.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex flex-col sm:flex-row border-4 border-[#121212] mb-12 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('inclusions')}
            className={`px-12 py-5 font-black text-[11px] uppercase tracking-[0.3em] transition-all border-b-4 sm:border-b-0 sm:border-r-4 border-[#121212] ${
              activeTab === 'inclusions'
                ? 'bg-[#121212] text-[#F4BF4B]'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            Tactical Inclusions ({inclusionsRich.length || legacyInclusions.length})
          </button>
          <button
            onClick={() => setActiveTab('exclusions')}
            className={`px-12 py-5 font-black text-[11px] uppercase tracking-[0.3em] transition-all ${
              activeTab === 'exclusions'
                ? 'bg-[#9E1B1D] text-white'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            Operational Exclusions ({exclusionsRich.length || legacyExclusions.length})
          </button>
        </div>

        {/* Content panel */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'inclusions' ? (
            inclusionsRich.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedInclusions).map(([category, items], ci) => (
                  <div key={ci} className="space-y-4">
                    <h4 className="font-brand font-black text-xl uppercase tracking-tighter text-[#121212] flex items-center gap-3">
                      <div className="w-8 h-1 bg-green-500" /> {category}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-green-500/30 transition-colors bg-gray-50/30 group">
                          <div className="size-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <IconRenderer name={item.icon} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-700">{item.text}</span>
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
                  <div key={i} className="flex items-start gap-4 p-6 border-2 border-[#121212] bg-[#FCFBF7]">
                    <Check size={18} className="text-green-600 shrink-0 mt-1" />
                    <span className="font-bold text-sm uppercase tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            exclusionsRich.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedExclusions).map(([category, items], ci) => (
                  <div key={ci} className="space-y-4">
                    <h4 className="font-brand font-black text-xl uppercase tracking-tighter text-[#121212] flex items-center gap-3">
                      <div className="w-8 h-1 bg-red-500" /> {category}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-red-500/30 transition-colors bg-gray-50/30 group">
                          <div className="size-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <IconRenderer name={item.icon} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-700">{item.text}</span>
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
                  <div key={i} className="flex items-start gap-4 p-6 border-2 border-red-200 bg-red-50/30">
                    <X size={18} className="text-red-500 shrink-0 mt-1" />
                    <span className="font-bold text-sm uppercase tracking-wide text-gray-500">{item}</span>
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
