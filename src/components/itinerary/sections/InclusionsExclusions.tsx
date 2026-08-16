import React, { useState } from 'react';
import {
  Check,
  X,
  Home,
  Truck,
  Utensils,
  Shield,
  User,
  Camera,
  Map,
  Coffee,
  Star,
  Gift,
  PlaneLanding,
  DollarSign,
  CreditCard,
  ShieldOff,
  WifiOff,
  Sparkles,
} from 'lucide-react';
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
  const legacyInclusions = (pkg as any)?.inclusions || [];
  const legacyExclusions = (pkg as any)?.exclusions || [];

  const inclusionsCount = inclusionsRich.length || legacyInclusions.length;
  const exclusionsCount = exclusionsRich.length || legacyExclusions.length;

  // Group rich items by category
  const groupedInclusions = inclusionsRich.reduce((acc, item) => {
    const cat = item.category || 'General Inclusions';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, RichInclusionExclusion[]>);

  const groupedExclusions = exclusionsRich.reduce((acc, item) => {
    const cat = item.category || 'Not Included';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, RichInclusionExclusion[]>);

  const hasContent = inclusionsCount > 0 || exclusionsCount > 0;
  if (!hasContent) return null;

  return (
    <section id="inclusions" className="py-20 px-6 md:px-16 bg-white border-y-4 border-[#121212] text-left">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D]">
            Trip Transparency
          </span>
          <h2 className="font-brand font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tighter text-[#121212] leading-[0.9]">
            WHAT'S INCLUDED & <br />
            <span className="text-[#F4BF4B] drop-shadow-[2px_2px_0px_#121212]">WHAT'S NOT.</span>
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex flex-col sm:flex-row border-4 border-[#121212] mb-10 w-full sm:w-fit shadow-[4px_4px_0px_0px_#121212]">
          <button
            type="button"
            onClick={() => setActiveTab('inclusions')}
            className={`px-8 sm:px-12 py-4 font-black text-xs uppercase tracking-[0.25em] transition-all border-b-4 sm:border-b-0 sm:border-r-4 border-[#121212] cursor-pointer ${
              activeTab === 'inclusions'
                ? 'bg-[#121212] text-[#F4BF4B]'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            WHAT'S INCLUDED ({inclusionsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exclusions')}
            className={`px-8 sm:px-12 py-4 font-black text-xs uppercase tracking-[0.25em] transition-all cursor-pointer ${
              activeTab === 'exclusions'
                ? 'bg-[#9E1B1D] text-white'
                : 'bg-white text-[#121212] hover:bg-[#FCFBF7]'
            }`}
          >
            WHAT'S NOT INCLUDED ({exclusionsCount})
          </button>
        </div>

        {/* Content panel */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'inclusions' ? (
            inclusionsRich.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Object.entries(groupedInclusions).map(([category, items], ci) => (
                  <div key={ci} className="space-y-4">
                    <h4 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212] flex items-center gap-2 border-b-2 border-[#121212]/10 pb-2">
                      <Sparkles size={14} className="text-emerald-600" /> {category}
                    </h4>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3.5 border-2 border-slate-100 hover:border-emerald-500/40 transition-colors bg-[#FCFBF7] group"
                        >
                          <div className="size-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
                            <IconRenderer name={item.icon || 'Check'} />
                          </div>
                          <span className="font-sans font-bold text-xs text-[#121212] leading-snug">
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-w-2xl">
                {legacyInclusions.map((text: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#FCFBF7] border-2 border-slate-200">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">{text}</span>
                  </div>
                ))}
              </div>
            )
          ) : exclusionsRich.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(groupedExclusions).map(([category, items], ci) => (
                <div key={ci} className="space-y-4">
                  <h4 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212] flex items-center gap-2 border-b-2 border-[#121212]/10 pb-2">
                    <span className="text-[#9E1B1D]">✕</span> {category}
                  </h4>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3.5 border-2 border-slate-100 hover:border-rose-300 transition-colors bg-[#FCFBF7]"
                      >
                        <div className="size-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                          <X size={16} />
                        </div>
                        <span className="font-sans font-bold text-xs text-slate-700 leading-snug">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {legacyExclusions.map((text: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#FCFBF7] border-2 border-slate-200">
                  <X size={16} className="text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">{text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
