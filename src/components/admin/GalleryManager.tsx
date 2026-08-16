import React, { useState } from 'react';
import {
  Plus, Upload, Link, X, Eye, ChevronLeft, ChevronRight,
  AlertTriangle, Image as ImageIcon, Sparkles, Star, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAdminDialog } from './AdminDialogContext';
import {
  isDuplicateImage, reorderGalleryItem, removeGalleryItem,
  addGalleryItem, replaceGalleryItem, isValidImageUrl
} from '../../utils/mediaHelpers';

interface GalleryManagerProps {
  gallery: string[];
  onChange: (updatedGallery: string[]) => void;
  storagePath?: string;
  label?: string;
  helpText?: string;
  onUseAsCover?: (url: string) => void;
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({
  gallery = [],
  onChange,
  storagePath = 'gallery',
  label = 'PHOTO GALLERY',
  helpText = 'Add and reorder photography for this gallery.',
  onUseAsCover,
}) => {
  const { confirm, toast } = useAdminDialog();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');

  // Preview / Lightbox Modal State
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Replace Modal State
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const cleanGallery = Array.isArray(gallery) ? gallery.filter(Boolean) : [];

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) return;

    if (!isValidImageUrl(clean)) {
      setError('Please enter a valid web photo URL (starting with https:// or http://)');
      return;
    }

    if (isDuplicateImage(cleanGallery, clean)) {
      setDuplicateWarning('This photo is already in this gallery.');
      return;
    }

    setError('');
    setDuplicateWarning('');
    onChange(addGalleryItem(cleanGallery, clean));
    setUrlInput('');
    setShowAddForm(false);
    toast("Photo added to gallery.", "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetReplaceIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid photo file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size should be less than 5 MB.');
      return;
    }

    setUploading(true);
    setError('');
    setDuplicateWarning('');

    try {
      const { uploadImage } = await import('../../services/firebaseService');
      const url = await uploadImage(file, storagePath);

      if (typeof targetReplaceIndex === 'number') {
        onChange(replaceGalleryItem(cleanGallery, targetReplaceIndex, url));
        setReplacingIndex(null);
        toast("Photo replaced.", "success");
      } else {
        onChange(addGalleryItem(cleanGallery, url));
        setShowAddForm(false);
        toast("Photo added to gallery.", "success");
      }
    } catch (err: any) {
      const friendlyMsg = "Couldn't upload this photo. Please try again.";
      setError(friendlyMsg);
      toast(friendlyMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cleanGallery.length) return;
    const reordered = reorderGalleryItem(cleanGallery, index, targetIdx);
    onChange(reordered);
  };

