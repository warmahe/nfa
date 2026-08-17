import { Timestamp } from 'firebase/firestore';

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface BaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
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
  rating: number;
  title?: string;
  content: string;
  travelerName: string;
  role?: string;
  avatar?: string;
  approved: boolean;
  featured?: boolean;
  displayOrder?: number;

  // E47 Public Social Proof & Relationships
  bookingId?: string;
  bookingReference?: string;
  customerId?: string;
  itineraryId?: string;
  itineraryTitle?: string;
  itinerarySlug?: string;
  destination?: string;
  destinationSlug?: string;
  travelDate?: string;
  travelYear?: number | string;
  status?: 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | Timestamp;
  coverImage?: string;
  source?: 'TRAVELLER_FEEDBACK' | 'MANUAL';
  verifiedPurchase?: boolean;
  isAnonymous?: boolean;
  helpfulCount?: number;
  unhelpfulCount?: number;
  email?: string;
  userId?: string;
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
  basePrice: number;
  currency: string;
  discount?: number;
  discountedPrice?: number;
  dates?: any;
  seasonalPricing?: PricingTier[];
  groupPricing?: any;
}

export interface PackageMedia {
  thumbnail: string;
  gallery: string[];
  videos?: string[];
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

// E50 Departure Dates, Availability & Travel Windows
export type DepartureAvailabilityStatus =
  | 'AVAILABLE'
  | 'LIMITED'
  | 'ON_REQUEST'
  | 'CLOSED';

export type DepartureType =
  | 'FIXED_DEPARTURE'
  | 'PRIVATE_FLEXIBLE'
  | 'SEASONAL'
  | 'CUSTOM';

export interface JourneyDepartureDate {
  id: string;
  date: string;
  status: DepartureAvailabilityStatus;
  type?: DepartureType;
  remainingSpaces?: number;
  maxTravellers?: number;
  minTravellers?: number;
  note?: string;
}

export interface JourneyTravelWindow {
  id: string;
  label: string;
  from: string;
  to: string;
  status: DepartureAvailabilityStatus;
  note?: string;
}

export interface JourneyAvailability {
  mode?: 'FIXED_DEPARTURES' | 'PRIVATE_FLEXIBLE' | 'BOTH';
  departures?: JourneyDepartureDate[];
  travelWindows?: JourneyTravelWindow[];
  maxSlots?: number;
  bookings?: number;
  bookingLeadTimeDays?: number;
  availabilityNote?: string;
  enquiryGuidance?: string;
}

export interface HotelInfo {
  id?: string;
  name: string;
  location?: string;
  rating?: number;
  image?: string;
  images?: string[];      // Gallery readiness for B5
  description?: string;
  amenities?: string[];    // e.g. ['Wi-Fi', 'Pool', 'Breakfast', 'Spa']
  type?: string;         // e.g. 'Luxury Lodge', 'Boutique Camp'
  websiteUrl?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  // Rich day fields
  meals?: string[];       // e.g. ['Breakfast', 'Dinner']
  activities?: string[];  // activity titles for this day
  addons?: string[];      // optional add-on titles
  textAlign?: 'left' | 'center' | 'right'; // New: alignment control
  isDay1Arrival?: boolean; // New: Special flag for Day 1
  arrivalText?: string;    // New: "Fly in to..." text
  hotel?: HotelInfo;       // Accommodation details
  images?: string[];       // Day-specific gallery images
  order?: number;          // Sort index
  // E1 Editorial Day Fields
  location?: string;
  transfer?: string;
  experiences?: string[];
  highlights?: string[];
}

export interface ItineraryCity {
  city: string;           // e.g. 'Reykjavik'
  country?: string;       // New: 'Spain', 'Iceland' etc
  nights: number;         // number of nights in this city
  days: ItineraryDay[];   // ordered day entries
  arrivalTransfer?: {     // New: Transfer info before this city
    type: 'flight' | 'train' | 'bus' | 'ferry' | 'car';
    text: string;         // e.g. "Transfer by flight on day 4"
  };
  hotel?: HotelInfo;       // Sector-wide accommodation details
  order?: number;          // Sort index
  // E1 Editorial Journey Stop Fields
  description?: string;
  heroImage?: string;
  gallery?: string[];
  highlights?: string[];
  experiences?: string[];
}

export interface TripHighlight {
  icon?: string;  // emoji or lucide icon name
  text: string;
}

export interface RichInclusionExclusion {
  text: string;
  category?: string; // e.g. 'Accommodation', 'Transport', 'Meals'
  icon?: string;     // lucide icon name
}

export interface TripPricingDate {
  date_range: string;     // e.g. 'Oct 15 – Oct 22, 2026'
  price: number;
  currency?: string;
  status: 'available' | 'limited' | 'sold_out' | 'coming_soon';
  notes?: string;
}

export interface QuickInfoItem {
  label: string;
  value: string;
  icon: string;
}

export interface HomepageHeroConfig {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryBtnLabel?: string;
  primaryBtnAction?: string;
  secondaryBtnLabel?: string;
  secondaryBtnAction?: string;
  heroImage?: string;
  heroVideo?: string;
}

export interface HomepageIntroConfig {
  enabled?: boolean;
  sectionLabel?: string;
  heading?: string;
  description?: string;
  image?: string;
  ctaLabel?: string;
  ctaAction?: string;
}

export interface HomepageSectionConfig {
  enabled?: boolean;
  sectionLabel?: string;
  heading?: string;
  description?: string;
}

export interface HomepageExperienceCategory {
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface HomepageWhyUsFeature {
  title: string;
  description: string;
  icon?: string;
}

export interface ContentSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean; // false: Index (default), true: Noindex (Hide from search)
}

export interface HomepageSettings {
  heroImage: string;
  featuredDropZones: string[];
  featuredArchive: string[];
  featuredReviewIds: string[];
  featuredStoryIds?: string[];

