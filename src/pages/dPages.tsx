import React, { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, Star, Clock, MapPin, Search, Filter, X, ChevronDown, Map, List, Settings, Mail, Trash2, Heart } from "lucide-react";
import { DESTINATIONS, PACKAGES, BLOG_POSTS } from "../constants";
import { motion } from "motion/react";
import { getAllEmailNotifications, clearAllNotifications } from "../services/emailService";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../services/wishlistService";
import { DestinationMap } from "../components/DestinationMap";
import { NotificationPreferences } from "../components/NotificationPreferences";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { ComprehensiveAdminDashboard } from "../components/admin/ComprehensiveAdminDashboard";
import { AdminBookingManager } from "../components/admin/AdminBookingManager";
import { getCollectionData } from "../services/firebaseService";

export const Destinations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filterRegion, setFilterRegion] = useState("All");
  const [sortBy, setSortBy] = useState("popularity");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [selectedVisaType, setSelectedVisaType] = useState("All");
  const [selectedTravelType, setSelectedTravelType] = useState("All");
  const [selectedMapDestination, setSelectedMapDestination] = useState<string | undefined>(undefined);
  const [wishlistedDestinations, setWishlistedDestinations] = useState<Set<string>>(new Set(
    DESTINATIONS.map(d => d.id).filter(id => isInWishlist(id))
  ));

  // Extract search parameters from URL
  const searchDestination = searchParams.get("destination") || "";
  const minBudgetParam = parseInt(searchParams.get("minBudget") || "0");
  const maxBudgetParam = parseInt(searchParams.get("maxBudget") || "1000000");
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const travelersParam = parseInt(searchParams.get("travelers") || "0");
  const tripTypeParam = searchParams.get("tripType") || "";
  const activitiesParam = searchParams.get("activities") ? searchParams.get("activities")?.split(",") : [];

  // Helper function to remove a specific filter from URL
  const removeFilter = (filterName: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterName);
    navigate(`/destinations${newParams.toString() ? `?${newParams.toString()}` : ''}`, { replace: true });
  };

  // Handle destination selection from map
  const handleDestinationSelect = (destinationKey: string, destinationName: string) => {
    setSelectedMapDestination(destinationKey);
    // Navigate to itinerary for the selected destination
    navigate(`/itinerary/${destinationKey}`);
  };

  // Handle toggle wishlist for destination
  const handleToggleWishlist = (e: React.MouseEvent, destination: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(destination.id)) {
      removeFromWishlist(destination.id);
      setWishlistedDestinations(prev => {
        const updated = new Set(prev);
        updated.delete(destination.id);
        return updated;
      });
    } else {
      addToWishlist({
        id: destination.id,
        name: destination.name,
        destination_id: destination.id,
        image: destination.image,
        destination: destination.name,
        price: destination.price,
        rating: destination.rating,
        duration: destination.duration,
        category: 'Destination',
        region: destination.region,
        travelType: destination.travelType,
        difficulty: destination.difficulty
      });
      setWishlistedDestinations(prev => new Set([...prev, destination.id]));
    }
  };

  // Helper function to extract price value
  const getPriceValue = (priceStr: string): number => {
    const numStr = priceStr.replace(/[^0-9]/g, "");
    return parseInt(numStr) || 0;
  };

  const sortOptions = [
    { value: "popularity", label: "Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Rating: High to Low" },
    { value: "duration", label: "Duration" }
  ];

  const filteredDestinations = useMemo(() => {
    let destinations = DESTINATIONS.filter(dest => {
      // Filter by region
      if (filterRegion !== "All" && dest.region !== filterRegion) return false;

      // Filter by destination name/region search
      if (searchDestination.trim()) {
        const searchLower = searchDestination.toLowerCase();
        const matchesName = dest.name.toLowerCase().includes(searchLower);
        const matchesRegion = dest.region.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesRegion) return false;
      }

      // Filter by budget range
      const destPrice = getPriceValue(dest.price);
      if (destPrice < minBudgetParam || destPrice > maxBudgetParam) return false;

      // Filter by difficulty
      if (selectedDifficulty !== "All" && dest.difficulty !== selectedDifficulty) return false;

      // Filter by season
      if (selectedSeason !== "All" && dest.season !== selectedSeason) return false;

      // Filter by visa type
      if (selectedVisaType !== "All" && dest.visaType !== selectedVisaType) return false;

      // Filter by travel type
      if (selectedTravelType !== "All" && dest.travelType !== selectedTravelType) return false;

      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        destinations.sort((a, b) => getPriceValue(a.price) - getPriceValue(b.price));
        break;
      case "price-high":
        destinations.sort((a, b) => getPriceValue(b.price) - getPriceValue(a.price));
        break;
      case "rating":
        destinations.sort((a, b) => b.rating - a.rating);
        break;
      case "duration":
        destinations.sort((a, b) => {
          const aDays = parseInt(a.duration) || 0;
          const bDays = parseInt(b.duration) || 0;
          return aDays - bDays;
        });
        break;
      case "popularity":
      default:
        // Keep original order
        break;
    }

    return destinations;
  }, [filterRegion, searchDestination, minBudgetParam, maxBudgetParam, sortBy, selectedDifficulty, selectedSeason, selectedVisaType, selectedTravelType]);

  const regions = ["All", ...new Set(DESTINATIONS.map(d => d.region))];

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="mb-12 pb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">Explore Our Destinations</h1>
          <p className="text-gray-600 text-lg max-w-2xl mb-8">Discover the world's most beautiful and exotic travel destinations handpicked for you</p>

          {/* Active Filters Summary */}
          {(searchDestination || minBudgetParam !== 0 || maxBudgetParam !== 1000000 || checkInParam || checkOutParam || travelersParam > 0 || tripTypeParam || (activitiesParam && activitiesParam.length > 0)) && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <div className="mb-3">
                <div className="text-sm font-semibold text-gray-900 mb-3">Active Filters:</div>
                <div className="flex flex-wrap gap-2">
                  {/* Destination Filter */}
                  {searchDestination && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <MapPin size={14} className="text-teal-700" />
                      <span className="text-gray-700">{searchDestination}</span>
                      <button
                        onClick={() => removeFilter("destination")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove destination filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Budget Filter */}
                  {(minBudgetParam !== 0 || maxBudgetParam !== 1000000) && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">₹{minBudgetParam.toLocaleString()} - ₹{maxBudgetParam.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          removeFilter("minBudget");
                          removeFilter("maxBudget");
                        }}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove budget filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Check-in Date Filter */}
                  {checkInParam && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">Check-in: {checkInParam}</span>
                      <button
                        onClick={() => removeFilter("checkIn")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove check-in filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Check-out Date Filter */}
                  {checkOutParam && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">Check-out: {checkOutParam}</span>
                      <button
                        onClick={() => removeFilter("checkOut")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove check-out filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Travelers Filter */}
                  {travelersParam > 0 && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">Travelers: {travelersParam}</span>
                      <button
                        onClick={() => removeFilter("travelers")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove travelers filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Trip Type Filter */}
                  {tripTypeParam && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">Trip: {tripTypeParam}</span>
                      <button
                        onClick={() => removeFilter("tripType")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove trip type filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Activities Filter */}
                  {activitiesParam && activitiesParam.length > 0 && (
                    <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-full text-xs font-medium border border-teal-300 hover:border-teal-400 transition-colors">
                      <span className="text-gray-700">Activities: {activitiesParam.join(", ")}</span>
                      <button
                        onClick={() => removeFilter("activities")}
                        className="text-teal-600 hover:text-teal-800 ml-1 transition-colors"
                        title="Remove activities filter"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Clear All Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFilterRegion("All");
                    setSortBy("popularity");
                    navigate('/destinations', { replace: true });
                  }}
                  className="text-teal-700 hover:text-teal-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Region Filter */}
          <div className="flex gap-3 flex-wrap">
            {regions.map(region => (
              <button 
                key={region}
                onClick={() => setFilterRegion(region)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  filterRegion === region 
                    ? "bg-teal-700 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter & Sort & View Toggle */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-gray-600 font-medium">
            Found <span className="text-teal-700 font-bold">{filteredDestinations.length}</span> destination{filteredDestinations.length !== 1 ? 's' : ''}
          </p>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-gray-300 rounded-lg p-1 bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded transition-colors flex items-center gap-1 ${
                  viewMode === "grid"
                    ? "bg-teal-700 text-white"
                    : "text-gray-700 hover:text-teal-700"
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-2 rounded transition-colors flex items-center gap-1 ${
                  viewMode === "map"
                    ? "bg-teal-700 text-white"
                    : "text-gray-700 hover:text-teal-700"
                }`}
              >
                <Map size={18} />
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                showAdvancedFilters
                  ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
                  : "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              <Settings size={18} /> Advanced
            </button>

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
                      } ${option.value === sortOptions[0].value ? 'border-t rounded-t-lg' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-orange-700 mb-6">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Difficulty Level</label>
                <div className="space-y-2">
                  {["All", "Easy", "Moderate", "Challenging", "Expert"].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === level
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best Season */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Best Season</label>
                <div className="space-y-2">
                  {["All", "Spring", "Summer", "Autumn", "Winter"].map(season => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSeason === season
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      {season}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visa Requirements */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Visa Required</label>
                <div className="space-y-2">
                  {["All", "None", "E-Visa", "Standard", "Special Permit"].map(visa => (
                    <button
                      key={visa}
                      onClick={() => setSelectedVisaType(visa)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedVisaType === visa
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      {visa}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Travel Type</label>
                <div className="space-y-2">
                  {["All", "Adventure", "Cultural", "Luxury", "Wildlife"].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedTravelType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTravelType === type
                          ? "bg-orange-500 text-white border border-orange-500"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-orange-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Advanced Filters */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-orange-200">
              <button
                onClick={() => {
                  setSelectedDifficulty("All");
                  setSelectedSeason("All");
                  setSelectedVisaType("All");
                  setSelectedTravelType("All");
                }}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="text-xs font-medium bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Grid/Map View */}
        {viewMode === "grid" ? (
          <>
            {/* Destinations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map(dest => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-teal-300 transition-all group shadow-soft"
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20" />
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleToggleWishlist(e, dest)}
                      className="absolute top-4 right-4 bg-white hover:bg-red-50 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                    >
                      <Heart 
                        size={20} 
                        className={wishlistedDestinations.has(dest.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col h-full">
                    {/* Region Tag + Rating Row */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">{dest.region}</span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={16} className="fill-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">{dest.rating}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors leading-tight">{dest.name}</h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">{dest.description}</p>

                    {/* Duration Badge */}
                    <div className="flex items-center gap-2 mb-6 text-teal-700">
                      <Clock size={20} className="fill-teal-700" />
                      <span className="font-bold text-sm">{dest.duration}</span>
                    </div>

                    {/* Price */}
                    <div className="mb-3 text-lg font-bold text-teal-700">{dest.price}</div>

                    {/* Divider Line */}
                    <div className="border-t border-gray-200 mb-6"></div>

                    {/* View Details Button */}
                    <Link 
                      to={`/itinerary/${dest.id}`} 
                      className="w-full py-4 bg-teal-700 text-white font-semibold text-center rounded-xl hover:bg-teal-800 transition-all flex items-center justify-center gap-3 group/btn text-base shadow-soft hover:shadow-soft-lg"
                    >
                      View Details <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Map View */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl border-2 border-teal-200 p-8 mb-8">
              <h3 className="text-xl font-bold text-teal-700 mb-6">Destination Map</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Map */}
                <DestinationMap 
                  height="400px" 
                  selectedDestination={selectedMapDestination}
                  onDestinationSelect={handleDestinationSelect}
                />

                {/* Locations List */}
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-900 mb-4">Currently Viewing {filteredDestinations.length} Destinations</div>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {filteredDestinations.map((dest, idx) => (
                      <motion.div
                        key={dest.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedMapDestination(dest.id.toUpperCase())}
                        className={`border border-gray-200 p-4 rounded-lg hover:border-teal-300 hover:shadow-soft-lg transition-all cursor-pointer group ${
                          selectedMapDestination === dest.id.toUpperCase()
                            ? "bg-teal-50 border-teal-400 shadow-soft-lg"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl font-bold text-teal-700 opacity-40 min-w-8">{idx + 1}</div>
                          <div className="flex-1">
                            <h4 className={`font-bold group-hover:text-teal-700 ${
                              selectedMapDestination === dest.id.toUpperCase()
                                ? "text-teal-700"
                                : "text-gray-900"
                            }`}>{dest.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{dest.region}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star size={12} className="fill-yellow-400" />
                                <span className="text-xs font-semibold text-gray-700">{dest.rating}</span>
                              </div>
                              <span className="text-xs font-bold text-teal-700">{dest.price}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {filteredDestinations.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-6">No destinations found matching your filters.</p>
            <button
              onClick={() => {
                setFilterRegion("All");
                setSortBy("popularity");
                navigate('/destinations', { replace: true });
              }}
              className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Clear Filters & Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import ItineraryDetailComponent from './ItineraryDetail';

export const ItineraryDetail = () => {
  return <ItineraryDetailComponent />;
};

export const About = () => {
  const teamMembers = [
    { name: "Catherine Dubois", role: "Founder & CEO", bio: "25+ years of luxury travel & expedition design", avatar: "CD" },
    { name: "Marcus Johnson", role: "Head of Operations", bio: "Former mountain guide with 40+ summits", avatar: "MJ" },
    { name: "Rajesh Kumar", role: "Regional Director, Asia", bio: "Expert in Southeast Asian logistics", avatar: "RK" },
    { name: "Elena Salvini", role: "Experience Designer", bio: "Award-winning travel journalist", avatar: "ES" },
    { name: "James Wilson", role: "Safety Director", bio: "Mountain rescue specialist", avatar: "JW" },
    { name: "Amara Okonkwo", role: "Community Relations", bio: "Sustainable tourism advocate", avatar: "AO" }
  ];

  const awards = [
    { year: "2025", title: "Best Luxury Adventure Operator", org: "International Travel Awards" },
    { year: "2024", title: "Sustainable Tourism Champion", org: "Green Travel Community" },
    { year: "2023", title: "Innovation in Expedition Design", org: "Adventure Travel World Summit" }
  ];

  const milestones = [
    { year: "2020", title: "1 Million Travelers Served", description: "Reached new milestone in customer base" },
    { year: "2021", title: "45 New Destinations", description: "Expanded to emerging adventure markets" },
    { year: "2022", title: "Carbon Neutral Operations", description: "Achieved full carbon neutrality" },
    { year: "2023", title: "250+ Local Partners", description: "Global network of trusted community partners" },
    { year: "2024", title: "$50M Community Investment", description: "Direct support to local economies" },
    { year: "2026", title: "Green Expedition Fleet", description: "Transitioned to eco-friendly transport" }
  ];

  const stats = [
    { number: "25+", label: "Years Experience" },
    { number: "120+", label: "Destinations" },
    { number: "50,000+", label: "Happy Travelers" },
    { number: "250+", label: "Local Partners" }
  ];

  return (
    <div className="pt-20 min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">About NO FIXED ADDRESS</h1>
        <p className="text-2xl text-teal-700 font-bold mb-12">Redefining the art of premium travel experiences</p>
        
        <div className="space-y-8 text-lg leading-relaxed text-gray-700 mb-20">
          <p className="border-l-4 border-teal-700 pl-6">
            Founded with a vision to create transformative travel experiences that transcend ordinary tourism, NO FIXED ADDRESS specializes in curating bespoke journeys to the world's most extraordinary and remote locations.
          </p>
          
          <p>
            We understand that true travel is about discovery, adventure, and stepping beyond your comfort zone. Our team of expert guides, local fixers, and logistics coordinators work seamlessly to ensure every moment of your journey is perfectly orchestrated yet feels organically authentic.
          </p>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 my-12">
            <h3 className="text-2xl font-bold text-teal-700 mb-4">Our Philosophy</h3>
            <p className="text-gray-700">
              Travel should challenge you, inspire you, and transform your perspective. We're committed to sustainable, respectful tourism that enriches both the traveler and the destinations we visit. Every expedition is designed with cultural sensitivity, environmental consciousness, and safety as our paramount concerns.
            </p>
          </div>

          <p>
            With offices in Geneva, Reykjavik, Kathmandu, and Kyoto, we maintain a global network of trusted partners who share our commitment to excellence and authenticity in travel experiences.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 py-12 border-y border-gray-200">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-teal-700 mb-2">{stat.number}</div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:border-teal-500 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-teal-700 flex items-center justify-center text-white text-xl font-bold">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm font-semibold text-teal-700">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Awards & Recognition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {awards.map((award, idx) => (
              <div key={idx} className="bg-gradient-to-br from-orange-50 to-teal-50 border border-orange-200 rounded-lg p-8">
                <p className="text-sm font-bold text-orange-600 mb-2">{award.year}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{award.title}</h3>
                <p className="text-gray-700">{award.org}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Milestones */}
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Our Journey</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-700 to-orange-500"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {milestones.map((milestone, idx) => (
                <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  {/* Content */}
                  <div className="flex-1 md:w-1/2">
                    <div className={`bg-white border border-gray-200 rounded-lg p-6 hover:border-teal-500 hover:shadow-lg transition-all ${
                      idx % 2 === 0 ? 'md:text-right' : ''
                    }`}>
                      <p className="text-xl font-bold text-teal-700 mb-2">{milestone.year}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-700">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="flex-shrink-0 w-4 h-4 bg-teal-700 rounded-full border-4 border-white shadow-md md:absolute md:left-1/2 md:transform md:-translate-x-1/2"></div>

                  {/* Spacer */}
                  <div className="hidden md:flex flex-1 md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 pt-20 border-t border-gray-200">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Join Our Adventure Community</h3>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Experience the world with purpose. Every journey fuels our mission to make travel more meaningful, sustainable, and transformative.
            </p>
            <Link to="/packages" className="inline-block px-8 py-3 bg-white text-teal-700 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Explore Our Expeditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [showEmailNotifications, setShowEmailNotifications] = useState(false);
  const notifications = getAllEmailNotifications();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleClearNotifications = () => {
    if (window.confirm('Clear all email notifications? This cannot be undone.')) {
      clearAllNotifications();
      setShowEmailNotifications(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-xl text-gray-600 mb-16">Have questions about our destinations or packages? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-teal-700 text-sm font-bold tracking-tight mb-3">HEADQUARTERS</h3>
              <p className="text-gray-900">Geneva, Switzerland</p>
              <p className="text-gray-600">+41 22 518 70 00</p>
            </div>

            <div>
              <h3 className="text-teal-700 text-sm font-bold tracking-tight mb-3">REGIONAL OFFICES</h3>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">Reykjavik, Iceland</p>
                  <p className="text-sm">Arctic expeditions hub</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Kathmandu, Nepal</p>
                  <p className="text-sm">Mountain adventures base</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Kyoto, Japan</p>
                  <p className="text-sm">Asia operations center</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-teal-700 text-sm font-bold tracking-tight mb-3">CONTACT</h3>
              <p className="text-gray-900">info@nofixedaddress.travel</p>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-colors resize-none"
                placeholder="Tell us about your travel plans..."
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-teal-700 text-white font-semibold py-3 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Notification Preferences Section */}
        <div className="mb-20">
          <NotificationPreferences />
        </div>

        {/* Email Notifications Section (Admin) */}
        <div className="border-t border-gray-200 mt-20 pt-20">
          <button
            onClick={() => setShowEmailNotifications(!showEmailNotifications)}
            className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 mb-4"
          >
            <Mail size={18} />
            {showEmailNotifications ? 'Hide' : 'Show'} Sent Email Notifications ({notifications.length})
          </button>

          {showEmailNotifications && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">Admin: Email notifications sent to users</p>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-gray-600 py-8 text-center">No emails sent yet. Complete a booking to see notifications here.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="bg-white border border-gray-300 rounded-lg p-4 hover:border-teal-400 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{notification.subject}</p>
                          <p className="text-xs text-gray-600 mt-1">To: {notification.to}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          notification.status === 'sent' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {notification.status === 'sent' ? '✓ Sent' : 'Failed'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(notification.sentAt).toLocaleString()}</span>
                        <span className="text-teal-600 font-medium">{notification.type.toUpperCase()}</span>
                      </div>
                      {notification.bookingId && (
                        <p className="text-xs text-gray-600 mt-2">
                          Booking: <span className="font-mono font-medium">{notification.bookingId}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Blog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = BLOG_POSTS.find(post => post.featured);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Travel Journal</h1>
          <p className="text-xl text-gray-600 mb-8">Stories, tips, and insights from our adventures around the world</p>

          {/* Search Bar */}
          <div className="relative mb-12">
            <input
              type="text"
              placeholder="Search articles, authors, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
            />
            <Search size={20} className="absolute right-4 top-3.5 text-gray-400" />
          </div>

          {/* Category Filters */}
          <div>
            <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-tight">Categories</p>
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold tracking-tight rounded-full transition-all ${
                    selectedCategory === cat
                      ? "bg-teal-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16 bg-gradient-to-br from-teal-50 to-orange-50 rounded-2xl overflow-hidden border border-teal-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="flex flex-col justify-center">
                <span className="inline-block w-fit bg-orange-500 text-white px-4 py-1 text-xs font-bold rounded-full mb-4">
                  FEATURED
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-900">{featuredPost.author}</p>
                    <p className="text-xs text-gray-600">{featuredPost.date}</p>
                  </div>
                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                  >
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="h-64 md:h-auto rounded-lg overflow-hidden">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="mb-16">
          <p className="text-sm text-gray-600 font-medium mb-8">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            {searchQuery || selectedCategory !== "ALL" ? " found" : ""}
          </p>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-soft-lg transition-all group cursor-pointer"
                >
                  <div className="h-48 bg-gray-900 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-orange-500 text-white px-3 py-1 text-xs font-bold rounded-full">
                        {post.category}
                      </span>
                      {post.readTime && (
                        <span className="text-xs text-gray-500 font-medium">{post.readTime} min read</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        <p className="font-semibold text-gray-700">{post.author}</p>
                        <p>{post.date}</p>
                      </div>
                      <ArrowRight size={18} className="text-teal-700 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg mb-4">No articles found matching your search</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Testimonials = () => {
  const testimonials = [
    { 
      q: "An absolutely transformative experience. The attention to detail and personalized service exceeded all expectations.", 
      a: "Sarah Mitchell",
      location: "New York, USA",
      rating: 5
    },
    { 
      q: "From booking to the final day, everything was flawlessly executed. I've never felt safer on an adventure.", 
      a: "Marcus Chen",
      location: "Singapore",
      rating: 5
    },
    { 
      q: "This exceeded my wildest dreams. The guides were knowledgeable, friendly, and genuinely passionate about sharing their world.", 
      a: "Lucia Rossi",
      location: "Milan, Italy",
      rating: 5
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16 text-center">Guest Stories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-teal-300 hover:shadow-soft-lg transition-all">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(item.rating).fill(null).map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 italic mb-6 leading-relaxed text-lg">"{item.q}"</p>

              {/* Author */}
              <div className="pt-6 border-t border-gray-200">
                <p className="font-bold text-gray-900">{item.a}</p>
                <p className="text-gray-600 text-sm">{item.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FAQ = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await getCollectionData('website_faqs');
        if (data && data.length > 0) {
          // Sort by order 
          const sorted = [...data].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          // Filter active ones
          const activeFaqs = sorted.filter((faq: any) => faq.active !== false);
          
          setFaqs(activeFaqs.map((faq: any) => ({
            q: faq.question,
            a: faq.answer
          })));
        } else {
          // Fallback to default FAQs if none exist in Firebase
          setFaqs([
            {
              q: "What's included in the package prices?",
              a: "All packages include accommodations, guided tours, meals (where specified), transportation, and 24/7 support. Some packages may have additional activities and experiences included."
            },
            {
              q: "Are there age or fitness requirements?",
              a: "While most of our journeys are designed for adults, some can accommodate families with children. Fitness levels vary by package. We recommend consulting with us to ensure the right match for your abilities."
            },
            {
              q: "What is your cancellation policy?",
              a: "Cancellations made 60+ days before departure receive a full refund. 30-59 days: 75% refund. 14-29 days: 50% refund. Less than 14 days: no refund unless travel insurance is purchased."
            },
            {
              q: "How do you ensure sustainable tourism?",
              a: "We partner with local communities, employ local guides, and follow strict environmental protocols. A portion of each booking supports conservation and community development projects."
            },
            {
              q: "Can I customize a package?",
              a: "Absolutely! We specialize in bespoke travel experiences. Contact our team to discuss your specific interests, timeline, and preferences."
            },
            {
              q: "What countries do you operate in?",
              a: "We operate in over 40 destinations across Africa, South America, Asia, Europe, and the Arctic. Each region has its own unique offerings and expertise."
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFAQs();
  }, []);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16">Frequently Asked Questions</h1>
        
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div 
              key={i} 
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-300 transition-all"
            >
              <button 
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-teal-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-gray-900 text-left">{item.q}</h3>
                <div className={`text-teal-700 transition-transform ${expandedIndex === i ? 'rotate-180' : ''}`}>
                  <ArrowRight size={20} />
                </div>
              </button>

              {expandedIndex === i && (
                <div className="px-6 py-4 border-t border-gray-200 bg-teal-50">
                  <p className="text-gray-700">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import BookingComponent from './Booking';

export const Booking = () => {
  return <BookingComponent />;
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = React.useState<"overview" | "bookings" | "documents" | "preferences">("overview");
  
  // Dashboard only accessible with 100% profile completion
  const profileCompletion = 100; // Must be 100% for full access
  const isProfileComplete = profileCompletion === 100;
  
  const achievements = [
    { title: "First Expedition", icon: "🌍", description: "Completed your first adventure" },
    { title: "Summit Seeker", icon: "🏔️", description: "Climbed to 3 mountain peaks" },
    { title: "Explorer", icon: "🗺️", description: "Visited 10+ countries" },
    { title: "Loyal Traveler", icon: "⭐", description: "Member for 3+ years" }
  ];

  const savedDestinations = [
    { name: "Everest Base Camp", days: "14 days", price: "$4,999" },
    { name: "Patagonia Trek", days: "10 days", price: "$3,499" },
    { name: "Iceland Adventure", days: "7 days", price: "$2,799" }
  ];

  const documents = [
    { name: "Passport", status: "verified", date: "2024-01-15" },
    { name: "Insurance Policy", status: "active", date: "2025-03-15" },
    { name: "Medical Clearance", status: "verified", date: "2025-02-20" },
    { name: "Emergency Contact Form", status: "pending", date: "" }
  ];

  // If profile not fully generated, show completion requirement
  if (!isProfileComplete) {
    return (
      <div className="pt-24 px-4 md:px-6 min-h-screen max-w-3xl mx-auto text-gray-900 pb-32 bg-white">
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-teal-700 mb-2">TRAVELER DASHBOARD</h1>
            <p className="text-sm text-gray-600">Complete your profile to access your dashboard.</p>
          </div>
          <button className="text-xs font-medium border border-gray-300 hover:border-orange-500 hover:text-orange-500 px-4 py-2 transition-colors">LOGOUT</button>
        </div>

        <div className="bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-12 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Generation Required</h2>
            <p className="text-gray-600 text-lg mb-6">Complete your full profile to unlock exclusive dashboard features and personalized recommendations.</p>
          </div>

          <div className="bg-white rounded-lg p-8 mb-8 border border-orange-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Profile Completion Progress</h3>
              <span className="text-3xl font-bold text-orange-600">{profileCompletion}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" 
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span>Basic Info</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span>Medical Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <span>Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl opacity-30">○</span>
                <span className="opacity-50">Preferences</span>
              </div>
            </div>
          </div>

          <button className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-2 text-base">
            Complete Your Profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-6 min-h-screen max-w-7xl mx-auto text-gray-900 pb-32 bg-white">
      {/* Header */}
      <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
         <div>
            <h1 className="text-4xl font-bold text-teal-700 mb-2">TRAVELER DASHBOARD</h1>
            <p className="text-sm text-gray-600">Welcome back, Alex! Here's your adventure profile.</p>
         </div>
         <button className="text-xs font-medium border border-gray-300 hover:border-orange-500 hover:text-orange-500 px-4 py-2 transition-colors">LOGOUT</button>
      </div>

      {/* Profile Completion Card */}
      <div className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-teal-700 mb-2">Profile Completion</h3>
            <p className="text-sm text-gray-600">Complete your profile for better travel recommendations and support.</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-700">{profileCompletion}%</div>
            <p className="text-xs text-gray-600">Complete</p>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-teal-600 to-blue-600 transition-all" style={{ width: `${profileCompletion}%` }}></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs">✓ Basic Info</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">✓ Medical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">✓ Emergency Contacts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-50">Travel Preferences</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "ADVENTURES", value: "3", color: "teal" },
          { label: "COUNTRIES", value: "12", color: "orange" },
          { label: "DAYS TRAVELED", value: "47", color: "teal" },
          { label: "MEMBER SINCE", value: "2022", color: "orange" }
        ].map((stat, idx) => (
          <div key={idx} className={`border border-gray-200 p-6 rounded-lg shadow-soft text-center ${stat.color === 'teal' ? 'bg-teal-50' : 'bg-orange-50'}`}>
            <div className={`text-4xl font-bold mb-2 ${stat.color === 'teal' ? 'text-teal-700' : 'text-orange-600'}`}>{stat.value}</div>
            <p className="text-xs text-gray-600 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
        {["overview", "bookings", "documents", "preferences"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-600 hover:text-teal-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-12">
            {/* TAB CONTENT: Overview */}
            {activeTab === "overview" && (
              <>
                {/* Achievements */}
                <section>
                  <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">ACHIEVEMENTS</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 text-center hover:border-teal-500 hover:bg-teal-50 transition-all">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <p className="text-xs font-bold text-gray-900 mb-1">{achievement.title}</p>
                        <p className="text-[10px] text-gray-600">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Upcoming Trips */}
                <section>
                   <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">UPCOMING TRIPS</h2>
                   <div className="border border-gray-200 bg-teal-50 p-6 flex flex-col md:flex-row gap-6 items-center shadow-soft rounded-lg hover:shadow-soft-lg transition-all">
                      <div className="w-full md:w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 border border-gray-400 rounded-lg flex items-center justify-center">
                         <span className="font-bold text-3xl opacity-30">🏔️</span>
                      </div>
                      <div className="flex-1 w-full">
                         <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold">THE ICELANDIC DRIFT</h3>
                            <span className="bg-green-500 text-white px-3 py-1 text-[10px] font-medium rounded-full">CONFIRMED</span>
                         </div>
                         <p className="text-xs text-gray-600 mb-2">TRIP DATE: OCT 15, 2026 • 1 TRAVELER • 5 DAYS</p>
                         <p className="text-sm text-gray-700 mb-4 leading-relaxed">Experience the raw power of Iceland's untamed landscapes with expert guides.</p>
                         <div className="flex gap-4">
                            <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1 transition-colors">VIEW BRIEFING</button>
                            <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1 transition-colors">SECURE MESSAGING</button>
                            <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1 transition-colors">DOWNLOAD DOCS</button>
                         </div>
                      </div>
                   </div>
                </section>
                
                {/* Past Adventures */}
                <section>
                   <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">PAST ADVENTURES</h2>
                   <div className="space-y-4">
                      {[
                         { title: "THE NEPALESE VOID", date: "MAR 2024", status: "COMPLETED", icon: "🏔️" },
                         { title: "ATACAMA DESCENT", date: "NOV 2022", status: "COMPLETED", icon: "🏜️" },
                         { title: "PATAGONIA: UNTAMED", date: "JUL 2021", status: "COMPLETED", icon: "⛰️" }
                      ].map(trip => (
                         <div key={trip.title} className="flex justify-between items-center border border-gray-200 p-4 hover:bg-teal-50 transition-colors cursor-pointer rounded-lg group">
                            <div className="flex items-center gap-4">
                               <div className="text-2xl">{trip.icon}</div>
                               <div>
                                  <h4 className="font-bold text-gray-900 group-hover:text-teal-700">{trip.title}</h4>
                                  <p className="text-[10px] text-gray-600 mt-1">{trip.date}</p>
                               </div>
                            </div>
                            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{trip.status}</span>
                         </div>
                      ))}
                   </div>
                </section>
              </>
            )}

            {/* TAB CONTENT: Bookings */}
            {activeTab === "bookings" && (
              <section>
                <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">SAVED DESTINATIONS</h2>
                <div className="space-y-4">
                  {savedDestinations.map((dest, idx) => (
                    <div key={idx} className="border border-gray-200 p-6 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-teal-700">{dest.name}</h4>
                        <button className="text-teal-700 hover:text-teal-800">❤️</button>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{dest.days} • {dest.price}</p>
                      <div className="flex gap-3">
                        <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1">VIEW DETAILS</button>
                        <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1">BOOK NOW</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB CONTENT: Documents */}
            {activeTab === "documents" && (
              <section>
                <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">TRAVEL DOCUMENTS</h2>
                <div className="space-y-4">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="border border-gray-200 p-6 rounded-lg hover:border-teal-500 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-teal-700">{doc.name}</h4>
                            {doc.date && <p className="text-xs text-gray-600 mt-1">Updated: {doc.date}</p>}
                          </div>
                        </div>
                        <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${
                          doc.status === "verified" ? "bg-green-50 text-green-600" :
                          doc.status === "active" ? "bg-blue-50 text-blue-600" :
                          "bg-yellow-50 text-yellow-600"
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </div>
                      {doc.status === "pending" && (
                        <button className="text-[10px] font-medium tracking-tight border-b-2 border-teal-700 text-teal-700 hover:text-teal-800 pb-1">UPLOAD NOW</button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB CONTENT: Preferences */}
            {activeTab === "preferences" && (
              <section>
                <h2 className="text-sm font-medium tracking-tight text-teal-700 mb-6 border-l-2 border-teal-700 pl-3">TRAVEL PREFERENCES</h2>
                <div className="space-y-6">
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Adventure Interests</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Mountain Climbing", "Water Sports", "Cultural", "Wildlife", "Photography", "Off-road", "Luxury Camping", "Urban"].map(interest => (
                        <label key={interest} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" defaultChecked={["Mountain Climbing", "Cultural", "Photography"].includes(interest)} />
                          <span className="text-sm text-gray-700">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Budget Range</h4>
                    <select className="w-full border border-gray-200 rounded-lg p-3 text-sm">
                      <option>$0 - $2,000</option>
                      <option selected>$2,000 - $5,000</option>
                      <option>$5,000 - $10,000</option>
                      <option>$10,000+</option>
                    </select>
                  </div>

                  <div className="border border-gray-200 p-6 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      {["New expeditions in saved destinations", "Exclusive deals for members", "Travel tips and recommendations", "Activity updates"].map(pref => (
                        <label key={pref} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4" defaultChecked={true} />
                          <span className="text-sm text-gray-700">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="w-full border-2 border-teal-700 text-teal-700 py-3 text-sm font-medium hover:bg-teal-50 transition-colors rounded-lg">SAVE PREFERENCES</button>
                </div>
              </section>
            )}
         </div>
         
         {/* Right Sidebar */}
         <div className="space-y-8">
            {/* Traveler Profile */}
            <div className="border border-gray-200 p-6 shadow-soft rounded-lg">
               <h3 className="text-sm font-medium tracking-tight text-teal-700 mb-4 border-b border-gray-200 pb-4">TRAVELER PROFILE</h3>
               <ul className="space-y-4 text-xs text-gray-600">
                  <li className="flex justify-between pb-2 border-b border-gray-100">
                     <span>NAME</span> 
                     <span className="text-gray-900 font-medium">Alex Travel</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-gray-100">
                     <span>EMAIL</span> 
                     <span className="text-gray-900 font-medium">alex@email.com</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-gray-100">
                     <span>PHONE</span> 
                     <span className="text-gray-900 font-medium">+1 234 567 8900</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-gray-100">
                     <span>VERIFICATION</span> 
                     <span className="text-green-600 font-medium">✓ VERIFIED</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-gray-100">
                     <span>MEDICAL</span> 
                     <span className="text-green-600 font-medium">✓ VERIFIED</span>
                  </li>
                  <li className="flex justify-between">
                     <span>MEMBER SINCE</span> 
                     <span className="text-gray-900 font-medium">Jan 2022</span>
                  </li>
               </ul>
               <button className="w-full mt-6 border-2 border-teal-700 text-teal-700 py-3 text-xs font-medium hover:bg-teal-50 transition-colors rounded-lg">EDIT PROFILE</button>
            </div>

            {/* Emergency Contacts */}
            <div className="border border-gray-200 p-6 shadow-soft rounded-lg">
               <h3 className="text-sm font-medium tracking-tight text-teal-700 mb-4 border-b border-gray-200 pb-4">EMERGENCY CONTACTS</h3>
               <div className="space-y-3">
                  <div className="text-xs">
                     <p className="font-medium text-gray-900">Primary Contact</p>
                     <p className="text-gray-600">Sarah Travel • +1 987 654 3210</p>
                  </div>
                  <div className="text-xs border-t border-gray-100 pt-3">
                     <p className="font-medium text-gray-900">Secondary Contact</p>
                     <p className="text-gray-600">John Travel • +1 555 666 7777</p>
                  </div>
               </div>
               <button className="w-full mt-6 border border-gray-300 text-gray-700 py-2 text-xs font-medium hover:border-teal-700 hover:text-teal-700 transition-colors rounded-lg">UPDATE CONTACTS</button>
            </div>

            {/* Quick Actions */}
            <div className="border border-gray-200 p-6 shadow-soft rounded-lg">
               <h3 className="text-sm font-medium tracking-tight text-teal-700 mb-4 border-b border-gray-200 pb-4">QUICK ACTIONS</h3>
               <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors text-gray-700 rounded-lg border border-transparent hover:border-teal-200">📅 Book New Trip</button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors text-gray-700 rounded-lg border border-transparent hover:border-teal-200">💬 Contact Support</button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors text-gray-700 rounded-lg border border-transparent hover:border-teal-200">⚙️ Settings & Preferences</button>
                  <button className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-teal-50 hover:text-teal-700 transition-colors text-gray-700 rounded-lg border border-transparent hover:border-teal-200">💳 Payment Methods</button>
               </div>
            </div>

            {/* Travel Insurance */}
            <div className="border border-blue-200 bg-blue-50 p-6 shadow-soft rounded-lg">
               <h3 className="text-sm font-medium tracking-tight text-blue-700 mb-4">TRAVEL INSURANCE</h3>
               <div className="space-y-2 text-xs text-gray-700 mb-4">
                  <p><span className="font-medium">Policy #:</span> TI-2025-0847</p>
                  <p><span className="font-medium">Coverage:</span> $500,000</p>
                  <p><span className="font-medium">Expires:</span> March 15, 2027</p>
               </div>
               <button className="w-full text-xs font-medium border-2 border-blue-600 text-blue-600 py-2 hover:bg-blue-100 transition-colors rounded-lg">VIEW POLICY</button>
            </div>

            {/* Loyalty Program */}
            <div className="border border-orange-200 bg-orange-50 p-6 shadow-soft rounded-lg">
               <h3 className="text-sm font-medium tracking-tight text-orange-600 mb-4">LOYALTY PROGRAM</h3>
               <div className="mb-4">
                  <div className="flex justify-between mb-2">
                     <span className="text-xs font-semibold text-gray-700">POINTS</span>
                     <span className="text-xs font-bold text-orange-600">2,450 / 5,000</span>
                  </div>
                  <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-500" style={{ width: '49%' }}></div>
                  </div>
               </div>
               <p className="text-[10px] text-gray-600 mb-4">Earn rewards on every booking and get exclusive benefits!</p>
               <div className="grid grid-cols-2 gap-2 mb-4 text-[10px]">
                  <div className="bg-white border border-orange-200 p-2 rounded text-center">
                     <p className="font-bold text-orange-600">550</p>
                     <p className="text-gray-600">Points needed</p>
                  </div>
                  <div className="bg-white border border-orange-200 p-2 rounded text-center">
                     <p className="font-bold text-orange-600">Gold</p>
                     <p className="text-gray-600">Next tier</p>
                  </div>
               </div>
               <button className="w-full text-xs font-medium border-2 border-orange-600 text-orange-600 py-2 hover:bg-orange-100 transition-colors rounded-lg">LEARN MORE</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export const Admin = () => {
  const [activeAdminTab, setActiveAdminTab] = React.useState<'bookings' | 'packages' | 'faq' | 'gallery' | 'blogs' | 'homepage'>('bookings');

  return (
    <div className="pt-24 px-4 md:px-6 min-h-screen bg-gray-50 pb-32">
      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 border-b border-gray-300 overflow-x-auto flex-wrap">
          <button
            onClick={() => setActiveAdminTab('bookings')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'bookings'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📋 Bookings
          </button>
          <button
            onClick={() => setActiveAdminTab('packages')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'packages'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📦 Packages
          </button>
          <button
            onClick={() => setActiveAdminTab('faq')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'faq'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            ❓ FAQ & Itinerary
          </button>
          <button
            onClick={() => setActiveAdminTab('gallery')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'gallery'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            🖼️ Gallery
          </button>
          <button
            onClick={() => setActiveAdminTab('blogs')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'blogs'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📝 Blogs
          </button>
          <button
            onClick={() => setActiveAdminTab('homepage')}
            className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeAdminTab === 'homepage'
                ? 'text-teal-700 border-teal-700 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            🏠 Homepage
          </button>
        </div>
      </div>

      {/* Bookings Tab */}
      {activeAdminTab === 'bookings' && (
        <div className="max-w-7xl mx-auto">
          <AdminBookingManager />
        </div>
      )}

      {/* Packages & Content Tab */}
      {activeAdminTab === 'packages' && (
        <div className="max-w-7xl mx-auto">
          <ComprehensiveAdminDashboard />
        </div>
      )}

      {/* FAQ & Itinerary Tab */}
      {activeAdminTab === 'faq' && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">📋 FAQ & Itinerary Management</h2>
            <p className="text-gray-600 mb-8">Edit FAQ questions and answers for website and itineraries. Manage all FAQ categories.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Website FAQ Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-teal-700 mb-4">🌐 Website FAQ</h3>
                <p className="text-gray-600 text-sm mb-4">Manage general website FAQs visible on the FAQ page</p>
                <div className="space-y-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
                    <p className="font-semibold text-sm text-gray-900 mb-1">How do I book a trip?</p>
                    <p className="text-xs text-gray-600 line-clamp-2">Browse our destinations, select your preferred itinerary...</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
                    <p className="font-semibold text-sm text-gray-900 mb-1">Is travel insurance required?</p>
                    <p className="text-xs text-gray-600 line-clamp-2">Yes, comprehensive travel insurance is mandatory...</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                  + Add FAQ
                </button>
              </div>

              {/* Itinerary FAQ Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-teal-700 mb-4">🗺️ Itinerary FAQ</h3>
                <p className="text-gray-600 text-sm mb-4">Manage FAQ questions specific to itineraries and packages</p>
                <div className="space-y-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
                    <p className="font-semibold text-sm text-gray-900 mb-1">What's the fitness level required?</p>
                    <p className="text-xs text-gray-600 line-clamp-2">Offers vary from beginner-friendly to expert...</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
                    <p className="font-semibold text-sm text-gray-900 mb-1">What equipment is provided?</p>
                    <p className="text-xs text-gray-600 line-clamp-2">All necessary gear including climbing equipment...</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                  + Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeAdminTab === 'gallery' && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🖼️ Gallery Management</h2>
            <p className="text-gray-600 mb-8">Upload and manage gallery images for destinations and itineraries</p>
            
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-teal-300 rounded-lg p-12 text-center bg-teal-50">
                <p className="text-2xl mb-2">📸</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Upload Gallery Images</h3>
                <p className="text-gray-600 text-sm mb-6">Drag and drop images or click to browse</p>
                <input type="file" multiple accept="image/*" className="hidden" />
                <button className="px-8 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors inline-block">
                  Select Images
                </button>
              </div>

              {/* Current Gallery */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Current Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((img) => (
                    <div key={img} className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <span className="text-4xl opacity-50">🏔️</span>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button className="text-white font-semibold text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogs Tab */}
      {activeAdminTab === 'blogs' && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">📝 Blog Management</h2>
                <p className="text-gray-600">Create, edit, and manage blog posts</p>
              </div>
              <button className="px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                + New Blog Post
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Winter Aurora Hunting in Iceland', date: '2025-03-20', status: 'Published', views: 2450 },
                { title: 'Preparing for Everest Base Camp Trek', date: '2025-03-15', status: 'Published', views: 1680 },
                { title: 'Local Cuisine in Nepal', date: '2025-03-10', status: 'Draft', views: 0 }
              ].map((blog, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-all flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{blog.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{blog.date} • {blog.views} views</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    blog.status === 'Published' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {blog.status}
                  </span>
                  <div className="ml-4 space-x-2">
                    <button className="text-teal-700 hover:text-teal-800 font-semibold text-sm">Edit</button>
                    <button className="text-red-600 hover:text-red-700 font-semibold text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Homepage Content Tab */}
      {activeAdminTab === 'homepage' && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🏠 Homepage Content</h2>
            <p className="text-gray-600 mb-8">Edit and manage homepage content sections</p>
            
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Main Headline</label>
                    <input 
                      type="text" 
                      placeholder="Your main headline here"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-teal-700 focus:outline-none"
                      defaultValue="Redefining the art of premium travel experiences"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subheadline</label>
                    <input 
                      type="text" 
                      placeholder="Your subheadline here"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-teal-700 focus:outline-none"
                      defaultValue="Adventure awaits. Are you ready?"
                    />
                  </div>
                  <button className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Featured Destinations */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⭐ Featured Destinations</h3>
                <p className="text-gray-600 text-sm mb-4">Select up to 6 destinations to feature on homepage</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Iceland', 'Nepal', 'Peru', 'Mongolia', 'Patagonia', 'Bhutan'].map((dest) => (
                    <label key={dest} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-teal-50">
                      <input type="checkbox" className="w-4 h-4 text-teal-700 rounded" defaultChecked />
                      <span className="text-sm font-medium text-gray-900">{dest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Call-to-Action */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Call-to-Action</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Text</label>
                    <input 
                      type="text" 
                      placeholder="Button text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-teal-700 focus:outline-none"
                      defaultValue="Explore Adventures"
                    />
                  </div>
                  <button className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};