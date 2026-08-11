import React, { useState } from 'react';
import { MapPin, Star, Images, ExternalLink, BedDouble, ChevronDown, ChevronUp } from 'lucide-react';
import { HotelInfo } from '../../types/database';

interface HotelCardProps {
  hotel: HotelInfo;
  onOpenGallery?: (images: string[], initialIndex?: number, hotelName?: string, location?: string) => void;
  className?: string;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onOpenGallery,
  className = '',
}) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
  const [imgSrc, setImgSrc] = useState(hotel.image || fallbackImage);
  const [imgError, setImgError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hotel || !hotel.name) return null;

  const images = Array.isArray(hotel.images) && hotel.images.length > 0
    ? hotel.images
    : (hotel.image ? [hotel.image] : []);

  const hasMultipleImages = images.length > 1;
  const description = hotel.description || '';
  const isLongDescription = description.length > 180;
  const displayDescription = (isLongDescription && !isExpanded)
    ? `${description.substring(0, 180)}…`
    : description;

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(fallbackImage);
    }
  };

  return (
    <div
      className={`bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B] overflow-hidden transition-all duration-300 hover:shadow-[10px_10px_0px_0px_#121212] ${className}`}
      aria-label={`Hotel accommodation: ${hotel.name}`}
    >
      {/* ── Image & Header Banner ── */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-[#121212] overflow-hidden group">
        <img
          src={imgSrc}
          alt={hotel.name}
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent" />

        {/* Category / Type Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#121212] text-[#F4BF4B] border-2 border-[#F4BF4B] px-3.5 py-1.5 font-black text-[9px] uppercase tracking-[0.25em] flex items-center gap-1.5 shadow-md">
            <BedDouble size={12} />
            {hotel.type || 'Accommodation'}
          </span>
        </div>

        {/* Rating Badge (Rendered ONLY if valid rating > 0 exists) */}
        {typeof hotel.rating === 'number' && hotel.rating > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-[#F4BF4B] text-[#121212] border-2 border-[#121212] px-3 py-1 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Star size={12} fill="#121212" className="text-[#121212]" />
              {hotel.rating.toFixed(1)}
            </div>
          </div>
        )}

        {/* B5 Lightbox Gallery Button */}
        {hasMultipleImages && onOpenGallery && (
          <button
            onClick={() => onOpenGallery(images, 0, hotel.name, hotel.location)}
            className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-md text-[#121212] border-2 border-[#121212] px-4 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors flex items-center gap-2 shadow-lg"
          >
            <Images size={14} /> View Photos ({images.length})
          </button>
        )}
      </div>

      {/* ── Content & Details Section ── */}
      <div className="p-6 md:p-8 space-y-4">
        {/* Hotel Name & Location Row */}
        <div>
          <h4 className="font-brand font-black text-2xl md:text-3xl uppercase tracking-tighter text-[#121212] leading-tight mb-2">
            {hotel.name}
          </h4>

          {hotel.location && (
            <div className="flex items-center gap-2 text-[#9E1B1D]">
              <MapPin size={14} className="shrink-0" />
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/70">
                {hotel.location}
              </span>
            </div>
          )}
        </div>

        {/* Description Section */}
        {description && (
          <div className="space-y-2 pt-1 border-t border-[#121212]/10">
            <p className="font-sans font-medium text-xs sm:text-sm text-[#121212]/80 leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-sans font-black text-[10px] uppercase tracking-widest text-[#9E1B1D] hover:text-[#121212] flex items-center gap-1 transition-colors pt-1"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp size={12} /></>
                ) : (
                  <>Read Full Bio <ChevronDown size={12} /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Amenities Section */}
        {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
          <div className="pt-3 border-t border-[#121212]/10">
            <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-[#121212]/40 mb-2.5">
              Property Amenities
            </span>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-[#FCFBF7] border border-[#121212]/30 px-3 py-1 font-sans font-bold text-[9px] uppercase tracking-widest text-[#121212]"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Website Link */}
        {hotel.websiteUrl && (
          <div className="pt-2">
            <a
              href={hotel.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#121212] hover:text-[#9E1B1D] underline underline-offset-4 transition-colors"
            >
              Visit Official Property Site <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
