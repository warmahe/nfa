/**
 * E32 — Content Quality & Publishing Checks
 *
 * Pure, synchronous, in-memory content quality checks.
 * No Firestore queries. No AI. No automatic modifications.
 * All checks derive from existing editor state.
 */

import { Package, Destination, CustomerStory } from '../types/database';
import { sanitizeText } from './itineraryNormalizer';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CheckSeverity = 'required' | 'recommended';

export interface ContentCheckItem {
  /** Unique key — used for click-to-fix targeting */
  id: string;
  /** Human-friendly label in travel-agency language */
  label: string;
  /** true = check passed / false = issue found */
  passed: boolean;
  /** Which editor tab this issue lives in (for click-to-fix) */
  targetTab?: string;
  /** Optional detail for expanded view */
  detail?: string;
}

export interface ContentCheckResult {
  /** false if ANY required check fails */
  isPublishable: boolean;
  required: ContentCheckItem[];
  recommended: ContentCheckItem[];
  /** Convenience: count of failed required items */
  requiredFailCount: number;
  /** Convenience: count of failed recommended items */
  recommendedFailCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const hasText = (v: any): boolean => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s.length > 0 && s !== 'undefined' && s !== 'null';
};

const hasUrl = (v: any): boolean => {
  if (!hasText(v)) return false;
  const s = String(v).trim();
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/');
};

const isValidSlug = (slug: any): boolean => {
  if (!hasText(slug)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug).trim());
};

const check = (
  id: string,
  label: string,
  passed: boolean,
  targetTab?: string,
  detail?: string
): ContentCheckItem => ({ id, label, passed, targetTab, detail });

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY / PACKAGE CHECK
// ─────────────────────────────────────────────────────────────────────────────

