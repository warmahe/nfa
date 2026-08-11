import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Mail, Phone, Compass, ShieldCheck } from 'lucide-react';
import { EnquiryForm } from '../../components/enquiry/EnquiryForm';
import { EnquiryTarget } from '../../context/EnquiryContext';

export const Contact = () => {
  const [searchParams] = useSearchParams();
  
  const tripTitle = searchParams.get('trip') || searchParams.get('package') || undefined;
  const tripId = searchParams.get('id') || undefined;
  const destination = searchParams.get('dest') || undefined;

  const targetContext: EnquiryTarget = {
    itineraryTitle: tripTitle,
    itineraryId: tripId,
    destination: destination,
    source: (tripTitle || tripId) ? 'ITINERARY' : 'CONTACT_PAGE',
    entryPoint: 'CONTACT_PAGE',
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Header */}
        <div className="mb-16 border-b-4 border-[#121212] pb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9E1B1D] block mb-2">
            Command Center • Intelligence & Booking
          </span>
          <h1 className="font-brand font-black text-[clamp(2.8rem,7vw,7rem)] uppercase tracking-tighter text-[#121212] leading-[0.85]">
            Plan Your <br/><span className="text-[#9E1B1D]">Expedition.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Enquiry Form Component */}
          <div className="lg:col-span-7 border-[4px] border-[#121212] bg-white p-6 sm:p-10 shadow-[12px_12px_0px_0px_#121212]">
            <div className="flex items-center gap-3 mb-8 border-b-2 border-[#121212]/10 pb-4">
              <div className="size-10 bg-[#121212] text-[#F4BF4B] flex items-center justify-center border-2 border-[#121212] shrink-0">
                <Compass size={20} />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block">
                  Direct Line
                </span>
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  Itinerary Request
                </h3>
              </div>
            </div>

            <EnquiryForm target={targetContext} isInline={true} />
          </div>

          {/* Right Side: Contact Details & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border-[3px] border-[#121212] bg-[#121212] text-white p-8 shadow-[8px_8px_0px_0px_#F4BF4B]">
              <MapPin className="text-[#F4BF4B] mb-4" size={32} />
              <h4 className="font-black uppercase tracking-widest text-xs text-[#F4BF4B] mb-2">Global Command Center</h4>
              <p className="font-brand font-black text-2xl uppercase tracking-tight leading-snug">
                Geneva, Switzerland
              </p>
              <p className="font-sans text-xs font-bold text-white/60 uppercase tracking-widest mt-1">
                NFA Global Expedition Operations
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212]">
                <Mail className="text-[#9E1B1D] mb-3" size={24} />
                <h4 className="font-black text-[9px] uppercase tracking-widest text-[#121212]/50">Email Support</h4>
                <p className="font-brand font-black text-base text-[#121212] mt-1 break-all">hello@nfa.com</p>
              </div>
              <div className="border-[3px] border-[#121212] bg-white p-6 shadow-[4px_4px_0px_0px_#121212]">
                <Phone className="text-[#9E1B1D] mb-3" size={24} />
                <h4 className="font-black text-[9px] uppercase tracking-widest text-[#121212]/50">Secure Dispatch</h4>
                <p className="font-brand font-black text-base text-[#121212] mt-1">+41 22 518 7000</p>
              </div>
            </div>

            <div className="border-[3px] border-[#121212] bg-[#FCFBF7] p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <ShieldCheck size={18} />
                <span className="font-black uppercase tracking-wider">Small-Group Guarantee</span>
              </div>
              <p className="text-xs font-medium text-[#121212]/75 leading-relaxed">
                All expedition requests are reviewed personally by our senior field strategists. You will receive custom itinerary options, permits, and pricing within 24 hours.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};