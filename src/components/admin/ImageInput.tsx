import React, { useState } from 'react';
import { Upload, Link, Loader2, X } from 'lucide-react';
import { uploadAndReplaceImage } from '../../services/firebaseService';

interface ImageInputProps {
  label: string;
  value: string;
  storagePath: string; // e.g. 'packages/iceland/thumbnail'
  onSave: (url: string) => void;
  aspectClass?: string; // e.g. 'aspect-video' | 'aspect-square'
  oldUrl?: string;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  storagePath,
  onSave,
  aspectClass = 'aspect-video',
  oldUrl,
}) => {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUrlCommit = () => {
    const trimmed = urlInput.trim();
    if (trimmed) onSave(trimmed);
    setError('');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploadAndReplaceImage(file, storagePath, oldUrl || value || null);
      onSave(url);
      setUrlInput(url);
    } catch (err: any) {
      setError('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60">{label}</label>
        <div className="flex rounded-[10px] overflow-hidden border-2 border-[#121212]/15 bg-[#FCFBF7]">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${mode === 'url' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-[#121212]/70 hover:bg-[#121212]/10'}`}
          >
            <Link size={11} /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${mode === 'upload' ? 'bg-[#121212] text-[#F4BF4B]' : 'text-[#121212]/70 hover:bg-[#121212]/10'}`}
          >
            <Upload size={11} /> Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onBlur={handleUrlCommit}
            onKeyDown={e => e.key === 'Enter' && handleUrlCommit()}
            placeholder="https://..."
            className="flex-1 px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 text-xs font-bold text-[#121212] transition-all"
          />
          <button
            type="button"
            onClick={handleUrlCommit}
            className="px-4 py-3 rounded-[14px] bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all"
          >
            Set
          </button>
        </div>
      ) : (
        <label className="relative block border-2 border-dashed border-[#121212]/15 bg-white cursor-pointer hover:bg-[#F4BF4B]/5 hover:border-[#F4BF4B] rounded-[14px] transition-all">
          <div className="p-6 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-[#9E1B1D]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#121212]">Compressing & Uploading…</span>
              </>
            ) : (
              <>
                <Upload size={24} className="text-[#121212]/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#121212]/50">Click to select image</span>
                <span className="text-[9px] font-bold text-[#121212]/40">Auto-compressed to max 1200px · JPEG</span>
              </>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}

      {error && <p className="text-[10px] font-black text-[#9E1B1D] uppercase tracking-widest">{error}</p>}

      {(value || urlInput) && (
        <div className={`relative rounded-[14px] border-2 border-[#121212]/10 overflow-hidden ${aspectClass}`}>
          <img src={value || urlInput} alt={label} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          <button
            type="button"
            onClick={async () => { 
              if (!window.confirm("Delete this image? This action cannot be undone.")) return;
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
            }}
            className="absolute top-2 right-2 bg-[#9E1B1D] text-white p-2 rounded-[10px] hover:bg-[#121212] transition-all shadow-lg flex items-center justify-center"
            title="Remove and Delete asset"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
