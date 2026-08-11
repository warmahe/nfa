import React, { useEffect } from 'react';
import { X, Compass } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { EnquiryForm } from './EnquiryForm';

export const EnquiryModal: React.FC = () => {
  const { isOpen, target, closeEnquiry } = useEnquiry();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeEnquiry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeEnquiry]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Expedition Enquiry Modal"
      className="fixed inset-0 z-[10000] bg-[#121212]/80 backdrop-blur-sm flex justify-center items-start sm:items-center p-4 sm:p-6 pt-20 sm:pt-24 pb-12 overflow-y-auto animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) closeEnquiry();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#FCFBF7] border-4 border-[#121212] p-6 sm:p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)] my-auto animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b-4 border-[#121212] mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#121212] text-[#F4BF4B] flex items-center justify-center border-2 border-[#121212] shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block">
                NFA Expeditions
              </span>
              <h3 className="font-brand font-black text-2xl sm:text-3xl uppercase tracking-tighter text-[#121212] leading-none">
                Expedition Enquiry
              </h3>
            </div>
          </div>

          <button
            onClick={closeEnquiry}
            className="p-2 text-[#121212] hover:text-[#9E1B1D] hover:bg-gray-200 transition-colors border-2 border-[#121212] bg-white cursor-pointer"
            aria-label="Close enquiry modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Enquiry Form Body */}
        <EnquiryForm target={target} onClose={closeEnquiry} />

      </div>
    </div>
  );
};
