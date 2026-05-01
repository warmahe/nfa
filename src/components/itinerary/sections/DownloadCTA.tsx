import React, { useState } from 'react';
import { Phone, Download, CheckCircle, Loader, FileText } from 'lucide-react';
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
      setError('System Error. Please attempt extraction again.');
    }
  };

  return (
    <section
      id="download"
      className="py-24 px-4 md:px-8 bg-[#F4BF4B] border-y-4 border-[#121212] overflow-hidden relative"
      aria-label="Secure Dossier"
    >
      {/* Ghost text background */}
      <span className="absolute right-0 top-0 font-brand font-black text-[200px] text-[#121212]/5 leading-none select-none pointer-events-none uppercase">
        MANIFEST
      </span>

      <div className="max-w-[1440px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <div className="border-4 border-[#121212] p-8 md:p-12 bg-[#FCFBF7] shadow-[12px_12px_0_0_#121212]">
            <span className="inline-block border-2 border-[#121212] px-4 py-1 font-mono font-black text-[10px] uppercase tracking-[0.3em] text-[#FCFBF7] bg-[#9E1B1D] mb-6 shadow-[4px_4px_0_0_#121212]">
              Secure Document
            </span>
            <h2 className="font-brand font-black text-5xl md:text-7xl uppercase tracking-tighter text-[#121212] leading-[0.85] mb-6">
              Download<br />Manifest.
            </h2>
            <div className="w-16 h-2 bg-[#121212] mb-6" />
            <p className="font-sans font-bold text-sm text-[#121212]/80 uppercase tracking-wide leading-relaxed max-w-md">
              Extract the complete day-by-day itinerary, tactical packing list, and comprehensive briefing document. Secure, direct, no spam.
            </p>
          </div>

          {/* Right: Form / Success */}
          <div>
            {status === 'success' ? (
              <div className="bg-[#121212] border-4 border-[#121212] p-10 text-center shadow-[12px_12px_0px_0px_#9E1B1D] relative">
                <div className="absolute top-4 left-4 size-4 rounded-full bg-green-500 border-2 border-[#121212] animate-pulse" />
                <CheckCircle size={48} className="text-[#F4BF4B] mx-auto mb-4" />
                <h3 className="font-brand font-black text-3xl text-[#FCFBF7] uppercase tracking-tight mb-2">
                  Extraction Complete.
                </h3>
                <p className="font-sans font-bold text-white/60 text-xs uppercase tracking-widest mb-8">
                  Our operatives will transmit the dossier shortly.
                </p>
                {/* Mock PDF link */}
                <a
                  href="/itinerary-sample.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-2 bg-[#F4BF4B] text-[#121212] px-8 py-5 font-black text-[11px] uppercase tracking-widest border-2 border-[#F4BF4B] hover:bg-[#FCFBF7] transition-colors"
                >
                  <FileText size={16} /> Access PDF Directly
                </a>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#121212] border-4 border-[#121212] p-8 shadow-[12px_12px_0px_0px_#9E1B1D]"
                noValidate
              >
                <label className="block font-sans font-black text-[10px] uppercase tracking-widest text-[#F4BF4B] mb-4">
                  Transmission Frequency (Mobile Number)
                </label>

                <div className="flex border-4 border-[#F4BF4B] mb-6 focus-within:border-[#FCFBF7] transition-colors bg-[#121212]">
                  <div className="flex items-center px-4 bg-[#F4BF4B] border-r-4 border-[#121212]">
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
                    className="flex-1 bg-transparent px-4 py-4 font-mono font-black text-[#FCFBF7] text-lg placeholder:text-white/20 outline-none"
                    disabled={status === 'loading'}
                    required
                    aria-describedby={error ? 'phone-error' : undefined}
                  />
                </div>

                {error && (
                  <p id="phone-error" className="text-[#9E1B1D] text-[10px] font-black uppercase tracking-widest mb-6 bg-[#9E1B1D]/10 px-4 py-3 border-2 border-[#9E1B1D]/40">
                    ⚠ {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !phone}
                  className="w-full bg-[#F4BF4B] text-[#121212] py-5 font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#FCFBF7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#F4BF4B] active:scale-[0.98]"
                >
                  {status === 'loading' ? (
                    <><Loader size={16} className="animate-spin" /> Processing Request…</>
                  ) : (
                    <><Download size={16} /> Secure Manifest</>
                  )}
                </button>

                <p className="text-white/30 font-black text-[9px] uppercase tracking-widest mt-6 text-center border-t border-white/10 pt-4">
                  End-to-End Encryption. No Unauthorized Transmissions.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