export const checkPackageContent = (pkg: Package): ContentCheckResult => {
  const cities = Array.isArray(pkg.itineraryCities) ? pkg.itineraryCities : [];
  const allDays = cities.flatMap((c) => Array.isArray(c.days) ? c.days : []);

  // ── Cover image: respect media fallback chain ──
  const thumbnail = sanitizeText(pkg.media?.thumbnail, '');
  const firstGallery = Array.isArray(pkg.media?.gallery) && pkg.media.gallery.length > 0
    ? sanitizeText(pkg.media.gallery[0], '')
    : '';
  const hasCoverImage = hasUrl(thumbnail) || hasUrl(firstGallery);

  // ── Day number validation ──
  const dayNumbersPerStop = cities.map((c) => {
    const days = Array.isArray(c.days) ? c.days : [];
    const nums = days.map((d) => d.day).filter((n) => typeof n === 'number' && !isNaN(n));
    const hasDuplicates = new Set(nums).size !== nums.length;
    const allPositive = nums.every((n) => n > 0);
    return { hasAnyDay: days.length > 0, hasDuplicates, allPositive, nums };
  });

  const hasDuplicateDayNums = dayNumbersPerStop.some((s) => s.hasDuplicates);
  const hasInvalidDayNums = dayNumbersPerStop.some((s) => !s.allPositive && s.hasAnyDay);

  // ── Stop city checks ──
  const stopsWithNoCity = cities.filter((c) => !hasText(c.city));
  const allStopsHaveCity = stopsWithNoCity.length === 0;

  // ── Pricing state: optional; if provided, must be >= 0 (empty or 0 = "Price on request") ──
  const basePrice = pkg.pricing?.basePrice;
  const pricingValid = basePrice === undefined || basePrice === null || (typeof basePrice === 'number' && !isNaN(basePrice) && basePrice >= 0);

  // ── Overview or description ──
  const hasDescription =
    hasText(pkg.overview) || hasText(pkg.description) || hasText(pkg.editorialIntro);

  // ── Duration consistency (reuse existing logic pattern) ──
  const configuredDuration = (pkg.duration || '').toLowerCase();
  const nightsInConfig = parseInt((configuredDuration.match(/(\d+)\s*night/i) || [])[1] || '0', 10);
  const totalNights = cities.reduce((acc, c) => acc + (typeof c.nights === 'number' ? c.nights : 0), 0);
  const hasDurationMismatch = nightsInConfig > 0 && totalNights > 0 && nightsInConfig !== totalNights;

  // ── Accommodation ──
  const hasAnyHotel = cities.some(
    (c) => hasText(c.hotel?.name) || c.days?.some((d) => hasText(d.hotel?.name))
  );

  // ─── REQUIRED CHECKS ───
  const required: ContentCheckItem[] = [
    check('title', 'Journey title', hasText(pkg.title), 'OVERVIEW'),
    check('slug', 'Page address (URL slug)', isValidSlug(pkg.slug), 'OVERVIEW',
      !isValidSlug(pkg.slug) ? 'Please add a valid page address before publishing.' : undefined),
    check('description', 'Journey overview or description', hasDescription, 'OVERVIEW'),
    check('cover_image', 'Cover image', hasCoverImage, 'MEDIA'),
    check('has_stops', 'At least one journey stop', cities.length > 0, 'STOPS'),
    check('stop_cities', 'All stops have valid locations',
      cities.length === 0 || allStopsHaveCity, 'STOPS',
      !allStopsHaveCity ? `${stopsWithNoCity.length} stop(s) have no location name.` : undefined),
    check('has_days', 'At least one day plan', allDays.length > 0, 'ITINERARY'),
    check('day_numbers', 'Day numbers are valid', !hasInvalidDayNums && !hasDuplicateDayNums, 'ITINERARY',
      hasDuplicateDayNums ? 'Some days share the same day number within a stop.' : undefined),
    check('pricing', 'Pricing information is valid', pricingValid, 'PRICING'),
  ];

  // ─── RECOMMENDED CHECKS ───
  const recommended: ContentCheckItem[] = [
    check('editorial_intro', 'Short editorial intro (summary line)', hasText(pkg.editorialIntro), 'OVERVIEW'),
    check('duration', 'Trip duration is set', hasText(pkg.duration), 'TRAVEL_INFO'),
    check('duration_consistency', 'Journey duration matches day-by-day plan',
      !hasDurationMismatch, 'ITINERARY',
      hasDurationMismatch
        ? `Duration setting (${pkg.duration}) and stop nights (${totalNights} nights) do not match.`
        : undefined),
    check('accommodation', 'Accommodation assigned to at least one stop', hasAnyHotel, 'HOTELS'),
    check('gallery', 'Journey gallery images',
      Array.isArray(pkg.media?.gallery) && pkg.media.gallery.filter(hasUrl).length > 0, 'MEDIA'),
    check('highlights', 'Journey highlights',
      Array.isArray(pkg.highlights) && pkg.highlights.length > 0, 'OVERVIEW'),
    check('faqs', 'Traveller questions & answers',
      Array.isArray(pkg.packageFaqs) && pkg.packageFaqs.length > 0, 'FAQS'),
    check('best_time', 'Best time to visit', hasText(pkg.bestTime), 'TRAVEL_INFO'),
    check('stop_descriptions', 'Journey stop descriptions',
      cities.length === 0 || cities.some((c) => hasText(c.description)), 'STOPS'),
    check('inclusions', 'What\'s included in the journey',
      Array.isArray(pkg.inclusionsRich) && pkg.inclusionsRich.length > 0, 'INCLUSIONS'),
    check('availability', 'Travel dates & availability configured',
      Boolean(
        !pkg.availability ||
        pkg.availability.mode === 'PRIVATE_FLEXIBLE' ||
        (Array.isArray(pkg.availability?.departures) && pkg.availability.departures.length > 0) ||
        (Array.isArray(pkg.availability?.travelWindows) && pkg.availability.travelWindows.length > 0)
      ),
      'AVAILABILITY',
      pkg.availability?.mode === 'FIXED_DEPARTURES' && (!pkg.availability?.departures || pkg.availability.departures.length === 0)
        ? 'Fixed departure mode is selected, but no upcoming departure dates have been added.'
        : undefined),
  ];

  const requiredFailCount = required.filter((r) => !r.passed).length;
  const recommendedFailCount = recommended.filter((r) => !r.passed).length;

  return {
    isPublishable: requiredFailCount === 0,
    required,
    recommended,
    requiredFailCount,
    recommendedFailCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// DESTINATION CHECK
// ─────────────────────────────────────────────────────────────────────────────

export const checkDestinationContent = (dest: Partial<Destination>): ContentCheckResult => {
  const hasCoverImage = hasUrl(dest.coverImage);
  const hasMainDescription = hasText(dest.description) || hasText(dest.shortDescription);
  const hasGallery = Array.isArray(dest.gallery) && dest.gallery.filter(hasUrl).length > 0;

  // ─── REQUIRED CHECKS ───
  const required: ContentCheckItem[] = [
    check('name', 'Destination name', hasText(dest.name), 'basic'),
    check('country', 'Country', hasText(dest.country), 'basic'),
    check('slug', 'Page address (URL slug)', isValidSlug(dest.slug), 'basic',
      !isValidSlug(dest.slug) ? 'Please add a valid page address before publishing.' : undefined),
    check('cover_image', 'Cover image', hasCoverImage, 'media'),
    check('description', 'Main description or overview', hasMainDescription, 'intro'),
  ];

  // ─── RECOMMENDED CHECKS ───
  const recommended: ContentCheckItem[] = [
    check('short_description', 'Short description (card summary)', hasText(dest.shortDescription), 'intro'),
    check('why_visit', 'Why visit this destination', hasText(dest.whyVisit), 'intro'),
    check('highlights', 'Destination highlights',
      Array.isArray(dest.highlights) && dest.highlights.length > 0, 'highlights'),
    check('locations', 'Local areas / regions',
      Array.isArray(dest.locations) && dest.locations.length > 0, 'places'),
    check('experiences', 'Curated experiences',
      Array.isArray(dest.experiences) && dest.experiences.length > 0, 'experiences'),
    check('accommodation', 'Accommodation overview', hasText(dest.accommodation), 'stay'),
    check('best_time', 'Best time to visit', hasText(dest.bestTimeToVisit), 'travel'),
    check('gallery', 'Gallery images', hasGallery, 'media'),
    check('duration', 'Recommended visit duration', hasText(dest.bestDaysDuration), 'travel'),
    check('visa', 'Visa requirements', hasText(dest.visaRequirements), 'travel'),
    check('languages', 'Languages spoken',
      Array.isArray(dest.languageSpoken) && dest.languageSpoken.length > 0, 'travel'),
    check('currency', 'Local currency', hasText(dest.currency), 'travel'),
    check('timezone', 'Timezone', hasText(dest.timezone), 'travel'),
    check('seo_description', 'SEO meta description', hasText((dest as any).seoDescription), 'seo'),
  ];

  const requiredFailCount = required.filter((r) => !r.passed).length;
  const recommendedFailCount = recommended.filter((r) => !r.passed).length;

  return {
    isPublishable: requiredFailCount === 0,
    required,
    recommended,
    requiredFailCount,
    recommendedFailCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER STORY CHECK
// ─────────────────────────────────────────────────────────────────────────────

export interface CustomerStoryCheckInput {
  title: string;
  slug: string;
  storyContent: string;
  coverImage: string;
  customerName: string;
  customerDisplayMode: string;
  adminConsent: boolean;
  targetStatus: 'DRAFT' | 'PUBLISHED';
  // Optional fields
  customerQuote?: string;
  customerLocation?: string;
  highlights?: string[];
  experiences?: string[];
  gallery?: string[];
  itineraryId?: string;
  itineraryTitle?: string;
  destinationId?: string;
  destination?: string;
  tripDuration?: string;
  travellerCount?: number;
  // Reference resolution
  allPackages?: Package[];
  allDestinations?: Destination[];
}

export const checkCustomerStoryContent = (input: CustomerStoryCheckInput): ContentCheckResult => {
  const {
    title,
    slug,
    storyContent,
    coverImage,
    customerName,
    customerDisplayMode,
    adminConsent,
    targetStatus,
    customerQuote,
    customerLocation,
    highlights,
    experiences,
    gallery,
    itineraryId,
    itineraryTitle,
    destinationId,
    destination,
    tripDuration,
    travellerCount,
    allPackages = [],
    allDestinations = [],
  } = input;

  // ── Display name check: either name set OR anonymous mode ──
  const hasDisplayName =
    customerDisplayMode === 'ANONYMOUS' || hasText(customerName);

  // ── Reference resolution ──
  const linkedJourneyExists =
    !itineraryId || allPackages.some((p) => p.id === itineraryId || p.slug === itineraryId);
  const linkedDestinationExists =
    !destinationId || allDestinations.some((d) => d.id === destinationId || d.slug === destinationId);

  const hasJourneyRef = hasText(itineraryId) || hasText(itineraryTitle);
  const hasDestinationRef = hasText(destinationId) || hasText(destination);

  // ─── REQUIRED CHECKS ───
  const required: ContentCheckItem[] = [
    check('title', 'Story title', hasText(title), 'STORY'),
    check('slug', 'Page address (URL slug)', isValidSlug(slug), 'STORY',
      !isValidSlug(slug) ? 'Please add a valid page address before publishing.' : undefined),
    check('narrative', 'Full story narrative', hasText(storyContent) && storyContent.trim().length > 50,
      'STORY',
      hasText(storyContent) && storyContent.trim().length <= 50
        ? 'The story narrative is too short to publish.'
        : undefined),
    check('display_name', 'Traveller display name or anonymous mode', hasDisplayName, 'TRAVELLER'),
    check('cover_image', 'Cover image', hasUrl(coverImage), 'PHOTOS'),
    // Consent check: only blocks when publishing (not for drafts)
    check('consent',
      'Traveller consent confirmed',
      targetStatus !== 'PUBLISHED' || adminConsent,
      'PUBLISH',
      targetStatus === 'PUBLISHED' && !adminConsent
        ? 'Traveller consent is required before this story can be published.'
        : undefined),
  ];

  // ─── RECOMMENDED CHECKS ───
  const recommended: ContentCheckItem[] = [
    check('quote', 'Traveller quote', hasText(customerQuote), 'TRAVELLER'),
    check('location', 'Traveller location', hasText(customerLocation), 'TRAVELLER'),
    check('journey_ref', 'Linked journey', hasJourneyRef, 'JOURNEY'),
    check('destination_ref', 'Linked destination', hasDestinationRef, 'JOURNEY'),
    check('journey_exists', 'Linked journey still exists',
      !itineraryId || linkedJourneyExists, 'JOURNEY',
      itineraryId && !linkedJourneyExists ? 'Linked journey could not be found.' : undefined),
    check('destination_exists', 'Linked destination still exists',
      !destinationId || linkedDestinationExists, 'JOURNEY',
      destinationId && !linkedDestinationExists ? 'Linked destination could not be found.' : undefined),
    check('duration', 'Trip duration', hasText(tripDuration), 'JOURNEY'),
    check('highlights', 'Story highlights',
      Array.isArray(highlights) && highlights.length > 0, 'STORY'),
    check('experiences', 'Memorable experiences',
      Array.isArray(experiences) && experiences.length > 0, 'STORY'),
    check('gallery', 'Story gallery images',
      Array.isArray(gallery) && gallery.filter(hasUrl).length > 0, 'PHOTOS'),
    check('traveller_count', 'Number of travellers',
      typeof travellerCount === 'number' && travellerCount > 0, 'TRAVELLER'),
  ];

  const requiredFailCount = required.filter((r) => !r.passed).length;
  const recommendedFailCount = recommended.filter((r) => !r.passed).length;

  return {
    isPublishable: requiredFailCount === 0,
    required,
    recommended,
    requiredFailCount,
    recommendedFailCount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT LABEL HELPERS (for list view badges)
// ─────────────────────────────────────────────────────────────────────────────

export type ContentQualityBadge = 'ready' | 'needs_details' | 'draft';

/**
 * Returns the list-view badge state for a journey/package.
 * 'ready' = published and publishable
 * 'needs_details' = has required issues (draft or published)
 * 'draft' = draft with no required issues
 */
export const getPackageBadge = (pkg: Package): ContentQualityBadge => {
  const result = checkPackageContent(pkg);
  if (!result.isPublishable) return 'needs_details';
  if (pkg.status === 'draft') return 'draft';
  return 'ready';
};

export const getDestinationBadge = (dest: Destination): ContentQualityBadge => {
  const result = checkDestinationContent(dest);
  if (!result.isPublishable) return 'needs_details';
  if (!dest.active) return 'draft';
  return 'ready';
};

export const getStoryBadge = (story: CustomerStory): ContentQualityBadge => {
  // For list view, simulate draft consent state to avoid false positives
  const input: CustomerStoryCheckInput = {
    title: story.title || '',
    slug: story.slug || '',
    storyContent: story.storyContent || story.story || '',
    coverImage: story.coverImage || '',
    customerName: story.customerName || '',
    customerDisplayMode: story.customerDisplayMode || 'FULL_NAME',
    adminConsent: story.status === 'PUBLISHED', // treat published = consented for list
    targetStatus: story.status || 'DRAFT',
    customerQuote: story.customerQuote || story.quote,
    customerLocation: story.customerLocation,
    highlights: story.highlights,
    experiences: story.experiences,
    gallery: story.gallery,
    itineraryId: story.itineraryId,
    itineraryTitle: story.itineraryTitle,
    destinationId: story.destinationId,
    destination: story.destination,
    tripDuration: story.tripDuration || story.duration,
    travellerCount: story.travellerCount,
  };
  const result = checkCustomerStoryContent(input);
  if (!result.isPublishable) return 'needs_details';
  if (story.status === 'DRAFT') return 'draft';
  return 'ready';
};
