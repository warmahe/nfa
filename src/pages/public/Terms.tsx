import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Terms = () => {
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
            Terms of <span className="text-[#9E1B1D]">Service.</span>
          </h1>
        </header>

        <article className="space-y-8 text-[#121212]">
          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Acceptance of Terms</h2>
            <p className="font-bold text-sm leading-relaxed">
              By accessing and using the No Fixed Address website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Booking and Reservations</h2>
            <p className="font-bold text-sm leading-relaxed">
              All bookings are subject to availability and our confirmation. A deposit or full payment may be required at the time of booking. Cancellation policies vary by trip and will be provided at booking.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Traveler Responsibilities</h2>
            <p className="font-bold text-sm leading-relaxed">
              Travelers are responsible for obtaining valid passports, visas, travel insurance, and vaccinations required for their destination. We are not liable for denied entry or travel complications due to documentation issues.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Liability Limitation</h2>
            <p className="font-bold text-sm leading-relaxed">
              No Fixed Address is not liable for injuries, illnesses, loss, damages, or other incidents occurring during expeditions. Participation in our trips is at your own risk. We strongly recommend travel insurance.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Modification and Cancellation</h2>
            <p className="font-bold text-sm leading-relaxed">
              We reserve the right to modify or cancel expeditions due to weather, safety concerns, or circumstances beyond our control. Refunds or alternative trips will be offered in such cases.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Code of Conduct</h2>
            <p className="font-bold text-sm leading-relaxed">
              Travelers agree to conduct themselves respectfully and responsibly. We reserve the right to remove any traveler who violates our code of conduct without refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Intellectual Property</h2>
            <p className="font-bold text-sm leading-relaxed">
              All content on our website, including text, graphics, logos, and images, are owned by or licensed to No Fixed Address and protected by copyright laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-black text-2xl uppercase tracking-tighter">Contact Us</h2>
            <p className="font-bold text-sm leading-relaxed">
              For questions about these terms, please contact us at <a href="mailto:hello@nofixedaddress.com" className="text-[#9E1B1D] hover:underline">hello@nofixedaddress.com</a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};
