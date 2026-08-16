import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  MapPin,
  Users,
  FileText,
  Download,
  Sparkles,
  Compass,
  MessageCircle,
  Clock,
  Heart,
  Utensils,
  Accessibility,
  BedDouble,
  ShieldCheck,
} from 'lucide-react';
import { EnquiryDocument, Package } from '../../types/database';
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_EXPLANATIONS } from '../../utils/statusLabels';

interface CustomerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: EnquiryDocument | null;
  packageMap: Record<string, Package>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  NEW: { label: 'New', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
  CONTACTED: { label: 'Contacted', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
  IN_DISCUSSION: { label: 'In discussion', bg: 'bg-purple-100 border-purple-300', text: 'text-purple-900' },
  CUSTOMIZATION: { label: 'Journey being customized', bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-900' },
  PROPOSAL_SENT: { label: 'Proposal sent', bg: 'bg-teal-100 border-teal-300', text: 'text-teal-900' },
  READY_TO_BOOK: { label: 'Ready to book', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CONVERTED: { label: 'Booked', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
  CLOSED: { label: 'Closed', bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700' },
};

export const CustomerEnquiryModal: React.FC<CustomerEnquiryModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  packageMap,
}) => {
  if (!isOpen || !enquiry) return null;

  const pkg = enquiry.itineraryId ? packageMap[enquiry.itineraryId] : undefined;
  const statusInfo = STATUS_CONFIG[enquiry.status] || {
    label: ENQUIRY_STATUS_LABELS[enquiry.status] || enquiry.status,
    bg: 'bg-gray-100 border-gray-300',
    text: 'text-gray-800',
  };
  const statusExplanation = ENQUIRY_STATUS_EXPLANATIONS[enquiry.status] || "We're reviewing your travel request.";

  // Normalize fields across canonical and legacy enquiry formats
  const ref = enquiry.enquiryId || enquiry.id || 'NFA-ENQ';
  const journeyTitle = enquiry.itineraryTitle || enquiry.destination || 'Custom Journey Enquiry';
  const destination = enquiry.destination || pkg?.destinations?.[0] || 'Global';
  const travelDate = enquiry.trip?.travelDate || (enquiry as any).travelDate || 'Flexible / TBD';
  const duration = enquiry.trip?.numberOfDays || enquiry.duration || pkg?.duration || '';
  const adults = enquiry.trip?.adults ?? (enquiry as any).travellers?.adults ?? 1;
  const children = enquiry.trip?.children ?? (enquiry as any).travellers?.children ?? 0;
  const childAges = enquiry.trip?.childAges || [];
  const budget = enquiry.preferences?.budget || (enquiry as any).budgetRange || '';
  const travelStyles = enquiry.preferences?.travelStyle || [];
  const accommodationStyle = enquiry.preferences?.accommodationStyle || '';
  const specialOccasion = enquiry.preferences?.specialOccasion || '';
  const dietary = enquiry.preferences?.dietary || '';
  const accessibility = enquiry.preferences?.accessibility || '';
  const specialRequests = enquiry.preferences?.specialRequests || (enquiry as any).notes || '';

  // Safe WhatsApp URL generation
  const handleWhatsAppChat = () => {
    const adminPhone = localStorage.getItem('nfa_admin_whatsapp') || '+919876543210';
    const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
    
    const lines = [
      `Hello NO FIXED ADDRESS team,`,
      `I'm following up on my travel enquiry *${ref}* for *${journeyTitle}*.`,
      `Destination: ${destination}`,
      `Travel Date: ${travelDate}`,
      `Travellers: ${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ''}`,
      `I'd love to discuss my travel plans.`,
    ];
    
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="bg-[#FCFBF7] border-[4px] border-[#121212] w-full max-w-2xl p-6 sm:p-8 shadow-[12px_12px_0px_0px_#121212] relative max-h-[90vh] overflow-y-auto text-left space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="border-b-4 border-[#121212] pb-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
                TRAVEL ENQUIRY
              </span>
              <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>

            <h2 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#121212]">
              {journeyTitle}
            </h2>

            <p className="font-mono text-xs font-bold text-slate-500">
              REFERENCE: <span className="text-[#121212] font-black">{ref}</span>
            </p>
          </div>

          {/* Status Explanation Banner */}
          <div className="p-4 bg-white border-2 border-[#121212] rounded-xl flex items-start gap-3 shadow-[3px_3px_0px_0px_#F4BF4B]">
            <Sparkles size={18} className="text-[#9E1B1D] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#121212] block">
                Current Status
              </span>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">
                {statusExplanation}
              </p>
            </div>
          </div>

          {/* Journey Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border-2 border-[#121212] p-5 rounded-xl">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <MapPin size={12} className="text-[#9E1B1D]" /> Destination
              </span>
              <p className="text-sm font-bold text-slate-900">{destination}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-[#F4BF4B]" /> Preferred Dates
              </span>
              <p className="text-sm font-bold text-slate-900">
                {travelDate} {duration ? `(${duration} Days)` : ''}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Users size={12} className="text-slate-600" /> Travellers Breakdown
              </span>
              <p className="text-sm font-bold text-slate-900">
                {adults} Adult(s){children > 0 ? `, ${children} Child(ren)` : ''}
                {childAges.length > 0 ? ` (Ages: ${childAges.join(', ')})` : ''}
              </p>
            </div>

            {budget && (
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Compass size={12} className="text-[#9E1B1D]" /> Budget Range
                </span>
                <p className="text-sm font-bold text-slate-900">{budget}</p>
              </div>
            )}
          </div>

          {/* Preferences Details (if present) */}
          {(travelStyles.length > 0 || accommodationStyle || specialOccasion || dietary || accessibility) && (
            <div className="p-5 bg-white border-2 border-[#121212] rounded-xl space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Heart size={14} className="text-[#9E1B1D]" /> Travel Preferences
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {travelStyles.length > 0 && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Travel Styles</span>
                    <span className="font-bold text-slate-800">{travelStyles.join(', ')}</span>
                  </div>
                )}
                {accommodationStyle && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Accommodation</span>
                    <span className="font-bold text-slate-800">{accommodationStyle}</span>
                  </div>
                )}
                {specialOccasion && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Occasion</span>
                    <span className="font-bold text-slate-800">{specialOccasion}</span>
                  </div>
                )}
                {dietary && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Dietary Notes</span>
                    <span className="font-bold text-slate-800">{dietary}</span>
                  </div>
                )}
                {accessibility && (
                  <div className="sm:col-span-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Accessibility Requirements</span>
                    <span className="font-bold text-slate-800">{accessibility}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Requests / Notes from Traveller */}
          {specialRequests && (
            <div className="space-y-2 bg-white border-2 border-[#121212] p-5 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F4BF4B]" /> Special Requests & Notes
              </h4>
              <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                "{specialRequests}"
              </p>
            </div>
          )}

          {/* Itinerary PDF & WhatsApp Action Section */}
          <div className="border-t-2 border-[#121212]/10 pt-4 space-y-3">
            {pkg?.itineraryPDF && (
              <div className="flex items-center justify-between bg-white border-2 border-[#121212] p-4 rounded-xl shadow-[4px_4px_0px_0px_#F4BF4B]">
                <div className="flex items-center gap-3">
                  <FileText size={22} className="text-[#9E1B1D]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase">Official Itinerary PDF</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Uploaded by NFA Travel Concierge</p>
                  </div>
                </div>

                <a
                  href={pkg.itineraryPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#121212] text-[#F4BF4B] px-5 py-2.5 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#9E1B1D] hover:text-white transition-colors"
                >
                  <Download size={14} /> Download PDF
                </a>
              </div>
            )}

            {/* Explicit WhatsApp Handoff CTA */}
            <button
              onClick={handleWhatsAppChat}
              className="w-full bg-[#121212] text-[#F4BF4B] p-4 border-2 border-[#121212] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-[4px_4px_0px_0px_#121212] cursor-pointer"
            >
              <MessageCircle size={18} /> CONTINUE ON WHATSAPP
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
