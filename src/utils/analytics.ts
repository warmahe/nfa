/**
 * Analytics Tracking Utility
 * Tracks user events and behavior for conversion optimization
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  value?: number;
  label?: string;
  timestamp: number;
  userId?: string;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Initialize Google Analytics if in production
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      this.loadGoogleAnalytics();
    }
  }

  private loadGoogleAnalytics(): void {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"; // Replace with actual GA ID
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", "G-XXXXXXXXXX"); // Replace with actual GA ID
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, pageUrl: string): void {
    const event: AnalyticsEvent = {
      name: "page_view",
      category: "engagement",
      label: pageName,
      timestamp: Date.now(),
    };
    this.logEvent(event);

    // Send to Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pageUrl,
        page_title: pageName,
      });
    }
  }

  /**
   * Track user interactions
   */
  trackEvent(
    eventName: string,
    category: string,
    label?: string,
    value?: number
  ): void {
    const event: AnalyticsEvent = {
      name: eventName,
      category,
      label,
      value,
      timestamp: Date.now(),
    };
    this.logEvent(event);

    // Send to Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, resultCount: number): void {
    this.trackEvent("search", "engagement", query, resultCount);
  }

  /**
   * Track package views
   */
  trackPackageView(packageId: string, packageName: string): void {
    this.trackEvent("view_package", "products", packageName);
  }

  /**
   * Track booking initiation
   */
  trackBookingStart(packageId: string, packageName: string, price: number): void {
    this.trackEvent("begin_checkout", "conversion", packageName, price);
  }

  /**
   * Track booking completion
   */
  trackBookingComplete(
    packageId: string,
    packageName: string,
    price: number
  ): void {
    this.trackEvent("purchase", "conversion", packageName, price);
  }

  /**
   * Track wishlist addition
   */
  trackWishlistAdd(packageId: string, packageName: string): void {
    this.trackEvent("add_to_wishlist", "engagement", packageName);
  }

  /**
   * Track price alert signup
   */
  trackPriceAlertSignup(packageId: string): void {
    this.trackEvent("subscribe", "engagement", "price_alert");
  }

  /**
   * Track newsletter signup
   */
  trackNewsletterSignup(): void {
    this.trackEvent("subscribe", "engagement", "newsletter");
  }

  /**
   * Track filter application
   */
  trackFilterApplied(filterType: string, filterValue: string): void {
    this.trackEvent("filter_applied", "engagement", filterType);
  }

  /**
   * Track review submission
   */
  trackReviewSubmitted(rating: number): void {
    this.trackEvent("review_submitted", "engagement", `rating_${rating}`);
  }

  /**
   * Get local event log (for debugging and local analytics)
   */
  private logEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    console.debug("[Analytics]", event);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  /**
   * Get session analytics summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      eventsByCategory: this.aggregateByCategory(),
      startTime: this.events[0]?.timestamp,
      endTime: this.events[this.events.length - 1]?.timestamp,
    };
  }

  private aggregateByCategory(): Record<string, number> {
    return this.events.reduce(
      (acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Extend global Window interface for TypeScript
declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}
