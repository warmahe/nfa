import React, { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
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

  // Layout: first image large, rest grid
  const [first, ...rest] = allImages;

  return (
    <section id="gallery" className="py-24 px-6 md:px-16 max-w-[1440px] mx-auto" aria-label="Trip gallery">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-12">
        <h2 className="font-brand font-black text-[clamp(3rem,7vw,6rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
          The Gallery.
        </h2>
        <span className="font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">
          {allImages.length} Photos
        </span>
      </div>

      {/* Featured + Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {/* Large feature image */}
        <div
          className="col-span-2 md:col-span-2 md:row-span-2 relative overflow-hidden cursor-zoom-in border-4 border-[#121212] group"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={first}
            alt="Gallery main"
            className="w-full h-full object-cover aspect-[4/3] md:aspect-auto group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#121212] opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
            <ZoomIn size={40} className="text-white" />
          </div>
          <div className="absolute bottom-4 right-4 size-10 bg-[#F4BF4B] border-2 border-[#121212] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={18} />
          </div>
        </div>

        {/* Remaining images */}
        {rest.slice(0, 6).map((img, i) => (
          <div
            key={i}
            className="relative overflow-hidden cursor-zoom-in border-2 border-[#121212] group aspect-square"
            onClick={() => setLightboxIndex(i + 1)}
          >
            <img
              src={img}
              alt={`Gallery ${i + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#121212] opacity-0 group-hover:opacity-30 transition-opacity" />
            {/* Show +N on last visible if more images exist */}
            {i === 5 && allImages.length > 8 && (
              <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center">
                <span className="font-brand font-black text-white text-4xl">+{allImages.length - 7}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[500] bg-[#121212]/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 size-12 bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 font-black text-white/40 text-sm uppercase tracking-widest">
            {lightboxIndex + 1} / {allImages.length}
          </div>

          {/* Image */}
          <img
            src={allImages[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain border-4 border-white/10"
            onClick={e => e.stopPropagation()}
          />

          {/* Prev / Next */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors"
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i! - 1 + allImages.length) % allImages.length); }}
            aria-label="Previous image"
          >
            ◀
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 size-12 bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors"
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
