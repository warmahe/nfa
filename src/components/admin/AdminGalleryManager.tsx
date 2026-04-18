import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Loader2, Check, AlertCircle, ArrowLeft, Plus, Image as ImageIcon } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadAndReplaceImage, deleteImage } from '../../services/firebaseService';

export const AdminGalleryManager = () => {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Navigation State: null means showing folders, a number means we are "inside" that folder index
  const [activeFolderIdx, setActiveFolderIdx] = useState<number | null>(null);
  
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadGallery(); }, []);

  const triggerMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const loadGallery = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'gallery'));
      if (docSnap.exists()) setFolders(docSnap.data().items || []);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'gallery'), { items: folders });
      triggerMessage("ARCHIVE SYNCED TO DATABASE.", "success");
    } catch (err: any) {
      triggerMessage(`SYNC FAILED: ${err.message}`, "error");
    } finally { setSaving(false); }
  };

  // --- FOLDER LEVEL LOGIC ---
  const addFolder = () => {
    setFolders([...folders, { 
      id: Date.now().toString(), 
      url: '', 
      title: '', 
      destination: '', 
      images: [] // Sub-images array
    }]);
  };

  const removeFolder = async (index: number) => {
    if (!window.confirm("This will delete the folder AND all images inside it. Continue?")) return;
    const folder = folders[index];
    
    // Cleanup: Delete cover and all sub-images
    if (folder.url) await deleteImage(folder.url);
    if (folder.images) {
      for (const img of folder.images) {
        if (img.url) await deleteImage(img.url);
      }
    }
    
    setFolders(folders.filter((_, i) => i !== index));
    triggerMessage("FOLDER PURGED FROM STORAGE.", "success");
  };

  // --- SUB-IMAGE LOGIC (INSIDE FOLDER) ---
  const addImageToFolder = (fIdx: number) => {
    const newFolders = [...folders];
    newFolders[fIdx].images = [...(newFolders[fIdx].images || []), { id: Date.now().toString(), url: '', title: '', photographer: '' }];
    setFolders(newFolders);
  };

  const handleSubImageUpload = async (fIdx: number, imgIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIdx(imgIdx);
    const newFolders = [...folders];
    const oldUrl = newFolders[fIdx].images[imgIdx].url;

    try {
      const url = await uploadAndReplaceImage(file, `gallery/${newFolders[fIdx].destination}`, oldUrl);
      newFolders[fIdx].images[imgIdx].url = url;
      setFolders(newFolders);
      triggerMessage("FILE UPLOADED.", "success");
    } catch (err) {
      triggerMessage("UPLOAD FAILED.", "error");
    } finally { setUploadingIdx(null); }
  };

  const removeSubImage = async (fIdx: number, imgIdx: number) => {
    const newFolders = [...folders];
    const img = newFolders[fIdx].images[imgIdx];
    if (img.url) await deleteImage(img.url);
    newFolders[fIdx].images = newFolders[fIdx].images.filter((_: any, i: number) => i !== imgIdx);
    setFolders(newFolders);
    triggerMessage("FILE DELETED.", "success");
  };

  if (loading) return <div className="p-8 font-black uppercase text-gray-500">Decrypting Archive...</div>;

  // RENDER VIEW 1: Sub-Images Manager (Inside a folder)
  if (activeFolderIdx !== null) {
    const folder = folders[activeFolderIdx];
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-[#121212] pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveFolderIdx(null)} className="p-2 border-2 border-[#121212] hover:bg-[#F4BF4B]">
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-brand font-black text-3xl uppercase">{folder.title || 'UNNAMED'} // FILES</h2>
          </div>
          <button onClick={handleSave} className="w-full md:w-auto bg-[#121212] text-[#F4BF4B] px-8 py-3 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0_0_#F4BF4B]">
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 font-bold text-sm uppercase flex items-center gap-3 border-2 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />} {message.text}
          </div>
        )}

        <button onClick={() => addImageToFolder(activeFolderIdx)} className="w-full py-6 border-4 border-dashed border-[#121212]/20 font-black text-xs uppercase tracking-widest hover:bg-[#F4BF4B]/10">
          + ADD NEW IMAGE FILE
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folder.images?.map((img: any, imgIdx: number) => (
            <div key={img.id} className="border-2 border-[#121212] bg-white p-2 flex flex-col gap-2">
               <div className="aspect-square bg-gray-100 relative border border-[#121212] overflow-hidden">
                 {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[8px] font-black opacity-20">PENDING</div>}
                 {uploadingIdx === imgIdx && <div className="absolute inset-0 bg-[#121212]/80 flex items-center justify-center text-[#F4BF4B]"><Loader2 className="animate-spin" /></div>}
               </div>
               <label className="bg-gray-100 p-2 text-center text-[8px] font-black uppercase cursor-pointer border border-[#121212]">
                 UPLOAD <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSubImageUpload(activeFolderIdx, imgIdx, e)} />
               </label>
               <input className="text-[10px] p-1 border-b border-gray-200 outline-none uppercase font-bold" placeholder="TITLE" value={img.title} onChange={(e) => {
                 const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].title = e.target.value; setFolders(nf);
               }} />
               <input className="text-[9px] p-1 border-b border-gray-100 outline-none uppercase text-gray-500" placeholder="PHOTOGRAPHER" value={img.photographer || ''} onChange={(e) => {
                 const nf = [...folders]; nf[activeFolderIdx].images[imgIdx].photographer = e.target.value; setFolders(nf);
               }} />
               <button onClick={() => removeSubImage(activeFolderIdx, imgIdx)} className="text-[8px] font-black text-red-600 uppercase hover:underline">Delete</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RENDER VIEW 2: Folder List Manager (Default)
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b-4 border-[#121212] pb-6">
        <h2 className="font-brand font-black text-4xl uppercase">Gallery Archive</h2>
        <button onClick={handleSave} className="bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase shadow-[4px_4px_0_0_#F4BF4B]">
          {saving ? 'SAVING...' : 'SAVE ALL'}
        </button>
      </div>

      {message.text && (
        <div className="p-4 bg-green-50 border-2 border-green-500 text-green-700 font-bold text-sm uppercase flex items-center gap-3">
          <Check size={20}/> {message.text}
        </div>
      )}

      <button onClick={addFolder} className="w-full py-8 border-4 border-dashed border-[#121212]/20 font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-[#F4BF4B]/10 hover:border-[#121212]">
        + CREATE NEW TRIP FOLDER
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {folders.map((folder, idx) => (
          <div key={folder.id} className="border-4 border-[#121212] bg-white p-4 flex flex-col shadow-[6px_6px_0_0_#121212]">
            <div className="aspect-square bg-gray-100 border-2 border-[#121212] mb-4 relative overflow-hidden">
               {folder.url ? <img src={folder.url} className="w-full h-full object-cover grayscale-[30%]" /> : <div className="h-full flex items-center justify-center text-xs font-black opacity-20 text-center">NO COVER <br/> IMAGE</div>}
            </div>
            
            <div className="space-y-2 mb-4">
              <input className="w-full p-2 border-2 border-gray-100 focus:border-[#121212] outline-none text-xs font-black uppercase tracking-tight" placeholder="FOLDER TITLE" value={folder.title} onChange={e => { const n = [...folders]; n[idx].title = e.target.value; setFolders(n); }} />
              <input className="w-full p-2 border-2 border-gray-100 focus:border-[#121212] outline-none text-[10px] font-bold uppercase text-[#9E1B1D]" placeholder="DESTINATION SLUG" value={folder.destination} onChange={e => { const n = [...folders]; n[idx].destination = e.target.value; setFolders(n); }} />
            </div>

            <div className="grid grid-cols-1 gap-2 mt-auto">
               <button onClick={() => setActiveFolderIdx(idx)} className="w-full bg-[#F4BF4B] border-2 border-[#121212] py-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] hover:text-white transition-colors">
                  Manage Files ({folder.images?.length || 0})
               </button>
               <button onClick={() => removeFolder(idx)} className="w-full border-2 border-[#9E1B1D] text-[#9E1B1D] py-2 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white">
                  Delete Folder
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};