import React from 'react';
import { Hero } from '../../components/home/Hero';
import { ExpeditionGrid } from '../../components/home/ExpeditionGrid';
import { TheJourney } from '../../components/home/TheJourney';
import { Voices } from '../../components/home/Voices';
import { OracleCTA } from '../../components/home/OracleCTA';
import { FieldArchive } from '../../components/home/FieldArchive';
import { AboutBrand } from '../../components/home/AboutBrand';
import { STATIC_HOMEPAGE_DATA } from '../../utils/staticHomeData';

export const Home = () => {
  return (
    <div className="w-full overflow-hidden">
      <Hero />
      <AboutBrand />
      <ExpeditionGrid customItems={STATIC_HOMEPAGE_DATA.dropZones} />
      <FieldArchive customItems={STATIC_HOMEPAGE_DATA.archive} />
      <Voices customReviews={STATIC_HOMEPAGE_DATA.voices} />
      <TheJourney />
      <OracleCTA />
    </div>
  );
};