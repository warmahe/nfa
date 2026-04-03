import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Database, FolderKanban, Map } from "lucide-react";
import { GALLERY_IMAGES } from "../constants";

export const Gallery = () => {
  // Automatically group all images by their destination
  const archivedTrips = useMemo(() => {
    const groups: { [key: string]: { coverImage: string, totalFiles: number } } = {};
    
    GALLERY_IMAGES.forEach(img => {
      if (!groups[img.destination]) {
        groups[img.destination] = { coverImage: img.url, totalFiles: 0 };
      }
      groups[img.destination].totalFiles++;
    });

    return Object.entries(groups).map(([destination, data]) => ({
      destination,
      slug: destination.toLowerCase(),
      coverImage: data.coverImage,
      totalFiles: data.totalFiles
    }));
  }, []);

  return (
    <div className="min-h-screen bg-nfa-cream text-nfa-charcoal nfa-texture selection:bg-nfa-gold selection:text-nfa-charcoal pt-4 md:pt-10 pb-24">
      
      <div className="max-w-[1440px] mx-auto px-[clamp(0.5rem,3vw,3rem)]">
        
        {/* ================================== */}
        {/* HEADER: VAULT MAINFRAME            */}
        {/* ================================== */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12 md:mb-20 border-b-[4px] border-nfa-charcoal pb-8 px-2 md:px-0">
           <div className="relative">
             <div className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-3 py-1.5 border-[2px] border-[#121212] shadow-[3px_3px_0px_0px_#9E1B1D] mb-4">
               <Database size={14} />
               <span className="font-sans font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">Central Database</span>
             </div>
             
             <h1 className="font-brand font-black uppercase text-[clamp(2.5rem,8vw,7rem)] leading-[0.8] tracking-tighter text-[#121212]">
                CLASSIFIED <br/> <span className="text-[#9E1B1D]">GALLERY.</span>
             </h1>
           </div>

           <p className="font-sans font-bold uppercase tracking-[0.1em] text-[10px] md:text-sm text-[#121212]/70 max-w-sm border-l-[3px] border-[#9E1B1D] pl-3 md:pl-4 mt-4 md:mt-0">
             Digital extraction zones organized by sector. Access files to review geographic conditions prior to deployment.
           </p>
        </div>

        {/* ================================== */}
        {/* STRICT ARCHIVE GRID (2 on mobile)  */}
        {/* ================================== */}
        {/* Grid forces 2 columns on mobile, 3 on md, 4 on xl */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-8 w-full">
          {archivedTrips.map((trip) => (
            <Link 
              key={trip.slug}
              to={`/gallery/${trip.slug}`} 
              className="group border-[2px] md:border-[4px] border-nfa-charcoal bg-[#FCFBF7] p-2 md:p-3 shadow-[4px_4px_0px_0px_#121212] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all flex flex-col"
            >
              
              {/* Folder Header - Tightly scaled for 2x2 mobile */}
              <div className="flex justify-between items-center mb-2 md:mb-3 px-1 md:px-2">
                 <div className="flex items-center gap-1.5 text-nfa-charcoal overflow-hidden">
                    <FolderKanban size={14} className="text-[#9E1B1D] shrink-0 hidden sm:block" />
                    <span className="font-sans font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-widest truncate">{trip.destination}</span>
                 </div>
                 <div className="font-mono text-[8px] sm:text-[10px] uppercase font-bold text-nfa-charcoal/60 shrink-0">
                   {trip.totalFiles} <span className="hidden sm:inline">FILES</span>
                 </div>
              </div>

              {/* Cover Image - 4/3 Aspect ensures uniform scaling */}
              <div className="relative aspect-[4/3] border-[2px] md:border-[3px] border-nfa-charcoal bg-[#121212] overflow-hidden mb-2 md:mb-4">
                 <img 
                   src={trip.coverImage} 
                   className="w-full h-full object-cover filter contrast-[1.1] grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[600ms]" 
                   alt={`Archive for ${trip.destination}`}
                 />
                 <div className="absolute inset-0 bg-linear-to-t from-[#121212]/50 to-transparent pointer-events-none mix-blend-multiply" />
              </div>

              {/* Action Strip - Minimal padding for mobile 2x2 constraint */}
              <div className="border-t-[2px] md:border-t-[3px] border-nfa-charcoal/20 pt-2 pb-1 md:pt-3 px-1 md:px-2 flex justify-between items-center group-hover:border-[#9E1B1D] transition-colors mt-auto">
                <span className="flex items-center gap-1.5 font-sans font-bold text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#9E1B1D] truncate">
                  <Map size={10} className="shrink-0 hidden sm:block" />
                  View Sector <span className="hidden md:inline">Archives</span>
                </span>
                <span className="text-[#121212] font-brand font-black text-sm sm:text-lg md:text-xl leading-none">→</span>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </div>
  );
};