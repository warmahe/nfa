// comparisonService.ts

const STORAGE_KEY = 'nfa_comparison';
const MAX_ITEMS = 3;

export const comparisonService = {
  compare: (items: any[]) => {
    return items;
  }
};

export const getComparisonItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error retrieving comparison items:', error);
    return [];
  }
};

export const addToComparison = (item: any) => {
  try {
    const items = getComparisonItems();
    if (items.some((i: any) => i.id === item.id)) {
      return false; // Already in comparison
    }
    if (items.length >= MAX_ITEMS) {
      throw new Error(`You can only compare up to ${MAX_ITEMS} items at a time.`);
    }
    const newItems = [...items, item];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    
    // Dispatch custom event to notify components listening for comparison changes
    window.dispatchEvent(new Event('comparisonUpdated'));
    return true;
  } catch (error) {
    console.error('Error adding to comparison:', error);
    throw error;
  }
};

export const getComparisonCount = () => {
  return getComparisonItems().length;
};

export const isInComparison = (id: string) => {
  return getComparisonItems().some((i: any) => i.id === id);
};

export const getMaxComparisonItems = () => MAX_ITEMS;

export const removeFromComparison = (id: string) => {
  try {
    const items = getComparisonItems();
    const newItems = items.filter((i: any) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event('comparisonUpdated'));
    return true;
  } catch (error) {
    console.error('Error removing from comparison:', error);
    return false;
  }
};

export const clearComparison = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('comparisonUpdated'));
  } catch (error) {
    console.error('Error clearing comparison:', error);
  }
};


