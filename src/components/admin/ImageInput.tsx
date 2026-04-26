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
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
        <div className="flex border-2 border-[#121212]">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${mode === 'url' ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-white text-[#121212] hover:bg-gray-100'}`}
          >
            <Link size={10} /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${mode === 'upload' ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-white text-[#121212] hover:bg-gray-100'}`}
          >
            <Upload size={10} /> Upload
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
            className="flex-1 p-3 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] text-xs font-bold transition-colors"
          />
          <button
            type="button"
            onClick={handleUrlCommit}
            className="px-4 bg-[#121212] text-[#F4BF4B] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] transition-colors border-2 border-[#121212]"
          >
            Set
          </button>
        </div>
      ) : (
        <label className={`relative block border-4 border-dashed border-[#121212] bg-white cursor-pointer hover:bg-[#F4BF4B]/10 transition-colors`}>
          <div className="p-6 flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <>
                <Loader2 size={24} className="animate-spin text-[#9E1B1D]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Compressing & Uploading…</span>
              </>
            ) : (
              <>
                <Upload size={24} className="text-[#121212]/40" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#121212]/60">Click to select image</span>
                <span className="text-[9px] font-bold text-gray-400">Auto-compressed to max 1200px · JPEG</span>
              </>
            )}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}

      {error && <p className="text-[10px] font-black text-[#9E1B1D] uppercase tracking-widest">{error}</p>}

      {(value || urlInput) && (
        <div className={`relative border-2 border-[#121212] overflow-hidden ${aspectClass}`}>
          <img src={value || urlInput} alt={label} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
          <button
            type="button"
            onClick={async () => { 
              if (!window.confirm("PERMANENT DELETE: Are you sure you want to delete this asset from the database?")) return;
              const imgUrl = value || urlInput;
              if (imgUrl.includes('firebasestorage.googleapis.com')) {
                try {
                  const { deleteFile } = await import('../../services/firebaseService');
                  await deleteFile(imgUrl);
                } catch (e) {
                  console.error("Cleanup failed:", e);
                }
              }
              onSave(''); 
              setUrlInput(''); 
            }}
            className="absolute top-2 right-2 bg-[#9E1B1D] text-white p-2 hover:bg-black transition-all shadow-lg flex items-center justify-center"
            title="Remove and Delete asset"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
