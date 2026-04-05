import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { DESTINATIONS, PACKAGES } from '../../utils/constants';
import { DetailGallery } from "../../components/itinerary/DetailGallery";
import { DetailOverview } from "../../components/itinerary/DetailOverview";
import { DetailItinerary } from "../../components/itinerary/DetailItinerary";
import { DetailReviews } from "../../components/itinerary/DetailReviews";
import { BookingSidebar } from "../../components/itinerary/BookingSidebar";
import { InclusionsLayout } from "../../components/itinerary/InclusionsLayout";
import { JoiningPointsDisplay } from "../../components/destinations/JoiningPointsDisplay";

export const ItineraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const destination = DESTINATIONS.find(d => d.id === id);
  const pkg = PACKAGES.find(p => destination && p.destination === destination.name) || PACKAGES[0];
  
  const [travelers, setTravelers] = useState(1);

  return (
    <div className="min-h-screen bg-[#FCFBF7] nfa-texture selection:bg-nfa-gold pb-20">
      {/* 1. Immersive Header */}
      <DetailGallery pkg={pkg} destination={destination} />

      {/* 2. Content Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        
        {/* Left Side: Editorial Storytelling */}
        <div className="lg:col-span-8 space-y-24">
          <DetailOverview pkg={pkg} />
          <JoiningPointsDisplay packageId={pkg.id} packageTitle={pkg.title} />
          <DetailItinerary destination={pkg.destination} />
          <InclusionsLayout packageId={pkg.id} packageTitle={pkg.title} />
          <DetailReviews />
        </div>

        {/* Right Side: Price & Booking */}
        <div className="lg:col-span-4">
          <BookingSidebar pkg={pkg} travelers={travelers} setTravelers={setTravelers} />
          
          <div className="mt-12 p-8 border-4 border-dashed border-[#121212]/20 text-center">
             <p className="font-serif italic text-[#121212]/60 mb-4">"This isn't a tour. This is a transformation. We only take 6 people per group to protect the magic."</p>
             <span className="font-black text-[10px] uppercase tracking-widest">— NFA Founders</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#121212] border-t-4 border-[#F4BF4B] p-5 z-[100] flex justify-between items-center shadow-2xl">
         <div>
            <span className="text-[8px] font-black text-white/40 block tracking-widest uppercase">Investment</span>
            <span className="text-2xl font-black text-[#F4BF4B]">{pkg.price}</span>
         </div>
         <button className="bg-[#F4BF4B] text-[#121212] px-8 py-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
            Apply Now
         </button>
      </div>
    </div>
  );
};

export default ItineraryDetail;