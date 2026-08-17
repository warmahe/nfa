import React from 'react';
import { Hero } from '../../components/home/Hero';
import { BannerBlank } from '../../components/home/BannerBlank';
import { AboutBrand } from '../../components/home/AboutBrand';
import { ExpeditionGrid } from '../../components/home/ExpeditionGrid';
import { StoriesFromRoad } from '../../components/home/StoriesFromRoad';
import { WhyNFA } from '../../components/home/WhyNFA';
import { NewsletterSignup } from '../../components/home/NewsletterSignup';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useEnquiry } from '../../context/EnquiryContext';
import { SeoHead } from '../../components/shared/SeoHead';
import { resolveHomepageSEO } from '../../utils/seo';
import { HomepageSettings } from '../../types/database';

export const Home = () => {
  const { data, loading } = useHomepageContent();
  const { openEnquiryModal } = useEnquiry();

  const settings: Partial<HomepageSettings> = data?.settings || {};
  const heroImage = settings.hero?.heroImage || (settings as any).heroImage;
  const heroEnabled = settings.hero?.enabled !== false;

  const featuredPackages = data?.featuredPackages || [];
  const featuredDestinations = data?.featuredDestinations || [];
  const featuredStories = data?.featuredStories || [];

  return (
    <div className="w-full overflow-hidden">
      {/* Dynamic SEO Meta & Structured Data */}
      <SeoHead metadata={resolveHomepageSEO(settings)} />

      {/* 1. Hero Section */}
      {heroEnabled && <Hero customImage={heroImage} />}

      {/* 2. Banner Divider */}
      <BannerBlank />

      {/* 3. Introduction / About Brand Section */}
      {settings.introduction?.enabled !== false && <AboutBrand />}

      {/* 4. Featured Journeys Section */}
      {settings.featuredJourneys?.enabled !== false && (
        <ExpeditionGrid customItems={featuredPackages} />
      )}

      {/* 5. Featured Destinations Grid (If configured) */}
      {settings.featuredDestinations?.enabled !== false && featuredDestinations.length > 0 && (
        <section className="bg-[#FCFBF7] py-20 md:py-28 px-[clamp(1rem,4vw,3rem)] border-t-4 border-[#121212]">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-12 border-b-4 border-[#121212] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9E1B1D] mb-2 block">
                  {settings.featuredDestinations?.sectionLabel || 'REMARKABLE LOCATIONS'}
                </span>
                <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.88] uppercase tracking-tighter text-[#121212]">
                  {settings.featuredDestinations?.heading || 'EXPLORE DESTINATIONS'}
                </h2>
              </div>
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 bg-[#121212] text-[#F4BF4B] px-5 py-3 border-2 border-[#121212] font-black text-xs uppercase tracking-widest hover:bg-[#9E1B1D] hover:text-white transition-colors w-fit shadow-[4px_4px_0px_0px_#121212]"
              >
                VIEW ALL DESTINATIONS <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations.map((dest) => (
                <Link
                  key={dest.id}
                  to={`/destinations/${dest.slug || dest.id}`}
                  className="group block border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all overflow-hidden"
                >
                  <div className="aspect-16/10 bg-[#121212] relative overflow-hidden border-b-4 border-[#121212]">
                    {dest.heroImage || dest.coverImage ? (
                      <img src={dest.heroImage || dest.coverImage} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale-[20%] group-hover:grayscale-0" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-brand font-black text-xl text-[#F4BF4B] uppercase">
                        {dest.name}
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 bg-[#121212] text-[#F4BF4B] px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                      📍 {dest.country}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-brand font-black text-2xl uppercase leading-tight text-[#121212] group-hover:text-[#9E1B1D] transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-serif italic line-clamp-2">
                      {dest.overview || dest.shortDescription || 'Explore this remarkable region.'}
                    </p>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#121212] group-hover:text-[#9E1B1D]">
                      <span>EXPLORE DESTINATION</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Customer Stories Section */}
      {settings.customerStories?.enabled !== false && (
        <StoriesFromRoad
          customStories={featuredStories.map((s) => ({
            id: s.id,
            travelerName: s.customerName || 'A Traveller',
            destination: s.destination || 'Global',
            image: s.coverImage || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
            teaser: s.excerpt || s.customerQuote || s.title,
            quote: s.customerQuote || s.storyContent?.slice(0, 150) || s.title,
            timeframe: s.travelDate || 'Recent Journey',
          }))}
        />
      )}

      {/* 7. Why Choose Us / Philosophy */}
      {settings.whyUs?.enabled !== false && <WhyNFA />}

      {/* 8. Bespoke Planning CTA */}
      {settings.planningCta?.enabled !== false && (
        <section className="w-full bg-[#FCFBF7] border-t-4 border-[#121212] py-20 md:py-28 px-[clamp(1rem,4vw,3rem)] text-center nfa-texture">
          <div className="max-w-[800px] mx-auto space-y-6">
            <p className="font-sans font-black text-[10px] uppercase tracking-[0.4em] text-[#9E1B1D]">
              Bespoke Expeditions
            </p>
            <h2 className="font-brand font-black text-[clamp(2.5rem,6vw,5rem)] uppercase leading-[0.85] tracking-tighter text-[#121212]">
              {settings.planningCta?.heading || 'READY TO PLAN YOUR JOURNEY?'}
            </h2>
            <p className="font-serif italic text-lg md:text-xl text-slate-700 max-w-xl mx-auto leading-relaxed">
              "{settings.planningCta?.description || "Tell us where you'd like to go and we'll help shape the journey around you."}"
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => openEnquiryModal({ source: 'HOMEPAGE', entryPoint: 'SECTION_CTA' })}
                className="w-full sm:w-auto bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all shadow-[6px_6px_0px_0px_#F4BF4B] border-2 border-[#121212] cursor-pointer"
              >
                {settings.planningCta?.primaryBtnLabel || 'PLAN YOUR JOURNEY'} <ArrowRight size={16} />
              </button>
              <Link
                to="/packages"
                className="w-full sm:w-auto bg-white text-[#121212] px-8 py-4 font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all border-2 border-[#121212]"
              >
                {settings.planningCta?.secondaryBtnLabel || 'EXPLORE JOURNEYS'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 9. Direct Dispatch Newsletter */}
      <NewsletterSignup />
    </div>
  );
};