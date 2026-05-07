import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }
    setStatus('loading');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <section className="w-full border-t-4 border-[#121212] bg-[#121212] text-[#FCFBF7]">
      <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D] mb-4">Dispatch Protocol</p>
          <h2 className="font-brand font-black text-[clamp(2.5rem,5vw,5rem)] uppercase leading-[0.85] tracking-tighter text-[#FCFBF7] mb-6">
            STAY IN<br /><span className="text-[#F4BF4B]">THE LOOP.</span>
          </h2>
          <p className="font-sans font-bold text-sm opacity-60 max-w-sm leading-relaxed">
            New expedition drops, exclusive early access, and field dispatches from active routes. No filler. No spam.
          </p>
        </motion.div>

        {/* Right */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          {status === 'success' ? (
            <div className="flex items-center gap-4 border-4 border-[#F4BF4B] p-8">
              <CheckCircle size={40} className="text-[#F4BF4B] shrink-0" />
              <div>
                <h4 className="font-black text-xl uppercase tracking-tight text-[#F4BF4B]">You're In.</h4>
                <p className="font-sans font-bold text-sm opacity-60 mt-1">Welcome to the collective. Field reports incoming.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 border-4 border-[#FCFBF7] shadow-[8px_8px_0px_0px_#9E1B1D]">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`flex-1 bg-transparent border-0 px-6 py-5 font-black text-[10px] uppercase tracking-widest outline-none placeholder-white/30 text-[#FCFBF7] ${status === 'error' ? 'placeholder-red-400' : ''}`}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[#F4BF4B] text-[#121212] px-8 py-5 font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors flex items-center gap-2 shrink-0 disabled:opacity-60"
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Subscribe
              </button>
            </form>
          )}
          <p className="font-black text-[8px] uppercase tracking-widest opacity-30 mt-4">
            No spam. Unsubscribe anytime. Dispatch frequency: 2–3x/month.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
