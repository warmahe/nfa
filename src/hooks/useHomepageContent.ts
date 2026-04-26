import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, documentId, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../services/firebaseService';

export const useHomepageContent = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'homepage');
        const settingsSnap = await getDoc(settingsRef);
        
        if (!settingsSnap.exists()) {
          setLoading(false);
          return;
        }

        const settings = settingsSnap.data();

        // 1. Fetch ALL packages from Firestore
        const packageSnaps = await getDocs(collection(db, 'packages'));
        const allPkgs = packageSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // 2. Fetch ALL destinations
        const destSnaps = await getDocs(collection(db, 'destinations'));
        const allDests = destSnaps.docs.map(d => ({ id: d.id, ...d.data() }));

        // 3. Fetch ALL reviews
        const reviewSnaps = await getDocs(collection(db, 'global_reviews'));
        const allReviews = reviewSnaps.docs.map(d => ({ id: d.id, ...d.data() }));

        // 4. Local Filtering based on Admin selection
        let dropZones = allPkgs.filter(p => settings.featuredDropZones?.includes(p.id));
        const archive = allDests.filter(d => settings.featuredArchive?.includes(d.id));
        
        // Fallback: If nothing featured, show most recent packages
        if (dropZones.length === 0 && allPkgs.length > 0) {
          dropZones = allPkgs.slice(0, 4);
        }
        
        // Ensure reviews follow the order selected
        const voices = settings.featuredReviewIds
          ?.map((id: string) => allReviews.find(r => r.id === id))
          .filter(Boolean);

        setData({
          heroImage: settings.heroImage,
          dropZones,
          archive,
          voices,
          footer: settings.footer
        });
      } catch (err) {
        console.error("Error fetching homepage content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return { data, loading };
};