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

  const inputClass = "saas-input w-full text-xs text-slate-900 font-sans";

  if (loading) return <div className="p-10 font-medium text-slate-400 text-xs uppercase tracking-wider text-center">Loading Archive...</div>;

  return (
    <div className="space-y-5 relative">
      {notification && <Notification text={notification.text} type={notification.type} />}

      {/* CONFIRMATION MODAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card bg-white p-6 max-w-sm w-full border-slate-200 shadow-xl space-y-4">
            <h3 className="font-sans font-bold text-base text-slate-900">Are you sure?</h3>
            <p className="text-xs text-slate-500 pb-3 border-b border-slate-100">
              This will permanently delete the file from your cloud storage.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={handleConfirmDelete} className="rounded-lg bg-rose-600 text-white py-2 font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer">Yes, Delete</button>
              <button onClick={() => setConfirmDelete({show:false, type:'folder', fIdx:-1})} className="rounded-lg border border-slate-200 text-slate-700 py-2 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {activeFolderIdx !== null && (
            <button onClick={() => setActiveFolderIdx(null)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"><ArrowLeft size={18}/></button>
          )}
          <div>
            <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight">
              {activeFolderIdx !== null ? `${folders[activeFolderIdx].title} // Files` : 'Gallery Archive'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage visual assets and photo galleries</p>
          </div>
        </div>
        <button onClick={handleGlobalSave} disabled={saving} className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#121212] text-[#F4BF4B] font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* VIEW 1: INSIDE FOLDER */}
      {activeFolderIdx !== null ? (
        <div className="space-y-4">
          <button onClick={() => {
            const nf = [...folders];
            nf[activeFolderIdx].images = [...(nf[activeFolderIdx].images || []), { id: Date.now().toString(), url: '', title: '', photographer: '' }];
            setFolders(nf);
          }} className="w-full py-6 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 font-semibold text-xs text-slate-600 hover:bg-slate-100/60 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-center gap-2">+ Add New Photo</button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {folders[activeFolderIdx].images?.map((img: any, imgIdx: number) => (
              <div key={img.id} className="saas-card bg-white p-3.5 border-slate-200/80 flex flex-col">
                <div className="aspect-square bg-slate-50 relative rounded-lg border border-slate-200/80 overflow-hidden mb-3">
                  {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">No Data</div>}
                  {uploadingIdx === imgIdx && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="block rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2 text-center text-xs font-semibold cursor-pointer transition-colors mb-2.5">
                  Upload File <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(activeFolderIdx, imgIdx, e)} />
                </label>
                <input className={inputClass + " mb-2"} placeholder="Photo Title" value={img.title} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].title = e.target.value; setFolders(nf); }} />
                <input className={inputClass + " mb-2.5"} placeholder="Photographer" value={img.photographer} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].photographer = e.target.value; setFolders(nf); }} />
                <button onClick={() => setConfirmDelete({ show: true, type: 'image', fIdx: activeFolderIdx, imgIdx })} className="w-full mt-auto rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 py-2 font-semibold text-xs transition-colors cursor-pointer">Remove Slot</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: FOLDER LIST */
        <div className="space-y-4">
          <button onClick={addFolder} className="w-full py-8 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 font-semibold text-xs text-slate-600 hover:bg-slate-100/60 hover:border-slate-400 transition-all cursor-pointer flex items-center justify-center gap-2">+ Create New Trip Archive</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {folders.map((f, fIdx) => (
              <div key={f.id} className="saas-card bg-white p-4 border-slate-200/80 flex flex-col">
                <div className="aspect-square bg-slate-50 rounded-lg border border-slate-200/80 mb-3 relative overflow-hidden">
                  {f.url ? <img src={f.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center font-medium">Empty Folder</div>}
                  {uploadingIdx === -99 && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="rounded-md border border-slate-200 bg-white hover:bg-slate-50 p-2 text-center text-xs font-semibold text-slate-700 cursor-pointer mb-3 transition-colors">
                  Set Cover Image <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(fIdx, null, e)} />
                </label>
                <input className={inputClass + " mb-3"} placeholder="Trip Title" value={f.title} onChange={e => { const n = [...folders]; n[fIdx].title = e.target.value; setFolders(n); }} />
                <div className="space-y-1.5 mt-auto">
                   <button onClick={() => setActiveFolderIdx(fIdx)} className="w-full rounded-lg bg-[#121212] text-[#F4BF4B] hover:bg-slate-800 py-2 font-semibold text-xs transition-colors cursor-pointer">Manage Files ({f.images?.length || 0})</button>
                   <button onClick={() => setConfirmDelete({ show: true, type: 'folder', fIdx })} className="w-full rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 font-semibold text-xs transition-colors cursor-pointer">Delete Folder</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};