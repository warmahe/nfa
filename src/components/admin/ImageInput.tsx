import React, { useState } from 'react';
import { Upload, Link, X, Loader2 } from 'lucide-react';
import { useAdminDialog } from './AdminDialogContext';

interface ImageInputProps {
  label: string;
  value: string;
  onSave: (url: string) => void;
  storagePath?: string;
  aspectClass?: string;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onSave,
  storagePath = 'general',
  aspectClass = 'aspect-video'
}) => {
  const { confirm, toast } = useAdminDialog();
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onSave(urlInput.trim());
    toast("Image URL updated.", "success");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { uploadImage } = await import('../../services/firebaseService');
      const url = await uploadImage(file, storagePath);
      onSave(url);
      setUrlInput(url);
      toast("Image uploaded successfully.", "success");
    } catch (err: any) {
      setError(err.message || 'Error uploading image');
      toast("Error uploading image: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 text-[10px] font-semibold flex items-center gap-1 transition-all rounded-sm cursor-pointer ${mode === 'url' ? 'bg-[#121212] text-[#F4BF4B] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Link size={12} /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-[10px] font-semibold flex items-center gap-1 transition-all rounded-sm cursor-pointer ${mode === 'upload' ? 'bg-[#121212] text-[#F4BF4B] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Upload size={12} /> Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="saas-input flex-1 text-xs font-sans text-slate-900"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-[#121212] text-[#F4BF4B] font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </form>
      ) : (
        <label className={`block border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-1.5">
            <Upload size={18} className="text-slate-400" />
            {uploading ? (
              <span className="text-xs font-semibold text-slate-800">Compressing & Uploading…</span>
            ) : (
              <span className="text-xs font-medium text-slate-600">Click to select image</span>
            )}
          </div>
        </label>
      )}

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      {(value || urlInput) && (
        <div className={`relative rounded-lg border border-slate-200/80 overflow-hidden ${aspectClass}`}>
          <img src={value || urlInput} alt={label} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          <button
            type="button"
            onClick={() => { 
              confirm({
                title: "Delete Asset Image",
                message: "Are you sure you want to delete this image asset?",
                type: "danger",
                confirmText: "Delete Asset",
                onConfirm: async () => {
                  const imgUrl = value || urlInput;
                  if (imgUrl.includes('firebasestorage.googleapis.com')) {
                    try {
                      const { deleteImage } = await import('../../services/firebaseService');
                      await deleteImage(imgUrl);
                    } catch (e) {
                      console.error("Cleanup failed:", e);
                    }
                  }
                  onSave(''); 
                  setUrlInput(''); 
                  toast("Image asset removed.", "info");
                }
              });
            }}
            className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-md hover:bg-rose-700 transition-colors shadow-md flex items-center justify-center cursor-pointer"
            title="Remove asset"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
