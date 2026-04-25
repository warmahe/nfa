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
        itineraryDays: [
          { day: 1, title: "INSERTION: REYKJAVIK", description: "Arrive at coordinates. Gear check. First deployment into the volcanic rift." },
          { day: 2, title: "THE SILVER SILENCE", description: "Trek across the Vatnajökull glacier. Total isolation achieved." },
          { day: 3, title: "BASALT PROTOCOL", description: "Navigate the black sands of Vik. Extreme weather drills." },
          { day: 4, title: "GEOTHERMAL EXTRACTION", description: "Recover in hidden thermal vents. Review field data." },
          { day: 5, title: "THE NORTHERN WATCH", description: "Camp under the Aurora Borealis. Night navigation training." },
          { day: 6, title: "RIVER CROSSING", description: "Fording glacial rivers in modified 4x4 units." },
          { day: 7, title: "EXFILTRATION", description: "Final debrief. Return to base." }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
    ];

    packages.forEach(p => batch.set(doc(db, 'packages', p.id), p));

    // 3. SEED HOMEPAGE SETTINGS
    const homepageSettings = {
      heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&q=80',
      featuredDropZones: ['iceland-drift'],
      featuredArchive: [], // Destinations cleared
      featuredReviewIds: [],
      updatedAt: Timestamp.now()
    };

    batch.set(doc(db, 'settings', 'homepage'), homepageSettings);

    await batch.commit();
    console.log('✅ Database Purged & Master Expedition Seeded');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};