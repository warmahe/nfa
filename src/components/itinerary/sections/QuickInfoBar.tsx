import React from 'react';
import { Clock, Calendar, Users, Zap, BedDouble, Compass } from 'lucide-react';
import { Package } from '../../../types/database';

interface QuickInfoBarProps {
  pkg: Package;
}

const InfoItem: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center sm:items-start gap-3 px-6 py-6 border-b-2 sm:border-b-0 sm:border-r-2 border-[#121212]/10 last:border-0 group">
    <div className="size-10 bg-[#F4BF4B] border-2 border-[#121212] flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform">
      <Icon size={18} className="text-[#121212]" />
    </div>
    <div className="text-center sm:text-left">
      <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-[#121212]/40 mb-0.5">{label}</span>
      <span className="block font-black text-sm uppercase tracking-tight text-[#121212] leading-tight">{value}</span>
    </div>
  </div>
);

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ pkg }) => {
  const departureDateLabel = pkg?.departureDate
    ? new Date(pkg.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Multiple Dates';

  const items = [
    { icon: Clock, label: 'Duration', value: pkg?.duration || '7 Days' },
    { icon: Calendar, label: 'Next Departure', value: departureDateLabel },
    { icon: Users, label: 'Group Size', value: `Max ${pkg?.maxTravelers || 6} People` },
    { icon: Zap, label: 'Trip Style', value: pkg?.tripStyle || 'Adventure' },
    { icon: BedDouble, label: 'Accommodation', value: pkg?.accommodation || 'Luxury Camps' },
    { icon: Compass, label: 'Guide', value: pkg?.guideType || 'Expert Local Guides' },
  ];

  return (
    <section
      id="quick-info"
      className="border-y-4 border-[#121212] bg-white"
      aria-label="Trip quick info"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x-0 sm:divide-x-2 divide-[#121212]/10">
          {items.map((item, i) => (
            <InfoItem key={i} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </section>
  );
};
