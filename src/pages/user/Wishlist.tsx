import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Heart, Loader2, Share2, Download } from 'lucide-react';
import { getCollectionData } from '../../services/firebaseService';
import { getWishlist, removeFromWishlist, WishlistItem, exportWishlistAsCSV } from '../../services/wishlistService';
import { Package } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';

export const Wishlist = () => {
  const [savedItems, setSavedItems] = useState<WishlistItem[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    const items = getWishlist();
    setSavedItems(items);
  };

  useEffect(() => {
    const init = async () => {
      loadWishlist();
      try {
        const data = await getCollectionData<Package>('packages');
        setPackages(data);
      } catch (err) {
        console.error("Package fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    loadWishlist();
  };

  // Merge wishlist with package data for richer display
  const enrichedItems = savedItems.map(item => {
    const pkg = packages.find(p => p.id === item.destination_id || p.id === item.id);
    return { ...item, pkg };
  });

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
        {/* Header */}
        <div className="border-b-4 border-[#121212] pb-10 mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <h1 className="font-brand font-black text-[clamp(3rem,8vw,6rem)] uppercase tracking-tighter text-[#121212]">The Stash.</h1>
              <p className="font-sans font-bold text-[10px] uppercase tracking-[0.3em] opacity-50 mt-2">
                {savedItems.length} saved target{savedItems.length !== 1 ? 's' : ''} for future operations.
              </p>
            </div>
            {savedItems.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={exportWishlistAsCSV}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest hover:bg-[#F4BF4B] transition-colors"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            )}
          </div>
        </div>

        {savedItems.length === 0 ? (
          <div className="text-center py-28 border-4 border-dashed border-[#121212]/10">
            <Heart size={48} className="mx-auto mb-6 opacity-10" />
            <p className="font-brand font-black text-3xl uppercase tracking-tight mb-4 opacity-20">Your stash is empty.</p>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-gray-400 mb-10">Start saving expeditions you want to revisit.</p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-3 bg-[#121212] text-[#F4BF4B] px-10 py-5 font-black text-xs uppercase tracking-widest shadow-[6px_6px_0px_0px_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Browse Expeditions <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {enrichedItems.map((item, i) => {
                const pkg = item.pkg;
                const thumbnail = pkg?.media?.thumbnail || item.image;
                const title = pkg?.title || item.name;
                const dest = pkg?.destinations?.[0] || item.destination;
                const duration = pkg?.duration || item.duration;
                const price = pkg?.pricing?.basePrice
                  ? `₹${pkg.pricing.basePrice.toLocaleString()}`
                  : item.price;
                const slug = pkg?.slug || item.destination_id;

                return (
                  <motion.div
                    key={item.id || item.destination_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border-[3px] border-[#121212] bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center shadow-[4px_4px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <div className="w-full md:w-44 aspect-video border-2 border-[#121212] bg-[#121212] overflow-hidden shrink-0">
                      <img src={thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={title} />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="font-black text-[9px] uppercase tracking-widest text-[#9E1B1D] mb-1">{dest} • {duration}</p>
                      <h3 className="font-brand font-black text-3xl uppercase mb-2">{title}</h3>
                      <p className="font-brand font-black text-2xl text-[#121212]">{price}</p>
                    </div>
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => handleRemove(item.destination_id || item.id)}
                        className="flex-1 md:flex-none p-4 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white hover:border-[#9E1B1D] transition-colors"
                        title="Remove from stash"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </button>
                      <Link
                        to={`/itinerary/${slug}`}
                        className="flex-[3] md:flex-none bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#9E1B1D] transition-colors"
                      >
                        View <ArrowRight size={16} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Footer Actions */}
            <div className="pt-8 border-t-2 border-[#121212]/10 flex justify-between items-center">
              <p className="font-black text-[10px] uppercase tracking-widest opacity-40">{savedItems.length} items in your stash</p>
              <Link to="/destinations" className="font-black text-[10px] uppercase tracking-widest hover:text-[#9E1B1D] flex items-center gap-2 transition-colors">
                Browse More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};