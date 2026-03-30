/**
 * SEO Metadata for all pages
 * Used with react-helmet-async for dynamic meta tag management
 */

export const SEO_CONFIG = {
  site: {
    title: "NO FIXED ADDRESS - Premium Adventure Travel & Expeditions",
    description: "Experience transformative luxury expeditions to the world's most extraordinary and remote locations. Bespoke adventure travel experiences designed for discerning travelers.",
    url: "https://nofixedaddress.travel",
    image: "/og-image.jpg",
    twitterHandle: "@nofixedaddress",
  },
};

export interface SeoMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  keywords?: string;
  author?: string;
  robots?: string;
  canonicalUrl?: string;
}

export const pageMetadata: Record<string, SeoMetadata> = {
  home: {
    title: "NO FIXED ADDRESS - Premium Adventure Travel & Expeditions",
    description: "Experience transformative luxury expeditions to the world's most extraordinary and remote locations. Bespoke adventure travel experiences designed for discerning travelers.",
    keywords: "adventure travel, luxury expeditions, extreme travel, world exploration, expedition planning",
    type: "website",
  },
  
  destinations: {
    title: "Explore Exotic Destinations - NO FIXED ADDRESS",
    description: "Browse 120+ extraordinary destinations. Filter by budget, difficulty, season, and travel type. Plan your ultimate adventure.",
    keywords: "travel destinations, adventure locations, expedition destinations, luxury travel",
    type: "website",
  },

  packages: {
    title: "Travel Packages - NO FIXED ADDRESS",
    description: "Curated expedition packages for every traveler. From 7-day weekend getaways to 60-day immersive expeditions.",
    keywords: "travel packages, adventure packages, expedition packages, tour packages",
    type: "website",
  },

  gallery: {
    title: "Expedition Photo Gallery - NO FIXED ADDRESS",
    description: "Visual stories from our most extraordinary expeditions. Stunning photography from remote locations worldwide.",
    keywords: "travel photography, adventure photos, expedition gallery, travel images",
    type: "website",
  },

  about: {
    title: "About NO FIXED ADDRESS - Our Team & Story",
    description: "Learn about our team of adventure experts with 25+ years of experience. Meet the people behind transformative travel.",
    keywords: "adventure company, expedition company, about us, travel experts",
    type: "website",
  },

  blog: {
    title: "Adventure Travel Blog - NO FIXED ADDRESS",
    description: "Expert insights on adventure travel, expedition tips, destination guides, and travel stories.",
    keywords: "travel blog, adventure tips, destination guides, travel stories",
    type: "website",
  },

  contact: {
    title: "Contact NO FIXED ADDRESS - Get in Touch",
    description: "Reach out to plan your next expedition. Our team is ready to help you find your perfect adventure.",
    keywords: "contact us, adventure planning, expedition booking",
    type: "website",
  },

  dashboard: {
    title: "My Dashboard - NO FIXED ADDRESS",
    description: "Manage your bookings, track your expeditions, and access your traveler profile.",
    keywords: "traveler dashboard, booking management, trip tracking",
    type: "website",
    robots: "noindex, nofollow",
  },

  admin: {
    title: "Admin Dashboard - NO FIXED ADDRESS",
    description: "Administrative panel for managing bookings, destinations, and packages.",
    keywords: "admin panel, operations dashboard",
    type: "website",
    robots: "noindex, nofollow",
  },
};

/**
 * Generate structured data for JSON-LD
 */
export const generateStructuredData = (type: string, data: any) => {
  switch (type) {
    case "organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "NO FIXED ADDRESS",
        description: "Premium adventure travel and expedition company",
        url: "https://nofixedaddress.travel",
        logo: "https://nofixedaddress.travel/logo.svg",
        sameAs: [
          "https://www.facebook.com/nofixedaddress",
          "https://www.instagram.com/nofixedaddress",
          "https://www.twitter.com/nofixedaddress",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: "hello@nofixedaddress.cc",
          telephone: "+41-22-518-7000",
        },
      };

    case "destination":
      return {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: data.name,
        description: data.description,
        url: `https://nofixedaddress.travel/itinerary/${data.id}`,
        image: data.image,
        geo: {
          "@type": "GeoCoordinates",
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
        },
      };

    case "package":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.name,
        description: data.description,
        image: data.image,
        offers: {
          "@type": "Offer",
          price: data.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: data.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: data.rating,
              ratingCount: data.reviewCount || 1,
            }
          : undefined,
      };

    case "review":
      return {
        "@context": "https://schema.org",
        "@type": "Review",
        author: {
          "@type": "Person",
          name: data.author,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: data.rating,
          bestRating: "5",
          worstRating: "1",
        },
        reviewBody: data.content,
      };

    default:
      return null;
  }
};
