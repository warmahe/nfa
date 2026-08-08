import React from 'react';
import { Hero } from '../../components/home/Hero';
import { BannerBlank } from '../../components/home/BannerBlank';
import { AboutBrand } from '../../components/home/AboutBrand';
import { ExpeditionGrid } from '../../components/home/ExpeditionGrid';
import { StoriesFromRoad } from '../../components/home/StoriesFromRoad';
import { WhyNFA } from '../../components/home/WhyNFA';
import { NewsletterSignup } from '../../components/home/NewsletterSignup';
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { STATIC_HOMEPAGE_DATA } from '../../utils/staticHomeData';

export const Home = () => {
  const { data } = useHomepageContent();

  const heroImage = data?.heroImage || STATIC_HOMEPAGE_DATA.heroImage;
  const dropZones = (data?.dropZones && data.dropZones.length > 0)
    ? data.dropZones
    : STATIC_HOMEPAGE_DATA.dropZones;

  return (
    <div className="w-full overflow-hidden">
      {/* Banner 1 */}
      <Hero customImage={heroImage} />

      {/* Banner 2 */}
      <BannerBlank />

      {/* Banner 3 */}
      <AboutBrand />

      {/* Banner 4 */}
      <ExpeditionGrid customItems={dropZones} />

      {/* Banner 5 (3D Flip Cards & Stories) */}
      <StoriesFromRoad />

      {/* Banner 6 */}
      <WhyNFA />

      {/* Banner 7 */}
      <NewsletterSignup />
    </div>
  );
};