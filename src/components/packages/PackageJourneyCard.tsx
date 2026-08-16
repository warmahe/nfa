import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight, Heart, Star, Sparkles, Compass, Calendar } from 'lucide-react';
import { Package } from '../../types/database';
import { JourneyShortlistButton } from '../discovery/JourneyShortlistButton';

interface PackageJourneyCardProps {
  pkg: Package;
  wishlisted?: boolean;
  onToggleWishlist?: (pkg: Package) => void;
  isFeatured?: boolean;
  className?: string;
}

export const PackageJourneyCard: React.FC<PackageJourneyCardProps> = ({
  pkg,
  wishlisted = false,
  onToggleWishlist,
  isFeatured = false,
  className = '',
}) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';
  
  const primaryImage = pkg.media?.thumbnail || (pkg.media?.gallery && pkg.media.gallery.length > 0 ? pkg.media.gallery[0] : fallbackImage);
  const [imgSrc, setImgSrc] = useState(primaryImage);

  // Fallback hierarchy for description: editorialIntro → overview → description
  const editorialDesc = pkg.editorialIntro || pkg.overview || pkg.description || '';
  
  // Destinations route string calculation
  const destinationsList = Array.isArray(pkg.itineraryCities) && pkg.itineraryCities.length > 0
    ? pkg.itineraryCities.map(c => c.city).filter(Boolean)
    : (Array.isArray(pkg.destinations) ? pkg.destinations : []);
  
  const routeDisplay = destinationsList.length > 0 
    ? destinationsList.join(' · ') 
    : 'Expedition Route';

  // Travel style tags
  const stylesList = Array.isArray(pkg.travelStyle) && pkg.travelStyle.length > 0
    ? pkg.travelStyle
    : (Array.isArray((pkg as any).tripStyle) ? (pkg as any).tripStyle : []);

  // Highlights preview (Max 3)
  const highlightsList = Array.isArray(pkg.editorialHighlights) && pkg.editorialHighlights.length > 0
    ? pkg.editorialHighlights.slice(0, 3)
    : (Array.isArray(pkg.highlights) ? pkg.highlights.map(h => h.text).filter(Boolean).slice(0, 3) : []);

  // Price formatting
  const basePrice = pkg.pricing?.basePrice;
  const currency = pkg.pricing?.currency || '₹';
  const hasValidPrice = typeof basePrice === 'number' && basePrice > 0;
  const priceDisplay = hasValidPrice
    ? `${currency === 'INR' ? '₹' : currency}${basePrice.toLocaleString()}`
    : 'Price on request';

  // E50 Departure Indicator
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingDeparture = pkg.availability?.departures
    ?.filter((d) => d.date >= todayStr && d.status !== 'CLOSED')
    ?.sort((a, b) => a.date.localeCompare(b.date))?.[0];

  let departureTag: string | null = null;
  if (upcomingDeparture) {
    const formatted = new Date(upcomingDeparture.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    departureTag = `Next: ${formatted}`;
  } else if (pkg.availability?.mode === 'PRIVATE_FLEXIBLE') {
    departureTag = 'Flexible Dates';
  }

  return (
    <div 
      className={`group bg-white border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] hover:shadow-[10px_10px_0px_0px_#F4BF4B] transition-all duration-300 flex flex-col overflow-hidden text-left ${
        isFeatured ? 'md:col-span-2 md:flex-row' : ''
      } ${className}`}
    >
      {/* ── Image & Badges Container ── */}
      <div className={`relative bg-[#121212] overflow-hidden shrink-0 ${
        isFeatured ? 'md:w-1/2 aspect-[16/10] md:aspect-auto' : 'aspect-[16/10]'
      }`}>
        <img
          src={imgSrc}
          alt={pkg.title}
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-black/30" />

        {/* Badges Container (Duration & Next Departure) */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
          {pkg.duration && (
            <div className="bg-[#F4BF4B] text-[#121212] border-2 border-[#121212] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-md flex items-center gap-1.5">
              <Clock size={11} /> {pkg.duration}
            </div>
          )}
          {departureTag && (
            <div className="bg-[#121212]/90 backdrop-blur-sm text-[#F4BF4B] border border-[#F4BF4B]/40 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Calendar size={10} /> {departureTag}
            </div>
          )}
        </div>

        {/* Top Right Action Buttons (Shortlist & Wishlist) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <JourneyShortlistButton
            packageId={pkg.id}
            slug={pkg.slug}
            title={pkg.title}
            variant="icon"
          />

          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleWishlist(pkg);
              }}
              className={`size-9 flex items-center justify-center border-2 border-[#121212] transition-colors shadow-md ${
                wishlisted
                  ? 'bg-[#9E1B1D] text-white'
                  : 'bg-white/90 text-[#121212] hover:bg-[#9E1B1D] hover:text-white'
              }`}
              title="Save to Wishlist"
            >
              <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Bottom Destination Tag */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2">
          <div className="bg-[#121212]/90 backdrop-blur-sm text-white border border-white/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest truncate flex items-center gap-1.5">
            <MapPin size={10} className="text-[#F4BF4B] shrink-0" />
            <span className="truncate">{routeDisplay}</span>
          </div>
        </div>
      </div>

      {/* ── Editorial Content Details ── */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          {/* Travel Style Badges */}
          {stylesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {stylesList.slice(0, 3).map((style: string, idx: number) => (
                <span key={idx} className="text-[8px] font-black uppercase tracking-[0.2em] text-[#9E1B1D] bg-[#9E1B1D]/10 px-2.5 py-0.5 rounded">
                  {style}
                </span>
              ))}
            </div>
          )}

          {/* Journey Title */}
          <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212] leading-tight group-hover:text-[#9E1B1D] transition-colors">
            {pkg.title}
          </h3>

          {/* Editorial Introduction / Narrative */}
          {editorialDesc && (
            <p className="font-sans font-medium text-xs text-[#121212]/80 leading-relaxed line-clamp-3 italic">
              "{editorialDesc}"
            </p>
          )}

          {/* Highlights Preview */}
          {highlightsList.length > 0 && (
            <div className="pt-1 space-y-1">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">
                KEY EXPERIENCES
              </span>
              {highlightsList.map((hl: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-slate-800 truncate">
                  <Sparkles size={10} className="text-[#F4BF4B] shrink-0" />
                  <span className="truncate">{hl}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Price & Primary CTA */}
        <div className="pt-4 border-t-2 border-[#121212]/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-400 block leading-none mb-1">
              Investment
            </span>
            <span className="font-brand font-black text-lg sm:text-xl text-[#121212] tracking-tight">
              {priceDisplay}
            </span>
          </div>

          <Link
            to={`/itinerary/${pkg.slug || pkg.id}`}
            className="bg-[#121212] text-[#F4BF4B] px-5 py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-2 group-hover:bg-[#9E1B1D] group-hover:text-white group-hover:border-[#9E1B1D] transition-all shadow-[3px_3px_0px_0px_#F4BF4B]"
          >
            EXPLORE JOURNEY <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
