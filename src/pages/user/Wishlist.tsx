import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { getCollectionData } from '../../services/firebaseService';
import { Package } from '../../types/database';

export const Wishlist = () => {
  const [savedItems, setSavedItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await getCollectionData<Package>('packages');
        // Demo: take first two as "saved"
        setSavedItems(data.slice(0, 2));
      } catch (err) {
        console.error("Wishlist fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex items-center justify-center">
         <Loader2 className="animate-spin text-[#9E1B1D]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-5xl mx-auto">
        <div className="border-b-4 border-[#121212] pb-10 mb-16">
          <h1 className="font-brand font-black text-[clamp(3rem,8vw,6rem)] uppercase tracking-tighter text-[#121212]">The Stash.</h1>
          <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] opacity-50">Saved targets for future operations.</p>
        </div>

        {savedItems.length === 0 ? (
          <div className="text-center py-20 border-4 border-dashed border-[#121212]/10">
             <Heart size={40} className="mx-auto mb-4 opacity-10" />
             <p className="font-sans font-bold text-xs uppercase tracking-widest text-gray-400">Your stash is currently empty.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedItems.map((item) => (
              <div key={item.id} className="group border-[3px] border-[#121212] bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-[4px_4px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="w-full md:w-40 aspect-square border-2 border-[#121212] bg-[#121212] overflow-hidden">
                  <img src={item.media?.thumbnail} className="w-full h-full object-cover opacity-80" alt={item.title} />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-brand font-black text-3xl uppercase mb-2">{item.title}</h3>
                  <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-[#9E1B1D] mb-6">{item.destinations?.[0]} // {item.duration}</p>
                </div>
                <div className="flex flex-row md:flex-col gap-4 w-full md:w-auto">
                  <button className="flex-1 md:flex-none p-4 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <Link to={`/itinerary/${item.slug || item.id}`} className="flex-[3] md:flex-none bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#9E1B1D] transition-colors">
                    View <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};