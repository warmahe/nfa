import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 pb-24 px-[clamp(1rem,4vw,3rem)]">
      <div className="max-w-[800px] mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-12 font-black text-xs uppercase tracking-widest text-[#9E1B1D] hover:text-[#121212] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <header className="mb-12 border-b-4 border-[#121212] pb-8">
          <h1 className="font-brand font-black text-5xl uppercase tracking-tighter text-[#121212]">
            Privacy <span className="text-[#9E1B1D]">Policy.</span>
          </h1>
        </header>

        <article className="space-y-8 text-[#121212]">
          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Information We Collect</h2>
            <p className="font-bold text-sm leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes your name, email address, phone number, payment information, and travel preferences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">How We Use Your Information</h2>
            <p className="font-bold text-sm leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, and comply with legal obligations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Information Sharing</h2>
            <p className="font-bold text-sm leading-relaxed">
              We do not sell or share your personal information with third parties without your explicit consent, except as necessary to provide our services or as required by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Data Security</h2>
            <p className="font-bold text-sm leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Your Rights</h2>
            <p className="font-bold text-sm leading-relaxed">
              You have the right to access, update, or delete your personal information at any time by contacting us. You can also opt-out of promotional communications by following the unsubscribe instructions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Changes to This Policy</h2>
            <p className="font-bold text-sm leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Contact Us</h2>
            <p className="font-bold text-sm leading-relaxed">
              If you have any questions about this privacy policy, please contact us at <a href="mailto:hello@nofixedaddress.com" className="text-[#9E1B1D] hover:underline">hello@nofixedaddress.com</a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};
