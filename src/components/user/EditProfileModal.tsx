import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ShieldCheck, Loader2, Heart, User, Sparkles } from 'lucide-react';
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
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [accessibilityPreferences, setAccessibilityPreferences] = useState('');
  const [interests, setInterests] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setPreferredTravelStyle(
        Array.isArray(customer.preferences?.preferredTravelStyle)
          ? customer.preferences.preferredTravelStyle
          : Array.isArray(customer.preferences?.travelStyle)
          ? customer.preferences.travelStyle
          : customer.preferences?.preferredTravelStyle
          ? [customer.preferences.preferredTravelStyle]
          : []
      );
      setAccommodationPreference(customer.preferences?.accommodationPreference || customer.preferences?.accommodationType || '');
      setDietaryPreferences(
        Array.isArray(customer.preferences?.dietaryPreferences)
          ? customer.preferences.dietaryPreferences.join(', ')
          : (customer.preferences?.dietary || '')
      );
      setAccessibilityPreferences(customer.preferences?.accessibility || '');
      setInterests(
        Array.isArray(customer.preferences?.interests)
          ? customer.preferences.interests.join(', ')
          : (customer.preferences?.notes || '')
      );
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

      // Atomic update strictly to permitted profile and travel preference fields
      const customerRef = doc(db, 'customers', userId);
      await updateDoc(customerRef, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        preferences: {
          ...(customer?.preferences || {}),
          preferredTravelStyle,
          accommodationPreference,
          accommodationType: accommodationPreference,
          dietary: dietaryPreferences.trim(),
          accessibility: accessibilityPreferences.trim(),
          notes: interests.trim(),
        },
        updatedAt: serverTimestamp(),
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
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
          className="bg-[#FCFBF7] border-[4px] border-[#121212] w-full max-w-xl p-6 sm:p-8 shadow-[12px_12px_0px_0px_#9E1B1D] relative max-h-[90vh] overflow-y-auto text-left space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div>
            <h2 className="font-brand font-black text-2xl sm:text-3xl uppercase text-[#121212]">
              PROFILE & PREFERENCES
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              Customer Ref: <span className="text-[#9E1B1D] font-mono">{customer?.customerReference || 'NFA-C-PENDING'}</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold uppercase">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-100 border-2 border-emerald-500 text-emerald-800 text-xs font-bold uppercase">
              {successMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSave}>
            {/* Personal Information */}
            <div className="space-y-4 border-b-2 border-slate-200 pb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <User size={14} className="text-[#9E1B1D]" /> Personal Information
              </h4>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Postal Address / City
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="City, Country"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Heart size={14} className="text-[#9E1B1D]" /> Travel Preferences
              </h4>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Preferred Travel Styles (Comma separated)
                </label>
                <input
                  type="text"
                  value={preferredTravelStyle.join(', ')}
                  onChange={(e) =>
                    setPreferredTravelStyle(
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="e.g. Luxury, Wildlife, Slow Travel, Photography"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Preferred Accommodation Style
                </label>
                <input
                  type="text"
                  value={accommodationPreference}
                  onChange={(e) => setAccommodationPreference(e.target.value)}
                  placeholder="e.g. 5-Star Boutique Hotels, Private Safari Camps, Heritage Stays"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Dietary Preferences
                </label>
                <input
                  type="text"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g. Vegetarian, Vegan, Gluten-Free, Halal"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Accessibility & Mobility Requirements
                </label>
                <input
                  type="text"
                  value={accessibilityPreferences}
                  onChange={(e) => setAccessibilityPreferences(e.target.value)}
                  placeholder="e.g. Ground-floor rooms, Step-free access"
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                  Special Travel Notes & Interests
                </label>
                <textarea
                  rows={2}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Celebrating 10th anniversary, passion for local culinary tours..."
                  className="w-full border-2 border-[#121212] p-3 font-bold text-sm outline-none focus:bg-[#F4BF4B]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#121212] text-[#F4BF4B] py-4 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] disabled:opacity-50 cursor-pointer"
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