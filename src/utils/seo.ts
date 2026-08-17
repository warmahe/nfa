/**
 * E34 — SEO & Public Discovery Engine
 * Centralized SEO metadata resolution, fallback hierarchies, and structured data generation.
 */

import { Package, Destination, CustomerStory, HomepageSettings, ContentSEO } from '../types/database';
import { getPublicCustomerDisplayName } from '../components/stories/CustomerStoryCard';
import { getSafeImageUrl, isValidImageUrl } from './mediaHelpers';

export const SEO_CONFIG = {
  site: {
    name: 'NO FIXED ADDRESS',
    title: 'NO FIXED ADDRESS | Luxury Travel & Bespoke Expeditions',
    description: 'Curated luxury travel and bespoke multi-stop expeditions to the world\'s most extraordinary destinations.',
    url: 'https://nofixedaddress.travel',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    twitterHandle: '@nofixedaddress',
  },
};

export const SITE_CONFIG = {
  baseUrl: SEO_CONFIG.site.url,
  siteName: SEO_CONFIG.site.name,
  defaultTitle: SEO_CONFIG.site.title,
  defaultDescription: SEO_CONFIG.site.description,
};

export interface SeoMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  author?: string;
  robots?: string;
  canonicalUrl?: string;
  structuredData?: any[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

/**
 * Sanitizes and cleans SEO text.
 */
const sanitizeSeoText = (text?: string | null, fallback = ''): string => {
  if (!text) return fallback;
  const clean = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  return clean || fallback;
};

/**
 * Resolves SEO metadata for a Journey / Package.
 */
export const resolvePackageSEO = (
  pkg: Package,
  siteUrl = SEO_CONFIG.site.url
): SeoMetadata => {
  const customSeo: ContentSEO = pkg.seo || {};

  // Title fallback hierarchy: custom seo.title -> Journey Title | NO FIXED ADDRESS -> default
  const title = sanitizeSeoText(
    customSeo.title,
    pkg.title ? `${pkg.title} | NO FIXED ADDRESS` : SEO_CONFIG.site.title
  );

  // Description fallback hierarchy: seo.description -> editorialIntro -> overview -> description -> default
  const rawDesc =
    customSeo.description ||
    pkg.editorialIntro ||
    pkg.overview ||
    pkg.description ||
    SEO_CONFIG.site.description;
  const description = sanitizeSeoText(rawDesc, SEO_CONFIG.site.description);

  // Image fallback hierarchy: seo.socialImage -> media.thumbnail -> media.gallery[0] -> default
  const rawImage =
    customSeo.socialImage ||
    pkg.media?.thumbnail ||
    (pkg.media?.gallery && pkg.media.gallery.length > 0 ? pkg.media.gallery[0] : null);
  const image = getSafeImageUrl(rawImage, SEO_CONFIG.site.image);

  // Canonical URL
  const slug = pkg.slug || pkg.id;
  const canonicalUrl = customSeo.canonicalUrl && isValidImageUrl(customSeo.canonicalUrl)
    ? customSeo.canonicalUrl
    : `${siteUrl}/itinerary/${slug}`;

  // Robots indexing directive (Draft or explicit noIndex -> noindex, nofollow)
  const isDraft = pkg.status === 'draft';
  const isHidden = customSeo.noIndex === true;
  const robots = isDraft || isHidden ? 'noindex, nofollow' : 'index, follow';

  // Keywords
  const keywords = customSeo.keywords && customSeo.keywords.length > 0
    ? customSeo.keywords.join(', ')
    : (pkg.destinations || []).join(', ');

  // Structured Data (JSON-LD Product/Trip + Breadcrumb)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: pkg.title,
      description: description,
      image: image,
      offers: pkg.pricing?.basePrice
        ? {
            '@type': 'Offer',
            price: pkg.pricing.basePrice,
            priceCurrency: pkg.pricing.currency || 'INR',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
      touristType: pkg.travelStyle || ['Luxury', 'Adventure'],
      itinerary: (pkg.itineraryCities || []).map((city, idx) => ({
        '@type': 'City',
        name: city.city,
        position: idx + 1,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Journeys', item: `${siteUrl}/packages` },
        { '@type': 'ListItem', position: 3, name: pkg.title, item: canonicalUrl },
      ],
    },
  ];

  return {
    title,
    description,
    image,
    url: canonicalUrl,
    canonicalUrl,
    type: 'website',
    keywords,
    robots,
    structuredData,
  };
};

/**
 * Resolves SEO metadata for a Destination.
 */
export const resolveDestinationSEO = (
  dest: Destination,
  siteUrl = SEO_CONFIG.site.url
): SeoMetadata => {
  const customSeo: ContentSEO = dest.seo || {};

  // Title fallback hierarchy: seo.title -> seoTitle -> Name, Country Travel Guide | NFA -> default
  const title = sanitizeSeoText(
    customSeo.title || dest.seoTitle,
    dest.name
      ? `${dest.name}, ${dest.country || 'World'} Travel Guide | NO FIXED ADDRESS`
      : SEO_CONFIG.site.title
  );

  // Description fallback hierarchy: seo.description -> seoDescription -> shortDescription -> description -> whyVisit -> default
  const rawDesc =
    customSeo.description ||
    dest.seoDescription ||
    dest.shortDescription ||
    dest.description ||
    dest.whyVisit ||
    SEO_CONFIG.site.description;
  const description = sanitizeSeoText(rawDesc, SEO_CONFIG.site.description);

  // Image fallback: seo.socialImage -> coverImage -> gallery[0] -> default
  const rawImage =
    customSeo.socialImage ||
    dest.coverImage ||
    (dest.gallery && dest.gallery.length > 0 ? dest.gallery[0] : null);
  const image = getSafeImageUrl(rawImage, SEO_CONFIG.site.image);

  // Canonical URL
  const slug = dest.slug || dest.id;
  const canonicalUrl = customSeo.canonicalUrl && isValidImageUrl(customSeo.canonicalUrl)
    ? customSeo.canonicalUrl
    : `${siteUrl}/destinations/${slug}`;

  // Robots indexing directive
  const isInactive = dest.active === false;
  const isHidden = customSeo.noIndex === true;
  const robots = isInactive || isHidden ? 'noindex, nofollow' : 'index, follow';

  // Keywords
  const kwList = customSeo.keywords || dest.seoKeywords || [dest.name, dest.country, 'Luxury Travel'];
  const keywords = kwList.filter(Boolean).join(', ');

  // Structured Data (TouristDestination + Breadcrumb)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: dest.name,
      description: description,
      image: image,
      touristType: dest.experiences || ['Luxury Expeditions', 'Cultural Exploration'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
        { '@type': 'ListItem', position: 3, name: dest.name, item: canonicalUrl },
      ],
    },
  ];

  return {
    title,
    description,
    image,
    url: canonicalUrl,
    canonicalUrl,
    type: 'website',
    keywords,
    robots,
    structuredData,
  };
};

