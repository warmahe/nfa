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
    <div className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 md:p-8 space-y-8 relative">
      {notification && <Notification text={notification.text} type={notification.type} />}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[2000] bg-[#121212]/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFBF7] border-4 border-[#121212] p-8 max-w-sm w-full shadow-[16px_16px_0_0_#121212]">
            <h3 className="font-black text-xl uppercase tracking-tight text-[#121212] mb-2">Are you sure?</h3>
            <p className="font-bold text-[10px] uppercase tracking-widest text-gray-500 mb-8 border-b-2 border-[#121212] pb-4">
              This will permanently delete the file from your cloud storage.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleConfirmDelete} className="bg-[#9E1B1D] text-white border-2 border-[#9E1B1D] py-4 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#121212] active:translate-x-1 active:translate-y-1 hover:bg-white hover:text-[#9E1B1D] transition-colors">YES, DELETE</button>
              <button onClick={() => setConfirmDelete({show:false, type:'folder', fIdx:-1})} className="bg-white border-2 border-[#121212] text-[#121212] py-4 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0_0_#121212] hover:bg-gray-100 transition-colors">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[#121212] pb-6">
        <div className="flex items-center gap-4">
          {activeFolderIdx !== null && (
            <button onClick={() => setActiveFolderIdx(null)} className="p-3 border-2 border-[#121212] bg-white hover:bg-[#F4BF4B] transition-colors shadow-[2px_2px_0px_0px_#121212]"><ArrowLeft size={20}/></button>
          )}
          <div>
            <h2 className="font-brand font-black text-2xl md:text-3xl uppercase tracking-tight text-[#121212]">
              {activeFolderIdx !== null ? `${folders[activeFolderIdx].title} // FILES` : 'Gallery Archive'}
            </h2>
            <p className="font-bold text-xs uppercase tracking-widest text-gray-500 mt-2">Manage visual assets</p>
          </div>
        </div>
        <button onClick={handleGlobalSave} disabled={saving} className="w-full md:w-auto bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_0_#F4BF4B] hover:bg-[#9E1B1D] hover:text-white hover:shadow-[4px_4px_0_0_#121212] transition-all">
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
          }} className="w-full py-8 border-4 border-dashed border-[#121212] bg-white font-black text-xs uppercase tracking-widest text-[#121212] hover:bg-[#F4BF4B] transition-colors">+ ADD NEW FILE SLOT</button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {folders[activeFolderIdx].images?.map((img: any, imgIdx: number) => (
              <div key={img.id} className="border-2 border-[#121212] bg-[#FCFBF7] p-4 shadow-[4px_4px_0_0_#121212] flex flex-col">
                <div className="aspect-square bg-white relative border-2 border-[#121212] overflow-hidden mb-4 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                  {img.url ? <img src={img.url} className="w-full h-full object-cover grayscale-[20%]" /> : <div className="h-full flex items-center justify-center text-[10px] font-black opacity-20 uppercase tracking-widest">No Data</div>}
                  {uploadingIdx === imgIdx && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="block border-2 border-[#121212] bg-white hover:bg-[#F4BF4B] text-[#121212] py-3 text-center text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-[2px_2px_0_0_#121212] transition-colors mb-4">
                  UPLOAD FILE <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(activeFolderIdx, imgIdx, e)} />
                </label>
                <input className="w-full mb-3 p-3 border-2 border-[#121212] bg-white outline-none text-[10px] uppercase font-black tracking-widest focus:border-[#F4BF4B] transition-colors" placeholder="PHOTO TITLE" value={img.title} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].title = e.target.value; setFolders(nf); }} />
                <input className="w-full mb-4 p-3 border-2 border-[#121212] bg-white outline-none text-[10px] uppercase font-black tracking-widest focus:border-[#F4BF4B] transition-colors" placeholder="PHOTOGRAPHER" value={img.photographer} onChange={e => { const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].photographer = e.target.value; setFolders(nf); }} />
                <button onClick={() => setConfirmDelete({ show: true, type: 'image', fIdx: activeFolderIdx, imgIdx })} className="w-full mt-auto bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white py-3 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#F4BF4B] transition-colors">REMOVE SLOT</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW 2: FOLDER LIST */
        <div className="space-y-6">
          <button onClick={addFolder} className="w-full py-10 border-4 border-dashed border-[#121212] bg-white font-black text-sm uppercase tracking-[0.2em] text-[#121212] hover:bg-[#F4BF4B] transition-all">+ CREATE NEW TRIP ARCHIVE</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {folders.map((f, fIdx) => (
              <div key={f.id} className="border-2 border-[#121212] bg-white p-6 flex flex-col shadow-[4px_4px_0_0_#121212]">
                <div className="aspect-square bg-[#FCFBF7] border-2 border-[#121212] mb-4 relative overflow-hidden shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                  {f.url ? <img src={f.url} className="w-full h-full object-cover grayscale-[30%]" /> : <div className="h-full flex items-center justify-center text-[10px] font-black opacity-20 text-center uppercase tracking-widest">EMPTY FOLDER</div>}
                  {uploadingIdx === -99 && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
                </div>
                <label className="border-2 border-[#121212] bg-white hover:bg-[#F4BF4B] p-3 text-center text-[10px] font-black uppercase tracking-widest cursor-pointer mb-4 shadow-[2px_2px_0_0_#121212] transition-colors">
                  SET COVER IMAGE <input type="file" className="hidden" accept="image/*" onChange={(e) => onUpload(fIdx, null, e)} />
                </label>
                <input className="w-full p-4 border-2 border-[#121212] bg-[#FCFBF7] focus:border-[#F4BF4B] outline-none text-xs font-black uppercase tracking-widest mb-6 transition-colors" placeholder="TRIP TITLE" value={f.title} onChange={e => { const n = [...folders]; n[fIdx].title = e.target.value; setFolders(n); }} />
                <div className="space-y-3 mt-auto">
                   <button onClick={() => setActiveFolderIdx(fIdx)} className="w-full bg-[#121212] text-[#F4BF4B] hover:bg-gray-800 border-2 border-[#121212] py-3 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#F4BF4B] transition-colors">MANAGE FILES ({f.images?.length || 0})</button>
                   <button onClick={() => setConfirmDelete({ show: true, type: 'folder', fIdx })} className="w-full bg-white text-[#9E1B1D] hover:bg-[#9E1B1D] hover:text-white border-2 border-[#9E1B1D] py-3 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#9E1B1D] transition-colors">DELETE FOLDER</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};