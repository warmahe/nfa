import { db } from './firebaseService';
import { writeBatch, Timestamp, doc } from 'firebase/firestore';
import {
  Package,
  Destination,
  JoiningPoint,
  Activity,
  FAQ,
  Review,
  Blog,
} from '../types/database';

/**
 * Admin utility to seed/initialize Firestore collections
 * This should only be called by admin users
 * Typically called from an admin panel button
 */

export const initializeFirestoreDatabase = async () => {
  console.log('🔄 Starting Firestore database initialization...');

  try {
    // Step 1: Seed destinations
    console.log('Step 1/3: Seeding destinations...');
    await seedDestinations();

    // Step 2: Seed packages and their subcollections
    console.log('Step 2/3: Seeding packages and related data...');
    await seedPackagesAndSubcollections();

    // Step 3: Seed blogs
    console.log('Step 3/3: Seeding blog posts...');
    await seedBlogs();

    console.log('✅ Database initialization complete!');
    return {
      success: true,
      message: 'Database initialized successfully with sample data',
    };
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// ============================================================================
// DESTINATIONS
// ============================================================================

const seedDestinations = async () => {
  const batch = writeBatch(db);

  const destinations: Destination[] = [
    {
      id: 'iceland',
      name: 'Iceland',
      country: 'Iceland',
      continent: 'Europe',
      timezone: 'GMT',
      description:
        'Discover the land of Fire and Ice with breathtaking natural wonders including waterfalls, glaciers, hot springs, and the Northern Lights.',
      highlights: ['Northern Lights', 'Golden Circle', 'Blue Lagoon', 'Vatnajökull Glacier'],
      bestTimeToVisit: 'June to August for warm weather, September to March for Northern Lights',
      visaRequirements:
        'EU/EEA citizens need a valid passport. US, Canada, Australia citizens get 90-day visa-free entry.',
      currency: 'ISK',
      languageSpoken: ['Icelandic', 'English'],
      averageTemperature: { min: -5, max: 14 },
      rainfall: 750,
      bestDaysDuration: '5-7 days',
      distanceFromAirport: '50 km',
      coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      mapCoordinates: { latitude: 64.9631, longitude: -19.0208 },
      slug: 'iceland',
      seoDescription: 'Explore Iceland - waterfalls, glaciers, Northern Lights',
      seoKeywords: ['Iceland', 'Northern Lights', 'Adventure'],
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'switzerland',
      name: 'Switzerland',
      country: 'Switzerland',
      continent: 'Europe',
      timezone: 'CET',
      description:
        'Experience pristine Alpine landscapes, charming medieval towns, and world-class hiking.',
      highlights: ['Matterhorn', 'Swiss Alps', 'Interlaken', 'Jungfraujoch'],
      bestTimeToVisit: 'June to September for hiking, December to February for skiing',
      visaRequirements: 'Schengen visa required for most nationalities.',
      currency: 'CHF',
      languageSpoken: ['German', 'French', 'Italian', 'English'],
      averageTemperature: { min: -5, max: 20 },
      rainfall: 1000,
      bestDaysDuration: '5-7 days',
      distanceFromAirport: '25 km',
      coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      gallery: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800'],
      mapCoordinates: { latitude: 46.8182, longitude: 8.2275 },
      slug: 'switzerland',
      seoDescription: 'Explore Switzerland - Alps, hiking, and mountains',
      seoKeywords: ['Switzerland', 'Alps', 'Hiking'],
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];

  for (const destination of destinations) {
    batch.set(doc(db, 'destinations', destination.id), destination);
  }

  await batch.commit();
  console.log(`✓ Seeded ${destinations.length} destinations`);
};

// ============================================================================
// PACKAGES WITH SUBCOLLECTIONS
// ============================================================================

const seedPackagesAndSubcollections = async () => {
  const packages: Omit<Package, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'iceland-adventure',
      title: 'Iceland Adventure',
      slug: 'iceland-adventure',
      overview:
        'Experience the magical Golden Circle and stunning waterfalls in 5 days',
      description:
        'A comprehensive guide to Iceland including the Golden Circle, Blue Lagoon, and chance to see Northern Lights.',
      destinations: ['iceland'],
      difficulty: 'Moderate',
      duration: '5 Days / 4 Nights',
      maxTravelers: 12,
      status: 'active',
      pricing: {
        basePrice: 99000,
        currency: 'INR',
        discount: 0,
        seasonalPricing: [
          {
            season: 'Summer 2024',
            pricePerPerson: 120000,
            priceMultiplier: undefined,
            startDate: Timestamp.fromDate(new Date('2024-06-01')),
            endDate: Timestamp.fromDate(new Date('2024-08-31')),
          },
        ],
        groupPricing: [
          {
            minPeople: 6,
            percentDiscount: 10,
            pricePerPerson: undefined,
          },
        ],
      },
      availability: { maxSlots: 12, bookings: 0 },
      media: {
        thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        gallery: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        ],
        videos: [],
      },
      rating: {
        average: 4.8,
        manualOverride: undefined,
        totalReviews: 24,
        autoCalculated: 4.8,
      },
      joiningPointCount: 2,
      activitiesIncludedCount: 4,
      activitiesOptionalCount: 3,
      reviewsCount: 24,
      faqsCount: 5,
      createdBy: 'admin-seed',
      updatedBy: 'admin-seed',
    },
  ];

  // Seed packages
  const batch = writeBatch(db);
  for (const pkg of packages) {
    batch.set(
      doc(db, 'packages', pkg.id),
      {
        ...pkg,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
  }
  await batch.commit();
  console.log(`✓ Seeded ${packages.length} packages`);

  // Seed subcollections for each package
  for (const pkg of packages) {
    await seedJoiningPoints(pkg.id);
    await seedActivities(pkg.id);
    await seedFAQs(pkg.id);
    await seedReviews(pkg.id);
  }
};

// ============================================================================
// JOINING POINTS
// ============================================================================

const seedJoiningPoints = async (packageId: string) => {
  const batch = writeBatch(db);

  const joiningPoints: Omit<JoiningPoint, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'keflavik-airport',
      city: 'Reykjavik',
      location: 'Keflavik International Airport, Terminal 2',
      description: 'Main airport joining point',
      coordinates: { latitude: 64.1379, longitude: -21.9413 },
      pickupTime: '10:00 AM',
      instructions:
        'Meet at car rental desks. Our representative has a "No Fixed Address" sign.',
      included: true,
      additionalCost: undefined,
      active: true,
      order: 1,
    },
    {
      id: 'reykjavik-city',
      city: 'Reykjavik',
      location: 'Hotel Borg, Austurvöllur Square',
      description: 'City center joining point',
      coordinates: { latitude: 64.1466, longitude: -21.9426 },
      pickupTime: '11:30 AM',
      instructions: 'Meet in front of Hotel Borg. Look for the white Land Cruiser.',
      included: false,
      additionalCost: 50,
      active: true,
      order: 2,
    },
  ];

  for (const point of joiningPoints) {
    batch.set(
      doc(db, 'packages', packageId, 'joiningPoints', point.id),
      {
        ...point,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
  }

  await batch.commit();
  console.log(`  ✓ Seeded ${joiningPoints.length} joining points for ${packageId}`);
};

// ============================================================================
// ACTIVITIES
// ============================================================================

const seedActivities = async (packageId: string) => {
  const batch = writeBatch(db);

  const activities: Omit<Activity, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'golden-circle',
      title: 'Golden Circle Tour',
      description:
        'Visit Þingvellir, Geysir, and Gullfoss waterfall - Iceland\'s three most iconic destinations.',
      location: 'South Iceland',
      icon: 'scenic',
      day: 1,
      duration: 'Full Day',
      startTime: '08:00 AM',
      isIncluded: true,
      price: undefined,
      currency: undefined,
      ageRestriction: 'All ages',
      active: true,
      order: 1,
    },
    {
      id: 'blue-lagoon',
      title: 'Blue Lagoon Geothermal Spa',
      description: 'Relax in mineral-rich geothermal waters.',
      location: 'Grindavík',
      icon: 'relaxation',
      day: 2,
      duration: '3 hours',
      startTime: '10:00 AM',
      isIncluded: false,
      price: 3000,
      currency: 'INR',
      ageRestriction: 'Ages 13+',
      active: true,
      order: 2,
    },
    {
      id: 'glacier-hiking',
      title: 'Vatnajökull Glacier Hiking',
      description: 'Professional guides lead you across Europe\'s largest glacier.',
      location: 'Southeast Iceland',
      icon: 'adventure',
      day: 3,
      duration: 'Full Day',
      startTime: '07:00 AM',
      isIncluded: true,
      price: undefined,
      currency: undefined,
      ageRestriction: 'Ages 8+, good fitness required',
      active: true,
      order: 3,
    },
    {
      id: 'northern-lights',
      title: 'Northern Lights Hunting',
      description: 'Evening chase to find the Aurora Borealis with photography tips.',
      location: 'North Iceland',
      icon: 'photography',
      day: 4,
      duration: '4-6 hours',
      startTime: '08:00 PM',
      isIncluded: false,
      price: 4000,
      currency: 'INR',
      ageRestriction: 'All ages',
      active: true,
      order: 4,
    },
  ];

  for (const activity of activities) {
    batch.set(
      doc(db, 'packages', packageId, 'activities', activity.id),
      {
        ...activity,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
  }

  await batch.commit();
  console.log(`  ✓ Seeded ${activities.length} activities for ${packageId}`);
};

// ============================================================================
// FAQS
// ============================================================================

const seedFAQs = async (packageId: string) => {
  const batch = writeBatch(db);

  const faqs: Omit<FAQ, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'faq-1',
      question: 'What is the best time to visit Iceland?',
      answer:
        'Summer (June-August) offers long daylight. Winter (December-February) is ideal for Northern Lights.',
      helpfulCount: 12,
      unhelpfulCount: 1,
      active: true,
      order: 1,
    },
    {
      id: 'faq-2',
      question: 'Do I need a visa?',
      answer:
        'EU/EEA citizens need a passport. US, Canada, Australia get 90-day visa-free entry.',
      helpfulCount: 8,
      unhelpfulCount: 0,
      active: true,
      order: 2,
    },
  ];

  for (const faq of faqs) {
    batch.set(
      doc(db, 'packages', packageId, 'faqs', faq.id),
      {
        ...faq,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
  }

  await batch.commit();
  console.log(`  ✓ Seeded ${faqs.length} FAQs for ${packageId}`);
};

// ============================================================================
// REVIEWS
// ============================================================================

const seedReviews = async (packageId: string) => {
  const batch = writeBatch(db);

  const reviews: Omit<Review, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'review-1',
      rating: 5,
      title: 'Unforgettable Icelandic Adventure!',
      content:
        'Absolutely incredible! The guides were knowledgeable and friendly. We saw Northern Lights!',
      travelerName: 'Sarah M.',
      email: 'sarah@example.com',
      isAnonymous: false,
      verifiedPurchase: true,
      bookingId: 'BK-2024-00001',
      helpfulCount: 24,
      unhelpfulCount: 0,
      approved: true,
      featured: true,
      userId: 'user-001',
    },
    {
      id: 'review-2',
      rating: 4,
      title: 'Great Experience',
      content:
        'Loved the Golden Circle and Blue Lagoon. Weather was rainy one day, but that\'s Iceland!',
      travelerName: 'John D.',
      email: 'john@example.com',
      isAnonymous: false,
      verifiedPurchase: true,
      bookingId: 'BK-2024-00002',
      helpfulCount: 18,
      unhelpfulCount: 2,
      approved: true,
      featured: false,
      userId: 'user-002',
    },
  ];

  for (const review of reviews) {
    batch.set(
      doc(db, 'packages', packageId, 'reviews', review.id),
      {
        ...review,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      }
    );
  }

  await batch.commit();
  console.log(`  ✓ Seeded ${reviews.length} reviews for ${packageId}`);
};

