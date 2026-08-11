import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, X, User, Calendar, MapPin, Package as PackageIcon,
  Compass, BookOpen, ChevronRight, Clock, ArrowRight, CornerDownLeft
} from 'lucide-react';
import {
  Booking, EnquiryDocument, CustomerDocument, Package as TravelPackage,
  Destination, CustomerStory
} from '../../types/database';

interface SearchResultItem {
  id: string;
  category: 'CUSTOMER' | 'ENQUIRY' | 'BOOKING' | 'JOURNEY' | 'DESTINATION' | 'STORY';
  title: string;
  subtitle: string;
  reference?: string;
  status?: string;
  score: number;
  rawItem: any;
}

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  enquiries: EnquiryDocument[];
  customers: CustomerDocument[];
  packages: TravelPackage[];
  destinations: Destination[];
  stories: CustomerStory[];
  onSelectResult: (result: SearchResultItem) => void;
}

const RECENT_SEARCHES_KEY = 'nfa_admin_recent_searches';

export const AdminGlobalSearchModal: React.FC<AdminGlobalSearchModalProps> = ({
  isOpen,
  onClose,
  bookings = [],
  enquiries = [],
  customers = [],
  packages = [],
  destinations = [],
  stories = [],
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored).slice(0, 5));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return;
    const next = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch (e) {
      // Ignore storage errors
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Helper to normalize strings & phone digits
  const normalizeText = (text?: string): string => (text || '').toLowerCase().trim();
  const normalizeDigits = (text?: string): string => (text || '').replace(/\D/g, '');

  // Calculate search results ranked by relevance score
  const results = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return [];
    const qDigits = normalizeDigits(q);

    const items: SearchResultItem[] = [];

    // 1. Customers
    customers.forEach((c) => {
      const name = c.name || '';
      const email = c.email || '';
      const phone = c.phone || '';
      const ref = c.customerReference || c.id;

      const normName = normalizeText(name);
      const normEmail = normalizeText(email);
      const normRef = normalizeText(ref);
      const normPhoneDigits = normalizeDigits(phone);

      let score = 0;
      if (normRef === q) score += 100;
      else if (normRef.includes(q)) score += 80;
      else if (normName === q) score += 90;
      else if (normName.startsWith(q)) score += 70;
      else if (normName.includes(q)) score += 50;
      else if (normEmail.includes(q)) score += 40;
      else if (qDigits && normPhoneDigits.includes(qDigits)) score += 60;

      if (score > 0) {
        items.push({
          id: `cust_${c.id}`,
          category: 'CUSTOMER',
          title: name || 'Customer',
          subtitle: `Ref: ${ref} • ${phone || email || 'No contact details'}`,
          reference: ref,
          score,
          rawItem: c,
        });
      }
    });

    // 2. Enquiries
    enquiries.forEach((e) => {
      const ref = e.enquiryReference || e.id;
      const travellerName = e.traveller?.name || '';
      const travellerEmail = e.traveller?.email || '';
      const travellerPhone = e.traveller?.phone || '';
      const journeyTitle = e.tripSummary?.itineraryTitle || e.tripSummary?.destination || '';

      const normRef = normalizeText(ref);
      const normName = normalizeText(travellerName);
      const normEmail = normalizeText(travellerEmail);
      const normJourney = normalizeText(journeyTitle);
      const normPhoneDigits = normalizeDigits(travellerPhone);

      let score = 0;
      if (normRef === q) score += 100;
      else if (normRef.includes(q)) score += 85;
      else if (normName === q) score += 90;
      else if (normName.startsWith(q)) score += 70;
      else if (normName.includes(q)) score += 50;
      else if (normJourney.includes(q)) score += 45;
      else if (normEmail.includes(q)) score += 40;
      else if (qDigits && normPhoneDigits.includes(qDigits)) score += 60;

      if (score > 0) {
        items.push({
          id: `enq_${e.id}`,
          category: 'ENQUIRY',
          title: travellerName || 'Enquiry',
          subtitle: `Ref: ${ref} • ${journeyTitle || 'Custom Expedition'}`,
          reference: ref,
          status: e.status,
          score,
          rawItem: e,
        });
      }
    });

    // 3. Bookings
    bookings.forEach((b) => {
      const ref = b.bookingReference || b.id;
      const travellerName = b.travelers?.[0]?.firstName
        ? `${b.travelers[0].firstName} ${b.travelers[0].lastName || ''}`
        : '';
      const destination = b.destination || '';
      const normRef = normalizeText(ref);
      const normName = normalizeText(travellerName);
      const normDest = normalizeText(destination);

      let score = 0;
      if (normRef === q) score += 100;
      else if (normRef.includes(q)) score += 85;
      else if (normName === q) score += 90;
      else if (normName.startsWith(q)) score += 70;
      else if (normName.includes(q)) score += 50;
      else if (normDest.includes(q)) score += 40;

      if (score > 0) {
        items.push({
          id: `book_${b.id}`,
          category: 'BOOKING',
          title: travellerName || 'Booking',
          subtitle: `Ref: ${ref} • ${destination || 'Trip'}`,
          reference: ref,
          status: b.bookingStatus,
          score,
          rawItem: b,
        });
      }
    });

    // 4. Journeys (Packages)
    packages.forEach((p) => {
      const title = p.title || '';
      const slug = p.slug || '';
      const overview = p.overview || '';
      const normTitle = normalizeText(title);
      const normSlug = normalizeText(slug);

      let score = 0;
      if (normTitle === q) score += 95;
      else if (normTitle.startsWith(q)) score += 75;
      else if (normTitle.includes(q)) score += 55;
      else if (normSlug.includes(q)) score += 50;
      else if (normalizeText(overview).includes(q)) score += 30;

      if (score > 0) {
        items.push({
          id: `pkg_${p.id}`,
          category: 'JOURNEY',
          title: title || 'Journey Package',
          subtitle: `${p.duration || 'Custom'} • ${p.destinations?.join(', ') || 'Global'}`,
          score,
          rawItem: p,
        });
      }
    });

    // 5. Destinations
    destinations.forEach((d) => {
      const name = d.name || '';
      const country = d.country || '';
      const normName = normalizeText(name);
      const normCountry = normalizeText(country);

      let score = 0;
      if (normName === q) score += 95;
      else if (normName.startsWith(q)) score += 75;
      else if (normName.includes(q)) score += 55;
      else if (normCountry.includes(q)) score += 45;

      if (score > 0) {
        items.push({
          id: `dest_${d.id}`,
          category: 'DESTINATION',
          title: name || 'Destination',
          subtitle: `${country || 'Global'} • ${d.continent || 'World'}`,
          score,
          rawItem: d,
        });
      }
    });

    // 6. Customer Stories
    stories.forEach((s) => {
      const title = s.title || s.tripTitle || '';
      const travellerName = s.customerName || '';
      const normTitle = normalizeText(title);
      const normName = normalizeText(travellerName);

      let score = 0;
      if (normTitle.includes(q)) score += 50;
      else if (normName.includes(q)) score += 45;

      if (score > 0) {
        items.push({
          id: `story_${s.id}`,
          category: 'STORY',
          title: title || 'Customer Story',
          subtitle: `By ${travellerName || 'Traveller'} • ${s.destination || 'Global'}`,
          score,
          rawItem: s,
        });
      }
    });

    return items.sort((a, b) => b.score - a.score);
  }, [query, customers, enquiries, bookings, packages, destinations, stories]);

  // Group results for grouped list presentation (max 5 per group)
  const groupedResults = useMemo(() => {
    const groups: { category: string; label: string; items: SearchResultItem[] }[] = [
      { category: 'ENQUIRY', label: 'ENQUIRIES & LEADS', items: [] },
      { category: 'BOOKING', label: 'BOOKINGS', items: [] },
      { category: 'CUSTOMER', label: 'TRAVELLERS', items: [] },
      { category: 'JOURNEY', label: 'JOURNEYS', items: [] },
      { category: 'DESTINATION', label: 'DESTINATIONS', items: [] },
      { category: 'STORY', label: 'CUSTOMER STORIES', items: [] },
    ];

    results.forEach((res) => {
      const g = groups.find((grp) => grp.category === res.category);
      if (g && g.items.length < 5) {
        g.items.push(res);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [results]);

  // Flatten grouped results for keyboard navigation array
  const flatResults = useMemo(() => {
    const list: SearchResultItem[] = [];
    groupedResults.forEach((g) => list.push(...g.items));
    return list;
  }, [groupedResults]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatResults.length > 0 ? (prev + 1) % flatResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (flatResults.length > 0 ? (prev - 1 + flatResults.length) % flatResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        saveRecentSearch(query);
        onSelectResult(flatResults[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Global Admin Search"
    >
      <div
        className="bg-white w-full max-w-2xl border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search travellers, enquiries, bookings, journeys, destinations…"
            className="w-full bg-transparent border-none text-slate-900 font-brand font-black text-base focus:ring-0 focus:outline-hidden placeholder:font-sans placeholder:text-slate-400 placeholder:text-sm"
            aria-label="Search input"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
          <span className="px-2 py-1 bg-slate-200 text-slate-600 font-mono text-[10px] font-bold rounded-md shrink-0">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Empty Query State */}
          {!query.trim() && (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">RECENT SEARCHES</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      CLEAR RECENT
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Clock size={12} className="text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-8 text-center text-slate-400 space-y-2">
                <Search size={32} className="mx-auto opacity-40" />
                <p className="font-brand font-black text-sm uppercase text-slate-800">GLOBAL WORKSPACE SEARCH</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type a traveller name, enquiry reference (e.g. NFA-849201), booking ID, or destination to jump directly.
                </p>
              </div>
            </div>
          )}

          {/* No Results Match State */}
          {query.trim() && flatResults.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search size={32} className="mx-auto opacity-40" />
              <p className="font-brand font-black text-sm uppercase text-slate-900">
                NOTHING FOUND FOR “{query}”
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try a traveller name, reference number (e.g. NFA-849201), journey title, or destination.
              </p>
            </div>
          )}

          {/* Results Grouped List */}
          {groupedResults.map((group) => (
            <div key={group.category} className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                {group.label}
              </span>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const globalIdx = flatResults.findIndex((r) => r.id === item.id);
                  const isSelected = globalIdx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        saveRecentSearch(query);
                        onSelectResult(item);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#121212] text-white border-[#121212] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#F4BF4B] text-[#121212]' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.category === 'CUSTOMER' && <User size={16} />}
                          {item.category === 'ENQUIRY' && <Calendar size={16} />}
                          {item.category === 'BOOKING' && <Compass size={16} />}
                          {item.category === 'JOURNEY' && <PackageIcon size={16} />}
                          {item.category === 'DESTINATION' && <MapPin size={16} />}
                          {item.category === 'STORY' && <BookOpen size={16} />}
                        </div>

                        <div className="min-w-0">
                          <p className="font-brand font-black text-sm truncate">{item.title}</p>
                          <p className={`text-xs truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.status && (
                          <span
                            className={`px-2 py-0.5 font-black text-[9px] uppercase rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isSelected ? 'text-[#F4BF4B]' : 'text-slate-600'
                          }`}
                        >
                          OPEN <CornerDownLeft size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-bold text-slate-700">{flatResults.length} matches</span>
        </div>
      </div>
    </div>
  );
};
