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
      triggerNotify("ALL CHANGES PERMANENTLY SAVED TO DATABASE.", "success");
    } catch (err: any) {
      triggerNotify("SAVE FAILED: CONNECTION ERROR.", "error");
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
      triggerNotify("DELETED FROM STORAGE. CLICK SAVE TO FINALIZE.", "success");
    } catch (err) {
      triggerNotify("DELETE FAILED.", "error");
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
      triggerNotify("FILE READY. CLICK SAVE TO PERSIST.", "success");
    } catch (err) { triggerNotify("UPLOAD FAILED.", "error"); }
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

  if (loading) return <div className="p-10 font-black uppercase opacity-20">Loading Archive...</div>;

  return (
    <div className="space-y-0 relative">
      {notification && <Notification text={notification.text} type={notification.type} />}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[2000] bg-[#121212]/90 backdrop-blur-sm flex items-center justify-center p-4 ">
          <div className="bg-white border-[4px] border-[#121212] p-8 max-w-sm w-full shadow-[12px_12px_0_0_#9E1B1D]">
            <h3 className="font-brand font-black text-3xl uppercase mb-2">Are you sure?</h3>
            <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-8">
              This will permanently delete the file from your cloud storage.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleConfirmDelete} className="bg-[#9E1B1D] text-white py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_0_#000] active:translate-x-1 active:translate-y-1">Yes, Delete</button>
              <button onClick={() => setConfirmDelete({show:false, type:'folder', fIdx:-1})} className="border-2 border-[#121212] py-4 font-black text-xs uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-[#121212] pb-6">
        <div className="flex items-center gap-4">
          {activeFolderIdx !== null && (
            <button onClick={() => setActiveFolderIdx(null)} className="p-2 border-2 border-[#121212] hover:bg-[#F4BF4B]"><ArrowLeft size={20}/></button>
          )}
          <h2 className="font-brand font-black text-4xl uppercase">
            {activeFolderIdx !== null ? `${folders[activeFolderIdx].title} // FILES` : 'Gallery Archive'}
          </h2>
        </div>
        <button onClick={handleGlobalSave} disabled={saving} className="w-full md:w-auto bg-[#121212] text-[#F4BF4B] px-10 py-4 font-black text-xs uppercase tracking-widest shadow-[6px_6px_0_0_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          {saving ? 'SYNCING...' : 'SAVE ALL CHANGES'}
        </button>
      </div>

      {/* VIEW 1: INSIDE FOLDER */}
      {activeFolderIdx !== null ? (
        <div className="space-y-6">
          <button onClick={() => {
            const nf = [...folders];
            nf[activeFolderIdx].images = [...(nf[activeFolderIdx].images || []), { id: Date.now().toString(), url: '', title: '', photographer: '' }];
            setFolders(nf);
          }} className="w-full py-8 border-4 border-dashed border-[#121212]/10 font-black text-xs uppercase tracking-widest hover:bg-[#F4BF4B]/10">+ ADD NEW FILE SLOT</button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {folders[activeFolderIdx].images?.map((img: any, imgIdx: number) => (
              <div key={img.id} className="border-2 border-[#121212] bg-white p-3 shadow-[4px_4px_0_0_#121212]">
                <div className="aspect-square bg-gray-100 relative border-2 border-[#121212] overflow-hidden mb-3">
                  {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[10px] font-black opacity-20 uppercase">No Data</div>}
                  {uploadingIdx === imgIdx && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="block bg-[#121212] text-white p-2 text-center text-[8px] font-black uppercase cursor-pointer hover:bg-[#9E1B1D]">
                  Upload File <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(activeFolderIdx, imgIdx, e)} />
                </label>
                <input className="w-full mt-2 text-[10px] p-2 border-b-2 border-gray-100 outline-none uppercase font-bold focus:border-[#121212]" placeholder="PHOTO TITLE" value={img.title} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].title = e.target.value; setFolders(nf); }} />
                <input className="w-full text-[9px] p-2 border-b-2 border-gray-100 outline-none uppercase text-gray-400 focus:border-[#121212]" placeholder="PHOTOGRAPHER" value={img.photographer} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].photographer = e.target.value; setFolders(nf); }} />
                <button onClick={() => setConfirmDelete({ show: true, type: 'image', fIdx: activeFolderIdx, imgIdx })} className="w-full mt-4 text-red-600 font-black text-[8px] uppercase tracking-widest hover:underline">Remove Slot</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: FOLDER LIST */
        <div className="space-y-6">
          <button onClick={addFolder} className="w-full py-10 border-4 border-dashed border-[#121212]/10 font-black text-sm uppercase tracking-[0.2em] text-gray-400 hover:bg-[#F4BF4B]/10 hover:border-[#121212] hover:text-[#121212] transition-all">+ CREATE NEW TRIP ARCHIVE</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {folders.map((f, fIdx) => (
              <div key={f.id} className="border-4 border-[#121212] bg-white p-4 flex flex-col shadow-[8px_8px_0_0_#121212]">
                <div className="aspect-square bg-gray-100 border-2 border-[#121212] mb-4 relative overflow-hidden">
                  {f.url ? <img src={f.url} className="w-full h-full object-cover grayscale-[30%]" /> : <div className="h-full flex items-center justify-center text-xs font-black opacity-10 text-center uppercase">EMPTY FOLDER</div>}
                  {uploadingIdx === -99 && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="bg-gray-100 p-3 text-center text-[9px] font-black uppercase cursor-pointer border-2 border-[#121212] mb-4 hover:bg-[#F4BF4B] transition-colors">
                  SET COVER IMAGE <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(fIdx, null, e)} />
                </label>
                <input className="w-full p-3 border-2 border-gray-100 focus:border-[#121212] outline-none text-xs font-black uppercase mb-6" placeholder="TRIP TITLE" value={f.title} onChange={e => { const n = [...folders]; n[fIdx].title = e.target.value; setFolders(n); }} />
                <div className="space-y-2 mt-auto">
                   <button onClick={() => setActiveFolderIdx(fIdx)} className="w-full bg-[#F4BF4B] border-2 border-[#121212] py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] hover:text-white transition-all">MANAGE FILES ({f.images?.length || 0})</button>
                   <button onClick={() => setConfirmDelete({ show: true, type: 'folder', fIdx })} className="w-full border-2 border-[#9E1B1D] text-[#9E1B1D] py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-all">DELETE FOLDER</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};