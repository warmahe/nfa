import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, BedDouble } from 'lucide-react';

interface HotelGalleryProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  hotelName?: string;
  location?: string;
  onClose: () => void;
}

export const HotelGallery: React.FC<HotelGalleryProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  hotelName,
  location,
  onClose,
}) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImgErrorMap({});
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Focus close button
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Clean valid images array
  const validImages = Array.isArray(images)
    ? images.filter(img => img && String(img).trim() !== '' && String(img) !== 'undefined' && String(img) !== 'null')
    : [];

  const totalImages = validImages.length;

  const handleNext = () => {
    if (totalImages <= 1) return;
    setCurrentIndex(prev => (prev + 1) % totalImages);
  };

  const handlePrev = () => {
    if (totalImages <= 1) return;
    setCurrentIndex(prev => (prev - 1 + totalImages) % totalImages);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalImages]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    if (deltaX > 50) {
      handlePrev();
    } else if (deltaX < -50) {
      handleNext();
    }

    touchStartX.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${hotelName || 'Hotel'} Photo Gallery`}
      className="fixed inset-0 z-[500] bg-[#121212]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* ── Top Bar / Header Overlay ── */}
      <div
        className="flex items-center justify-between gap-4 z-20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#F4BF4B] border-2 border-[#121212] flex items-center justify-center text-[#121212] shrink-0 font-black">
            <BedDouble size={18} />
          </div>
          <div>
            {hotelName && (
              <h3 className="font-brand font-black text-lg sm:text-xl uppercase tracking-tight text-white leading-none">
                {hotelName}
              </h3>
            )}
            <div className="flex items-center gap-3 mt-1">
              {location && (
                <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-1">
                  <MapPin size={10} className="text-[#F4BF4B]" /> {location}
                </span>
              )}
              {totalImages > 0 && (
                <span className="font-sans font-black text-[10px] uppercase tracking-widest text-[#F4BF4B]">
                  {currentIndex + 1} / {totalImages}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close photo gallery"
          className="size-12 bg-white/10 border-2 border-white/20 text-white flex items-center justify-center hover:bg-[#F4BF4B] hover:text-[#121212] hover:border-[#F4BF4B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F4BF4B]"
        >
          <X size={24} />
        </button>
      </div>

      {/* ── Main Media Viewing Stage ── */}
      <div
        className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {totalImages === 0 ? (
          <div className="text-center p-8 bg-white/5 border border-white/10 max-w-sm">
            <p className="font-brand font-black text-lg text-white uppercase tracking-wider mb-4">
              No photos available.
            </p>
            <button
              onClick={onClose}
              className="bg-[#F4BF4B] text-[#121212] px-6 py-2.5 font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Active Image */}
            <img
              src={imgErrorMap[currentIndex] ? fallbackImage : validImages[currentIndex]}
              alt={`${hotelName || 'Hotel'} photo ${currentIndex + 1}`}
              onError={() => setImgErrorMap(prev => ({ ...prev, [currentIndex]: true }))}
              className="max-w-[92vw] max-h-[72vh] object-contain border-2 border-white/10 shadow-2xl transition-all duration-300"
            />

            {/* Navigation Arrows (Rendered ONLY if totalImages > 1) */}
            {totalImages > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 size-12 sm:size-14 bg-[#121212]/80 border-2 border-white/20 text-white flex items-center justify-center hover:bg-[#F4BF4B] hover:text-[#121212] hover:border-[#F4BF4B] transition-all shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F4BF4B]"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 size-12 sm:size-14 bg-[#121212]/80 border-2 border-white/20 text-white flex items-center justify-center hover:bg-[#F4BF4B] hover:text-[#121212] hover:border-[#F4BF4B] transition-all shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F4BF4B]"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Thumbnail Strip ── */}
      {totalImages > 1 && (
        <div
          className="z-20 w-full overflow-x-auto pb-2 pt-2 scrollbar-none flex justify-center"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 max-w-full overflow-x-auto px-4 py-1">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative shrink-0 size-14 sm:size-16 border-2 overflow-hidden transition-all ${
                  idx === currentIndex
                    ? 'border-[#F4BF4B] scale-105 shadow-[0_0_12px_rgba(244,191,75,0.6)]'
                    : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white'
                }`}
              >
                <img
                  src={imgErrorMap[idx] ? fallbackImage : img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
