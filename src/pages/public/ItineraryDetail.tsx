import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useSearchParams } from "react-router-dom";
import { DetailGallery } from "../../components/itinerary/DetailGallery";
import { DetailOverview } from "../../components/itinerary/DetailOverview";
import { DetailItinerary } from "../../components/itinerary/DetailItinerary";
import { DetailReviews } from "../../components/itinerary/DetailReviews";
import { BookingSidebar } from "../../components/itinerary/BookingSidebar";
import { InclusionsLayout } from "../../components/itinerary/InclusionsLayout";
import { JoiningPointsDisplay } from "../../components/itinerary/JoiningPointsDisplay";
import { getDocumentsWithCondition, getDocumentById, getSubcollectionData, updateDocument } from '../../services/firebaseService';
import { Package, Activity } from '../../types/database';
import { Save, Settings, Eye, X, Check } from 'lucide-react';
import { PACKAGES } from "../../utils/constants";

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageData = () => {
      setLoading(true);
      // PURE STATIC FETCH
      const staticPkg = PACKAGES.find(p => p.id === id || p.slug === id);
      if (staticPkg) {
        setPkg(staticPkg as any);
        // Static activities if any (we don't have them in constants yet, but we'll use empty for now)
        setActivities([]); 
      }
      setLoading(false);
    };
    
    fetchPackageData();
  }, [id]);



  const handleGlobalSave = async () => {
    if (!pkg) return;
    setSaveStatus('saving');
    try {
      await updateDocument('packages', pkg.id, {
        ...pkg,
        updatedAt: new Date()
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      alert("Failed to save changes.");
      setSaveStatus('idle');
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center font-black text-2xl uppercase tracking-widest text-[#121212]">Loading Journey...</div>;
  }

  if (error || !pkg) {
     return (
       <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center gap-6">
         <div className="font-black text-2xl uppercase tracking-widest text-[#9E1B1D]">{error || 'Package not found'}</div>
         <Link to="/destinations" className="bg-[#121212] text-white px-8 py-3 font-black uppercase tracking-widest hover:bg-[#F4BF4B] hover:text-[#121212] transition-colors">
            Return to Destinations
         </Link>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] nfa-texture selection:bg-nfa-gold pb-20">
      {/* ADMIN TOOLBAR */}
      {isEditing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-[#121212] border-2 border-[#F4BF4B] p-4 flex items-center gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] animate-in slide-in-from-top-10 duration-500">
           <div className="flex items-center gap-4 border-r border-white/20 pr-8">
              <div className="w-3 h-3 bg-[#F4BF4B] animate-pulse rounded-full" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">Live Editor Active</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={handleGlobalSave}
                disabled={saveStatus === 'saving'}
                className="bg-[#F4BF4B] text-[#121212] px-6 py-2 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
              >
                {saveStatus === 'saving' ? 'Processing...' : saveStatus === 'success' ? <><Check size={14} /> Saved</> : <><Save size={14} /> Commit Changes</>}
              </button>
              
              <Link 
                to={`/itinerary/${pkg.slug}`}
                className="bg-white/10 text-white px-6 py-2 border border-white/20 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Eye size={14} /> Preview
              </Link>

              <Link 
                to="/admin"
                className="text-white/40 hover:text-white transition-colors"
                title="Exit to Admin"
              >
                <X size={20} />
              </Link>
           </div>
        </div>
      )}

      {/* 1. Immersive Header */}
      <DetailGallery pkg={pkg} isEditing={isEditing} onUpdate={(data) => setPkg(prev => prev ? {...prev, ...data} : null)} />

      {/* 2. Content Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        
        {/* Left Side: Editorial Storytelling */}
        <div className="lg:col-span-8 space-y-24">
          <DetailOverview pkg={pkg} isEditing={isEditing} onUpdate={(data) => setPkg(prev => prev ? {...prev, ...data} : null)} />
          <JoiningPointsDisplay packageId={pkg.id} packageTitle={pkg.title} isEditing={isEditing} />
          <DetailItinerary pkg={pkg} activities={activities} isEditing={isEditing} />
          <InclusionsLayout packageId={pkg.id} isEditing={isEditing} />
          <DetailReviews />
        </div>

        {/* Right Side: Price & Booking */}
        <div className="lg:col-span-4">
          <BookingSidebar pkg={pkg} travelers={travelers} setTravelers={setTravelers} isEditing={isEditing} onUpdate={(data) => setPkg(prev => prev ? {...prev, ...data} : null)} />
          
          <div className="mt-12 p-8 border-4 border-dashed border-[#121212]/20 text-center">
             <p className="font-serif italic text-[#121212]/60 mb-4">"This isn't a tour. This is a transformation. We only take {pkg.maxTravelers} people per group to protect the magic."</p>
             <span className="font-black text-[10px] uppercase tracking-widest">— NFA Founders</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {!isEditing && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212] border-t-4 border-[#F4BF4B] p-5 z-[100] flex justify-between items-center shadow-2xl">
           <div>
              <span className="text-[8px] font-black text-white/40 block tracking-widest uppercase">Investment</span>
              <span className="text-2xl font-black text-[#F4BF4B]">{pkg.pricing.basePrice} {pkg.pricing.currency}</span>
           </div>
           <button className="bg-[#F4BF4B] text-[#121212] px-8 py-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
              Apply Now
           </button>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetail;