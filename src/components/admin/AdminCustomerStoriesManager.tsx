import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit2, Trash2, Eye, EyeOff, Star,
  CheckCircle2, AlertCircle, X, Upload, RefreshCw, Sparkles,
  MapPin, Calendar, Clock, User, Quote, Layers, ChevronRight,
  ExternalLink, ShieldCheck, Tag, ArrowRight, ChevronUp, ChevronDown, Check
} from 'lucide-react';
import {
  subscribeToAllCustomerStories,
  createCustomerStory,
  updateCustomerStory,
  deleteCustomerStory,
  useAuth,
  db
} from '../../services/firebaseService';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  CustomerStory,
  CustomerStoryDisplayMode,
  CustomerStoryStatus,
  Package,
  Destination
} from '../../types/database';
import { ImageInput } from './ImageInput';
import { getPublicCustomerDisplayName } from '../stories/CustomerStoryCard';

type EditorTab = 'STORY' | 'TRAVELLER' | 'JOURNEY' | 'PHOTOS' | 'PUBLISH';

export const AdminCustomerStoriesManager: React.FC = () => {
  const { user } = useAuth();

  // Realtime Data State
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'FEATURED'>('ALL');

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<CustomerStory | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('STORY');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Delete Modal State
  const [deleteConfirmStory, setDeleteConfirmStory] = useState<CustomerStory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerDisplayMode, setCustomerDisplayMode] = useState<CustomerStoryDisplayMode>('FULL_NAME');
  const [customerLocation, setCustomerLocation] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState('');
  const [travellerCount, setTravellerCount] = useState<number>(2);

  // Linked References
  const [destination, setDestination] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [destinationSlug, setDestinationSlug] = useState('');
  const [itineraryTitle, setItineraryTitle] = useState('');
  const [itineraryId, setItineraryId] = useState('');
  const [itinerarySlug, setItinerarySlug] = useState('');

  // Metadata
  const [travelDate, setTravelDate] = useState('');
  const [tripDuration, setTripDuration] = useState('');
  const [travelStyle, setTravelStyle] = useState<string[]>([]);
  const [customerQuote, setCustomerQuote] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [experiences, setExperiences] = useState<string[]>([]);
  const [newExperienceText, setNewExperienceText] = useState('');
  
  // Publishing & Consent
  const [status, setStatus] = useState<CustomerStoryStatus>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [adminConsent, setAdminConsent] = useState(false);

  // 1. Realtime Story & Relational Subscriptions
  useEffect(() => {
    setLoading(true);

    const unsubStories = subscribeToAllCustomerStories(
      (loaded) => {
        setStories(loaded);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading stories:', err);
        setNotice({ type: 'error', text: 'Couldn\'t load stories.' });
        setLoading(false);
      }
    );

    const unsubPackages = onSnapshot(collection(db, 'packages'), (snap) => {
      setPackages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Package, 'id'>) })));
    });

    const unsubDestinations = onSnapshot(collection(db, 'destinations'), (snap) => {
      setDestinations(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Destination, 'id'>) })));
    });

    return () => {
      unsubStories();
      unsubPackages();
      unsubDestinations();
    };
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugManual) {
      setSlug(slugify(newTitle));
    }
  };

  const resetForm = () => {
    setEditingStory(null);
    setTitle('');
    setSlug('');
    setSlugManual(false);
    setExcerpt('');
    setStoryContent('');
    setCoverImage('');
    setGallery([]);
    setCustomerName('');
    setCustomerDisplayMode('FULL_NAME');
    setCustomerLocation('');
    setCustomerPhoto('');
    setTravellerCount(2);
    setDestination('');
    setDestinationId('');
    setDestinationSlug('');
    setItineraryTitle('');
    setItineraryId('');
    setItinerarySlug('');
    setTravelDate('');
    setTripDuration('');
    setTravelStyle([]);
    setCustomerQuote('');
    setHighlights([]);
    setNewHighlightText('');
    setExperiences([]);
    setNewExperienceText('');
    setStatus('DRAFT');
    setFeatured(false);
    setDisplayOrder(0);
    setAdminConsent(false);
    setActiveTab('STORY');
  };

  const handleCreateNew = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const handleEditStory = (story: CustomerStory) => {
    setEditingStory(story);
    setTitle(story.title || '');
    setSlug(story.slug || '');
    setSlugManual(true);
    setExcerpt(story.excerpt || story.shortTitle || '');
    setStoryContent(story.storyContent || story.story || '');
    setCoverImage(story.coverImage || '');
    setGallery(story.gallery || []);
    setCustomerName(story.customerName || '');
    setCustomerDisplayMode(story.customerDisplayMode || 'FULL_NAME');
    setCustomerLocation(story.customerLocation || '');
    setCustomerPhoto(story.customerPhoto || '');
    setTravellerCount(story.travellerCount || 2);
    setDestination(story.destination || '');
    setDestinationId(story.destinationId || '');
    setDestinationSlug(story.destinationSlug || '');
    setItineraryTitle(story.itineraryTitle || story.tripTitle || '');
    setItineraryId(story.itineraryId || '');
    setItinerarySlug(story.itinerarySlug || '');
    setTravelDate(story.travelDate || '');
    setTripDuration(story.tripDuration || story.duration || '');
    setTravelStyle(story.travelStyle || []);
    setCustomerQuote(story.customerQuote || story.quote || '');
    setHighlights(story.highlights || []);
    setExperiences(story.experiences || []);
    setStatus(story.status || 'DRAFT');
    setFeatured(Boolean(story.featured));
    setDisplayOrder(story.displayOrder || 0);
    setAdminConsent(story.status === 'PUBLISHED');
    setIsEditorOpen(true);
    setActiveTab('STORY');
  };

  const handleSave = async (forceStatus?: CustomerStoryStatus) => {
    const finalStatus = forceStatus || status;

    if (!title.trim()) {
      setNotice({ type: 'error', text: 'Please enter a story title.' });
      setActiveTab('STORY');
      return;
    }
    if (!slug.trim()) {
      setNotice({ type: 'error', text: 'Please enter a URL slug.' });
      setActiveTab('STORY');
      return;
    }
    if (!customerName.trim()) {
      setNotice({ type: 'error', text: 'Please enter the traveller\'s display name.' });
      setActiveTab('TRAVELLER');
      return;
    }
    if (!storyContent.trim()) {
      setNotice({ type: 'error', text: 'Please enter the full story narrative.' });
      setActiveTab('STORY');
      return;
    }

    if (finalStatus === 'PUBLISHED' && !adminConsent) {
      setNotice({ type: 'error', text: 'Please confirm public publishing consent before publishing.' });
      setActiveTab('PUBLISH');
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const cleanSlug = slugify(slug);

      const payload: Omit<CustomerStory, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        slug: cleanSlug,
        excerpt: excerpt.trim() || undefined,
        storyContent: storyContent.trim(),
        story: storyContent.trim(),
        shortTitle: excerpt.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        gallery: gallery.filter(Boolean),
        customerName: customerName.trim(),
        customerDisplayMode,
        customerLocation: customerLocation.trim() || undefined,
        customerPhoto: customerPhoto.trim() || undefined,
        travellerCount,
        destination: destination.trim() || undefined,
        destinationId: destinationId || undefined,
        destinationSlug: destinationSlug || undefined,
        itineraryId: itineraryId || undefined,
        itinerarySlug: itinerarySlug || undefined,
        itineraryTitle: itineraryTitle.trim() || undefined,
        tripTitle: itineraryTitle.trim() || undefined,
        travelDate: travelDate.trim() || undefined,
        tripDuration: tripDuration.trim() || undefined,
        duration: tripDuration.trim() || undefined,
        travelStyle: travelStyle.filter(Boolean),
        customerQuote: customerQuote.trim() || undefined,
        quote: customerQuote.trim() || undefined,
        highlights: highlights.filter(Boolean),
        experiences: experiences.filter(Boolean),
        status: finalStatus,
        featured: Boolean(featured),
        displayOrder: Number(displayOrder) || 0,
      };

      if (editingStory) {
        await updateCustomerStory(editingStory.id, payload);
        setNotice({ type: 'success', text: 'Customer story updated.' });
      } else {
        await createCustomerStory(payload);
        setNotice({ type: 'success', text: 'Customer story created.' });
      }

      setIsEditorOpen(false);
      resetForm();
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      console.error('Error saving story:', err);
      setNotice({ type: 'error', text: err.message || 'Couldn\'t save customer story.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmStory) return;
    try {
      setDeleting(true);
      await deleteCustomerStory(deleteConfirmStory);
      setNotice({ type: 'success', text: 'Story deleted.' });
      setDeleteConfirmStory(null);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      console.error('Error deleting story:', err);
      setNotice({ type: 'error', text: 'Couldn\'t delete story.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFeatured = async (story: CustomerStory) => {
    try {
      await updateCustomerStory(story.id, { featured: !story.featured });
      setNotice({ type: 'success', text: !story.featured ? 'Story marked as featured.' : 'Featured status removed.' });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  // Reorder featured stories
  const handleReorderFeatured = async (story: CustomerStory, direction: 'UP' | 'DOWN') => {
    const featuredStories = stories
      .filter((s) => s.featured)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const currIdx = featuredStories.findIndex((s) => s.id === story.id);
    if (currIdx < 0) return;

    const swapIdx = direction === 'UP' ? currIdx - 1 : currIdx + 1;
    if (swapIdx < 0 || swapIdx >= featuredStories.length) return;

    const target = featuredStories[swapIdx];
    const currOrder = story.displayOrder || currIdx;
    const targetOrder = target.displayOrder || swapIdx;

    try {
      await updateCustomerStory(story.id, { displayOrder: targetOrder });
      await updateCustomerStory(target.id, { displayOrder: currOrder });
    } catch (err) {
      console.error('Error reordering stories:', err);
    }
  };

  // Filtered stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Status Filter
      if (statusFilter === 'DRAFT' && story.status !== 'DRAFT') return false;
      if (statusFilter === 'PUBLISHED' && story.status !== 'PUBLISHED') return false;
      if (statusFilter === 'FEATURED' && !story.featured) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = story.title?.toLowerCase().includes(q);
        const matchCustomer = story.customerName?.toLowerCase().includes(q);
        const matchDest = story.destination?.toLowerCase().includes(q);
        const matchJourney = story.itineraryTitle?.toLowerCase().includes(q);
        return matchTitle || matchCustomer || matchDest || matchJourney;
      }
      return true;
    });
  }, [stories, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = stories.length;
    const published = stories.filter((s) => s.status === 'PUBLISHED').length;
    const drafts = total - published;
    const featuredCount = stories.filter((s) => s.featured).length;
    return { total, published, drafts, featuredCount };
  }, [stories]);

  const inputClass = 'saas-input w-full text-xs text-slate-900 font-sans focus:ring-2 focus:ring-[#121212] focus:border-transparent';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1';

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
            {notice.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} className="text-emerald-600" />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="hover:opacity-75 cursor-pointer" aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <BookOpen size={24} className="text-[#9E1B1D]" /> CUSTOMER STORIES
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Share real journeys and experiences from our travellers across destinations.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          aria-label="Create new customer story"
        >
          <Plus size={16} /> CREATE STORY
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-4">
          <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen size={20} className="text-slate-700" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stories</p>
            <p className="font-black text-xl text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-4">
          <div className="size-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published</p>
            <p className="font-black text-xl text-emerald-700">{stats.published}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-4">
          <div className="size-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drafts</p>
            <p className="font-black text-xl text-amber-700">{stats.drafts}</p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-4">
          <div className="size-10 bg-rose-50 rounded-lg flex items-center justify-center shrink-0">
            <Star size={20} className="text-[#9E1B1D]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Featured</p>
            <p className="font-black text-xl text-[#9E1B1D]">{stats.featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Editor Panel Modal */}
      {isEditorOpen && (
        <div className="saas-card bg-white border-2 border-slate-900 rounded-2xl shadow-xl overflow-hidden space-y-0">
          {/* Top Bar */}
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen size={22} className="text-[#F4BF4B]" />
              <div>
                <h3 className="font-brand font-black text-lg uppercase tracking-tight text-white">
                  {editingStory ? `Edit: ${editingStory.title}` : 'Create Customer Story'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {status === 'PUBLISHED' ? 'Published Story' : 'Draft Story'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {slug && (
                <a
                  href={`/stories/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-white/10 text-white hover:bg-white/20 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} /> PREVIEW STORY
                </a>
              )}
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close story editor"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Editor Tabs Navigation */}
          <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
            {[
              { id: 'STORY', label: '1. Story & Narrative', icon: BookOpen },
              { id: 'TRAVELLER', label: '2. Traveller Info', icon: User },
              { id: 'JOURNEY', label: '3. Journey & Destination', icon: MapPin },
              { id: 'PHOTOS', label: '4. Photos & Highlights', icon: Sparkles },
              { id: 'PUBLISH', label: '5. Publishing & Consent', icon: ShieldCheck },
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
            {/* Tab 1: STORY & NARRATIVE */}
            {activeTab === 'STORY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Story Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g., A Journey We Will Never Forget"
                      className={inputClass}
                      aria-label="Story Title"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>URL Slug *</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugManual(true);
                      }}
                      placeholder="e.g., journey-we-will-never-forget"
                      className={inputClass}
                      aria-label="URL Slug"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Short Introduction / Excerpt</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Captivating short summary for cards and search..."
                    rows={2}
                    className={inputClass + ' resize-none'}
                    aria-label="Short Introduction / Excerpt"
                  />
                </div>

                <div>
                  <label className={labelClass}>Full Story Narrative *</label>
                  <textarea
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="Complete narrative detailing the traveller's journey..."
                    rows={8}
                    className={inputClass + ' resize-none font-serif leading-relaxed'}
                    aria-label="Full Story Narrative"
                  />
                </div>

                <div>
                  <label className={labelClass}>Traveller Quote</label>
                  <input
                    type="text"
                    value={customerQuote}
                    onChange={(e) => setCustomerQuote(e.target.value)}
                    placeholder='e.g., "Every detail felt crafted just for us."'
                    className={inputClass}
                    aria-label="Traveller Quote"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: TRAVELLER INFO */}
            {activeTab === 'TRAVELLER' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Traveller Display Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., Rahul & Priya"
                      className={inputClass}
                      aria-label="Traveller Display Name"
                    />
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      Enter display format (e.g. "Rahul & Priya", "Ananya's Family").
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Display Name Mode</label>
                    <select
                      value={customerDisplayMode}
                      onChange={(e) => setCustomerDisplayMode(e.target.value as CustomerStoryDisplayMode)}
                      className={inputClass}
                      aria-label="Display Name Mode"
                    >
                      <option value="FULL_NAME">Full Display Name (Rahul & Priya)</option>
                      <option value="FIRST_NAME">First Name Only (Rahul)</option>
                      <option value="ANONYMOUS">Anonymous ("A Traveller's Journey")</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Traveller Location</label>
                    <input
                      type="text"
                      value={customerLocation}
                      onChange={(e) => setCustomerLocation(e.target.value)}
                      placeholder="e.g., Mumbai, India"
                      className={inputClass}
                      aria-label="Traveller Location"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Number of Travellers</label>
                    <input
                      type="number"
                      min="1"
                      value={travellerCount}
                      onChange={(e) => setTravellerCount(parseInt(e.target.value, 10) || 2)}
                      className={inputClass}
                      aria-label="Number of Travellers"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-amber-700" /> Customer Privacy Protection
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    Customer stories are public editorial content. Private details such as phone numbers, emails, addresses, or booking references are strictly excluded.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 3: JOURNEY & DESTINATION */}
            {activeTab === 'JOURNEY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Related Journey Package</label>
                    <select
                      value={itineraryId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setItineraryId(selectedId);
                        const found = packages.find((p) => p.id === selectedId);
                        if (found) {
                          setItineraryTitle(found.title);
                          setItinerarySlug(found.slug);
                        } else {
                          setItineraryTitle('');
                          setItinerarySlug('');
                        }
                      }}
                      className={inputClass}
                      aria-label="Select Related Journey Package"
                    >
                      <option value="">-- Select Journey Package --</option>
                      {packages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Related Destination</label>
                    <select
                      value={destinationId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setDestinationId(selectedId);
                        const found = destinations.find((d) => d.id === selectedId);
                        if (found) {
                          setDestination(found.name);
                          setDestinationSlug(found.slug);
                        } else {
                          setDestination('');
                          setDestinationSlug('');
                        }
                      }}
                      className={inputClass}
                      aria-label="Select Related Destination"
                    >
                      <option value="">-- Select Destination --</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.country})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Travel Date / Season</label>
                    <input
                      type="text"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      placeholder="e.g., Autumn 2025"
                      className={inputClass}
                      aria-label="Travel Date / Season"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Trip Duration</label>
                    <input
                      type="text"
                      value={tripDuration}
                      onChange={(e) => setTripDuration(e.target.value)}
                      placeholder="e.g., 10 Days"
                      className={inputClass}
                      aria-label="Trip Duration"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Travel Style Tags</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Adventure', 'Luxury', 'Family', 'Romantic', 'Culinary', 'Wildlife', 'Culture', 'Photography'].map((style) => {
                      const isSelected = travelStyle.includes(style);
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => {
                            const next = isSelected ? travelStyle.filter((s) => s !== style) : [...travelStyle, style];
                            setTravelStyle(next);
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
              </div>
            )}

            {/* Tab 4: PHOTOS & HIGHLIGHTS */}
            {activeTab === 'PHOTOS' && (
              <div className="space-y-6">
                <ImageInput
                  label="STORY COVER PHOTO"
                  value={coverImage}
                  onSave={(url) => setCoverImage(url)}
                  storagePath={`stories/${editingStory?.id || 'new'}`}
                  aspectClass="aspect-21/9"
                />

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">STORY HIGHLIGHTS</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHighlightText}
                      onChange={(e) => setNewHighlightText(e.target.value)}
                      placeholder="e.g. Sunset boat cruise on Lake Como"
                      className={inputClass}
                      aria-label="Add story highlight input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newHighlightText.trim()) return;
                        setHighlights([...highlights, newHighlightText.trim()]);
                        setNewHighlightText('');
                      }}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                    >
                      ADD
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((hl, hIdx) => (
                      <span key={hIdx} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2">
                        {hl}
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...highlights];
                            next.splice(hIdx, 1);
                            setHighlights(next);
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

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">MEMORABLE EXPERIENCES</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExperienceText}
                      onChange={(e) => setNewExperienceText(e.target.value)}
                      placeholder="e.g. Private vineyard tour in Tuscany"
                      className={inputClass}
                      aria-label="Add experience input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExperienceText.trim()) return;
                        setExperiences([...experiences, newExperienceText.trim()]);
                        setNewExperienceText('');
                      }}
                      className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                    >
                      ADD
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {experiences.map((exp, eIdx) => (
                      <span key={eIdx} className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-600" />
                        {exp}
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...experiences];
                            next.splice(eIdx, 1);
                            setExperiences(next);
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
              </div>
            )}

            {/* Tab 5: PUBLISHING & CONSENT */}
            {activeTab === 'PUBLISH' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className={labelClass}>Story Publication Status</label>
                    <button
                      type="button"
                      onClick={() => setStatus(status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                      className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        status === 'PUBLISHED'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      aria-label="Toggle story publication status"
                    >
                      {status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className={labelClass}>Featured Placement</label>
                    <button
                      type="button"
                      onClick={() => setFeatured(!featured)}
                      className={`w-full py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        featured
                          ? 'bg-[#9E1B1D] text-white hover:bg-red-800'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      aria-label="Toggle featured placement"
                    >
                      {featured ? 'FEATURED STORY' : 'STANDARD STORY'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminConsent}
                      onChange={(e) => setAdminConsent(e.target.checked)}
                      className="mt-0.5 rounded border-amber-400 text-amber-800 focus:ring-amber-700 cursor-pointer"
                      aria-label="Admin consent confirmation"
                    />
                    <span className="text-xs font-bold text-amber-900 leading-snug">
                      Confirm this customer story is ready to be shared publicly on the NFA Travel website.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Footer Action Bar */}
          <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cancel editing"
            >
              CANCEL
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-300 disabled:opacity-50 transition-all cursor-pointer"
                aria-label="Save story as draft"
              >
                SAVE DRAFT
              </button>

              <button
                type="button"
                onClick={() => handleSave('PUBLISHED')}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                aria-label="Publish story"
              >
                <CheckCircle2 size={15} />
                {saving ? 'SAVING…' : 'PUBLISH STORY'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Stories List */}
      <div className="saas-card bg-white border border-slate-200/80 rounded-2xl overflow-hidden space-y-4 p-5">
        {/* List Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, traveller, destination..."
              className="saas-input pl-10 w-full text-xs text-slate-900"
              aria-label="Search customer stories"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="saas-input text-xs text-slate-900 font-bold"
              aria-label="Filter customer stories by status"
            >
              <option value="ALL">All Stories ({stats.total})</option>
              <option value="PUBLISHED">Published ({stats.published})</option>
              <option value="DRAFT">Drafts ({stats.drafts})</option>
              <option value="FEATURED">Featured ({stats.featuredCount})</option>
            </select>
          </div>
        </div>

        {/* Stories List */}
        <div className="space-y-3">
          {filteredStories.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No customer stories found.</p>
            </div>
          ) : (
            filteredStories.map((story) => {
              const isPublished = story.status === 'PUBLISHED';
              const publicName = getPublicCustomerDisplayName(story.customerName, story.customerDisplayMode);

              return (
                <div
                  key={story.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover Thumbnail */}
                    <div className="size-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                      {story.coverImage ? (
                        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-brand font-black text-base text-slate-900">{story.title}</h4>
                        {story.featured && (
                          <span className="px-2 py-0.5 bg-[#9E1B1D] text-white font-black text-[9px] uppercase rounded">
                            FEATURED
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 font-bold text-[9px] uppercase rounded ${
                            isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                        <span>👤 {publicName}</span>
                        {story.destination && <span>📍 {story.destination}</span>}
                        {story.itineraryTitle && <span>✈️ {story.itineraryTitle}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 justify-end">
                    {story.featured && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleReorderFeatured(story, 'UP')}
                          className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label={`Move ${story.title} up in featured stories`}
                          title="Move Featured Up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorderFeatured(story, 'DOWN')}
                          className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label={`Move ${story.title} down in featured stories`}
                          title="Move Featured Down"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(story)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        story.featured
                          ? 'bg-rose-50 text-[#9E1B1D] hover:bg-rose-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      aria-label={`Toggle featured status for ${story.title}`}
                      title={story.featured ? 'Unfeature Story' : 'Feature Story'}
                    >
                      <Star size={14} className={story.featured ? 'fill-[#9E1B1D]' : ''} />
                    </button>

                    <a
                      href={`/stories/${story.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#121212] hover:text-[#F4BF4B] transition-colors cursor-pointer"
                      aria-label={`Preview ${story.title} in new tab`}
                      title="Preview story in new tab"
                    >
                      <Eye size={14} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleEditStory(story)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                      aria-label={`Edit story ${story.title}`}
                      title="Edit Story"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmStory(story)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      aria-label={`Delete story ${story.title}`}
                      title="Delete Story"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmStory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">Delete Story?</h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Are you sure you want to delete "{deleteConfirmStory.title}"? Public story links will no longer be available.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeleteConfirmStory(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {deleting ? 'DELETING…' : 'DELETE STORY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