/**
 * Resolves SEO metadata for a Customer Story.
 */
export const resolveCustomerStorySEO = (
  story: CustomerStory,
  siteUrl = SEO_CONFIG.site.url
): SeoMetadata => {
  const customSeo: ContentSEO = story.seo || {};
  const travellerName = getPublicCustomerDisplayName(story.customerName, story.customerDisplayMode);

  // Title fallback: seo.title -> storyTitle -> Title | Traveller Story | NFA
  const title = sanitizeSeoText(
    customSeo.title || story.seoTitle,
    story.title ? `${story.title} | Traveller Story | NO FIXED ADDRESS` : SEO_CONFIG.site.title
  );

  // Description fallback: seo.description -> seoDescription -> excerpt -> storyContent -> default
  const rawDesc =
    customSeo.description ||
    story.seoDescription ||
    story.excerpt ||
    story.storyContent ||
    story.story ||
    SEO_CONFIG.site.description;
  const description = sanitizeSeoText(rawDesc, SEO_CONFIG.site.description);

  // Image fallback: seo.socialImage -> coverImage -> gallery[0] -> default
  const rawImage =
    customSeo.socialImage ||
    story.coverImage ||
    (story.gallery && story.gallery.length > 0 ? story.gallery[0] : null);
  const image = getSafeImageUrl(rawImage, SEO_CONFIG.site.image);

  // Canonical URL
  const slug = story.slug || story.id;
  const canonicalUrl = customSeo.canonicalUrl && isValidImageUrl(customSeo.canonicalUrl)
    ? customSeo.canonicalUrl
    : `${siteUrl}/stories/${slug}`;

  // Robots indexing directive
  const isDraft = story.status !== 'PUBLISHED';
  const isHidden = customSeo.noIndex === true;
  const robots = isDraft || isHidden ? 'noindex, nofollow' : 'index, follow';

  // Keywords
  const kwList = customSeo.keywords || story.seoKeywords || [story.destination, 'Travel Stories', 'Customer Experience'];
  const keywords = kwList.filter(Boolean).join(', ');

  // Structured Data (Article + Breadcrumb)
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: story.title,
      description: description,
      image: image,
      author: {
        '@type': 'Person',
        name: travellerName,
      },
      publisher: {
        '@type': 'Organization',
        name: SEO_CONFIG.site.name,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.svg`,
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Customer Stories', item: `${siteUrl}/stories` },
        { '@type': 'ListItem', position: 3, name: story.title, item: canonicalUrl },
      ],
    },
  ];

  return {
    title,
    description,
    image,
    url: canonicalUrl,
    canonicalUrl,
    type: 'article',
    author: travellerName,
    keywords,
    robots,
    structuredData,
  };
};

/**
 * Resolves SEO metadata for the Homepage.
 */
export const resolveHomepageSEO = (
  settings?: HomepageSettings | null,
  siteUrl = SEO_CONFIG.site.url
): SeoMetadata => {
  const customSeo: ContentSEO = settings?.seo || {};

  const title = sanitizeSeoText(
    customSeo.title,
    settings?.hero?.title
      ? `${settings.hero.title} | NO FIXED ADDRESS`
      : SEO_CONFIG.site.title
  );

  const description = sanitizeSeoText(
    customSeo.description || settings?.hero?.description || settings?.introduction?.description,
    SEO_CONFIG.site.description
  );

  const rawImage =
    customSeo.socialImage ||
    settings?.hero?.heroImage ||
    settings?.heroImage ||
    SEO_CONFIG.site.image;
  const image = getSafeImageUrl(rawImage, SEO_CONFIG.site.image);

  const canonicalUrl = customSeo.canonicalUrl && isValidImageUrl(customSeo.canonicalUrl)
    ? customSeo.canonicalUrl
    : siteUrl;

  const robots = customSeo.noIndex === true ? 'noindex, nofollow' : 'index, follow';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SEO_CONFIG.site.name,
      url: siteUrl,
      logo: `${siteUrl}/logo.svg`,
      description: SEO_CONFIG.site.description,
      sameAs: [
        'https://www.instagram.com/nofixedaddress',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SEO_CONFIG.site.name,
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/packages?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return {
    title,
    description,
    image,
    url: canonicalUrl,
    canonicalUrl,
    type: 'website',
    robots,
    structuredData,
  };
};

/**
 * Standard page metadata catalogue for static public routes.
 */
export const staticPageMetadata: Record<string, SeoMetadata> = {
  packages: {
    title: 'Curated Journeys & Expeditions | NO FIXED ADDRESS',
    description: 'Explore bespoke multi-stop journeys and handcrafted itineraries designed for discerning travellers.',
    keywords: 'travel journeys, luxury expeditions, bespoke itineraries, curated trips',
    type: 'website',
    robots: 'index, follow',
  },
  destinations: {
    title: 'Explore Extraordinary Destinations | NO FIXED ADDRESS',
    description: 'Discover curated world destinations, seasonal guides, local culture, and luxury accommodation.',
    keywords: 'travel destinations, luxury travel guides, world exploration',
    type: 'website',
    robots: 'index, follow',
  },
  explore: {
    title: 'Explore Journeys & Destinations | NO FIXED ADDRESS',
    description: 'Explore bespoke journeys, destinations and traveller stories with NO FIXED ADDRESS.',
    keywords: 'explore journeys, travel discovery, destinations, luxury expeditions',
    type: 'website',
    robots: 'index, follow',
  },
  stories: {
    title: 'Customer Stories & Travel Journals | NO FIXED ADDRESS',
    description: 'Read authentic travel journals and real stories from travellers exploring with NO FIXED ADDRESS.',
    keywords: 'customer stories, travel journals, explorer reviews',
    type: 'website',
    robots: 'index, follow',
  },
  gallery: {
    title: 'Expedition Visual Gallery | NO FIXED ADDRESS',
    description: 'Stunning photography capturing extraordinary landscapes, culture, and moments across our journeys.',
    type: 'website',
    robots: 'index, follow',
  },
  about: {
    title: 'About NO FIXED ADDRESS | Our Philosophy & Team',
    description: 'Discover the story, ethos, and travel specialists behind NO FIXED ADDRESS bespoke journeys.',
    type: 'website',
    robots: 'index, follow',
  },
  contact: {
    title: 'Plan Your Journey | Contact NO FIXED ADDRESS',
    description: 'Connect with our travel planning team to begin crafting your bespoke luxury expedition.',
    type: 'website',
    robots: 'index, follow',
  },
  faq: {
    title: 'Frequently Asked Questions | NO FIXED ADDRESS',
    description: 'Answers to common questions about booking, travel preparation, bespoke customization, and support.',
    type: 'website',
    robots: 'index, follow',
  },
  reviews: {
    title: 'Traveller Reviews | NO FIXED ADDRESS',
    description: 'Real travel experiences shared by travellers who journeyed with NO FIXED ADDRESS.',
    type: 'website',
    robots: 'index, follow',
  },
  shortlist: {
    title: 'Your Journey Shortlist | NO FIXED ADDRESS',
    description: "Keep and compare the journeys you're considering with NO FIXED ADDRESS.",
    type: 'website',
    robots: 'noindex, nofollow',
  },
  compare: {
    title: 'Compare Journeys | NO FIXED ADDRESS',
    description: 'Compare bespoke travel journeys and explore the details before planning your journey.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
  testimonials: {
    title: 'Testimonials | NO FIXED ADDRESS',
    description: 'Personal accounts and endorsements from our bespoke expedition travellers.',
    type: 'website',
    robots: 'index, follow',
  },
  privacy: {
    title: 'Privacy Policy | NO FIXED ADDRESS',
    description: 'How NO FIXED ADDRESS protects and manages your personal information.',
    type: 'website',
    robots: 'index, follow',
  },
  terms: {
    title: 'Terms of Service | NO FIXED ADDRESS',
    description: 'Terms and conditions governing our bespoke travel services and bookings.',
    type: 'website',
    robots: 'index, follow',
  },
  // Private / System routes protected by noindex
  dashboard: {
    title: 'My Account | NO FIXED ADDRESS',
    description: 'Manage your travel bookings and profile.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
  myJourney: {
    title: 'My Journey | NO FIXED ADDRESS',
    description: 'Traveller-safe booking details, itinerary, and documents.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
  admin: {
    title: 'Admin Workspace | NO FIXED ADDRESS',
    description: 'Operations and travel management workspace.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
  login: {
    title: 'Login | NO FIXED ADDRESS',
    description: 'Sign in to NO FIXED ADDRESS.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
  notFound: {
    title: 'Page Not Found | NO FIXED ADDRESS',
    description: 'The requested page could not be found.',
    type: 'website',
    robots: 'noindex, nofollow',
  },
};

/**
 * Resolves SEO for static public routes.
 */
export const resolveStaticPageSEO = (
  pageKey: string,
  siteUrl = SEO_CONFIG.site.url
): SeoMetadata => {
  const base = staticPageMetadata[pageKey] || staticPageMetadata.notFound;
  const canonicalUrl = `${siteUrl}/${pageKey === 'home' ? '' : pageKey}`;

  return {
    ...base,
    url: canonicalUrl,
    canonicalUrl,
    image: SEO_CONFIG.site.image,
  };
};

/**
 * Lightweight SEO readiness evaluation for Admin UI guidance.
 */
export interface SEOReadinessResult {
  isReady: boolean;
  score: number; // 0 - 100
  titleStatus: 'optimal' | 'short' | 'long' | 'missing';
  descStatus: 'optimal' | 'short' | 'long' | 'missing';
  hasSocialImage: boolean;
  isIndexable: boolean;
  recommendations: string[];
}

export const checkSEOReadiness = (
  seo?: ContentSEO | null,
  fallbackTitle = '',
  fallbackDesc = ''
): SEOReadinessResult => {
  const title = (seo?.title || fallbackTitle).trim();
  const desc = (seo?.description || fallbackDesc).trim();
  const recommendations: string[] = [];

  let titleStatus: 'optimal' | 'short' | 'long' | 'missing' = 'optimal';
  if (!title) {
    titleStatus = 'missing';
    recommendations.push('Add an SEO title for search engines.');
  } else if (title.length < 30) {
    titleStatus = 'short';
    recommendations.push('SEO title is relatively short (recommend 40-60 characters).');
  } else if (title.length > 65) {
    titleStatus = 'long';
    recommendations.push('SEO title may be truncated by search engines (over 65 characters).');
  }

  let descStatus: 'optimal' | 'short' | 'long' | 'missing' = 'optimal';
  if (!desc) {
    descStatus = 'missing';
    recommendations.push('Add a page meta description.');
  } else if (desc.length < 70) {
    descStatus = 'short';
    recommendations.push('Page description is brief (recommend 120-160 characters).');
  } else if (desc.length > 170) {
    descStatus = 'long';
    recommendations.push('Page description exceeds 170 characters and may be clipped in search results.');
  }

  const hasSocialImage = Boolean(seo?.socialImage && isValidImageUrl(seo.socialImage));
  if (!hasSocialImage) {
    recommendations.push('Dedicated social share image not set (cover photo will be used automatically).');
  }

  const isIndexable = seo?.noIndex !== true;
  if (!isIndexable) {
    recommendations.push('Page is currently set to "Hide from search" (noindex).');
  }

  const isReady = Boolean(title && desc && isIndexable);
  let score = 50;
  if (title) score += 20;
  if (desc) score += 20;
  if (titleStatus === 'optimal') score += 5;
  if (descStatus === 'optimal') score += 5;

  return {
    isReady,
    score: Math.min(score, 100),
    titleStatus,
    descStatus,
    hasSocialImage,
    isIndexable,
    recommendations,
  };
};

/**
 * Resolver for Explore page SEO
 */
export const resolveExploreSEO = (customTitle?: string): SeoMetadata => {
  return {
    title: customTitle || 'Explore Journeys & Destinations | NO FIXED ADDRESS',
    description: 'Explore bespoke journeys, destinations and traveller stories with NO FIXED ADDRESS.',
    type: 'website',
    canonicalUrl: `${SITE_CONFIG.baseUrl}/explore`,
    robots: 'index, follow',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Explore', url: '/explore' },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Explore Journeys & Destinations',
        description: 'Explore bespoke journeys, destinations and traveller stories with NO FIXED ADDRESS.',
        url: `${SITE_CONFIG.baseUrl}/explore`,
      },
    ],
  };
};

