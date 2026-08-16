import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  MapPin,
  Clock,
  User,
  Quote,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  ExternalLink,
  Camera
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { subscribeToCustomerStoryBySlug, db } from '../../services/firebaseService';
import { CustomerStory, Package, Review } from '../../types/database';
import { getPublicCustomerDisplayName } from '../../components/stories/CustomerStoryCard';
import { RelatedStories } from '../../components/discovery/RelatedStories';
import { RelatedJourneys } from '../../components/discovery/RelatedJourneys';
import { RelatedReviews } from '../../components/discovery/RelatedReviews';
import { useEnquiry } from '../../context/EnquiryContext';
import { HotelGallery } from '../../components/itinerary/HotelGallery';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveCustomerStorySEO, resolveStaticPageSEO } from '../../utils/seo';

export const StoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { openEnquiryModal } = useEnquiry();

  const [story, setStory] = useState<CustomerStory | null>(null);
  const [loading, setLoading] = useState(true);

  // E48 Public Discovery datasets
  const [allStories, setAllStories] = useState<CustomerStory[]>([]);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsubStories = onSnapshot(collection(db, 'customerStories'), (snap) => {
      setAllStories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerStory)));
    });
    const unsubPkgs = onSnapshot(collection(db, 'packages'), (snap) => {
      setAllPackages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package)));
    });
    const unsubRevs = onSnapshot(collection(db, 'global_reviews'), (snap) => {
      setAllReviews(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Review))
          .filter((r) => r.approved !== false && r.status !== 'ARCHIVED')
      );
    });
    return () => {
      unsubStories();
      unsubPkgs();
      unsubRevs();
    };
  }, []);

  // Gallery Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    title?: string;
  }>({ isOpen: false, images: [], initialIndex: 0 });

  // Scroll Progress Indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Real-time listener for story by slug
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const unsubscribe = subscribeToCustomerStoryBySlug(
      slug,
      (loadedStory) => {
        setStory(loadedStory);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to story detail:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  // Update document.title dynamically
  useEffect(() => {
    if (story?.title) {
      document.title = `${story.title} | No Fixed Address`;
    } else {
      document.title = 'Customer Story | No Fixed Address';
    }
  }, [story]);

  const handleOpenGallery = (index: number) => {
    if (!story?.gallery || story.gallery.length === 0) return;
    setLightboxState({
      isOpen: true,
      images: story.gallery,
      initialIndex: index,
      title: story.title,
    });
  };

  const publicName = story ? getPublicCustomerDisplayName(story.customerName, story.customerDisplayMode) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] pt-40 text-center flex flex-col items-center justify-center gap-4 text-[#121212] nfa-texture">
        <Loader2 size={40} className="animate-spin text-[#9E1B1D]" />
        <span className="font-sans font-bold text-xs uppercase tracking-widest text-slate-500">
          Loading traveller story...
        </span>
      </div>
    );
  }

  // Not found or DRAFT state
  if (!story || story.status === 'DRAFT') {
    return (
      <div className="min-h-screen bg-[#FCFBF7] pt-40 text-center flex flex-col items-center justify-center gap-6 text-[#121212] px-6 nfa-texture">
        <SeoHead metadata={resolveStaticPageSEO('notFound')} />
        <div className="p-8 border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] max-w-md w-full space-y-4">
          <FileText size={48} className="mx-auto text-slate-300" />
          <h1 className="font-brand font-black text-3xl uppercase">Story Unavailable</h1>
          <p className="font-serif italic text-sm text-slate-600">
            This traveller story is no longer available or is currently an active draft.
          </p>
          <Link
            to="/stories"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#121212] bg-[#121212] text-[#F4BF4B] px-6 py-3 uppercase font-black text-xs tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> RETURN TO STORIES
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#FCFBF7] text-[#121212] selection:bg-[#F4BF4B] selection:text-[#121212] nfa-texture pb-24">
      {/* Dynamic SEO Meta, Social Previews & Article JSON-LD */}
      <SeoHead metadata={resolveCustomerStorySEO(story)} />

      {/* ── 1. TOP READING PROGRESS BAR ── */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-1.5 bg-[#9E1B1D] origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* ── 2. HEADER & TITLE ── */}
      <header className="pt-24 md:pt-32 px-[clamp(1rem,4vw,3rem)] max-w-[1200px] mx-auto space-y-8">
        {/* Back Button */}
        <div>
          <Link
            to="/stories"
            className="group inline-flex items-center gap-3 bg-[#121212] text-[#FCFBF7] px-5 py-2.5 border-2 border-[#121212] hover:bg-[#9E1B1D] transition-colors shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-sans font-black text-xs uppercase tracking-[0.2em] pt-0.5">
              BACK TO STORIES
            </span>
          </Link>
        </div>

        {/* Category Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-[#121212] text-[#F4BF4B] px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_#9E1B1D]">
            STORIES // {story.authorLabel || 'TRAVELLER JOURNEY'}
          </span>
          {story.destination && (
            <span className="bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-[0.2em]">
              📍 {story.destination}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-brand font-black text-[clamp(2.5rem,7vw,6.5rem)] uppercase leading-[0.85] tracking-tighter text-[#121212]">
          {story.title}
        </h1>

        {/* Metadata Bar */}
        <div className="flex flex-wrap items-center gap-6 font-black text-xs uppercase tracking-widest text-slate-600 border-y-2 border-[#121212] py-4">
          <span className="flex items-center gap-2 text-[#121212]">
            <User size={16} className="text-[#9E1B1D]" /> {publicName}
          </span>
          {story.travelDate && (
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-[#9E1B1D]" /> {story.travelDate}
            </span>
          )}
          {story.tripDuration && (
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-[#9E1B1D]" /> {story.tripDuration}
            </span>
          )}
        </div>
      </header>

      {/* ── 3. HERO IMAGE ── */}
      {story.coverImage && (
        <div className="max-w-[1440px] mx-auto px-[clamp(1rem,4vw,3rem)] my-12 md:my-16">
          <div className="w-full aspect-[16/9] md:aspect-[21/9] border-[4px] border-[#121212] overflow-hidden bg-[#121212] shadow-[12px_12px_0px_0px_#F4BF4B]">
            <img
              src={story.coverImage}
              className="w-full h-full object-cover filter contrast-[1.05] grayscale-[15%]"
              alt={story.title}
            />
          </div>
        </div>
      )}

      {/* ── 4. MAIN NARRATIVE CONTENT ── */}
      <main className="max-w-[780px] mx-auto px-[clamp(1rem,4vw,3rem)] space-y-12">
        {/* Customer Quote Pullquote */}
        {story.customerQuote && (
          <blockquote className="font-serif italic text-xl md:text-2xl text-[#121212] leading-[1.6] border-l-[6px] border-[#F4BF4B] pl-6 md:pl-8 py-3 bg-amber-50/60 rounded-r-xl border-y border-r border-[#121212]/10">
            "{story.customerQuote}"
          </blockquote>
        )}

        {/* Excerpt Lead Paragraph */}
        {story.excerpt && (
          <p className="font-serif italic text-lg md:text-xl text-slate-700 leading-[1.7] border-b-2 border-slate-200 pb-6">
            {story.excerpt}
          </p>
        )}

        {/* Narrative Paragraphs with Subheadings */}
        <div className="flex flex-col gap-6 font-sans text-base md:text-lg leading-[1.85] text-slate-800 tracking-wide">
          {story.storyContent
            ?.split('\n')
            .filter((line) => line.trim() !== '')
            .map((line, i) => {
              if (line.startsWith('##')) {
                return (
                  <h2
                    key={i}
                    className="font-brand font-black text-2xl md:text-4xl uppercase tracking-tight text-[#121212] mt-10 mb-2 border-b-[3px] border-[#9E1B1D] pb-2 inline-block w-fit"
                  >
                    {line.replace('##', '').trim()}
                  </h2>
                );
              }
              return (
                <p key={i} className="font-medium text-slate-800">
                  {line}
                </p>
              );
            })}
        </div>

        {/* ── 5. HIGHLIGHTS & EXPERIENCES ── */}
        {(story.highlights || story.experiences) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t-4 border-[#121212]">
            {/* Highlights */}
            {story.highlights && story.highlights.length > 0 && (
              <div className="p-6 bg-white border-2 border-[#121212] shadow-[6px_6px_0px_0px_#121212] space-y-4">
                <h4 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212] flex items-center gap-2 border-b-2 border-[#121212] pb-2">
                  <Sparkles size={18} className="text-[#9E1B1D]" /> JOURNEY HIGHLIGHTS
                </h4>
                <ul className="space-y-2 text-xs font-bold text-slate-800">
                  {story.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#9E1B1D] font-black">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experiences */}
            {story.experiences && story.experiences.length > 0 && (
              <div className="p-6 bg-white border-2 border-[#121212] shadow-[6px_6px_0px_0px_#121212] space-y-4">
                <h4 className="font-brand font-black text-lg uppercase tracking-tight text-[#121212] flex items-center gap-2 border-b-2 border-[#121212] pb-2">
                  <Compass size={18} className="text-[#9E1B1D]" /> FAVOURITE EXPERIENCES
                </h4>
                <ul className="space-y-2 text-xs font-bold text-slate-800">
                  {story.experiences.map((exp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#F4BF4B] font-black">✦</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── 6. PHOTO GALLERY ── */}
        {story.gallery && story.gallery.length > 0 && (
          <section className="space-y-4 pt-8 border-t-4 border-[#121212]">
            <div className="flex items-center justify-between">
              <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212] flex items-center gap-2">
                <Camera size={22} className="text-[#9E1B1D]" /> JOURNEY GALLERY
              </h3>
              <span className="font-mono text-xs font-bold text-slate-500">
                {story.gallery.length} Photos
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {story.gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenGallery(idx)}
                  className="group relative border-2 border-[#121212] aspect-square overflow-hidden bg-[#121212] cursor-pointer shadow-[4px_4px_0px_0px_#121212] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <img
                    src={imgUrl}
                    alt={`Story photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black uppercase">
                    View Image
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. RELATED JOURNEY / DESTINATION CARDS ── */}
        {(story.itineraryId || story.itinerarySlug || story.destinationId || story.destinationSlug || story.destination) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t-4 border-[#121212]">
            {/* Related Journey */}
            {(story.itineraryId || story.itinerarySlug) && (story.itineraryTitle || story.tripTitle) && (
              <div className="p-6 border-4 border-[#121212] bg-white shadow-[6px_6px_0px_0px_#F4BF4B] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">
                    THE EXPEDITION JOURNEY
                  </span>
                  <h4 className="font-brand font-black text-xl uppercase text-[#121212] mt-1">
                    {story.itineraryTitle || story.tripTitle}
                  </h4>
                </div>
                <Link
                  to={`/itinerary/${story.itinerarySlug || story.itineraryId}`}
                  className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-4 py-2.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors w-fit"
                >
                  EXPLORE THIS JOURNEY <ArrowRight size={14} />
                </Link>
              </div>
            )}

            {/* Related Destination */}
            {(story.destinationId || story.destinationSlug || story.destination) && (
              <div className="p-6 border-4 border-[#121212] bg-white shadow-[6px_6px_0px_0px_#F4BF4B] flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9E1B1D]">
                    THE DESTINATION
                  </span>
                  <h4 className="font-brand font-black text-xl uppercase text-[#121212] mt-1">
                    📍 {story.destination || 'Explore Region'}
                  </h4>
                </div>
                <Link
                  to={story.destinationSlug ? `/destinations/${story.destinationSlug}` : story.destinationId ? `/destinations/${story.destinationId}` : `/destinations`}
                  className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-4 py-2.5 border-2 border-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors w-fit"
                >
                  EXPLORE DESTINATION <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── 7.5 MORE TRAVELLER STORIES (E48 Discovery) ── */}
        <RelatedStories
          context={{
            currentStoryId: story.id,
            currentStorySlug: story.slug,
            journeyId: story.itineraryId,
            journeySlug: story.itinerarySlug,
            destination: story.destination,
            destinationSlug: story.destinationSlug,
          }}
          allStories={allStories}
          limit={3}
        />

        {/* ── 7.6 RELATED JOURNEYS TO EXPLORE (E48 Discovery) ── */}
        <RelatedJourneys
          currentJourney={
            story.itineraryId
              ? allPackages.find((p) => p.id === story.itineraryId || p.slug === story.itinerarySlug)
              : null
          }
          allJourneys={allPackages}
          title="EXPEDITIONS YOU MAY EXPLORE"
          subtitle="INSPIRED BY THIS JOURNEY"
          limit={3}
        />

        {/* ── 7.7 RELATED TRAVELLER REVIEWS (E48 Discovery) ── */}
        <RelatedReviews
          context={{
            journeyId: story.itineraryId,
            journeySlug: story.itinerarySlug,
            destination: story.destination,
            destinationSlug: story.destinationSlug,
          }}
          allReviews={allReviews}
          title="WHAT TRAVELLERS SAY"
          limit={3}
        />

        {/* ── 8. ENQUIRY CTA BLOCK (B7 Flow Integration) ── */}
        <section className="bg-[#121212] text-white p-8 md:p-12 border-4 border-[#121212] rounded-2xl shadow-[10px_10px_0px_0px_#F4BF4B] space-y-6 text-center">
          <Sparkles size={40} className="mx-auto text-[#F4BF4B]" />
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="font-brand font-black text-3xl md:text-4xl uppercase text-white tracking-tight">
              PLAN YOUR OWN JOURNEY
            </h3>
            <p className="font-serif italic text-base text-slate-300">
              Inspired by their journey? Let's tailor an extraordinary expedition experience for you.
            </p>
          </div>

          <button
            onClick={() =>
              openEnquiryModal({
                source: 'CUSTOMER_STORY',
                entryPoint: 'STORY_DETAIL_CTA',
                itineraryId: story.itineraryId,
                itinerarySlug: story.itinerarySlug,
                itineraryTitle: story.itineraryTitle,
                storyTitle: story.title,
                storyId: story.id,
                storySlug: story.slug,
                destination: story.destination,
                destinationSlug: story.destinationSlug,
              })
            }
            className="inline-flex items-center gap-3 bg-[#F4BF4B] text-[#121212] px-8 py-4 border-2 border-[#121212] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#9E1B1D] hover:text-white transition-colors shadow-[4px_4px_0px_0px_#FCFBF7] cursor-pointer"
          >
            PLAN YOUR OWN JOURNEY <ArrowRight size={16} />
          </button>
        </section>
      </main>

      {/* Lightbox Modal */}
      <HotelGallery
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        hotelName={lightboxState.title}
        location={story.destination}
      />
    </article>
  );
};
