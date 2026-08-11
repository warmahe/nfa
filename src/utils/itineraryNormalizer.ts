import { Package, ItineraryCity, ItineraryDay, HotelInfo } from '../types/database';

/**
 * Sanitizes text to ensure undefined/null/NaN/[object Object] strings never render in UI
 */
export const sanitizeText = (text: any, fallback = ''): string => {
  if (text === null || text === undefined) return fallback;
  const str = String(text).trim();
  if (str === 'undefined' || str === 'null' || str === 'NaN' || str === '[object Object]') {
    return fallback;
  }
  return str;
};

/**
 * Safely normalizes HotelInfo objects
 */
export const normalizeHotel = (hotel?: HotelInfo): HotelInfo | undefined => {
  if (!hotel || !hotel.name) return undefined;
  const name = sanitizeText(hotel.name, '');
  if (!name) return undefined;

  const image = sanitizeText(hotel.image, '');
  const images = Array.isArray(hotel.images)
    ? hotel.images.map(img => sanitizeText(img)).filter(Boolean)
    : (image ? [image] : []);

  const ratingNum = typeof hotel.rating === 'number' && !isNaN(hotel.rating) && hotel.rating > 0 ? hotel.rating : undefined;

  return {
    ...hotel,
    name,
    location: sanitizeText(hotel.location, ''),
    description: sanitizeText(hotel.description, ''),
    image: images[0] || image,
    images,
    rating: ratingNum,
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities.map(a => sanitizeText(a)).filter(Boolean) : [],
    type: sanitizeText(hotel.type, ''),
    websiteUrl: sanitizeText(hotel.websiteUrl, ''),
  };
};

/**
 * Normalizes an Itinerary Day ensuring valid arrays and deterministic sorting
 */
export const normalizeDay = (day: ItineraryDay, index: number): ItineraryDay => {
  return {
    ...day,
    day: day.day || index + 1,
    title: sanitizeText(day.title, `Day ${day.day || index + 1}`),
    description: sanitizeText(day.description, ''),
    meals: Array.isArray(day.meals) ? day.meals.map(m => sanitizeText(m)).filter(Boolean) : [],
    activities: Array.isArray(day.activities) ? day.activities.map(a => sanitizeText(a)).filter(Boolean) : [],
    addons: Array.isArray(day.addons) ? day.addons.map(a => sanitizeText(a)).filter(Boolean) : [],
    images: Array.isArray(day.images) ? day.images.map(img => sanitizeText(img)).filter(Boolean) : [],
    hotel: normalizeHotel(day.hotel),
    location: sanitizeText(day.location, ''),
    transfer: sanitizeText(day.transfer, ''),
    experiences: Array.isArray(day.experiences) ? day.experiences.map(e => sanitizeText(e)).filter(Boolean) : [],
    highlights: Array.isArray(day.highlights) ? day.highlights.map(h => sanitizeText(h)).filter(Boolean) : []
  };
};

/**
 * Normalizes a Destination / Sector City ensuring valid days and deterministic sorting
 */
export const normalizeCity = (city: ItineraryCity, index: number): ItineraryCity => {
  const days = Array.isArray(city.days) 
    ? city.days
        .map((d, dIdx) => normalizeDay(d, dIdx))
        .sort((a, b) => (a.order !== undefined && b.order !== undefined ? a.order - b.order : a.day - b.day))
    : [];

  return {
    ...city,
    city: sanitizeText(city.city, `Sector ${index + 1}`),
    country: sanitizeText(city.country, ''),
    nights: typeof city.nights === 'number' && !isNaN(city.nights) ? city.nights : 1,
    days,
    hotel: normalizeHotel(city.hotel),
    description: sanitizeText(city.description, ''),
    heroImage: sanitizeText(city.heroImage, ''),
    gallery: Array.isArray(city.gallery) ? city.gallery.map(img => sanitizeText(img)).filter(Boolean) : [],
    highlights: Array.isArray(city.highlights) ? city.highlights.map(h => sanitizeText(h)).filter(Boolean) : [],
    experiences: Array.isArray(city.experiences) ? city.experiences.map(e => sanitizeText(e)).filter(Boolean) : []
  };
};

/**
 * Normalizes an entire Package/Itinerary document for presentation rendering
 */
export const normalizeItinerary = (pkg: Package): Package => {
  const cities = Array.isArray(pkg.itineraryCities)
    ? pkg.itineraryCities
        .map((c, idx) => normalizeCity(c, idx))
        .sort((a, b) => (a.order !== undefined && b.order !== undefined ? a.order - b.order : 0))
    : [];

  const thumbnail = sanitizeText(pkg.media?.thumbnail, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80');
  const gallery = Array.isArray(pkg.media?.gallery)
    ? pkg.media.gallery.map(img => sanitizeText(img)).filter(Boolean)
    : [];

  return {
    ...pkg,
    title: sanitizeText(pkg.title, 'Untitled Journey'),
    slug: sanitizeText(pkg.slug, ''),
    overview: sanitizeText(pkg.overview, ''),
    description: sanitizeText(pkg.description, ''),
    aboutTitle: sanitizeText(pkg.aboutTitle, 'What Is This Journey About?'),
    aboutQuestion: sanitizeText(pkg.aboutQuestion, 'The Expedition'),
    aboutImage: sanitizeText(pkg.aboutImage, thumbnail),
    duration: sanitizeText(pkg.duration, 'Flexible Duration'),
    difficulty: pkg.difficulty || 'Moderate',
    destinations: Array.isArray(pkg.destinations) 
      ? pkg.destinations.map(d => sanitizeText(d)).filter(Boolean)
      : [],
    highlights: Array.isArray(pkg.highlights)
      ? pkg.highlights.filter(h => h && sanitizeText(h.text))
      : [],
    inclusionsRich: Array.isArray(pkg.inclusionsRich)
      ? pkg.inclusionsRich.filter(i => i && sanitizeText(i.text))
      : [],
    exclusionsRich: Array.isArray(pkg.exclusionsRich)
      ? pkg.exclusionsRich.filter(e => e && sanitizeText(e.text))
      : [],
    packageFaqs: Array.isArray(pkg.packageFaqs)
      ? pkg.packageFaqs.filter(f => f && sanitizeText(f.question) && sanitizeText(f.answer))
      : [],
    itineraryCities: cities,
    media: {
      thumbnail,
      gallery,
      videos: Array.isArray(pkg.media?.videos) ? pkg.media.videos.map(v => sanitizeText(v)).filter(Boolean) : []
    },
    pricing: {
      basePrice: typeof pkg.pricing?.basePrice === 'number' && !isNaN(pkg.pricing.basePrice) ? pkg.pricing.basePrice : 0,
      currency: sanitizeText(pkg.pricing?.currency, 'INR'),
      discount: typeof pkg.pricing?.discount === 'number' && !isNaN(pkg.pricing.discount) ? pkg.pricing.discount : undefined
    },
    itineraryPDF: sanitizeText(pkg.itineraryPDF, ''),
    editorialIntro: sanitizeText(pkg.editorialIntro, ''),
    travelStyle: Array.isArray(pkg.travelStyle) ? pkg.travelStyle.map(s => sanitizeText(s)).filter(Boolean) : [],
    bestFor: Array.isArray(pkg.bestFor) ? pkg.bestFor.map(b => sanitizeText(b)).filter(Boolean) : [],
    bestTime: sanitizeText(pkg.bestTime, ''),
    editorialHighlights: Array.isArray(pkg.editorialHighlights) ? pkg.editorialHighlights.map(h => sanitizeText(h)).filter(Boolean) : []
  };
};