  const handleRemove = (index: number) => {
    confirm({
      title: "Remove Gallery Photo",
      message: `Remove photo #${index + 1} from this gallery?`,
      type: "danger",
      confirmText: "REMOVE PHOTO",
      cancelText: "KEEP PHOTO",
      onConfirm: () => {
        const updated = removeGalleryItem(cleanGallery, index);
        onChange(updated);
        toast("Photo removed.", "info");
      },
    });
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-left">
      {/* Header with Title & Add Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={14} className="text-slate-700" />
            {label} ({cleanGallery.length})
          </h4>
          {helpText && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{helpText}</p>}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setError('');
            setDuplicateWarning('');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          aria-label={showAddForm ? 'Cancel adding photo' : 'Add photo to gallery'}
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          <span>{showAddForm ? 'CANCEL' : 'ADD PHOTO'}</span>
        </button>
      </div>

      {/* Add Photo Panel */}
      {showAddForm && (
        <div className="p-4 bg-white border-2 border-slate-900 rounded-xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900">Add New Photo</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => { setAddMode('upload'); setError(''); setDuplicateWarning(''); }}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-all ${
                  addMode === 'upload' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Upload photo mode"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => { setAddMode('url'); setError(''); setDuplicateWarning(''); }}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-all ${
                  addMode === 'url' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-slate-600 hover:text-slate-900'
                }`}
                aria-label="Image URL mode"
              >
                URL
              </button>
            </div>
          </div>

          {addMode === 'url' ? (
            <form onSubmit={handleAddUrl} className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError('');
                  setDuplicateWarning('');
                }}
                placeholder="https://images.unsplash.com/..."
                className="saas-input flex-1 text-xs font-sans text-slate-900"
                aria-label="New gallery photo URL"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Add photo URL button"
              >
                ADD
              </button>
            </form>
          ) : (
            <label
              className={`block border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50 ${
                uploading ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e)}
                disabled={uploading}
                className="hidden"
                aria-label="Upload gallery photo file"
              />
              <div className="flex flex-col items-center gap-1.5">
                {uploading ? (
                  <>
                    <Loader2 size={20} className="text-slate-700 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">Uploading photo…</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-700">Click to select photo</span>
                    <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WebP (up to 5 MB)</span>
                  </>
                )}
              </div>
            </label>
          )}

          {error && (
            <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <AlertTriangle size={13} /> {error}
            </p>
          )}

          {duplicateWarning && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center justify-between">
              <span>{duplicateWarning}</span>
              <button
                type="button"
                onClick={() => {
                  onChange(addGalleryItem(cleanGallery, urlInput.trim()));
                  setUrlInput('');
                  setDuplicateWarning('');
                  setShowAddForm(false);
                  toast("Photo added to gallery.", "success");
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] uppercase cursor-pointer"
                aria-label="Add duplicate photo anyway"
              >
                Add Anyway
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Grid or Empty State */}
      {cleanGallery.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-1.5">
          <ImageIcon size={28} className="mx-auto text-slate-300" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No gallery photos added yet.</p>
          <p className="text-[11px] text-slate-400 font-medium">Click "ADD PHOTO" above to add photography.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
          {cleanGallery.map((imgUrl, idx) => (
            <div
              key={`${imgUrl}-${idx}`}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-xs hover:border-slate-900 transition-all flex flex-col"
            >
              {/* Photo position badge */}
              <div className="absolute top-2 left-2 z-10 bg-slate-950/80 text-[#F4BF4B] px-2 py-0.5 rounded-md font-mono text-[10px] font-black shadow-xs">
                #{idx + 1}
              </div>

              {/* Photo Image with Error Fallback */}
              <img
                src={imgUrl}
                alt={`Gallery photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  const fallbackEl = e.currentTarget.parentElement?.querySelector('.gallery-broken-fallback') as HTMLElement;
                  if (fallbackEl) fallbackEl.style.display = 'flex';
                }}
              />

              {/* Broken Fallback Placeholder (hidden by default) */}
              <div className="gallery-broken-fallback hidden w-full h-full flex-col items-center justify-center p-3 bg-slate-100 text-slate-500 text-center space-y-1">
                <AlertTriangle size={18} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase text-slate-700">Photo unavailable</span>
              </div>

              {/* Overlay Action Bar on Hover */}
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 z-20">
                {/* Top Action Row: Reorder & Lightbox */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'UP')}
                      disabled={idx === 0}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md disabled:opacity-20 cursor-pointer transition-colors"
                      aria-label={`Move photo ${idx + 1} left`}
                      title="Move Left / Earlier"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'DOWN')}
                      disabled={idx === cleanGallery.length - 1}
                      className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md disabled:opacity-20 cursor-pointer transition-colors"
                      aria-label={`Move photo ${idx + 1} right`}
                      title="Move Right / Later"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewIndex(idx)}
                    className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md cursor-pointer transition-colors"
                    aria-label={`Preview full photo ${idx + 1}`}
                    title="Preview Full Photo"
                  >
                    <Eye size={14} />
                  </button>
                </div>

                {/* Bottom Action Row: Use as Cover & Remove */}
                <div className="space-y-1 pt-1">
                  {onUseAsCover && (
                    <button
                      type="button"
                      onClick={() => {
                        onUseAsCover(imgUrl);
                        toast("Set as cover photo.", "success");
                      }}
                      className="w-full py-1 bg-white/90 hover:bg-white text-slate-900 font-bold text-[9px] uppercase tracking-wider rounded flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      aria-label={`Use photo ${idx + 1} as cover photo`}
                      title="Use as Cover Photo"
                    >
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      <span>Use as Cover</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <label className="flex-1 py-1 bg-slate-700 hover:bg-slate-600 text-white font-bold text-[9px] uppercase tracking-wider rounded flex items-center justify-center cursor-pointer text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, idx)}
                        className="hidden"
                        aria-label={`Replace photo ${idx + 1}`}
                      />
                      Replace
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition-colors"
                      aria-label={`Remove photo ${idx + 1}`}
                      title="Remove Photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Enlarged Preview Modal */}
      {previewIndex !== null && cleanGallery[previewIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewIndex(null)}
          role="dialog"
          aria-label="Full gallery photo preview"
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[#F4BF4B]" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Gallery Photo {previewIndex + 1} of {cleanGallery.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onUseAsCover && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseAsCover(cleanGallery[previewIndex]);
                      toast("Set as cover photo.", "success");
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer"
                    aria-label="Set current photo as cover photo"
                  >
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    Set as Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewIndex(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative max-h-[75vh] flex items-center justify-center bg-black/50 p-2 overflow-hidden">
              <img
                src={cleanGallery[previewIndex]}
                alt={`Full preview photo ${previewIndex + 1}`}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />

              {/* Lightbox Navigation Buttons */}
              {cleanGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev! > 0 ? prev! - 1 : cleanGallery.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow-lg cursor-pointer"
                    aria-label="Previous photo in lightbox"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev! < cleanGallery.length - 1 ? prev! + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow-lg cursor-pointer"
                    aria-label="Next photo in lightbox"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
