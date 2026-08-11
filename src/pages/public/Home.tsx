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

export const Home = () => {
  const { data, loading } = useHomepageContent();
  const { openEnquiryModal } = useEnquiry();

  const settings = data?.settings || {};
  const heroImage = settings.hero?.heroImage || settings.heroImage;
  const heroEnabled = settings.hero?.enabled !== false;

  const featuredPackages = data?.featuredPackages || [];
  const featuredDestinations = data?.featuredDestinations || [];
  const featuredStories = data?.featuredStories || [];

  return (
    <div className="w-full overflow-hidden">
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
                    {dest.heroImage ? (
                      <img src={dest.heroImage} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale-[20%] group-hover:grayscale-0" />
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

      {/* 8. Planning CTA / Newsletter Signup */}
      {settings.planningCta?.enabled !== false && <NewsletterSignup />}
    </div>
  );
};