import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Camera } from 'lucide-react';
import { Package } from '../../../types/database';

interface GallerySectionProps {
  pkg: Package;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ pkg }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = [
    pkg?.media?.thumbnail,
    ...(pkg?.media?.gallery || []),
  ].filter(Boolean) as string[];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && lightboxIndex !== null)
        setLightboxIndex(i => (i! + 1) % allImages.length);
      if (e.key === 'ArrowLeft' && lightboxIndex !== null)
        setLightboxIndex(i => (i! - 1 + allImages.length) % allImages.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, allImages.length]);

  if (allImages.length === 0) return null;

  const [first, ...rest] = allImages;

  return (
    <section id="gallery" className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto bg-[#FCFBF7]" aria-label="Trip gallery">
      {/* Header */}
      <div className="mb-16 text-center relative z-10">
        <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#121212] bg-[#F4BF4B] mb-6 shadow-[4px_4px_0_0_#121212]">
          Visuals
        </span>
        <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85] mb-8">
          The Gallery
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-1 bg-[#121212]" />
          <Camera size={24} className="text-[#9E1B1D]" />
          <div className="w-16 h-1 bg-[#121212]" />
        </div>
      </div>

      {/* Symmetrical / Polaroid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-20">
        {/* Large feature image (Polaroid style) */}
        <div className="md:col-span-8 relative">
          <div
            className="bg-white border-4 border-[#121212] p-4 md:p-6 pb-12 md:pb-16 shadow-[8px_8px_0px_0px_#121212] cursor-zoom-in group hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#F4BF4B] transition-all transform -rotate-1"
            onClick={() => setLightboxIndex(0)}
          >
            <div className="overflow-hidden border-2 border-[#121212]">
              <img
                src={first}
                alt="Gallery main"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-4 left-6">
              <span className="font-brand font-bold text-2xl text-[#121212]/80 -rotate-2 inline-block">
                Sector Overview
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-[#121212] text-[#FCFBF7] p-4 rounded-full border-2 border-white">
                <ZoomIn size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Side / Scattered Images */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-8 content-center">
          {rest.slice(0, 3).map((img, i) => {
            const rotations = ['rotate-3', '-rotate-2', 'rotate-6'];
            const rot = rotations[i % rotations.length];
            return (
              <div
                key={i}
                className={`bg-white border-4 border-[#121212] p-3 pb-8 shadow-[4px_4px_0px_0px_#121212] cursor-zoom-in group hover:z-10 hover:-translate-y-1 transition-all transform ${rot}`}
                onClick={() => setLightboxIndex(i + 1)}
              >
                <div className="overflow-hidden border-2 border-[#121212]">
                  <img
                    src={img}
                    alt={`Gallery ${i + 2}`}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
                {i === 2 && allImages.length > 4 && (
                  <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center m-3 mb-8 border-2 border-[#121212]">
                    <span className="font-brand font-black text-white text-3xl">+{allImages.length - 4}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[500] bg-[#FCFBF7] bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] flex items-center justify-center border-[16px] border-[#121212]"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 size-12 bg-[#121212] border-4 border-[#121212] flex items-center justify-center text-[#FCFBF7] hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors z-50 shadow-[4px_4px_0_0_#9E1B1D]"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 font-mono font-black text-[#121212] text-sm uppercase tracking-widest border-2 border-[#121212] px-4 py-2 bg-[#F4BF4B] shadow-[4px_4px_0_0_#121212]">
            {lightboxIndex + 1} / {allImages.length}
          </div>

          {/* Image Box */}
          <div className="bg-white border-4 border-[#121212] p-4 md:p-8 pb-16 md:pb-24 shadow-[16px_16px_0px_0px_#121212] relative max-w-[90vw] max-h-[85vh] transform rotate-1 flex flex-col">
            <div className="flex-1 overflow-hidden border-4 border-[#121212]">
              <img
                src={allImages[lightboxIndex]}
                alt={`Photo ${lightboxIndex + 1}`}
                className="w-full h-full max-h-[65vh] object-contain"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Prev / Next */}
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 size-12 md:size-16 bg-[#121212] border-4 border-[#121212] flex items-center justify-center text-[#FCFBF7] hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors z-50 shadow-[4px_4px_0_0_#9E1B1D]"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i! - 1 + allImages.length) % allImages.length); }}
            aria-label="Previous image"
          >
            ◀
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 size-12 md:size-16 bg-[#121212] border-4 border-[#121212] flex items-center justify-center text-[#FCFBF7] hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors z-50 shadow-[4px_4px_0_0_#9E1B1D]"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i! + 1) % allImages.length); }}
            aria-label="Next image"
          >
            ▶
          </button>
        </div>
      )}
    </section>
  );
};
