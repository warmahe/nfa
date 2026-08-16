import { Package, Destination, CustomerStory, Review } from '../types/database';

/**
 * Deterministic Relevance Scoring for Related Journeys
 * Rules:
 * - Same destination: +50
 * - Shared travel style: +20
 * - Shared interest: +10 each
 * - Similar duration (within ±3 days): +10
 * - Same region / country: +10
 * - Similar difficulty: +5
 */
export const getJourneyDiscoveryScore = (
  candidate: Package,
  source: Package
): number => {
  let score = 0;

  // 1. Same Destination (+50)
  const candidateDestinations = (candidate.destinations || []).map((d) => d.toLowerCase());
  const sourceDestinations = (source.destinations || []).map((d) => d.toLowerCase());
  const hasSharedDest = candidateDestinations.some((d) =>
    sourceDestinations.some((sd) => sd === d || sd.includes(d) || d.includes(sd))
  );
  if (hasSharedDest) {
    score += 50;
  }

  // 2. Shared Travel Style (+20)
  const candidateStyle = (candidate.travelStyle || candidate.style || '').toLowerCase();
  const sourceStyle = (source.travelStyle || source.style || '').toLowerCase();
  if (candidateStyle && sourceStyle && (candidateStyle === sourceStyle || candidateStyle.includes(sourceStyle) || sourceStyle.includes(candidateStyle))) {
    score += 20;
  }

  // 3. Shared Interests / Tags (+10 each)
  const candidateInterests = [
    ...(candidate.interests || []),
    ...(candidate.tags || []),
    ...(candidate.bestFor || []),
  ].map((i) => i.toLowerCase());

  const sourceInterests = [
    ...(source.interests || []),
    ...(source.tags || []),
    ...(source.bestFor || []),
  ].map((i) => i.toLowerCase());

  sourceInterests.forEach((interest) => {
    if (candidateInterests.includes(interest)) {
      score += 10;
    }
  });

  // 4. Similar Duration (+10)
  const candidateDuration = candidate.durationDays || candidate.duration || 0;
  const sourceDuration = source.durationDays || source.duration || 0;
  if (candidateDuration > 0 && sourceDuration > 0) {
    const diff = Math.abs(candidateDuration - sourceDuration);
    if (diff <= 3) {
      score += 10;
    }
  }

  // 5. Shared Region / Country (+10)
  const candidateRegion = (candidate.region || candidate.country || '').toLowerCase();
  const sourceRegion = (source.region || source.country || '').toLowerCase();
  if (candidateRegion && sourceRegion && candidateRegion === sourceRegion) {
    score += 10;
  }

  // 6. Similar Difficulty (+5)
  const candidateDiff = (candidate.difficulty || '').toLowerCase();
  const sourceDiff = (source.difficulty || '').toLowerCase();
  if (candidateDiff && sourceDiff && candidateDiff === sourceDiff) {
    score += 5;
  }

  return score;
};

/**
 * Pure deterministic related journeys resolution
 */
export const getRelatedJourneys = (
  currentJourney: Package | null | undefined,
  allJourneys: Package[],
  limit = 3
): Package[] => {
  if (!allJourneys || allJourneys.length === 0) return [];

  // Exclude unpublished / draft and current journey
  const eligible = allJourneys.filter((p) => {
    if (!p || p.status === 'draft' || (p as any).active === false) return false;
    if (currentJourney && (p.id === currentJourney.id || p.slug === currentJourney.slug)) {
      return false;
    }
    return true;
  });

  if (!currentJourney) {
    return eligible.slice(0, limit);
  }

  // Calculate scores and sort descending
  const scored = eligible.map((pkg) => ({
    pkg,
    score: getJourneyDiscoveryScore(pkg, currentJourney),
  }));

  // Sort by score desc, then by rating/title
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ratingB = b.pkg.rating?.average || 5;
    const ratingA = a.pkg.rating?.average || 5;
    return ratingB - ratingA;
  });

  return scored.map((s) => s.pkg).slice(0, limit);
};

/**
 * Deterministic related destinations resolution
 */