  // E18 Structured Sections
  hero?: HomepageHeroConfig;
  introduction?: HomepageIntroConfig;
  featuredJourneys?: HomepageSectionConfig & { journeyIds?: string[] };
  featuredDestinations?: HomepageSectionConfig & { destinationIds?: string[] };
  experiences?: HomepageSectionConfig & { categories?: HomepageExperienceCategory[] };
  customerStories?: HomepageSectionConfig & { storyIds?: string[] };
  reviews?: HomepageSectionConfig & { reviewIds?: string[]; featuredOnly?: boolean; count?: number };
  whyUs?: HomepageSectionConfig & { features?: HomepageWhyUsFeature[] };
  planningCta?: {
    enabled?: boolean;
    heading?: string;
    description?: string;
    primaryBtnLabel?: string;
    secondaryBtnLabel?: string;
  };

  // E34 SEO Settings
  seo?: ContentSEO;

  updatedAt?: Timestamp;
}

export interface Package extends BaseDocument {
  title: string;
  slug: string;
  overview: string;
  description: string;
  aboutImage?: string;
  aboutTitle?: string;
  aboutQuestion?: string;
  destinations: string[];
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert';
  duration: string;
  status: 'draft' | 'active' | 'archived';
  quickInfo?: QuickInfoItem[];
  highlights?: TripHighlight[];
  itineraryDays?: ItineraryDay[];
  itineraryCities?: ItineraryCity[];
  inclusionsRich?: RichInclusionExclusion[];
  exclusionsRich?: RichInclusionExclusion[];
  packageFaqs?: { question: string; answer: string; category?: string; order?: number }[];
  pricing: PackagePricing;
  media: PackageMedia;
  itineraryPDF?: string;
  // E1 Editorial Package Fields
  editorialIntro?: string;
  travelStyle?: string[];
  style?: string;
  tripStyle?: string;
  destination?: string;
  interests?: string[];
  tags?: string[];
  durationDays?: number;
  region?: string;
  country?: string;
  startLocation?: string;
  maxTravelers?: number;
  groupSize?: string;
  accommodation?: string;
  accommodationStyle?: string;
  hotels?: any[];
  accommodations?: any[];
  guideType?: string;
  relatedTripIds?: string[];
  tagline?: string;
  rating?: { average: number; totalReviews: number; manualOverride?: number; autoCalculated?: number };
  pricingDates?: any;
  departureDate?: any;
  limitedSeats?: any;
  bestFor?: string[];
  bestTime?: string;
  editorialHighlights?: string[];
  coverImage?: string;
  joiningPointCount?: number;
  activitiesIncludedCount?: number;
  activitiesOptionalCount?: number;
  reviewsCount?: number;
  faqsCount?: number;
  // E34 SEO & Public Discovery
  seo?: ContentSEO;
  // E50 Departure Dates & Travel Windows Availability
  availability?: JourneyAvailability;
}

// ============================================================================
// ENQUIRIES COLLECTION
// ============================================================================

export interface EnquiryDocument {
  id?: string;
  enquiryId: string; // Customer facing reference e.g. "NFA-89201"
  enquiryReference?: string;
  customerId?: string; // Customer profile reference e.g. "NFA-C-10492" or userId
  itineraryId?: string;
  itineraryTitle?: string;
  itinerarySlug?: string;
  travelDate?: string;
  destination?: string;
  duration?: string;
  tripSummary?: any;
  groupSize?: string | number;
  pricing?: {
    basePrice?: number;
    currency?: string;
  };

