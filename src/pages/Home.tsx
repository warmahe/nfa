import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Star, ArrowRight, MapPin, Calendar, Shield, CreditCard, Clock, ChevronLeft, ChevronRight, Mail, Check, AlertCircle } from "lucide-react";
import { DESTINATIONS, PACKAGES, REVIEWS } from "../constants";
import { subscribeNewsletter } from "../services/newsletterService";

export const Home = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [filteredDestinations, setFilteredDestinations] = useState<typeof DESTINATIONS>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(1000000);
  const [travelers, setTravelers] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState<string>("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const tripTypes = ["Adventure", "Relaxation", "Cultural", "Wildlife", "Beach", "Mountain"];
  const activityOptions = ["Hiking", "Diving", "Photography", "Food Tours", "Spa", "Water Sports"];

  // Handle destination search
  const handleDestinationSearch = (value: string) => {
    setSearchDestination(value);
    if (value.trim()) {
      const filtered = DESTINATIONS.filter(dest =>
        dest.name.toLowerCase().includes(value.toLowerCase()) ||
        dest.region.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDestinations(filtered);
      setShowDestinationDropdown(true);
    } else {
      setFilteredDestinations([]);
      setShowDestinationDropdown(false);
    }
  };

  const handleSelectDestination = (destName: string) => {
    setSearchDestination(destName);
    setShowDestinationDropdown(false);
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSearch = () => {
    // Navigate to destinations page with filters
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.append('destination', searchDestination);
    if (searchCheckIn) params.append('checkIn', searchCheckIn);
    if (searchCheckOut) params.append('checkOut', searchCheckOut);
    params.append('minBudget', minBudget.toString());
    params.append('maxBudget', maxBudget.toString());
    params.append('travelers', travelers.toString());
    navigate(`/destinations?${params.toString()}`);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? REVIEWS.length - 1 : prev - 1
    );
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === REVIEWS.length - 1 ? 0 : prev + 1
    );
  };

  const handleNewsletterSubscribe = async () => {
    if (!email.trim()) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter your email');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
      return;
    }

    setNewsletterStatus('loading');

    // Simulate async operation
    setTimeout(() => {
      const result = subscribeNewsletter(email);
      if (result.success) {
        setNewsletterStatus('success');
        setNewsletterMessage(result.message);
        setIsSubscribed(true);
        setEmail('');
        setTimeout(() => {
          setNewsletterStatus('idle');
          setIsSubscribed(false);
        }, 3000);
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(result.message);
        setTimeout(() => setNewsletterStatus('idle'), 3000);
      }
    }, 600);
  };

  const services = [
    {
      icon: CreditCard,
      title: "Best Rates",
      description: "Competitive pricing with transparent costs and no hidden fees."
    },
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Enterprise-level security protecting your travel plans."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock support whenever you need assistance."
    }
  ];

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 min-h-screen md:h-auto flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" 
            alt="Adventure" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-white/30 to-white" />
        </div>

        <div className="relative z-20 text-center max-w-5xl mx-auto px-6 w-full">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-8 md:mb-10 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Explore the World with Us
          </motion.h1>

          {/* Search Box */}
          <motion.div 
            className="bg-white rounded-2xl shadow-soft-lg max-w-4xl mx-auto p-4 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Basic Search Row */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4 mb-4">
              {/* Destination */}
              <div className="relative flex items-center gap-2 border-b-2 md:border-b-0 md:border-r-2 border-gray-300 pb-3 md:pb-0 md:pr-4 h-10">
                <MapPin size={20} className="text-teal-700 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Where to?" 
                  value={searchDestination}
                  onChange={(e) => handleDestinationSearch(e.target.value)}
                  onFocus={() => searchDestination && setShowDestinationDropdown(true)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm font-medium h-full"
                />
                
                {/* Destination Dropdown */}
                {showDestinationDropdown && filteredDestinations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full md:w-64">
                    {filteredDestinations.slice(0, 5).map(dest => (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectDestination(dest.name)}
                        className="w-full text-left px-4 py-2 hover:bg-teal-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{dest.name}</div>
                        <div className="text-xs text-gray-500">{dest.region}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Check-in Date */}
              <div className="flex items-center gap-2 border-b-2 md:border-b-0 md:border-r-2 border-gray-300 pb-3 md:pb-0 md:pr-4">
                <Calendar size={20} className="text-teal-700 flex-shrink-0" />
                <input 
                  type="date" 
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
                />
              </div>
              
              {/* Check-out Date */}
              <div className="flex items-center gap-2 border-b-2 md:border-b-0 md:border-r-2 border-gray-300 pb-3 md:pb-0 md:pr-4">
                <Calendar size={20} className="text-teal-700 flex-shrink-0" />
                <input 
                  type="date" 
                  value={searchCheckOut}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
                />
              </div>

              {/* Search & Advanced Toggle */}
              <div className="flex gap-2">
                <button 
                  onClick={handleSearch}
                  className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg px-4 py-2 md:py-3 flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <Search size={18} /> Search
                </button>
                <button 
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="px-4 py-2 md:py-3 border-2 border-teal-700 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-sm"
                  title="Toggle Advanced Search"
                >
                  ⚙️
                </button>
              </div>
            </div>

            {/* Quick Filter Chips */}
            {!showAdvancedSearch && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200"
              >
                <span className="text-xs font-semibold text-gray-600">Quick filters:</span>
                <button 
                  onClick={() => { setSelectedTripType("Adventure"); setShowAdvancedSearch(true); }}
                  className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-medium hover:bg-teal-200 transition-colors"
                >
                  🏔️ Adventure
                </button>
                <button 
                  onClick={() => { setMinBudget(0); setMaxBudget(100000); setShowAdvancedSearch(true); }}
                  className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition-colors"
                >
                  💰 Budget Friendly
                </button>
                <button 
                  onClick={() => { setSelectedTripType("Beach"); setShowAdvancedSearch(true); }}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  🏖️ Beach
                </button>
                <button 
                  onClick={() => { setSelectedTripType("Relaxation"); setShowAdvancedSearch(true); }}
                  className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  🧘 Wellness
                </button>
              </motion.div>
            )}

            {/* Advanced Search Options */}
            {showAdvancedSearch && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t-2 border-gray-200 pt-6 mt-4 pb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Budget Slider */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Budget Range</label>
                    <div className="space-y-3">
                      {/* Budget Range Slider */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="range"
                            min="0"
                            max="1000000"
                            value={minBudget}
                            onChange={(e) => setMinBudget(Math.min(Number(e.target.value), maxBudget))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range"
                            min="0"
                            max="1000000"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(Math.max(Number(e.target.value), minBudget))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-teal-50 rounded-lg p-3 mt-3">
                        <div className="flex justify-between items-center">
                          <div className="text-center flex-1">
                            <div className="text-xs text-gray-600 font-medium">Min Budget</div>
                            <div className="text-sm font-bold text-teal-700">₹{minBudget.toLocaleString()}</div>
                          </div>
                          <div className="text-gray-400">—</div>
                          <div className="text-center flex-1">
                            <div className="text-xs text-gray-600 font-medium">Max Budget</div>
                            <div className="text-sm font-bold text-teal-700">₹{maxBudget.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Number of Travelers</label>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-10 h-10 rounded-full border-2 border-teal-700 text-teal-700 font-bold hover:bg-teal-50 transition-colors"
                      >
                        −
                      </button>
                      <div className="text-center flex-1">
                        <div className="text-3xl font-bold text-teal-700">{travelers}</div>
                        <div className="text-xs text-gray-600">{travelers === 1 ? 'Person' : 'People'}</div>
                      </div>
                      <button 
                        onClick={() => setTravelers(travelers + 1)}
                        className="w-10 h-10 rounded-full border-2 border-teal-700 text-teal-700 font-bold hover:bg-teal-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trip Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Trip Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {tripTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedTripType(selectedTripType === type ? "" : type)}
                        className={`px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                          selectedTripType === type
                            ? 'bg-teal-700 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activities Filter */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Activities (Select up to 3)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {activityOptions.map(activity => (
                      <button
                        key={activity}
                        onClick={() => toggleActivity(activity)}
                        disabled={selectedActivities.length >= 3 && !selectedActivities.includes(activity)}
                        className={`px-3 py-2 rounded-lg font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                          selectedActivities.includes(activity)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleSearch}
                    className="flex-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg px-6 py-3 transition-colors text-base shadow-soft hover:shadow-soft-md"
                  >
                    Apply Filters & Search
                  </button>
                  <button 
                    onClick={() => {
                      setShowAdvancedSearch(false);
                      setMinBudget(0);
                      setMaxBudget(1000000);
                      setTravelers(1);
                      setSelectedTripType("");
                      setSelectedActivities([]);
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Top Destinations */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3 md:mb-4">Top Destinations</h2>
          <p className="text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-base">Explore the world's most coveted travel experiences</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESTINATIONS.slice(0, 4).map((dest) => (
              <motion.div
                key={dest.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-teal-300 hover:shadow-soft-lg transition-all group shadow-soft cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30" />
                </div>
                
                {/* Content Section */}
                <div className="p-5 flex flex-col h-full">
                  {/* Region & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-semibold">{dest.region}</span>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                      <Star size={14} className="fill-yellow-500" />
                      <span className="font-semibold">{dest.rating}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">{dest.name}</h3>

                  {/* Description */}
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">{dest.description}</p>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-teal-700 text-xs mb-3 font-semibold">
                    <Clock size={14} className="fill-teal-700" />
                    {dest.duration}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-3"></div>

                  {/* View Details Link */}
                  <Link 
                    to={`/itinerary/${dest.id}`}
                    className="w-full py-2 bg-teal-700 text-white font-semibold text-center rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-2 group/btn text-xs"
                  >
                    Explore <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Destinations Carousel */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Featured Destinations</h2>
              <p className="text-gray-600 mt-2">Handpicked experiences for discerning travelers</p>
            </div>
            <Link 
              to="/destinations"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.slice(0, 3).map((dest, idx) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all">
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <Star size={16} className="fill-white" />
                    Featured
                  </div>

                  {/* Background Image */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">{dest.region}</span>
                      <div className="flex items-center gap-1 text-yellow-300">
                        <Star size={14} className="fill-yellow-300" />
                        <span className="text-sm font-semibold">{dest.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{dest.name}</h3>
                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">{dest.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        {dest.duration}
                      </span>
                      <span className="text-xl font-bold text-orange-400">{dest.price}</span>
                    </div>
                  </div>

                  {/* Explore Link */}
                  <Link
                    to={`/itinerary/${dest.id}`}
                    className="absolute bottom-6 right-6 bg-teal-700 hover:bg-teal-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-10"
                  >
                    <ArrowRight size={20} />
                  </Link>
                </div>

                {/* Card Footer */}
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full font-semibold">{dest.difficulty}</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">{dest.season}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">{dest.visaType}</span>
                  </div>
                  <p className="text-sm text-gray-600">Travel Type: <span className="font-semibold text-gray-900">{dest.travelType}</span></p>
                </div>
              </motion.div>
            ))}
          </div>

          <Link 
            to="/destinations"
            className="md:hidden flex items-center justify-center gap-2 mt-8 w-full px-6 py-3 bg-teal-700 text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors"
          >
            View All Destinations <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* We Offer Best Services */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16">We Offer Best Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-teal-300 hover:shadow-soft-lg transition-all text-center shadow-soft"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-teal-100 p-4 rounded-full">
                      <Icon size={32} className="text-teal-700" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Plan Your Dream Trip CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-teal-700 to-teal-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white">Plan Your Dream Trip</h2>
            <p className="text-lg md:text-xl text-teal-50">Let our expert travel consultants create a personalized itinerary just for you. Get a custom travel plan tailored to your preferences, budget, and schedule.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => navigate("/contact")}
                className="px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-lg hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Custom Itinerary
              </button>
              <Link 
                to="/packages"
                className="px-8 py-4 bg-white text-teal-700 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                Explore Packages <ArrowRight size={20} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-teal-600">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">500+</div>
                <div className="text-teal-100">Curated Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">50K+</div>
                <div className="text-teal-100">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-teal-100">Expert Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What People Say - With Testimonials Carousel */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16">What people say about Us.</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Featured Testimonial Carousel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              key={currentTestimonialIndex}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-teal-700 mb-4">{REVIEWS[currentTestimonialIndex]?.author}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">"{REVIEWS[currentTestimonialIndex]?.content}"</p>
                <p className="text-gray-600 text-sm mt-2">{REVIEWS[currentTestimonialIndex]?.role || "Verified Traveler"}</p>
              </div>

              {/* Thumbnail Image */}
              <div className="h-64 rounded-2xl overflow-hidden shadow-soft-lg border border-gray-200">
                <img 
                  src={REVIEWS[currentTestimonialIndex]?.avatar}
                  alt={REVIEWS[currentTestimonialIndex]?.author}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={REVIEWS[currentTestimonialIndex]?.avatar}
                    alt={REVIEWS[currentTestimonialIndex]?.author}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border-2 border-teal-700 object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{REVIEWS[currentTestimonialIndex]?.author}</p>
                    <div className="flex gap-1">
                      {Array(5).fill(null).map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Testimonials Carousel with Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Carousel Control Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handlePrevTestimonial}
                  className="p-3 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextTestimonial}
                  className="p-3 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition-all transform hover:scale-110 shadow-md"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Testimonials Grid - Show 2 testimonials at current index */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[REVIEWS[currentTestimonialIndex], REVIEWS[(currentTestimonialIndex + 1) % REVIEWS.length]].map((review, idx) => (
                  <motion.div
                    key={`${currentTestimonialIndex}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-teal-300 hover:shadow-soft-lg transition-all"
                  >
                    <div className="flex flex-col gap-3 mb-3">
                      <img 
                        src={review?.avatar}
                        alt={review?.author}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-teal-700"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{review?.author}</p>
                        <p className="text-xs text-gray-600">{review?.role || "Verified Traveler"}</p>
                        <div className="flex gap-1 mt-1">
                          {Array(5).fill(null).map((_, i) => (
                            <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">"{review?.content}"</p>
                  </motion.div>
                ))}
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 pt-4">
                {REVIEWS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonialIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentTestimonialIndex
                        ? 'bg-teal-700 w-8'
                        : 'bg-gray-300 w-2 hover:bg-teal-500'
                    }`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <p className="text-center text-sm text-gray-600 pt-2">
                {currentTestimonialIndex + 1} / {REVIEWS.length}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe for Exclusive Offers</h2>
              <p className="text-gray-600 text-lg">Get travel tips, destination guides, and special discounts delivered to your inbox</p>
            </div>

            <div className="space-y-4">
              <motion.div 
                className="flex gap-3 flex-col sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={newsletterStatus === 'loading'}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-gray-900 border-2 border-gray-300 placeholder-gray-400 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
                <button 
                  onClick={handleNewsletterSubscribe}
                  disabled={newsletterStatus === 'loading' || isSubscribed}
                  className="px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                >
                  {newsletterStatus === 'loading' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isSubscribed ? <Check size={20} /> : <Mail size={20} />}
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </motion.div>

              {/* Status Messages */}
              {newsletterStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    newsletterStatus === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {newsletterStatus === 'success' ? (
                    <Check size={20} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0" />
                  )}
                  <span className="font-medium">{newsletterMessage}</span>
                </motion.div>
              )}
            </div>

            <p className="text-sm text-gray-500">We respect your privacy. Unsubscribe at any time.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
