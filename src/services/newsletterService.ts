/**
 * Newsletter Subscription Service
 * Manages email subscriptions with localStorage persistence
 */

export interface NewsletterSubscriber {
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

const STORAGE_KEY = 'nfa_newsletter_subscriptions';
const MAX_SUBSCRIBERS = 10000;

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Get all active subscribers
 */
export const getSubscribers = (): NewsletterSubscriber[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const subscribers = JSON.parse(stored) as NewsletterSubscriber[];
    return subscribers.filter(sub => sub.status === 'active');
  } catch (error) {
    console.error('Error retrieving newsletter subscribers:', error);
    return [];
  }
};

/**
 * Check if email is already subscribed
 */
export const isAlreadySubscribed = (email: string): boolean => {
  const subscribers = getSubscribers();
  return subscribers.some(sub => sub.email.toLowerCase() === email.toLowerCase());
};

/**
 * Subscribe email to newsletter
 * Returns: { success: boolean, message: string }
 */
export const subscribeNewsletter = (email: string): { success: boolean; message: string } => {
  // Validate email
  if (!email.trim()) {
    return { success: false, message: 'Email is required' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!validateEmail(normalizedEmail)) {
    return { success: false, message: 'Invalid email format' };
  }

  // Check if already subscribed
  if (isAlreadySubscribed(normalizedEmail)) {
    return { success: false, message: 'Already subscribed with this email' };
  }

  try {
    const subscribers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as NewsletterSubscriber[];

    // Check subscriber limit
    const activeCount = subscribers.filter(sub => sub.status === 'active').length;
    if (activeCount >= MAX_SUBSCRIBERS) {
      return { success: false, message: 'Thank you! We are at capacity. Please try again later.' };
    }

    // Add new subscriber
    const newSubscriber: NewsletterSubscriber = {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: 'active',
    };

    subscribers.push(newSubscriber);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));

    return {
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
};

/**
 * Unsubscribe email from newsletter
 */
export const unsubscribeNewsletter = (email: string): boolean => {
  try {
    const subscribers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as NewsletterSubscriber[];
    const normalizedEmail = email.toLowerCase();

    const updatedSubscribers = subscribers.map(sub =>
      sub.email.toLowerCase() === normalizedEmail
        ? { ...sub, status: 'unsubscribed' as const }
        : sub
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubscribers));
    return true;
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return false;
  }
};

/**
 * Clear all subscribers (admin function)
 */
export const clearAllSubscribers = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get newsletter statistics
 */
export const getNewsletterStats = () => {
  const subscribers = getSubscribers();
  return {
    totalSubscribers: subscribers.length,
    subscriptionRate: ((subscribers.length / MAX_SUBSCRIBERS) * 100).toFixed(2),
    lastSubscriber: subscribers[subscribers.length - 1]?.email || 'None',
  };
};

/**
 * Export subscribers as CSV
 */
export const exportSubscribersAsCSV = (): string => {
  const subscribers = getSubscribers();
  const headers = ['Email', 'Subscribed At'];
  const rows = subscribers.map(sub => [
    sub.email,
    new Date(sub.subscribedAt).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
};
