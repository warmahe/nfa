import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Database, Maximize2 } from "lucide-react";
import { GALLERY_IMAGES } from "../constants";

export const EditorialGallery = () => {
  // Capture dynamic ID from the URL (e.g., 'iceland' or 'nepal')
  const { id } = useParams<{ id: string }>();
  
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<any>(null);

  // Dynamically filter images to ONLY match this specific destination
  const tripData = useMemo(() => {
    if (!id) return [];
    return GALLERY_IMAGES.filter(img => img.destination.toLowerCase() === id.toLowerCase());
  }, [id]);

  const activeIndex = tripData.findIndex(img => img.id === selectedLightboxImage?.id);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLightboxImage(tripData[activeIndex === tripData.length - 1 ? 0 : activeIndex + 1]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLightboxImage(tripData[activeIndex === 0 ? tripData.length - 1 : activeIndex - 1]);
  };

  // 404 STATE: Handle if URL has a fake destination name
  if (tripData.length === 0) {
    return (
      <div className="min-h-screen bg-nfa-cream pt-32 pb-24 px-8 text-center flex flex-col items-center justify-center text-nfa-charcoal">
         <Database size={64} className="text-[#9E1B1D] mb-6 opacity-30" />
         <h1 className="font-brand font-black text-6xl uppercase tracking-tighter mb-4">CORRUPT ARCHIVE</h1>
         <p className="font-sans font-bold tracking-widest uppercase mb-8">No visual data located for sector: {id}</p>
         <Link to="/gallery" className="bg-nfa-charcoal text-nfa-cream px-8 py-4 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#9E1B1D]">Return to Vault</Link>
      </div>
    );
  }

  // VALID STATE: The true layout
  const actualDestinationName = tripData[0].destination; // Gets the properly capitalized name

  return (
    <div className="min-h-screen bg-nfa-cream text-nfa-charcoal nfa-texture selection:bg-nfa-gold selection:text-nfa-charcoal pt-4 md:pt-10 pb-24 overflow-hidden">
      
      <div className="max-w-[1600px] mx-auto px-[clamp(1rem,4vw,3rem)]">
        
        {/* ================================== */}
        {/* DYNAMIC HEADER                     */}
        {/* ================================== */}
        <div className="mb-10 border-b-4 border-nfa-charcoal pb-8">
           

           
           {/* ... rest of the header ... */}
           <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
              <h1 className="font-brand font-black uppercase text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.8] tracking-tighter text-nfa-charcoal">
                {actualDestinationName} <br/> <span className="text-nfa-gold drop-shadow-[2px_2px_0_nfa-charcoal]">FILES.</span>
              </h1>
              
              <div className="flex items-center justify-between md:justify-end gap-6 bg-nfa-charcoal text-nfa-cream px-6 py-4 shadow-[4px_4px_0px_0px_nfa-burgundy]">
                 <span className="font-mono text-xs tracking-[0.2em] font-bold opacity-70">DECRYPTED:</span>
                 <span className="font-brand font-black text-xl">{tripData.length} FILES</span>
              </div>
              
           </div>
                      {/* REDESIGNED BACK BUTTON */}
           <div className="pt-5 mb-6 md:mb-10">
             <Link 
               to="/gallery" 
               className="group inline-flex items-center gap-3 bg-nfa-charcoal text-nfa-cream px-4 py-2 md:px-5 md:py-2.5 border-2 border-nfa-charcoal hover:bg-nfa-burgundy transition-colors w-fit shadow-[4px_4px_0px_0px_nfa-gold] active:shadow-none active:translate-x-1 active:translate-y-1"
             >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="font-sans font-black text-[10px] md:text-xs uppercase tracking-[0.2em] pt-0.5">
                  Back
                </span>
             </Link>
           </div>
        </div>
        

        {/* ================================== */}
        {/* STRICT 2x2 MOBILE / 3x3+ DESK GRID */}
        {/* ================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8 w-full pt-2 md:pt-4">
          
          {tripData.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedLightboxImage(image)}
              className="relative group cursor-crosshair border-2 sm:border-3 border-nfa-charcoal bg-nfa-cream p-2 md:p-3 shadow-[2px_2px_0px_0px_nfa-charcoal] sm:shadow-[4px_4px_0px_0px_nfa-charcoal] hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-none sm:hover:shadow-[6px_6px_0px_0px_nfa-burgundy] active:shadow-none active:translate-y-0.5 transition-all duration-300 flex flex-col h-full"
            >
               {/* Internal Image Frame: aspect-square locks image perfectly. shrink-0 guarantees flexbox doesn't distort it */}
               <div className="aspect-square border-[1.5px] sm:border-2 border-nfa-charcoal overflow-hidden bg-nfa-charcoal relative w-full shrink-0">
                 <img 
                   src={image.url} 
                   alt={image.title} 
                   className="absolute inset-0 w-full h-full object-cover filter contrast-[1.1] grayscale-30 group-hover:grayscale-0 transition-all duration-600 block scale-100 group-hover:scale-105" 
                   loading="lazy" 
                 />
                 
                 <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 sm:p-4 transition-opacity duration-300">
                   <Maximize2 className="text-nfa-gold w-4 h-4 md:w-6 md:h-6 absolute top-2 right-2 md:top-4 md:right-4 drop-shadow-md" />
                 </div>
               </div>

               {/* 
                 FIX: Text Content Box is now 'flex-1 flex flex-col justify-between'. 
                 This guarantees the text box fills available vertical space and pushes metadata perfectly flush to the bottom.
               */}
               <div className="mt-2 md:mt-4 px-1 pb-1 flex-1 flex flex-col">
                 
                 {/* line-clamp-2 restricts oversized titles from breaking massive layouts, keeps uniform padding */}
                 <h4 className="font-brand font-black text-sm sm:text-base md:text-xl lg:text-2xl uppercase leading-[1.1] text-nfa-charcoal mb-2 md:mb-4 line-clamp-2" title={image.title}>
                    {image.title}
                 </h4>
                 
                 {/* mt-auto pushes this block to the very bottom, guaranteeing row alignment across sibling cards */}
                 <div className="mt-auto flex flex-col sm:flex-row justify-between sm:items-center pt-2 border-t-[1.5px] border-nfa-charcoal/10">
                    <span className="font-sans font-bold text-[7px] md:text-[9px] uppercase tracking-widest text-nfa-charcoal/50 truncate">Class: {image.category}</span>
                 </div>
               </div>

            </div>
          ))}

        </div>

      </div>

      {/* ================================== */}
      {/* CINEMATIC LIGHTBOX VIEWER        */}
      {/* ================================== */}
      {selectedLightboxImage && (
        <div 
          className="fixed inset-0 z-100 bg-nfa-charcoal/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div className="absolute top-0 w-full flex justify-between items-center p-4 md:p-6 border-b border-nfa-cream/10 bg-nfa-charcoal shadow-2xl z-50">
            <span className="font-sans font-black text-nfa-gold text-[10px] md:text-xs uppercase tracking-[0.3em]">
              <span className="hidden sm:inline">VIEWER // </span> LOG {activeIndex + 1} OF {tripData.length}
            </span>
            <button className="border-2 border-nfa-cream/20 bg-nfa-charcoal text-nfa-cream p-2 hover:bg-nfa-burgundy hover:border-nfa-burgundy transition-colors"><X size={20}/></button>
          </div>

          {/* Central Image Viewer Wrapper */}
          <div className="w-full max-w-[1200px] h-full pt-16 flex flex-col justify-center items-center relative pointer-events-none">
            
            <div className="w-full max-h-[75vh] flex justify-center p-2 relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              
              {/* Massive Prev Button overlaid over left half */}
              <button onClick={prevImage} className="absolute left-[-1rem] md:-left-8 top-1/2 -translate-y-1/2 bg-[#121212] border-[3px] border-[#FCFBF7]/20 p-3 md:p-5 text-[#FCFBF7] hover:bg-[#F4BF4B] hover:text-[#121212] hover:border-[#121212] shadow-xl group transition-all z-20 hover:scale-110 active:scale-95">
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              
              {/* The high res image */}
              <img src={selectedLightboxImage.url} alt={selectedLightboxImage.title} className="max-w-full max-h-[75vh] object-contain border-[4px] border-[#121212] bg-[#111]" />
              
               {/* Massive Next Button overlaid over right half */}
               <button onClick={nextImage} className="absolute right-[-1rem] md:-right-8 top-1/2 -translate-y-1/2 bg-[#121212] border-[3px] border-[#FCFBF7]/20 p-3 md:p-5 text-[#FCFBF7] hover:bg-[#F4BF4B] hover:text-[#121212] hover:border-[#121212] shadow-xl group transition-all z-20 hover:scale-110 active:scale-95">
                <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Information Sub-banner */}
            <div className="w-full max-w-[90%] md:max-w-none mx-auto bg-[#121212] border-[4px] border-[#121212] shadow-xl mt-[-10px] md:mt-4 p-4 md:p-6 z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
               <h2 className="font-brand font-black uppercase text-2xl md:text-3xl text-[#FCFBF7] mb-2">{selectedLightboxImage.title}</h2>
               <div className="flex gap-4 items-center">
                  <span className="font-sans font-bold text-[8px] md:text-[10px] uppercase tracking-widest text-[#F4BF4B] bg-[#F4BF4B]/10 px-2 py-1">Class: {selectedLightboxImage.category}</span>
                  {selectedLightboxImage.location && (
                    <span className="font-mono text-[8px] md:text-[10px] uppercase text-[#FCFBF7]/50">{selectedLightboxImage.location}</span>
                  )}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};