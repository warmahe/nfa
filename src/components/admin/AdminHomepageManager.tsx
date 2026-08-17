import React, { useState, useEffect, useMemo } from 'react';
import {
  Save, Eye, Plus, Trash2, ChevronUp, ChevronDown, Check, AlertTriangle,
  Layers, Compass, MapPin, BookOpen, Sparkles, Shield, Image as ImageIcon,
  X, CheckCircle, HelpCircle, ArrowRight, Video, FileText, ExternalLink, Search, Star
} from 'lucide-react';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import {
  HomepageSettings, Package, Destination, CustomerStory,
  HomepageExperienceCategory, HomepageWhyUsFeature
} from '../../types/database';
import { ImageInput } from './ImageInput';
import { AdminSEOEditor } from './AdminSEOEditor';
import { useAdminDialog } from './AdminDialogContext';

type SectionTab =
  | 'HERO'
  | 'INTRO'
  | 'JOURNEYS'
  | 'DESTINATIONS'
  | 'EXPERIENCES'
  | 'STORIES'
  | 'WHY_US'
  | 'PLANNING_CTA'
  | 'SEO';

export const AdminHomepageManager: React.FC = () => {
  const { confirm, toast } = useAdminDialog();

  // Data pulled from database for selection lists
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Tab & Modal State
  const [activeTab, setActiveTab] = useState<SectionTab>('HERO');
  const [discardConfirm, setDiscardConfirm] = useState(false);
  const [heroHideConfirm, setHeroHideConfirm] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Master Homepage Content State
  const [settings, setSettings] = useState<HomepageSettings>({
    heroImage: '',
    featuredDropZones: [],
    featuredArchive: [],
    featuredReviewIds: [],
    hero: {
      enabled: true,
      title: 'GO FURTHER. TRAVEL DEEPER.',
      subtitle: 'NO FIXED ADDRESS',
      description: 'Journeys shaped around remarkable places, meaningful experiences and time.',
      primaryBtnLabel: 'EXPLORE JOURNEYS',
      primaryBtnAction: 'EXPLORE_JOURNEYS',
      secondaryBtnLabel: 'PLAN YOUR JOURNEY',
      secondaryBtnAction: 'ENQUIRE_NOW',
      heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    },
    introduction: {
      enabled: true,
      sectionLabel: 'ABOUT NO FIXED ADDRESS',
      heading: 'Travel Should Feel Personal.',
      description: 'Every journey we create is built around the places you want to experience and the way you want to travel.',
      ctaLabel: 'EXPLORE OUR PHILOSOPHY',
      ctaAction: 'EXPLORE_JOURNEYS',
    },
    featuredJourneys: {
      enabled: true,
      sectionLabel: 'CURATED EXPEDITIONS',
      heading: 'Featured Journeys & Itineraries',
      description: 'Handpicked luxury itineraries designed for unforgettable travel.',
      journeyIds: [],
    },
    featuredDestinations: {
      enabled: true,
      sectionLabel: 'REMARKABLE LOCATIONS',
      heading: 'Explore Destinations',
      description: 'From alpine lakes to ancient cities across the world.',
      destinationIds: [],
    },
    experiences: {
      enabled: true,
      sectionLabel: 'TRAVEL CATEGORIES',
      heading: 'Curated Experiences',
      description: 'Travel tailored to your passion and pace.',
      categories: [
        { title: 'Adventure & Nature', description: 'Raw wilderness, alpine treks, and outdoor discovery.' },
        { title: 'Luxury & Stays', description: 'Handpicked palace hotels, private chalets, and heritage estates.' },
        { title: 'Culture & Heritage', description: 'Private guides, historic monuments, and local encounters.' },
        { title: 'Food & Wine', description: 'Private vineyard visits, Michelin dining, and cooking masterclasses.' },
      ],
    },
    customerStories: {
      enabled: true,
      sectionLabel: 'TRAVELLER JOURNEYS',
      heading: 'Customer Stories',
      description: 'Real accounts shared by travellers who have journeyed with us.',
      storyIds: [],
    },
    reviews: {
      enabled: true,
      sectionLabel: 'VERIFIED SOCIAL PROOF',
      heading: 'FIELD REPORTS',
      featuredOnly: true,
      count: 3,
      reviewIds: [],
    },
    whyUs: {
      enabled: true,
      sectionLabel: 'OUR PROMISE',
      heading: 'Why Travel With No Fixed Address',
      description: 'Crafted with care, personal attention, and local expertise.',
      features: [
        { title: 'Thoughtful Customization', description: 'No two itineraries are ever identical.' },
        { title: 'Handpicked Accommodations', description: 'Stays chosen for character, luxury, and location.' },
        { title: 'Local Expertise', description: 'Insiders and private guides at every stop.' },
        { title: 'Personal Support', description: 'Dedicated assistance from planning to return.' },
      ],
    },
    planningCta: {
      enabled: true,
      heading: 'Ready To Plan Your Journey?',
      description: 'Tell us where you\'d like to go and we\'ll help shape the journey around you.',
      primaryBtnLabel: 'ENQUIRE NOW',
      secondaryBtnLabel: 'EXPLORE JOURNEYS',
    },
  });

  // 1. Subscribe to canonical homepage settings document & reference collections in realtime
  useEffect(() => {
    setLoading(true);

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'homepage'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as HomepageSettings;
          setSettings((prev) => ({
            ...prev,
            ...data,
            hero: { ...prev.hero, ...(data.hero || {}) },
            introduction: { ...prev.introduction, ...(data.introduction || {}) },
            featuredJourneys: { ...prev.featuredJourneys, ...(data.featuredJourneys || {}) },
            featuredDestinations: { ...prev.featuredDestinations, ...(data.featuredDestinations || {}) },
            experiences: { ...prev.experiences, ...(data.experiences || {}) },
            customerStories: { ...prev.customerStories, ...(data.customerStories || {}) },
            whyUs: { ...prev.whyUs, ...(data.whyUs || {}) },
            planningCta: { ...prev.planningCta, ...(data.planningCta || {}) },
          }));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading homepage settings:', err);
        setNotice({ type: 'error', text: 'Couldn\'t load homepage settings.' });
        setLoading(false);
      }
    );

    const unsubPackages = onSnapshot(collection(db, 'packages'), (snap) => {
      setPackages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Package, 'id'>) })));
    });

    const unsubDestinations = onSnapshot(collection(db, 'destinations'), (snap) => {
      setDestinations(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Destination, 'id'>) })));
    });

    const unsubStories = onSnapshot(collection(db, 'customerStories'), (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomerStory, 'id'>) })));
    });

    return () => {
      unsubSettings();
      unsubPackages();
      unsubDestinations();
      unsubStories();
    };
  }, []);

  const handleFieldChange = (section: keyof HomepageSettings, field: string, value: any) => {
    setSettings((prev) => {
      const sectionObj = (prev[section] as any) || {};
      return {
        ...prev,
        [section]: {
          ...sectionObj,
          [field]: value,
        },
      };
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setNotice(null);

      const payload: HomepageSettings = {
        ...settings,
        heroImage: settings.hero?.heroImage || settings.heroImage || '',
        featuredDropZones: settings.featuredJourneys?.journeyIds || settings.featuredDropZones || [],
        featuredArchive: settings.featuredDestinations?.destinationIds || settings.featuredArchive || [],
        featuredStoryIds: settings.customerStories?.storyIds || [],
        updatedAt: new Date() as any,
      };

      await setDoc(doc(db, 'settings', 'homepage'), payload);
      setIsDirty(false);
      setNotice({ type: 'success', text: 'Homepage content updated successfully.' });
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      console.error('Error saving homepage content:', err);
      setNotice({ type: 'error', text: err.message || 'Couldn\'t save homepage content.' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'saas-input w-full text-xs text-slate-900 font-sans focus:ring-2 focus:ring-[#121212] focus:border-transparent';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1';

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Compass className="size-8 mx-auto text-slate-300 animate-pulse" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Homepage Settings…</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-brand font-black text-2xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Layers size={24} className="text-[#9E1B1D]" /> HOMEPAGE CONTENT WORKSPACE
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage the content, journeys, destinations, and stories travellers see when they arrive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye size={15} /> PREVIEW HOMEPAGE
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            aria-label="Save homepage changes"
          >
            <Save size={16} /> {saving ? 'SAVING…' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="saas-card bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 overflow-x-auto flex items-center gap-2 no-scrollbar">
          {[
            { id: 'HERO', label: '1. Hero Banner', icon: Compass },
            { id: 'INTRO', label: '2. Introduction', icon: FileText },
            { id: 'JOURNEYS', label: '3. Featured Journeys', icon: MapPin },
            { id: 'DESTINATIONS', label: '4. Destinations', icon: Compass },
            { id: 'EXPERIENCES', label: '5. Experiences', icon: Sparkles },
            { id: 'STORIES', label: '6. Customer Stories', icon: BookOpen },
            { id: 'WHY_US', label: '7. Why Choose Us', icon: Shield },
            { id: 'PLANNING_CTA', label: '8. Planning CTA', icon: CheckCircle },
            { id: 'SEO', label: '9. SEO & Visibility', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SectionTab)}
                className={`px-4 py-2.5 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-[#121212] text-[#121212] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
                aria-label={`Switch to ${tab.label} section editor`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: HERO */}
          {activeTab === 'HERO' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">HERO BANNER VISIBILITY</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Control whether the hero banner displays on the homepage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (settings.hero?.enabled) {
                      setHeroHideConfirm(true);
                    } else {
                      handleFieldChange('hero', 'enabled', true);
                    }
                  }}
                  className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    settings.hero?.enabled !== false
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                  aria-label="Toggle hero visibility"
                >
                  {settings.hero?.enabled !== false ? 'HERO VISIBLE' : 'HERO HIDDEN'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Hero Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={settings.hero?.subtitle || ''}
                    onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)}
                    placeholder="e.g. NO FIXED ADDRESS"
                    className={inputClass}
                    aria-label="Hero Subtitle"
                  />
                </div>

                <div>
                  <label className={labelClass}>Hero Main Title *</label>
                  <input
                    type="text"
                    value={settings.hero?.title || ''}
                    onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
                    placeholder="e.g. GO FURTHER. TRAVEL DEEPER."
                    className={inputClass}
                    aria-label="Hero Title"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Hero Description</label>
                <textarea
                  value={settings.hero?.description || ''}
                  onChange={(e) => handleFieldChange('hero', 'description', e.target.value)}
                  placeholder="Editorial hero narrative..."
                  rows={3}
                  className={inputClass + ' resize-none'}
                  aria-label="Hero Description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Primary Button Label</label>
                  <input
                    type="text"
                    value={settings.hero?.primaryBtnLabel || 'EXPLORE JOURNEYS'}
                    onChange={(e) => handleFieldChange('hero', 'primaryBtnLabel', e.target.value)}
                    className={inputClass}
                    aria-label="Primary Button Label"
                  />
                </div>

                <div>
                  <label className={labelClass}>Secondary Button Label</label>
                  <input
                    type="text"
                    value={settings.hero?.secondaryBtnLabel || 'PLAN YOUR JOURNEY'}
                    onChange={(e) => handleFieldChange('hero', 'secondaryBtnLabel', e.target.value)}
                    className={inputClass}
                    aria-label="Secondary Button Label"
                  />
                </div>
              </div>

              <ImageInput
                label="HERO COVER PHOTO"
                value={settings.hero?.heroImage || settings.heroImage || ''}
                onSave={(url) => handleFieldChange('hero', 'heroImage', url)}
                storagePath="homepage/hero"
                aspectClass="aspect-21/9"
                helpText="High-impact visual banner presented at the top of the homepage."
                removeWarningMessage="Removing this hero photo will leave the homepage hero banner without a primary visual. Remove photo?"
              />
            </div>
          )}

          {/* Section 2: INTRODUCTION */}
          {activeTab === 'INTRO' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Section Label</label>
                  <input
                    type="text"
                    value={settings.introduction?.sectionLabel || ''}
                    onChange={(e) => handleFieldChange('introduction', 'sectionLabel', e.target.value)}
                    placeholder="e.g. ABOUT NO FIXED ADDRESS"
                    className={inputClass}
                    aria-label="Introduction Section Label"
                  />
                </div>

                <div>
                  <label className={labelClass}>Section Heading</label>
                  <input
                    type="text"
                    value={settings.introduction?.heading || ''}
                    onChange={(e) => handleFieldChange('introduction', 'heading', e.target.value)}
                    placeholder="e.g. Travel Should Feel Personal."
                    className={inputClass}
                    aria-label="Introduction Section Heading"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Introduction Narrative</label>
                <textarea
                  value={settings.introduction?.description || ''}
                  onChange={(e) => handleFieldChange('introduction', 'description', e.target.value)}
                  placeholder="Full brand narrative..."
                  rows={4}
                  className={inputClass + ' resize-none'}
                  aria-label="Introduction Description"
                />
              </div>

              <ImageInput
                label="BRAND STORY PHOTO"
                value={settings.introduction?.image || ''}
                onSave={(url) => handleFieldChange('introduction', 'image', url)}
                storagePath="homepage/intro"
                aspectClass="aspect-16/9"
                helpText="Editorial photo accompanying the brand introduction section."
              />
            </div>
          )}

          {/* Section 3: FEATURED JOURNEYS */}
          {activeTab === 'JOURNEYS' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FEATURED JOURNEYS ON HOMEPAGE</h4>
                <p className="text-xs text-slate-500 font-medium">Select and order published journeys displayed on the homepage.</p>
              </div>

              {((settings.featuredJourneys?.journeyIds || settings.featuredDropZones || []).length > 6) && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span>Six journeys are recommended for the homepage for optimal editorial presentation.</span>
                </div>
              )}

              {/* Package Selector Table */}
              <div className="space-y-3">
                <label className={labelClass}>Select Published Journeys</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {packages.map((pkg) => {
                    const currentIds = settings.featuredJourneys?.journeyIds || settings.featuredDropZones || [];
                    const isSelected = currentIds.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          const next = isSelected
                            ? currentIds.filter((id) => id !== pkg.id)
                            : [...currentIds, pkg.id];
                          handleFieldChange('featuredJourneys', 'journeyIds', next);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-[#121212] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-md bg-slate-200 overflow-hidden shrink-0">
                            {pkg.media?.thumbnail && (
                              <img src={pkg.media.thumbnail} alt={pkg.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-brand font-black text-xs text-slate-900">{pkg.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{pkg.duration || 'Custom'}</p>
                          </div>
                        </div>

                        <span
                          className={`size-6 rounded-md flex items-center justify-center font-black text-xs ${
                            isSelected ? 'bg-[#121212] text-[#F4BF4B]' : 'border border-slate-300 text-slate-400'
                          }`}
                        >
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section 4: FEATURED DESTINATIONS */}
          {activeTab === 'DESTINATIONS' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FEATURED DESTINATIONS</h4>
                <p className="text-xs text-slate-500 font-medium">Select destinations featured in the homepage discovery grid.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                {destinations.map((dest) => {
                  const currentIds = settings.featuredDestinations?.destinationIds || settings.featuredArchive || [];
                  const isSelected = currentIds.includes(dest.id);
                  return (
                    <div
                      key={dest.id}
                      onClick={() => {
                        const next = isSelected
                          ? currentIds.filter((id) => id !== dest.id)
                          : [...currentIds, dest.id];
                        handleFieldChange('featuredDestinations', 'destinationIds', next);
                      }}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#121212] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-md bg-slate-200 overflow-hidden shrink-0">
                          {dest.heroImage && (
                            <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-brand font-black text-xs text-slate-900">{dest.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{dest.country}</p>
                        </div>
                      </div>

                      <span
                        className={`size-6 rounded-md flex items-center justify-center font-black text-xs ${
                          isSelected ? 'bg-[#121212] text-[#F4BF4B]' : 'border border-slate-300 text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 5: TRAVEL EXPERIENCES */}
          {activeTab === 'EXPERIENCES' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">CURATED TRAVEL EXPERIENCES</h4>
                <p className="text-xs text-slate-500 font-medium">Manage curated experience categories presented on the homepage.</p>
              </div>

              <div className="space-y-3">
                {(settings.experiences?.categories || []).map((cat, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-brand font-black text-xs uppercase text-slate-900">Category {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(settings.experiences?.categories || [])];
                          next.splice(idx, 1);
                          handleFieldChange('experiences', 'categories', next);
                        }}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                        aria-label={`Remove experience category ${cat.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Category Title</label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => {
                            const next = [...(settings.experiences?.categories || [])];
                            next[idx] = { ...next[idx], title: e.target.value };
                            handleFieldChange('experiences', 'categories', next);
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Description</label>
                        <input
                          type="text"
                          value={cat.description}
                          onChange={(e) => {
                            const next = [...(settings.experiences?.categories || [])];
                            next[idx] = { ...next[idx], description: e.target.value };
                            handleFieldChange('experiences', 'categories', next);
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <ImageInput
                      label="CATEGORY PHOTO"
                      value={cat.image || ''}
                      onSave={(url) => {
                        const next = [...(settings.experiences?.categories || [])];
                        next[idx] = { ...next[idx], image: url };
                        handleFieldChange('experiences', 'categories', next);
                      }}
                      storagePath={`homepage/experiences/${idx}`}
                      aspectClass="aspect-16/9"
                      helpText="Landscape photo representing this travel experience category."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: CUSTOMER STORIES */}
          {activeTab === 'STORIES' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FEATURED CUSTOMER STORIES</h4>
                <p className="text-xs text-slate-500 font-medium">Select published customer stories featured on the homepage.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50">
                {stories
                  .filter((s) => s.status === 'PUBLISHED')
                  .map((story) => {
                    const currentIds = settings.customerStories?.storyIds || settings.featuredStoryIds || [];
                    const isSelected = currentIds.includes(story.id);
                    return (
                      <div
                        key={story.id}
                        onClick={() => {
                          const next = isSelected
                            ? currentIds.filter((id) => id !== story.id)
                            : [...currentIds, story.id];
                          handleFieldChange('customerStories', 'storyIds', next);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-[#121212] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-md bg-slate-200 overflow-hidden shrink-0">
                            {story.coverImage && (
                              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-brand font-black text-xs text-slate-900">{story.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{story.customerName}</p>
                          </div>
                        </div>

                        <span
                          className={`size-6 rounded-md flex items-center justify-center font-black text-xs ${
                            isSelected ? 'bg-[#121212] text-[#F4BF4B]' : 'border border-slate-300 text-slate-400'
                          }`}
                        >
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section 7: WHY CHOOSE US */}
          {activeTab === 'WHY_US' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">WHY TRAVEL WITH US</h4>
                <p className="text-xs text-slate-500 font-medium">Manage brand philosophy feature points on the homepage.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Section Label</label>
                  <input
                    type="text"
                    value={settings.whyUs?.sectionLabel || ''}
                    onChange={(e) => handleFieldChange('whyUs', 'sectionLabel', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Heading</label>
                  <input
                    type="text"
                    value={settings.whyUs?.heading || ''}
                    onChange={(e) => handleFieldChange('whyUs', 'heading', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {(settings.whyUs?.features || []).map((feat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Feature {idx + 1} Title</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const next = [...(settings.whyUs?.features || [])];
                          next[idx] = { ...next[idx], title: e.target.value };
                          handleFieldChange('whyUs', 'features', next);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Feature {idx + 1} Description</label>
                      <input
                        type="text"
                        value={feat.description}
                        onChange={(e) => {
                          const next = [...(settings.whyUs?.features || [])];
                          next[idx] = { ...next[idx], description: e.target.value };
                          handleFieldChange('whyUs', 'features', next);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: PLANNING CTA */}
          {activeTab === 'PLANNING_CTA' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">FINAL PLANNING CTA SECTION</h4>
                <p className="text-xs text-slate-500 font-medium">Manage the closing enquiry call-to-action on the homepage.</p>
              </div>

              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={settings.planningCta?.heading || ''}
                  onChange={(e) => handleFieldChange('planningCta', 'heading', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description Narrative</label>
                <textarea
                  value={settings.planningCta?.description || ''}
                  onChange={(e) => handleFieldChange('planningCta', 'description', e.target.value)}
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Primary CTA Button Label</label>
                  <input
                    type="text"
                    value={settings.planningCta?.primaryBtnLabel || 'ENQUIRE NOW'}
                    onChange={(e) => handleFieldChange('planningCta', 'primaryBtnLabel', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary CTA Button Label</label>
                  <input
                    type="text"
                    value={settings.planningCta?.secondaryBtnLabel || 'EXPLORE JOURNEYS'}
                    onChange={(e) => handleFieldChange('planningCta', 'secondaryBtnLabel', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 9: SEO & VISIBILITY */}
          {activeTab === 'SEO' && (
            <div className="space-y-4">
              <AdminSEOEditor
                seo={settings.seo || {}}
                onChange={(updatedSeo) => {
                  setSettings((prev) => ({ ...prev, seo: updatedSeo }));
                  setIsDirty(true);
                }}
                fallbackTitle="Luxury Travel & Bespoke Expeditions"
                fallbackDescription={settings.hero?.description || settings.introduction?.description || ''}
                fallbackImage={settings.hero?.heroImage || settings.heroImage}
                slug=""
                baseRoute=""
                contentTypeLabel="Homepage"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hero Hide Confirmation Modal */}
      {heroHideConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-2 border-slate-900 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase text-slate-900">Hide Hero Banner?</h3>
            </div>
            <p className="text-xs font-medium text-slate-600">
              Hiding the homepage hero section will remove the top banner from public view.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setHeroHideConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
              >
                KEEP HERO
              </button>
              <button
                onClick={() => {
                  handleFieldChange('hero', 'enabled', false);
                  setHeroHideConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-700 transition-colors cursor-pointer"
              >
                HIDE HERO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};