// ============================================================================
// BLOGS
// ============================================================================

const seedBlogs = async () => {
  const batch = writeBatch(db);

  const blogs: Omit<Blog, keyof { createdAt: any; updatedAt: any }>[] = [
    {
      id: 'blog-iceland-guide',
      title: '10 Hidden Gems in Iceland',
      slug: '10-hidden-gems-iceland',
      content:
        '<h2>Discover Iceland\'s Hidden Treasures</h2><p>While the Golden Circle is famous, there are countless hidden gems. Landmannalaugar offers multicolored rhyolite mountains perfect for hiking...</p>',
      excerpt: 'Discover lesser-known Icelandic destinations.',
      author: {
        name: 'Adventure Team',
        email: 'team@nofixedaddress.com',
      },
      category: 'Destination Guide',
      tags: ['Iceland', 'Travel Tips', 'Hidden Gems'],
      featuredImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      status: 'published',
      publishedAt: Timestamp.fromDate(new Date('2024-01-10')),
      seoTitle: '10 Hidden Gems in Iceland',
      seoDescription: 'Explore hidden gems in Iceland beyond the Golden Circle',
      seoKeywords: ['Iceland', 'travel', 'hidden gems'],
      viewsCount: 1250,
      likesCount: 87,
      commentsCount: 12,
      createdBy: 'admin-seed',
    },
  ];

  for (const blog of blogs) {
    batch.set(
      doc(db, 'blogs', blog.id),
      {
        ...blog,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    );
  }

  await batch.commit();
  console.log(`✓ Seeded ${blogs.length} blog posts`);
};
