/**
 * Configuration for code splitting strategy
 * Uses dynamic imports to reduce initial bundle size
 */

import { lazy, Suspense } from 'react';
import React from 'react';

// Fallback component for lazy-loaded routes
const routeFallback = React.createElement(
  'div',
  { className: 'flex items-center justify-center min-h-screen' },
  React.createElement(
    'div',
    { className: 'text-center' },
    React.createElement('div', {
      className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4',
    }),
    React.createElement('p', { className: 'text-gray-600' }, 'Loading...')
  )
);

// Lazy load route components for code splitting
export const lazyLoad = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) => {
  const Component = lazy(importFunc);
  return (props: any) =>
    React.createElement(
      Suspense,
      { fallback: routeFallback },
      React.createElement(Component, props)
    );
};

/**
 * Route-based code splitting configuration
 * Each route is bundled separately for faster initial load
 */
export const routeSplitting = {
  // Core pages
  home: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  destinations: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  packages: () => import('../pages/public/PackageBrowse').then(m => ({ default: m.PackageBrowse })),
  gallery: () => import('../pages/public/Gallery').then(m => ({ default: m.Gallery })),
  books: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  about: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  contact: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  faq: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  testimonials: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  
  // User-specific pages
  dashboard: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  admin: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  booking: () => import('../pages/public/Home').then(m => ({ default: m.Home })),
  
  // Detail pages
  itinerary: () => import('../pages/public/ItineraryDetail').then(m => ({ default: m.default })),
  blogpost: () => import('../pages/public/Blog').then(m => ({ default: m.BlogPost })),
  
  // Feature pages
  wishlist: () => import('../pages/user/Wishlist').then(m => ({ default: m.Wishlist })),
  pricealerts: () => import('../pages/user/PriceAlerts').then(m => ({ default: m.PriceAlerts })),
};

/**
 * Component-based code splitting configuration
 * Heavy components loaded on demand
 */
export const componentSplitting = {
  // Admin components
  // Image components
  lazyImage: () => import('../components/shared/LazyImage').then(m => m),
  
  // Review components
  reviewSubmission: () => import('../components/shared/ReviewSubmission').then(m => ({ default: m.ReviewSubmission })),
  
  // SEO components
  seoHead: () => import('../components/shared/SeoHead').then(m => ({ default: m.SeoHead })),
};

/**
 * Preload critical routes/components
 */
export const preloadRoute = (importFunc: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = importFunc.toString().match(/from ['"]([^"']+)['"]/)?.[1] || '';
  if (link.href) {
    document.head.appendChild(link);
  }
};
