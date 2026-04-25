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

  if (loading) return <div className="p-8 font-black uppercase text-gray-500">Loading Configuration...</div>;

  return (
    <div className="space-y-8 md:space-y-12 w-full px-4 md:px-6 lg:px-0 lg:max-w-5xl mx-auto pb-8 md:pb-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-[#121212] pb-4">
        <h2 className="font-brand font-black text-2xl md:text-4xl uppercase text-[#121212]">Site Content</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center md:justify-start gap-2 bg-[#121212] text-[#F4BF4B] px-4 md:px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] disabled:opacity-50"
        >
          {saving ? 'SAVING...' : <><Save size={16} /> SAVE CHANGES</>}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 font-bold text-sm uppercase tracking-widest flex items-center gap-2 border-2 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />} {message.text}
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
        <h3 className="font-black text-base md:text-lg uppercase tracking-tight mb-4">Hero Background</h3>
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image URL or Upload File</label>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input 
              type="text" 
              value={content.heroImage} 
              onChange={(e) => setContent({...content, heroImage: e.target.value})}
              placeholder="https://..." 
              className="w-full md:flex-1 p-3 border-2 border-[#121212] bg-white outline-none focus:border-[#F4BF4B] text-sm font-bold"
            />
            <label className="w-full md:w-auto bg-white border-2 border-[#121212] text-[#121212] hover:bg-gray-100 px-4 md:px-6 py-3 cursor-pointer flex items-center justify-center md:justify-start gap-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212] transition-colors">
              {uploadingHero ? 'UPLOADING...' : <><Upload size={16} /> UPLOAD FILE</>}
              <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} disabled={uploadingHero} />
            </label>
          </div>
          {content.heroImage && (
            <img src={content.heroImage} alt="Hero Preview" className="w-full h-40 md:h-48 object-cover border-2 border-[#121212] grayscale-[30%]" />
          )}
        </div>
      </section>

      {/* 2. LOCATE YOUR DROP ZONE */}
      <section className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b-2 border-[#121212] pb-4">
          <h3 className="font-black text-lg md:text-xl uppercase tracking-tight text-[#121212]">Target Sectors (Drop Zone)</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 shadow-[2px_2px_0px_0px_#F4BF4B]">{content.featuredDropZones.length} / 4 Selected</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Select exactly 4 packages to feature in the grid.</p>
        
        <div className="max-h-60 md:max-h-72 overflow-y-auto border-2 border-[#121212] bg-white grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]">
          {availablePackages.map(pkg => (
            <div 
              key={pkg.id} 
              className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all ${content.featuredDropZones.includes(pkg.id) ? 'border-[#121212] bg-[#F4BF4B]/10 shadow-[4px_4px_0px_0px_#121212]' : 'border-gray-200 hover:border-[#121212] hover:shadow-[4px_4px_0px_0px_rgba(18,18,18,0.2)] bg-white'}`}
              onClick={() => toggleSelection('featuredDropZones', pkg.id, 4)}
            >
              <input type="checkbox" checked={content.featuredDropZones.includes(pkg.id)} readOnly className="size-5 md:size-4 accent-[#9E1B1D] cursor-pointer flex-shrink-0" />
              <span className="font-bold text-sm uppercase truncate">{pkg.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE FIELD ARCHIVE (GALLERY) */}
      <section className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b-2 border-[#121212] pb-4">
          <h3 className="font-black text-lg md:text-xl uppercase tracking-tight text-[#121212]">The Field Archive</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 shadow-[2px_2px_0px_0px_#F4BF4B]">{content.featuredArchive.length} Selected</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Select the destinations to display in the scrolling visual evidence gallery.</p>
        
        <div className="max-h-60 md:max-h-72 overflow-y-auto border-2 border-[#121212] bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]">
          {availableDestinations.map(dest => (
            <div 
              key={dest.id} 
              className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all ${content.featuredArchive.includes(dest.id) ? 'border-[#121212] bg-[#F4BF4B]/10 shadow-[4px_4px_0px_0px_#121212]' : 'border-gray-200 hover:border-[#121212] hover:shadow-[4px_4px_0px_0px_rgba(18,18,18,0.2)] bg-white'}`}
              onClick={() => toggleSelection('featuredArchive', dest.id)}
            >
              <input type="checkbox" checked={content.featuredArchive.includes(dest.id)} readOnly className="size-5 md:size-4 accent-[#9E1B1D] cursor-pointer flex-shrink-0" />
              <span className="font-bold text-sm uppercase truncate">{dest.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VOICES FROM THE FIELD (REVIEWS) */}
      <section className="bg-[#FCFBF7] border-2 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b-2 border-[#121212] pb-4">
          <h3 className="font-black text-lg md:text-xl uppercase tracking-tight text-[#121212]">Voices from the Field</h3>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#121212] text-[#F4BF4B] px-3 py-1 shadow-[2px_2px_0px_0px_#F4BF4B]">{content.featuredReviewIds.length} Selected</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Select the authenticated reviews to display in the carousel.</p>
        
        {/* Search & Dropdown for Reviews */}
        <div className="mb-6 relative">
          <button
            onClick={() => setShowReviewDropdown(!showReviewDropdown)}
            className="w-full flex items-center justify-between p-4 border-2 border-[#121212] bg-white hover:bg-gray-50 transition-colors font-black text-xs md:text-sm uppercase tracking-widest text-left shadow-[4px_4px_0px_0px_#121212]"
          >
            <span>+ ADD REVIEW</span>
            <span className={`text-lg transition-transform duration-300 ${showReviewDropdown ? 'rotate-180' : 'rotate-0'}`}>▼</span>
          </button>
          
          {showReviewDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 border-2 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                placeholder="Search by name..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value.toLowerCase())}
                className="w-full p-3 border-b-2 border-gray-200 outline-none focus:bg-gray-50 text-sm"
              />
              
              <div className="max-h-48 md:max-h-56 overflow-y-auto">
                {availableReviews
                  .filter(review => !content.featuredReviewIds.includes(review.id) && review.travelerName.toLowerCase().includes(reviewSearchQuery))
                  .map((review, idx) => (
                    <div
                      key={review.id}
                      onClick={() => {
                        toggleSelection('featuredReviewIds', review.id);
                        setReviewSearchQuery('');
                        setShowReviewDropdown(false);
                      }}
                      className="p-3 border-b border-gray-100 hover:bg-[#F4BF4B]/20 cursor-pointer transition-colors animate-in fade-in slide-in-from-left-2 duration-200"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <p className="font-bold text-xs uppercase truncate">{review.travelerName} <span className="text-[#9E1B1D] ml-1">★ {review.rating}</span></p>
                      <p className="text-gray-600 text-[10px] md:text-[11px] italic mt-1 line-clamp-1">"{review.content}"</p>
                    </div>
                  ))}
                {availableReviews.filter(review => !content.featuredReviewIds.includes(review.id) && review.travelerName.toLowerCase().includes(reviewSearchQuery)).length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-xs animate-in fade-in duration-200">No reviews available</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Sequence Section - Compact & Distinct */}
        {content.featuredReviewIds.length > 0 && (
          <div className="mt-8 p-6 border-2 border-[#121212] bg-white shadow-[4px_4px_0px_0px_#121212]">
            <h4 className="font-black text-xs uppercase tracking-widest mb-4 text-[#121212] border-b-2 border-[#121212] pb-2 inline-block">▪ Active Sequence</h4>
            <div className="space-y-3">
              {content.featuredReviewIds.map((id, index) => {
                const review = availableReviews.find(r => r.id === id);
                return (
                  <div key={id} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FCFBF7] p-4 border-2 border-[#121212] hover:bg-[#F4BF4B]/10 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                      <span className="font-black text-xs text-gray-400 w-6 text-center flex-shrink-0 border-r-2 border-[#121212] pr-4">{index + 1}</span>
                      <span className="font-black text-xs uppercase truncate text-[#121212]">{review?.travelerName}</span>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                      <button
                        onClick={() => moveItem('featuredReviewIds', index, 'up')}
                        disabled={index === 0}
                        className="flex-1 md:flex-none p-2 bg-white border-2 border-[#121212] hover:bg-[#F4BF4B] disabled:opacity-30 disabled:cursor-not-allowed font-black text-xs transition-colors shadow-[2px_2px_0px_0px_#121212]"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveItem('featuredReviewIds', index, 'down')}
                        disabled={index === content.featuredReviewIds.length - 1}
                        className="flex-1 md:flex-none p-2 bg-white border-2 border-[#121212] hover:bg-[#F4BF4B] disabled:opacity-30 disabled:cursor-not-allowed font-black text-xs transition-colors shadow-[2px_2px_0px_0px_#121212]"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleSelection('featuredReviewIds', id)}
                        className="flex-1 md:flex-none p-2 bg-[#121212] text-[#F4BF4B] hover:bg-[#9E1B1D] hover:text-white border-2 border-[#121212] font-black text-xs transition-colors shadow-[2px_2px_0px_0px_#F4BF4B]"
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