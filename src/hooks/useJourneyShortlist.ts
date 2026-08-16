import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nfa_journey_shortlist';
const MAX_SHORTLIST_SIZE = 5;
const CUSTOM_EVENT = 'nfa_shortlist_updated';

export interface JourneyShortlistItem {
  packageId: string;
  slug?: string;
  addedAt: string;
}

/**
 * Safely parse items from localStorage
 */
const getStoredShortlist = (): JourneyShortlistItem[] => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: any) => {
      return item && typeof item === 'object' && typeof item.packageId === 'string' && item.packageId.trim().length > 0;
    });
  } catch (err) {
    console.error('Error reading journey shortlist from localStorage:', err);
    return [];
  }
};

/**
 * Safely save items to localStorage and notify all components
 */
const saveStoredShortlist = (items: JourneyShortlistItem[]) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: items }));
  } catch (err) {
    console.error('Error writing journey shortlist to localStorage:', err);
  }
};

export const useJourneyShortlist = () => {
  const [items, setItems] = useState<JourneyShortlistItem[]>(() => getStoredShortlist());

  // Realtime synchronization across components and browser tabs
  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredShortlist());
    };

    window.addEventListener(CUSTOM_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(CUSTOM_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const shortlistedIds = items.map((i) => i.packageId);
  const shortlistCount = items.length;

  const isShortlisted = useCallback(
    (packageId: string): boolean => {
      if (!packageId) return false;
      return items.some(
        (i) => i.packageId === packageId || (i.slug && i.slug === packageId)
      );
    },
    [items]
  );

  const addToShortlist = useCallback(
    (packageId: string, slug?: string): { success: boolean; message?: string } => {
      if (!packageId) return { success: false, message: 'Invalid journey ID' };

      const current = getStoredShortlist();
      const exists = current.some((i) => i.packageId === packageId || (slug && i.slug === slug));
      if (exists) {
        return { success: true, message: 'Journey is already in your shortlist.' };
      }

      if (current.length >= MAX_SHORTLIST_SIZE) {
        return {
          success: false,
          message: `Your shortlist can hold up to ${MAX_SHORTLIST_SIZE} journeys. Remove one before adding another.`,
        };
      }

      const updated: JourneyShortlistItem[] = [
        ...current,
        {
          packageId,
          slug: slug || packageId,
          addedAt: new Date().toISOString(),
        },
      ];

      saveStoredShortlist(updated);
      setItems(updated);
      return { success: true, message: 'Journey added to your shortlist.' };
    },
    []
  );

  const removeFromShortlist = useCallback(
    (packageId: string) => {
      if (!packageId) return;
      const current = getStoredShortlist();
      const updated = current.filter((i) => i.packageId !== packageId && i.slug !== packageId);
      saveStoredShortlist(updated);
      setItems(updated);
    },
    []
  );

  const toggleShortlist = useCallback(
    (packageId: string, slug?: string): { isShortlisted: boolean; message?: string } => {
      if (!packageId) return { isShortlisted: false, message: 'Invalid journey ID' };

      const current = getStoredShortlist();
      const exists = current.some((i) => i.packageId === packageId || (slug && i.slug === slug));

      if (exists) {
        removeFromShortlist(packageId);
        return { isShortlisted: false, message: 'Journey removed from your shortlist.' };
      } else {
        const res = addToShortlist(packageId, slug);
        return { isShortlisted: res.success, message: res.message };
      }
    },
    [addToShortlist, removeFromShortlist]
  );

  const clearShortlist = useCallback(() => {
    saveStoredShortlist([]);
    setItems([]);
  }, []);

  return {
    items,
    shortlistedIds,
    shortlistCount,
    isShortlisted,
    addToShortlist,
    removeFromShortlist,
    toggleShortlist,
    clearShortlist,
    maxLimit: MAX_SHORTLIST_SIZE,
  };
};
