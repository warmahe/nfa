import { Timestamp } from 'firebase/firestore';
import {
  setDocument,
  setSubcollectionDocument,
  getCollectionData,
} from '../services/firebaseService';
import {
  Package,
  Destination,
  JoiningPoint,
  Activity,
  FAQ,
  Review,
  Blog,
  BlogAuthor,
} from '../types/database';

// ============================================================================
// HELPER FUNCTION TO SEED DATA
// ============================================================================

export const seedFirestoreData = async () => {
  console.log('Starting Firestore data seeding...');

  try {
    // Seed destinations
    console.log('Seeding destinations...');
    await seedDestinations();

    // Seed packages and their subcollections
    console.log('Seeding packages...');
    await seedPackages();

    // Seed blogs
    console.log('Seeding blogs...');
    await seedBlogs();

    console.log('✅ All data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// ============================================================================
// DESTINATIONS
// ============================================================================

const seedDestinations = async () => {
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
      visaRequirements: 'EU/EEA citizens need a valid passport. US, Canada, Australia citizens get 90-day visa-free entry.',
      currency: 'ISK (Icelandic Króna)',
      languageSpoken: ['Icelandic', 'English'],
      averageTemperature: { min: -5, max: 14 },
      rainfall: 750,
      bestDaysDuration: '5-7 days',
      distanceFromAirport: '50 km (Keflavik to Reykjavik)',
      coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      mapCoordinates: { latitude: 64.9631, longitude: -19.0208 },
      slug: 'iceland',
      seoDescription: 'Explore Iceland - waterfalls, glaciers, Northern Lights and more',
      seoKeywords: ['Iceland', 'Northern Lights', 'Golden Circle', 'adventure'],
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
        'Experience pristine Alpine landscapes, charming medieval towns, and world-class hiking in the heart of Europe.',
      highlights: ['Matterhorn', 'Swiss Alps', 'Interlaken', 'Jungfraujoch'],
      bestTimeToVisit: 'June to September for hiking, December to February for skiing',
      visaRequirements: 'Schengen visa required for most nationalities. Check your country specific requirements.',
      currency: 'CHF (Swiss Franc)',
      languageSpoken: ['German', 'French', 'Italian', 'English'],
      averageTemperature: { min: -5, max: 20 },
      rainfall: 1000,
      bestDaysDuration: '5-7 days',
      distanceFromAirport: '25 km (Zurich to city center)',
      coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      mapCoordinates: { latitude: 46.8182, longitude: 8.2275 },
      slug: 'switzerland',
      seoDescription: 'Explore Switzerland - Alps, hiking, and picturesque villages',
      seoKeywords: ['Switzerland', 'Alps', 'Hiking', 'Matterhorn'],
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      id: 'italy',
      name: 'Italy',
      country: 'Italy',
      continent: 'Europe',
      timezone: 'CET',
      description:
        'Immerse yourself in rich history, art, and cuisine. From ancient Rome to Renaissance Florence and coastal Amalfi.',
      highlights: ['Colosseum', 'Sistine Chapel', 'Gondolas Venice', 'Amalfi Coast'],
      bestTimeToVisit: 'April to June and September to October',
      visaRequirements: 'Schengen visa required for most nationalities.',
      currency: 'EUR (Euro)',
      languageSpoken: ['Italian', 'English'],
      averageTemperature: { min: 5, max: 25 },
      rainfall: 650,
      bestDaysDuration: '7-10 days',
      distanceFromAirport: '30 km (Rome Fiumicino)',
      coverImage: 'https://images.unsplash.com/photo-1552832860-cfde3bf89f57?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1552832860-cfde3bf89f57?w=800',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      ],
      mapCoordinates: { latitude: 41.8719, longitude: 12.5674 },
      slug: 'italy',
      seoDescription: 'Explore Italy - Rome, Venice, art and culture',
      seoKeywords: ['Italy', 'Rome', 'Venice', 'Art', 'Culture'],
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];

  for (const destination of destinations) {
    await setDocument('destinations', destination.id, destination);
    console.log(`✓ Seeded destination: ${destination.name}`);
  }
};

// ============================================================================
// PACKAGES WITH SUBCOLLECTIONS
// ============================================================================

const seedPackages = async () => {
  const packages: Package[] = [
    {
      id: 'iceland-adventure',
      title: 'Iceland Adventure',
      slug: 'iceland-adventure',
      overview: 'Experience the magical Golden Circle and stunning waterfalls in just 5 days',
      description:
        'A comprehensive guide to Iceland including the Golden Circle, Blue Lagoon, and chance to see the Northern Lights. Perfect for first-time visitors.',
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
          {
            season: 'Winter 2024',
            pricePerPerson: 80000,
            priceMultiplier: undefined,
            startDate: Timestamp.fromDate(new Date('2024-12-01')),
            endDate: Timestamp.fromDate(new Date('2025-02-28')),
          },
        ],
        groupPricing: [
          {
            minPeople: 6,
            percentDiscount: 10,
            pricePerPerson: undefined,
          },
          {
            minPeople: 10,
            percentDiscount: 15,
            pricePerPerson: undefined,
          },
        ],
      },
      availability: {
        maxSlots: 12,
        bookings: 0,
      },
      media: {
        thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        gallery: [
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin-user',
      updatedBy: 'admin-user',
    },
    {
      id: 'swiss-alpine-trek',
      title: 'Swiss Alpine Trek',
      slug: 'swiss-alpine-trek',
      overview: 'Hike through stunning Alpine beauties and charming Swiss villages',
      description:
        'A challenging hiking adventure through the Swiss Alps with views of Matterhorn, comfortable mountain huts, and authentic Swiss cuisine.',
      destinations: ['switzerland'],
      difficulty: 'Challenging',
      duration: '6 Days / 5 Nights',
      maxTravelers: 10,
      status: 'active',
      pricing: {
        basePrice: 119000,
        currency: 'INR',
        discount: 0,
        seasonalPricing: [],
        groupPricing: [
          {
            minPeople: 5,
            percentDiscount: 8,
            pricePerPerson: undefined,
          },
        ],
      },
      availability: {
        maxSlots: 10,
        bookings: 0,
      },
      media: {
        thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        gallery: [
          'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        ],
        videos: [],
      },
      rating: {
        average: 4.9,
        manualOverride: undefined,
        totalReviews: 18,
        autoCalculated: 4.9,
      },
      joiningPointCount: 3,
      activitiesIncludedCount: 5,
      activitiesOptionalCount: 2,
      reviewsCount: 18,
      faqsCount: 4,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: 'admin-user',
      updatedBy: 'admin-user',
    },
  ];

  for (const pkg of packages) {
    // Save package
    await setDocument('packages', pkg.id, pkg);
    console.log(`✓ Seeded package: ${pkg.title}`);

    // Seed joining points for this package
    await seedJoiningPoints(pkg.id);

    // Seed activities for this package
    await seedActivities(pkg.id);

    // Seed FAQs for this package
    await seedFAQs(pkg.id);

    // Seed reviews for this package
    await seedReviews(pkg.id);
  }
};

// ============================================================================
// JOINING POINTS (Subcollection)
// ============================================================================

const seedJoiningPoints = async (packageId: string) => {
  const joiningPointsMap: Record<string, JoiningPoint[]> = {
    'iceland-adventure': [
      {
        id: 'keflavik-airport',
        city: 'Reykjavik',
        location: 'Keflavik International Airport, Terminal 2',
        description: 'Main airport joining point with car rental available',
        coordinates: { latitude: 64.1379, longitude: -21.9413 },
        pickupTime: '10:00 AM',
        instructions:
          'Meet at the car rental desks in Terminal 2. Our representative will be holding a "No Fixed Address" sign.',
        included: true,
        additionalCost: undefined,
        active: true,
        order: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'reykjavik-city',
        city: 'Reykjavik',
        location: 'Hotel Borg, Austurvöllur Square, 101 Reykjavik',
        description: 'City center joining point',
        coordinates: { latitude: 64.1466, longitude: -21.9426 },
        pickupTime: '11:30 AM',
        instructions:
          'Meet in front of Hotel Borg. Look for the white Land Cruiser with the No Fixed Address logo.',
        included: false,
        additionalCost: 50,
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
    'swiss-alpine-trek': [
      {
        id: 'zurich-airport',
        city: 'Zurich',
        location: 'Zurich Airport, Terminal C',
        description: 'Zurich airport main joining point',
        coordinates: { latitude: 47.425, longitude: 8.5625 },
        pickupTime: '09:00 AM',
        instructions: 'Meet at the information desk in Terminal C. We have a shuttle bus waiting.',
        included: true,
        additionalCost: undefined,
        active: true,
        order: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'interlaken',
        city: 'Interlaken',
        location: 'Interlaken West Railway Station',
        description: 'Interlaken base for Alpine trekking',
        coordinates: { latitude: 46.6831, longitude: 8.6329 },
        pickupTime: '02:00 PM',
        instructions:
          'Meet at the main entrance of Interlaken West railway station. Driver will be in hiking gear.',
        included: false,
        additionalCost: 35,
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
  };

  const points = joiningPointsMap[packageId] || [];
  for (const point of points) {
    await setSubcollectionDocument('packages', packageId, 'joiningPoints', point.id, point);
    console.log(`  ✓ Added joining point: ${point.city} - ${point.location}`);
  }
};

// ============================================================================
// ACTIVITIES (Subcollection)
// ============================================================================

const seedActivities = async (packageId: string) => {
  const activitiesMap: Record<string, Activity[]> = {
    'iceland-adventure': [
      {
        id: 'golden-circle',
        title: 'Golden Circle Tour',
        description:
          'Visit Þingvellir National Park, Geysir hot springs, and Gullfoss waterfall - Icelands three most iconic destinations.',
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'blue-lagoon',
        title: 'Blue Lagoon Geothermal Spa',
        description: 'Relax in the warm, mineral-rich waters of Icelands most famous geothermal spa.',
        location: 'Grindavík',
        icon: 'relaxation',
        day: 2,
        duration: '3 hours',
        startTime: '10:00 AM',
        isIncluded: false,
        price: 3000,
        currency: 'INR',
        ageRestriction: 'Ages 13+ (younger with adult supervision)',
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'glacier-hiking',
        title: 'Vatnajökull Glacier Hiking',
        description: 'Professional guides lead you on an adventure across Europes largest glacier ice cap.',
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
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'northern-lights',
        title: 'Northern Lights Hunting',
        description:
          'Evening chase to find the magical Aurora Borealis (Aurora Australis in Southern Hemisphere). Professional photography tips included.',
        location: 'North Iceland',
        icon: 'photography',
        day: 4,
        duration: '4-6 hours',
        startTime: '08:00 PM',
        isIncluded: false,
        price: 4000,
        currency: 'INR',
        ageRestriction: 'All ages (children manage own warmth)',
        active: true,
        order: 4,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
    'swiss-alpine-trek': [
      {
        id: 'lauterbrunnen-hike',
        title: 'Lauterbrunnen Valley Hike',
        description:
          'Hike through the breathtaking Lauterbrunnen Valley with stunning waterfall views. Easy to moderate difficulty.',
        location: 'Lauterbrunnen',
        icon: 'hiking',
        day: 1,
        duration: '4 hours',
        startTime: '08:00 AM',
        isIncluded: true,
        price: undefined,
        currency: undefined,
        ageRestriction: 'Moderate fitness required',
        active: true,
        order: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'jungfraujoch-train',
        title: 'Jungfraujoch Top of Europe',
        description: 'Ride the steepest railway in the world to Europe highest train station at 3454m.',
        location: 'Interlaken',
        icon: 'scenic',
        day: 2,
        duration: '6 hours',
        startTime: '07:30 AM',
        isIncluded: false,
        price: 7000,
        currency: 'INR',
        ageRestriction: 'All ages (high altitude)',
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'matterhorn-view',
        title: 'Matterhorn Viewpoint Trek',
        description:
          'Advanced Alpine trek to stunning viewpoints of the Matterhorn with experienced mountain guides.',
        location: 'Swiss Alps',
        icon: 'adventure',
        day: 4,
        duration: 'Full Day',
        startTime: '06:00 AM',
        isIncluded: true,
        price: undefined,
        currency: undefined,
        ageRestriction: 'Advanced fitness required, ages 16+',
        active: true,
        order: 3,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
  };

  const activities = activitiesMap[packageId] || [];
  for (const activity of activities) {
    await setSubcollectionDocument('packages', packageId, 'activities', activity.id, activity);
    console.log(`  ✓ Added activity: ${activity.title}`);
  }
};

// ============================================================================
// FAQS (Subcollection)
// ============================================================================

const seedFAQs = async (packageId: string) => {
  const faqsMap: Record<string, FAQ[]> = {
    'iceland-adventure': [
      {
        id: 'faq-1',
        question: 'What is the best time to visit Iceland for this tour?',
        answer:
          'Summer (June-August) offers long daylight hours and warm weather (around 64°F). Winter (December-February) is ideal for Northern Lights viewing but requires warm clothing.',
        helpfulCount: 12,
        unhelpfulCount: 1,
        active: true,
        order: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'faq-2',
        question: 'Do I need a visa to visit Iceland?',
        answer:
          'EU/EEA citizens need a valid passport. US, Canadian, Australian, and New Zealand citizens can stay for 90 days without a visa.',
        helpfulCount: 8,
        unhelpfulCount: 0,
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
    'swiss-alpine-trek': [
      {
        id: 'faq-1',
        question: 'What fitness level is required for the trek?',
        answer:
          'This is a challenging trek requiring good to excellent fitness. You should be comfortable hiking 5-7 hours daily at high altitude.',
        helpfulCount: 10,
        unhelpfulCount: 2,
        active: true,
        order: 1,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'faq-2',
        question: 'What should I pack for the Alpine trek?',
        answer:
          'Bring layers (temperatures drop 3.5°C per 1000m), waterproof jacket, hiking boots, backpack (40-50L), and sun protection. Full packing list provided upon booking.',
        helpfulCount: 7,
        unhelpfulCount: 0,
        active: true,
        order: 2,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ],
  };

  const faqs = faqsMap[packageId] || [];
  for (const faq of faqs) {
    await setSubcollectionDocument('packages', packageId, 'faqs', faq.id, faq);
    console.log(`  ✓ Added FAQ: ${faq.question.substring(0, 50)}...`);
  }
};

// ============================================================================
// REVIEWS (Subcollection)
// ============================================================================

const seedReviews = async (packageId: string) => {
  const reviewsMap: Record<string, Review[]> = {
    'iceland-adventure': [
      {
        id: 'review-1',
        rating: 5,
        title: 'Unforgettable Icelandic Adventure!',
        content:
          'This tour was absolutely incredible. The guides were knowledgeable and friendly. We saw the Northern Lights on our last night! Highly recommend.',
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
        createdAt: Timestamp.fromDate(new Date('2024-01-15')),
        updatedAt: Timestamp.fromDate(new Date('2024-01-15')),
      },
      {
        id: 'review-2',
        rating: 4,
        title: 'Great Experience',
        content:
          'Loved the Golden Circle and Blue Lagoon. The only downside was the weather one day was rainy, but that is Iceland after all!',
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
        createdAt: Timestamp.fromDate(new Date('2024-01-20')),
        updatedAt: Timestamp.fromDate(new Date('2024-01-20')),
      },
    ],
  };

  const reviews = reviewsMap[packageId] || [];
  for (const review of reviews) {
    await setSubcollectionDocument('packages', packageId, 'reviews', review.id, review);
    console.log(`  ✓ Added review: "${review.title}"`);
  }
};

// ============================================================================
// BLOGS
// ============================================================================

const seedBlogs = async () => {
  const author: BlogAuthor = {
    name: 'Adventure Team',
    email: 'team@nofixedaddress.com',
  };

  const blogs: Blog[] = [
    {
      id: 'blog-iceland-guide',
      title: '10 Hidden Gems in Iceland Beyond the Golden Circle',
      slug: '10-hidden-gems-iceland',
      content: `<h2>Discover Iceland's Hidden Treasures</h2>
<p>While the Golden Circle is Iceland's most famous route, there are countless hidden gems waiting to be discovered...</p>
<h3>1. Landmannalaugar</h3>
<p>Multicolored rhyolite mountains create a surreal landscape perfect for hiking.</p>`,
      excerpt: 'Discover lesser-known Icelandic destinations off the beaten path.',
      author,
      category: 'Destination Guide',
      tags: ['Iceland', 'Travel Tips', 'Hidden Gems'],
      featuredImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      status: 'published',
      publishedAt: Timestamp.fromDate(new Date('2024-01-10')),
      seoTitle: '10 Hidden Gems in Iceland - Travel Guide',
      seoDescription: 'Explore 10 hidden gems in Iceland beyond the famous Golden Circle',
      seoKeywords: ['Iceland', 'travel', 'hidden gems', 'adventure'],
      viewsCount: 1250,
      likesCount: 87,
      commentsCount: 12,
      createdBy: 'admin-user',
      createdAt: Timestamp.fromDate(new Date('2024-01-10')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-10')),
    },
    {
      id: 'blog-packing-guide',
      title: 'Complete Packing Guide for Alpine Hiking Adventures',
      slug: 'packing-guide-alpine-hiking',
      content: `<h2>Pack Smart for Mountain Adventures</h2>
<p>Alpine hiking requires specific gear and preparation. Here's everything you need to know...</p>`,
      excerpt: 'Essential packing tips for your Alpine hiking adventure.',
      author,
      category: 'Travel Tips',
      tags: ['Packing', 'Hiking', 'Switzerland', 'Adventure'],
      featuredImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
      status: 'published',
      publishedAt: Timestamp.fromDate(new Date('2024-02-05')),
      seoTitle: 'Alpine Hiking Packing Guide - What to Bring',
      seoDescription: 'Complete packing checklist for Alpine hiking trips',
      seoKeywords: ['packing', 'hiking', 'alpine', 'what to bring'],
      viewsCount: 892,
      likesCount: 65,
      commentsCount: 8,
      createdBy: 'admin-user',
      createdAt: Timestamp.fromDate(new Date('2024-02-05')),
      updatedAt: Timestamp.fromDate(new Date('2024-02-05')),
    },
  ];

  for (const blog of blogs) {
    await setDocument('blogs', blog.id, blog);
    console.log(`✓ Seeded blog: ${blog.title}`);
  }
};

// ============================================================================
// RUN SEEDING
// ============================================================================

// Uncomment the line below in your admin panel or a separate script to run:
// await seedFirestoreData();
