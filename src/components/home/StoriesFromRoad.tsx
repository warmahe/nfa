import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw, Quote } from 'lucide-react';

interface StoryItem {
    id: string;
    travelerName: string;
    destination: string;
    image: string;
    teaser: string;
    quote: string;
    timeframe?: string;
}

export const StoriesFromRoad: React.FC<{ customStories?: StoryItem[] }> = ({ customStories }) => {
    // Local state to track flipped card IDs on touch / click
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

    const defaultStories: StoryItem[] = [
        {
            id: "story-1",
            travelerName: "Ananya & Dev",
            destination: "Iceland Fjords",
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
            teaser: "The planning was seamless — they got us into places not listed online.",
            quote: "We wanted 10 days of complete isolation without losing comfort. NFA built a route through volcanic valleys with private cabin stays we could never have found ourselves.",
            timeframe: "October 2025"
        },
        {
            id: "story-2",
            travelerName: "Rohan M.",
            destination: "Swiss Alps Trek",
            image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
            teaser: "Not a single template in sight. Built entirely around my pace.",
            quote: "I didn't want a group tour. NFA paired me with local mountain guides and crafted a solo alpine traverse that matched my exact fitness level.",
            timeframe: "July 2025"
        },
        {
            id: "story-3",
            travelerName: "Priya & Friends",
            destination: "Kyrgyzstan Steppe",
            image: "https://images.unsplash.com/photo-1569531191131-717a76bcd9d0?w=800&q=80",
            teaser: "Felt like traveling with seasoned friends who knew every secret door.",
            quote: "From staying in nomad yurts to private horse trekking across high mountain passes, everything was tailored. Zero agent markups, total transparency.",
            timeframe: "September 2025"
        }
    ];

    const stories = customStories && customStories.length > 0 ? customStories : defaultStories;

    const toggleFlip = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section className="bg-[#FCFBF7] py-20 md:py-32 px-[clamp(1rem,4vw,3rem)] border-t-4 border-[#121212] text-[#121212] overflow-hidden">
            <div className="max-w-[1440px] mx-auto">

                {/* Banner 5 Header */}
                <div className="mb-12 border-b-4 border-[#121212] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="bg-[#F4BF4B] border-2 border-[#121212] px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] shadow-[2px_2px_0px_0px_#121212] inline-block mb-4">
                            Real Travelers, Real Builds
                        </span>
                        <h2 className="font-brand font-black text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.85] tracking-tighter">
                            STORIES FROM <br /><span className="text-[#9E1B1D]">THE ROAD.</span>
                        </h2>
                    </div>
                    <p className="font-sans font-bold text-xs md:text-sm text-[#121212]/70 max-w-md leading-relaxed">
                        Every trip is different because every person is. Click into any one of these and see how it actually went, in their own words.
                    </p>
                </div>

                {/* 3D FLIP TILES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stories.map((story) => {
                        const isFlipped = !!flippedCards[story.id];

                        return (
                            <div
                                key={story.id}
                                className="w-full aspect-[4/5] [perspective:1000px] cursor-pointer group"
                                onClick={(e) => toggleFlip(story.id, e)}
                            >
                                {/* 3D Flip Container */}
                                <div
                                    className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''
                                        }`}
                                >
                                    {/* FRONT SIDE (Trip Photo + Name + Flip Prompt) */}
                                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] border-4 border-[#121212] bg-[#121212] p-3 shadow-[8px_8px_0px_0px_#121212] flex flex-col justify-between">
                                        <div className="relative flex-1 overflow-hidden border-2 border-[#121212]">
                                            <img
                                                src={story.image}
                                                alt={story.travelerName}
                                                className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-all duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

                                            <div className="absolute top-3 right-3 bg-[#F4BF4B] border-2 border-[#121212] px-3 py-1 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#121212]">
                                                <RotateCw size={12} /> TAP TO READ ↺
                                            </div>
                                        </div>

                                        <div className="pt-4 px-2 text-[#FCFBF7] flex justify-between items-end">
                                            <div>
                                                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-[#FCFBF7]">
                                                    {story.travelerName}
                                                </h3>
                                                <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-[#F4BF4B] mt-1">
                                                    📍 {story.destination}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BACK SIDE (Testimonial Quote + Full Story CTA) */}
                                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] border-4 border-[#121212] bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#9E1B1D] flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#121212]/10">
                                                <span className="font-sans font-black text-[9px] uppercase tracking-widest text-[#9E1B1D]">
                                                    Client Dispatch • {story.timeframe || 'Verified Trip'}
                                                </span>
                                                <button
                                                    onClick={(e) => toggleFlip(story.id, e)}
                                                    className="text-[9px] font-black uppercase text-[#121212]/60 hover:text-[#121212] flex items-center gap-1"
                                                >
                                                    <RotateCw size={12} /> Flip ↺
                                                </button>
                                            </div>

                                            <Quote size={28} className="text-[#9E1B1D] mb-3" fill="currentColor" />

                                            <p className="font-serif italic text-base md:text-lg text-[#121212]/90 leading-relaxed mb-4">
                                                "{story.quote}"
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t-2 border-[#121212]/10">
                                            <Link
                                                to={`/stories/${story.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full bg-[#121212] text-[#F4BF4B] py-3.5 px-4 font-sans font-black text-[10px] uppercase tracking-[0.2em] flex justify-between items-center hover:bg-[#9E1B1D] hover:text-white transition-colors border-2 border-[#121212]"
                                            >
                                                READ FULL STORY <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section CTA */}
                <div className="mt-16 flex justify-center">
                    <Link
                        to="/stories"
                        className="inline-flex items-center gap-3 bg-[#121212] text-[#FCFBF7] border-2 border-[#121212] px-10 py-5 font-sans font-black text-xs md:text-sm uppercase tracking-[0.25em] shadow-[6px_6px_0px_0px_#F4BF4B] hover:bg-[#9E1B1D] hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        SEE MORE STORIES →
                    </Link>
                </div>

            </div>
        </section>
    );
};