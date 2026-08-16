import React, { createContext, useContext, useState } from 'react';
import { Package } from '../types/database';

export interface EnquiryTarget {
  pkg?: Package;
  itineraryTitle?: string;
  itineraryId?: string;
  itinerarySlug?: string;
  destination?: string;
  destinationSlug?: string;
  storyTitle?: string;
  storyId?: string;
  storySlug?: string;
  duration?: string;
  price?: number;
  currency?: string;
  initialTravelDate?: string;
  initialTravellerCount?: number;
  source?: 'ITINERARY' | 'DESTINATION' | 'CUSTOMER_STORY' | 'HOMEPAGE' | 'PACKAGES' | 'CONTACT_PAGE' | 'DIRECT' | string;
  entryPoint?: 'HERO' | 'STICKY_CARD' | 'MOBILE_STICKY' | 'SECTION_CTA' | 'STORY_DETAIL_CTA' | 'CONTACT_PAGE' | 'DIRECT' | string;
}

interface EnquiryContextType {
  isOpen: boolean;
  target: EnquiryTarget | null;
  openEnquiry: (target?: EnquiryTarget) => void;
  openEnquiryModal: (target?: EnquiryTarget) => void; // Alias for backward compatibility
  closeEnquiry: () => void;
}

const EnquiryContext = createContext<EnquiryContextType | undefined>(undefined);

export const EnquiryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<EnquiryTarget | null>(null);

  const openEnquiry = (newTarget?: EnquiryTarget) => {
    setTarget(newTarget || null);
    setIsOpen(true);
  };

  const closeEnquiry = () => {
    setIsOpen(false);
    setTarget(null);
  };

  return (
    <EnquiryContext.Provider
      value={{
        isOpen,
        target,
        openEnquiry,
        openEnquiryModal: openEnquiry,
        closeEnquiry,
      }}
    >
      {children}
    </EnquiryContext.Provider>
  );
};

export const useEnquiry = () => {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider');
  }
  return context;
};

// Global hook alias for backward compatibility
export const useEnquiryModal = useEnquiry;
