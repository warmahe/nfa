import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, ArrowRight, BookOpen, Clock, User } from "lucide-react";
import { BLOG_POSTS } from "../../utils/constants";

export const Blog = () => {
  const [filter, setFilter] = useState("ALL");
  const categories = ["ALL", ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

  const filteredPosts = useMemo(() => 
    filter === "ALL" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === filter)
  , [filter]);

  const featured = BLOG_POSTS.find(p => p.featured) || BLOG_POSTS[0];

  return (
    <div className="min-h-screen bg-[#FCFBF7] pt-24 md:pt-32 pb-24 nfa-texture selection:bg-nfa-gold">
      
      {/* 1. EDITORIAL HEADER */}
      <section className="max-w-[1440px] mx-auto px-6 mb-16 border-b-4 border-[#121212] pb-12">
        <div className="flex items-center gap-3 text-[#9E1B1D] mb-6">
           <BookOpen size={20} />
           <span className="font-black text-xs uppercase tracking-[0.4em]">The Journal // Field Dispatches</span>
        </div>
        <h1 className="font-brand font-black text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.8] tracking-tighter text-[#121212]">
          TRAVEL <br/><span className="text-[#F4BF4B] drop-shadow-[2px_2px_0px_#121212]">LOGS.</span>
        </h1>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* 2. FEATURED STORY */}
        <Link to={`/blog/${featured.slug}`} className="group block relative border-4 border-[#121212] bg-white mb-20 shadow-[12px_12px_0px_0px_#121212] overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212]">
                 <img src={featured.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[30%] group-hover:grayscale-0" alt="featured"/>
              </div>
              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-white">
                 <span className="bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest w-fit mb-6 shadow-[3px_3px_0px_0px_#121212]">Featured Narrative</span>
                 <h2 className="font-brand font-black text-4xl md:text-6xl uppercase leading-none mb-6 group-hover:text-[#9E1B1D] transition-colors">{featured.title}</h2>
                 <p className="font-serif italic text-lg text-gray-600 mb-8 leading-relaxed">"{featured.excerpt}"</p>
                 <div className="flex items-center gap-6 font-black text-[10px] uppercase tracking-widest opacity-40">
                    <span className="flex items-center gap-2"><User size={14}/> {featured.author}</span>
                    <span className="flex items-center gap-2"><Clock size={14}/> {featured.readTime} Min Read</span>
                 </div>
              </div>
           </div>
        </Link>

        {/* 3. CATEGORY SELECTOR */}
        <div className="flex gap-6 md:gap-12 border-b-2 border-[#121212]/10 mb-12 overflow-x-auto pb-4">
           {categories.map(cat => (
             <button 
               key={cat} onClick={() => setFilter(cat)}
               className={`font-black text-[11px] uppercase tracking-[0.3em] transition-all whitespace-nowrap border-b-2 pb-1 ${
                 filter === cat ? 'border-[#9E1B1D] text-[#9E1B1D]' : 'border-transparent text-gray-400 hover:text-black'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* 4. ARCHIVE GRID (2x2 Mobile, 3x3 Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
           {filteredPosts.filter(p => !p.featured).map((post) => (
             <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="aspect-[16/10] overflow-hidden border-b-4 border-[#121212]">
                   <img src={post.image} className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="post"/>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#9E1B1D]">{post.category}</span>
                      <span className="text-[9px] font-bold uppercase opacity-30 tracking-tighter">{post.date}</span>
                   </div>
                   <h3 className="font-brand font-black text-2xl uppercase leading-none mb-4 group-hover:text-[#9E1B1D] transition-colors">{post.title}</h3>
                   <p className="text-sm text-gray-500 line-clamp-3 mb-6 font-medium leading-relaxed">{post.excerpt}</p>
                   <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-black text-[9px] uppercase tracking-widest group-hover:pl-2 transition-all">Read Full Log</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
             </Link>
           ))}
        </div>
      </div>
    </div>
  );
};