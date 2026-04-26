import React, { useState } from 'react';
import { Phone, Download, CheckCircle, Loader } from 'lucide-react';
import { setDocument } from '../../../services/firebaseService';
import { Package } from '../../../types/database';
import { Timestamp } from 'firebase/firestore';

interface DownloadCTAProps {
  pkg: Package;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const DownloadCTA: React.FC<DownloadCTAProps> = ({ pkg }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const validate = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\s/g, ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setStatus('loading');
    try {
      const leadId = `lead_${Date.now()}`;
      await setDocument('leads', leadId, {
        id: leadId,
        phone: phone.trim(),
        packageId: pkg?.id || null,
        packageTitle: pkg?.title || null,
        source: 'download_cta',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      id="download"
      className="py-24 px-6 md:px-16 bg-[#F4BF4B] border-y-4 border-[#121212] overflow-hidden relative"
      aria-label="Download itinerary"
    >
      {/* Ghost text background */}
      <span className="absolute right-0 top-0 font-brand font-black text-[200px] text-[#121212]/5 leading-none select-none pointer-events-none uppercase">
        PDF
      </span>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div>
            <span className="block font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">
              Free Download
            </span>
            <h2 className="font-brand font-black text-[clamp(3rem,6vw,5rem)] uppercase tracking-tighter text-[#121212] leading-[0.85] mb-6">
              Get the Full<br />Itinerary PDF.
            </h2>
            <p className="font-sans font-bold text-sm text-[#121212]/60 uppercase tracking-wide leading-relaxed max-w-md">
              We'll send the complete day-by-day itinerary, packing list, and briefing doc directly to you. No spam. Just the essentials.
            </p>
          </div>

          {/* Right: Form / Success */}
          <div>
            {status === 'success' ? (
              <div className="bg-[#121212] border-4 border-[#121212] p-10 text-center shadow-[12px_12px_0px_0px_#9E1B1D]">
                <CheckCircle size={48} className="text-[#F4BF4B] mx-auto mb-4" />
                <h3 className="font-brand font-black text-2xl text-white uppercase tracking-tight mb-2">
                  We Got You.
                </h3>
                <p className="font-sans font-bold text-white/60 text-xs uppercase tracking-widest mb-6">
                  Our team will reach out shortly with your itinerary.
                </p>
                {/* Mock PDF link */}
                <a
                  href="/itinerary-sample.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#F4BF4B] text-[#121212] px-8 py-4 font-black text-[10px] uppercase tracking-widest border-2 border-[#F4BF4B] hover:bg-white transition-colors"
                >
                  <Download size={16} /> Download PDF Now
                </a>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#121212] border-4 border-[#121212] p-8 shadow-[12px_12px_0px_0px_#9E1B1D]"
                noValidate
              >
                <label className="block font-sans font-black text-[10px] uppercase tracking-widest text-[#F4BF4B] mb-4">
                  Your Mobile Number
                </label>

                <div className="flex border-4 border-[#F4BF4B] mb-4 focus-within:border-white transition-colors">
                  <div className="flex items-center px-4 bg-[#F4BF4B] border-r-2 border-[#121212]">
                    <Phone size={18} className="text-[#121212]" />
                    <span className="ml-2 font-black text-sm text-[#121212]">+91</span>
                  </div>
                  <input
                    id="lead-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError(''); }}
                    placeholder="98765 43210"
                    className="flex-1 bg-transparent px-4 py-4 font-black text-white text-lg placeholder:text-white/20 outline-none"
                    disabled={status === 'loading'}
                    required
                    aria-describedby={error ? 'phone-error' : undefined}
                  />
                </div>

                {error && (
                  <p id="phone-error" className="text-[#9E1B1D] text-[10px] font-black uppercase tracking-widest mb-4 bg-red-50/10 px-3 py-2 border border-[#9E1B1D]/40">
                    ⚠ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !phone}
                  className="w-full bg-[#F4BF4B] text-[#121212] py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#F4BF4B] active:scale-[0.98]"
                >
                  {status === 'loading' ? (
                    <><Loader size={16} className="animate-spin" /> Processing…</>
                  ) : (
                    <><Download size={16} /> Download Itinerary</>
                  )}
                </button>

                <p className="text-white/30 font-black text-[9px] uppercase tracking-widest mt-4 text-center">
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
