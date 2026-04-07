import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, Clock, User, Share2, Twitter, FileText, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "../../utils/constants";

export const BlogPost = () => {
  const { slug } = useParams();
  
  // Scroll to top when slug changes (for when clicking recommended articles)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const post = BLOG_POSTS.find(p => p.slug === slug);

  // Get 2 recommended posts (excluding the current one)
  const recommendedPosts = BLOG_POSTS.filter(p => p.id !== post?.id).slice(0, 2);

  // Scroll Progress Logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (!post) return (
    <div className="min-h-screen bg-[#FCFBF7] pt-40 text-center flex flex-col items-center gap-6 text-[#121212]">
      <h1 className="font-brand font-black text-4xl uppercase">Log Not Found</h1>
      <Link to="/blog" className="border-2 border-[#121212] px-6 py-3 uppercase font-black text-xs shadow-[4px_4px_0px_0px_#121212] hover:bg-[#F4BF4B] transition-colors">
        Return to Archive
      </Link>
    </div>
  );

  return (
    <article className="min-h-screen bg-[#FCFBF7] text-[#121212] selection:bg-[#F4BF4B] nfa-texture pb-24">
      
      {/* 1. TOP READING PROGRESS BAR */}
      <motion.div 
        className="fixed top-20 left-0 right-0 h-1.5 bg-[#9E1B1D] origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* 2. HEADER & MAIN TITLE */}
      <header className="pt-24 md:pt-32 px-[clamp(1rem,4vw,3rem)] max-w-[1200px] mx-auto">
         
         {/* TACTICAL BACK BUTTON */}
         <div className="mb-10 md:mb-12">
           <Link 
             to="/blog" 
             className="group inline-flex items-center gap-3 bg-[#121212] text-[#FCFBF7] px-4 py-2 md:px-5 md:py-2.5 border-[2px] border-[#121212] hover:bg-[#9E1B1D] transition-colors w-fit shadow-[4px_4px_0px_0px_#F4BF4B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-sans font-black text-[10px] md:text-xs uppercase tracking-[0.2em] pt-0.5">
                Back
              </span>
           </Link>
         </div>
         
         <div className="flex items-center gap-3 mb-6">
           <span className="bg-[#121212] text-[#FCFBF7] px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_#9E1B1D]">
             CLASS // {post.category}
           </span>
         </div>

         <h1 className="font-brand font-black text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-[0.85] tracking-tighter mb-12">
           {post.title}
         </h1>
      </header>

      {/* 3. HERO IMAGE */}
      <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] mb-12 md:mb-16">
         <div className="w-full aspect-[16/9] md:aspect-[21/9] border-[4px] border-[#121212] overflow-hidden bg-[#121212] shadow-[8px_8px_0px_0px_#F4BF4B]">
            <img 
              src={post.image} 
              className="w-full h-full object-cover filter contrast-[1.1] grayscale-[20%]" 
              alt={post.title} 
            />
         </div>
      </div>

      {/* 4. CONTENT FLOW */}
      <main className="max-w-[800px] mx-auto px-[clamp(1rem,4vw,3rem)]">
         
         {/* Lead Excerpt Paragraph */}
         <p className="font-serif italic text-lg md:text-xl text-[#121212]/80 leading-[1.6] mb-12 border-l-[4px] border-[#F4BF4B] pl-6 md:pl-8 py-2">
            {post.excerpt}
         </p>

         {/* Dynamic Content Parsing */}
         <div className="flex flex-col gap-6 font-sans text-sm md:text-base leading-[1.8] text-[#121212]/80 tracking-wide">
            {post.content?.split('\n').filter(line => line.trim() !== '').map((line, i) => {
               
               // SUBHEADINGS
               if (line.startsWith('##')) {
                  return (
                    <h2 key={i} className="font-brand font-black text-2xl md:text-4xl uppercase tracking-tighter text-[#121212] mt-10 mb-2 border-b-[3px] border-[#121212] pb-2 inline-block w-fit">
                      {line.replace('##', '').trim()}
                    </h2>
                  );
               }

               // BLOCKQUOTES
               if (line.startsWith('>')) {
                 return (
                   <blockquote key={i} className="font-brand text-2xl md:text-4xl font-black text-[#9E1B1D] py-8 px-6 border-y-2 border-[#121212]/10 italic my-8 bg-white/50">
                      "{line.replace('>', '').trim()}"
                   </blockquote>
                 );
               }

               // STANDARD PARAGRAPHS (Decreased size, with Drop Cap on first para)
               return (
                 <p key={i} className={i === 0 ? "first-letter:text-5xl md:first-letter:text-6xl first-letter:font-brand first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8] first-letter:text-[#9E1B1D]" : ""}>
                   {line.trim()}
                 </p>
               );
            })}
         </div>

         {/* 5. END OF REPORT (METADATA) */}
         <div className="mt-20 border-[4px] border-[#121212] bg-[#121212] text-[#FCFBF7] p-8 md:p-12 shadow-[8px_8px_0px_0px_#9E1B1D]">
            <div className="flex items-center gap-3 mb-8 border-b border-[#FCFBF7]/20 pb-4">
               <FileText size={18} className="text-[#F4BF4B]"/>
               <h3 className="font-brand font-black text-2xl uppercase tracking-tight">End of Log</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FCFBF7]/40 mb-2 flex items-center gap-2"><User size={12}/> Filed By</p>
                  <p className="font-sans font-bold text-sm uppercase tracking-widest text-[#F4BF4B]">{post.author}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FCFBF7]/40 mb-2 flex items-center gap-2"><Clock size={12}/> Timestamp</p>
                  <p className="font-sans font-bold text-sm uppercase tracking-widest text-[#FCFBF7]">{post.date}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FCFBF7]/40 mb-2">Duration</p>
                  <p className="font-sans font-bold text-sm uppercase tracking-widest text-[#FCFBF7]">{post.readTime} Min Read</p>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#FCFBF7]/20 flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FCFBF7]/40">Transmit Data</span>
               <div className="flex gap-4">
                  <button className="p-2 border-2 border-[#FCFBF7]/20 hover:bg-[#F4BF4B] hover:border-[#F4BF4B] hover:text-[#121212] transition-colors"><Twitter size={16}/></button>
                  <button className="p-2 border-2 border-[#FCFBF7]/20 hover:bg-[#F4BF4B] hover:border-[#F4BF4B] hover:text-[#121212] transition-colors"><Share2 size={16}/></button>
               </div>
            </div>
         </div>
      </main>

      {/* 6. RECOMMENDED ARTICLES */}
      {recommendedPosts.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] mt-24 pt-16 border-t-[4px] border-[#121212]">
           <div className="flex justify-between items-end mb-12">
              <h3 className="font-brand font-black text-4xl md:text-5xl uppercase tracking-tighter text-[#121212]">
                Related <br className="md:hidden"/><span className="text-[#9E1B1D]">Dispatches.</span>
              </h3>
              <Link to="/blog" className="font-sans font-bold text-[10px] md:text-xs uppercase tracking-widest border-b-2 border-[#121212] pb-1 hover:text-[#9E1B1D] hover:border-[#9E1B1D] transition-colors">
                View All Logs
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recommendedPosts.map(recPost => (
                <Link key={recPost.id} to={`/blog/${recPost.slug}`} className="group flex flex-col sm:flex-row border-[3px] border-[#121212] bg-white shadow-[6px_6px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
                   
                   <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-[#121212] bg-[#121212] overflow-hidden shrink-0">
                      <img src={recPost.image} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-500" alt={recPost.title} />
                   </div>
                   
                   <div className="p-6 flex-1 flex flex-col justify-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9E1B1D] mb-3 block">{recPost.category}</span>
                      <h4 className="font-brand font-black text-xl md:text-2xl uppercase leading-[1.1] mb-4 group-hover:text-[#9E1B1D] transition-colors line-clamp-2">
                        {recPost.title}
                      </h4>
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#121212]/10">
                         <span className="font-sans font-bold text-[9px] uppercase tracking-widest text-[#121212]/50">{recPost.date}</span>
                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                      </div>
                   </div>
                </Link>
              ))}
           </div>
        </section>
      )}

    </article>
  );
};