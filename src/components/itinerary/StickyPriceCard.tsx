import React, { useState } from 'react';
import { Calendar, CheckCircle2, Download, Mail, ChevronUp, ChevronDown, Sparkles, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { Package } from '../../types/database';
import { useEnquiry } from '../../context/EnquiryContext';

export interface StickyPriceCardProps {
  pkg: Package;
  onEnquire?: () => void;
  className?: string;
}

/**
 * Currency formatter with symbol support
 */
export const formatPrice = (amount: number | undefined | null, currency = 'INR'): string => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount <= 0) {
    return '';
  }
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$',
    CAD: 'C$',
  };
  const sym = symbols[currency.toUpperCase()] || `${currency.toUpperCase()} `;
  return `${sym}${amount.toLocaleString('en-IN')}`;
};

export const StickyPriceCard: React.FC<StickyPriceCardProps> = ({ pkg, onEnquire, className = '' }) => {
  const { openEnquiry } = useEnquiry();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [pdfToast, setPdfToast] = useState(false);

  const basePrice = pkg.pricing?.basePrice;
  const currency = pkg.pricing?.currency || 'INR';
  const hasValidPrice = typeof basePrice === 'number' && !isNaN(basePrice) && isFinite(basePrice) && basePrice > 0;
  const formattedPrice = hasValidPrice ? formatPrice(basePrice, currency) : '';

  const handleEnquireClick = (e: React.MouseEvent, entryPoint: 'STICKY_CARD' | 'MOBILE_STICKY' = 'STICKY_CARD') => {
    e.preventDefault();
    if (onEnquire) {
      onEnquire();
    } else {
      openEnquiry({
        pkg,
        itineraryTitle: pkg?.title,
        itineraryId: pkg?.id,
        itinerarySlug: pkg?.slug,
        destination: pkg?.destinations?.[0],
        duration: pkg?.duration,
        price: pkg?.pricing?.basePrice,
        currency: pkg?.pricing?.currency,
        source: 'ITINERARY',
        entryPoint: entryPoint,
      });
    }
  };

  // Discount calculation
  const discount = pkg.pricing?.discount;
  const hasDiscount = hasValidPrice && typeof discount === 'number' && !isNaN(discount) && discount > 0;
  
  let originalPriceFormatted = '';
  let discountBadgeText = '';

  if (hasDiscount && basePrice) {
    if (discount < 100) {
      // Percentage discount
      const orig = Math.round(basePrice / (1 - discount / 100));
      originalPriceFormatted = formatPrice(orig, currency);
      discountBadgeText = `${discount}% OFF`;
    } else {
      // Absolute discount amount
      const orig = basePrice + discount;
      originalPriceFormatted = formatPrice(orig, currency);
      discountBadgeText = `SAVE ${formatPrice(discount, currency)}`;
    }
  }

  // Duration
  const durationText = pkg.duration && pkg.duration.trim() ? pkg.duration.trim() : null;

  // Inclusions subset (up to 4)
  const inclusions = Array.isArray(pkg.inclusionsRich) ? pkg.inclusionsRich.filter(i => i && i.text) : [];
  const topInclusions = inclusions.slice(0, 4);

  // PDF action handler
  const handlePdfClick = (e: React.MouseEvent) => {
    if (!pkg.itineraryPDF) {
      e.preventDefault();
      setPdfToast(true);
      setTimeout(() => setPdfToast(false), 4500);
    }
  };

  return (
    <>
      {/* ── 1. DESKTOP STICKY PRICE CARD (hidden on < lg, visible on lg+) ── */}
      <aside 
        className={`hidden lg:block sticky top-28 border-4 border-[#121212] bg-white p-6 md:p-8 shadow-[10px_10px_0px_0px_#121212] z-20 text-left ${className}`}
        aria-label="Itinerary PDF"
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b-2 border-[#121212]/10 pb-4 mb-6">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#F4BF4B]" /> Itinerary PDF
          </span>
          {hasDiscount && (
            <span className="text-[9px] font-black uppercase tracking-wider bg-[#9E1B1D] text-white px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#121212]">
              {discountBadgeText}
            </span>
          )}
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#121212]/50 block mb-1">
            {hasValidPrice ? 'Starting Investment' : 'Pricing Status'}
          </span>
          
          {hasValidPrice ? (
            <div>
              {hasDiscount && originalPriceFormatted && (
                <span className="text-sm font-bold text-gray-400 line-through mr-2">
                  {originalPriceFormatted}
                </span>
              )}
              <div className="font-brand font-black text-4xl xl:text-5xl text-[#121212] tracking-tighter leading-none">
                {formattedPrice}
                <span className="text-xs font-bold font-sans text-[#121212]/60 uppercase tracking-widest ml-2">/ person</span>
              </div>
            </div>
          ) : (
            <div className="font-brand font-black text-2xl text-[#121212] uppercase tracking-tight">
              Price On Request
            </div>
          )}
        </div>

        {/* Duration metadata row */}
        {durationText && (
          <div className="flex items-center gap-3 p-3.5 bg-[#FCFBF7] border-2 border-[#121212] mb-6">
            <Calendar size={18} className="text-[#9E1B1D] shrink-0" />
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-[#121212]/40 block">Expedition Length</span>
              <span className="font-black text-xs uppercase tracking-wider text-[#121212]">{durationText}</span>
            </div>
          </div>
        )}

        {/* Key Inclusions */}
        {topInclusions.length > 0 && (
          <div className="mb-6 space-y-2.5">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#121212]/50 block mb-3">
              Included Privileges
            </span>
            {topInclusions.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-[#121212]/80 leading-snug">{item.text}</span>
              </div>
            ))}
            {inclusions.length > 4 && (
              <a
                href="#inclusions"
                className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D] hover:underline block pt-1"
              >
                + View all {inclusions.length} inclusions
              </a>
            )}
          </div>
        )}

        {/* Primary CTA: ENQUIRE NOW */}
        <button
          onClick={handleEnquireClick}
          aria-label="Enquire about this itinerary"
          className="w-full bg-[#121212] text-[#F4BF4B] py-4 px-6 font-black text-xs uppercase tracking-[0.25em] flex justify-center items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[5px_5px_0px_0px_#F4BF4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none mb-3 text-center border-2 border-[#121212] cursor-pointer"
        >
          <Mail size={16} /> ENQUIRE NOW
        </button>

        {/* Secondary CTA: DOWNLOAD ITINERARY */}
        {pkg.itineraryPDF ? (
          <a
            href={pkg.itineraryPDF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download itinerary PDF"
            className="w-full bg-[#FCFBF7] text-[#121212] border-2 border-[#121212] py-3 px-4 font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-2 hover:bg-[#F4BF4B] transition-colors shadow-[3px_3px_0px_0px_#121212] text-center"
          >
            <Download size={14} /> DOWNLOAD ITINERARY (PDF)
          </a>
        ) : (
          <button
            onClick={handlePdfClick}
            aria-label="Download itinerary PDF"
            className="w-full bg-gray-50 text-[#121212]/60 border-2 border-[#121212]/20 py-3 px-4 font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-2 hover:border-[#121212] hover:text-[#121212] transition-colors cursor-pointer"
          >
            <FileText size={14} /> DOWNLOAD ITINERARY (PDF)
          </button>
        )}

        {/* PDF Toast Notification */}
        {pdfToast && (
          <div className="mt-3 p-3 bg-[#F4BF4B]/20 border-2 border-[#F4BF4B] text-[10px] font-bold text-[#121212] leading-tight animate-in fade-in duration-300">
            ℹ Itinerary PDF is currently being prepared by our team. Click <strong>ENQUIRE NOW</strong> to receive details directly via email.
          </div>
        )}

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-gray-400">
          <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
            NFA Small-Group Guarantee • Verified Itinerary
          </span>
        </div>
      </aside>

      {/* ── 2. TABLET INLINE PRICE CARD (visible on md to lg) ── */}
      <div className="hidden md:block lg:hidden my-8 w-full text-left">
        <div className="border-4 border-[#121212] bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#F4BF4B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">Itinerary PDF</span>
              {durationText && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-2.5 py-0.5">
                  {durationText}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[9px] font-black uppercase bg-[#9E1B1D] text-white px-2 py-0.5">
                  {discountBadgeText}
                </span>
              )}
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40 block">Investment</span>
              <div className="font-brand font-black text-3xl md:text-4xl text-[#121212] tracking-tighter">
                {hasValidPrice ? formattedPrice : 'Price On Request'}
                {hasValidPrice && <span className="text-xs font-sans text-gray-500 font-bold ml-2">/ person</span>}
              </div>
            </div>

            {topInclusions.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
                {topInclusions.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="text-xs font-bold text-[#121212]/80 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> {item.text}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleEnquireClick}
              aria-label="Enquire about this itinerary"
              className="bg-[#121212] text-[#F4BF4B] px-6 py-3.5 font-black text-xs uppercase tracking-[0.2em] flex justify-center items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors border-2 border-[#121212] shadow-[3px_3px_0px_0px_#F4BF4B] cursor-pointer"
            >
              <Mail size={16} /> ENQUIRE NOW
            </button>
            {pkg.itineraryPDF ? (
              <a
                href={pkg.itineraryPDF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download itinerary PDF"
                className="bg-[#FCFBF7] text-[#121212] border-2 border-[#121212] px-5 py-3.5 font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[#F4BF4B] transition-colors"
              >
                <Download size={14} /> ITINERARY PDF
              </a>
            ) : (
              <button
                onClick={handlePdfClick}
                aria-label="Download itinerary PDF"
                className="bg-gray-100 text-gray-600 border-2 border-[#121212]/20 px-5 py-3.5 font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 cursor-pointer"
              >
                <FileText size={14} /> ITINERARY PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. MOBILE COMPACT BOTTOM STICKY BAR (visible on < md) ── */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-[#121212] border-t-4 border-[#F4BF4B] z-40 shadow-[0_-8px_25px_rgba(0,0,0,0.5)] transition-all"
        aria-label="Mobile sticky pricing bar"
      >
        {/* Expanded Bottom Sheet for Mobile */}
        {mobileExpanded && (
          <div className="p-5 bg-[#FCFBF7] text-[#121212] border-b-4 border-[#121212] max-h-[65vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 text-left">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]/10 mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">Pricing Details</span>
              <button
                onClick={() => setMobileExpanded(false)}
                className="p-1 text-[#121212] hover:text-[#9E1B1D]"
                aria-label="Close pricing breakdown"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">Starting Investment</span>
                <div className="font-brand font-black text-3xl text-[#121212] tracking-tighter">
                  {hasValidPrice ? formattedPrice : 'Price On Request'}
                  {hasValidPrice && <span className="text-xs font-sans text-gray-500 font-bold ml-2">/ person</span>}
                </div>
              </div>

              {durationText && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#9E1B1D]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#121212]">{durationText}</span>
                </div>
              )}

              {topInclusions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/50 block">Included Privileges</span>
                  {topInclusions.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-[#121212]/80">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {pkg.itineraryPDF && (
                <a
                  href={pkg.itineraryPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download itinerary PDF"
                  className="w-full bg-[#121212] text-white py-3 px-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-[#121212]"
                >
                  <Download size={14} /> Download Itinerary PDF
                </a>
              )}
            </div>
          </div>
        )}

        {/* Compact Bottom Bar Row */}
        <div className="px-4 py-3 flex justify-between items-center gap-3">
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="text-left flex-1 min-w-0 group"
            aria-label="Toggle pricing details"
          >
            <div className="flex items-center gap-1 text-[8px] font-black text-[#F4BF4B] uppercase tracking-widest">
              <span>Investment</span>
              {mobileExpanded ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
            </div>
            <div className="text-lg font-black text-white tracking-tighter truncate group-hover:text-[#F4BF4B] transition-colors">
              {hasValidPrice ? formattedPrice : 'On Request'}
            </div>
          </button>

          <button
            onClick={(e) => handleEnquireClick(e, 'MOBILE_STICKY')}
            aria-label="Enquire about this itinerary"
            className="bg-[#F4BF4B] text-[#121212] px-5 py-2.5 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-transform shrink-0 border-2 border-[#F4BF4B] cursor-pointer"
          >
            Enquire <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

