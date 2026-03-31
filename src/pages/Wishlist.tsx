import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, ArrowRight, Download, Trash2, MapPin, Star, Calendar, DollarSign, AlertCircle, Package as PackageIcon } from "lucide-react";
import { getWishlist, getWishlistByCategory, removeFromWishlist, clearWishlist, exportWishlistAsCSV, getWishlistStats, WishlistItem } from "../services/wishlistService";

export const Wishlist = () => {
  const [wishlisted, setWishlisted] = useState<WishlistItem[]>([]);
  const [wishlistedByCategory, setWishlistedByCategory] = useState<Record<string, WishlistItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'saved' | 'price' | 'rating' | 'name'>('saved');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'category'>('all');

  useEffect(() => {
    setLoading(true);
    const items = getWishlist();
    const categorized = getWishlistByCategory();
    
    // Sort based on selection
    let sorted = [...items];
    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, '')));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'saved':
      default:
        sorted.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
    
    // Also sort categorized items
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
          case 'rating':
            return b.rating - a.rating;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'saved':
          default:
            return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        }
      });
    });
    
    setWishlisted(sorted);
    setWishlistedByCategory(categorized);
    setLoading(false);
  }, [sortBy]);

  const handleRemove = (id: string) => {
    removeFromWishlist(id);
    setWishlisted(prev => prev.filter(item => item.destination_id !== id));
  };

  const handleClearAll = () => {
    clearWishlist();
    setWishlisted([]);
    setShowClearConfirm(false);
  };

  const stats = getWishlistStats();

  return (
    <div className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart size={32} className="text-red-500 fill-red-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            <p className="text-gray-600">Your collection of dream destinations</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {wishlisted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12"
          >
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="text-3xl font-bold text-teal-700 mb-2">{stats.count}</div>
              <p className="text-gray-600 text-sm">Total Saved</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.destinationCount}</div>
              <p className="text-gray-600 text-sm">Destinations</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.packageCount}</div>
              <p className="text-gray-600 text-sm">Packages</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="text-3xl font-bold text-orange-500 mb-2">{stats.avgRating}</div>
              <p className="text-gray-600 text-sm">Avg Rating</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft hover:shadow-soft-lg transition-all">
              <div className="text-3xl font-bold text-teal-700 mb-2">₹{(stats.totalPrice / 100000).toFixed(0)}L+</div>
              <p className="text-gray-600 text-sm">Budget Range</p>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        {wishlisted.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 mb-8 flex-wrap items-center justify-between"
          >
            <div className="flex gap-3 flex-wrap items-center">
              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'all'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setViewMode('category')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'category'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  By Category
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-teal-700 focus:outline-none focus:border-teal-700"
              >
                <option value="saved">Newest Saved</option>
                <option value="price">Price (High to Low)</option>
                <option value="rating">Best Rated</option>
                <option value="name">Alphabetical</option>
              </select>

              <button
                onClick={() => exportWishlistAsCSV()}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 font-medium text-sm"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </motion.div>
        )}

        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clear Wishlist?</h3>
              <p className="text-gray-600 mb-6">This will permanently delete all {wishlisted.length} saved destinations.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Wishlist Items Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <Heart size={32} className="text-teal-700" />
            </div>
            <p className="text-gray-600 mt-4">Loading wishlist...</p>
          </div>
        ) : wishlisted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300"
          >
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start exploring and save your favorite destinations!</p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
            >
              Explore Destinations <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : viewMode === 'category' ? (
          // Category View
          <div className="space-y-12 mb-12">
            {Object.entries(wishlistedByCategory).map(([category, items]) => (
              items.length > 0 && (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {category === 'Destination' ? (
                      <MapPin size={24} className="text-blue-600" />
                    ) : (
                      <PackageIcon size={24} className="text-purple-600" />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category}s</h2>
                      <p className="text-sm text-gray-600">{items.length} {category.toLowerCase()}{items.length !== 1 ? 's' : ''} saved</p>
                    </div>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.destination_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-teal-300 hover:shadow-soft-lg transition-all group"
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              category === 'Destination' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemove(item.destination_id)}
                            className="absolute top-4 right-4 bg-white hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                          >
                            <Heart size={20} className="text-red-500 fill-red-500" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                          </div>

                          <div className="flex items-center gap-1 text-yellow-500 mb-3">
                            {Array(5).fill(null).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(item.rating) ? 'fill-yellow-400' : ''}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-2">({item.rating})</span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-teal-700" />
                              {item.destination}
                            </div>
                            {item.region && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Region:</span>
                                <span className="text-gray-700 font-medium">{item.region}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-teal-700" />
                              {item.duration}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign size={14} className="text-teal-700" />
                              {item.price}
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mb-4">
                            Saved {new Date(item.savedAt).toLocaleDateString('en-IN')}
                          </p>

                          <Link
                            to={`/itinerary/${item.destination_id}`}
                            className="w-full py-2 bg-teal-700 text-white font-semibold text-center rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            View Details <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        ) : (
          // All Items View (flat grid)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {wishlisted.map((item, idx) => (
              <motion.div
                key={item.destination_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-teal-300 hover:shadow-soft-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      item.category === 'Destination' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.destination_id)}
                    className="absolute top-4 right-4 bg-white hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    <Heart size={20} className="text-red-500 fill-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500 mb-3">
                    {Array(5).fill(null).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(item.rating) ? 'fill-yellow-400' : ''}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-2">({item.rating})</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-teal-700" />
                      {item.destination}
                    </div>
                    {item.region && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Region:</span>
                        <span className="text-gray-700 font-medium">{item.region}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-teal-700" />
                      {item.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-teal-700" />
                      {item.price}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Saved {new Date(item.savedAt).toLocaleDateString('en-IN')}
                  </p>

                  <Link
                    to={`/itinerary/${item.destination_id}`}
                    className="w-full py-2 bg-teal-700 text-white font-semibold text-center rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {wishlisted.length > 0 && wishlisted.length < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Want to save more destinations?</h2>
            <p className="text-teal-100 mb-8">Explore our collection of curated travel experiences and build your perfect itinerary.</p>
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
            >
              Explore All Destinations <ArrowRight size={20} />
            </Link>
          </motion.div>
        )}

        {/* Rest of page */}
      </div>
    </div>
  );
};
