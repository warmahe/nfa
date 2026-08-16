import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, ArrowLeft, Save,
  MapPin, Calendar, Clock, Star, Users, Info,
  Layers, CheckCircle, XCircle, HelpCircle, Image as ImageIcon,
  ChevronRight, ChevronUp, ChevronDown, PlusCircle, Trash, X, Download,
  Sparkles, Eye, Filter, Compass, AlertTriangle, FileText, Lock, Globe, DollarSign,
  FileCheck, Shield, Award, Check, ClipboardCheck
} from 'lucide-react';
import {
  collection, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebaseService';
import {
  Package, ItineraryCity, ItineraryDay, HotelInfo,
  RichInclusionExclusion, TripHighlight, QuickInfoItem
} from '../../types/database';
import { ImageInput } from './ImageInput';
import { GalleryManager } from './GalleryManager';
import { AdminSEOEditor } from './AdminSEOEditor';
import { JourneyDepartureManager } from './JourneyDepartureManager';
import { JourneyTravelWindowManager } from './JourneyTravelWindowManager';
import { useAdminDialog } from './AdminDialogContext';
import { normalizeItinerary } from '../../utils/itineraryNormalizer';
import {
  checkPackageContent, getPackageBadge, ContentCheckResult, ContentQualityBadge
} from '../../utils/contentQuality';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CHECK CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ContentCheckCardProps {
  result: ContentCheckResult;
  onClickFix?: (targetTab: string) => void;
  compact?: boolean;
}

const ContentCheckCard: React.FC<ContentCheckCardProps> = ({ result, onClickFix, compact = false }) => {
  const [expanded, setExpanded] = useState(false);
  const { isPublishable, required, recommended, requiredFailCount, recommendedFailCount } = result;

  const failedRequired = required.filter((r) => !r.passed);
  const failedRecommended = recommended.filter((r) => !r.passed);
  const passedRequired = required.filter((r) => r.passed);

  const summaryColor = !isPublishable
    ? 'bg-rose-50 border-rose-200'
    : recommendedFailCount > 0
    ? 'bg-amber-50 border-amber-200'
    : 'bg-emerald-50 border-emerald-200';

  const summaryText = !isPublishable
    ? `${requiredFailCount} required detail${requiredFailCount !== 1 ? 's' : ''} missing before publishing`
    : recommendedFailCount > 0
    ? `Ready to publish — ${recommendedFailCount} optional detail${recommendedFailCount !== 1 ? 's' : ''} could be improved`
    : 'Ready to publish';

  const summaryIcon = !isPublishable ? (
    <AlertTriangle size={14} className="text-rose-500 shrink-0" aria-hidden="true" />
  ) : recommendedFailCount > 0 ? (
    <AlertTriangle size={14} className="text-amber-500 shrink-0" aria-hidden="true" />
  ) : (
    <Check size={14} className="text-emerald-600 shrink-0" aria-hidden="true" />
  );

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden ${summaryColor}`}
      role="region"
      aria-label="Content check results"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={15} className="text-slate-600 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Content Check</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          aria-expanded={expanded}
          aria-controls="content-check-details"
        >
          {expanded ? 'Hide details' : 'Show details'}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Compact preview — always visible */}
      {!expanded && (
        <div className="px-4 pb-3 flex items-center gap-2">
          {summaryIcon}
          <span
            className={`text-xs font-bold ${
              !isPublishable ? 'text-rose-700' : recommendedFailCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
            aria-live="polite"
          >
            {summaryText}
          </span>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div id="content-check-details" className="px-4 pb-4 space-y-3">
          {/* Required section */}
          {required.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Required</p>
              <ul className="space-y-1" role="list">
                {required.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    {item.passed ? (
                      <Check size={13} className="text-emerald-600 mt-0.5 shrink-0" aria-label="Passed" />
                    ) : (
                      <AlertTriangle size={13} className="text-rose-500 mt-0.5 shrink-0" aria-label="Missing" />
                    )}
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => item.targetTab && onClickFix?.(item.targetTab)}
                        disabled={item.passed || !item.targetTab}
                        className={`text-xs font-semibold text-left ${
                          !item.passed && item.targetTab
                            ? 'text-rose-700 hover:text-rose-900 underline cursor-pointer'
                            : item.passed
                            ? 'text-slate-600 cursor-default'
                            : 'text-slate-500 cursor-default'
                        }`}
                        aria-label={item.passed ? `${item.label} — passed` : `${item.label} — click to fix`}
                      >
                        {item.label}
                      </button>
                      {!item.passed && item.detail && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">{item.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended section — only show failures */}
          {failedRecommended.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Recommended</p>
              <ul className="space-y-1" role="list">
                {failedRecommended.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" aria-label="Recommended" />
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => item.targetTab && onClickFix?.(item.targetTab)}
                        disabled={!item.targetTab}
                        className={`text-xs font-semibold text-left ${
                          item.targetTab
                            ? 'text-amber-700 hover:text-amber-900 underline cursor-pointer'
                            : 'text-slate-500 cursor-default'
                        }`}
                        aria-label={`${item.label} — recommended`}
                      >
                        {item.label}
                      </button>
                      {item.detail && (
                        <p className="text-[10px] text-amber-600 font-medium mt-0.5">{item.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* All passed */}
          {failedRequired.length === 0 && failedRecommended.length === 0 && (
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Check size={14} />
              All journey details look great.
            </p>
          )}

          {/* Summary line */}
          <div className={`pt-2 border-t border-current/20 flex items-center gap-2 ${
            !isPublishable ? 'text-rose-700' : recommendedFailCount > 0 ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {summaryIcon}
            <span className="text-xs font-bold" aria-live="polite">{summaryText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT QUALITY BADGE (list view)
// ─────────────────────────────────────────────────────────────────────────────

const QualityBadge: React.FC<{ badge: ContentQualityBadge }> = ({ badge }) => {
  if (badge === 'ready') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Content ready">
        <Check size={9} aria-hidden="true" /> Ready
      </span>
    );
  }
  if (badge === 'needs_details') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Needs details before publishing">
        <AlertTriangle size={9} aria-hidden="true" /> Needs details
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Draft">
      Draft
    </span>
  );
};

// Editor Tab Types
type EditorTab =
  | 'OVERVIEW'
  | 'STOPS'
  | 'ITINERARY'
  | 'HOTELS'
  | 'EXPERIENCES'
  | 'INCLUSIONS'
  | 'FAQS'
  | 'PRICING'
  | 'AVAILABILITY'
  | 'MEDIA'
  | 'TRAVEL_INFO'
  | 'PUBLISHING';

// ─────────────────────────────────────────────────────────────────────────────
// PDF UPLOAD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface PDFUploadInputProps {
  onSave: (url: string) => void;
  storagePath: string;
  packageTitle: string;
}

const PDFUploadInput: React.FC<PDFUploadInputProps> = ({ onSave, storagePath, packageTitle }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          setUploading(true);
          setError('');

          try {
            const timestamp = Date.now();
            const filename = `${packageTitle.toLowerCase().replace(/\s+/g, '_')}_itinerary_${timestamp}.pdf`;
            const path = `${storagePath}/itinerary/${filename}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            onSave(downloadURL);
          } catch (err: any) {
            setError(err.message || 'Error uploading PDF');
          } finally {
            setUploading(false);
          }
        }}
        className="block w-full text-xs font-semibold text-slate-700 cursor-pointer"
        aria-label="Upload itinerary PDF file"
      />
      {uploading && <p className="text-xs font-bold text-amber-600 animate-pulse">Uploading Itinerary PDF…</p>}
      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN JOURNEY MANAGER
// ─────────────────────────────────────────────────────────────────────────────
export const AdminPackagesManager = () => {
  const { confirm, toast } = useAdminDialog();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor State
  const [activePackage, setActivePackage] = useState<Package | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('OVERVIEW');
  const [isDirty, setIsDirty] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [styleFilter, setStyleFilter] = useState<string>('ALL');
  const [contentFilter, setContentFilter] = useState<'all' | 'ready' | 'needs_details' | 'draft'>('all');

  // Modals & Confirmation States
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteStopConfirmIndex, setDeleteStopConfirmIndex] = useState<number | null>(null);
  const [deleteDayConfirm, setDeleteDayConfirm] = useState<{ cIdx: number; dIdx: number; dayNumber: number } | null>(null);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Temp Inputs for Lists
  const [newHighlightText, setNewHighlightText] = useState('');
  const [newInclusionText, setNewInclusionText] = useState('');
  const [newExclusionText, setNewExclusionText] = useState('');
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Stop-level temp inputs map [stopIndex]: value
  const [newStopHighlight, setNewStopHighlight] = useState<Record<number, string>>({});
  const [newStopExperience, setNewStopExperience] = useState<Record<number, string>>({});

  // Day-level temp inputs map [key]: value
  const [newDayHighlight, setNewDayHighlight] = useState<Record<string, string>>({});
  const [newDayExperience, setNewDayExperience] = useState<Record<string, string>>({});
  const [newDayActivity, setNewDayActivity] = useState<Record<string, string>>({});
  const [newDayAddon, setNewDayAddon] = useState<Record<string, string>>({});

  // 1. Real-time Subscription to Packages Collection
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'packages'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pkgs = snapshot.docs.map((d) => normalizeItinerary({ id: d.id, ...d.data() } as Package));
        setPackages(pkgs);
        setLoading(false);
      },
      (error) => {
        console.error('Error in realtime packages listener:', error);
        setNotice({ type: 'error', text: 'Couldn\'t load journeys. Please try again.' });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateNew = () => {
    if (isDirty) {
      setDiscardConfirm(true);
      return;
    }

    const timestamp = Date.now();
    const newPkg: Package = normalizeItinerary({
      id: '',
      title: 'New Luxury Journey',
      slug: `new-journey-${timestamp}`,
      status: 'draft',
      difficulty: 'Moderate',
      duration: '7 Days / 6 Nights',
      destinations: [],
      overview: '',
      description: '',
      editorialIntro: '',
      travelStyle: ['Luxury', 'Adventure'],
      bestFor: ['Couples', 'Families'],
      bestTime: 'Year-round',
      editorialHighlights: [],
      itineraryCities: [
        {
          city: 'Lake Como',
          country: 'Italy',
          nights: 3,
          description: 'Scenic lakeside luxury, historic villas, and private boat cruises.',
          heroImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=80',
          highlights: ['Private Boat Tour', 'Villa Balbianello Visit'],
          experiences: ['Wine Tasting at Lake Villa'],
          arrivalTransfer: { type: 'car', text: 'Private chauffeur transfer from Milan Malpensa Airport' },
          hotel: { name: 'Grand Hotel Tremezzo', type: 'Luxury Palace Hotel', rating: 5 },
          days: [
            {
              day: 1,
              title: 'Arrival in Lake Como & Sunset Welcome Cruise',
              description: 'Arrive at Lake Como. Private transfer to your luxury lakefront hotel.',
              meals: ['Dinner'],
              activities: ['Airport Chauffeur Transfer', 'Sunset Boat Cruise'],
              highlights: ['Lakefront Suite Check-in'],
              experiences: ['Welcome Dinner at Lake Terrace'],
              hotel: { name: 'Grand Hotel Tremezzo', type: 'Luxury Palace Hotel' }
            },
            {
              day: 2,
              title: 'Historic Villas & Alpine Panorama',
              description: 'Guided tour of Villa Balbianello and private boat excursion across mid-lake.',
              meals: ['Breakfast', 'Lunch'],
              activities: ['Villa Balbianello Tour', 'Private Boat Excursion'],
              highlights: ['Villa Balbianello Gardens'],
              experiences: ['Lakeside Gourmet Lunch']
            }
          ]
        }
      ],
      inclusionsRich: [
        { text: 'Luxury accommodation throughout' },
        { text: 'All internal transfers and airport meet & greet' }
      ],
      exclusionsRich: [
        { text: 'International flights' },
        { text: 'Personal travel insurance' }
      ],
      packageFaqs: [
        { question: 'What is the best time of year for this trip?', answer: 'This journey is crafted to be exceptional year-round.' }
      ],
      pricing: {
        basePrice: 150000,
        currency: 'INR',
        dates: []
      },
      media: {
        thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80',
        gallery: []
      }
    });

    setActivePackage(newPkg);
    setOriginalSlug(newPkg.slug);
    setShowEditor(true);
    setIsDirty(false);
    setActiveTab('OVERVIEW');
  };

  const handleEditPackage = (pkg: Package) => {
    if (isDirty) {
      setDiscardConfirm(true);
      return;
    }
    const normalized = normalizeItinerary(pkg);
    setActivePackage(normalized);
    setOriginalSlug(normalized.slug || '');
    setShowEditor(true);
    setIsDirty(false);
    setActiveTab('OVERVIEW');
  };

  const handleCloseEditor = () => {
    if (isDirty) {
      setDiscardConfirm(true);
    } else {
      setShowEditor(false);
      setActivePackage(null);
      setIsDirty(false);
    }
  };

  const handleFieldChange = (field: keyof Package, value: any) => {
    if (!activePackage) return;
    setActivePackage((prev) => {
      if (!prev) return null;
      const next = { ...prev, [field]: value };
      if (field === 'title' && !prev.id) {
        next.slug = slugify(value);
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleNestedChange = (parent: keyof Package, child: string, value: any) => {
    if (!activePackage) return;
    setActivePackage((prev) => {
      if (!prev) return null;
      const currentParent = (prev[parent] as any) || {};
      return {
        ...prev,
        [parent]: {
          ...currentParent,
          [child]: value
        }
      };
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!activePackage) return;

    if (!activePackage.title?.trim()) {
      setNotice({ type: 'error', text: 'Please enter a journey name.' });
      setActiveTab('OVERVIEW');
      return;
    }

    if (!activePackage.slug?.trim()) {
      setNotice({ type: 'error', text: 'Please add a URL slug.' });
      setActiveTab('OVERVIEW');
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const cleanSlug = slugify(activePackage.slug);
      const normalized = normalizeItinerary({
        ...activePackage,
        slug: cleanSlug,
        title: activePackage.title.trim(),
        updatedAt: new Date() as any,
      });

      if (activePackage.id) {
        const docRef = doc(db, 'packages', activePackage.id);
        await updateDoc(docRef, normalized as any);
        setNotice({ type: 'success', text: 'Journey saved.' });
      } else {
        const newId = `pkg_${cleanSlug}_${Date.now()}`;
        const docRef = doc(db, 'packages', newId);
        await setDoc(docRef, { ...normalized, id: newId, createdAt: new Date() });
        setActivePackage((prev) => (prev ? { ...prev, id: newId } : null));
        setNotice({ type: 'success', text: 'Journey saved.' });
      }

      setIsDirty(false);
      setOriginalSlug(cleanSlug);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error saving journey:', err);
      setNotice({ type: 'error', text: 'Couldn\'t save journey. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'packages', id));
      setNotice({ type: 'success', text: 'Journey deleted.' });
      setDeleteConfirmId(null);
      if (activePackage?.id === id) {
        setShowEditor(false);
        setActivePackage(null);
      }
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting journey:', err);
      setNotice({ type: 'error', text: 'Couldn\'t delete journey. Please try again.' });
    }
  };

  // Filtered package list
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Status filter
      if (statusFilter === 'published' && pkg.status === 'draft') return false;
      if (statusFilter === 'unpublished' && pkg.status !== 'draft') return false;

      // Style filter
      if (styleFilter !== 'ALL' && !pkg.travelStyle?.includes(styleFilter)) return false;

      // E32: Content quality filter
      if (contentFilter !== 'all') {
        const badge = getPackageBadge(pkg);
        if (badge !== contentFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = pkg.title?.toLowerCase().includes(q);
        const matchSlug = pkg.slug?.toLowerCase().includes(q);
        const matchDest = pkg.destinations?.some((d) => d.toLowerCase().includes(q));
        const matchCity = pkg.itineraryCities?.some((c) => c.city?.toLowerCase().includes(q));
        return matchTitle || matchSlug || matchDest || matchCity;
      }

      return true;
    });
  }, [packages, statusFilter, styleFilter, searchQuery, contentFilter]);

  const stats = useMemo(() => {
    const total = packages.length;
    const published = packages.filter((p) => p.status !== 'draft').length;
    const draft = total - published;
    const needsAttention = packages.filter((p) => getPackageBadge(p) === 'needs_details').length;
    return { total, published, draft, needsAttention };
  }, [packages]);

  // E32 — Live content quality check on the active editor state
  const contentCheck = useMemo(() => {
    if (!activePackage) return null;
    return checkPackageContent(activePackage);
  }, [activePackage]);

  // Derived Journey Structure Summary
  const journeySummary = useMemo(() => {
    if (!activePackage) return null;
    const cities = activePackage.itineraryCities || [];
    const totalStops = cities.length;
    const totalNights = cities.reduce((acc, c) => acc + (c.nights || 0), 0);

    let totalDays = 0;
    let hotelCount = 0;
    cities.forEach((c) => {
      totalDays += (c.days || []).length;
      if (c.hotel?.name) hotelCount++;
      (c.days || []).forEach((d) => {
        if (d.hotel?.name) hotelCount++;
      });
    });

    const routeStr = cities.map((c) => c.city || 'Stop').join(' → ');

    return {
      totalStops,
      totalNights,
      totalDays: totalDays || (totalNights ? totalNights + 1 : 1),
      hotelCount,
      routeStr,
      cities,
    };
  }, [activePackage]);

  // Duration Mismatch Warning Calculation
  const durationMismatchNotice = useMemo(() => {
    if (!activePackage || !journeySummary) return null;
    const configuredDuration = (activePackage.duration || '').toLowerCase();
    const nightsInConfig = parseInt((configuredDuration.match(/(\d+)\s*night/i) || [])[1] || '0', 10);
    const daysInConfig = parseInt((configuredDuration.match(/(\d+)\s*day/i) || [])[1] || '0', 10);

    if (nightsInConfig > 0 && nightsInConfig !== journeySummary.totalNights) {
      return `Notice: Your overall trip length setting ('${activePackage.duration}') and configured journey stops (${journeySummary.totalNights} Nights / ${journeySummary.totalDays} Days) differ. Review your duration setting if needed.`;
    }
    return null;
  }, [activePackage, journeySummary]);

  const inputClass = 'saas-input w-full text-xs text-slate-900 font-sans focus:ring-2 focus:ring-[#121212] focus:border-transparent';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1';

  if (loading && packages.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <Compass className="size-8 mx-auto text-slate-300 animate-pulse" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Journeys…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Alert Notices */}
      {notice && (
        <div
          className={`p-4 rounded-xl border-2 font-bold text-xs flex items-center justify-between ${
            notice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} className="text-emerald-600" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="hover:opacity-75 cursor-pointer" aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Duration Mismatch Warning Banner */}
      {durationMismatchNotice && showEditor && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <span>{durationMismatchNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight">
            Journey & Itinerary Workspace
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create, edit, and organize multi-stop travel itineraries, day-by-day plans, stays, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} /> CREATE JOURNEY
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="size-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Compass size={18} className="text-slate-700" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
            <p className="font-black text-xl text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="size-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
            <Check size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published</p>
            <p className="font-black text-xl text-emerald-700">{stats.published}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="size-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <Lock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Draft</p>
            <p className="font-black text-xl text-amber-700">{stats.draft}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="size-9 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Needs Attention</p>
            <p className="font-black text-xl text-rose-600">{stats.needsAttention}</p>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      {showEditor && activePackage && (
        <div className="saas-card bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden space-y-0">
          {/* Top Bar */}
          <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass size={22} className="text-[#F4BF4B]" />
              <div>
                <h3 className="font-brand font-black text-lg uppercase tracking-tight text-white">
                  {activePackage.id ? `Edit: ${activePackage.title}` : 'Create New Journey'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {activePackage.status !== 'draft' ? 'Published (Visible on website)' : 'Unpublished (Draft)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activePackage.slug && (
                <a
                  href={`/itinerary/${activePackage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white/10 text-white hover:bg-white/20 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} /> PREVIEW JOURNEY
                </a>
              )}

              <button
                onClick={handleCloseEditor}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close editor"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Journey Structure Summary Banner */}
          {journeySummary && (
            <div className="p-4 bg-[#FCFBF7] border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-900">
                <span className="px-2.5 py-1 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest rounded-md">
                  {journeySummary.totalStops} STOPS
                </span>
                <span>
                  {journeySummary.totalDays} DAYS / {journeySummary.totalNights} NIGHTS
                </span>
                <span>&bull;</span>
                <span>{journeySummary.hotelCount} STAYS</span>
              </div>

              {journeySummary.routeStr && (
                <div className="text-xs font-semibold text-slate-600 truncate max-w-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">ROUTE:</span>
                  <span className="text-slate-900 font-bold">{journeySummary.routeStr}</span>
                </div>
              )}
            </div>
          )}

          {/* Editor Tabs Navigation */}
          <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
            {[
              { id: 'OVERVIEW', label: '1. Overview', icon: Globe },
              { id: 'STOPS', label: '2. Journey Stops', icon: MapPin },
              { id: 'ITINERARY', label: '3. Day-by-Day', icon: Calendar },
              { id: 'HOTELS', label: '4. Accommodation', icon: Compass },
              { id: 'EXPERIENCES', label: '5. Experiences', icon: Sparkles },
              { id: 'INCLUSIONS', label: '6. Inclusions', icon: FileCheck },
              { id: 'FAQS', label: '7. Questions', icon: HelpCircle },
              { id: 'PRICING', label: '8. Pricing', icon: DollarSign },
              { id: 'AVAILABILITY', label: '9. Dates & Availability', icon: Calendar },
              { id: 'MEDIA', label: '10. Media & PDF', icon: ImageIcon },
              { id: 'TRAVEL_INFO', label: '11. Travel Info', icon: Info },
              { id: 'PUBLISHING', label: '12. Publishing & SEO', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={`px-4 py-2.5 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-[#121212] text-[#121212] bg-white rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                  aria-label={`Switch to tab ${tab.label}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* Tab 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Journey Title *</label>
                    <input
                      type="text"
                      value={activePackage.title || ''}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      placeholder="e.g., Classical Italy & Amalfi Coast"
                      className={inputClass}
                      aria-label="Journey Title"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>URL Slug *</label>
                    <input
                      type="text"
                      value={activePackage.slug || ''}
                      onChange={(e) => handleFieldChange('slug', e.target.value)}
                      placeholder="e.g., classical-italy-amalfi"
                      className={inputClass}
                      aria-label="URL Slug"
                    />
                    {activePackage.id && originalSlug && activePackage.slug !== originalSlug && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Changing the URL slug may break existing links to this journey.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Short Editorial Intro</label>
                  <input
                    type="text"
                    value={activePackage.editorialIntro || ''}
                    onChange={(e) => handleFieldChange('editorialIntro', e.target.value)}
                    placeholder="Captivating one-line summary for cards and search..."
                    className={inputClass}
                    aria-label="Short Editorial Intro"
                  />
                </div>

                <div>
                  <label className={labelClass}>Journey Overview</label>
                  <textarea
                    value={activePackage.overview || ''}
                    onChange={(e) => handleFieldChange('overview', e.target.value)}
                    placeholder="Comprehensive overview of the journey experience..."
                    rows={4}
                    className={inputClass + ' resize-none'}
                    aria-label="Journey Overview"
                  />
                </div>

                <div>
                  <label className={labelClass}>Full Description Narrative</label>
                  <textarea
                    value={activePackage.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Detailed narrative describing the trip..."
                    rows={5}
                    className={inputClass + ' resize-none'}
                    aria-label="Full Description Narrative"
                  />
                </div>

                {/* About Section Customization */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">EDITORIAL STORYTELLING SECTION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>About Header Title</label>
                      <input
                        type="text"
                        value={activePackage.aboutTitle || ''}
                        onChange={(e) => handleFieldChange('aboutTitle', e.target.value)}
                        placeholder="e.g., The Essence of Italian Elegance"
                        className={inputClass}
                        aria-label="About Header Title"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>About Question / Subtitle</label>
                      <input
                        type="text"
                        value={activePackage.aboutQuestion || ''}
                        onChange={(e) => handleFieldChange('aboutQuestion', e.target.value)}
                        placeholder="e.g., Why choose this expedition?"
                        className={inputClass}
                        aria-label="About Question / Subtitle"
                      />
                    </div>
                  </div>
                </div>

                {/* Multi-Select Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Travel Style Tags</label>
                    <p className="text-[10px] text-slate-500 font-medium mb-1.5">Select travel styles that apply.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Luxury', 'Adventure', 'Family', 'Honeymoon', 'Wildlife', 'Culture', 'Culinary', 'Photography'].map((style) => {
                        const isSelected = activePackage.travelStyle?.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => {
                              const current = activePackage.travelStyle || [];
                              const next = isSelected ? current.filter((s) => s !== style) : [...current, style];
                              handleFieldChange('travelStyle', next);
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                            aria-label={`Toggle travel style ${style}`}
                          >
                            {style}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Best For Tags</label>
                    <p className="text-[10px] text-slate-500 font-medium mb-1.5">Select target traveller profiles.</p>
                    <div className="flex flex-wrap gap-2">
                      {['Couples', 'Families', 'Solo Travellers', 'Photography Lovers', 'Food Lovers', 'Nature Lovers'].map((target) => {
                        const isSelected = activePackage.bestFor?.includes(target);
                        return (
                          <button
                            key={target}
                            type="button"
                            onClick={() => {
                              const current = activePackage.bestFor || [];
                              const next = isSelected ? current.filter((t) => t !== target) : [...current, target];
                              handleFieldChange('bestFor', next);
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#9E1B1D] text-white border-[#9E1B1D]'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                            aria-label={`Toggle target traveler ${target}`}
                          >
                            {target}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: JOURNEY STOPS */}
            {activeTab === 'STOPS' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">JOURNEY STOPS & LOCATIONS</h4>
                    <p className="text-xs text-slate-500 font-medium">Add, edit, and reorder multi-destination stops across the itinerary.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const current = activePackage.itineraryCities || [];
                      const newStop: ItineraryCity = {
                        city: `Stop ${current.length + 1}`,
                        country: '',
                        nights: 2,
                        order: current.length,
                        days: []
                      };
                      handleFieldChange('itineraryCities', [...current, newStop]);
                    }}
                    className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                    aria-label="Add journey stop"
                  >
                    <Plus size={14} /> ADD JOURNEY STOP
                  </button>
                </div>

                {(!activePackage.itineraryCities || activePackage.itineraryCities.length === 0) ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                    No journey stops added yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activePackage.itineraryCities.map((city, idx) => {
                      const plannedDaysCount = (city.days || []).length;
                      const hotelName = city.hotel?.name || '';
                      const highlightsCount = (city.highlights || []).length;
                      const experiencesCount = (city.experiences || []).length;
                      const galleryCount = (city.gallery || []).length;

                      return (
                        <div key={idx} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4">
                          {/* Stop Header & Summary Badges */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="size-8 bg-[#121212] text-[#F4BF4B] font-black text-xs rounded-lg flex items-center justify-center shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <h5 className="font-brand font-black text-base text-slate-900 uppercase">
                                  {city.city || `Stop ${idx + 1}`}
                                  {city.country && <span className="text-slate-500 font-bold text-xs ml-2">({city.country})</span>}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-[#9E1B1D] text-white font-black text-[10px] uppercase rounded">
                                    {city.nights || 1} NIGHT{city.nights === 1 ? '' : 'S'}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold text-[10px] rounded">
                                    {plannedDaysCount} DAYS PLANNED
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-bold text-[10px] rounded">
                                    STAY: {hotelName || 'NO STAY ASSIGNED'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...(activePackage.itineraryCities || [])];
                                  if (idx > 0) {
                                    const temp = current[idx];
                                    current[idx] = current[idx - 1];
                                    current[idx - 1] = temp;
                                    handleFieldChange('itineraryCities', current);
                                  }
                                }}
                                disabled={idx === 0}
                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] uppercase rounded-md flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                                aria-label={`Move ${city.city || `Stop ${idx + 1}`} up`}
                              >
                                <ChevronUp size={14} /> UP
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...(activePackage.itineraryCities || [])];
                                  if (idx < current.length - 1) {
                                    const temp = current[idx];
                                    current[idx] = current[idx + 1];
                                    current[idx + 1] = temp;
                                    handleFieldChange('itineraryCities', current);
                                  }
                                }}
                                disabled={idx === activePackage.itineraryCities!.length - 1}
                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[10px] uppercase rounded-md flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                                aria-label={`Move ${city.city || `Stop ${idx + 1}`} down`}
                              >
                                <ChevronDown size={14} /> DOWN
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteStopConfirmIndex(idx)}
                                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer ml-1"
                                aria-label={`Remove ${city.city || `Stop ${idx + 1}`} from journey`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {/* 6 Structured Stop Sections */}
                          <div className="space-y-4 pt-1">
                            {/* Section 1: DESTINATION STORY */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-900">1. DESTINATION STORY</h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className={labelClass}>Location / City *</label>
                                  <input
                                    type="text"
                                    value={city.city || ''}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = { ...current[idx], city: e.target.value };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    placeholder="e.g., Lake Como"
                                    className={inputClass}
                                    aria-label={`Stop ${idx + 1} City`}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Country</label>
                                  <input
                                    type="text"
                                    value={city.country || ''}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = { ...current[idx], country: e.target.value };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    placeholder="e.g., Italy"
                                    className={inputClass}
                                    aria-label={`Stop ${idx + 1} Country`}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Number of Nights</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={city.nights || 1}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || 0;
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = { ...current[idx], nights: val };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    className={inputClass}
                                    aria-label={`Stop ${idx + 1} Nights`}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className={labelClass}>Stop Description</label>
                                <textarea
                                  value={city.description || ''}
                                  onChange={(e) => {
                                    const current = [...(activePackage.itineraryCities || [])];
                                    current[idx] = { ...current[idx], description: e.target.value };
                                    handleFieldChange('itineraryCities', current);
                                  }}
                                  placeholder="Editorial description of this journey stop..."
                                  rows={2}
                                  className={inputClass + ' resize-none'}
                                  aria-label={`Stop ${idx + 1} Description`}
                                />
                              </div>
                            </div>

                            {/* Section 2: STOP MEDIA */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-900">2. STOP MEDIA</h6>
                              <ImageInput
                                label="STOP HERO PHOTO"
                                value={city.heroImage || ''}
                                onSave={(url) => {
                                  const current = [...(activePackage.itineraryCities || [])];
                                  current[idx] = { ...current[idx], heroImage: url };
                                  handleFieldChange('itineraryCities', current);
                                }}
                                storagePath={`packages/${activePackage.id || 'new'}/stops`}
                                aspectClass="aspect-21/9"
                                helpText="Main landscape photo representing this journey stop."
                              />

                              <GalleryManager
                                label="STOP PHOTO GALLERY"
                                helpText="Supporting photography for this journey destination."
                                gallery={city.gallery || []}
                                onChange={(updatedGallery) => {
                                  const current = [...(activePackage.itineraryCities || [])];
                                  current[idx] = { ...current[idx], gallery: updatedGallery };
                                  handleFieldChange('itineraryCities', current);
                                }}
                                storagePath={`packages/${activePackage.id || 'new'}/stops/${idx}`}
                                onUseAsCover={(url) => {
                                  const current = [...(activePackage.itineraryCities || [])];
                                  current[idx] = { ...current[idx], heroImage: url };
                                  handleFieldChange('itineraryCities', current);
                                }}
                              />
                            </div>

                            {/* Section 3: STOP HIGHLIGHTS */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-900">3. STOP HIGHLIGHTS</h6>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newStopHighlight[idx] || ''}
                                  onChange={(e) => setNewStopHighlight((prev) => ({ ...prev, [idx]: e.target.value }))}
                                  placeholder="Add stop highlight (e.g. Villa Balbianello visit)"
                                  className={inputClass}
                                  aria-label={`Add highlight for ${city.city}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = (newStopHighlight[idx] || '').trim();
                                    if (!val) return;
                                    const current = [...(activePackage.itineraryCities || [])];
                                    const hList = [...(current[idx].highlights || []), val];
                                    current[idx] = { ...current[idx], highlights: hList };
                                    handleFieldChange('itineraryCities', current);
                                    setNewStopHighlight((prev) => ({ ...prev, [idx]: '' }));
                                  }}
                                  className="px-3.5 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                                >
                                  ADD
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(city.highlights || []).map((hl, hIdx) => (
                                  <span key={hIdx} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2">
                                    {hl}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = [...(activePackage.itineraryCities || [])];
                                        const hList = [...(current[idx].highlights || [])];
                                        hList.splice(hIdx, 1);
                                        current[idx] = { ...current[idx], highlights: hList };
                                        handleFieldChange('itineraryCities', current);
                                      }}
                                      className="hover:text-rose-600 cursor-pointer"
                                      aria-label={`Remove highlight ${hl}`}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Section 4: CURATED EXPERIENCES */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-900">4. CURATED EXPERIENCES</h6>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newStopExperience[idx] || ''}
                                  onChange={(e) => setNewStopExperience((prev) => ({ ...prev, [idx]: e.target.value }))}
                                  placeholder="Add curated experience (e.g. Private Wine Tasting at Lake Villa)"
                                  className={inputClass}
                                  aria-label={`Add experience for ${city.city}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = (newStopExperience[idx] || '').trim();
                                    if (!val) return;
                                    const current = [...(activePackage.itineraryCities || [])];
                                    const eList = [...(current[idx].experiences || []), val];
                                    current[idx] = { ...current[idx], experiences: eList };
                                    handleFieldChange('itineraryCities', current);
                                    setNewStopExperience((prev) => ({ ...prev, [idx]: '' }));
                                  }}
                                  className="px-3.5 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                                >
                                  ADD
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(city.experiences || []).map((exp, eIdx) => (
                                  <span key={eIdx} className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-2">
                                    <Sparkles size={12} className="text-amber-600" />
                                    {exp}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = [...(activePackage.itineraryCities || [])];
                                        const eList = [...(current[idx].experiences || [])];
                                        eList.splice(eIdx, 1);
                                        current[idx] = { ...current[idx], experiences: eList };
                                        handleFieldChange('itineraryCities', current);
                                      }}
                                      className="hover:text-rose-600 cursor-pointer"
                                      aria-label={`Remove experience ${exp}`}
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Section 5: ARRIVAL TRANSFER */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-900">5. ARRIVAL TRANSFER</h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className={labelClass}>Transfer Mode</label>
                                  <select
                                    value={city.arrivalTransfer?.type || 'car'}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = {
                                        ...current[idx],
                                        arrivalTransfer: {
                                          type: e.target.value as any,
                                          text: current[idx].arrivalTransfer?.text || ''
                                        }
                                      };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    className={inputClass}
                                    aria-label={`Arrival Transfer type for ${city.city}`}
                                  >
                                    <option value="flight">Flight</option>
                                    <option value="car">Private Car / Chauffeur</option>
                                    <option value="train">Train</option>
                                    <option value="ferry">Ferry / Boat</option>
                                    <option value="bus">Coach</option>
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <label className={labelClass}>Transfer Narrative</label>
                                  <input
                                    type="text"
                                    value={city.arrivalTransfer?.text || ''}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = {
                                        ...current[idx],
                                        arrivalTransfer: {
                                          type: current[idx].arrivalTransfer?.type || 'car',
                                          text: e.target.value
                                        }
                                      };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    placeholder="e.g. Private chauffeur transfer from Milan Malpensa Airport to Lake Como"
                                    className={inputClass}
                                    aria-label={`Arrival Transfer narrative for ${city.city}`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Section 6: STAY FOR THIS STOP */}
                            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <h6 className="text-[11px] font-black uppercase tracking-wider text-[#9E1B1D]">6. STAY FOR THIS STOP</h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className={labelClass}>Hotel / Lodge Name</label>
                                  <input
                                    type="text"
                                    value={city.hotel?.name || ''}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = {
                                        ...current[idx],
                                        hotel: { ...(current[idx].hotel || { name: '' }), name: e.target.value }
                                      };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    placeholder="e.g. Grand Hotel Tremezzo"
                                    className={inputClass}
                                    aria-label={`Hotel name for ${city.city}`}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Property Type</label>
                                  <input
                                    type="text"
                                    value={city.hotel?.type || ''}
                                    onChange={(e) => {
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = {
                                        ...current[idx],
                                        hotel: { ...(current[idx].hotel || { name: '' }), type: e.target.value }
                                      };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    placeholder="e.g. Luxury Palace Hotel"
                                    className={inputClass}
                                    aria-label={`Hotel property type for ${city.city}`}
                                  />
                                </div>

                                <div>
                                  <label className={labelClass}>Rating (Stars)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={city.hotel?.rating || 5}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 5;
                                      const current = [...(activePackage.itineraryCities || [])];
                                      current[idx] = {
                                        ...current[idx],
                                        hotel: { ...(current[idx].hotel || { name: '' }), rating: val }
                                      };
                                      handleFieldChange('itineraryCities', current);
                                    }}
                                    className={inputClass}
                                    aria-label={`Hotel rating for ${city.city}`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: DAY-BY-DAY ITINERARY */}
            {activeTab === 'ITINERARY' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">DAY-BY-DAY ITINERARY PLANS</h4>
                    <p className="text-xs text-slate-500 font-medium">Configure daily schedules, locations, transfers, meals, and activities organized by Journey Stop.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const cities = activePackage.itineraryCities || [];
                      if (cities.length === 0) {
                        setNotice({ type: 'error', text: 'Please add a Journey Stop before adding days.' });
                        return;
                      }

                      // Find total existing days across cities for next logical day number
                      let totalDays = 0;
                      cities.forEach((c) => (totalDays += (c.days || []).length));
                      const nextDayNum = totalDays + 1;

                      const newDay: ItineraryDay = {
                        day: nextDayNum,
                        title: `Day ${nextDayNum}: Exploration & Discovery`,
                        description: 'Detailed daily activities and experiences.',
                        meals: ['Breakfast'],
                        activities: [],
                        location: cities[0].city || ''
                      };

                      const updatedCities = [...cities];
                      updatedCities[0] = {
                        ...updatedCities[0],
                        days: [...(updatedCities[0].days || []), newDay]
                      };
                      handleFieldChange('itineraryCities', updatedCities);
                    }}
                    className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                    aria-label="Add day plan"
                  >
                    <Plus size={14} /> ADD DAY PLAN
                  </button>
                </div>

                {/* Render Days grouped by Journey Stop */}
                {(activePackage.itineraryCities || []).map((city, cIdx) => (
                  <div key={cIdx} className="space-y-4">
                    <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                      <span className="font-brand font-black text-sm uppercase text-[#F4BF4B]">
                        JOURNEY STOP {String(cIdx + 1).padStart(2, '0')}: {city.city || `Stop ${cIdx + 1}`} ({city.nights} Night{city.nights === 1 ? '' : 's'})
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {(city.days || []).length} Planned Day(s)
                      </span>
                    </div>

                    {(!city.days || city.days.length === 0) ? (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold">
                        No day plans assigned to {city.city} yet.
                      </div>
                    ) : (
                      <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-slate-200">
                        {city.days.map((day, dIdx) => {
                          const dayKey = `${cIdx}_${dIdx}`;
                          return (
                            <div key={dIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                              {/* Day Header & Actions */}
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-[#9E1B1D] text-white font-black text-[10px] uppercase rounded-md">
                                    DAY {day.day || dIdx + 1}
                                  </span>
                                  <span className="font-brand font-black text-sm text-slate-900">{day.title}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedCities = [...(activePackage.itineraryCities || [])];
                                      const updatedDays = [...(updatedCities[cIdx].days || [])];
                                      if (dIdx > 0) {
                                        const temp = updatedDays[dIdx];
                                        updatedDays[dIdx] = updatedDays[dIdx - 1];
                                        updatedDays[dIdx - 1] = temp;
                                        updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                        handleFieldChange('itineraryCities', updatedCities);
                                      }
                                    }}
                                    disabled={dIdx === 0}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                    aria-label={`Move Day ${day.day || dIdx + 1} up`}
                                    title="Move Day Up"
                                  >
                                    <ChevronUp size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedCities = [...(activePackage.itineraryCities || [])];
                                      const updatedDays = [...(updatedCities[cIdx].days || [])];
                                      if (dIdx < updatedDays.length - 1) {
                                        const temp = updatedDays[dIdx];
                                        updatedDays[dIdx] = updatedDays[dIdx + 1];
                                        updatedDays[dIdx + 1] = temp;
                                        updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                        handleFieldChange('itineraryCities', updatedCities);
                                      }
                                    }}
                                    disabled={dIdx === city.days.length - 1}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                    aria-label={`Move Day ${day.day || dIdx + 1} down`}
                                    title="Move Day Down"
                                  >
                                    <ChevronDown size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteDayConfirm({ cIdx, dIdx, dayNumber: day.day || dIdx + 1 })}
                                    className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer ml-1"
                                    aria-label={`Remove Day ${day.day || dIdx + 1} from journey`}
                                    title="Remove Day"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>

                              {/* 9 Structured Day Sections */}
                              {/* Section 1: DAY BASICS */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className={labelClass}>Day Number</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={day.day || dIdx + 1}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10) || dIdx + 1;
                                      const updatedCities = [...(activePackage.itineraryCities || [])];
                                      const updatedDays = [...(updatedCities[cIdx].days || [])];
                                      updatedDays[dIdx] = { ...updatedDays[dIdx], day: val };
                                      updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                      handleFieldChange('itineraryCities', updatedCities);
                                    }}
                                    className={inputClass}
                                    aria-label={`Day ${dIdx + 1} number`}
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <label className={labelClass}>Day Title *</label>
                                  <input
                                    type="text"
                                    value={day.title || ''}
                                    onChange={(e) => {
                                      const updatedCities = [...(activePackage.itineraryCities || [])];
                                      const updatedDays = [...(updatedCities[cIdx].days || [])];
                                      updatedDays[dIdx] = { ...updatedDays[dIdx], title: e.target.value };
                                      updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                      handleFieldChange('itineraryCities', updatedCities);
                                    }}
                                    placeholder="e.g., Arrival in Bellagio & Private Boat Tour"
                                    className={inputClass}
                                    aria-label={`Day ${dIdx + 1} title`}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className={labelClass}>Day Description</label>
                                <textarea
                                  value={day.description || ''}
                                  onChange={(e) => {
                                    const updatedCities = [...(activePackage.itineraryCities || [])];
                                    const updatedDays = [...(updatedCities[cIdx].days || [])];
                                    updatedDays[dIdx] = { ...updatedDays[dIdx], description: e.target.value };
                                    updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                    handleFieldChange('itineraryCities', updatedCities);
                                  }}
                                  placeholder="Detailed narrative for today's activities..."
                                  rows={3}
                                  className={inputClass + ' resize-none'}
                                  aria-label={`Day ${dIdx + 1} description`}
                                />
                              </div>

                              {/* Section 2: ARRIVAL / TRANSFER */}
                              <div>
                                <label className={labelClass}>Transfer Narrative</label>
                                <input
                                  type="text"
                                  value={day.transfer || ''}
                                  onChange={(e) => {
                                    const updatedCities = [...(activePackage.itineraryCities || [])];
                                    const updatedDays = [...(updatedCities[cIdx].days || [])];
                                    updatedDays[dIdx] = { ...updatedDays[dIdx], transfer: e.target.value };
                                    updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                    handleFieldChange('itineraryCities', updatedCities);
                                  }}
                                  placeholder="e.g. Private chauffeur transfer to Villa Serbelloni"
                                  className={inputClass}
                                  aria-label={`Day ${dIdx + 1} transfer`}
                                />
                              </div>

                              {/* Section 3: TODAY'S HIGHLIGHTS */}
                              <div>
                                <label className={labelClass}>Today's Highlights</label>
                                <div className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={newDayHighlight[dayKey] || ''}
                                    onChange={(e) => setNewDayHighlight((prev) => ({ ...prev, [dayKey]: e.target.value }))}
                                    placeholder="Add day highlight (e.g. Villa Gardens Tour)"
                                    className={inputClass}
                                    aria-label={`Add highlight for Day ${day.day || dIdx + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = (newDayHighlight[dayKey] || '').trim();
                                      if (!val) return;
                                      const updatedCities = [...(activePackage.itineraryCities || [])];
                                      const updatedDays = [...(updatedCities[cIdx].days || [])];
                                      const hList = [...(updatedDays[dIdx].highlights || []), val];
                                      updatedDays[dIdx] = { ...updatedDays[dIdx], highlights: hList };
                                      updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                      handleFieldChange('itineraryCities', updatedCities);
                                      setNewDayHighlight((prev) => ({ ...prev, [dayKey]: '' }));
                                    }}
                                    className="px-3.5 py-1 bg-slate-900 text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                                  >
                                    ADD
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {(day.highlights || []).map((dh, dhIdx) => (
                                    <span key={dhIdx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      {dh}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedCities = [...(activePackage.itineraryCities || [])];
                                          const updatedDays = [...(updatedCities[cIdx].days || [])];
                                          const hList = [...(updatedDays[dIdx].highlights || [])];
                                          hList.splice(dhIdx, 1);
                                          updatedDays[dIdx] = { ...updatedDays[dIdx], highlights: hList };
                                          updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                          handleFieldChange('itineraryCities', updatedCities);
                                        }}
                                        className="hover:text-rose-600 cursor-pointer"
                                        aria-label={`Remove day highlight ${dh}`}
                                      >
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Section 6: MEALS */}
                              <div>
                                <label className={labelClass}>Included Meals</label>
                                <div className="flex gap-4">
                                  {['Breakfast', 'Lunch', 'Dinner'].map((meal) => {
                                    const meals = day.meals || [];
                                    const isChecked = meals.includes(meal);
                                    return (
                                      <label key={meal} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            const nextMeals = isChecked ? meals.filter((m) => m !== meal) : [...meals, meal];
                                            const updatedCities = [...(activePackage.itineraryCities || [])];
                                            const updatedDays = [...(updatedCities[cIdx].days || [])];
                                            updatedDays[dIdx] = { ...updatedDays[dIdx], meals: nextMeals };
                                            updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                            handleFieldChange('itineraryCities', updatedCities);
                                          }}
                                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                          aria-label={`Include ${meal} on Day ${day.day || dIdx + 1}`}
                                        />
                                        <span>{meal}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Section 8: STAY FOR THIS DAY */}
                              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                <label className={labelClass}>STAY FOR THIS DAY</label>
                                <input
                                  type="text"
                                  value={day.hotel?.name || ''}
                                  onChange={(e) => {
                                    const updatedCities = [...(activePackage.itineraryCities || [])];
                                    const updatedDays = [...(updatedCities[cIdx].days || [])];
                                    updatedDays[dIdx] = {
                                      ...updatedDays[dIdx],
                                      hotel: { ...(updatedDays[dIdx].hotel || { name: '' }), name: e.target.value }
                                    };
                                    updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                    handleFieldChange('itineraryCities', updatedCities);
                                  }}
                                  placeholder="e.g. Grand Hotel Tremezzo (or leave empty if same as stop accommodation)"
                                  className={inputClass}
                                  aria-label={`Hotel for Day ${day.day || dIdx + 1}`}
                                />
                              </div>

                              {/* Section 9: DAY PHOTOS GALLERY */}
                              <GalleryManager
                                label={`DAY ${day.day || dIdx + 1} PHOTOS`}
                                helpText="Optional photography highlighting today's itinerary."
                                gallery={day.images || []}
                                onChange={(updatedImages) => {
                                  const updatedCities = [...(activePackage.itineraryCities || [])];
                                  const updatedDays = [...(updatedCities[cIdx].days || [])];
                                  updatedDays[dIdx] = { ...updatedDays[dIdx], images: updatedImages };
                                  updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                                  handleFieldChange('itineraryCities', updatedCities);
                                }}
                                storagePath={`packages/${activePackage.id || 'new'}/days/${day.day || dIdx + 1}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: ACCOMMODATION */}
            {activeTab === 'HOTELS' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ACCOMMODATION & LUXURY STAYS</h4>
                  <p className="text-xs text-slate-500 font-medium mb-4">Manage hotel details, ratings, amenities, and hotel photo galleries.</p>
                </div>

                {(activePackage.itineraryCities || []).map((city, cIdx) => {
                  const hotel = city.hotel || { name: '', type: 'Luxury Lodge', rating: 5, amenities: [], images: [] };
                  return (
                    <div key={cIdx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-brand font-black text-sm uppercase text-slate-900">
                          {city.city} — Sector Accommodation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className={labelClass}>Hotel / Lodge Name</label>
                          <input
                            type="text"
                            value={hotel.name || ''}
                            onChange={(e) => {
                              const updatedCities = [...(activePackage.itineraryCities || [])];
                              updatedCities[cIdx] = {
                                ...updatedCities[cIdx],
                                hotel: { ...hotel, name: e.target.value }
                              };
                              handleFieldChange('itineraryCities', updatedCities);
                            }}
                            placeholder="e.g. Grand Hotel Tremezzo"
                            className={inputClass}
                            aria-label={`Hotel name for ${city.city}`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Property Type</label>
                          <input
                            type="text"
                            value={hotel.type || ''}
                            onChange={(e) => {
                              const updatedCities = [...(activePackage.itineraryCities || [])];
                              updatedCities[cIdx] = {
                                ...updatedCities[cIdx],
                                hotel: { ...hotel, type: e.target.value }
                              };
                              handleFieldChange('itineraryCities', updatedCities);
                            }}
                            placeholder="e.g. Luxury Palace Hotel"
                            className={inputClass}
                            aria-label={`Property type for ${city.city}`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Rating (Stars)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={hotel.rating || 5}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 5;
                              const updatedCities = [...(activePackage.itineraryCities || [])];
                              updatedCities[cIdx] = {
                                ...updatedCities[cIdx],
                                hotel: { ...hotel, rating: val }
                              };
                              handleFieldChange('itineraryCities', updatedCities);
                            }}
                            className={inputClass}
                            aria-label={`Star rating for ${city.city}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Hotel Description</label>
                        <textarea
                          value={hotel.description || ''}
                          onChange={(e) => {
                            const updatedCities = [...(activePackage.itineraryCities || [])];
                            updatedCities[cIdx] = {
                              ...updatedCities[cIdx],
                              hotel: { ...hotel, description: e.target.value }
                            };
                            handleFieldChange('itineraryCities', updatedCities);
                          }}
                          placeholder="Editorial description of the property..."
                          rows={2}
                          className={inputClass + ' resize-none'}
                          aria-label={`Hotel description for ${city.city}`}
                        />
                      </div>

                      {/* Primary Hotel Image */}
                      <ImageInput
                        label="PRIMARY HOTEL PHOTO"
                        value={hotel.image || ''}
                        onSave={(url) => {
                          const updatedCities = [...(activePackage.itineraryCities || [])];
                          updatedCities[cIdx] = {
                            ...updatedCities[cIdx],
                            hotel: { ...hotel, image: url }
                          };
                          handleFieldChange('itineraryCities', updatedCities);
                        }}
                        storagePath={`packages/${activePackage.id || 'new'}/hotels`}
                        aspectClass="aspect-16/9"
                        helpText="Main photo of the hotel exterior or signature suite."
                      />

                      {/* Hotel Photo Gallery */}
                      <GalleryManager
                        label="HOTEL PHOTO GALLERY"
                        helpText="Additional photography of rooms, dining, views, and amenities."
                        gallery={hotel.images || []}
                        onChange={(updatedImages) => {
                          const updatedCities = [...(activePackage.itineraryCities || [])];
                          updatedCities[cIdx] = {
                            ...updatedCities[cIdx],
                            hotel: { ...hotel, images: updatedImages }
                          };
                          handleFieldChange('itineraryCities', updatedCities);
                        }}
                        storagePath={`packages/${activePackage.id || 'new'}/hotels/${cIdx}`}
                        onUseAsCover={(url) => {
                          const updatedCities = [...(activePackage.itineraryCities || [])];
                          updatedCities[cIdx] = {
                            ...updatedCities[cIdx],
                            hotel: { ...hotel, image: url }
                          };
                          handleFieldChange('itineraryCities', updatedCities);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 5: EXPERIENCES */}
            {activeTab === 'EXPERIENCES' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">JOURNEY HIGHLIGHTS</h4>
                  <p className="text-xs text-slate-500 font-medium mb-3">Highlights showcased across the overall journey card and hero.</p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newHighlightText}
                      onChange={(e) => setNewHighlightText(e.target.value)}
                      placeholder="e.g., Private Sunset Boat Cruise on Lake Como"
                      className={inputClass}
                      aria-label="Add overall journey highlight"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newHighlightText.trim()) return;
                        const current = activePackage.editorialHighlights || [];
                        handleFieldChange('editorialHighlights', [...current, newHighlightText.trim()]);
                        setNewHighlightText('');
                      }}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 cursor-pointer"
                      aria-label="Add overall highlight button"
                    >
                      ADD HIGHLIGHT
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activePackage.editorialHighlights || []).map((hl, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-[#F4BF4B]" />
                          <span className="text-xs font-bold text-slate-900">{hl}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(activePackage.editorialHighlights || [])];
                            current.splice(idx, 1);
                            handleFieldChange('editorialHighlights', current);
                          }}
                          className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                          aria-label={`Remove journey highlight ${hl}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: INCLUSIONS */}
            {activeTab === 'INCLUSIONS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle size={16} /> WHAT'S INCLUDED
                  </h4>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newInclusionText}
                      onChange={(e) => setNewInclusionText(e.target.value)}
                      placeholder="e.g., Luxury private vehicle transfers"
                      className={inputClass}
                      aria-label="Add item to included list"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newInclusionText.trim()) return;
                        const current = activePackage.inclusionsRich || [];
                        handleFieldChange('inclusionsRich', [...current, { text: newInclusionText.trim() }]);
                        setNewInclusionText('');
                      }}
                      className="px-4 py-2 bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
                      aria-label="Add inclusion button"
                    >
                      ADD
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activePackage.inclusionsRich || []).map((inc, idx) => (
                      <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">{inc.text}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(activePackage.inclusionsRich || [])];
                            current.splice(idx, 1);
                            handleFieldChange('inclusionsRich', current);
                          }}
                          className="text-emerald-700 hover:text-rose-600 cursor-pointer"
                          aria-label={`Remove inclusion ${inc.text}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                    <XCircle size={16} /> WHAT'S NOT INCLUDED
                  </h4>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newExclusionText}
                      onChange={(e) => setNewExclusionText(e.target.value)}
                      placeholder="e.g., International flights & visa fees"
                      className={inputClass}
                      aria-label="Add item to excluded list"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExclusionText.trim()) return;
                        const current = activePackage.exclusionsRich || [];
                        handleFieldChange('exclusionsRich', [...current, { text: newExclusionText.trim() }]);
                        setNewExclusionText('');
                      }}
                      className="px-4 py-2 bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
                      aria-label="Add exclusion button"
                    >
                      ADD
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(activePackage.exclusionsRich || []).map((exc, idx) => (
                      <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-900">{exc.text}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(activePackage.exclusionsRich || [])];
                            current.splice(idx, 1);
                            handleFieldChange('exclusionsRich', current);
                          }}
                          className="text-rose-700 hover:text-rose-900 cursor-pointer"
                          aria-label={`Remove exclusion ${exc.text}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 7: FAQS */}
            {activeTab === 'FAQS' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">TRAVELLER QUESTIONS & FAQS</h4>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <input
                    type="text"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="Question (e.g., Is visa support included?)"
                    className={inputClass}
                    aria-label="New FAQ Question"
                  />
                  <textarea
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Answer details..."
                    rows={2}
                    className={inputClass + ' resize-none'}
                    aria-label="New FAQ Answer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
                      const current = activePackage.packageFaqs || [];
                      handleFieldChange('packageFaqs', [
                        ...current,
                        { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }
                      ]);
                      setNewFaqQuestion('');
                      setNewFaqAnswer('');
                    }}
                    className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg hover:bg-slate-800 cursor-pointer"
                    aria-label="Add FAQ button"
                  >
                    ADD QUESTION & ANSWER
                  </button>
                </div>

                <div className="space-y-3">
                  {(activePackage.packageFaqs || []).map((faq, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{faq.question}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const current = [...(activePackage.packageFaqs || [])];
                            current.splice(idx, 1);
                            handleFieldChange('packageFaqs', current);
                          }}
                          className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          aria-label={`Remove FAQ question ${faq.question}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 8: PRICING */}
            {activeTab === 'PRICING' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">PRICING & COMMERCIALS</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Starting Base Price *</label>
                    <input
                      type="number"
                      value={activePackage.pricing?.basePrice || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleNestedChange('pricing', 'basePrice', val);
                      }}
                      className={inputClass}
                      aria-label="Starting Base Price"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Currency</label>
                    <input
                      type="text"
                      value={activePackage.pricing?.currency || 'INR'}
                      onChange={(e) => handleNestedChange('pricing', 'currency', e.target.value)}
                      placeholder="e.g., INR / USD"
                      className={inputClass}
                      aria-label="Pricing Currency"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Discount Price (Optional)</label>
                    <input
                      type="number"
                      value={activePackage.pricing?.discountedPrice || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleNestedChange('pricing', 'discountedPrice', val);
                      }}
                      className={inputClass}
                      aria-label="Discounted Price"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 9: MEDIA & ITINERARY PDF */}
            {activeTab === 'MEDIA' && (
              <div className="space-y-6">
                {/* Journey Cover Photo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <ImageInput
                    label="JOURNEY COVER PHOTO"
                    value={activePackage.media?.thumbnail || ''}
                    onSave={(url) => handleNestedChange('media', 'thumbnail', url)}
                    storagePath={`packages/${activePackage.id || 'new'}`}
                    aspectClass="aspect-21/9"
                    helpText="Hero image displayed across journey cards, search, and page header."
                    removeWarningMessage="Removing this cover photo will leave this journey without a primary visual. Remove photo?"
                  />
                </div>

                {/* Journey Gallery */}
                <GalleryManager
                  label="JOURNEY PHOTO GALLERY"
                  helpText="Comprehensive photo collection showcasing the complete journey."
                  gallery={activePackage.media?.gallery || []}
                  onChange={(updatedGallery) => handleNestedChange('media', 'gallery', updatedGallery)}
                  storagePath={`packages/${activePackage.id || 'new'}/gallery`}
                  onUseAsCover={(url) => handleNestedChange('media', 'thumbnail', url)}
                />

                {/* Journey Video URL */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">JOURNEY VIDEO LINK</h4>
                    <p className="text-xs text-slate-500 font-medium">Optional video URL (e.g. Vimeo or YouTube link) showcasing the expedition.</p>
                  </div>
                  <input
                    type="text"
                    value={activePackage.media?.videos?.[0] || ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      handleNestedChange('media', 'videos', val ? [val] : []);
                    }}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    className={inputClass}
                    aria-label="Journey Video URL"
                  />
                </div>

                {/* Official Itinerary PDF Document */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">OFFICIAL ITINERARY PDF DOCUMENT</h4>
                  <p className="text-xs text-slate-500 font-medium">Upload or replace the official downloadable itinerary PDF.</p>

                  <PDFUploadInput
                    packageTitle={activePackage.title || 'journey'}
                    storagePath="packages"
                    onSave={(url) => handleFieldChange('itineraryPDF', url)}
                  />

                  {activePackage.itineraryPDF && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#9E1B1D]" />
                        <span className="text-xs font-bold text-slate-900">Itinerary PDF Uploaded</span>
                      </div>

                      <a
                        href={activePackage.itineraryPDF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#121212] text-[#F4BF4B] font-bold text-[10px] uppercase rounded-md flex items-center gap-1"
                      >
                        <Download size={12} /> DOWNLOAD / VIEW PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 10: TRAVEL INFO */}
            {activeTab === 'TRAVEL_INFO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Trip Duration</label>
                  <input
                    type="text"
                    value={activePackage.duration || ''}
                    onChange={(e) => handleFieldChange('duration', e.target.value)}
                    placeholder="e.g., 7 Days / 6 Nights"
                    className={inputClass}
                    aria-label="Trip Duration"
                  />
                </div>

                <div>
                  <label className={labelClass}>Difficulty Level</label>
                  <select
                    value={activePackage.difficulty || 'Moderate'}
                    onChange={(e) => handleFieldChange('difficulty', e.target.value as any)}
                    className={inputClass}
                    aria-label="Difficulty Level"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Max Travellers</label>
                  <input
                    type="number"
                    value={activePackage.maxTravelers || 12}
                    onChange={(e) => handleFieldChange('maxTravelers', parseInt(e.target.value, 10) || 12)}
                    className={inputClass}
                    aria-label="Max Travellers"
                  />
                </div>

                <div>
                  <label className={labelClass}>Best Season / Months</label>
                  <input
                    type="text"
                    value={activePackage.bestTime || ''}
                    onChange={(e) => handleFieldChange('bestTime', e.target.value)}
                    placeholder="e.g., May - October"
                    className={inputClass}
                    aria-label="Best Season"
                  />
                </div>
              </div>
            )}

            {/* Tab 9: DATES & AVAILABILITY (E50) */}
            {activeTab === 'AVAILABILITY' && (
              <div className="space-y-8">
                {/* Availability Mode Selector */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <div>
                    <h4 className="font-brand font-black text-base uppercase tracking-tight text-slate-900">
                      Travel Date & Availability Mode
                    </h4>
                    <p className="text-xs text-slate-500">
                      Define how this journey is scheduled for travellers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        mode: 'PRIVATE_FLEXIBLE',
                        title: 'Private Flexible',
                        desc: "Travel dates can be tailored around the traveller's preferred window.",
                      },
                      {
                        mode: 'FIXED_DEPARTURES',
                        title: 'Fixed Departures',
                        desc: 'Travel is organized around configured departure dates.',
                      },
                      {
                        mode: 'BOTH',
                        title: 'Both Fixed & Flexible',
                        desc: 'Travellers can choose a listed departure or request private dates.',
                      },
                    ].map((item) => {
                      const isSelected = (activePackage.availability?.mode || 'PRIVATE_FLEXIBLE') === item.mode;
                      return (
                        <button
                          key={item.mode}
                          type="button"
                          onClick={() => {
                            const currentAvail = activePackage.availability || {};
                            handleFieldChange('availability', {
                              ...currentAvail,
                              mode: item.mode as any,
                            });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#121212] shadow-md ring-2 ring-[#F4BF4B]'
                              : 'bg-white/60 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-brand font-black text-xs uppercase tracking-wider block text-slate-900">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 leading-relaxed block mt-1">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fixed Departure Dates Manager */}
                {((activePackage.availability?.mode || 'PRIVATE_FLEXIBLE') === 'FIXED_DEPARTURES' ||
                  activePackage.availability?.mode === 'BOTH') && (
                  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <JourneyDepartureManager
                      departures={activePackage.availability?.departures || []}
                      onChange={(newDepartures) => {
                        const currentAvail = activePackage.availability || {};
                        handleFieldChange('availability', {
                          ...currentAvail,
                          departures: newDepartures,
                        });
                      }}
                    />
                  </div>
                )}

                {/* Flexible Seasonal Travel Windows */}
                {((activePackage.availability?.mode || 'PRIVATE_FLEXIBLE') === 'PRIVATE_FLEXIBLE' ||
                  activePackage.availability?.mode === 'BOTH') && (
                  <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
                    <JourneyTravelWindowManager
                      travelWindows={activePackage.availability?.travelWindows || []}
                      onChange={(newWindows) => {
                        const currentAvail = activePackage.availability || {};
                        handleFieldChange('availability', {
                          ...currentAvail,
                          travelWindows: newWindows,
                        });
                      }}
                    />
                  </div>
                )}

                {/* Booking Lead Time & Public Guidance Note */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h4 className="font-brand font-black text-base uppercase tracking-tight text-slate-900">
                    Booking Guidance & Lead Time
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                        Recommended Lead Time (Days in Advance)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 30 (enquire at least 30 days before travel)"
                        value={activePackage.availability?.bookingLeadTimeDays || ''}
                        onChange={(e) => {
                          const days = e.target.value ? parseInt(e.target.value, 10) : undefined;
                          const currentAvail = activePackage.availability || {};
                          handleFieldChange('availability', {
                            ...currentAvail,
                            bookingLeadTimeDays: days,
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 outline-none focus:border-[#121212]"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Informational guidance shown to travellers (e.g. "We recommend enquiring at least 30 days prior").
                      </p>
                    </div>

                    <div>
                      <label className="block font-black uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                        Custom Availability Note / Guidance
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bespoke luxury permits are strictly limited per season."
                        value={activePackage.availability?.availabilityNote || ''}
                        onChange={(e) => {
                          const currentAvail = activePackage.availability || {};
                          handleFieldChange('availability', {
                            ...currentAvail,
                            availabilityNote: e.target.value,
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-[#121212]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 11: PUBLISHING & SEO */}
            {activeTab === 'PUBLISHING' && (
              <div className="space-y-4">
                {/* E32 Content Check Card */}
                {contentCheck && (
                  <ContentCheckCard
                    result={contentCheck}
                    onClickFix={(tab) => setActiveTab(tab as EditorTab)}
                  />
                )}

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Publishing Status</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {activePackage.status !== 'draft'
                          ? 'Published — Visible to website visitors.'
                          : 'Unpublished (Draft) — Hidden from public journey listings.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (activePackage.status === 'draft') {
                          // Attempting to publish — run content check
                          if (contentCheck && !contentCheck.isPublishable) {
                            setNotice({
                              type: 'error',
                              text: `This journey needs a few details before it can be published. ${contentCheck.requiredFailCount} required detail${contentCheck.requiredFailCount !== 1 ? 's are' : ' is'} missing.`,
                            });
                            return;
                          }
                          // Warnings only — allow with notice
                          if (contentCheck && contentCheck.recommendedFailCount > 0) {
                            setNotice({
                              type: 'success',
                              text: `Ready to publish — ${contentCheck.recommendedFailCount} optional detail${contentCheck.recommendedFailCount !== 1 ? 's' : ''} could be improved.`,
                            });
                          }
                        }
                        handleFieldChange('status', activePackage.status === 'draft' ? 'active' : 'draft');
                      }}
                      className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        activePackage.status !== 'draft'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : contentCheck && !contentCheck.isPublishable
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      aria-label={activePackage.status !== 'draft' ? 'Unpublish journey' : 'Publish journey'}
                      title={
                        activePackage.status === 'draft' && contentCheck && !contentCheck.isPublishable
                          ? 'Complete required details before publishing'
                          : undefined
                      }
                    >
                      {activePackage.status !== 'draft' ? 'PUBLISHED' : 'PUBLISH JOURNEY'}
                    </button>
                  </div>

                  {/* Inline publish-blocked explanation */}
                  {activePackage.status === 'draft' && contentCheck && !contentCheck.isPublishable && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
                      <span>
                        This journey needs a few details before it can be published.
                        {' '}Review the required items above, then publish.
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] font-medium text-slate-400">
                    Saving as draft is always allowed. Publishing makes this journey visible to website visitors.
                  </p>
                </div>

                {/* E34 Journey SEO & Search Visibility Editor */}
                <div className="pt-2">
                  <AdminSEOEditor
                    seo={activePackage.seo || {}}
                    onChange={(updatedSeo) => handleFieldChange('seo', updatedSeo)}
                    fallbackTitle={activePackage.title || ''}
                    fallbackDescription={activePackage.editorialIntro || activePackage.overview || activePackage.description || ''}
                    fallbackImage={activePackage.media?.thumbnail || activePackage.media?.gallery?.[0]}
                    slug={activePackage.slug || activePackage.id}
                    baseRoute="itinerary"
                    contentTypeLabel="Journey"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Footer Action Bar */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">
              {isDirty ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> Unsaved changes in journey form
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <Check size={14} /> Up to date
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cancel journey editing"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                aria-label="Save journey changes"
              >
                <Save size={15} />
                {saving ? 'SAVING…' : 'SAVE JOURNEY'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journeys List View */}
      <div className="saas-card bg-white border border-slate-200/80 rounded-2xl overflow-hidden space-y-4 p-5">
        {/* List Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by journey, destination, stop..."
              className="saas-input pl-10 w-full text-xs text-slate-900"
              aria-label="Search journeys"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="saas-input text-xs text-slate-900 font-bold"
              aria-label="Filter journeys by status"
            >
              <option value="all">All Statuses ({stats.total})</option>
              <option value="published">Published Only ({stats.published})</option>
              <option value="unpublished">Unpublished Only ({stats.draft})</option>
            </select>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
              className="saas-input text-xs text-slate-900 font-bold"
              aria-label="Filter journeys by content quality"
            >
              <option value="all">All Content</option>
              <option value="ready">✓ Ready</option>
              <option value="needs_details">⚠ Needs Details</option>
              <option value="draft">● Draft</option>
            </select>
          </div>
        </div>

        {/* Packages Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Journey</th>
                <th className="px-4 py-3.5">Route / Stops</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Starting Price</th>
                <th className="px-4 py-3.5 text-center">Visibility</th>
                <th className="px-4 py-3.5 text-center">Content</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider space-y-2">
                    <Compass size={32} className="mx-auto text-slate-300" />
                    <p>No journeys found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => {
                  const isPublished = pkg.status !== 'draft';
                  const stopsStr = (pkg.itineraryCities || []).map((c) => c.city).join(' → ');
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Photo */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                            {pkg.media?.thumbnail ? (
                              <img src={pkg.media.thumbnail} alt={pkg.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Compass size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-brand font-black text-sm text-slate-900">{pkg.title}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">/itinerary/{pkg.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Route / Stops */}
                      <td className="px-4 py-3.5 font-semibold text-slate-700 max-w-xs truncate">
                        {stopsStr || 'Direct Journey'}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {pkg.duration || 'Flexible'}
                      </td>

                      {/* Starting Price */}
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {pkg.pricing?.currency || 'INR'} {pkg.pricing?.basePrice ? pkg.pricing.basePrice.toLocaleString('en-IN') : 'Enquiry'}
                      </td>

                      {/* Visibility Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-md ${
                            isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Unpublished'}
                        </span>
                      </td>

                      {/* E32 Content Quality Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <QualityBadge badge={getPackageBadge(pkg)} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/itinerary/${pkg.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#121212] hover:text-[#F4BF4B] transition-colors cursor-pointer"
                            aria-label={`Preview journey ${pkg.title} in new tab`}
                            title="Preview journey in new tab"
                          >
                            <Eye size={14} />
                          </a>

                          <button
                            onClick={() => handleEditPackage(pkg)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                            aria-label={`Edit journey ${pkg.title}`}
                            title="Edit Journey"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(pkg.id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            aria-label={`Delete journey ${pkg.title}`}
                            title="Delete Journey"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stop Removal Confirmation Modal */}
      {deleteStopConfirmIndex !== null && activePackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">
                Remove {activePackage.itineraryCities?.[deleteStopConfirmIndex]?.city || 'Journey Stop'}?
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              This will remove this journey stop and its associated itinerary content from this journey.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteStopConfirmIndex(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                KEEP STOP
              </button>
              <button
                onClick={() => {
                  const current = [...(activePackage.itineraryCities || [])];
                  current.splice(deleteStopConfirmIndex, 1);
                  handleFieldChange('itineraryCities', current);
                  setDeleteStopConfirmIndex(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors cursor-pointer"
              >
                REMOVE STOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Removal Confirmation Modal */}
      {deleteDayConfirm !== null && activePackage && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">
                Remove Day {deleteDayConfirm.dayNumber}?
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Remove Day {deleteDayConfirm.dayNumber} from this journey? Day numbering will be updated safely.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteDayConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                KEEP DAY
              </button>
              <button
                onClick={() => {
                  const { cIdx, dIdx } = deleteDayConfirm;
                  const updatedCities = [...(activePackage.itineraryCities || [])];
                  const updatedDays = [...(updatedCities[cIdx].days || [])];
                  updatedDays.splice(dIdx, 1);
                  updatedCities[cIdx] = { ...updatedCities[cIdx], days: updatedDays };
                  handleFieldChange('itineraryCities', updatedCities);
                  setDeleteDayConfirm(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors cursor-pointer"
              >
                REMOVE DAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journey Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">Delete Journey?</h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Are you sure you want to delete this journey? Public links and itinerary pages will no longer be available.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors cursor-pointer"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Changes Warning Modal */}
      {discardConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">Unsaved Changes</h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              You have unsaved changes in this journey form. Leave without saving?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDiscardConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                KEEP EDITING
              </button>
              <button
                onClick={() => {
                  setDiscardConfirm(false);
                  setIsDirty(false);
                  setShowEditor(false);
                  setActivePackage(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors cursor-pointer"
              >
                DISCARD CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
