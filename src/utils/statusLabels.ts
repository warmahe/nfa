/**
 * Human-friendly travel-agency status labels & error sanitization helpers.
 */

// ENQUIRY STATUS
export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  IN_DISCUSSION: 'In discussion',
  CUSTOMIZATION: 'Journey being customized',
  PROPOSAL_SENT: 'Proposal sent',
  READY_TO_BOOK: 'Ready to book',
  CONVERTED: 'Booked',
  CLOSED: 'Closed',
};

// ENQUIRY STATUS EXPLANATIONS (CUSTOMER-SAFE)
export const ENQUIRY_STATUS_EXPLANATIONS: Record<string, string> = {
  NEW: "We've received your travel request and our team is reviewing your ideas.",
  CONTACTED: "Our travel team has contacted you to explore your travel plans.",
  IN_DISCUSSION: "We're actively discussing and refining your travel plans with you.",
  CUSTOMIZATION: "Your journey is being tailored around your specific dates and preferences.",
  PROPOSAL_SENT: "Your custom travel proposal and recommended stays have been prepared.",
  READY_TO_BOOK: "Your bespoke journey is ready to be confirmed at your pace.",
  CONVERTED: "Your travel request is now an official confirmed booking.",
  CLOSED: "This travel request has been completed or closed.",
};

// BOOKING STATUS
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_CONFIRMATION: 'Awaiting confirmation',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
};

// PROPOSAL STATUS
export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  NOT_PREPARED: 'Not prepared',
  PREPARING: 'Being prepared',
  READY: 'Ready',
  SENT: 'Sent',
};

// OPERATIONAL STATUS
export const OPERATIONAL_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Not started',
  IN_PREPARATION: 'In preparation',
  READY: 'Ready',
  TRAVELLER_BRIEFED: 'Traveller briefed',
  TRIP_IN_PROGRESS: 'Trip in progress',
  TRIP_COMPLETED: 'Trip completed',
};

// PRIORITY LABELS
export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const formatEnquiryStatus = (status?: string): string => {
  if (!status) return 'New';
  return ENQUIRY_STATUS_LABELS[status] || status;
};

export const formatBookingStatus = (status?: string): string => {
  if (!status) return 'Draft';
  return BOOKING_STATUS_LABELS[status] || status;
};

export const formatProposalStatus = (status?: string): string => {
  if (!status) return 'Not prepared';
  return PROPOSAL_STATUS_LABELS[status] || status;
};

export const formatOperationalStatus = (status?: string): string => {
  if (!status) return 'Not started';
  return OPERATIONAL_STATUS_LABELS[status] || status;
};

export const formatPriority = (priority?: string): string => {
  if (!priority) return 'Normal';
  return PRIORITY_LABELS[priority] || priority;
};

/**
 * Intercepts technical Firebase / system error objects and returns human-friendly copy.
 */
export const sanitizeErrorMessage = (error: any, fallbackMessage: string = "Something went wrong. Please try again."): string => {
  if (!error) return fallbackMessage;

  const msg = typeof error === 'string' ? error : error?.message || error?.code || '';
  const lower = msg.toLowerCase();

  if (lower.includes('permission-denied') || lower.includes('unauthorized') || lower.includes('permission denied')) {
    return "You don't have access to this information.";
  }
  if (lower.includes('not-found') || lower.includes('not found')) {
    return "This information is no longer available.";
  }
  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('unavailable') || lower.includes('offline')) {
    return "We couldn't load this information. Please check your internet connection and try again.";
  }
  if (lower.includes('storage')) {
    return "We couldn't open this document. Please try again.";
  }
  if (lower.includes('invalid credentials') || lower.includes('auth/invalid-credential') || lower.includes('wrong-password') || lower.includes('user-not-found')) {
    return "Invalid email or password. Please try again.";
  }

  // If message contains technical terms like Firestore, Firebase, collection, payload, mutation, exception, etc.
  if (
    lower.includes('firestore') ||
    lower.includes('firebase') ||
    lower.includes('collection') ||
    lower.includes('payload') ||
    lower.includes('mutation') ||
    lower.includes('exception') ||
    lower.includes('api error')
  ) {
    return fallbackMessage;
  }

  // Return non-technical error string or fallback
  return msg && msg.length < 100 && !msg.includes('Error:') ? msg : fallbackMessage;
};
