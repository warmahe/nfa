import React from 'react';
import { Hero } from '../components/home/Hero';
import { AboutBrand } from '../components/home/AboutBrand';
import { Recommended } from '../components/home/Recommended';
import { Testimonials } from '../components/home/Testimonials';
import { HistoryGallery } from '../components/home/HistoryGallery';
export const Home = () => {
  return (
    <div className="bg-white overflow-hidden">
      <Hero />
      <AboutBrand />
      <Recommended />
      <Testimonials/>
      <HistoryGallery/>

    </div>
  );
};