  traveller: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    userId?: string;
  };

  trip: {
    travelDate: string; // ISO YYYY-MM-DD or formatted date
    numberOfDays: number | string;
    adults: number;
    children: number;
    childAges: number[];
    totalTravellers: number;
  };

  preferences: {
    budget?: number | string;
    budgetCurrency?: string;
    preferences?: string;
    specialRequests?: string;
    travelStyle?: string[];
    accommodationStyle?: string;
    interests?: string[];
    dietary?: string;
    accessibility?: string;
    specialOccasion?: string;
  };

  status: 'NEW' | 'CONTACTED' | 'IN_DISCUSSION' | 'CUSTOMIZATION' | 'PROPOSAL_SENT' | 'READY_TO_BOOK' | 'CONVERTED' | 'CLOSED';
  source: 'ITINERARY' | 'CONTACT_PAGE' | 'DIRECT' | string;
  entryPoint?: 'HERO' | 'STICKY_CARD' | 'MOBILE_STICKY' | 'CONTACT_PAGE' | 'DIRECT' | string;
  sourceUrl?: string;

  marketingConsent?: boolean;
  emailStatus?: 'unsubscribed' | 'subscribed';

  // ── Lead Management Workspace Fields (C2 & E11) ──
  assignedTo?: string;
  assignedToName?: string;
  followUpAt?: Timestamp | string;
  nextAction?: string;
  lastContactedAt?: Timestamp | string;
  lastContactedBy?: string;
  lastContactedChannel?: 'WHATSAPP' | 'EMAIL' | 'PHONE';
  statusChangedAt?: Timestamp;
  statusChangedBy?: string;

  // E11 Sales Qualification & Pipeline Fields
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  travelFlexibility?: 'FIXED_DATES' | 'FLEXIBLE_DATES' | 'VERY_FLEXIBLE';
  preferredTravelDateFrom?: string;
  preferredTravelDateTo?: string;
  estimatedBookingValue?: number;
  estimatedBookingCurrency?: string;
  travellerIntent?: 'EXPLORING' | 'SHORTLISTING' | 'READY_TO_PLAN' | 'READY_TO_BOOK';
  proposalStatus?: 'NOT_PREPARED' | 'PREPARING' | 'READY' | 'SENT';
  proposalSentAt?: Timestamp;
  proposalSentBy?: string;
  proposalReference?: string;
  closedReason?: string;
  closedReasonDetails?: string;
  closedAt?: Timestamp;
  closedBy?: string;

