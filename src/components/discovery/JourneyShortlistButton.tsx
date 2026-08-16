import React, { useState } from 'react';
import { Bookmark, Check, Plus, AlertCircle } from 'lucide-react';
import { useJourneyShortlist } from '../../hooks/useJourneyShortlist';

interface JourneyShortlistButtonProps {
  packageId: string;
  slug?: string;
  title?: string;
  variant?: 'icon' | 'compact' | 'full';
  className?: string;
  onNotification?: (msg: string) => void;
}

export const JourneyShortlistButton: React.FC<JourneyShortlistButtonProps> = ({
  packageId,
  slug,
  title = 'Journey',
  variant = 'icon',
  className = '',
  onNotification,
}) => {
  const { isShortlisted, toggleShortlist } = useJourneyShortlist();
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const active = isShortlisted(packageId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const res = toggleShortlist(packageId, slug);
    if (res.message) {
      if (onNotification) {
        onNotification(res.message);
      } else {
        setJustToggled(res.message);
        setTimeout(() => setJustToggled(null), 3000);
      }
    }
  };

  const ariaLabel = active
    ? `Remove ${title} from shortlist`
    : `Add ${title} to shortlist`;

  if (variant === 'full') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          aria-label={ariaLabel}
          aria-pressed={active}
          className={`px-5 py-3 border-2 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            active
              ? 'bg-[#F4BF4B] text-[#121212] border-[#121212] hover:bg-rose-100 hover:text-rose-900 hover:border-rose-900'
              : 'bg-white text-[#121212] border-[#121212] hover:bg-[#121212] hover:text-[#F4BF4B]'
          } ${className}`}
        >
          <Bookmark size={14} className={active ? 'fill-[#121212]' : ''} />
          <span>{active ? 'IN SHORTLIST' : 'ADD TO SHORTLIST'}</span>
        </button>

        {justToggled && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-[#121212] text-white text-[10px] font-bold px-3 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2">
            {justToggled}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          aria-label={ariaLabel}
          aria-pressed={active}
          className={`px-3 py-1.5 border font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
            active
              ? 'bg-[#F4BF4B] text-[#121212] border-[#121212]'
              : 'bg-white/90 text-slate-800 border-slate-300 hover:bg-[#121212] hover:text-[#F4BF4B]'
          } ${className}`}
        >
          <Bookmark size={11} className={active ? 'fill-[#121212]' : ''} />
          <span>{active ? 'SHORTLISTED' : '+ SHORTLIST'}</span>
        </button>

        {justToggled && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-9 bg-[#121212] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in">
            {justToggled}
          </div>
        )}
      </div>
    );
  }

  // Default icon variant
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-pressed={active}
        title={active ? 'In Shortlist' : 'Add to Shortlist'}
        className={`size-9 flex items-center justify-center border-2 border-[#121212] transition-all cursor-pointer shadow-sm ${
          active
            ? 'bg-[#F4BF4B] text-[#121212]'
            : 'bg-white/90 text-[#121212] hover:bg-[#121212] hover:text-[#F4BF4B]'
        } ${className}`}
      >
        <Bookmark size={15} className={active ? 'fill-[#121212]' : ''} />
      </button>

      {justToggled && (
        <div className="absolute right-0 -top-8 bg-[#121212] text-white text-[9px] font-bold px-2.5 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in duration-200">
          {justToggled}
        </div>
      )}
    </div>
  );
};
