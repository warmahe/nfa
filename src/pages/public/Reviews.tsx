import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Review } from '../../types/database';

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'global_reviews'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1440px] mx-auto">
        <div className="border-b-[4px] border-[#121212] pb-12 mb-16">
          <div className="flex items-center gap-3 text-[#9E1B1D] mb-4">
            <ShieldCheck size={18} />
            <span className="font-black text-[10px] uppercase tracking-[0.4em]">Field Reports</span>
          </div>
          <h1 className="font-brand font-black text-[clamp(3rem,8vw,8rem)] leading-[0.8] uppercase tracking-tighter text-[#121212]">
            COLLECTIVE <br /><span className="text-[#9E1B1D]">EVIDENCE.</span>
          </h1>
        </div>

        {loading ? (
          <div className="font-black text-xs uppercase tracking-widest opacity-30">Decrypting Field Logs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="border-[3px] border-[#121212] bg-white p-8 md:p-10 shadow-[6px_6px_0px_0px_#121212] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col h-full">
                <Quote className="text-[#9E1B1D]/20 mb-8" size={40} fill="currentColor" />
                <p className="font-brand italic text-xl md:text-2xl text-[#121212]/80 leading-relaxed mb-10 flex-1">
                  "{review.content}"
                </p>
                <div className="border-t-[3px] border-[#121212] pt-6 mt-auto">
                  <div className="flex items-center gap-4 mb-4">
                    {review.avatar && <img src={review.avatar} className="size-10 border-2 border-[#121212]  object-cover" alt="traveler" />}
                    <h4 className="font-black text-sm uppercase tracking-widest text-[#121212]">{review.travelerName}</h4>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E1B1D]">{review.role}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className={`size-2 rotate-45 border border-[#121212] ${j < review.rating ? 'bg-[#F4BF4B]' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};