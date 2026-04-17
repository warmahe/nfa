import React from 'react';
import { Hero } from '../../components/home/Hero';
import { ExpeditionGrid } from '../../components/home/ExpeditionGrid';
import { TheJourney } from '../../components/home/TheJourney';
import { Voices } from '../../components/home/Voices';
import { OracleCTA } from '../../components/home/OracleCTA';
import { FieldArchive } from '../../components/home/FieldArchive';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { AboutBrand } from '@/src/components/home/AboutBrand';

export const Home = () => {
  const { data, loading } = useHomepageContent();

  if (loading) return <div className="min-h-screen bg-[#FCFBF7]" />;

  return (
    <div className="w-full overflow-hidden">
      {/* Hero gets the image from DB */}
      <Hero customImage={data?.heroImage} />
      <AboutBrand />
      {/* Grid gets the selected packages from DB */}
      <ExpeditionGrid customItems={data?.dropZones} />
      
      {/* Archive gets the selected destinations from DB */}
      <FieldArchive customItems={data?.archive} />
      
      <Voices customReviews={data?.voices} /> 
      <TheJourney />
      <OracleCTA />
    </div>
  );
};