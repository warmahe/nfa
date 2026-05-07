import { db } from './firebaseService';
import { writeBatch, Timestamp, doc, collection, getDocs, deleteDoc } from 'firebase/firestore';

const clearCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  querySnapshot.forEach((d) => {
    batch.delete(doc(db, collectionName, d.id));
  });
  await batch.commit();
};

export const initializeFirestoreDatabase = async () => {
  console.log('Starting Firestore database initialization...');
  try {
    // 1. PURGE EXISTING DATA
    console.log('Purging existing data...');
    await clearCollection('destinations');
    await clearCollection('packages');
    
    const batch = writeBatch(db);

    // 2. SEED ONE ROBUST PACKAGE (The Master Template)
    const packages = [
      {
        id: 'iceland-drift',
        title: 'THE ICELANDIC DRIFT',
        slug: 'iceland-drift',
        description: 'This is not a vacation; it\'s an expedition. We leave the tourist traps behind and dive into the raw, unfiltered reality of the Arctic North.',
        destinations: ['Iceland'],
        difficulty: 'Challenging',
        duration: '7 Days',
        maxTravelers: 6,
        status: 'active',
        pricing: {
          basePrice: 5299,
          currency: 'INR',
          discount: 0,
        },
        media: {
          thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1000&q=80',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80'
          ]
        },
        rating: { average: 5.0, totalReviews: 12 },
        quickInfo: [
          { icon: 'Clock', label: 'Duration', value: '7 Days' },
          { icon: 'Calendar', label: 'Next Departure', value: 'Dec 12, 2024' },
          { icon: 'Users', label: 'Group Size', value: 'Max 6 Units' },
          { icon: 'Zap', label: 'Trip Style', value: 'Tactical' },
          { icon: 'BedDouble', label: 'Accommodation', value: 'Base Camps' },
          { icon: 'Compass', label: 'Guide', value: 'Field Experts' },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    ];

    packages.forEach(p => batch.set(doc(db, 'packages', p.id), p));

    // 3. SEED DESTINATIONS (Field Archive)
    const destinations = [
      {
        id: 'iceland',
        name: 'Iceland',
        country: 'Iceland',
        description: 'The land of fire and ice. Volcanic rifts and glacial expanses.',
        coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
        active: true,
        slug: 'iceland'
      },
      {
        id: 'norway',
        name: 'Norway',
        country: 'Norway',
        description: 'Deep fjords and jagged peaks. The ultimate northern test.',
        coverImage: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80',
        active: true,
        slug: 'norway'
      },
      {
        id: 'kyrgyzstan',
        name: 'Kyrgyzstan',
        country: 'Kyrgyzstan',
        description: 'The Silk Road peaks. Nomadic trails and high-altitude endurance.',
        coverImage: 'https://images.unsplash.com/photo-1569531191131-717a76bcd9d0?w=800&q=80',
        active: true,
        slug: 'kyrgyzstan'
      }
    ];

    destinations.forEach(d => batch.set(doc(db, 'destinations', d.id), d));

    // 4. SEED HOMEPAGE SETTINGS
    const homepageSettings = {
      heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80',
      featuredDropZones: ['iceland-drift'],
      featuredArchive: ['iceland', 'norway', 'kyrgyzstan'],
      featuredReviewIds: [],
      updatedAt: Timestamp.now()
    };

    batch.set(doc(db, 'settings', 'homepage'), homepageSettings);

    await batch.commit();
    console.log('✅ Database Purged & Master Expedition + Archive Seeded');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};