  // Linked Booking Reference (E6/E11)
  bookingId?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InternalNote {
  id?: string;
  enquiryId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
}

export interface EnquiryActivity {
  id?: string;
  enquiryId: string;
  type:
    | 'ENQUIRY_RECEIVED'
    | 'STATUS_CHANGED'
    | 'NOTE_ADDED'
    | 'FOLLOW_UP_SET'
    | 'FOLLOW_UP_CLEARED'
    | 'ASSIGNED'
    | 'CONTACTED'
    | 'WHATSAPP_OPENED'
    | 'EMAIL_OPENED'
    | 'PHONE_INITIATED'
    | 'TRIP_INFORMATION_UPDATED'
    | 'OPERATIONAL_STATUS_CHANGED'
    | 'CHECKLIST_UPDATED'
    | 'TRAVELLER_BRIEFED'
    | 'LEAD_PRIORITY_CHANGED'
    | 'LEAD_QUALIFIED'
    | 'PROPOSAL_STATUS_CHANGED'
    | 'LEAD_CLOSED'
    | 'LEAD_REOPENED'
    | 'BOOKING_CREATED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_UPDATED'
    | 'DOCUMENT_REMOVED'
    | 'DOCUMENT_VISIBILITY_CHANGED';
  actorId: string;
  actorName: string;
  metadata?: {
    from?: string;
    to?: string;
    noteSnippet?: string;
    followUpAt?: string;
    channel?: string;
    assignedToName?: string;
    nextAction?: string;
    reason?: string;
    details?: string;
    priority?: string;
    intent?: string;
    estValue?: string;
    [key: string]: any;
  };
  createdAt: Timestamp;
}

// ============================================================================
// CUSTOMERS COLLECTION (C3)
// ============================================================================

export interface CustomerPreferences {
  travelStyle?: string | string[];
  preferredTravelStyle?: string | string[];
  preferredDestinations?: string[];
  preferredAccommodation?: string[];
  accommodationPreference?: string;
  accommodationType?: string;
  dietaryPreferences?: string[];
  dietary?: string;
  accessibility?: string;
  interests?: string[];
  notes?: string;
}

export interface CustomerDocument {
  id?: string;
  customerId: string; // Document ID (userId if authenticated, or auto ID)
  customerReference: string; // Human friendly reference e.g. "NFA-C-10492"
  userId?: string; // Firebase Auth UID if authenticated

  name: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;

  preferences?: CustomerPreferences;

  totalEnquiries: number;
  totalConvertedEnquiries: number;
  lastEnquiryAt?: Timestamp | string;

  marketingConsent?: boolean;
  emailStatus?: 'unsubscribed' | 'subscribed';
  isReturning?: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  travelDate: string;
  travelFlexibility?: 'FIXED_DATES' | 'FLEXIBLE_DATES' | 'VERY_FLEXIBLE';
  preferredTravelDateFrom?: string;
  preferredTravelDateTo?: string;
  numberOfDays: number | string;
  adults: number;
  children: number;
  childAges: number[];
  budget?: string;
  budgetCurrency?: string;
  preferences?: string;
  travelStyle?: string[];
  accommodationStyle?: string;
  interests?: string[];
  dietary?: string;
  accessibility?: string;
  specialOccasion?: string;
  specialRequests?: string;
  marketingConsent?: boolean;
}

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
// BOOKING DOCUMENTS (E12)
// ============================================================================

export type BookingDocumentCategory =
  | 'ITINERARY'
  | 'BOOKING_CONFIRMATION'
  | 'TRAVEL_VOUCHER'
  | 'ADDITIONAL';

export interface BookingDocument {
  id: string;
  category: BookingDocumentCategory;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: Timestamp;
  uploadedBy?: string;
  visibleToTraveller: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
  name?: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
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
  amount?: number;
  currency?: string;
  lastFourDigits?: string;
  cardBrand?: string; // "Visa", "Mastercard"
  transactionId: string;
  chargeId?: string; // Stripe or Razorpay
  errorMessage?: string;
  paidAt?: Timestamp;
}

export interface Booking extends BaseDocument {
  // References & E6 Relationships
  bookingReference?: string; // Human readable e.g. "NFA-B-48291"
  customerId?: string; // Links to customers/{userId}
  enquiryId?: string; // Links to Enquiries/{enquiryId}
  packageId?: string;
  userId?: string; // Firebase Auth UID

