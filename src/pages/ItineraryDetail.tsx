import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Clock, MapPin, X, ChevronDown, ChevronUp, Calendar as CalIcon, Users, ArrowRight, ThumbsUp, ChevronLeft, ChevronRight, Scale, Bell, Plus } from "lucide-react";
import { PACKAGES, DESTINATIONS, REVIEWS, FAQ_DATA } from "../constants";
import {
  addToComparison,
  getComparisonCount,
  isInComparison,
} from "../services/comparisonService";
import { ComparisonModal } from "../components/ComparisonModal";
import { PriceAlertModal } from "../components/PriceAlertModal";
import { ItineraryMap } from "../components/ItineraryMap";
import { JoiningPointsDisplay } from "../components/JoiningPointsDisplay";
import { InclusionsLayout } from "../components/InclusionsLayout";

const ITINERARY_DAYS = [
  { day: 1, title: "ARRIVAL & DISCOVERY", desc: "Welcome to basecamp. Check-in and meet your guide team. Evening orientation and gear preparation." },
  { day: 2, title: "INTO THE WILD", desc: "First day of the adventure. 8 hours of exploration. Setup camp under the stars." },
  { day: 3, title: "THE PEAK", desc: "Ascent to the highest altitude of the journey. Physical and mental challenge. Panoramic views as your reward." },
  { day: 4, title: "CULTURAL IMMERSION", desc: "Connect with local communities. Learn traditional practices and share authentic meals." },
  { day: 5, title: "RETURN HOME", desc: "Journey back. Final reflections and safe passage home." }
];

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  
  // Find destination by ID
  const destination = DESTINATIONS.find(d => d.id === id);
  
  // Find package for this destination (use first if multiple)
  const pkg = PACKAGES.find(p => 
    destination && p.destination === destination.name
  ) || PACKAGES[0];

  const [openDay, setOpenDay] = useState<number | null>(1);
  const [travelers, setTravelers] = useState(2);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [showNotification, setShowNotification] = useState("");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [currentRelatedIndex, setCurrentRelatedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previousId, setPreviousId] = useState<string | undefined>(id);

  useEffect(() => {
    setComparisonCount(getComparisonCount());
  }, []);

  // Show loading screen when navigating between itineraries
  useEffect(() => {
    if (id && previousId && id !== previousId) {
      setIsLoading(true);
      // Simulate loading for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPreviousId(id);
      }, 400);
      return () => clearTimeout(timer);
    } else if (id !== previousId) {
      setPreviousId(id);
    }
  }, [id, previousId]);

  // Gallery images for each package
  const galleryImages: Record<string, string[]> = {
    "THE ICELANDIC DRIFT": [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80"
    ],
    "HIMALAYAN HEIGHTS": [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80"
    ],
    "LOST CITY EXPEDITION": [
      "https://images.unsplash.com/photo-1587595431973-160beaf913cb?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80"
    ]
  };

  const images = galleryImages[pkg.title] || [pkg.image, pkg.image, pkg.image, pkg.image];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pt-20 bg-white text-gray-900 min-h-screen relative pb-32">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-teal-700">Loading itinerary...</p>
            <p className="text-sm text-gray-500 mt-2">Preparing your adventure details</p>
          </div>
        </div>
      )}
      
      {/* Header & Gallery */}
      <div className="w-full relative border-b border-teal-700">
        {/* Main Image Carousel */}
        <div className="relative h-[60vh] bg-gray-900 overflow-hidden group">
          <img 
            src={images[currentImageIndex]} 
            alt={`${pkg.title} image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
            referrerPolicy="no-referrer"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
              >
                <ChevronLeft size={24} className="text-teal-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
              >
                <ChevronRight size={24} className="text-teal-700" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="bg-white border-b border-gray-200 px-4 md:px-12 py-4 flex gap-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:border-teal-500 ${
                  idx === currentImageIndex ? "border-teal-700" : "border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        )}

         <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent flex flex-col justify-end p-6 md:p-12 max-w-7xl mx-auto w-full pointer-events-none">
            <div className="flex flex-wrap gap-4 mb-4">
               <span className="bg-orange-500 text-white px-3 py-1 text-xs font-semibold uppercase tracking-tight">{pkg.destination}</span>
               <span className="bg-teal-700 text-white px-3 py-1 text-xs font-semibold border border-teal-700 flex items-center gap-1"><Star size={12} className="fill-white" /> {pkg.rating} (120 REVIEWS)</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-bold text-gray-900 leading-none mb-2">{pkg.title}</h1>
            <div className="flex items-center gap-6 mt-4">
               <span className="text-sm font-medium flex items-center gap-2"><Clock size={16} className="text-teal-700" /> {pkg.duration}</span>
               <span className="text-sm font-medium flex items-center gap-2"><MapPin size={16} className="text-teal-700" /> {pkg.destination}</span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
         <div className="lg:col-span-2 space-y-16">
            {/* Overview */}
            <section>
               <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">OVERVIEW</h2>
               <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  {pkg.title} is not a vacation; it's an expedition. We leave the tourist traps behind and dive into the raw, unfiltered reality of {pkg.destination}. From silent ridges to ancient paths, this is your chance to disconnect and truly explore.
               </p>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="border border-gray-300 p-4 bg-gray-50">
                     <span className="text-[10px] font-medium text-gray-600 block mb-1">TRAVEL TYPE</span>
                     <span className="font-bold text-sm text-gray-900">ADVENTURE</span>
                  </div>
                  <div className="border border-gray-300 p-4 bg-gray-50">
                     <span className="text-[10px] font-medium text-gray-600 block mb-1">ACTIVITY LEVEL</span>
                     <span className="font-bold text-sm text-gray-900">HIGH</span>
                  </div>
                  <div className="border border-gray-300 p-4 bg-gray-50">
                     <span className="text-[10px] font-medium text-gray-600 block mb-1">GROUP SIZE</span>
                     <span className="font-bold text-sm text-gray-900">{pkg.title === "THE ICELANDIC DRIFT" ? "4" : "10"} MAX</span>
                  </div>
                  <div className="border border-gray-300 p-4 bg-gray-50">
                     <span className="text-[10px] font-medium text-gray-600 block mb-1">BEST TIME</span>
                     <span className="font-bold text-sm text-gray-900">MAY - SEP</span>
                  </div>
               </div>
            </section>

            {/* Joining Points Section */}
            <JoiningPointsDisplay packageId={pkg.id || "iceland-adventure"} packageTitle={pkg.title} />

            {/* Day by Day */}
            <section>
               <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">ITINERARY</h2>
               
               {/* Itinerary Map */}
               <div className="mb-8 rounded-2xl overflow-hidden border-2 border-teal-200">
                  <ItineraryMap destination={pkg.destination} height="450px" />
               </div>

               {/* Day by Day Breakdown */}
               <div className="flex flex-col gap-4">
                  {ITINERARY_DAYS.map((day) => (
                     <div key={day.day} className="border border-gray-300 bg-white overflow-hidden hover:border-teal-500 hover:shadow-soft-lg transition-all">
                        <button 
                           onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                           className="w-full text-left p-6 flex justify-between items-center bg-white focus:outline-none hover:bg-gray-50"
                        >
                           <div className="flex items-center gap-6">
                              <span className="text-2xl font-bold text-teal-400 opacity-70">0{day.day}</span>
                              <h3 className="text-xl font-bold tracking-tight text-gray-900">{day.title}</h3>
                           </div>
                           {openDay === day.day ? <ChevronUp className="text-teal-700" /> : <ChevronDown className="text-teal-700" />}
                        </button>
                        {openDay === day.day && (
                           <div className="p-6 pt-0 text-gray-700 border-t border-gray-200 bg-teal-50">
                              <p className="leading-relaxed">{day.desc}</p>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </section>



            {/* Inclusions & Activities Layout */}
            <InclusionsLayout packageId={pkg.id || "iceland-adventure"} packageTitle={pkg.title} />

            {/* Reviews Section */}
            <section>
               <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">TRAVELER REVIEWS ({REVIEWS.length})</h2>
               
               {/* Rating Breakdown */}
               <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Average Rating */}
                     <div className="flex items-center gap-6">
                        <div className="text-center">
                           <div className="text-6xl font-bold text-teal-700 mb-2">{(REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1)}</div>
                           <div className="flex justify-center gap-1 mb-2">
                              {Array(5).fill(null).map((_, i) => (
                                 <Star key={i} size={18} className={i < Math.round(REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"} />
                              ))}
                           </div>
                           <p className="text-sm text-gray-600">Based on {REVIEWS.length} reviews</p>
                        </div>
                     </div>
                     
                     {/* Rating Distribution */}
                     <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(rating => {
                           const count = REVIEWS.filter(r => r.rating === rating).length;
                           const percentage = (count / REVIEWS.length) * 100;
                           return (
                              <div key={rating} className="flex items-center gap-4">
                                 <div className="flex items-center gap-1 w-16">
                                    <span className="text-xs font-semibold text-gray-700">{rating}</span>
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                 </div>
                                 <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }}></div>
                                 </div>
                                 <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Individual Reviews */}
               <div className="space-y-6">
                  {REVIEWS.map((review) => (
                     <div key={review.id} className="border border-gray-300 rounded-lg p-6 hover:border-teal-300 hover:shadow-soft-lg transition-all bg-white">
                        <div className="flex items-start justify-between mb-4">
                           <div className="flex items-start gap-4">
                              <img 
                                 src={review.avatar}
                                 alt={review.author}
                                 referrerPolicy="no-referrer"
                                 className="w-14 h-14 rounded-full object-cover border-2 border-teal-200"
                              />
                              <div>
                                 <h4 className="font-bold text-gray-900">{review.author}</h4>
                                 <p className="text-xs text-gray-600 font-medium">{review.role}</p>
                              </div>
                           </div>
                           <div className="flex gap-1">
                              {Array(5).fill(null).map((_, i) => (
                                 <Star key={i} size={16} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"} />
                              ))}
                           </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">"{review.content}"</p>
                        <button className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors">
                           <ThumbsUp size={14} /> Helpful
                        </button>
                     </div>
                  ))}
               </div>
            </section>

            {/* FAQ Section */}
            <section>
               <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">FREQUENTLY ASKED QUESTIONS</h2>
               
               <div className="space-y-3">
                  {FAQ_DATA.map((faq) => (
                     <div key={faq.id} className="border border-gray-300 bg-white overflow-hidden rounded-lg hover:border-teal-500 hover:shadow-soft-lg transition-all">
                        <button
                           onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                           className="w-full text-left p-6 flex justify-between items-center focus:outline-none hover:bg-gray-50"
                        >
                           <div className="flex items-start gap-4 flex-1">
                              <span className="text-xs font-bold uppercase tracking-tight text-teal-700 bg-teal-100 px-3 py-1 rounded flex-shrink-0 h-fit mt-1">{faq.category}</span>
                              <h3 className="font-bold text-gray-900">{faq.question}</h3>
                           </div>
                           {openFAQ === faq.id ? <ChevronUp className="text-teal-700 flex-shrink-0" /> : <ChevronDown className="text-teal-700 flex-shrink-0" />}
                        </button>
                        {openFAQ === faq.id && (
                           <div className="px-6 pb-6 pt-3 text-gray-700 border-t border-gray-200 bg-teal-50">
                              <p className="leading-relaxed">{faq.answer}</p>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </section>

            {/* Related Packages */}
            <section>
               <h2 className="text-4xl font-bold text-teal-700 mb-6 border-b-2 border-teal-200 pb-4">RELATED PACKAGES</h2>
               
               {(() => {
                  const relatedPackages = PACKAGES.filter(p => p.id !== pkg.id).slice(0, 4);
                  return (
                     <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {relatedPackages.map((relPkg) => (
                              <Link
                                 key={relPkg.id}
                                 to={`/itinerary/${DESTINATIONS.find(d => d.name === relPkg.destination)?.id || ''}`}
                                 className="group border border-gray-300 rounded-lg overflow-hidden bg-white hover:shadow-lg hover:border-teal-500 transition-all"
                              >
                                 <div className="relative h-48 overflow-hidden bg-gray-900">
                                    <img 
                                       src={relPkg.image}
                                       alt={relPkg.title}
                                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                       referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                       <p className="text-xs font-bold text-yellow-400 mb-1">{relPkg.destination}</p>
                                       <h3 className="text-white font-bold text-lg leading-tight">{relPkg.title}</h3>
                                    </div>
                                 </div>
                                 <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                       <div>
                                          <div className="flex items-center gap-2 mb-2">
                                             <Clock size={14} className="text-gray-600" />
                                             <span className="text-xs font-medium text-gray-600">{relPkg.duration}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                             <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                             <span className="text-sm font-bold text-gray-900">{relPkg.rating}</span>
                                          </div>
                                       </div>
                                       <p className="text-2xl font-bold text-teal-700">{relPkg.price}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{relPkg.description}</p>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  );
               })()}
            </section>
         </div>

         {/* Booking Sidebar */}
         <div className="relative">
            <div className="sticky top-32 border border-teal-700 p-6 bg-white shadow-soft-lg">
               <div className="mb-6">
                  <span className="text-[10px] font-medium tracking-tight text-gray-600 block">PRICE PER TRAVELER</span>
                  <div className="text-5xl font-bold text-teal-700">{pkg.price}</div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-medium tracking-tight flex items-center gap-1 text-gray-900"><CalIcon size={12}/> SELECT DEPARTURE</label>
                     <select className="w-full bg-white text-gray-900 p-3 font-medium text-sm border border-gray-300 focus:ring-2 focus:ring-teal-500 rounded-lg">
                        <option>Oct 15, 2026 - Available</option>
                        <option>Nov 02, 2026 - Limited</option>
                        <option>Nov 20, 2026 - Sold Out</option>
                     </select>
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-medium tracking-tight flex items-center gap-1 text-gray-900"><Users size={12}/> PARTY SIZE</label>
                     <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">-</button>
                        <input type="text" value={travelers} readOnly className="w-full bg-transparent text-center font-medium text-gray-900 focus:outline-none" />
                        <button onClick={() => setTravelers(travelers + 1)} className="px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium">+</button>
                     </div>
                  </div>
               </div>

               <div className="border-t border-gray-300 pt-6 mb-6">
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-2">
                     <span>{pkg.price} x {travelers}</span>
                     <span>₹{parseInt(pkg.price.replace(/[^0-9]/g, '')) * travelers}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
                     <span>Service Fees</span>
                     <span>₹150</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                     <span>TOTAL</span>
                     <span>₹{(parseInt(pkg.price.replace(/[^0-9]/g, '')) * travelers) + 150}</span>
                  </div>
               </div>

               <Link to={`/booking/${pkg.id}`} className="w-full py-4 bg-teal-700 text-white font-bold font-medium tracking-tight text-center flex items-center justify-center gap-2 hover:bg-teal-800 transition-colors group rounded-lg shadow-soft">
                  BOOK NOW <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </Link>
               
               <button
                 onClick={() => {
                   const added = addToComparison(pkg);
                   if (added) {
                     setComparisonCount(getComparisonCount());
                     setShowNotification(`Added to comparison (${getComparisonCount()}/3)`);
                     setTimeout(() => setShowNotification(""), 3000);
                   } else if (isInComparison(pkg.id)) {
                     setShowNotification("Already in comparison");
                     setTimeout(() => setShowNotification(""), 2000);
                   } else {
                     setShowNotification("Comparison limit reached (max 3)");
                     setTimeout(() => setShowNotification(""), 3000);
                   }
                 }}
                 className={`w-full mt-3 py-3 font-bold font-medium tracking-tight text-center flex items-center justify-center gap-2 rounded-lg transition-colors ${
                   isInComparison(pkg.id)
                     ? "bg-orange-100 text-orange-700 border-2 border-orange-300 hover:bg-orange-150"
                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                 }`}
               >
                 <Scale size={18} />
                 {isInComparison(pkg.id) ? "In Comparison" : "Add to Compare"}
               </button>

               <button
                 onClick={() => setIsPriceAlertModalOpen(true)}
                 className="w-full mt-3 py-3 font-bold font-medium tracking-tight text-center flex items-center justify-center gap-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
               >
                 <Bell size={18} />
                 Set Price Alert
               </button>
               
               <p className="text-[10px] font-medium text-gray-500 text-center mt-4 uppercase">No charge until booking is confirmed.</p>
            </div>
         </div>
      </div>

      
      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 p-4 z-50 flex justify-between items-center shadow-soft-lg">
         <div>
            <span className="text-[10px] font-medium block text-gray-600">TOTAL</span>
            <span className="text-xl font-bold text-teal-700">₹{(parseInt(pkg.price.replace(/[^0-9]/g, '')) * travelers) + 150}</span>
         </div>
         <Link to={`/booking/${pkg.id}`} className="px-8 py-3 bg-teal-700 text-white font-medium text-sm tracking-tight hover:bg-teal-800 transition-colors rounded-lg">
            RESERVE
         </Link>
      </div>

      {/* Floating Comparison Button */}
      {comparisonCount > 0 && (
        <button
          onClick={() => setIsComparisonModalOpen(true)}
          className="fixed bottom-24 lg:bottom-8 right-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 z-40"
        >
          <Scale size={20} />
          <span>Compare ({comparisonCount})</span>
        </button>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={isPriceAlertModalOpen}
        onClose={() => setIsPriceAlertModalOpen(false)}
        packageId={pkg.id}
        packageTitle={pkg.title}
        destination={pkg.destination}
        currentPrice={pkg.price}
        onAlertCreated={() => {
          setShowNotification("Price alert created!");
          setTimeout(() => setShowNotification(""), 3000);
        }}
      />
    </div>
  );
}
