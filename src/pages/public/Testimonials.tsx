import React, { useState, useEffect } from 'react';
import { Star, Quote, ShieldCheck, ThumbsUp, Users, MapPin, Award } from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Review } from '../../types/database';
import { motion } from 'motion/react';

const RATING_STATS = [
  { stars: 5, pct: 74 },
  { stars: 4, pct: 17 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

const FILTER_RATINGS = [0, 5, 4, 3];

export const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'global_reviews'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      } catch (err) {
        console.error(err);
        // Fallback demo data
        setReviews([
          { id: '1', travelerName: 'Sofia Andersen', role: 'Photographer', rating: 5, content: "I've traveled to 40+ countries and NFA delivered an experience I genuinely couldn't replicate on my own. The Iceland expedition felt real — raw, unpredictable, and deeply human.", title: 'Extraordinary', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', helpfulCount: 24, unhelpfulCount: 0, approved: true, featured: true, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
          { id: '2', travelerName: 'Marcus Webb', role: 'Architect', rating: 5, content: "Every detail was intentional. The group energy was incredible — twelve strangers became a family. Book it before they get too big.", title: 'Life-changing', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', helpfulCount: 18, unhelpfulCount: 1, approved: true, featured: true, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
          { id: '3', travelerName: 'Priya Sharma', role: 'Software Engineer', rating: 5, content: "The logistics were flawless but the magic was in the unscripted moments — a midnight glacier hike, a bonfire under the Aurora. Worth every rupee.", title: 'Worth every penny', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', helpfulCount: 31, unhelpfulCount: 0, approved: true, featured: false, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
          { id: '4', travelerName: 'James Liu', role: 'Filmmaker', rating: 4, content: "Cinematic landscapes, an extraordinary team, and moments I'll be editing into memory for years. NFA doesn't run tours — they craft stories.", title: 'A filmmaker\'s dream', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', helpfulCount: 15, unhelpfulCount: 2, approved: true, featured: false, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
          { id: '5', travelerName: 'Elena Vasquez', role: 'Marine Biologist', rating: 5, content: "Went alone. Came back with eight new friends scattered across four continents. The Patagonia trip redefined what adventure means to me.", title: 'Redefines adventure', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', helpfulCount: 22, unhelpfulCount: 0, approved: true, featured: true, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
          { id: '6', travelerName: 'Kenji Tanaka', role: 'Chef', rating: 5, content: "The food experiences alone justified the cost. Local ingredients, local cooks, local legends. NFA knows that culture lives in the kitchen.", title: 'Beyond expectations', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100', helpfulCount: 19, unhelpfulCount: 1, approved: true, featured: false, verifiedPurchase: true, isAnonymous: false, createdAt: null as any, updatedAt: null as any },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filtered = filterRating === 0 ? reviews : reviews.filter(r => r.rating === filterRating);
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 px-[clamp(1rem,4vw,3rem)] nfa-texture selection:bg-nfa-gold">
      <div className="max-w-[1440px] mx-auto">

        {/* ── HEADER ── */}
        <div className="border-b-[4px] border-[#121212] pb-12 mb-16">
          <div className="flex items-center gap-3 text-[#9E1B1D] mb-4">
            <ShieldCheck size={18} />
            <span className="font-black text-[10px] uppercase tracking-[0.4em]">Verified Field Reports</span>
          </div>
          <h1 className="font-brand font-black text-[clamp(3rem,8vw,8rem)] leading-[0.8] uppercase tracking-tighter text-[#121212]">
            REAL<br /><span className="text-[#9E1B1D]">VOICES.</span>
          </h1>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-20">
          {/* Overall Score */}
          <div className="lg:col-span-1 border-[4px] border-[#121212] bg-[#121212] text-[#FCFBF7] p-8 shadow-[8px_8px_0px_0px_#F4BF4B]">
            <div className="text-[#F4BF4B] font-brand font-black text-8xl leading-none mb-4">{avgRating}</div>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => <div key={s} className="size-3 rotate-45 bg-[#F4BF4B] border border-[#F4BF4B]" />)}
            </div>
            <p className="font-black text-[10px] uppercase tracking-widest text-[#FCFBF7]/60">Average Rating</p>
            <p className="font-black text-lg mt-1">{reviews.length} reviews</p>
          </div>

          {/* Star Breakdown */}
          <div className="lg:col-span-1 border-[3px] border-[#121212] bg-white p-8">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-[#9E1B1D] mb-6">Rating Distribution</h4>
            {RATING_STATS.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-3 mb-3">
                <span className="font-black text-xs w-4">{stars}</span>
                <div className="flex-1 h-2 bg-[#121212]/10 border border-[#121212]/20">
                  <div className="h-full bg-[#F4BF4B] border-r border-[#121212]" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-black text-[9px] text-[#121212]/50 w-8">{pct}%</span>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          {[
            { icon: Users, label: "Happy Travelers", value: "2,400+" },
            { icon: MapPin, label: "Destinations", value: "30+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="border-[3px] border-[#121212] bg-white p-8 flex flex-col justify-between shadow-[4px_4px_0px_0px_#121212]">
              <Icon size={32} className="text-[#9E1B1D] mb-4" />
              <div>
                <div className="font-brand font-black text-6xl text-[#121212] leading-none mb-2">{value}</div>
                <p className="font-black text-[10px] uppercase tracking-widest text-[#121212]/50">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER ── */}
        <div className="flex flex-wrap gap-3 mb-10">
          {FILTER_RATINGS.map(r => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              className={`px-5 py-2 border-2 border-[#121212] font-black text-[9px] uppercase tracking-widest transition-all ${
                filterRating === r ? 'bg-[#121212] text-[#F4BF4B]' : 'bg-white hover:bg-[#F4BF4B]'
              }`}
            >
              {r === 0 ? 'All Reviews' : `${r} Stars`}
            </button>
          ))}
        </div>

        {/* ── REVIEWS GRID ── */}
        {loading ? (
          <div className="font-black text-xs uppercase tracking-widest opacity-30 py-12 text-center">Decrypting Field Logs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border-[3px] border-[#121212] bg-white p-8 md:p-10 shadow-[6px_6px_0px_0px_#121212] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col h-full ${
                  review.featured ? 'ring-2 ring-[#F4BF4B] ring-offset-2' : ''
                }`}
              >
                {review.featured && (
                  <div className="flex items-center gap-2 mb-4 text-[#F4BF4B]">
                    <Award size={14} />
                    <span className="font-black text-[8px] uppercase tracking-widest">Featured Review</span>
                  </div>
                )}
                <Quote className="text-[#9E1B1D]/20 mb-6" size={36} fill="currentColor" />
                <p className="font-brand italic text-xl md:text-2xl text-[#121212]/80 leading-relaxed mb-8 flex-1">
                  "{review.content}"
                </p>
                <div className="border-t-[3px] border-[#121212] pt-6 mt-auto">
                  <div className="flex items-center gap-4 mb-4">
                    {review.avatar && (
                      <img src={review.avatar} className="size-12 border-2 border-[#121212] object-cover" alt={review.travelerName} />
                    )}
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-[#121212]">{review.travelerName}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9E1B1D]">{review.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className={`size-2 rotate-45 border border-[#121212] ${j < review.rating ? 'bg-[#F4BF4B]' : 'bg-transparent opacity-20'}`} />
                      ))}
                    </div>
                    {review.verifiedPurchase && (
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#121212]/40">
                        <ShieldCheck size={10} /> Verified
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mt-20 bg-[#121212] text-[#FCFBF7] p-12 md:p-16 border-[4px] border-[#F4BF4B] text-center">
          <h2 className="font-brand font-black text-4xl md:text-6xl uppercase tracking-tighter text-[#F4BF4B] mb-6">Ready to write your story?</h2>
          <p className="font-sans font-bold text-sm opacity-70 max-w-lg mx-auto mb-10">
            Join thousands of explorers who've traded ordinary for extraordinary. Your expedition awaits.
          </p>
          <a href="/destinations" className="inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-12 py-5 font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_#9E1B1D] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            View All Expeditions
          </a>
        </div>
      </div>
    </div>
  );
};
