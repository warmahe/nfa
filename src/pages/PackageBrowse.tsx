import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Clock, MapPin, Filter, ChevronDown, Scale, Bell, Heart } from "lucide-react";
import { PACKAGES } from "../constants";
import { motion } from "motion/react";
import {
  addToComparison,
  getComparisonCount,
  isInComparison,
  getMaxComparisonItems,
} from "../services/comparisonService";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../services/wishlistService";
import { ComparisonModal } from "../components/ComparisonModal";
import { PriceAlertModal } from "../components/PriceAlertModal";

export const PackageBrowse = () => {
  const [sortBy, setSortBy] = useState("popularity");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [showNotification, setShowNotification] = useState("");
  const [addedPackageId, setAddedPackageId] = useState<string | null>(null);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedPackageForAlert, setSelectedPackageForAlert] = useState<typeof PACKAGES[0] | null>(null);
  const [wishlistedPackages, setWishlistedPackages] = useState<Set<string>>(new Set(
    PACKAGES.map(p => p.id).filter(id => isInWishlist(id))
  ));

  // Update comparison count on mount and when modal closes
  useEffect(() => {
    setComparisonCount(getComparisonCount());
  }, [isComparisonModalOpen]);

  const handleAddToComparison = (e: React.MouseEvent, pkg: typeof PACKAGES[0]) => {
    e.preventDefault();
    const added = addToComparison(pkg);

    if (added) {
      setComparisonCount(getComparisonCount());
      setAddedPackageId(pkg.id);
      setShowNotification(`"${pkg.title}" added to comparison`);
      setTimeout(() => setShowNotification(""), 3000);
      setTimeout(() => setAddedPackageId(null), 300);
    } else if (isInComparison(pkg.id)) {
      setShowNotification("Already in comparison");
      setTimeout(() => setShowNotification(""), 2000);
    } else {
      setShowNotification("Comparison limit reached (max 3)");
      setTimeout(() => setShowNotification(""), 3000);
    }
  };

  // Handle toggle wishlist for packages
  const handleToggleWishlist = (e: React.MouseEvent, pkg: typeof PACKAGES[0]) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(pkg.id)) {
      removeFromWishlist(pkg.id);
      setWishlistedPackages(prev => {
        const updated = new Set(prev);
        updated.delete(pkg.id);
        return updated;
      });
    } else {
      addToWishlist({
        id: pkg.id,
        name: pkg.title,
        destination_id: pkg.id,
        image: pkg.image,
        destination: pkg.destination,
        price: pkg.price,
        rating: pkg.rating,
        duration: pkg.duration,
        category: 'Package'
      });
      setWishlistedPackages(prev => new Set([...prev, pkg.id]));
    }
  };

  const sortOptions = [
    { value: "popularity", label: "Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Rating: High to Low" },
    { value: "duration", label: "Duration: Short to Long" }
  ];

  // Get unique destinations
  const destinations = ["All", ...new Set(PACKAGES.map(p => p.destination))];

  // Helper function to extract price value
  const getPriceValue = (priceStr: string): number => {
    const numStr = priceStr.replace(/[^0-9]/g, "");
    return parseInt(numStr) || 0;
  };

  // Helper function to extract duration value
  const getDurationValue = (durationStr: string): number => {
    const numStr = durationStr.replace(/[^0-9]/g, "");
    return parseInt(numStr) || 0;
  };

  const filteredPackages = useMemo(() => {
    let packages = PACKAGES.filter(pkg => {
      // Filter by destination
      if (selectedDestination !== "All" && pkg.destination !== selectedDestination) return false;

      // Filter by search term
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = pkg.title.toLowerCase().includes(searchLower);
        const matchesDesc = pkg.description.toLowerCase().includes(searchLower);
        const matchesDest = pkg.destination.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc && !matchesDest) return false;
      }

      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        packages.sort((a, b) => getPriceValue(a.price) - getPriceValue(b.price));
        break;
      case "price-high":
        packages.sort((a, b) => getPriceValue(b.price) - getPriceValue(a.price));
        break;
      case "rating":
        packages.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        packages.sort((a, b) => getDurationValue(a.duration) - getDurationValue(b.duration));
        break;
      case "popularity":
      default:
        // Keep original order
        break;
    }

    return packages;
  }, [selectedDestination, searchTerm, sortBy]);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 pb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Our Travel Packages
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mb-8">
            Discover our curated collection of premium travel experiences designed for the discerning explorer
          </p>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search packages by title, destination, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-700 transition-colors text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Destination Filter */}
          <div className="flex gap-3 flex-wrap">
            {destinations.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  selectedDestination === dest
                    ? "bg-teal-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Counter & Sort */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-gray-600 font-medium">
            Found <span className="text-teal-700 font-bold">{filteredPackages.length}</span> package{filteredPackages.length !== 1 ? 's' : ''}
          </p>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-teal-700 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-sm"
            >
              <span>Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}</span>
              <ChevronDown size={18} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-56">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors text-sm ${
                      sortBy === option.value
                        ? 'bg-teal-50 border-l-4 border-teal-700 text-teal-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map(pkg => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-teal-300 transition-all group shadow-soft hover:shadow-soft-lg"
            >
              {/* Image Section */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-soft">
                  {pkg.price}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => handleToggleWishlist(e, pkg)}
                  className="absolute bottom-4 right-4 bg-white hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                >
                  <Heart 
                    size={20} 
                    className={wishlistedPackages.has(pkg.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                  />
                </button>
              </div>

              {/* Content Section */}
              <div className="p-8 flex flex-col h-full">
                {/* Destination + Rating */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">
                    {pkg.destination}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} className="fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">{pkg.rating}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-700 transition-colors leading-tight">
                  {pkg.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-2">
                  {pkg.description}
                </p>

                {/* Duration Badge */}
                <div className="flex items-center gap-2 mb-6 text-teal-700">
                  <Clock size={18} className="fill-teal-700" />
                  <span className="font-bold text-sm">{pkg.duration}</span>
                </div>

                {/* Divider Line */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* Buttons Container */}
                <div className="flex gap-3 flex-col">
                  {/* Book Now Button */}
                  <Link
                    to={`/itinerary/${pkg.id}`}
                    className="w-full py-4 bg-teal-700 text-white font-semibold text-center rounded-xl hover:bg-teal-800 transition-all flex items-center justify-center gap-3 group/btn text-base shadow-soft hover:shadow-soft-lg"
                  >
                    Explore Package <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    {/* Compare Button */}
                    <button
                      onClick={(e) => handleAddToComparison(e, pkg)}
                      className={`flex-1 py-3 font-semibold text-center rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-soft hover:shadow-soft-lg ${
                        isInComparison(pkg.id)
                          ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${addedPackageId === pkg.id ? "scale-95" : "scale-100"}`}
                      title={isInComparison(pkg.id) ? "Remove from comparison" : "Add to comparison"}
                    >
                      <Scale size={18} />
                      Compare
                    </button>

                    {/* Price Alert Button */}
                    <button
                      onClick={() => {
                        setSelectedPackageForAlert(pkg);
                        setPriceAlertModalOpen(true);
                      }}
                      className="flex-1 py-3 font-semibold text-center rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-soft hover:shadow-soft-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                      title="Set price alert"
                    >
                      <Bell size={18} />
                      Alert
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Filter size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-6">
              No packages found matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedDestination("All");
                setSearchTerm("");
                setSortBy("popularity");
              }}
              className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Floating Comparison Button */}
        {comparisonCount > 0 && (
          <motion.button
            onClick={() => setIsComparisonModalOpen(true)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 z-40"
          >
            <Scale size={20} />
            <span>Compare ({comparisonCount})</span>
          </motion.button>
        )}

        {/* Notification Toast */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-2 z-50 border-l-4 border-teal-600"
          >
            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
            <p className="text-gray-900 font-medium">{showNotification}</p>
          </motion.div>
        )}

        {/* Comparison Modal */}
        <ComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
        />

        {/* Price Alert Modal */}
        {selectedPackageForAlert && (
          <PriceAlertModal
            isOpen={priceAlertModalOpen}
            onClose={() => {
              setPriceAlertModalOpen(false);
              setSelectedPackageForAlert(null);
            }}
            packageId={selectedPackageForAlert.id}
            packageTitle={selectedPackageForAlert.title}
            destination={selectedPackageForAlert.destination}
            currentPrice={selectedPackageForAlert.price}
            onAlertCreated={() => {
              setShowNotification("Price alert created!");
              setTimeout(() => setShowNotification(""), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
};
