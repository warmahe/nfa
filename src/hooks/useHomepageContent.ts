import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseService';
import { HomepageSettings, Package, Destination, CustomerStory } from '../types/database';
import { STATIC_HOMEPAGE_DATA } from '../utils/staticHomeData';

export interface ResolvedHomepageData {
  settings: HomepageSettings;
  featuredPackages: Package[];
  featuredDestinations: Destination[];
  featuredStories: CustomerStory[];
}

export const useHomepageContent = () => {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [allStories, setAllStories] = useState<CustomerStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // 1. Subscribe to homepage settings document
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'homepage'),
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as HomepageSettings);
        } else {
          setSettings(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to homepage settings:', err);
        setLoading(false);
      }
    );

    // 2. Subscribe to packages collection (active/published only for public rendering)
    const unsubPackages = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const pkgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Package));
        setAllPackages(pkgs.filter((p) => p.status !== 'draft'));
      },
      (err) => console.error('Error listening to packages in homepage hook:', err)
    );

    // 3. Subscribe to destinations collection
    const unsubDestinations = onSnapshot(
      collection(db, 'destinations'),
      (snap) => {
        const dests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
        setAllDestinations(dests);
      },
      (err) => console.error('Error listening to destinations in homepage hook:', err)
    );

    // 4. Subscribe to customerStories collection (published only)
    const unsubStories = onSnapshot(
      collection(db, 'customerStories'),
      (snap) => {
        const stories = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomerStory));
        setAllStories(stories.filter((s) => s.status === 'PUBLISHED'));
      },
      (err) => console.error('Error listening to stories in homepage hook:', err)
    );

    return () => {
      unsubSettings();
      unsubPackages();
      unsubDestinations();
      unsubStories();
    };
  }, []);

  // Resolve referenced content preserving configured order and filtering out missing/draft items
  const resolvedData: ResolvedHomepageData = {
    settings: settings || (STATIC_HOMEPAGE_DATA as any),
    featuredPackages: (() => {
      const selectedIds = settings?.featuredJourneys?.journeyIds || settings?.featuredDropZones || [];
      if (selectedIds.length > 0) {
        const mapped = selectedIds
          .map((id) => allPackages.find((p) => p.id === id || p.slug === id))
          .filter((p): p is Package => Boolean(p && p.status !== 'draft'));
        if (mapped.length > 0) return mapped;
      }
      return allPackages.slice(0, 6);
    })(),
    featuredDestinations: (() => {
      const selectedIds = settings?.featuredDestinations?.destinationIds || settings?.featuredArchive || [];
      if (selectedIds.length > 0) {
        const mapped = selectedIds
          .map((id) => allDestinations.find((d) => d.id === id || d.slug === id))
          .filter((d): d is Destination => Boolean(d));
        if (mapped.length > 0) return mapped;
      }
      return allDestinations.slice(0, 6);
    })(),
    featuredStories: (() => {
      const selectedIds = settings?.customerStories?.storyIds || settings?.featuredStoryIds || [];
      if (selectedIds.length > 0) {
        const mapped = selectedIds
          .map((id) => allStories.find((s) => s.id === id || s.slug === id))
          .filter((s): s is CustomerStory => Boolean(s && s.status === 'PUBLISHED'));
        if (mapped.length > 0) return mapped;
      }
      return allStories.filter((s) => s.featured || s.status === 'PUBLISHED').slice(0, 4);
    })(),
  };

  return {
    data: resolvedData,
    loading,
    rawSettings: settings,
  };
};