  itineraryId?: string;
  itineraryTitle?: string;
  itinerarySlug?: string;
  destination?: string;
  travelDate?: string;
  checkinDate?: string | Timestamp;
  checkoutDate?: string | Timestamp;
  duration?: string;
  agreedPrice?: number;

  // E6 Status Lifecycle
  status?: 'DRAFT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

  // Selections
  selectedJoiningPointId?: string;
  selectedActivityIds?: string[]; // Array of optional activity IDs

  // Travelers
  travelers?: Traveler[];
  numberOfTravelers?: number;
  primaryTraveler?: PrimaryTraveler;

  // Pricing
  pricing?: BookingPricing;

  // Payment
  payment?: PaymentInfo;

  // Booking Type
  bookingType?: 'meeting' | 'reserve' | 'book'; // meeting=consultation, reserve=partial pay, book=full pay

  // Booking Status
  bookingStatus?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  cancellationReason?: string;

  // Confirmations
  confirmationEmailSent: boolean;
  confirmationEmailSentAt?: Timestamp;
  itineraryEmailSent: boolean;
  itineraryEmailSentAt?: Timestamp;
  voucherSent: boolean;
  voucherSentAt?: Timestamp;

  // E8 Traveller-Safe Trip Information
  specialRequests?: string;
  internalNotes?: string;
  travellerNotes?: string; // Shared with customer on My Trip
  tripInstructions?: string; // Special trip instructions shared with customer
  travelPreferences?: {
    accommodation?: string;
    dietary?: string;
    accessibility?: string;
    interests?: string;
  };

  // E10 Admin Trip Operations (Admin Internal Only)
  operationalStatus?:
    | 'NOT_STARTED'
    | 'IN_PREPARATION'
    | 'READY'
    | 'TRAVELLER_BRIEFED'
    | 'TRIP_IN_PROGRESS'
    | 'TRIP_COMPLETED';

  operationalChecklist?: {
    travellerDetailsVerified?: boolean;
    travelDatesVerified?: boolean;
    itineraryReviewed?: boolean;
    accommodationReviewed?: boolean;
    specialRequirementsReviewed?: boolean;
    travellerInstructionsPrepared?: boolean;
    documentsReady?: boolean;
    travellerBriefed?: boolean;
    finalConfirmationCompleted?: boolean;
  };

  accommodationReadiness?: 'NOT_REVIEWED' | 'REVIEWED' | 'READY';

  // E12 Booking Travel Documents (Admin-managed, customer-safe)
  documents?: BookingDocument[];

  // E46 Traveller Feedback, Review & Post-Trip Insight Center
  feedback?: BookingFeedback;
}

export type FeedbackStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface BookingFeedback {
  submitted?: boolean;
  submittedAt?: string;

  overallRating: number; // 1–5 (required)

  journeyRating?: number; // 1–5
  accommodationRating?: number; // 1–5
  experienceRating?: number; // 1–5
  travelTeamRating?: number; // 1–5

  likedMost?: string;
  improvements?: string;

  wouldRecommend?: 'YES' | 'NOT_SURE' | 'NO' | boolean;

  testimonialText?: string;

  publicConsent?: boolean;
  publicDisplayName?: string; // 'Full Name' | 'First Name' | 'Anonymous'

  status?: FeedbackStatus;

  reviewedAt?: string;
  reviewedBy?: string;
  internalNotes?: string;
  publishedReviewId?: string;
}

// ============================================================================
// PAYMENT SETTINGS (Global Razorpay Configuration)
// ============================================================================

export interface RazorpaySettings extends BaseDocument {
  // Razorpay API Keys
  keyId: string; // Razorpay API Key ID (public)
  keySecret: string; // Razorpay API Key Secret (encrypted in production)
  
