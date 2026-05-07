import React, { useState, useEffect } from 'react';
import { Save, Upload, Check, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc, collectionGroup, getDocs, collection } from 'firebase/firestore';
import { db, uploadImage } from '../../services/firebaseService';
import { Review, Package, Destination } from '../../types/database';

export const AdminHomepageManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingHero, setUploadingHero] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [showReviewDropdown, setShowReviewDropdown] = useState(false);

  // Data pulled from database for selection
  const [availableReviews, setAvailableReviews] = useState<Review[]>([]);
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<Destination[]>([]);

  // The Master State for Homepage Content
  const [content, setContent] = useState({
    heroImage: '',
    featuredDropZones: [] as string[], // Stores Package or Destination IDs
    featuredArchive: [] as string[],   // Stores Destination IDs
    featuredReviewIds: [] as string[], // Stores Review IDs
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Homepage Settings
      const docRef = doc(db, 'settings', 'homepage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setContent({
          heroImage: data.heroImage || '',
          featuredDropZones: data.featuredDropZones || [],
          featuredArchive: data.featuredArchive || [],
          featuredReviewIds: data.featuredReviewIds || [],
        });
      }

      // 2. Fetch all required data for selection lists concurrently
      const [reviewSnaps, packageSnaps, destSnaps] = await Promise.all([
        getDocs(collection(db, 'global_reviews')),
        getDocs(collection(db, 'packages')),
        getDocs(collection(db, 'destinations'))
      ]);

      setAvailableReviews(reviewSnaps.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      setAvailablePackages(packageSnaps.docs.map(d => ({ id: d.id, ...d.data() } as Package)));
      setAvailableDestinations(destSnaps.docs.map(d => ({ id: d.id, ...d.data() } as Destination)));

    } catch (error: any) {
      console.error("FULL LOAD ERROR:", error);
      setMessage({ type: 'error', text: `LOAD ERROR: ${error.message || 'Network disconnected'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await setDoc(doc(db, 'settings', 'homepage'), content);
      setMessage({ type: 'success', text: 'Homepage content updated successfully.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      console.error("FULL SAVE ERROR:", error);
      setMessage({ type: 'error', text: `SAVE ERROR: ${error.message || 'Unknown error'}` });
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const downloadUrl = await uploadImage(file, 'homepage');
      setContent(prev => ({ ...prev, heroImage: downloadUrl }));
    } catch (error: any) {
      console.error("HERO UPLOAD ERROR:", error);
      setMessage({ type: 'error', text: `UPLOAD ERROR: ${error.message}` });
    } finally {
      setUploadingHero(false);
    }
  };

  const toggleSelection = (arrayName: keyof typeof content, id: string, maxLimit?: number) => {
    setContent(prev => {
      const currentArray = prev[arrayName] as string[];
      const isSelected = currentArray.includes(id);
      
      if (isSelected) {
        return { ...prev, [arrayName]: currentArray.filter(itemId => itemId !== id) };
      } else {
        if (maxLimit && currentArray.length >= maxLimit) {
          alert(`Maximum of ${maxLimit} items allowed for this section.`);
          return prev;
        }
        return { ...prev, [arrayName]: [...currentArray, id] };
      }
    });
  };

  const moveItem = (arrayName: 'featuredReviewIds' | 'featuredDropZones' | 'featuredArchive', index: number, direction: 'up' | 'down') => {
    const newArray = [...content[arrayName]];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newArray.length) return;
    
    [newArray[index], newArray[targetIndex]] = [newArray[targetIndex], newArray[index]];
    setContent({ ...content, [arrayName]: newArray });
  };

  const inputClass = "w-full px-4 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white focus:outline-none focus:border-[#F4BF4B] focus:ring-2 focus:ring-[#F4BF4B]/20 font-bold text-sm text-[#121212] transition-all";

  if (loading) return <div className="p-8 font-black uppercase text-[#121212]/40 tracking-widest text-sm">Loading Configuration...</div>;

  return (
    <div className="space-y-6 w-full pb-8 md:pb-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">Site Content</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mt-1">Manage homepage sections</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#121212] text-[#F4BF4B] font-black text-[11px] uppercase tracking-widest rounded-[18px] shadow-[0_12px_24px_rgba(18,18,18,0.12)] hover:bg-[#9E1B1D] hover:text-white transition-all disabled:opacity-50"
        >
          {saving ? 'SAVING...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-[14px] font-bold text-xs uppercase tracking-widest flex items-center gap-2 border-2 ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />} {message.text}
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4">Hero Background</h3>
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50">Image URL or Upload File</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={content.heroImage} 
              onChange={(e) => setContent({...content, heroImage: e.target.value})}
              placeholder="https://..." 
              className={inputClass + " md:flex-1"}
            />
            <label className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#F4BF4B]/10 cursor-pointer font-black text-[11px] uppercase tracking-widest transition-colors">
              {uploadingHero ? 'UPLOADING...' : <><Upload size={16} /> Upload File</>}
              <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} />
            </label>
          </div>
          {content.heroImage && (
            <img src={content.heroImage} alt="Hero Preview" className="w-full h-40 md:h-48 object-cover rounded-[14px] border-2 border-[#121212]/10" />
          )}
        </div>
      </section>

      {/* 2. LOCATE YOUR DROP ZONE */}
      <section className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b-2 border-[#121212]/10">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D]">Target Sectors (Drop Zone)</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 rounded-full">{content.featuredDropZones.length} / 4 Selected</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40 mb-4">Select exactly 4 packages to feature in the grid.</p>
        
        <div className="max-h-60 md:max-h-72 overflow-y-auto rounded-[14px] border-2 border-[#121212]/10 bg-[#FCFBF7] grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          {availablePackages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`flex items-center gap-3 p-4 rounded-[14px] border-2 cursor-pointer transition-all ${content.featuredDropZones.includes(pkg.id) ? 'border-[#F4BF4B] bg-[#F4BF4B]/10 shadow-[0_8px_16px_rgba(244,191,75,0.15)]' : 'border-[#121212]/10 hover:border-[#121212]/20 bg-white'}`}
              onClick={() => toggleSelection('featuredDropZones', pkg.id, 4)}
            >
              <input type="checkbox" checked={content.featuredDropZones.includes(pkg.id)} readOnly className="size-4 accent-[#9E1B1D] cursor-pointer flex-shrink-0" />
              <span className="font-bold text-sm uppercase truncate">{pkg.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE FIELD ARCHIVE (GALLERY) */}
      <section className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b-2 border-[#121212]/10">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D]">The Field Archive</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 rounded-full">{content.featuredArchive.length} Selected</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40 mb-4">Select destinations for the scrolling gallery.</p>
        
        <div className="max-h-60 md:max-h-72 overflow-y-auto rounded-[14px] border-2 border-[#121212]/10 bg-[#FCFBF7] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {availableDestinations.map(dest => (
            <div 
              key={dest.id} 
              className={`flex items-center gap-3 p-4 rounded-[14px] border-2 cursor-pointer transition-all ${content.featuredArchive.includes(dest.id) ? 'border-[#F4BF4B] bg-[#F4BF4B]/10 shadow-[0_8px_16px_rgba(244,191,75,0.15)]' : 'border-[#121212]/10 hover:border-[#121212]/20 bg-white'}`}
              onClick={() => toggleSelection('featuredArchive', dest.id)}
            >
              <input type="checkbox" checked={content.featuredArchive.includes(dest.id)} readOnly className="size-4 accent-[#9E1B1D] cursor-pointer flex-shrink-0" />
              <span className="font-bold text-sm uppercase truncate">{dest.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VOICES FROM THE FIELD (REVIEWS) */}
      <section className="rounded-[18px] bg-white border-2 border-[#121212]/10 shadow-[0_12px_24px_rgba(18,18,18,0.06)] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 pb-4 border-b-2 border-[#121212]/10">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[#9E1B1D]">Voices from the Field</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 rounded-full">{content.featuredReviewIds.length} Selected</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/40 mb-4">Select reviews to display in the carousel.</p>
        
        {/* Search & Dropdown for Reviews */}
        <div className="mb-6 relative">
          <button
            onClick={() => setShowReviewDropdown(!showReviewDropdown)}
            className="w-full flex items-center justify-between p-4 rounded-[14px] border-2 border-[#121212]/10 bg-white hover:bg-[#FCFBF7] transition-colors font-black text-[11px] uppercase tracking-widest text-left"
          >
            <span>+ Add Review</span>
            <span className={`text-lg transition-transform duration-300 ${showReviewDropdown ? 'rotate-180' : 'rotate-0'}`}>▼</span>
          </button>
          
          {showReviewDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-[14px] border-2 border-[#121212]/10 bg-white shadow-[0_24px_48px_rgba(18,18,18,0.15)] z-50 overflow-hidden">
              <input
                type="text"
                placeholder="Search by name..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value.toLowerCase())}
                className="w-full p-4 border-b-2 border-[#121212]/10 outline-none focus:bg-[#FCFBF7] text-sm font-bold"
              />
              
              <div className="max-h-48 md:max-h-56 overflow-y-auto">
                {availableReviews
                  .filter(review => !content.featuredReviewIds.includes(review.id) && review.travelerName.toLowerCase().includes(reviewSearchQuery))
                  .map((review) => (
                    <div
                      key={review.id}
                      onClick={() => {
                        toggleSelection('featuredReviewIds', review.id);
                        setReviewSearchQuery('');
                        setShowReviewDropdown(false);
                      }}
                      className="p-4 border-b border-[#121212]/5 hover:bg-[#F4BF4B]/10 cursor-pointer transition-colors"
                    >
                      <p className="font-bold text-xs uppercase truncate">{review.travelerName} <span className="text-[#9E1B1D] ml-1">★ {review.rating}</span></p>
                      <p className="text-[#121212]/50 text-[11px] italic mt-1 line-clamp-1">"{review.content}"</p>
                    </div>
                  ))}
                {availableReviews.filter(review => !content.featuredReviewIds.includes(review.id) && review.travelerName.toLowerCase().includes(reviewSearchQuery)).length === 0 && (
                  <div className="p-4 text-center text-[#121212]/40 text-xs">No reviews available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Sequence Section */}
        {content.featuredReviewIds.length > 0 && (
          <div className="mt-6 p-5 rounded-[14px] border-2 border-[#121212]/10 bg-[#FCFBF7]">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 text-[#121212]/60">▪ Active Sequence</h4>
            <div className="space-y-2">
              {content.featuredReviewIds.map((id, index) => {
                const review = availableReviews.find(r => r.id === id);
                return (
                  <div key={id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white rounded-[14px] p-4 border-2 border-[#121212]/10 hover:border-[#F4BF4B]/30 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                      <span className="font-black text-xs text-[#121212]/30 w-6 text-center flex-shrink-0">{index + 1}</span>
                      <span className="font-black text-xs uppercase truncate text-[#121212]">{review?.travelerName}</span>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => moveItem('featuredReviewIds', index, 'up')}
                        disabled={index === 0}
                        className="flex-1 md:flex-none p-2 rounded-[10px] bg-white border-2 border-[#121212]/10 hover:bg-[#F4BF4B]/10 disabled:opacity-20 disabled:cursor-not-allowed font-black text-xs transition-colors"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveItem('featuredReviewIds', index, 'down')}
                        disabled={index === content.featuredReviewIds.length - 1}
                        className="flex-1 md:flex-none p-2 rounded-[10px] bg-white border-2 border-[#121212]/10 hover:bg-[#F4BF4B]/10 disabled:opacity-20 disabled:cursor-not-allowed font-black text-xs transition-colors"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleSelection('featuredReviewIds', id)}
                        className="flex-1 md:flex-none p-2 rounded-[10px] bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white font-black text-xs transition-colors"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

    </div>
  );
};