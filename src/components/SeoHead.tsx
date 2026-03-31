import React from "react";
import { Helmet } from "react-helmet-async";
import { SeoMetadata, generateStructuredData, SEO_CONFIG } from "../utils/seo";

interface SeoHeadProps {
  metadata: SeoMetadata;
  canonicalUrl?: string;
  children?: React.ReactNode;
}

/**
 * SeoHead Component
 * Comprehensive SEO management with meta tags, structured data, and social sharing
 */
export const SeoHead: React.FC<SeoHeadProps> = ({
  metadata,
  canonicalUrl,
  children,
}) => {
  const fullUrl = canonicalUrl || `${SEO_CONFIG.site.url}${window.location.pathname}`;
  const imageUrl = metadata.image || SEO_CONFIG.site.image;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="title" content={metadata.title} />
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      {metadata.robots && <meta name="robots" content={metadata.robots} />}
      {metadata.author && <meta name="author" content={metadata.author} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={metadata.type || "website"} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={SEO_CONFIG.site.title} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={metadata.title} />
      <meta property="twitter:description" content={metadata.description} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:creator" content={SEO_CONFIG.site.twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="theme-color" content="#00837F" />
      <meta
        name="apple-mobile-web-app-capable"
        content="yes"
      />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://ui-avatars.com" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(
          generateStructuredData("organization", {})
        )}
      </script>

      {children}
    </Helmet>
  );
};

export default SeoHead;
