import React, { useState, useEffect } from 'react';
import { Upload, Link, X, Loader2, Eye, AlertTriangle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useAdminDialog } from './AdminDialogContext';
import { isValidImageUrl } from '../../utils/mediaHelpers';

interface ImageInputProps {
  label: string;
  value: string;
  onSave: (url: string) => void;
  storagePath?: string;
  aspectClass?: string;
  removeWarningMessage?: string;
  helpText?: string;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onSave,
  storagePath = 'general',
  aspectClass = 'aspect-video',
  removeWarningMessage,
  helpText
}) => {
  const { confirm, toast } = useAdminDialog();
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Sync internal URL when value prop changes
  useEffect(() => {
    setUrlInput(value || '');
    setImageLoadError(false);
  }, [value]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    if (!isValidImageUrl(cleanUrl)) {
      setError('Please enter a valid web photo URL (starting with https:// or http://)');
      return;
    }

    setError('');
    setImageLoadError(false);
    onSave(cleanUrl);
    toast("Photo URL updated.", "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input value so same file can be re-selected if needed
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
    setImageLoadError(false);

    try {
      const { uploadImage } = await import('../../services/firebaseService');
      const url = await uploadImage(file, storagePath);
      onSave(url);
      setUrlInput(url);
      toast("Photo uploaded successfully.", "success");
    } catch (err: any) {
      const friendlyMsg = "Couldn't upload this photo. Please try again.";
      setError(friendlyMsg);
      toast(friendlyMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    const message =
      removeWarningMessage ||
      (label.toLowerCase().includes('cover')
        ? "Removing this cover photo will leave this item without a primary visual. Remove photo?"
        : "Are you sure you want to remove this photo?");

    confirm({
      title: "Remove Photo",
      message,
      type: "danger",
      confirmText: "REMOVE PHOTO",
      cancelText: "KEEP PHOTO",
      onConfirm: async () => {
        const imgUrl = value || urlInput;
        // Optional safe storage cleanup
        if (imgUrl && imgUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const { deleteImage } = await import('../../services/firebaseService');
            await deleteImage(imgUrl);
          } catch (e) {
            console.warn("Storage cleanup note:", e);
          }
        }
        onSave('');
        setUrlInput('');
        setImageLoadError(false);
        toast("Photo removed.", "info");
      }
    });
  };

  const currentDisplayUrl = value || urlInput;
  const hasImage = Boolean(currentDisplayUrl && currentDisplayUrl.trim().length > 0);

  return (
    <div className="space-y-2.5 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ImageIcon size={13} className="text-slate-600" />
            {label}
          </label>
          {helpText && <p className="text-[11px] text-slate-500 font-medium">{helpText}</p>}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => { setMode('upload'); setError(''); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md cursor-pointer ${
              mode === 'upload' ? 'bg-[#121212] text-[#F4BF4B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Switch to upload mode"
          >
            <Upload size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => { setMode('url'); setError(''); }}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all rounded-md cursor-pointer ${
              mode === 'url' ? 'bg-[#121212] text-[#F4BF4B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Switch to URL input mode"
          >
            <Link size={12} /> URL
          </button>
        </div>
      </div>

      {/* Mode Controls */}
      {mode === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setError('');
            }}
            placeholder="https://images.unsplash.com/..."
            className="saas-input flex-1 text-xs font-sans text-slate-900"
            aria-label={`Image URL for ${label}`}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Apply photo URL"
          >
            APPLY
          </button>
        </form>
      ) : (
        <label
          className={`block border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-slate-100/60 ${
            uploading ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            aria-label={`Upload photo for ${label}`}
          />
          <div className="flex flex-col items-center gap-1.5">
            {uploading ? (
              <>
                <Loader2 size={20} className="text-slate-700 animate-spin" />
                <span className="text-xs font-bold text-slate-800">Uploading photo…</span>
              </>
            ) : (
              <>
                <Upload size={18} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Click to select photo</span>
                <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WebP (up to 5 MB)</span>
              </>
            )}
          </div>
        </label>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Preview & Actions */}
      {hasImage && (
        <div className="space-y-2">
          <div className={`relative rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-950 group ${aspectClass}`}>
            {!imageLoadError ? (
              <img
                src={currentDisplayUrl}
                alt={label}
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                onError={() => setImageLoadError(true)}
                loading="lazy"
              />
            ) : (
              /* Broken Image Fallback */
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-500 space-y-2">
                <AlertTriangle size={24} className="text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Photo unavailable</span>
                <span className="text-[10px] text-slate-500 font-medium text-center">
                  The photo link could not be loaded. Please replace it with a valid photo.
                </span>
              </div>
            )}

            {/* Overlay Action Buttons */}
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
              {!imageLoadError && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-1.5 bg-white/90 text-slate-900 hover:bg-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  aria-label={`Preview full photo for ${label}`}
                  title="Preview full photo"
                >
                  <Eye size={13} /> Preview
                </button>
              )}

              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                aria-label={`Remove photo for ${label}`}
                title="Remove photo"
              >
                <X size={13} /> Remove
              </button>
            </div>
          </div>

          {/* Quick status line */}
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 px-1">
            <span className="truncate max-w-xs sm:max-w-md">{currentDisplayUrl}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider cursor-pointer ml-2"
              aria-label={`Remove ${label}`}
            >
              Remove Photo
            </button>
          </div>
        </div>
      )}

      {/* Lightbox / Enlarged Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
          role="dialog"
          aria-label={`Full photo preview for ${label}`}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[#F4BF4B]" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">{label} — Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center bg-black/50 p-2 overflow-hidden">
              <img
                src={currentDisplayUrl}
                alt={label}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
