import React from 'react';

export const Notification = ({ text, type }: { text: string, type: 'error' | 'success' }) => (
  <div className={`fixed top-5 right-5 z-[9999] px-6 py-4 border-2 border-[#121212] shadow-[4px_4px_0_0_#121212] font-black uppercase tracking-widest text-xs ${type === 'error' ? 'bg-red-600 text-white' : 'bg-[#F4BF4B] text-[#121212]'}`}>
    {text}
  </div>
);