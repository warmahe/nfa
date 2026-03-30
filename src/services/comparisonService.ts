import { Package } from "../constants";

export interface ComparisonItem {
  id: string;
  title: string;
  destination: string;
  price: string;
  duration: string;
  rating: number;
  image: string;
  description: string;
  addedAt: string;
}

const STORAGE_KEY = "nfa_package_comparison";
const MAX_ITEMS = 3;

/**
 * Get all packages in comparison list
 */
export const getComparison = (): ComparisonItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get comparisons:", error);
    return [];
  }
};

/**
 * Add a package to comparison (max 3)
 * Returns true if added successfully, false if limit reached
 */
export const addToComparison = (pkg: Package): boolean => {
  try {
    const comparison = getComparison();

    // Check if already in comparison
    if (comparison.some((item) => item.id === pkg.id)) {
      return false; // Already added
    }

    // Check max limit
    if (comparison.length >= MAX_ITEMS) {
      return false; // Max limit reached
    }

    const newItem: ComparisonItem = {
      ...pkg,
      addedAt: new Date().toISOString(),
    };

    comparison.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparison));
    return true;
  } catch (error) {
    console.error("Failed to add package to comparison:", error);
    return false;
  }
};

/**
 * Remove a package from comparison
 */
export const removeFromComparison = (packageId: string): void => {
  try {
    const comparison = getComparison();
    const filtered = comparison.filter((item) => item.id !== packageId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove package from comparison:", error);
  }
};

/**
 * Clear all comparisons
 */
export const clearComparison = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear comparisons:", error);
  }
};

/**
 * Get number of packages in comparison
 */
export const getComparisonCount = (): number => {
  return getComparison().length;
};

/**
 * Check if a package is in comparison
 */
export const isInComparison = (packageId: string): boolean => {
  return getComparison().some((item) => item.id === packageId);
};

/**
 * Get max comparison limit
 */
export const getMaxComparisonItems = (): number => {
  return MAX_ITEMS;
};
