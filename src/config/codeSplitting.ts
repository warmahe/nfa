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
  home: () => import('../pages/Home').then(m => ({ default: m.Home })),
  destinations: () => import('../pages/Pages').then(m => ({ default: m.Destinations })),
  packages: () => import('../pages/PackageBrowse').then(m => ({ default: m.PackageBrowse })),
  gallery: () => import('../pages/Gallery').then(m => ({ default: m.Gallery })),
  books: () => import('../pages/Pages').then(m => ({ default: m.Blog })),
  about: () => import('../pages/Pages').then(m => ({ default: m.About })),
  contact: () => import('../pages/Pages').then(m => ({ default: m.Contact })),
  faq: () => import('../pages/Pages').then(m => ({ default: m.FAQ })),
  testimonials: () => import('../pages/Pages').then(m => ({ default: m.Testimonials })),
  
  // User-specific pages
  dashboard: () => import('../pages/Pages').then(m => ({ default: m.Dashboard })),
  admin: () => import('../pages/Pages').then(m => ({ default: m.Admin })),
  booking: () => import('../pages/Pages').then(m => ({ default: m.Booking })),
  
  // Detail pages
  itinerary: () => import('../pages/ItineraryDetail').then(m => ({ default: m.default })),
  blogpost: () => import('../pages/BlogPost').then(m => ({ default: m.BlogPost })),
  
  // Feature pages
  wishlist: () => import('../pages/Wishlist').then(m => ({ default: m.Wishlist })),
  pricealerts: () => import('../pages/PriceAlerts').then(m => ({ default: m.PriceAlerts })),
};

/**
 * Component-based code splitting configuration
 * Heavy components loaded on demand
 */
export const componentSplitting = {
  // Admin components
  adminCrud: () => import('../components/AdminPackageCRUD').then(m => ({ default: m.AdminPackageCRUD })),
  
  // Image components
  lazyImage: () => import('../components/LazyImage').then(m => m),
  
  // Review components
  reviewSubmission: () => import('../components/ReviewSubmission').then(m => ({ default: m.ReviewSubmission })),
  
  // SEO components
  seoHead: () => import('../components/SeoHead').then(m => ({ default: m.SeoHead })),
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
