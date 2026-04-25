import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Package, Activity } from '../../types/database';

interface DetailItineraryProps {
  pkg: Package;
  activities: Activity[];
  isEditing?: boolean;
  onUpdate?: (data: any) => void;
}

export const DetailItinerary: React.FC<DetailItineraryProps> = ({ pkg, activities, isEditing, onUpdate }) => {
  const [openDay, setOpenDay] = useState<number | null>(1);
  
  const daysCount = parseInt(pkg.duration?.split(' ')[0]) || 5;

  const handleUpdateDay = (dayNum: number, field: string, value: string) => {
    if (!onUpdate) return;
    const currentDays = [...(pkg.itineraryDays || [])];
    const dayIndex = currentDays.findIndex(d => d.day === dayNum);
    
    if (dayIndex >= 0) {
      currentDays[dayIndex] = { ...currentDays[dayIndex], [field]: value };
    } else {
      currentDays.push({ day: dayNum, title: field === 'title' ? value : `Day ${dayNum}`, description: field === 'description' ? value : '' });
    }
    
    onUpdate({ itineraryDays: currentDays });
  };

  return (
    <section>
      <h2 className="font-brand font-black text-4xl uppercase text-[#121212] mb-10">The Mission Timeline</h2>
      
      <div className="space-y-4">
        {Array.from({ length: daysCount }).map((_, i) => {
          const dayNum = i + 1;
          const daySummary = pkg.itineraryDays?.find(d => d.day === dayNum);
          const dayActivities = activities.filter(a => a.day === dayNum).sort((a, b) => (a.order || 0) - (b.order || 0));
          const isOpen = openDay === dayNum;

          return (
            <div key={dayNum} className={`border-2 border-[#121212] transition-all ${isOpen ? 'bg-white shadow-[6px_6px_0px_0px_#F4BF4B]' : 'bg-[#FCFBF7]'}`}>
              <button 
                onClick={() => setOpenDay(isOpen ? null : dayNum)}
                className="w-full p-6 flex justify-between items-center group"
              >
                <div className="flex items-center gap-6">
                  <span className="font-brand font-black text-3xl text-[#9E1B1D] opacity-40 group-hover:opacity-100 transition-opacity">
                    {dayNum.toString().padStart(2, '0')}
                  </span>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={daySummary?.title || `Day ${dayNum}`}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateDay(dayNum, 'title', e.target.value)}
                      className="bg-transparent border-b-2 border-[#121212] font-black text-lg uppercase tracking-tight outline-none w-full max-w-sm"
                    />
                  ) : (
                    <h3 className="font-black text-lg uppercase tracking-tight text-left">
                      {daySummary?.title || `Day ${dayNum}`}
                    </h3>
                  )}
                </div>
                {isOpen ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
              </button>
              
              {isOpen && (
                <div className="px-6 pb-8 md:pl-[104px] animate-in fade-in slide-in-from-top-2 duration-300">
                   {isEditing ? (
                     <div className="mb-8">
                       <label className="block text-[8px] font-black uppercase text-[#9E1B1D] mb-1">Edit Day Objective</label>
                       <textarea 
                         value={daySummary?.description || ''}
                         onChange={(e) => handleUpdateDay(dayNum, 'description', e.target.value)}
                         className="w-full bg-white border border-[#121212] p-4 font-serif italic text-lg outline-none min-h-[100px]"
                         placeholder="Describe this day's experience..."
                       />
                     </div>
                   ) : (
                     daySummary?.description && (
                       <p className="font-serif italic text-lg text-gray-600 leading-relaxed border-l-2 border-[#F4BF4B] pl-6 max-w-2xl mb-8">
                         "{daySummary.description}"
                       </p>
                     )
                   )}
                   
                   {dayActivities.length > 0 && (
                     <div className="space-y-6">
                       {dayActivities.map(activity => (
                         <div key={activity.id} className="border-t-2 border-[#121212]/10 pt-4">
                           <div className="flex items-center gap-3 mb-2">
                             <h4 className="font-black uppercase tracking-widest text-[#121212]">{activity.title}</h4>
                             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${activity.isIncluded ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-[#9E1B1D] text-white'}`}>
                               {activity.isIncluded ? 'Included' : 'Optional'}
                             </span>
                           </div>
                           <p className="text-sm font-medium text-[#121212]/80 leading-relaxed max-w-3xl mb-3">
                             {activity.description}
                           </p>
                           <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-widest text-[#121212]/60">
                              {activity.startTime && <span className="flex items-center gap-1 bg-[#FCFBF7] px-2 py-1 border-2 border-[#121212]/10">⏰ {activity.startTime}</span>}
                              {activity.duration && <span className="flex items-center gap-1 bg-[#FCFBF7] px-2 py-1 border-2 border-[#121212]/10">⏱️ {activity.duration}</span>}
                              {activity.location && <span className="flex items-center gap-1 bg-[#FCFBF7] px-2 py-1 border-2 border-[#121212]/10">📍 {activity.location}</span>}
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};