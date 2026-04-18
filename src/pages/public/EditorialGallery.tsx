import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, ArrowLeft, Maximize2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseService';

export const EditorialGallery = () => {
  const { id } = useParams<{ id: string }>();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'gallery'));
        if (snap.exists()) setFolders(snap.data().items || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeFolder = useMemo(() => {
    return folders.find(f => f.destination.toLowerCase() === id?.toLowerCase());
  }, [folders, id]);

  const activeIndex = activeFolder?.images?.findIndex((img: any) => img.id === selectedLightboxImage?.id) ?? -1;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeFolder?.images) return;
    const newIndex = activeIndex === activeFolder.images.length - 1 ? 0 : activeIndex + 1;
    setSelectedLightboxImage(activeFolder.images[newIndex]);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeFolder?.images) return;
    const newIndex = activeIndex === 0 ? activeFolder.images.length - 1 : activeIndex - 1;
    setSelectedLightboxImage(activeFolder.images[newIndex]);
  };

  if (loading) return <div className="min-h-screen bg-nfa-cream p-20 font-black uppercase text-xs tracking-widest">Decrypting...</div>;
  
  if (!activeFolder) return (
    <div className="min-h-screen bg-nfa-cream pt-32 pb-24 px-8 text-center flex flex-col items-center justify-center text-nfa-charcoal">
      <h1 className="font-brand font-black text-6xl uppercase tracking-tighter mb-4">CORRUPT ARCHIVE</h1>
      <Link to="/gallery" className="bg-nfa-charcoal text-nfa-cream px-8 py-4 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#9E1B1D]">Return to Vault</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-nfa-cream text-nfa-charcoal nfa-texture pt-10 pb-24 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-[clamp(1rem,4vw,3rem)]">
        
        {/* HEADER SECTION */}
        <div className="mb-10 border-b-4 border-nfa-charcoal pb-8">
           <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
              <h1 className="font-brand font-black uppercase text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.8] tracking-tighter">
                {activeFolder.title} <br/> <span className="text-nfa-gold drop-shadow-[2px_2px_0_#121212]">FILES.</span>
              </h1>
              <div className="flex items-center justify-between md:justify-end gap-6 bg-nfa-charcoal text-nfa-cream px-6 py-4 shadow-[4px_4px_0px_0px_#9E1B1D]">
                 <span className="font-mono text-[10px] tracking-[0.2em] font-bold opacity-70 uppercase">Declassified:</span>
                 <span className="font-brand font-black text-xl">{activeFolder.images?.length || 0} FILES</span>
              </div>
           </div>
           
           <div className="pt-5">
             <button onClick={() => window.history.back()} className="group inline-flex items-center gap-3 bg-nfa-charcoal text-nfa-cream px-4 py-2 border-2 border-nfa-charcoal hover:bg-[#9E1B1D] transition-all shadow-[4px_4px_0px_0px_nfa-gold] active:translate-x-1 active:translate-y-1 active:shadow-none">
                <ArrowLeft size={16} /> 
                <span className="font-sans font-black text-[10px] uppercase tracking-[0.2em]">Back</span>
             </button>
           </div>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-8 w-full">
          {activeFolder.images?.map((image: any) => (
            <div
              key={image.id}
              onClick={() => { setSelectedLightboxImage(image); setShowControls(true); }}
              className="relative group cursor-crosshair border-2 sm:border-3 border-nfa-charcoal bg-nfa-cream p-2 md:p-3 shadow-[2px_2px_0px_0px_#121212] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
               <div className="aspect-square border-[1.5px] border-nfa-charcoal overflow-hidden bg-nfa-charcoal relative w-full shrink-0">
                 <img src={image.url} className="absolute inset-0 w-full h-full object-cover filter contrast-[1.1] grayscale-30 group-hover:grayscale-0 transition-all duration-600 block scale-100 group-hover:scale-105" loading="lazy" alt={image.title} />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                   <Maximize2 className="text-nfa-gold w-6 h-6" />
                 </div>
               </div>
               <div className="mt-4 px-1 pb-1 flex-1 flex flex-col text-center sm:text-left">
                 <h4 className="font-brand font-black text-sm md:text-xl uppercase leading-[1.1] line-clamp-2">{image.title}</h4>
                 <div className="mt-auto pt-2 border-t-[1.5px] border-nfa-charcoal/10">
                    <span className="font-sans font-bold text-[7px] md:text-[9px] uppercase tracking-widest text-nfa-charcoal/50 truncate">Source: {image.photographer || 'Unidentified'}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX VIEWER */}
      <AnimatePresence>
        {selectedLightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center select-none overflow-hidden"
            onClick={() => setShowControls(!showControls)}
          >
            {/* TOP BAR - Optimized for Notch/Mobile */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                  className="absolute top-0 left-0 w-full flex justify-between items-start p-4 md:p-10 z-[2010]"
                >
                  <div className="font-sans font-black text-nfa-gold text-[10px] uppercase tracking-[0.3em] bg-black/60 px-2 py-2 border-l-4 border-nfa-gold mt-21">
                    LOG {activeIndex + 1} / {activeFolder.images?.length || 0}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLightboxImage(null); }}
                    className="bg-nfa-gold border-2 border-black p-2 md:p-3 text-black hover:bg-white transition-all shadow-[4px_4px_0_0_#000] mt-21 mr-2"
                  >
                    <X size={20} className="md:size-6" strokeWidth={3} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MAIN STAGE: Optimized for Landscape & Mobile Portrait */}
            <div className="relative w-full h-full flex items-center justify-center p-2 md:p-12">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={selectedLightboxImage.id}
                  src={selectedLightboxImage.url}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="max-w-[95vw] max-h-[70vh] md:max-h-[80vh] w-auto h-auto object-contain border-4 border-white/10 shadow-2xl"
                  alt={selectedLightboxImage.title}
                />
              </AnimatePresence>

              {/* NAVIGATION BUTTONS - Smaller & cleaner */}
              <AnimatePresence>
                {showControls && (
                  <>
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={prevImage}
                      className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md border border-white/20 p-3 text-white hover:bg-nfa-gold hover:text-black transition-all active:scale-90"
                    >
                      <ChevronLeft size={20} />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={nextImage}
                      className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md border border-white/20 p-3 text-white hover:bg-nfa-gold hover:text-black transition-all active:scale-90"
                    >
                      <ChevronRight size={20} />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM INFO PLAQUE */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-0 left-0 w-full p-6 md:p-12 bg-gradient-to-t from-black via-black/80 to-transparent"
                >
                   <div className="max-w-[1200px] mx-auto text-center md:text-left">
                     <h2 className="font-brand font-black uppercase text-xl md:text-5xl text-white leading-tight mb-2">
                       {selectedLightboxImage.title}
                     </h2>
                     <p className="font-sans font-bold text-[8px] md:text-xs uppercase tracking-[0.4em] text-nfa-gold/80">
                        Photo by : {selectedLightboxImage.photographer || 'CLASSIFIED'} 
                     </p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};