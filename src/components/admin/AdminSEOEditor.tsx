import React, { useState } from 'react';
import {
  Search, Globe, Share2, Eye, AlertTriangle, Check, Info,
  Sparkles, Shield, Tag, X, Plus, ExternalLink
} from 'lucide-react';
import { ContentSEO } from '../../types/database';
import { ImageInput } from './ImageInput';
import { checkSEOReadiness, SEO_CONFIG } from '../../utils/seo';

interface AdminSEOEditorProps {
  seo?: ContentSEO;
  onChange: (updatedSeo: ContentSEO) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackImage?: string;
  slug?: string;
  baseRoute: string; // e.g. 'itinerary', 'destinations', 'stories'
  contentTypeLabel?: string; // 'Journey', 'Destination', 'Customer Story', 'Homepage'
}

export const AdminSEOEditor: React.FC<AdminSEOEditorProps> = ({
  seo = {},
  onChange,
  fallbackTitle,
  fallbackDescription,
  fallbackImage,
  slug = 'example-page',
  baseRoute,
  contentTypeLabel = 'Page',
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'search' | 'social'>('search');

  const resolvedTitle = (seo.title || fallbackTitle || SEO_CONFIG.site.title).trim();
  const resolvedDesc = (seo.description || fallbackDescription || SEO_CONFIG.site.description).trim();
  const resolvedSocialTitle = (seo.socialTitle || resolvedTitle).trim();
  const resolvedSocialDesc = (seo.socialDescription || resolvedDesc).trim();
  const resolvedImage = seo.socialImage || fallbackImage || SEO_CONFIG.site.image;

  const fullPublicUrl = `${SEO_CONFIG.site.url}${baseRoute ? `/${baseRoute}` : ''}/${slug}`;
  const displayUrl = seo.canonicalUrl || fullPublicUrl;

  const readiness = checkSEOReadiness(seo, fallbackTitle, fallbackDescription);

  const handleFieldChange = <K extends keyof ContentSEO>(key: K, value: ContentSEO[K]) => {
    onChange({ ...seo, [key]: value });
  };

  const handleAddKeyword = () => {
    const clean = newKeyword.trim();
    if (!clean) return;
    const current = seo.keywords || [];
    if (!current.includes(clean)) {
      handleFieldChange('keywords', [...current, clean]);
    }
    setNewKeyword('');
  };

  const handleRemoveKeyword = (idx: number) => {
    const current = [...(seo.keywords || [])];
    current.splice(idx, 1);
    handleFieldChange('keywords', current);
  };

  const titleLength = (seo.title || '').length;
  const descLength = (seo.description || '').length;

  const inputClass = 'saas-input w-full text-xs text-slate-900 font-sans focus:ring-2 focus:ring-[#121212] focus:border-transparent';
  const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1';

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-[#121212] text-[#F4BF4B] rounded-lg flex items-center justify-center shrink-0">
            <Search size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              SEO & SEARCH VISIBILITY
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Control how this {contentTypeLabel.toLowerCase()} appears on search engines and social sharing cards.
            </p>
          </div>
        </div>

        {/* Readiness Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-3 py-1 rounded-full font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
              readiness.isReady
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {readiness.isReady ? <Check size={12} /> : <AlertTriangle size={12} />}
            SEO {readiness.isReady ? 'Ready' : 'Needs Details'} ({readiness.score}%)
          </span>
        </div>
      </div>

      {/* Main Grid: Form Left, Previews Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Page Title */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className={labelClass}>SEO Title</label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  titleLength >= 40 && titleLength <= 60
                    ? 'text-emerald-700'
                    : titleLength > 60
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                {titleLength} / 60 characters
                {titleLength >= 40 && titleLength <= 60 && ' · Optimal'}
                {titleLength > 60 && ' · Longer than recommended'}
              </span>
            </div>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder={fallbackTitle ? `Default: ${fallbackTitle}` : 'e.g. Luxury Botswana Safari | NO FIXED ADDRESS'}
              className={inputClass}
              aria-label="SEO Page Title"
            />
            {!seo.title && fallbackTitle && (
              <p className="text-[10px] text-slate-500 font-medium italic">
                Using default: "{fallbackTitle} | NO FIXED ADDRESS"
              </p>
            )}
          </div>

          {/* Section 2: Page Description */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className={labelClass}>Page Meta Description</label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  descLength >= 120 && descLength <= 160
                    ? 'text-emerald-700'
                    : descLength > 160
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                {descLength} / 160 characters
                {descLength >= 120 && descLength <= 160 && ' · Optimal'}
                {descLength > 160 && ' · May be clipped'}
              </span>
            </div>
            <textarea
              value={seo.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder={fallbackDescription ? `Default: ${fallbackDescription.slice(0, 120)}…` : 'Compelling 2-line summary that invites travellers to click...'}
              rows={3}
              className={inputClass + ' resize-none'}
              aria-label="SEO Meta Description"
            />
            {!seo.description && fallbackDescription && (
              <p className="text-[10px] text-slate-500 font-medium italic">
                Using editorial summary fallback.
              </p>
            )}
          </div>

          {/* Section 3: Search Visibility */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <label className={labelClass}>Search Visibility</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFieldChange('noIndex', false)}
                className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                  seo.noIndex !== true
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
                aria-label="Make visible in search engines"
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} className={seo.noIndex !== true ? 'text-emerald-600' : 'text-slate-400'} />
                  <span className="text-xs font-bold uppercase">Visible in Search</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Search engines can discover and index this published page.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFieldChange('noIndex', true)}
                className={`p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                  seo.noIndex === true
                    ? 'border-amber-600 bg-amber-50/50 text-amber-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
                aria-label="Hide from search engines"
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className={seo.noIndex === true ? 'text-amber-600' : 'text-slate-400'} />
                  <span className="text-xs font-bold uppercase">Hide from Search</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Adds noindex directive. Page remains accessible only via direct link.
                </p>
              </button>
            </div>
          </div>

          {/* Section 4: Social Share Customization */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Share2 size={13} className="text-slate-700" />
              Social Sharing Customization (Optional)
            </h5>
            <p className="text-[11px] text-slate-500 font-medium">
              Customizes how this page appears when shared on WhatsApp, iMessage, LinkedIn, or Facebook.
            </p>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Social Title (Optional)</label>
                <input
                  type="text"
                  value={seo.socialTitle || ''}
                  onChange={(e) => handleFieldChange('socialTitle', e.target.value)}
                  placeholder={resolvedTitle}
                  className={inputClass}
                  aria-label="Social Share Title"
                />
              </div>

              <div>
                <label className={labelClass}>Social Description (Optional)</label>
                <input
                  type="text"
                  value={seo.socialDescription || ''}
                  onChange={(e) => handleFieldChange('socialDescription', e.target.value)}
                  placeholder={resolvedDesc.slice(0, 100)}
                  className={inputClass}
                  aria-label="Social Share Description"
                />
              </div>

              <ImageInput
                label="SOCIAL SHARE PHOTO (1200 × 630 RECOMMENDED)"
                value={seo.socialImage || ''}
                onSave={(url) => handleFieldChange('socialImage', url)}
                storagePath="seo/social"
                aspectClass="aspect-1200/630"
                helpText="High-resolution landscape image displayed on link preview cards."
              />
            </div>
          </div>

          {/* Section 5: Canonical URL & Search Keywords */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className={labelClass}>Custom Canonical Page Address (Optional)</label>
              <input
                type="text"
                value={seo.canonicalUrl || ''}
                onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                placeholder={fullPublicUrl}
                className={inputClass}
                aria-label="Custom Canonical URL"
              />
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Defaults automatically to: {fullPublicUrl}
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label className={labelClass}>Search Keywords (Optional)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Add keyword (e.g. Safari, Botswana, Luxury Camp)"
                  className={inputClass}
                  aria-label="Add search keyword"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3.5 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg cursor-pointer shrink-0"
                  aria-label="Add keyword button"
                >
                  ADD
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(seo.keywords || []).map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-800 flex items-center gap-1.5"
                  >
                    <Tag size={11} className="text-slate-400" />
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="hover:text-rose-600 cursor-pointer"
                      aria-label={`Remove keyword ${kw}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Previews & Recommendations (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Eye size={14} className="text-slate-700" />
                Live Previews
              </span>
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('search')}
                  className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded cursor-pointer transition-all ${
                    activePreviewTab === 'search' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-slate-600'
                  }`}
                  aria-label="Switch to Search Preview"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('social')}
                  className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded cursor-pointer transition-all ${
                    activePreviewTab === 'social' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-slate-600'
                  }`}
                  aria-label="Switch to Social Preview"
                >
                  Social
                </button>
              </div>
            </div>

            {/* Google Search Result Preview */}
            {activePreviewTab === 'search' ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5 font-sans">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-slate-900 text-[#F4BF4B] text-[9px] font-black flex items-center justify-center">
                    NFA
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-900 leading-tight">NO FIXED ADDRESS</p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[240px] leading-tight">{displayUrl}</p>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-tight pt-1">
                  {resolvedTitle}
                </h4>

                <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                  {resolvedDesc}
                </p>

                {seo.noIndex === true && (
                  <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <Shield size={11} className="text-amber-600" />
                    Hidden from search results (noindex directive active)
                  </div>
                )}
              </div>
            ) : (
              /* Social Sharing Card Preview */
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                <div className="aspect-1200/630 bg-slate-900 relative overflow-hidden">
                  <img
                    src={resolvedImage}
                    alt={resolvedSocialTitle}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-[#121212]/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                    nofixedaddress.travel
                  </div>
                </div>
                <div className="p-3.5 space-y-1 bg-slate-50 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    NO FIXED ADDRESS
                  </p>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">
                    {resolvedSocialTitle}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {resolvedSocialDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-600" />
              SEO Recommendations
            </h5>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                {readiness.titleStatus === 'optimal' ? (
                  <Check size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                )}
                <span className={readiness.titleStatus === 'optimal' ? 'text-slate-700' : 'text-amber-900 font-medium'}>
                  Page title length ({titleLength}/60)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {readiness.descStatus === 'optimal' ? (
                  <Check size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                )}
                <span className={readiness.descStatus === 'optimal' ? 'text-slate-700' : 'text-amber-900 font-medium'}>
                  Page meta description ({descLength}/160)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {readiness.hasSocialImage ? (
                  <Check size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <Info size={14} className="text-slate-400 shrink-0" />
                )}
                <span className="text-slate-700">
                  {readiness.hasSocialImage ? 'Custom social image configured' : 'Using cover photo fallback'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {readiness.isIndexable ? (
                  <Check size={14} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                )}
                <span className={readiness.isIndexable ? 'text-slate-700' : 'text-amber-900 font-medium'}>
                  {readiness.isIndexable ? 'Indexable in search' : 'Hidden from search (noindex)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
