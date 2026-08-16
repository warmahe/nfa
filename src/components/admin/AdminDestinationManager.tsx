import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Destination } from '../../types/database';
import {
  db,
  setDocument,
  updateDocument,
  deleteDocument,
} from '../../services/firebaseService';
import { ImageInput } from './ImageInput';
import { GalleryManager } from './GalleryManager';
import { AdminSEOEditor } from './AdminSEOEditor';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
  Eye,
  Search,
  Filter,
  Globe,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  BookOpen,
  Compass,
  Calendar,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  FileText,
  Thermometer,
  Lock,
  Layers,
  ClipboardCheck,
} from 'lucide-react';
import {
  checkDestinationContent, getDestinationBadge, ContentCheckResult, ContentQualityBadge
} from '../../utils/contentQuality';

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CHECK CARD (destination)
// ─────────────────────────────────────────────────────────────────────────────

interface ContentCheckCardProps {
  result: ContentCheckResult;
  onClickFix?: (targetTab: string) => void;
}

const ContentCheckCard: React.FC<ContentCheckCardProps> = ({ result, onClickFix }) => {
  const [expanded, setExpanded] = useState(false);
  const { isPublishable, required, recommended, requiredFailCount, recommendedFailCount } = result;
  const failedRecommended = recommended.filter((r) => !r.passed);

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

  const Icon = !isPublishable ? AlertTriangle : recommendedFailCount > 0 ? AlertTriangle : Check;
  const iconClass = !isPublishable ? 'text-rose-500' : recommendedFailCount > 0 ? 'text-amber-500' : 'text-emerald-600';
  const textClass = !isPublishable ? 'text-rose-700' : recommendedFailCount > 0 ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${summaryColor}`} role="region" aria-label="Content check results">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={15} className="text-slate-600 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Content Check</span>
        </div>
        <button type="button" onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide details' : 'Show details'}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {!expanded && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <Icon size={14} className={`${iconClass} shrink-0`} aria-hidden="true" />
          <span className={`text-xs font-bold ${textClass}`} aria-live="polite">{summaryText}</span>
        </div>
      )}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {required.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Required</p>
              <ul className="space-y-1" role="list">
                {required.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    {item.passed ? <Check size={13} className="text-emerald-600 mt-0.5 shrink-0" aria-label="Passed" />
                      : <AlertTriangle size={13} className="text-rose-500 mt-0.5 shrink-0" aria-label="Missing" />}
                    <div className="flex-1">
                      <button type="button"
                        onClick={() => item.targetTab && onClickFix?.(item.targetTab)}
                        disabled={item.passed || !item.targetTab}
                        className={`text-xs font-semibold text-left ${
                          !item.passed && item.targetTab ? 'text-rose-700 hover:text-rose-900 underline cursor-pointer'
                          : item.passed ? 'text-slate-600 cursor-default' : 'text-slate-500 cursor-default'
                        }`}
                      >{item.label}</button>
                      {!item.passed && item.detail && <p className="text-[10px] text-rose-600 font-medium mt-0.5">{item.detail}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {failedRecommended.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Recommended</p>
              <ul className="space-y-1" role="list">
                {failedRecommended.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <button type="button" onClick={() => item.targetTab && onClickFix?.(item.targetTab)}
                      disabled={!item.targetTab}
                      className={`text-xs font-semibold text-left ${
                        item.targetTab ? 'text-amber-700 hover:text-amber-900 underline cursor-pointer' : 'text-slate-500 cursor-default'
                      }`}
                    >{item.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={`pt-2 border-t border-current/20 flex items-center gap-2 ${textClass}`}>
            <Icon size={14} className={`${iconClass} shrink-0`} />
            <span className="text-xs font-bold" aria-live="polite">{summaryText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const QualityBadge: React.FC<{ badge: ContentQualityBadge }> = ({ badge }) => {
  if (badge === 'ready') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Content ready">
      <Check size={9} /> Ready
    </span>
  );
  if (badge === 'needs_details') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Needs details">
      <AlertTriangle size={9} /> Needs details
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-wider rounded-md" aria-label="Draft">
      Draft
    </span>
  );
};

interface AdminDestinationManagerProps {
  destinationId?: string;
  onBack?: () => void;
}

type TabType = 'basic' | 'intro' | 'places' | 'experiences' | 'highlights' | 'stay' | 'travel' | 'media' | 'seo';

export const AdminDestinationManager: React.FC<AdminDestinationManagerProps> = ({
  destinationId,
  onBack,
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(destinationId || null);
  const [showForm, setShowForm] = useState(Boolean(destinationId));
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'ready' | 'needs_details' | 'draft'>('all');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [formState, setFormState] = useState<Partial<Destination>>({
    name: '',
    slug: '',
    country: '',
    continent: '',
    active: true,
    timezone: '',
    currency: '',
    description: '',
    shortDescription: '',
    whyVisit: '',
    locations: [],
    experiences: [],
    highlights: [],
    accommodation: '',
    bestTimeToVisit: '',
    bestDaysDuration: '',
    distanceFromAirport: '',
    rainfall: 0,
    averageTemperature: { min: 0, max: 0 },
    visaRequirements: '',
    languageSpoken: [],
    coverImage: '',
    gallery: [],
    mapCoordinates: { latitude: 0, longitude: 0 },
    seoDescription: '',
    seoKeywords: [],
  });

  const [originalSlug, setOriginalSlug] = useState('');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [newExperienceInput, setNewExperienceInput] = useState('');
  const [newHighlightInput, setNewHighlightInput] = useState('');
  const [newLanguageInput, setNewLanguageInput] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // 1. Real-time Subscription to Destinations
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'destinations'),
      (snapshot) => {
        const loaded = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Destination));

        // Sort by name ascending
        loaded.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setDestinations(loaded);
        setLoading(false);

        if (destinationId && !editingId) {
          const found = loaded.find((d) => d.id === destinationId);
          if (found) {
            initFormWithDestination(found);
          }
        }
      },
      (err) => {
        console.error('Error in realtime destinations listener:', err);
        setError('Couldn\'t load destinations. Please try again.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [destinationId]);

  const initFormWithDestination = (dest: Destination) => {
    setFormState({
      ...dest,
      active: dest.active !== false,
      locations: dest.locations || [],
      experiences: dest.experiences || [],
      highlights: dest.highlights || [],
      gallery: dest.gallery || [],
      languageSpoken: dest.languageSpoken || [],
      seoKeywords: dest.seoKeywords || [],
      averageTemperature: dest.averageTemperature || { min: 0, max: 0 },
      mapCoordinates: dest.mapCoordinates || { latitude: 0, longitude: 0 },
    });
    setEditingId(dest.id);
    setOriginalSlug(dest.slug || '');
    setShowForm(true);
    setIsDirty(false);
    setActiveTab('basic');
  };

  const resetForm = () => {
    setFormState({
      name: '',
      slug: '',
      country: '',
      continent: '',
      active: true,
      timezone: '',
      currency: '',
      description: '',
      shortDescription: '',
      whyVisit: '',
      locations: [],
      experiences: [],
      highlights: [],
      accommodation: '',
      bestTimeToVisit: '',
      bestDaysDuration: '',
      distanceFromAirport: '',
      rainfall: 0,
      averageTemperature: { min: 0, max: 0 },
      visaRequirements: '',
      languageSpoken: [],
      coverImage: '',
      gallery: [],
      mapCoordinates: { latitude: 0, longitude: 0 },
      seoDescription: '',
      seoKeywords: [],
    });
    setEditingId(null);
    setOriginalSlug('');
    setIsDirty(false);
    setActiveTab('basic');
  };

  const handleCreateNew = () => {
    if (isDirty) {
      setDiscardConfirm(true);
      return;
    }
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (isDirty) {
      setDiscardConfirm(true);
    } else {
      setShowForm(false);
      resetForm();
      if (onBack) onBack();
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    field?: string
  ) => {
    const name = field || e.target.name;
    const value = e.target.value;
    const type = e.target.type;
    const finalValue = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value;

    setFormState((prev) => {
      const next = { ...prev, [name]: finalValue };
      // Auto-generate slug if creating new destination and editing name
      if (!editingId && name === 'name' && typeof finalValue === 'string') {
        next.slug = slugify(finalValue);
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleToggleActive = () => {
    const newActive = !formState.active;
    // E32 — Publishing safety gate
    if (newActive && contentCheck && !contentCheck.isPublishable) {
      setError(`This destination needs a few details before it can be published. ${contentCheck.requiredFailCount} required detail${contentCheck.requiredFailCount !== 1 ? 's are' : ' is'} missing.`);
      return;
    }
    setFormState((prev) => ({ ...prev, active: newActive }));
    setIsDirty(true);
  };

  // Helper list editors
  const addItemToArray = (field: 'locations' | 'experiences' | 'highlights' | 'languageSpoken' | 'seoKeywords', value: string, resetFn: () => void) => {
    if (!value.trim()) return;
    const current = (formState[field] as string[]) || [];
    setFormState((prev) => ({
      ...prev,
      [field]: [...current, value.trim()],
    }));
    resetFn();
    setIsDirty(true);
  };

  const removeItemFromArray = (field: 'locations' | 'experiences' | 'highlights' | 'languageSpoken' | 'seoKeywords' | 'gallery', index: number) => {
    const current = [...((formState[field] as string[]) || [])];
    current.splice(index, 1);
    setFormState((prev) => ({
      ...prev,
      [field]: current,
    }));
    setIsDirty(true);
  };

  const moveArrayItem = (field: 'locations' | 'experiences' | 'highlights' | 'gallery', from: number, to: number) => {
    const current = [...((formState[field] as string[]) || [])];
    if (to < 0 || to >= current.length) return;
    const item = current.splice(from, 1)[0];
    current.splice(to, 0, item);
    setFormState((prev) => ({
      ...prev,
      [field]: current,
    }));
    setIsDirty(true);
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url.trim()) return;
    const current = formState.gallery || [];
    if (current.includes(url.trim())) return;
    setFormState((prev) => ({
      ...prev,
      gallery: [...current, url.trim()],
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formState.name?.trim()) {
      setError('Please enter a destination name.');
      setActiveTab('basic');
      return;
    }
    if (!formState.country?.trim()) {
      setError('Please enter a country.');
      setActiveTab('basic');
      return;
    }
    if (!formState.slug?.trim()) {
      setError('Please add a URL slug.');
      setActiveTab('basic');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const cleanSlug = slugify(formState.slug);
      const payload: Partial<Destination> = {
        ...formState,
        slug: cleanSlug,
        active: formState.active !== false,
        name: formState.name.trim(),
        country: formState.country.trim(),
        continent: formState.continent?.trim() || '',
        description: formState.description || '',
        coverImage: formState.coverImage || '',
        gallery: (formState.gallery || []).filter(Boolean),
        highlights: (formState.highlights || []).filter(Boolean),
        locations: (formState.locations || []).filter(Boolean),
        experiences: (formState.experiences || []).filter(Boolean),
        bestTimeToVisit: formState.bestTimeToVisit || '',
        shortDescription: formState.shortDescription || '',
        whyVisit: formState.whyVisit || '',
        accommodation: formState.accommodation || '',
        updatedAt: new Date(),
      };

      if (editingId) {
        await updateDocument('destinations', editingId, payload);
        setSuccess('Destination saved.');
      } else {
        const newId = `dest_${cleanSlug}_${Date.now()}`;
        await setDocument('destinations', newId, {
          ...payload,
          id: newId,
          createdAt: new Date(),
        });
        setSuccess('Destination saved.');
        setEditingId(newId);
      }

      setIsDirty(false);
      setOriginalSlug(cleanSlug);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving destination:', err);
      setError('Couldn\'t save destination. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument('destinations', id);
      setSuccess('Destination removed.');
      setDeleteConfirm(null);
      if (editingId === id) {
        setShowForm(false);
        resetForm();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting destination:', err);
      setError('Couldn\'t delete destination. Please try again.');
    }
  };

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Status filter
      if (statusFilter === 'published' && dest.active === false) return false;
      if (statusFilter === 'unpublished' && dest.active !== false) return false;

      // E32: Content quality filter
      if (contentFilter !== 'all') {
        const badge = getDestinationBadge(dest);
        if (badge !== contentFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = dest.name?.toLowerCase().includes(q);
        const matchCountry = dest.country?.toLowerCase().includes(q);
        const matchContinent = dest.continent?.toLowerCase().includes(q);
        return matchName || matchCountry || matchContinent;
      }
      return true;
    });
  }, [destinations, statusFilter, searchQuery, contentFilter]);

  const stats = useMemo(() => {
    const total = destinations.length;
    const published = destinations.filter((d) => d.active !== false).length;
    const unpublished = total - published;
    const needsAttention = destinations.filter((d) => getDestinationBadge(d) === 'needs_details').length;
    return { total, published, unpublished, needsAttention };
  }, [destinations]);

  // E32 — Live content quality check on the active form state
  const contentCheck = useMemo(() => {
    if (!showForm) return null;
    return checkDestinationContent(formState);
  }, [formState, showForm]);

  const inputClass = 'saas-input w-full text-xs text-slate-900 font-sans focus:ring-2 focus:ring-[#121212] focus:border-transparent';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1';

  if (loading && destinations.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <Globe className="size-8 mx-auto text-slate-300 animate-pulse" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Destinations…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:text-rose-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="hover:text-emerald-900 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight">
              Destination Content Workspace
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage destination guides, editorial narratives, highlights, experiences, and media.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <Plus size={16} /> CREATE DESTINATION
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3">
          <div className="size-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Globe size={18} className="text-slate-700" />
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unpublished</p>
            <p className="font-black text-xl text-amber-700">{stats.unpublished}</p>
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

      {/* Destination Form Drawer/Modal */}
      {showForm && (
        <div className="saas-card bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden space-y-0">
          {/* Form Top Bar */}
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-[#F4BF4B]" />
              <div>
                <h3 className="font-brand font-black text-lg uppercase tracking-tight text-white">
                  {editingId ? `Edit: ${formState.name || 'Destination'}` : 'Create New Destination'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {formState.active !== false ? 'Published (Visible to travellers)' : 'Unpublished (Draft)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {formState.slug && (
                <a
                  href={`/destinations/${formState.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white/10 text-white hover:bg-white/20 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} /> PREVIEW DESTINATION
                </a>
              )}

              <button
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
            {[
              { id: 'basic', label: 'Basic Info', icon: Globe },
              { id: 'intro', label: 'Editorial Intro', icon: BookOpen },
              { id: 'places', label: 'Places & Areas', icon: MapPin },
              { id: 'experiences', label: 'Experiences', icon: Sparkles },
              { id: 'highlights', label: 'Highlights', icon: Layers },
              { id: 'stay', label: 'Accommodation', icon: Compass },
              { id: 'travel', label: 'Travel & Climate', icon: Thermometer },
              { id: 'media', label: 'Imagery & Media', icon: ImageIcon },
              { id: 'seo', label: 'Map & SEO', icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2.5 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-[#121212] text-[#121212] bg-white rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* Tab 1: Basic Info */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Destination Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formState.name || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Botswana"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>URL Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formState.slug || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., botswana"
                      className={inputClass}
                    />
                    {editingId && originalSlug && formState.slug !== originalSlug && (
                      <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={12} /> Changing the URL slug may break existing links to this destination.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Country *</label>
                    <input
                      type="text"
                      name="country"
                      value={formState.country || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Botswana"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Continent / Region</label>
                    <input
                      type="text"
                      name="continent"
                      value={formState.continent || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Africa"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Timezone</label>
                    <input
                      type="text"
                      name="timezone"
                      value={formState.timezone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., GMT+2"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Currency</label>
                    <input
                      type="text"
                      name="currency"
                      value={formState.currency || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., BWP / USD"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Published Status Toggle */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Publishing Visibility</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {formState.active !== false
                        ? 'Published — Visible to public visitors on destination guides.'
                        : 'Unpublished (Draft) — Hidden from public destination pages.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      formState.active !== false
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {formState.active !== false ? 'PUBLISHED' : 'UNPUBLISHED (DRAFT)'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Editorial Intro */}
            {activeTab === 'intro' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Short Editorial Summary</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formState.shortDescription || ''}
                    onChange={handleInputChange}
                    placeholder="Concise, captivating line for cards and headers..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Main Destination Overview</label>
                  <textarea
                    name="description"
                    value={formState.description || ''}
                    onChange={handleInputChange}
                    placeholder="Full destination narrative and overview..."
                    rows={6}
                    className={inputClass + ' resize-none'}
                  />
                </div>

                <div>
                  <label className={labelClass}>Why Visit (Editorial Narrative)</label>
                  <textarea
                    name="whyVisit"
                    value={formState.whyVisit || ''}
                    onChange={handleInputChange}
                    placeholder="Compelling reasons to visit this destination..."
                    rows={4}
                    className={inputClass + ' resize-none'}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Places & Areas */}
            {activeTab === 'places' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Key Places & Areas to Explore</label>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    Add regions, national parks, cities, or key areas.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newLocationInput}
                      onChange={(e) => setNewLocationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItemToArray('locations', newLocationInput, () => setNewLocationInput(''));
                        }
                      }}
                      placeholder="e.g., Okavango Delta"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addItemToArray('locations', newLocationInput, () => setNewLocationInput(''))}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 cursor-pointer"
                    >
                      ADD PLACE
                    </button>
                  </div>

                  {(!formState.locations || formState.locations.length === 0) ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                      No places or areas added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formState.locations.map((loc, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#9E1B1D]" />
                            <span className="font-bold text-xs text-slate-900">{loc}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveArrayItem('locations', idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveArrayItem('locations', idx, idx + 1)}
                              disabled={idx === formState.locations!.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromArray('locations', idx)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                              title="Remove"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Experiences */}
            {activeTab === 'experiences' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Curated Experiences</label>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    Signature activities, guided expeditions, or cultural highlights.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newExperienceInput}
                      onChange={(e) => setNewExperienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItemToArray('experiences', newExperienceInput, () => setNewExperienceInput(''));
                        }
                      }}
                      placeholder="e.g., Private Mokoro Canoe Safari at Sunset"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addItemToArray('experiences', newExperienceInput, () => setNewExperienceInput(''))}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 cursor-pointer"
                    >
                      ADD EXPERIENCE
                    </button>
                  </div>

                  {(!formState.experiences || formState.experiences.length === 0) ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                      No experiences added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formState.experiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-[#F4BF4B]" />
                            <span className="font-bold text-xs text-slate-900">{exp}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveArrayItem('experiences', idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveArrayItem('experiences', idx, idx + 1)}
                              disabled={idx === formState.experiences!.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromArray('experiences', idx)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 5: Highlights */}
            {activeTab === 'highlights' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Key Highlights</label>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    Key features, wildlife sightings, or unique attributes.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newHighlightInput}
                      onChange={(e) => setNewHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItemToArray('highlights', newHighlightInput, () => setNewHighlightInput(''));
                        }
                      }}
                      placeholder="e.g., Unrivalled Leopard & Elephant Sightings"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addItemToArray('highlights', newHighlightInput, () => setNewHighlightInput(''))}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 cursor-pointer"
                    >
                      ADD HIGHLIGHT
                    </button>
                  </div>

                  {(!formState.highlights || formState.highlights.length === 0) ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider">
                      No highlights added yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formState.highlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-700" />
                            <span className="font-bold text-xs text-slate-900">{hl}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveArrayItem('highlights', idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveArrayItem('highlights', idx, idx + 1)}
                              disabled={idx === formState.highlights!.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItemFromArray('highlights', idx)}
                              className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 6: Accommodation Narrative */}
            {activeTab === 'stay' && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Where to Stay / Accommodation Overview</label>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    Editorial accommodation storytelling describing the style of lodges, boutique camps, or luxury retreats.
                  </p>
                  <textarea
                    name="accommodation"
                    value={formState.accommodation || ''}
                    onChange={handleInputChange}
                    placeholder="From ultra-exclusive wilderness lodges to design-forward boutique hideaways..."
                    rows={6}
                    className={inputClass + ' resize-none'}
                  />
                </div>
              </div>
            )}

            {/* Tab 7: Travel & Climate */}
            {activeTab === 'travel' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Best Time to Visit</label>
                    <input
                      type="text"
                      name="bestTimeToVisit"
                      value={formState.bestTimeToVisit || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., May to October (Dry Season)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Ideal Trip Duration</label>
                    <input
                      type="text"
                      name="bestDaysDuration"
                      value={formState.bestDaysDuration || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 7 - 10 Days"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Distance / Transfer from Airport</label>
                    <input
                      type="text"
                      name="distanceFromAirport"
                      value={formState.distanceFromAirport || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 45 mins light aircraft flight"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Annual Rainfall (mm)</label>
                    <input
                      type="number"
                      name="rainfall"
                      value={formState.rainfall || 0}
                      onChange={handleInputChange}
                      placeholder="e.g., 460"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Avg Temperature Min (°C)</label>
                    <input
                      type="number"
                      value={formState.averageTemperature?.min || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState((prev) => ({
                          ...prev,
                          averageTemperature: { ...(prev.averageTemperature || { min: 0, max: 0 }), min: val },
                        }));
                        setIsDirty(true);
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Avg Temperature Max (°C)</label>
                    <input
                      type="number"
                      value={formState.averageTemperature?.max || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState((prev) => ({
                          ...prev,
                          averageTemperature: { ...(prev.averageTemperature || { min: 0, max: 0 }), max: val },
                        }));
                        setIsDirty(true);
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Visa Requirements</label>
                  <textarea
                    name="visaRequirements"
                    value={formState.visaRequirements || ''}
                    onChange={handleInputChange}
                    placeholder="Visa rules, passport validity requirements, and entry permits..."
                    rows={3}
                    className={inputClass + ' resize-none'}
                  />
                </div>

                <div>
                  <label className={labelClass}>Languages Spoken</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newLanguageInput}
                      onChange={(e) => setNewLanguageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItemToArray('languageSpoken', newLanguageInput, () => setNewLanguageInput(''));
                        }
                      }}
                      placeholder="e.g., English, Setswana"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => addItemToArray('languageSpoken', newLanguageInput, () => setNewLanguageInput(''))}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-lg shrink-0 hover:bg-slate-800 cursor-pointer"
                    >
                      ADD LANGUAGE
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formState.languageSpoken || []).map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2">
                        {lang}
                        <button type="button" onClick={() => removeItemFromArray('languageSpoken', idx)} className="hover:text-rose-600 cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 8: Imagery & Media */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* Cover Image Upload / URL */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <ImageInput
                    label="DESTINATION COVER PHOTO"
                    value={formState.coverImage || ''}
                    onSave={(url) => {
                      setFormState((prev) => ({ ...prev, coverImage: url }));
                      setIsDirty(true);
                    }}
                    storagePath="destinations/covers"
                    aspectClass="aspect-21/9"
                    helpText="Primary landscape photograph displayed across destination cards and hero header."
                    removeWarningMessage="Removing this cover photo will leave this destination without a primary visual. Remove photo?"
                  />
                </div>

                {/* Gallery Images Grid Manager */}
                <GalleryManager
                  label="DESTINATION PHOTO GALLERY"
                  helpText="Curated photography showcasing landmarks, landscapes, and culture."
                  gallery={formState.gallery || []}
                  onChange={(updatedGallery) => {
                    setFormState((prev) => ({ ...prev, gallery: updatedGallery }));
                    setIsDirty(true);
                  }}
                  storagePath="destinations/gallery"
                  onUseAsCover={(url) => {
                    setFormState((prev) => ({ ...prev, coverImage: url }));
                    setIsDirty(true);
                  }}
                />
              </div>
            )}

            {/* Tab 9: Map & SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                {/* E32 Content Check Card */}
                {contentCheck && (
                  <ContentCheckCard
                    result={contentCheck}
                    onClickFix={(tab) => setActiveTab(tab as TabType)}
                  />
                )}

                {/* Publish / Unpublish toggle */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Destination Visibility</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {formState.active !== false
                          ? 'Published — Visible to website visitors.'
                          : 'Unpublished — Hidden from public destination listings.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleActive}
                      className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        formState.active !== false
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : contentCheck && !contentCheck.isPublishable
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      aria-label={formState.active !== false ? 'Unpublish destination' : 'Publish destination'}
                    >
                      {formState.active !== false ? 'PUBLISHED' : 'PUBLISH DESTINATION'}
                    </button>
                  </div>
                  {formState.active === false && contentCheck && !contentCheck.isPublishable && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                      <span>This destination needs a few details before it can be published. Review the required items above.</span>
                    </div>
                  )}
                  <p className="text-[10px] font-medium text-slate-400">
                    Saving is always allowed. Publishing makes this destination visible to website visitors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Map Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formState.mapCoordinates?.latitude || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState((prev) => ({
                          ...prev,
                          mapCoordinates: { ...(prev.mapCoordinates || { latitude: 0, longitude: 0 }), latitude: val },
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g., -19.0208"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Map Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formState.mapCoordinates?.longitude || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormState((prev) => ({
                          ...prev,
                          mapCoordinates: { ...(prev.mapCoordinates || { latitude: 0, longitude: 0 }), longitude: val },
                        }));
                        setIsDirty(true);
                      }}
                      placeholder="e.g., 23.5208"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* E34 Destination SEO & Search Visibility Editor */}
                <div className="pt-2">
                  <AdminSEOEditor
                    seo={formState.seo || {
                      description: formState.seoDescription,
                      keywords: formState.seoKeywords,
                    }}
                    onChange={(updatedSeo) => {
                      setFormState((prev) => ({
                        ...prev,
                        seo: updatedSeo,
                        seoDescription: updatedSeo.description,
                        seoKeywords: updatedSeo.keywords,
                      }));
                      setIsDirty(true);
                    }}
                    fallbackTitle={formState.name ? `${formState.name}, ${formState.country || 'World'}` : ''}
                    fallbackDescription={formState.shortDescription || formState.description || formState.whyVisit || ''}
                    fallbackImage={formState.coverImage || formState.gallery?.[0]}
                    slug={formState.slug || formState.id}
                    baseRoute="destinations"
                    contentTypeLabel="Destination"
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
                  <AlertTriangle size={14} /> Unsaved changes in form
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
                onClick={handleCloseForm}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Save size={15} />
                {saving ? 'SAVING…' : 'SAVE DESTINATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destinations List View */}
      <div className="saas-card bg-white border border-slate-200/80 rounded-2xl overflow-hidden space-y-4 p-5">
        {/* List Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, country..."
              className="saas-input pl-10 w-full text-xs text-slate-900"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
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
            >
              <option value="all">All Visibility ({stats.total})</option>
              <option value="published">Published Only ({stats.published})</option>
              <option value="unpublished">Unpublished Only ({stats.unpublished})</option>
            </select>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as any)}
              className="saas-input text-xs text-slate-900 font-bold"
              aria-label="Filter by content quality"
            >
              <option value="all">All Content</option>
              <option value="ready">✓ Ready</option>
              <option value="needs_details">⚠ Needs Details</option>
              <option value="draft">● Draft</option>
            </select>
          </div>
        </div>

        {/* Destinations Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Destination</th>
                <th className="px-4 py-3.5">Country / Region</th>
                <th className="px-4 py-3.5">Best Time</th>
                <th className="px-4 py-3.5 text-center">Highlights &amp; Experiences</th>
                <th className="px-4 py-3.5 text-center">Visibility</th>
                <th className="px-4 py-3.5 text-center">Content</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDestinations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider space-y-2">
                    <Globe size={32} className="mx-auto text-slate-300" />
                    <p>No destinations found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredDestinations.map((dest) => {
                  const isPublished = dest.active !== false;
                  return (
                    <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Photo */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                            {dest.coverImage ? (
                              <img src={dest.coverImage} alt={dest.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <Globe size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-brand font-black text-sm text-slate-900">{dest.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">/destinations/{dest.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3.5 font-bold text-slate-700">
                        {dest.country || 'Global'}
                        {dest.continent && <span className="text-[10px] text-slate-400 font-medium block">{dest.continent}</span>}
                      </td>

                      {/* Best Time */}
                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {dest.bestTimeToVisit || 'Year-round'}
                      </td>

                      {/* Counts */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md" title="Highlights">
                            {dest.highlights?.length || 0} Highlights
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-md" title="Experiences">
                            {dest.experiences?.length || 0} Experiences
                          </span>
                        </div>
                      </td>

                      {/* Visibility Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-md ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPublished ? 'Published' : 'Unpublished'}
                        </span>
                      </td>

                      {/* E32 Content Quality Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <QualityBadge badge={getDestinationBadge(dest)} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/destinations/${dest.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#121212] hover:text-[#F4BF4B] transition-colors cursor-pointer"
                            title="Preview destination in new tab"
                          >
                            <Eye size={14} />
                          </a>

                          <button
                            onClick={() => initFormWithDestination(dest)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                            title="Edit Destination"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirm(dest.id)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                            title="Remove Destination"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">Remove Destination?</h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Are you sure you want to remove this destination? Public pages and itineraries referencing it will no longer display destination details.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 transition-colors cursor-pointer"
              >
                REMOVE
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
              You have unsaved changes in this destination form. Leave without saving?
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
                  setShowForm(false);
                  resetForm();
                  if (onBack) onBack();
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