  // Webhook Configuration
  webhookUrl: string; // Webhook URL for payment notifications
  webhookSecret: string; // Webhook signature secret for verification
  
  // Status
  isActive: boolean; // Enable/disable Razorpay payments globally
  lastConfiguredAt: Timestamp;
  configuredBy: string; // Admin user ID
}

// ============================================================================
// PAYMENTS COLLECTION (Razorpay payment records)
// ============================================================================

export interface Payment extends BaseDocument {
  // References
  bookingId: string;
  packageId: string;
  userId: string;

  // Amount
  amount: number; // In smallest currency unit (paise for INR)
  currency: string; // "INR"
  amountPaid?: number;
  amountDue?: number;

  // Razorpay Details
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // Status
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  paymentMethod?: string; // 'card', 'netbanking', 'upi', etc.

  // Advance Payment
  isAdvancePayment: boolean;
  advancePercentage?: number;
  advanceAmount?: number;

  // Add-ons Breakdown
  addOnsAmount?: number;
  addOnsDetails?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;

  // Metadata
  notes?: string;
  receiptUrl?: string;
  webhookVerified: boolean;

  // Dates
  paymentAttemptedAt?: Timestamp;
  paymentCompletedAt?: Timestamp;
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
  name: string;
  country: string;
  continent?: string;
  region?: string;
  description: string;
  coverImage: string;
  heroImage?: string;
  overview?: string;
  gallery?: string[];
  slug: string;
  active: boolean;
  // E4 Editorial Destination Fields
  shortDescription?: string;
  whyVisit?: string;
  locations?: string[];
  experiences?: string[];
  accommodation?: string;
  highlights?: string[];
  bestTimeToVisit?: string;
  timezone?: string;
  currency?: string;
  languageSpoken?: string[];
  visaRequirements?: string;
  bestDaysDuration?: string;
  idealDuration?: string;
  distanceFromAirport?: string;
  tagline?: string;
  mapCoordinates?: { latitude: number; longitude: number };
  rainfall?: number;
  averageTemperature?: DestinationClimate;
  // Legacy / Direct SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // E34 SEO & Public Discovery
  seo?: ContentSEO;
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
// LEADS COLLECTION (Download CTA phone capture)
// ============================================================================

export interface Lead extends BaseDocument {
  phone: string;
  packageId?: string;
  packageTitle?: string;
  source: 'download_cta';
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

// ============================================================================
// CUSTOMER STORIES / TRAVELLER JOURNEYS (E13)
// ============================================================================

export type CustomerStoryDisplayMode = 'FULL_NAME' | 'FIRST_NAME' | 'ANONYMOUS';

export type CustomerStoryStatus = 'DRAFT' | 'PUBLISHED';

export interface CustomerStory {
  id: string;

  title: string;
  slug: string;

  excerpt?: string;
  storyContent: string;

  coverImage?: string;
  gallery?: string[];

  // Customer & Privacy Controls
  customerName?: string;
  customerDisplayMode: CustomerStoryDisplayMode;
  customerLocation?: string;
  customerPhoto?: string;
  customerReference?: string;
  customerId?: string;

  // Linked References
  destination?: string;
  destinationSlug?: string;
  destinationId?: string;
  bookingId?: string;
  itineraryId?: string;
  itinerarySlug?: string;
  itineraryTitle?: string;
  tripTitle?: string;

  // Metadata & Content
  travelDate?: string;
  tripDuration?: string;
  duration?: string;
  travellerCount?: number;
  travelStyle?: string[];
  customerQuote?: string;
  quote?: string;
  story?: string;
  shortTitle?: string;
  highlights?: string[];
  experiences?: string[];
  authorLabel?: string;
  author?: any;

  // Publishing Controls
  status: CustomerStoryStatus;
  featured?: boolean;
  displayOrder?: number;

  publishedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  updatedBy?: string;

  // Legacy / Direct SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  // E34 SEO & Public Discovery
  seo?: ContentSEO;
}

