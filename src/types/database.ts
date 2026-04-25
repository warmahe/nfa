import { Timestamp } from 'firebase/firestore';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BaseTimestamp {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// PACKAGES COLLECTION & SUBCOLLECTIONS
// ============================================================================

export interface JoiningPoint extends BaseDocument {
  // Basic info
  city: string; // "Reykjavik"
  location: string; // "Keflavik International Airport, Terminal 2"
  description?: string; // Additional details

  // Map coordinates
  coordinates: {
    latitude: number; // 64.1379
    longitude: number; // -21.9413
  };

  // Pickup details
  pickupTime: string; // "10:00 AM" or ISO timestamp
  instructions: string; // "Meet at Gate 4 with your passport..."

  // Pricing
  included: boolean; // true = included in base price
  additionalCost?: number; // 50 (EUR, only if included=false)

  // Activity
  active: boolean;
  order: number; // For sorting/display order
}

export interface Activity extends BaseDocument {
  // Basic info
  title: string; // "Golden Circle Tour"
  description: string; // Activity details
  location: string; // "Reykjavik, Iceland"
  icon: string; // "hiking" | "photography" | "cultural" | "adventure"

  // Scheduling
  day: number; // Which day of itinerary (1-5)
  duration: string; // "Full Day" or "2 hours"
  startTime?: string; // "08:00 AM"

  // Classification
  isIncluded: boolean; // true = included, false = optional

  // Pricing (only for optional activities)
  price?: number; // 45
  currency?: string; // "INR"

  // Additional
  included?: string; // "Breakfast, lunch, and guide"
  notIncluded?: string; // "Dinner"
  ageRestriction?: string; // "Ages 8+"

  active: boolean;
  order: number; // For sorting activities
}

export interface FAQ extends BaseDocument {
  question: string;
  answer: string; // Can be rich HTML text

  helpfulCount: number;
  unhelpfulCount: number;

  active: boolean;
  order: number; // Display order
}

export interface Review extends BaseDocument {
  // Review content
  rating: number; // 1-5 stars
  title: string; // "Amazing experience!"
  content: string; // Review text

  // Author
  travelerName: string;
  email?: string; // Private, for follow-ups
  isAnonymous: boolean;

  // Verification
  verifiedPurchase: boolean;
  bookingId?: string; // Reference to booking if verified

  // Engagement
  helpfulCount: number;
  unhelpfulCount: number;

  // Admin
  approved: boolean; // false = pending
  featured: boolean; // Highlight review

  userId?: string; // User who wrote the review
}

export interface PricingTier {
  season: string; // "Summer 2024"
  pricePerPerson: number; // 1800
  priceMultiplier?: number; // 1.2 (multiply basePrice)
  startDate: Timestamp;
  endDate: Timestamp;
}

export interface GroupPricingTier {
  minPeople: number; // Minimum travelers
  percentDiscount: number; // 10 (percentage)
  pricePerPerson?: number; // Alternative: fixed price
}

export interface PackagePricing {
  basePrice: number; // 1500
  currency: string; // "INR"
  discount?: number; // Percentage discount (0-100)
  seasonalPricing: PricingTier[];
  groupPricing: GroupPricingTier[];
}

export interface PackageMedia {
  thumbnail: string; // URL
  gallery: string[]; // Array of URLs
  videos: string[]; // YouTube URLs
}

export interface PackageRating {
  average: number; // 4.5
  manualOverride?: number; // 4.8 (override auto)
  totalReviews: number; // 42
  autoCalculated: number; // AUTO: calculated from reviews
}

export interface PackageAvailability {
  maxSlots: number; // 12 max travelers per batch
  bookings: number; // AUTO: total bookings for this package
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface Package extends BaseDocument {
  // Identification
  title: string; // "Iceland Adventure"
  slug: string; // "iceland-adventure"

  // Content
  overview: string; // Short summary
  description: string; // Long description (rich text HTML)

  // Classification
  destinations: string[]; // Array of destination IDs
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  duration: string; // "5 Days / 4 Nights"
  itineraryDays?: ItineraryDay[]; // Array of day titles and descriptions
  departureDate?: string; // "2024-06-15" (ISO date format)
  maxTravelers: number; // 12
  status: 'draft' | 'active' | 'archived';

  // Pricing
  pricing: PackagePricing;

  // Availability
  availability: PackageAvailability;

  // Media
  media: PackageMedia;

  // Ratings
  rating: PackageRating;

  // References to subcollections (for quick display)
  joiningPointCount: number;
  activitiesIncludedCount: number;
  activitiesOptionalCount: number;
  reviewsCount: number;
  faqsCount: number;

  // Creation info
  createdBy: string; // Admin user ID
  updatedBy: string; // Admin user ID
}

// ============================================================================
// ADD-ONS & ENHANCEMENTS COLLECTION
// ============================================================================

export interface AddOn extends BaseDocument {
  // Basic info
  name: string; // "Professional Photography"
  description: string; // "Personal expedition photographer capturing your adventure"
  
  // Classification
  category: string; // "Experience", "Training", "Accommodation", "Transport"
  
  // Pricing
  price: number; // 8999 (in base currency)
  currency: string; // "INR"
  
  // Status
  active: boolean;
  
  // Admin
  createdBy: string;
  updatedBy: string;
}

// ============================================================================
// BOOKINGS COLLECTION
// ============================================================================

export interface Traveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  passportNumber?: string;
  nationality?: string;
  roomPreference?: 'Single' | 'Double' | 'Twin';
}

export interface PrimaryTraveler {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface SelectedActivity {
  activityId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface BookingPricing {
  currency: string; // "INR"
  basePricePerPerson: number; // 1500
  basePriceTotal: number; // 1500 × 2 = 3000

  seasonalDiscount?: number; // -300
  seasonalPrice?: number; // Adjusted total

  joiningPointCost?: number; // 150 additional cost
  activitiesSelected: SelectedActivity[];
  activitiesTotal: number; // Sum

  subtotal: number; // Total before insurance/fee
  insurance: boolean; // Selected?
  insuranceCost: number; // 50

  groupDiscount?: number; // -300
  serviceFee: number; // subtotal × 0.05

  total: number; // Final amount
}

export interface PaymentInfo {
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'upi';
  lastFourDigits?: string;
  cardBrand?: string; // "Visa", "Mastercard"
  transactionId: string;
  chargeId?: string; // Stripe or Razorpay
  errorMessage?: string;
  paidAt?: Timestamp;
}

export interface Booking extends BaseDocument {
  // References
  packageId: string;
  userId: string; // Firebase Auth UID

  // Selections
  selectedJoiningPointId?: string;
  selectedActivityIds: string[]; // Array of optional activity IDs

  // Travelers
  travelers: Traveler[];
  numberOfTravelers: number;
  primaryTraveler: PrimaryTraveler;

  // Pricing
  pricing: BookingPricing;

  // Payment
  payment: PaymentInfo;

  // Booking Status
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  cancellationReason?: string;

  // Confirmations
  confirmationEmailSent: boolean;
  confirmationEmailSentAt?: Timestamp;
  itineraryEmailSent: boolean;
  itineraryEmailSentAt?: Timestamp;
  voucherSent: boolean;
  voucherSentAt?: Timestamp;

  // Special Notes
  specialRequests?: string;
  internalNotes?: string;

  // Check-in date
  checkinDate: Timestamp;
}

// ============================================================================
// USERS COLLECTION
// ============================================================================

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}

export interface User extends BaseDocument {
  // Profile
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Avatar
  profilePicture?: string; // URL to image

  // Account
  status: 'active' | 'blocked' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;

  // Address
  address?: UserAddress;

  // Preferences
  currency: string; // "INR"
  language: string; // "en"

  // Engagement
  totalBookings: number;
  totalSpent: number;
  preferredCategory?: string; // "Adventure", "Cultural", "Beach"

  // Marketing
  newsletter: boolean;
  marketingEmails: boolean;

  // System
  authProvider: 'email' | 'google' | 'facebook';
  lastLogin?: Timestamp;
}

// ============================================================================
// DESTINATIONS COLLECTION
// ============================================================================

export interface DestinationClimate {
  min: number; // Celsius
  max: number;
}

export interface Destination extends BaseDocument {
  // Basic info
  name: string; // "Iceland"
  country: string; // "Iceland"
  continent: string; // "Europe"
  timezone: string; // "GMT"

  // Details
  description: string; // Rich HTML
  highlights: string[]; // ["Northern Lights", "Golden Circle"]

  // Travel info
  bestTimeToVisit: string; // "June to August"
  visaRequirements: string; // Rich HTML
  currency: string; // "ISK"
  languageSpoken: string[]; // ["Icelandic", "English"]

  // Climate
  averageTemperature: DestinationClimate;
  rainfall: number; // mm per year

  // Practical
  bestDaysDuration: string; // "5-7 days"
  distanceFromAirport: string; // "50 km"

  // Media
  coverImage: string; // URL
  gallery: string[]; // URLs
  mapCoordinates: {
    latitude: number;
    longitude: number;
  };

  // SEO
  slug: string; // "iceland"
  seoDescription: string;
  seoKeywords: string[];

  // Activity
  active: boolean;
}

// ============================================================================
// BLOGS COLLECTION
// ============================================================================

export interface BlogAuthor {
  name: string;
  email: string;
  profilePicture?: string;
}

export interface Blog extends BaseDocument {
  // Content
  title: string;
  slug: string;
  content: string; // Rich HTML
  excerpt: string;

  // Metadata
  author: BlogAuthor;
  category: string; // "Travel Tips", "Destination"
  tags: string[];

  // Media
  featuredImage: string; // URL

  // Publishing
  status: 'draft' | 'published' | 'archived';
  publishedAt: Timestamp;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  // Engagement
  viewsCount: number;
  likesCount: number;
  commentsCount: number;

  // Admin info
  createdBy: string; // Author user ID
}

// ============================================================================
// SETTINGS COLLECTION
// ============================================================================

export interface ContactInfo extends BaseDocument {
  // Contact numbers
  primaryPhone: string;
  secondaryPhone?: string;

  // Email addresses
  primaryEmail: string;
  supportEmail?: string;

  // Social media
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;

  // Communication
  whatsapp?: string;
  telegramLink?: string;

  // Active status
  active: boolean;
}

export interface Address extends BaseDocument {
  // Street address
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Map coordinates
  latitude: number;
  longitude: number;

  // Office hours
  officeHours: {
    monday: { open: string; close: string }; // "09:00 AM" - "06:00 PM"
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  // Additional info
  description?: string;
  active: boolean;
}

export interface PageContent extends BaseDocument {
  // Page identifier
  pageType: 'about' | 'contact' | 'terms' | 'privacy' | 'faq';
  title: string;
  slug: string;

  // Content
  content: string; // Rich HTML
  sections?: Array<{
    title: string;
    content: string;
  }>;

  // Meta
  seoDescription?: string;
  seoKeywords?: string[];

  // Publishing
  status: 'draft' | 'published';
  published: boolean;

  // Admin
  createdBy: string;
  updatedBy: string;
}

// ============================================================================
// SEED DATA STRUCTURE (For initial data loading)
// ============================================================================

export interface SeedDataInput {
  packages: Omit<Package, keyof BaseTimestamp>[];
  joiningPoints: Record<string, Omit<JoiningPoint, keyof BaseTimestamp>[]>;
  activities: Record<string, Omit<Activity, keyof BaseTimestamp>[]>;
  faqs: Record<string, Omit<FAQ, keyof BaseTimestamp>[]>;
  reviews: Record<string, Omit<Review, keyof BaseTimestamp>[]>;
  destinations: Omit<Destination, keyof BaseTimestamp>[];
  blogs: Omit<Blog, keyof BaseTimestamp>[];
}

// ============================================================================
// QUERY RESPONSE TYPES
// ============================================================================

export interface PaginatedResponses<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Timestamp;
}

// ============================================================================
// ADMIN PANEL SPECIFIC TYPES
// ============================================================================

export interface PackageFormData {
  title: string;
  slug: string;
  overview: string;
  description: string;
  destinations: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  duration: string;
  maxTravelers: number;
  status: 'draft' | 'active' | 'archived';
  pricing: PackagePricing;
  media: PackageMedia;
}

export interface JoiningPointFormData {
  city: string;
  location: string;
  description?: string;
  latitude: number;
  longitude: number;
  pickupTime: string;
  instructions: string;
  included: boolean;
  additionalCost?: number;
}

export interface ActivityFormData {
  title: string;
  description: string;
  location: string;
  icon: string;
  day: number;
  duration: string;
  startTime?: string;
  isIncluded: boolean;
  price?: number;
  currency?: string;
  ageRestriction?: string;
}

export interface PricingFormData {
  basePrice: number;
  currency: string;
  discount?: number;
  seasonalPricing: PricingTier[];
  groupPricing: GroupPricingTier[];
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

export interface PackageFilter {
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  maxPrice?: number;
  minPrice?: number;
  destinations?: string[];
  minRating?: number;
  status?: 'active' | 'draft' | 'archived';
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// ============================================================================
// ENUMS (Alternative to Union Types)
// ============================================================================

export enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Challenging = 'Challenging',
  Expert = 'Expert',
}

export enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum UserStatus {
  Active = 'active',
  Blocked = 'blocked',
  Suspended = 'suspended',
}

export enum PackageStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived',
}

export enum AuthProvider {
  Email = 'email',
  Google = 'google',
  Facebook = 'facebook',
}

export enum BlogStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}