export const getRelatedDestinations = (
  currentDestination: Destination | null | undefined,
  allDestinations: Destination[],
  allJourneys: Package[] = [],
  limit = 3
): Destination[] => {
  if (!allDestinations || allDestinations.length === 0) return [];

  const eligible = allDestinations.filter((d) => {
    if (!d || d.active === false) return false;
    if (currentDestination && (d.id === currentDestination.id || d.slug === currentDestination.slug)) {
      return false;
    }
    return true;
  });

  if (!currentDestination) {
    return eligible.slice(0, limit);
  }

  const currentRegion = (currentDestination.region || '').toLowerCase();
  const currentCountry = (currentDestination.country || '').toLowerCase();

  const scored = eligible.map((dest) => {
    let score = 0;
    const destRegion = (dest.region || '').toLowerCase();
    const destCountry = (dest.country || '').toLowerCase();

    if (currentRegion && destRegion && currentRegion === destRegion) {
      score += 40;
    }
    if (currentCountry && destCountry && currentCountry === destCountry) {
      score += 30;
    }

    // Check shared travel styles from journeys
    const currentJourneys = allJourneys.filter((j) =>
      (j.destinations || []).some((d) => d.toLowerCase() === currentDestination.name.toLowerCase())
    );
    const destJourneys = allJourneys.filter((j) =>
      (j.destinations || []).some((d) => d.toLowerCase() === dest.name.toLowerCase())
    );

    const currentStyles = new Set(currentJourneys.map((j) => (j.travelStyle || j.style || '').toLowerCase()));
    destJourneys.forEach((j) => {
      const style = (j.travelStyle || j.style || '').toLowerCase();
      if (style && currentStyles.has(style)) {
        score += 15;
      }
    });

    return { dest, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.dest).slice(0, limit);
};

/**
 * Deterministic related customer stories resolution
 */
export interface StoryDiscoveryContext {
  journeyId?: string;
  journeySlug?: string;
  destination?: string;
  destinationSlug?: string;
  travelStyle?: string;
  currentStoryId?: string;
  currentStorySlug?: string;
}

export const getRelatedStories = (
  context: StoryDiscoveryContext,
  allStories: CustomerStory[],
  limit = 3
): CustomerStory[] => {
  if (!allStories || allStories.length === 0) return [];

  // Filter only published stories and exclude current story
  const eligible = allStories.filter((s) => {
    if (!s || s.status !== 'PUBLISHED') return false;
    if (context.currentStoryId && (s.id === context.currentStoryId || s.slug === context.currentStoryId)) return false;
    if (context.currentStorySlug && (s.slug === context.currentStorySlug || s.id === context.currentStorySlug)) return false;
    return true;
  });

  const targetJourneyId = (context.journeyId || '').toLowerCase();
  const targetJourneySlug = (context.journeySlug || '').toLowerCase();
  const targetDest = (context.destination || '').toLowerCase();
  const targetDestSlug = (context.destinationSlug || '').toLowerCase();

  const scored = eligible.map((story) => {
    let score = 0;
    const sJourneyId = (story.itineraryId || '').toLowerCase();
    const sJourneySlug = (story.itinerarySlug || '').toLowerCase();
    const sDest = (story.destination || '').toLowerCase();
    const sDestSlug = (story.destinationSlug || '').toLowerCase();

    // 1. Same Journey (+50)
    if (
      (targetJourneyId && (sJourneyId === targetJourneyId || sJourneySlug === targetJourneyId)) ||
      (targetJourneySlug && (sJourneySlug === targetJourneySlug || sJourneyId === targetJourneySlug))
    ) {
      score += 50;
    }

    // 2. Same Destination (+30)
    if (
      (targetDest && (sDest === targetDest || sDest.includes(targetDest) || targetDest.includes(sDest))) ||
      (targetDestSlug && (sDestSlug === targetDestSlug || sDest === targetDestSlug))
    ) {
      score += 30;
    }

    // 3. Featured Story (+10)
    if (story.featured) {
      score += 10;
    }

    return { story, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.story).slice(0, limit);
};

/**
 * Deterministic related reviews resolution
 */
export interface ReviewDiscoveryContext {
  journeyId?: string;
  journeySlug?: string;
  destination?: string;
  destinationSlug?: string;
  currentReviewId?: string;
}

export const getRelatedReviews = (
  context: ReviewDiscoveryContext,
  allReviews: Review[],
  limit = 3
): Review[] => {
  if (!allReviews || allReviews.length === 0) return [];

  const eligible = allReviews.filter((r) => {
    if (!r || r.approved === false || r.status === 'ARCHIVED') return false;
    if (!r.content && !(r as any).testimonial) return false;
    if (context.currentReviewId && r.id === context.currentReviewId) return false;
    return true;
  });

  const targetJourneyId = (context.journeyId || '').toLowerCase();
  const targetJourneySlug = (context.journeySlug || '').toLowerCase();
  const targetDest = (context.destination || '').toLowerCase();
  const targetDestSlug = (context.destinationSlug || '').toLowerCase();

  const matching = eligible.filter((r) => {
    const rJourneyId = (r.itineraryId || '').toLowerCase();
    const rJourneySlug = (r.itinerarySlug || '').toLowerCase();
    const rDest = (r.destination || '').toLowerCase();
    const rDestSlug = (r.destinationSlug || '').toLowerCase();

    if (
      targetJourneyId &&
      (rJourneyId === targetJourneyId || rJourneySlug === targetJourneyId)
    ) {
      return true;
    }
    if (
      targetJourneySlug &&
      (rJourneySlug === targetJourneySlug || rJourneyId === targetJourneySlug)
    ) {
      return true;
    }
    if (
      targetDest &&
      (rDest === targetDest || rDest.includes(targetDest) || targetDest.includes(rDest))
    ) {
      return true;
    }
    if (
      targetDestSlug &&
      (rDestSlug === targetDestSlug || rDest === targetDestSlug)
    ) {
      return true;
    }
    return false;
  });

  // Sort by featured, then rating desc
  matching.sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) {
      return b.featured ? 1 : -1;
    }
    return (b.rating || 5) - (a.rating || 5);
  });

  return matching.slice(0, limit);
};
