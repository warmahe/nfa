import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { STATIC_HOMEPAGE_DATA } from '../utils/staticHomeData';

export const useHomepageContent = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'homepage');
        const settingsSnap = await getDoc(settingsRef);
        const settings = settingsSnap.exists() ? settingsSnap.data() : {};

        const [pkgSnaps, destSnaps, reviewSnaps] = await Promise.all([
          getDocs(collection(db, 'packages')),
          getDocs(collection(db, 'destinations')),
          getDocs(collection(db, 'global_reviews'))
        ]);

        const allPkgs = pkgSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        const allDests = destSnaps.docs.map(d => ({ id: d.id, ...d.data() }));
        const allReviews = reviewSnaps.docs.map(d => ({ id: d.id, ...d.data() }));

        let dropZones = allPkgs.filter((p: any) => settings.featuredDropZones?.includes(p.id));
        if (dropZones.length === 0 && allPkgs.length > 0) {
          dropZones = allPkgs.slice(0, 4);
        }

        let archive = allDests.filter((d: any) => settings.featuredArchive?.includes(d.id));
        if (archive.length === 0 && allDests.length > 0) {
          archive = allDests.slice(0, 4);
        }

        let voices = settings.featuredReviewIds
          ?.map((id: string) => allReviews.find((r: any) => r.id === id))
          .filter(Boolean);
        if ((!voices || voices.length === 0) && allReviews.length > 0) {
          voices = allReviews.slice(0, 3);
        }

        setData({
          heroImage: settings.heroImage || null,
          dropZones,
          archive,
          voices
        });
      } catch (err) {
        console.error('Error fetching homepage content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { data: data || STATIC_HOMEPAGE_DATA, loading };
};