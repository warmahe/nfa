import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoMetadata, SEO_CONFIG } from '../../utils/seo';

interface SeoHeadProps {
  metadata: SeoMetadata;
  children?: React.ReactNode;
}

/**
 * SeoHead Component
 * Comprehensive SEO management with dynamic meta tags, social sharing cards, and JSON-LD structured data.
 */
export const SeoHead: React.FC<SeoHeadProps> = ({ metadata, children }) => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const fullUrl = metadata.canonicalUrl || metadata.url || `${SEO_CONFIG.site.url}${currentPath}`;
  const imageUrl = metadata.image || SEO_CONFIG.site.image;
  const robotsDirective = metadata.robots || 'index, follow';

  return (
    <Helmet>
      {/* Primary Page Title & Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="title" content={metadata.title} />
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      <meta name="robots" content={robotsDirective} />
      {metadata.author && <meta name="author" content={metadata.author} />}

      {/* Canonical Link */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook / LinkedIn / WhatsApp */}
      <meta property="og:type" content={metadata.type || 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SEO_CONFIG.site.name} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:creator" content={SEO_CONFIG.site.twitterHandle} />

      {/* JSON-LD Structured Data */}
      {metadata.structuredData && metadata.structuredData.length > 0 && (
        metadata.structuredData.map((schemaObj, idx) => (
          <script key={`jsonld-${idx}`} type="application/ld+json">
            {JSON.stringify(schemaObj)}
          </script>
        ))
      )}

      {children}
    </Helmet>
  );
};

export default SeoHead;
