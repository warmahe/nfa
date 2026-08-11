import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Users, FileText, Download, Sparkles, Compass } from 'lucide-react';
import { EnquiryDocument, Package } from '../../types/database';

interface CustomerEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiry: EnquiryDocument | null;
  packageMap: Record<string, Package>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  NEW: { label: 'New', bg: 'bg-amber-100', text: 'text-amber-900 border-amber-300' },
  CONTACTED: { label: 'Contacted', bg: 'bg-blue-100', text: 'text-blue-900 border-blue-300' },
  IN_DISCUSSION: { label: 'In discussion', bg: 'bg-purple-100', text: 'text-purple-900 border-purple-300' },
  CUSTOMIZATION: { label: 'Journey being customized', bg: 'bg-indigo-100', text: 'text-indigo-900 border-indigo-300' },
  PROPOSAL_SENT: { label: 'Proposal sent', bg: 'bg-teal-100', text: 'text-teal-900 border-teal-300' },
  READY_TO_BOOK: { label: 'Ready to book', bg: 'bg-emerald-100', text: 'text-emerald-900 border-emerald-300' },
  CONVERTED: { label: 'Booked', bg: 'bg-emerald-100', text: 'text-emerald-900 border-emerald-300' },
  CLOSED: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-700 border-gray-300' },
};

export const CustomerEnquiryModal: React.FC<CustomerEnquiryModalProps> = ({
  isOpen,
  onClose,
  enquiry,
  packageMap,
}) => {
  if (!isOpen || !enquiry) return null;

  const pkg = enquiry.itineraryId ? packageMap[enquiry.itineraryId] : undefined;
  const statusInfo = STATUS_CONFIG[enquiry.status] || { label: enquiry.status, bg: 'bg-gray-100', text: 'text-gray-800 border-gray-300' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className="bg-[#FCFBF7] border-[4px] border-[#121212] w-full max-w-2xl p-8 shadow-[12px_12px_0px_0px_#121212] relative max-h-[90vh] overflow-y-auto text-left space-y-6"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
            <X size={20} />
          </button>

          {/* Header */}
          <div className="border-b-4 border-[#121212] pb-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
                JOURNEY ENQUIRY DETAILS
              </span>
              <span className={`px-3 py-1 font-black text-[9px] uppercase tracking-widest border-2 ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            
            <h2 className="font-brand font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#121212]">
              {enquiry.itineraryTitle || enquiry.destination || 'Custom Journey Enquiry'}
            </h2>
            
            <p className="font-mono text-xs font-bold text-slate-500">
              REFERENCE: <span className="text-[#121212]">{enquiry.reference || enquiry.id}</span>
            </p>
          </div>

          {/* Journey Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border-2 border-[#121212] p-5 rounded-xl shadow-[4px_4px_0px_0px_#121212]">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <MapPin size={12} className="text-[#9E1B1D]" /> Destination
              </span>
              <p className="text-sm font-bold text-slate-900">{enquiry.destination || 'Global Sector'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-[#F4BF4B]" /> Preferred Travel Date
              </span>
              <p className="text-sm font-bold text-slate-900">{enquiry.travelDate || 'Flexible'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Users size={12} className="text-slate-600" /> Travellers Breakdown
              </span>
              <p className="text-sm font-bold text-slate-900">
                {enquiry.travellers?.adults || 1} Adult(s)
                {enquiry.travellers?.children ? `, ${enquiry.travellers.children} Child(ren)` : ''}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Compass size={12} className="text-[#9E1B1D]" /> Budget Range
              </span>
              <p className="text-sm font-bold text-slate-900">{enquiry.budgetRange || 'Flexible Investment'}</p>
            </div>
          </div>

          {/* Special Requests / Notes from Traveller */}
          {enquiry.notes && (
            <div className="space-y-2 bg-white border-2 border-[#121212] p-5 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F4BF4B]" /> Special Requests & Notes
              </h4>
              <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                "{enquiry.notes}"
              </p>
            </div>
          )}

          {/* Dossier PDF Download Section */}
          <div className="border-t-2 border-[#121212]/10 pt-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#9E1B1D] mb-3">
              Itinerary PDF
            </h4>

            {pkg?.itineraryPDF ? (
              <div className="flex items-center justify-between bg-white border-2 border-[#121212] p-4 rounded-xl shadow-[4px_4px_0px_0px_#F4BF4B]">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-[#9E1B1D]" />
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
            ) : (
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-500 uppercase text-center">
                Itinerary PDF is not available yet. Our team will share it shortly.
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
