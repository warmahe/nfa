/**
 * Wishlist Service - Manage saved destinations and packages with localStorage persistence
 */

export interface WishlistItem {
  id: string;
  name: string;
  destination_id: string;
  image: string;
  savedAt: string;
  destination: string;
  price: string;
  rating: number;
  duration: string;
  category: 'Destination' | 'Package';
  region?: string;
  travelType?: string;
  difficulty?: string;
}

const WISHLIST_STORAGE_KEY = 'nfa_wishlist';

/**
 * Get all wishlisted destinations
 */
export const getWishlist = (): WishlistItem[] => {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    return [];
  }
};

/**
 * Add destination to wishlist
 */
export const addToWishlist = (destination: Omit<WishlistItem, 'savedAt'>) => {
  try {
    const wishlist = getWishlist();
    
    // Check if already wishlisted
    if (wishlist.some(item => item.destination_id === destination.destination_id)) {
      console.log('Destination already in wishlist');
      return false;
    }
    
    const newItem: WishlistItem = {
      ...destination,
      savedAt: new Date().toISOString()
    };
    
    wishlist.push(newItem);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    console.log(`✓ Added to wishlist: ${destination.name}`);
    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
};

/**
 * Remove destination from wishlist
 */
export const removeFromWishlist = (destinationId: string) => {
  try {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(item => item.destination_id !== destinationId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(filtered));
    console.log(`✓ Removed from wishlist: ${destinationId}`);
    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
};

/**
 * Check if destination is in wishlist
 */
export const isInWishlist = (destinationId: string): boolean => {
  try {
    const wishlist = getWishlist();
    return wishlist.some(item => item.destination_id === destinationId);
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return false;
  }
};

/**
 * Get wishlist count
 */
export const getWishlistCount = (): number => {
  return getWishlist().length;
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = () => {
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    console.log('✓ Wishlist cleared');
    return true;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return false;
  }
};

/**
 * Export wishlist as CSV
 */
export const exportWishlistAsCSV = () => {
  try {
    const wishlist = getWishlist();
    
    if (wishlist.length === 0) {
      console.log('Wishlist is empty');
      return;
    }

    const headers = ['Destination', 'Location', 'Price', 'Rating', 'Duration', 'Saved Date'];
    const rows = wishlist.map(item => [
      item.name,
      item.destination,
      item.price,
      item.rating.toString(),
      item.duration,
      new Date(item.savedAt).toLocaleDateString('en-IN')
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `wishlist-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✓ Wishlist exported as CSV');
  } catch (error) {
    console.error('Error exporting wishlist:', error);
  }
};

/**
 * Get wishlist items grouped by category
 */
export const getWishlistByCategory = (): Record<string, WishlistItem[]> => {
  try {
    const wishlist = getWishlist();
    const grouped: Record<string, WishlistItem[]> = {
      'Destination': [],
      'Package': []
    };
    
    wishlist.forEach(item => {
      if (item.category && grouped[item.category]) {
        grouped[item.category].push(item);
      }
    });
    
    return grouped;
  } catch (error) {
    console.error('Error grouping wishlist by category:', error);
    return { 'Destination': [], 'Package': [] };
  }
};

/**
 * Get wishlist statistics
 */
export const getWishlistStats = () => {
  try {
    const wishlist = getWishlist();
    const avgRating = wishlist.length > 0 
      ? (wishlist.reduce((sum, item) => sum + item.rating, 0) / wishlist.length).toFixed(1)
      : 0;
    
    const totalPrice = wishlist.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      return sum + price;
    }, 0);

    const grouped = getWishlistByCategory();
    const destinationCount = grouped['Destination']?.length || 0;
    const packageCount = grouped['Package']?.length || 0;

    return {
      count: wishlist.length,
      destinationCount,
      packageCount,
      avgRating,
      totalPrice,
      mostExpensisuive: wishlist.reduce((max, item) => {
        const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        const maxPrice = parseInt(max.price.replace(/[^0-9]/g, '')) || 0;
        return price > maxPrice ? item : max;
      }, wishlist[0])
    };
  } catch (error) {
    console.error('Error getting wishlist stats:', error);
    return { count: 0, destinationCount: 0, packageCount: 0, avgRating: 0, totalPrice: 0 };
  }
};
