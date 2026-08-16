/**
 * E33 — Media Management Helper Utilities
 * Pure helper functions for array reordering, duplicate detection, and safe image fallback resolution.
 */

/**
 * Validates if a string looks like a usable image URL.
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN' || trimmed === '[object Object]') {
    return false;
  }
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/')
  );
};

/**
 * Returns a valid image URL or a safe fallback.
 */
export const getSafeImageUrl = (
  url?: string | null,
  fallback = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
): string => {
  if (isValidImageUrl(url)) {
    return url!.trim();
  }
  return fallback;
};

/**
 * Checks if an image URL already exists in a gallery array.
 */
export const isDuplicateImage = (gallery: string[], url: string): boolean => {
  if (!Array.isArray(gallery) || !url) return false;
  const cleanUrl = url.trim().toLowerCase();
  return gallery.some((img) => img && img.trim().toLowerCase() === cleanUrl);
};

/**
 * Reorders an item in a gallery array from one index to another (immutable).
 */
export const reorderGalleryItem = (gallery: string[], fromIndex: number, toIndex: number): string[] => {
  if (!Array.isArray(gallery)) return [];
  if (fromIndex < 0 || fromIndex >= gallery.length) return gallery;
  if (toIndex < 0 || toIndex >= gallery.length) return gallery;
  if (fromIndex === toIndex) return gallery;

  const next = [...gallery];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

/**
 * Removes an item from a gallery array at index (immutable).
 */
export const removeGalleryItem = (gallery: string[], index: number): string[] => {
  if (!Array.isArray(gallery)) return [];
  if (index < 0 || index >= gallery.length) return gallery;
  const next = [...gallery];
  next.splice(index, 1);
  return next;
};

/**
 * Adds an item to a gallery array (immutable, filter empty).
 */
export const addGalleryItem = (gallery: string[], newUrl: string): string[] => {
  const clean = (newUrl || '').trim();
  if (!clean) return Array.isArray(gallery) ? gallery : [];
  const current = Array.isArray(gallery) ? gallery.filter(Boolean) : [];
  return [...current, clean];
};

/**
 * Replaces an item in a gallery array at index (immutable).
 */
export const replaceGalleryItem = (gallery: string[], index: number, newUrl: string): string[] => {
  const clean = (newUrl || '').trim();
  if (!clean || !Array.isArray(gallery) || index < 0 || index >= gallery.length) return gallery;
  const next = [...gallery];
  next[index] = clean;
  return next;
};
