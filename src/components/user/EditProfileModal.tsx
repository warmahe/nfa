import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { CustomerDocument } from '../../types/database';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDocument | null;
  userId: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  userId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [preferredTravelStyle, setPreferredTravelStyle] = useState<string[]>([]);
  const [accommodationPreference, setAccommodationPreference] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setPreferredTravelStyle(customer.preferences?.preferredTravelStyle || []);
      setAccommodationPreference(customer.preferences?.accommodationPreference || '');
    }
  }, [customer]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      // Atomic update strictly to allowed profile & preference fields
      const customerRef = doc(db, 'customers', userId);
      await updateDoc(customerRef, {
        name,
        phone,
        address,
        preferences: {
          ...(customer?.preferences || {}),
          preferredTravelStyle,
          accommodationPreference,
        },
        updatedAt: serverTimestamp(),
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error updating customer profile:', err);
      setErrorMsg('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#121212]/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
          className="bg-[#FCFBF7] border-[4px] border-[#121212] w-full max-w-xl p-8 shadow-[12px_12px_0px_0px_#9E1B1D] relative max-h-[90vh] overflow-y-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors">
            <X size={20} />
          </button>

          <h2 className="font-brand font-black text-3xl uppercase mb-2">MY PROFILE & PREFERENCES</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Customer Ref: <span className="text-[#9E1B1D] font-mono">{customer?.customerReference || 'NFA-C-PENDING'}</span>
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold uppercase">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-100 border-2 border-emerald-500 text-emerald-800 text-xs font-bold uppercase">
              {successMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSave}>
            <div className="space-y-4 border-b-2 border-slate-200 pb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Personal Information</h4>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Postal Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street, City, Pin Code"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Travel Preferences</h4>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Preferred Travel Styles (Comma Separated)</label>
                <input
                  type="text"
                  value={preferredTravelStyle.join(', ')}
                  onChange={e => setPreferredTravelStyle(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g. Luxury, Wildlife, Culture"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Accommodation Preference</label>
                <input
                  type="text"
                  value={accommodationPreference}
                  onChange={e => setAccommodationPreference(e.target.value)}
                  placeholder="e.g. 5-Star Boutique Hotels, Private Lodges"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#121212] text-[#F4BF4B] py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};