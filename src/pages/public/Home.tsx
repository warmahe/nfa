import React from 'react';
import { Hero } from '../../components/home/Hero';
import { ExpeditionGrid } from '../../components/home/ExpeditionGrid';
import { TheJourney } from '../../components/home/TheJourney';
import { Voices } from '../../components/home/Voices';
import { OracleCTA } from '../../components/home/OracleCTA';
import { FieldArchive } from '../../components/home/FieldArchive';
import { AboutBrand } from '../../components/home/AboutBrand';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { STATIC_HOMEPAGE_DATA } from '../../utils/staticHomeData';

export const Home = () => {
  const { data } = useHomepageContent();

  const heroImage = data?.heroImage || STATIC_HOMEPAGE_DATA.heroImage;
  const dropZones = data?.dropZones?.length ? data.dropZones : STATIC_HOMEPAGE_DATA.dropZones;
  const archive = data?.archive?.length ? data.archive : STATIC_HOMEPAGE_DATA.archive;
  const voices = data?.voices?.length ? data.voices : STATIC_HOMEPAGE_DATA.voices;

  return (
    <div className="w-full overflow-hidden">
      <Hero customImage={heroImage} />
      <AboutBrand />
      <ExpeditionGrid customItems={dropZones} />
      <FieldArchive customItems={archive} />
      <Voices customReviews={voices} />
      <TheJourney />
      <OracleCTA />
    </div>
  );
};