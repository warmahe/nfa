import { db } from './firebaseService';
import { writeBatch, Timestamp, doc } from 'firebase/firestore';

export const initializeFirestoreDatabase = async () => {
  console.log('Starting Firestore database initialization...');
  try {
    const batch = writeBatch(db);

    // 1. SEED DESTINATIONS
    const destinations = [
      {
        id: 'iceland',
        name: 'ICELAND',
        country: 'Iceland',
        continent: 'Europe',
        description: 'Land of fire and ice.',
        highlights: ['Northern Lights', 'Golden Circle'],
        currency: 'ISK',
        coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'switzerland',
        name: 'SWITZERLAND',
        country: 'Switzerland',
        continent: 'Europe',
        description: 'Alpine landscapes.',
        highlights: ['Matterhorn', 'Swiss Alps'],
        currency: 'CHF',
        coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    ];

    destinations.forEach(d => batch.set(doc(db, 'destinations', d.id), d));

    // 2. SEED PACKAGES
    const packages = [
      {
        id: 'iceland-adventure',
        title: 'ICELAND ADVENTURE',
        slug: 'iceland-adventure',
        overview: 'Experience the magical Golden Circle.',
        destinations: ['iceland'],
        difficulty: 'Moderate',
        duration: '5 Days / 4 Nights',
        maxTravelers: 12,
        status: 'active',
        pricing: {
          basePrice: 99000,
          currency: 'INR',
          discount: 0,
          seasonalPricing: [],
          groupPricing: []
        },
        availability: { maxSlots: 12, bookings: 0 },
        media: {
          thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
          gallery: [],
          videos: []
        },
        rating: { average: 4.8, totalReviews: 24, autoCalculated: 4.8 },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    ];

    packages.forEach(p => batch.set(doc(db, 'packages', p.id), p));

    await batch.commit();
    console.log('✅ Database Seeded Successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};