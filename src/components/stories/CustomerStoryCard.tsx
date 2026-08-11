import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Clock, User, Star } from 'lucide-react';
import { CustomerStory, CustomerStoryDisplayMode } from '../../types/database';

interface CustomerStoryCardProps {
  story: CustomerStory;
  featuredLayout?: boolean;
}

export const getPublicCustomerDisplayName = (
  name?: string,
  mode: CustomerStoryDisplayMode = 'FULL_NAME'
): string => {
  if (mode === 'ANONYMOUS' || !name) return "A Traveller's Journey";
  if (mode === 'FIRST_NAME') {
    const parts = name.trim().split(' ');
    return parts[0] || 'A Traveller';
  }
  return name;
};

export const CustomerStoryCard: React.FC<CustomerStoryCardProps> = ({
  story,
  featuredLayout = false,
}) => {
  const publicName = getPublicCustomerDisplayName(story.customerName, story.customerDisplayMode);

  if (featuredLayout) {
    return (
      <Link
        to={`/stories/${story.slug}`}
        className="group block relative border-4 border-[#121212] bg-white mb-16 shadow-[12px_12px_0px_0px_#121212] hover:shadow-[16px_16px_0px_0px_#9E1B1D] transition-all duration-300 overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] relative bg-[#121212]">
            {story.coverImage ? (
              <img
                src={story.coverImage}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 filter grayscale-[20%] group-hover:grayscale-0"
                alt={story.title}
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-[#F4BF4B] font-brand font-black text-3xl uppercase">
                {story.title}
              </div>
            )}
            <div className="absolute top-4 left-4 bg-[#9E1B1D] text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#121212] flex items-center gap-1.5">
              <Star size={12} className="fill-white" /> FEATURED TRAVELLER JOURNEY
            </div>
          </div>

          <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#9E1B1D] mb-4">
              <span>📍 {story.destination || 'Global'}</span>
              {story.travelDate && <span>&bull; {story.travelDate}</span>}
            </div>

            <h2 className="font-brand font-black text-3xl md:text-5xl uppercase leading-none mb-6 text-[#121212] group-hover:text-[#9E1B1D] transition-colors">
              {story.title}
            </h2>

            {story.customerQuote ? (
              <p className="font-serif italic text-base md:text-lg text-gray-700 mb-6 leading-relaxed border-l-4 border-[#F4BF4B] pl-4 py-1">
                "{story.customerQuote}"
              </p>
            ) : story.excerpt ? (
              <p className="font-serif italic text-base text-gray-600 mb-6 leading-relaxed line-clamp-3">
                "{story.excerpt}"
              </p>
            ) : null}

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-600">
                <User size={14} className="text-[#9E1B1D]" />
                <span>{publicName}</span>
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest text-[#121212] group-hover:text-[#9E1B1D] flex items-center gap-2 transition-all">
                READ STORY <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group flex flex-col border-4 border-[#121212] bg-white shadow-[8px_8px_0px_0px_#121212] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300 overflow-hidden"
    >
      {/* Cover Image */}
      <div className="aspect-[16/10] overflow-hidden border-b-4 border-[#121212] bg-[#121212] relative">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            className="w-full h-full object-cover filter grayscale-[25%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            alt={story.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#F4BF4B] font-brand font-black text-xl uppercase p-4 text-center">
            {story.title}
          </div>
        )}

        {story.destination && (
          <span className="absolute bottom-3 left-3 bg-[#121212] text-[#F4BF4B] px-3 py-1 font-black text-[9px] uppercase tracking-widest border border-[#121212] shadow-[2px_2px_0px_0px_#F4BF4B]">
            📍 {story.destination}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-1 text-[#9E1B1D]">
            <User size={12} /> {publicName}
          </span>
          {story.travelDate && <span>{story.travelDate}</span>}
        </div>

        <h3 className="font-brand font-black text-2xl uppercase leading-tight mb-3 text-[#121212] group-hover:text-[#9E1B1D] transition-colors">
          {story.title}
        </h3>

        <p className="text-xs text-gray-600 line-clamp-3 mb-6 font-medium leading-relaxed font-serif italic">
          "{story.excerpt || story.customerQuote || (story.storyContent ? story.storyContent.slice(0, 120) + '...' : '')}"
        </p>

        {/* Tags */}
        {story.travelStyle && story.travelStyle.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {story.travelStyle.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Action Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="font-black text-[10px] uppercase tracking-widest text-[#121212] group-hover:text-[#9E1B1D] group-hover:pl-1 transition-all">
            READ STORY
          </span>
          <ArrowRight size={16} className="text-[#121212] group-hover:translate-x-1 group-hover:text-[#9E1B1D] transition-all" />
        </div>
      </div>
    </Link>
  );
};
