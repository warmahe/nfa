import React from 'react';
import { Hero } from '../components/home/Hero';
import { AboutBrand } from '../components/home/AboutBrand';
import { ExpeditionGrid } from '../components/home/ExpeditionGrid';
import { TheJourney } from '../components/home/TheJourney';
import { Voices } from '../components/home/Voices';
import { OracleCTA } from '../components/home/OracleCTA';
import { Testimonials } from '../components/home/Testimonials';

export const Home = () => {
  return (
    <div className="w-full overflow-hidden">
      <Hero />
      <AboutBrand />
      <ExpeditionGrid />
      <TheJourney />
      <Voices />
      <OracleCTA />
    </div>
  );
};