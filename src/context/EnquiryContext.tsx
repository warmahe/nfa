import React, { createContext, useContext, useState } from 'react';
import { Package } from '../types/database';

export interface EnquiryTarget {
  pkg?: Package;
  itineraryTitle?: string;
  itineraryId?: string;
  itinerarySlug?: string;
  destination?: string;
  duration?: string;
  price?: number;
  source?: 'ITINERARY' | 'CONTACT_PAGE' | 'DIRECT';
  entryPoint?: 'HERO' | 'STICKY_CARD' | 'MOBILE_STICKY' | 'CONTACT_PAGE' | 'DIRECT';
}

interface EnquiryContextType {
  isOpen: boolean;
  target: EnquiryTarget | null;
  openEnquiry: (target?: EnquiryTarget) => void;
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
    <EnquiryContext.Provider value={{ isOpen, target, openEnquiry, closeEnquiry }}>
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
