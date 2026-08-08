import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1200);
  };

  return (
    <section className="w-full border-t-4 border-[#121212] bg-[#121212] text-[#FCFBF7] py-20 md:py-28 px-[clamp(1rem,4vw,3rem)]">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Copy */}
        <div>
          <p className="font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">Direct Dispatch</p>
          <h2 className="font-brand font-black text-[clamp(2.5rem,5vw,4.5rem)] uppercase leading-[0.85] tracking-tighter text-[#FCFBF7] mb-6">
            STAY IN <br /><span className="text-[#F4BF4B]">THE LOOP.</span>
          </h2>
          <p className="font-sans font-bold text-sm text-[#FCFBF7]/70 max-w-md leading-relaxed">
            New trips as we build them, real stories from clients who've travelled with us, and a few things we've picked up along the way. Nothing you didn't ask for.
          </p>
        </div>

        {/* Right Form */}
        <div>
          {status === 'success' ? (
            <div className="flex items-center gap-4 border-4 border-[#F4BF4B] p-8 bg-white/5">
              <CheckCircle size={36} className="text-[#F4BF4B] shrink-0" />
              <div>
                <h4 className="font-black text-xl uppercase tracking-tight text-[#F4BF4B]">You're Subscribed.</h4>
                <p className="font-sans font-bold text-xs text-[#FCFBF7]/60 mt-1">Field reports and new builds will be delivered to your inbox.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row border-4 border-[#FCFBF7] shadow-[8px_8px_0px_0px_#9E1B1D]">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent px-6 py-5 font-black text-xs uppercase tracking-widest outline-none placeholder:text-white/30 text-[#FCFBF7]"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#F4BF4B] text-[#121212] px-8 py-5 font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                SUBSCRIBE
              </button>
            </form>
          )}
          <p className="font-black text-[9px] uppercase tracking-widest text-[#FCFBF7]/40 mt-4">
            No spam. Only travel. Unsubscribe anytime.
          </p>
        </div>

      </div>
    </section>
  );
};