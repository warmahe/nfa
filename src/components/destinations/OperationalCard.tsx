import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Heart, Sparkles, Compass } from 'lucide-react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../../services/wishlistService';
import { Destination } from '../../types/database';

interface OperationalCardProps {
  dest: Destination | any;
  className?: string;
}

export const OperationalCard: React.FC<OperationalCardProps> = ({ dest, className = '' }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
  
  const title = dest.name || dest.title || 'Expedition Sector';
  const slug = dest.slug || dest.id;
  const image = dest.coverImage || dest.media?.thumbnail || dest.image || fallbackImage;
  const [imgSrc, setImgSrc] = useState(image);
  
  const country = dest.country || dest.continent || dest.region || 'Global Sector';
  const description = dest.shortDescription || dest.description || '';
  const highlights = Array.isArray(dest.highlights) ? dest.highlights.slice(0, 3) : [];

  const [hearted, setHearted] = useState(() => isInWishlist(dest.id || slug));

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetId = dest.id || slug;
    if (hearted) {
      removeFromWishlist(targetId);
      setHearted(false);
    } else {
      addToWishlist({
        id: targetId,
        destination_id: targetId,
        name: title,
        image: image,
        destination: country,
        price: 'Explore Journey',
        rating: 5,
        duration: 'Flexible',
        category: 'Destination',
      });
      setHearted(true);
    }
  };

  return (
    <div className={`group bg-white border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] hover:shadow-[10px_10px_0px_0px_#F4BF4B] transition-all duration-300 flex flex-col overflow-hidden text-left h-full ${className}`}>
      
      {/* ── Destination Media Header ── */}
      <div className="relative aspect-[16/10] bg-[#121212] overflow-hidden shrink-0">
        <img
          src={imgSrc}
          alt={title}
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-black/30" />

        {/* Country / Sector Badge */}
        <div className="absolute top-4 left-4 z-10 bg-[#F4BF4B] text-[#121212] border-2 border-[#121212] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-md flex items-center gap-1.5">
          <MapPin size={11} className="text-[#9E1B1D]" /> {country}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-4 right-4 z-10 size-9 flex items-center justify-center border-2 border-[#121212] transition-colors shadow-md ${
            hearted
              ? 'bg-[#9E1B1D] text-white'
              : 'bg-white/90 text-[#121212] hover:bg-[#9E1B1D] hover:text-white'
          }`}
          title="Save to Wishlist"
        >
          <Heart size={15} fill={hearted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Content Details ── */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#9E1B1D]">
              DESTINATION SECTOR
            </span>
          </div>

          <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212] leading-none group-hover:text-[#9E1B1D] transition-colors">
            {title}
          </h3>

          {description && (
            <p className="font-sans font-medium text-xs text-[#121212]/80 leading-relaxed line-clamp-3 italic">
              "{description}"
            </p>
          )}

          {highlights.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {highlights.map((hl: string, idx: number) => (
                <span key={idx} className="text-[9px] font-bold text-[#121212] bg-[#FCFBF7] border border-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles size={9} className="text-[#F4BF4B]" /> {hl}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="pt-4 border-t-2 border-[#121212]/10 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 flex items-center gap-1">
            <Compass size={12} /> Explore Region
          </span>

          <Link
            to={`/destinations/${slug}`}
            className="bg-[#121212] text-[#F4BF4B] px-5 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-2 group-hover:bg-[#9E1B1D] group-hover:text-white group-hover:border-[#9E1B1D] transition-all shadow-[3px_3px_0px_0px_#F4BF4B]"
          >
            EXPLORE DESTINATION <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};