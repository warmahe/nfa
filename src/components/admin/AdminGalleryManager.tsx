import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Loader2, Check, AlertCircle, ArrowLeft, Plus, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadAndReplaceImage, deleteImage } from '../../services/firebaseService';
import { Notification } from '../shared/Notification';

export const AdminGalleryManager = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI States
  const [activeFolderIdx, setActiveFolderIdx] = useState<number | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [notification, setNotification] = useState<{text: string, type: 'error' | 'success'} | null>(null);
  
  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    type: 'folder' | 'image';
    fIdx: number;
    imgIdx?: number;
  }>({ show: false, type: 'folder', fIdx: -1 });

  useEffect(() => { loadGallery(); }, []);

  const triggerNotify = (text: string, type: 'error' | 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadGallery = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'gallery'));
      if (docSnap.exists()) setFolders(docSnap.data().items || []);
    } finally { setLoading(false); }
  };

  // --- THE ONLY SAVE FUNCTION ---
  const handleGlobalSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'gallery'), { items: folders });
      triggerNotify("All changes saved successfully.", "success");
    } catch (err: any) {
      triggerNotify("Save failed. Please check your connection.", "error");
    } finally { setSaving(false); }
  };

  // --- DELETE LOGIC (WITH STORAGE PURGE) ---
  const handleConfirmDelete = async () => {
    const { type, fIdx, imgIdx } = confirmDelete;
    const newFolders = [...folders];

    try {
      if (type === 'folder') {
        const folder = newFolders[fIdx];
        if (folder.url) await deleteImage(folder.url);
        if (folder.images) {
          for (const img of folder.images) if (img.url) await deleteImage(img.url);
        }
        newFolders.splice(fIdx, 1);
        setActiveFolderIdx(null);
      } else if (type === 'image' && imgIdx !== undefined) {
        const img = newFolders[fIdx].images[imgIdx];
        if (img.url) await deleteImage(img.url);
        newFolders[fIdx].images.splice(imgIdx, 1);
      }

      setFolders(newFolders);
      triggerNotify("File deleted. Click save to finalize changes.", "success");
    } catch (err) {
      triggerNotify("Delete failed. Please try again.", "error");
    } finally {
      setConfirmDelete({ show: false, type: 'folder', fIdx: -1 });
    }
  };

  // --- UPLOAD HELPERS ---
  const onUpload = async (fIdx: number, imgIdx: number | null, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(imgIdx === null ? -99 : imgIdx); // -99 is cover
    const newFolders = [...folders];
    const oldUrl = imgIdx === null ? newFolders[fIdx].url : newFolders[fIdx].images[imgIdx].url;

    try {
      const url = await uploadAndReplaceImage(file, `gallery/${newFolders[fIdx].title || 'temp'}`, oldUrl);
      if (imgIdx === null) newFolders[fIdx].url = url;
      else newFolders[fIdx].images[imgIdx].url = url;
      
      setFolders(newFolders);
      triggerNotify("File ready. Click save to upload.", "success");
    } catch (err) { triggerNotify("Upload failed. Please try again.", "error"); }
    finally { setUploadingIdx(null); }
  };

  const addFolder = () => {
    setFolders([...folders, { 
      id: Date.now().toString(), 
      url: '', 
      title: '', 
      destination: '', 
      images: []
    }]);
  };

  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-black text-[11px] uppercase tracking-widest text-[#121212] transition-all";

  if (loading) return <div className="p-10 font-black uppercase text-[#121212]/20 tracking-widest text-sm">Loading Archive...</div>;

  return (
    <div className="space-y-6 relative">
      {notification && <Notification text={notification.text} type={notification.type} />}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[2000] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] p-6 lg:p-8 max-w-sm w-full shadow-[0_24px_48px_rgba(18,18,18,0.15)]">
            <h3 className="font-brand font-black text-xl uppercase tracking-tight text-[#121212] mb-2">Are you sure?</h3>
            <p className="font-bold text-[10px] uppercase tracking-widest text-[#121212]/50 mb-6 pb-4 border-b-2 border-[#121212]/10">
              This will permanently delete the file from your cloud storage.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleConfirmDelete} className="rounded-[14px] bg-[#9E1B1D] text-white py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] transition-colors">Yes, Delete</button>
              <button onClick={() => setConfirmDelete({show:false, type:'folder', fIdx:-1})} className="rounded-[14px] border-2 border-[#121212]/10 text-[#121212] py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#121212]/5 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {activeFolderIdx !== null && (
            <button onClick={() => setActiveFolderIdx(null)} className="p-3 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 transition-colors"><ArrowLeft size={20}/></button>
          )}
          <div>
            <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
              {activeFolderIdx !== null ? `${folders[activeFolderIdx].title} // Files` : 'Gallery Archive'}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1">Manage visual assets</p>
          </div>
        </div>
        <button onClick={handleGlobalSave} disabled={saving} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* VIEW 1: INSIDE FOLDER */}
      {activeFolderIdx !== null ? (
        <div className="space-y-6">
          <button onClick={() => {
            const nf = [...folders];
            nf[activeFolderIdx].images = [...(nf[activeFolderIdx].images || []), { id: Date.now().toString(), url: '', title: '', photographer: '' }];
            setFolders(nf);
          }} className="w-full py-8 rounded-[18px] border-2 border-dashed border-[#121212]/10 bg-white font-black text-[11px] uppercase tracking-widest text-[#121212]/40 hover:bg-[#F4BF4B]/10 hover:border-[#F4BF4B] transition-all">+ Add New Photo</button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders[activeFolderIdx].images?.map((img: any, imgIdx: number) => (
              <div key={img.id} className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-4 flex flex-col">
                <div className="aspect-square bg-[#FCFBF7] relative rounded-[14px] border-2 border-[#121212]/10 overflow-hidden mb-4">
                  {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[10px] font-black text-[#121212]/15 uppercase tracking-widest">No Data</div>}
                  {uploadingIdx === imgIdx && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="block rounded-[12px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 text-[#121212] py-3 text-center text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors mb-3">
                  Upload File <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(activeFolderIdx, imgIdx, e)} />
                </label>
                <input className={inputClass + " mb-2"} placeholder="Photo Title" value={img.title} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].title = e.target.value; setFolders(nf); }} />
                <input className={inputClass + " mb-3"} placeholder="Photographer" value={img.photographer} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].photographer = e.target.value; setFolders(nf); }} />
                <button onClick={() => setConfirmDelete({ show: true, type: 'image', fIdx: activeFolderIdx, imgIdx })} className="w-full mt-auto rounded-[12px] bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white py-3 font-black text-[10px] uppercase tracking-widest transition-colors">Remove Slot</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: FOLDER LIST */
        <div className="space-y-6">
          <button onClick={addFolder} className="w-full py-10 rounded-[18px] border-2 border-dashed border-[#121212]/10 bg-white font-black text-sm uppercase tracking-widest text-[#121212]/30 hover:bg-[#F4BF4B]/10 hover:border-[#F4BF4B] transition-all">+ Create New Trip Archive</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map((f, fIdx) => (
              <div key={f.id} className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-5 flex flex-col">
                <div className="aspect-square bg-[#FCFBF7] rounded-[14px] border-2 border-[#121212]/10 mb-4 relative overflow-hidden">
                  {f.url ? <img src={f.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[10px] font-black text-[#121212]/15 text-center uppercase tracking-widest">Empty Folder</div>}
                  {uploadingIdx === -99 && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="rounded-[12px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 p-3 text-center text-[10px] font-black uppercase tracking-widest cursor-pointer mb-4 transition-colors">
                  Set Cover Image <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(fIdx, null, e)} />
                </label>
                <input className={inputClass + " mb-4"} placeholder="Trip Title" value={f.title} onChange={e => { const n = [...folders]; n[fIdx].title = e.target.value; setFolders(n); }} />
                <div className="space-y-2 mt-auto">
                   <button onClick={() => setActiveFolderIdx(fIdx)} className="w-full rounded-[12px] bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white py-3 font-black text-[10px] uppercase tracking-widest transition-colors">Manage Files ({f.images?.length || 0})</button>
                   <button onClick={() => setConfirmDelete({ show: true, type: 'folder', fIdx })} className="w-full rounded-[12px] border-2 border-[#9E1B1D]/20 text-[#9E1B1D] hover:bg-[#9E1B1D] hover:text-white py-3 font-black text-[10px] uppercase tracking-widest transition-colors">Delete Folder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};