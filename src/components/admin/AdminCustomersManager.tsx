import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Users,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  UserCheck,
  Edit3,
  Save,
  ChevronRight,
  ShieldCheck,
  History,
  FileText,
  MapPin,
  Heart,
  BookOpen,
  Sparkles,
  Download,
  ArrowRight,
  User,
  Check,
  Globe,
  Tag,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react';
import { db, subscribeToCustomers, updateCustomerProfile } from '../../services/firebaseService';
import {
  CustomerDocument,
  EnquiryDocument,
  Booking,
  Package,
  CustomerStory,
  BookingDocument,
} from '../../types/database';
import { useEnquiry } from '../../context/EnquiryContext';
import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_STATUS_EXPLANATIONS,
  BOOKING_STATUS_LABELS,
} from '../../utils/statusLabels';

interface AdminCustomersManagerProps {
  onOpenEnquiry?: (enquiry: EnquiryDocument) => void;
  onOpenBooking?: (booking: Booking) => void;
  onOpenPreparation?: (booking: Booking) => void;
  onOpenStory?: (storyId?: string) => void;
  onOpenCommunication?: () => void;
  initialSelectedCustomerId?: string;
  initialStatusFilter?: string;
}

type DrawerTab =
  | 'profile'
  | 'preferences'
  | 'communication'
  | 'enquiries'
  | 'bookings'
  | 'upcoming'
  | 'history'
  | 'feedback'
  | 'documents'
  | 'stories'
  | 'activity';

export const AdminCustomersManager: React.FC<AdminCustomersManagerProps> = ({
  onOpenEnquiry,
  onOpenBooking,
  onOpenPreparation,
  onOpenStory,
  onOpenCommunication,
  initialSelectedCustomerId,
  initialStatusFilter,
}) => {
  const { openEnquiry } = useEnquiry();

  // ── State ──
  const [customers, setCustomers] = useState<CustomerDocument[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // ── Selected Customer (Customer 360 Drawer) ──
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDocument | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('profile');

  // ── Search & Filter ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'enquiries'>('newest');

  // Update statusFilter if initialStatusFilter changes
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // ── Editing State ──
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    phone: string;
    address: string;
    preferredTravelStyle: string[];
    accommodationPreference: string;
    dietaryPreferences: string;
    accessibilityPreferences: string;
    interests: string;
  }>({
    name: '',
    phone: '',
    address: '',
    preferredTravelStyle: [],
    accommodationPreference: '',
    dietaryPreferences: '',
    accessibilityPreferences: '',
    interests: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // 1. Realtime Listeners
  useEffect(() => {
    setLoading(true);

    const unsubCustomers = subscribeToCustomers(
      (data) => {
        setCustomers(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers.');
        setLoading(false);
      }
    );

    const unsubEnquiries = onSnapshot(
      collection(db, 'Enquiries'),
      (snapshot) => {
        const loaded = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as EnquiryDocument)
        );
        setEnquiries(loaded);
      },
      (err) => console.error('Error fetching enquiries:', err)
    );

    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const loaded = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Booking)
        );
        setBookings(loaded);
      },
      (err) => console.error('Error fetching bookings:', err)
    );

    const unsubPackages = onSnapshot(
      collection(db, 'packages'),
      (snapshot) => {
        const loaded = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Package)
        );
        setPackages(loaded);
      },
      (err) => console.error('Error fetching packages:', err)
    );

    const unsubStories = onSnapshot(
      collection(db, 'customerStories'),
      (snapshot) => {
        const loaded = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CustomerStory)
        );
        setStories(loaded);
      },
      (err) => console.error('Error fetching stories:', err)
    );

    return () => {
      unsubCustomers();
      unsubEnquiries();
      unsubBookings();
      unsubPackages();
      unsubStories();
    };
  }, []);

  // 2. Map packages for quick lookup
  const packagesMap = useMemo(() => {
    const map: Record<string, Package> = {};
    packages.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [packages]);

  // 3. Auto-select customer if requested by ID (Global Search / deep-link)
  useEffect(() => {
    if (initialSelectedCustomerId && customers.length > 0) {
      const found = customers.find(
        (c) =>
          c.id === initialSelectedCustomerId ||
          c.customerId === initialSelectedCustomerId ||
          c.userId === initialSelectedCustomerId ||
          c.customerReference === initialSelectedCustomerId
      );
      if (found) {
        setSelectedCustomer(found);
      }
    }
  }, [initialSelectedCustomerId, customers]);

  // 4. Sync Edit Form when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setEditFormData({
        name: selectedCustomer.name || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || '',
        preferredTravelStyle: Array.isArray(selectedCustomer.preferences?.preferredTravelStyle)
          ? selectedCustomer.preferences.preferredTravelStyle
          : Array.isArray(selectedCustomer.preferences?.travelStyle)
          ? selectedCustomer.preferences.travelStyle
          : selectedCustomer.preferences?.preferredTravelStyle
          ? [selectedCustomer.preferences.preferredTravelStyle]
          : [],
        accommodationPreference:
          selectedCustomer.preferences?.accommodationPreference ||
          selectedCustomer.preferences?.accommodationType ||
          '',
        dietaryPreferences: selectedCustomer.preferences?.dietary || '',
        accessibilityPreferences: selectedCustomer.preferences?.accessibility || '',
        interests: selectedCustomer.preferences?.notes || '',
      });
      setIsEditingProfile(false);
    }
  }, [selectedCustomer]);

  // Helper: Derive Relationship Status for any Customer
  const getCustomerRelationship = (c: CustomerDocument) => {
    const cId = c.customerId || c.id;
    const cEmail = c.email?.toLowerCase().trim();

    const cBookings = bookings.filter((b) => {
      if (
        b.customerId &&
        (b.customerId === cId ||
          b.customerId === c.userId ||
          b.customerId === c.customerReference)
      )
        return true;
      if (b.userId && c.userId && b.userId === c.userId) return true;
      if (cEmail && b.primaryTraveler?.email?.toLowerCase() === cEmail) return true;
      return false;
    });

    const cEnquiries = enquiries.filter((e) => {
      if (e.customerId && (e.customerId === cId || e.customerId === c.id)) return true;
      if (e.traveller?.userId && c.userId && e.traveller.userId === c.userId) return true;
      if (cEmail && e.traveller?.email?.toLowerCase() === cEmail) return true;
      return false;
    });

    const completed = cBookings.filter(
      (b) =>
        b.status === 'COMPLETED' ||
        b.bookingStatus === 'COMPLETED' ||
        b.bookingStatus === 'completed' ||
        b.operationalStatus === 'TRIP_COMPLETED'
    );
    const upcoming = cBookings.filter(
      (b) =>
        b.status !== 'COMPLETED' &&
        b.bookingStatus !== 'completed' &&
        b.status !== 'CANCELLED' &&
        b.bookingStatus !== 'cancelled'
    );
    const confirmed = upcoming.filter(
      (b) => b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed'
    );

    const activeEnq = cEnquiries.filter(
      (e) => e.status !== 'CLOSED' && e.status !== 'CONVERTED'
    );
    const planningEnq = activeEnq.filter((e) =>
      ['IN_DISCUSSION', 'CUSTOMIZATION', 'PROPOSAL_SENT', 'READY_TO_BOOK'].includes(e.status)
    );

    if (completed.length > 0) {
      return {
        key: 'RETURNING_TRAVELLERS',
        label: 'RETURNING TRAVELLER',
        badge: 'bg-purple-100 text-purple-900 border-purple-300',
        completedCount: completed.length,
        upcomingCount: upcoming.length,
        activeEnqCount: activeEnq.length,
        totalEnqCount: cEnquiries.length,
      };
    }
    if (confirmed.length > 0) {
      return {
        key: 'BOOKED_TRAVELLERS',
        label: 'BOOKED TRAVELLER',
        badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        completedCount: 0,
        upcomingCount: upcoming.length,
        activeEnqCount: activeEnq.length,
        totalEnqCount: cEnquiries.length,
      };
    }
    if (planningEnq.length > 0) {
      return {
        key: 'JOURNEY_PLANNING',
        label: 'JOURNEY PLANNING',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        completedCount: 0,
        upcomingCount: 0,
        activeEnqCount: activeEnq.length,
        totalEnqCount: cEnquiries.length,
      };
    }
    if (activeEnq.length > 0) {
      return {
        key: 'ACTIVE_ENQUIRIES',
        label: 'ACTIVE ENQUIRY',
        badge: 'bg-blue-100 text-blue-900 border-blue-300',
        completedCount: 0,
        upcomingCount: 0,
        activeEnqCount: activeEnq.length,
        totalEnqCount: cEnquiries.length,
      };
    }
    return {
      key: 'NEW_TRAVELLERS',
      label: 'NEW TRAVELLER',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      completedCount: 0,
      upcomingCount: 0,
      activeEnqCount: 0,
      totalEnqCount: cEnquiries.length,
    };
  };

  // ── Counts for Filters ──
  const filterCounts = useMemo(() => {
    const counts = {
      ALL: customers.length,
      RETURNING_TRAVELLERS: 0,
      BOOKED_TRAVELLERS: 0,
      JOURNEY_PLANNING: 0,
      ACTIVE_ENQUIRIES: 0,
      NEW_TRAVELLERS: 0,
    };

    customers.forEach((c) => {
      const rel = getCustomerRelationship(c);
      if (counts[rel.key as keyof typeof counts] !== undefined) {
        counts[rel.key as keyof typeof counts]++;
      }
    });

    return counts;
  }, [customers, bookings, enquiries]);

  // ── Selected Customer Relationship & Context Intelligence ──
  const customerEnquiries = useMemo(() => {
    if (!selectedCustomer) return [];
    const cId = selectedCustomer.customerId || selectedCustomer.id;
    const cEmail = selectedCustomer.email?.toLowerCase().trim();

    return enquiries
      .filter((e) => {
        if (e.customerId && (e.customerId === cId || e.customerId === selectedCustomer.id))
          return true;
        if (e.traveller?.userId && selectedCustomer.userId && e.traveller.userId === selectedCustomer.userId)
          return true;
        if (cEmail && e.traveller?.email?.toLowerCase() === cEmail)
          return true;
        return false;
      })
      .sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis
          ? (a.createdAt as any).toMillis()
          : new Date((a.createdAt as any) || 0).getTime();
        const timeB = (b.createdAt as any)?.toMillis
          ? (b.createdAt as any).toMillis()
          : new Date((b.createdAt as any) || 0).getTime();
        return timeB - timeA;
      });
  }, [selectedCustomer, enquiries]);

  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    const cId = selectedCustomer.customerId || selectedCustomer.id;
    const cEmail = selectedCustomer.email?.toLowerCase().trim();

    return bookings
      .filter((b) => {
        if (
          b.customerId &&
          (b.customerId === cId ||
            b.customerId === selectedCustomer.userId ||
            b.customerId === selectedCustomer.customerReference)
        )
          return true;
        if (
          b.userId &&
          selectedCustomer.userId &&
          b.userId === selectedCustomer.userId
        )
          return true;
        if (
          cEmail &&
          b.primaryTraveler?.email?.toLowerCase() === cEmail
        )
          return true;
        return false;
      })
      .sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis
          ? (a.createdAt as any).toMillis()
          : new Date((a.createdAt as any) || 0).getTime();
        const timeB = (b.createdAt as any)?.toMillis
          ? (b.createdAt as any).toMillis()
          : new Date((b.createdAt as any) || 0).getTime();
        return timeB - timeA;
      });
  }, [selectedCustomer, bookings]);

  const activeEnquiries = useMemo(() => {
    return customerEnquiries.filter(
      (e) => e.status !== 'CLOSED' && e.status !== 'CONVERTED'
    );
  }, [customerEnquiries]);

  const pastEnquiries = useMemo(() => {
    return customerEnquiries.filter(
      (e) => e.status === 'CLOSED' || e.status === 'CONVERTED'
    );
  }, [customerEnquiries]);

  const upcomingBookings = useMemo(() => {
    return customerBookings.filter(
      (b) =>
        b.status !== 'COMPLETED' &&
        b.bookingStatus !== 'completed' &&
        b.status !== 'CANCELLED' &&
        b.bookingStatus !== 'cancelled'
    );
  }, [customerBookings]);

  const completedBookings = useMemo(() => {
    return customerBookings.filter(
      (b) =>
        b.status === 'COMPLETED' ||
        b.bookingStatus === 'COMPLETED' ||
        b.bookingStatus === 'completed' ||
        b.operationalStatus === 'TRIP_COMPLETED'
    );
  }, [customerBookings]);

  const customerFeedbackList = useMemo(() => {
    return customerBookings.filter((b) => !!b.feedback && b.feedback.submitted);
  }, [customerBookings]);

  const customerStoriesList = useMemo(() => {
    if (!selectedCustomer) return [];
    const cId = selectedCustomer.customerId || selectedCustomer.id;
    const cName = (selectedCustomer.name || '').toLowerCase().trim();
    const cRef = selectedCustomer.customerReference;

    return stories.filter((s) => {
      if (s.customerId && s.customerId === cId) return true;
      if (s.customerReference && s.customerReference === cRef) return true;
      if (cName && (s.customerName || '').toLowerCase().trim() === cName)
        return true;
      if (
        s.bookingId &&
        customerBookings.some((b) => b.id === s.bookingId || b.bookingReference === s.bookingId)
      )
        return true;
      return false;
    });
  }, [selectedCustomer, stories, customerBookings]);

  const publishedStoriesList = useMemo(() => {
    return customerStoriesList.filter((s) => s.status === 'PUBLISHED');
  }, [customerStoriesList]);

  // Current Relationship
  const selectedRelationship = useMemo(() => {
    if (!selectedCustomer) return null;
    return getCustomerRelationship(selectedCustomer);
  }, [selectedCustomer, bookings, enquiries]);

  // Derived Historical Preferences from Past Bookings (Snapshots)
  const pastPreferencesSummary = useMemo(() => {
    if (completedBookings.length === 0) return null;

    const stylesSet = new Set<string>();
    const staysSet = new Set<string>();
    const dietarySet = new Set<string>();
    const accessSet = new Set<string>();
    const interestsSet = new Set<string>();

    completedBookings.forEach((b) => {
      if (b.travelPreferences?.accommodation) staysSet.add(b.travelPreferences.accommodation);
      if (b.travelPreferences?.dietary) dietarySet.add(b.travelPreferences.dietary);
      if (b.travelPreferences?.accessibility) accessSet.add(b.travelPreferences.accessibility);
      if (b.travelPreferences?.interests) interestsSet.add(b.travelPreferences.interests);
    });

    return {
      stays: Array.from(staysSet),
      dietary: Array.from(dietarySet),
      accessibility: Array.from(accessSet),
      interests: Array.from(interestsSet),
      tripCount: completedBookings.length,
    };
  }, [completedBookings]);

  // Deterministic Journey Suggestions for Returning Travellers (Max 3)
  const ideasForNextJourney = useMemo(() => {
    if (!packages.length || !selectedCustomer || completedBookings.length === 0) return [];

    const pastDestinations = completedBookings.map((b) => (b.destination || '').toLowerCase());
    const pastPkgIds = completedBookings.map((b) => b.itineraryId || b.packageId).filter(Boolean);
    const rawPref = selectedCustomer.preferences?.preferredTravelStyle || selectedCustomer.preferences?.travelStyle || [];
    const preferredStyles = (Array.isArray(rawPref) ? rawPref : [rawPref]).map((s) => String(s).toLowerCase());

    const published = packages.filter(
      (p) => (p as any).published !== false && (p as any).status !== 'DRAFT'
    );

    // Filter out already taken packages
    const candidates = published.filter((p) => {
      if (pastPkgIds.includes(p.id)) return false;
      return true;
    });

    return candidates
      .sort((a, b) => {
        // Prioritize different destination
        const aDiffDest = !pastDestinations.includes((a.destination || '').toLowerCase()) ? 1 : 0;
        const bDiffDest = !pastDestinations.includes((b.destination || '').toLowerCase()) ? 1 : 0;
        if (aDiffDest !== bDiffDest) return bDiffDest - aDiffDest;

        // Prioritize style match
        const aStyleStr = (Array.isArray(a.travelStyle) ? a.travelStyle.join(' ') : a.travelStyle || a.style || '').toLowerCase();
        const bStyleStr = (Array.isArray(b.travelStyle) ? b.travelStyle.join(' ') : b.travelStyle || b.style || '').toLowerCase();
        const aStyleMatch = preferredStyles.some((s) => aStyleStr.includes(s)) ? 1 : 0;
        const bStyleMatch = preferredStyles.some((s) => bStyleStr.includes(s)) ? 1 : 0;
        return bStyleMatch - aStyleMatch;
      })
      .slice(0, 3);
  }, [packages, selectedCustomer, completedBookings]);

  // Traveller-Visible Documents with Package PDF fallback
  const customerDocuments = useMemo(() => {
    const list: Array<{
      booking: Booking;
      doc: BookingDocument | null;
      pkgPdfUrl?: string;
    }> = [];

    customerBookings.forEach((b) => {
      const visibleDocs = (b.documents || []).filter(
        (d) => d.visibleToTraveller !== false
      );
      const linkedPkg = packagesMap[b.itineraryId || b.packageId || ''];
      const hasItinerary = visibleDocs.some((d) => d.category === 'ITINERARY');

      visibleDocs.forEach((d) => list.push({ booking: b, doc: d }));
      if (!hasItinerary && linkedPkg?.itineraryPDF) {
        list.push({ booking: b, doc: null, pkgPdfUrl: linkedPkg.itineraryPDF });
      }
    });

    return list;
  }, [customerBookings, packagesMap]);

  // Current Travel Context Banner: Prioritized (Upcoming -> Active Lead -> Recent Completed -> None)
  const currentTravelContext = useMemo(() => {
    const upcomingConfirmed = upcomingBookings.find(
      (b) => b.status === 'CONFIRMED' || b.bookingStatus === 'confirmed'
    );
    if (upcomingConfirmed) {
      return {
        type: 'BOOKING' as const,
        title: upcomingConfirmed.itineraryTitle || upcomingConfirmed.destination || 'Expedition Journey',
        destination: upcomingConfirmed.destination || 'Global',
        date: upcomingConfirmed.travelDate || 'Confirmed Date',
        status: 'CONFIRMED',
        statusLabel: 'Confirmed Expedition',
        reference: upcomingConfirmed.bookingReference || upcomingConfirmed.id,
        rawBooking: upcomingConfirmed,
      };
    }

    const latestActiveEnquiry = activeEnquiries[0];
    if (latestActiveEnquiry) {
      return {
        type: 'ENQUIRY' as const,
        title: latestActiveEnquiry.itineraryTitle || latestActiveEnquiry.destination || 'Custom Journey Request',
        destination: latestActiveEnquiry.destination || 'Global',
        date: latestActiveEnquiry.travelDate || 'Dates in Discussion',
        status: latestActiveEnquiry.status,
        statusLabel: ENQUIRY_STATUS_LABELS[latestActiveEnquiry.status] || latestActiveEnquiry.status,
        reference: latestActiveEnquiry.enquiryReference || latestActiveEnquiry.id,
        rawEnquiry: latestActiveEnquiry,
      };
    }

    const recentCompleted = completedBookings[0];
    if (recentCompleted) {
      const linkedStory = publishedStoriesList.find(
        (s) =>
          s.bookingId === recentCompleted.id ||
          s.bookingId === recentCompleted.bookingReference
      );
      return {
        type: 'COMPLETED' as const,
        title: recentCompleted.itineraryTitle || recentCompleted.destination || 'Completed Expedition',
        destination: recentCompleted.destination || 'Global',
        date: recentCompleted.travelDate || 'Travelled',
        status: 'COMPLETED',
        statusLabel: 'Completed Expedition',
        reference: recentCompleted.bookingReference || recentCompleted.id,
        rawBooking: recentCompleted,
        linkedStory,
      };
    }

    return null;
  }, [upcomingBookings, activeEnquiries, completedBookings, publishedStoriesList]);

  // Next Scheduled Follow-up
  const nextFollowUp = useMemo(() => {
    const enqWithFollowUp = customerEnquiries.find(
      (e) => e.followUpAt && e.status !== 'CLOSED' && e.status !== 'CONVERTED'
    );
    return enqWithFollowUp || null;
  }, [customerEnquiries]);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const rel = getCustomerRelationship(c);

        if (statusFilter === 'RETURNING_TRAVELLERS' && rel.key !== 'RETURNING_TRAVELLERS') return false;
        if (statusFilter === 'BOOKED_TRAVELLERS' && rel.key !== 'BOOKED_TRAVELLERS') return false;
        if (statusFilter === 'JOURNEY_PLANNING' && rel.key !== 'JOURNEY_PLANNING') return false;
        if (statusFilter === 'ACTIVE_ENQUIRIES' && rel.key !== 'ACTIVE_ENQUIRIES') return false;
        if (statusFilter === 'NEW_TRAVELLERS' && rel.key !== 'NEW_TRAVELLERS') return false;
        if (statusFilter === 'HAS_ACTIVE_ENQUIRY' && rel.activeEnqCount === 0) return false;
        if (statusFilter === 'CONVERTED' && rel.key !== 'BOOKED_TRAVELLERS' && rel.key !== 'RETURNING_TRAVELLERS') return false;
        if (statusFilter === 'NO_ACTIVE' && rel.activeEnqCount > 0) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = c.name?.toLowerCase().includes(q);
          const matchEmail = c.email?.toLowerCase().includes(q);
          const matchPhone = c.phone?.toLowerCase().includes(q);
          const matchRef = c.customerReference?.toLowerCase().includes(q);

          if (!matchName && !matchEmail && !matchPhone && !matchRef) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'enquiries') {
          return (b.totalEnquiries || 0) - (a.totalEnquiries || 0);
        }

        const timeA = (a.createdAt as any)?.toMillis
          ? (a.createdAt as any).toMillis()
          : new Date((a.createdAt as any) || 0).getTime();
        const timeB = (b.createdAt as any)?.toMillis
          ? (b.createdAt as any).toMillis()
          : new Date((b.createdAt as any) || 0).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [customers, bookings, enquiries, searchQuery, statusFilter, sortOrder]);

  // Handlers
  const handleSaveProfile = async () => {
    if (!selectedCustomer?.id && !selectedCustomer?.customerId) return;
    const targetId = selectedCustomer.id || selectedCustomer.customerId;

    setSavingProfile(true);
    setError(null);

    try {
      await updateDoc(doc(db, 'customers', targetId), {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
        preferences: {
          ...(selectedCustomer.preferences || {}),
          preferredTravelStyle: editFormData.preferredTravelStyle,
          accommodationPreference: editFormData.accommodationPreference,
          accommodationType: editFormData.accommodationPreference,
          dietary: editFormData.dietaryPreferences.trim(),
          accessibility: editFormData.accessibilityPreferences.trim(),
          notes: editFormData.interests.trim(),
        },
        updatedAt: serverTimestamp(),
      });

      setActionSuccess('Customer profile updated successfully.');
      setIsEditingProfile(false);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving customer profile:', err);
      setError('Unable to save customer details. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (ts: any): string => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Safe WhatsApp Link Generator (E45)
  const buildCustomerWhatsAppUrl = (customer: CustomerDocument): string => {
    const phone = customer.phone?.replace(/\D/g, '') || '';
    if (!phone) return '';

    const isReturning = completedBookings.length > 0;
    let message = '';
    if (isReturning) {
      message = `Hello ${customer.name || 'Traveller'}, this is the NO FIXED ADDRESS travel team. We wanted to check if you're considering another journey and would be happy to help.`;
    } else {
      const ref = customer.customerReference || 'NFA-TRAVEL';
      message = `Hello ${customer.name || 'Explorer'}, this is the NO FIXED ADDRESS travel team regarding your account (${ref}). How can we assist with your travel plans today?`;
    }
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  };

  // Plan Another Journey Trigger (E45)
  const handlePlanRepeatJourney = (dest?: string, style?: string) => {
    if (!selectedCustomer) return;
    openEnquiry({
      source: 'ADMIN_CUSTOMER_360',
      destination: dest || completedBookings[0]?.destination,
      itineraryTitle: style ? `${style} Journey` : undefined,
    });
  };

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      {/* Toast Alerts */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-center justify-between rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs font-bold flex items-center justify-between rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-700 underline text-[10px] font-black uppercase cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">
              Customer 360 & Traveller Relationship Workspace
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live • Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Understand returning travellers, past travel preferences, upcoming journeys, and continue repeat conversations.
          </p>
        </div>
      </div>

      {/* Relationship Filter Navigation Bar (E45) */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'ALL', label: 'All Travellers', count: filterCounts.ALL },
          { id: 'RETURNING_TRAVELLERS', label: 'Returning Travellers', count: filterCounts.RETURNING_TRAVELLERS, color: 'text-purple-900 bg-purple-100 border-purple-300' },
          { id: 'BOOKED_TRAVELLERS', label: 'Booked Travellers', count: filterCounts.BOOKED_TRAVELLERS, color: 'text-emerald-900 bg-emerald-100 border-emerald-300' },
          { id: 'JOURNEY_PLANNING', label: 'Journey Planning', count: filterCounts.JOURNEY_PLANNING, color: 'text-amber-900 bg-amber-100 border-amber-300' },
          { id: 'ACTIVE_ENQUIRIES', label: 'Active Enquiries', count: filterCounts.ACTIVE_ENQUIRIES, color: 'text-blue-900 bg-blue-100 border-blue-300' },
          { id: 'NEW_TRAVELLERS', label: 'New Travellers', count: filterCounts.NEW_TRAVELLERS, color: 'text-slate-700 bg-slate-100 border-slate-300' },
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setStatusFilter(pill.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center gap-2 cursor-pointer ${
              statusFilter === pill.id
                ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{pill.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === pill.id
                  ? 'bg-white/20 text-white'
                  : pill.color || 'bg-slate-100 text-slate-600'
              }`}
            >
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Customer Name, Email, Phone, or Customer Ref (NFA-C-XXXXX)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="newest">&darr; Newest First</option>
              <option value="oldest">&uarr; Oldest First</option>
              <option value="enquiries">Most Enquiries</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer List / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="animate-spin text-slate-400 mx-auto" size={28} />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Loading travellers...
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-slate-200 p-8">
          <div className="size-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users size={28} />
          </div>
          <div>
            <h4 className="font-brand font-black text-lg uppercase text-slate-800">
              No Customers Found
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
              No customer profiles match your search criteria. Customers are created automatically when travellers submit an enquiry.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Customer Ref</th>
                    <th className="py-3.5 px-4">Relationship</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Enquiries</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCustomers.map((customer) => {
                    const rel = getCustomerRelationship(customer);
                    const waUrl = buildCustomerWhatsAppUrl(customer);

                    return (
                      <tr
                        key={customer.id || customer.customerId}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {customer.customerReference || 'NFA-C-PENDING'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded font-black text-[9px] uppercase tracking-wider border ${rel.badge}`}
                          >
                            {rel.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {customer.name || 'Valued Traveller'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {customer.email || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {customer.phone || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {customer.totalEnquiries || 0}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDate(customer.updatedAt || customer.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded inline-block transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="px-3 py-1 bg-slate-900 text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Customer 360 &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => {
              const rel = getCustomerRelationship(customer);
              return (
                <div
                  key={customer.id || customer.customerId}
                  onClick={() => setSelectedCustomer(customer)}
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {customer.customerReference || 'NFA-C-PENDING'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border ${rel.badge}`}
                    >
                      {rel.label}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {customer.name || 'Valued Traveller'}
                    </h4>
                    <p className="text-xs text-slate-500">{customer.email || 'No email'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Enquiries: <strong>{customer.totalEnquiries || 0}</strong></span>
                    <span className="font-bold text-slate-900 text-[10px] uppercase flex items-center gap-1">
                      View 360 <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── CUSTOMER 360 SLIDE-OVER DRAWER (E38 + E45) ── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 text-left">
            {/* Drawer Header */}
            <div className="p-6 bg-[#121212] text-white flex items-start justify-between border-b-4 border-[#F4BF4B]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#F4BF4B] bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                    {selectedCustomer.customerReference || 'NFA-C-PENDING'}
                  </span>
                  {selectedRelationship && (
                    <span
                      className={`px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border ${selectedRelationship.badge}`}
                    >
                      {selectedRelationship.label}
                    </span>
                  )}
                </div>
                <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-white">
                  {selectedCustomer.name || 'Valued Traveller'}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedCustomer.email || 'No Email'} • {selectedCustomer.phone || 'No Phone'}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Relationship Stats Strip (E45) */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900 text-white border-b border-white/10 text-center">
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-[9px] font-black uppercase text-purple-400 block tracking-wider">Completed</span>
                <span className="font-brand font-black text-lg text-white">{completedBookings.length}</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-[9px] font-black uppercase text-emerald-400 block tracking-wider">Upcoming</span>
                <span className="font-brand font-black text-lg text-white">{upcomingBookings.length}</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-[9px] font-black uppercase text-amber-400 block tracking-wider">Past Enquiries</span>
                <span className="font-brand font-black text-lg text-white">{pastEnquiries.length}</span>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <span className="text-[9px] font-black uppercase text-blue-400 block tracking-wider">Active Leads</span>
                <span className="font-brand font-black text-lg text-white">{activeEnquiries.length}</span>
              </div>
            </div>

            {/* ── CURRENT TRAVEL CONTEXT BANNER (E45) ── */}
            {currentTravelContext && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                    {currentTravelContext.type === 'BOOKING'
                      ? 'YOUR NEXT JOURNEY'
                      : currentTravelContext.type === 'ENQUIRY'
                      ? 'CURRENT TRAVEL REQUEST'
                      : 'RECENT COMPLETED EXPEDITION'}
                  </span>
                  <h4 className="font-brand font-black text-sm uppercase text-slate-900">
                    {currentTravelContext.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    📍 {currentTravelContext.destination} • 🗓️ {currentTravelContext.date} • Ref: {currentTravelContext.reference}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {currentTravelContext.type === 'BOOKING' && onOpenBooking && (
                    <button
                      onClick={() => onOpenBooking(currentTravelContext.rawBooking)}
                      className="px-3 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Open Booking
                    </button>
                  )}
                  {currentTravelContext.type === 'BOOKING' && (
                    <a
                      href={`/my-journey/${currentTravelContext.rawBooking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <Eye size={12} /> Open My Journey
                    </a>
                  )}
                  {currentTravelContext.type === 'ENQUIRY' && onOpenEnquiry && (
                    <button
                      onClick={() => onOpenEnquiry(currentTravelContext.rawEnquiry)}
                      className="px-3 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Open Lead
                    </button>
                  )}
                  {currentTravelContext.type === 'COMPLETED' && (
                    <button
                      onClick={() => handlePlanRepeatJourney(currentTravelContext.destination)}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-black text-xs uppercase rounded-lg hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Compass size={12} /> Plan Another Journey
                    </button>
                  )}
                  {currentTravelContext.type === 'COMPLETED' && currentTravelContext.linkedStory && (
                    <a
                      href={`/stories/${currentTravelContext.linkedStory.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs uppercase rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <BookOpen size={12} /> View Story
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Next Scheduled Follow-up Bar (E39 / E45) */}
            {nextFollowUp && (
              <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-700 shrink-0" />
                  <span className="text-blue-900 font-bold">
                    Next Follow-up scheduled for {String(nextFollowUp.followUpAt).split('T')[0]} ({nextFollowUp.lastContactedChannel || 'WhatsApp'})
                  </span>
                </div>
                {onOpenCommunication && (
                  <button
                    onClick={onOpenCommunication}
                    className="text-[10px] font-black uppercase text-blue-800 underline hover:text-blue-950 cursor-pointer"
                  >
                    Open Communication &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Quick Contact Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3">
              {buildCustomerWhatsAppUrl(selectedCustomer) ? (
                <a
                  href={buildCustomerWhatsAppUrl(selectedCustomer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  <MessageSquare size={15} /> WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed"
                >
                  No WhatsApp
                </button>
              )}

              {selectedCustomer.email ? (
                <a
                  href={`mailto:${selectedCustomer.email}?subject=${encodeURIComponent(
                    `NO FIXED ADDRESS Travel Team — ${selectedCustomer.customerReference || ''}`
                  )}`}
                  className="p-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Mail size={15} /> Email
                </a>
              ) : (
                <button
                  disabled
                  className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed"
                >
                  No Email
                </button>
              )}

              {selectedCustomer.phone ? (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-2.5 bg-white text-slate-800 border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-xs"
                >
                  <Phone size={15} /> Call
                </a>
              ) : (
                <button
                  disabled
                  className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed"
                >
                  No Phone
                </button>
              )}
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto gap-1 pb-1 px-4 pt-2">
              {[
                { id: 'profile', label: 'Profile' },
                { id: 'preferences', label: 'Preferences' },
                { id: 'history', label: `Travel History (${completedBookings.length})` },
                { id: 'upcoming', label: `Upcoming (${upcomingBookings.length})` },
                { id: 'feedback', label: `Feedback (${customerFeedbackList.length})` },
                { id: 'enquiries', label: `Enquiries (${customerEnquiries.length})` },
                { id: 'documents', label: `Docs (${customerDocuments.length})` },
                { id: 'stories', label: `Stories (${customerStoriesList.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as DrawerTab)}
                  className={`px-3 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    drawerTab === tab.id
                      ? 'border-slate-900 text-slate-900 bg-slate-50'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── DRAWER CONTENT BODY ── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* ── TAB 1: PROFILE ── */}
              {drawerTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <UserCheck size={14} /> Traveller Identity
                    </span>
                    {!isEditingProfile ? (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} /> Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="px-3 py-1 bg-slate-900 text-amber-400 text-xs font-bold rounded flex items-center gap-1 hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                        >
                          <Save size={13} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingProfile ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {selectedCustomer.name || 'Not Provided'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Reference</span>
                        <p className="font-mono font-bold text-slate-900 text-sm">
                          {selectedCustomer.customerReference || 'NFA-C-PENDING'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {selectedCustomer.email || 'Not Provided'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {selectedCustomer.phone || 'Not Provided'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Address / Location</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {selectedCustomer.address || 'Not Provided'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Phone / WhatsApp</label>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Address / City</label>
                        <input
                          type="text"
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: PREFERENCES (CURRENT VS HISTORICAL - E45) ── */}
              {drawerTab === 'preferences' && (
                <div className="space-y-8">
                  {/* Current Preferences */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Heart size={14} className="text-[#9E1B1D]" /> CURRENT PREFERENCES
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Customer Profile</span>
                    </div>

                    <div className="space-y-3">
                      {Boolean(selectedCustomer.preferences?.preferredTravelStyle || selectedCustomer.preferences?.travelStyle) && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Travel Styles</span>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(selectedCustomer.preferences?.preferredTravelStyle)
                              ? selectedCustomer.preferences.preferredTravelStyle
                              : Array.isArray(selectedCustomer.preferences?.travelStyle)
                              ? selectedCustomer.preferences.travelStyle
                              : [selectedCustomer.preferences?.preferredTravelStyle || selectedCustomer.preferences?.travelStyle]
                            ).filter(Boolean).map((s, idx) => (
                              <span key={idx} className="bg-[#121212] text-[#F4BF4B] px-3 py-1 rounded text-xs font-bold">
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCustomer.preferences?.accommodationPreference && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Stay Preference</span>
                          <p className="text-sm font-bold text-slate-900">{selectedCustomer.preferences.accommodationPreference}</p>
                        </div>
                      )}

                      {selectedCustomer.preferences?.dietary && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Dietary Requirements</span>
                          <p className="text-sm font-bold text-slate-900">{selectedCustomer.preferences.dietary}</p>
                        </div>
                      )}

                      {selectedCustomer.preferences?.accessibility && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Accessibility</span>
                          <p className="text-sm font-bold text-slate-900">{selectedCustomer.preferences.accessibility}</p>
                        </div>
                      )}

                      {selectedCustomer.preferences?.notes && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Special Notes & Interests</span>
                          <p className="text-sm font-bold text-slate-900">{selectedCustomer.preferences.notes}</p>
                        </div>
                      )}

                      {(!selectedCustomer.preferences || Object.keys(selectedCustomer.preferences).length === 0) && (
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                          No profile preferences recorded yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Historical Preferences From Past Journeys */}
                  {pastPreferencesSummary && (
                    <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                          <History size={14} className="text-purple-700" /> FROM PAST JOURNEYS ({pastPreferencesSummary.tripCount} Completed)
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold uppercase">Immutable Booking Snapshots</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {pastPreferencesSummary.stays.length > 0 && (
                          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                            <span className="text-[9px] font-black uppercase text-purple-600 block">Past Accommodation Styles</span>
                            <p className="font-bold text-purple-950">{pastPreferencesSummary.stays.join(', ')}</p>
                          </div>
                        )}

                        {pastPreferencesSummary.dietary.length > 0 && (
                          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                            <span className="text-[9px] font-black uppercase text-purple-600 block">Past Dietary Notes</span>
                            <p className="font-bold text-purple-950">{pastPreferencesSummary.dietary.join(', ')}</p>
                          </div>
                        )}

                        {pastPreferencesSummary.accessibility.length > 0 && (
                          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                            <span className="text-[9px] font-black uppercase text-purple-600 block">Past Accessibility</span>
                            <p className="font-bold text-purple-950">{pastPreferencesSummary.accessibility.join(', ')}</p>
                          </div>
                        )}

                        {pastPreferencesSummary.interests.length > 0 && (
                          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1 sm:col-span-2">
                            <span className="text-[9px] font-black uppercase text-purple-600 block">Past Interests & Requests</span>
                            <p className="font-bold text-purple-950">{pastPreferencesSummary.interests.join(' • ')}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 italic">
                        Historical booking preferences are retained from confirmed reservations and are never overwritten by profile updates.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: TRAVEL HISTORY & IDEAS FOR NEXT JOURNEY (E44 + E45) ── */}
              {drawerTab === 'history' && (
                <div className="space-y-8">
                  {/* Completed Journeys List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <History size={14} /> Completed Journeys ({completedBookings.length})
                      </span>
                      {completedBookings.length > 0 && (
                        <button
                          onClick={() => handlePlanRepeatJourney()}
                          className="px-3 py-1 bg-emerald-600 text-white font-black text-[10px] uppercase rounded hover:bg-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Compass size={12} /> Plan Another Journey
                        </button>
                      )}
                    </div>

                    {completedBookings.length === 0 ? (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-400">
                        No Completed Journeys Yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {completedBookings.map((b) => {
                          const linkedStory = publishedStoriesList.find(
                            (s) => s.bookingId === b.id || s.bookingId === b.bookingReference
                          );

                          return (
                            <div
                              key={b.id}
                              className="p-4 bg-[#FCFBF7] border-2 border-slate-300 rounded-xl space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                                  Completed Expedition
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-500">
                                  {b.bookingReference || b.id}
                                </span>
                              </div>

                              <h4 className="font-brand font-black text-lg uppercase text-slate-900">
                                {b.itineraryTitle || b.destination}
                              </h4>

                              <p className="text-xs text-slate-600">
                                📍 {b.destination} • 🗓️ {b.travelDate} • ⏱️ {b.duration ? `${b.duration} Days` : 'Custom'} • 👥 {b.numberOfTravelers || 1} Travellers
                              </p>

                              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                                <a
                                  href={`/my-journey/${b.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
                                >
                                  <Eye size={12} /> Open Journey
                                </a>

                                {onOpenBooking && (
                                  <button
                                    onClick={() => onOpenBooking(b)}
                                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-800 font-bold text-[10px] uppercase rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                  >
                                    Open Booking
                                  </button>
                                )}

                                {linkedStory ? (
                                  <a
                                    href={`/stories/${linkedStory.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase rounded hover:bg-amber-200 transition-colors flex items-center gap-1"
                                  >
                                    <BookOpen size={12} /> View Story
                                  </a>
                                ) : (
                                  onOpenStory && (
                                    <button
                                      onClick={() => onOpenStory()}
                                      className="px-3 py-1.5 bg-amber-500 text-[#121212] font-black text-[10px] uppercase rounded hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Sparkles size={12} /> Create Customer Story
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ideas For Their Next Journey (E45 Deterministic Match) */}
                  {ideasForNextJourney.length > 0 && (
                    <div className="space-y-4 pt-4 border-t-2 border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Compass size={14} className="text-[#9E1B1D]" /> IDEAS FOR THEIR NEXT JOURNEY
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Curated Discovery</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ideasForNextJourney.map((p) => (
                          <div
                            key={p.id}
                            className="p-3.5 bg-white border-2 border-slate-200 rounded-xl space-y-2 flex flex-col justify-between hover:border-slate-400 transition-colors"
                          >
                            <div className="space-y-1.5">
                              {p.coverImage && (
                                <div className="h-24 rounded-lg overflow-hidden border border-slate-200">
                                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <span className="text-[9px] font-black uppercase text-slate-400 block">
                                📍 {p.destination} • {p.duration ? `${p.duration} Days` : ''}
                              </span>
                              <h5 className="font-brand font-black text-sm uppercase text-slate-900 line-clamp-2">
                                {p.title}
                              </h5>
                              {p.travelStyle && (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                                  {p.travelStyle}
                                </span>
                              )}
                            </div>

                            <a
                              href={`/itinerary/${p.slug || p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center py-1.5 bg-[#121212] text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 mt-2"
                            >
                              View Journey <ExternalLink size={10} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 4: UPCOMING BOOKINGS ── */}
              {drawerTab === 'upcoming' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Upcoming Confirmed & Active Journeys ({upcomingBookings.length})
                    </span>
                  </div>

                  {upcomingBookings.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-400">
                      No Upcoming Journeys
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-4 bg-white border-2 border-emerald-300 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              {b.status || b.bookingStatus || 'CONFIRMED'}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {b.bookingReference || b.id}
                            </span>
                          </div>

                          <h4 className="font-brand font-black text-lg uppercase text-slate-900">
                            {b.itineraryTitle || b.destination}
                          </h4>

                          <p className="text-xs text-slate-600">
                            📍 {b.destination} • 🗓️ {b.travelDate} • 👥 {b.numberOfTravelers || 1} Travellers
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            {onOpenBooking && (
                              <button
                                onClick={() => onOpenBooking(b)}
                                className="px-3 py-1 bg-[#121212] text-[#F4BF4B] font-bold text-xs uppercase rounded hover:bg-slate-800 cursor-pointer"
                              >
                                Manage Booking
                              </button>
                            )}
                            {onOpenPreparation && (
                              <button
                                onClick={() => onOpenPreparation(b)}
                                className="px-3 py-1 bg-blue-600 text-white font-bold text-xs uppercase rounded hover:bg-blue-500 cursor-pointer"
                              >
                                Trip Prep
                              </button>
                            )}
                            <a
                              href={`/my-journey/${b.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase rounded hover:bg-slate-50 flex items-center gap-1"
                            >
                              <Eye size={12} /> Traveller View
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 5: ENQUIRIES ── */}
              {drawerTab === 'enquiries' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Enquiry History ({customerEnquiries.length})
                    </span>
                  </div>

                  {customerEnquiries.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-400">
                      No Enquiries Recorded
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerEnquiries.map((e) => (
                        <div
                          key={e.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                              {ENQUIRY_STATUS_LABELS[e.status] || e.status}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {e.enquiryReference || e.id}
                            </span>
                          </div>

                          <h5 className="font-brand font-black text-sm uppercase text-slate-900">
                            {e.itineraryTitle || e.destination || 'Custom Request'}
                          </h5>

                          <p className="text-xs text-slate-600">
                            Travel: {e.travelDate || 'TBD'} &bull; Group: {e.groupSize || 1} &bull; Received: {formatDate(e.createdAt)}
                          </p>

                          {onOpenEnquiry && (
                            <div className="pt-2 border-t border-slate-200 flex justify-end">
                              <button
                                onClick={() => onOpenEnquiry(e)}
                                className="px-3 py-1 bg-slate-900 text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 cursor-pointer"
                              >
                                View in Workflow &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 6: DOCUMENTS ── */}
              {drawerTab === 'documents' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Traveller-Visible Documents ({customerDocuments.length})
                    </span>
                  </div>

                  {customerDocuments.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-400">
                      No Documents Available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerDocuments.map(({ booking, doc: d, pkgPdfUrl }, idx) => (
                        <div
                          key={d ? d.id : `doc-${booking.id}-${idx}`}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-10 bg-[#9E1B1D] text-white rounded flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-900">
                                {d ? d.title : 'Itinerary PDF'}
                              </h5>
                              <p className="text-[10px] text-slate-500">
                                {d ? d.category || 'Document' : 'Official Itinerary PDF'} &bull; Ref: {booking.bookingReference || booking.id}
                              </p>
                            </div>
                          </div>

                          <a
                            href={d ? d.fileUrl : pkgPdfUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-900 text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 7: CUSTOMER STORIES ── */}
              {drawerTab === 'stories' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Linked Customer Stories ({customerStoriesList.length})
                    </span>
                    {onOpenStory && (
                      <button
                        onClick={() => onOpenStory()}
                        className="px-3 py-1 bg-slate-900 text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 cursor-pointer"
                      >
                        + Create Story
                      </button>
                    )}
                  </div>

                  {customerStoriesList.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold uppercase text-slate-400">
                      No Customer Stories Linked
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerStoriesList.map((story) => (
                        <div
                          key={story.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                story.status === 'PUBLISHED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {story.status}
                            </span>
                            <h5 className="font-bold text-xs text-slate-900 uppercase">
                              {story.title}
                            </h5>
                            <p className="text-[10px] text-slate-500">
                              Slug: /stories/{story.slug} &bull; Author: {story.author || 'NO FIXED ADDRESS'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {story.status === 'PUBLISHED' && (
                              <a
                                href={`/stories/${story.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] uppercase rounded hover:bg-amber-200 flex items-center gap-1"
                              >
                                <BookOpen size={12} /> View Story
                              </a>
                            )}
                            {onOpenStory && (
                              <button
                                onClick={() => onOpenStory(story.id)}
                                className="px-3 py-1 bg-slate-900 text-[#F4BF4B] font-bold text-[10px] uppercase rounded hover:bg-slate-800 cursor-pointer"
                              >
                                Edit Story
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 8: TRAVELLER FEEDBACK & REVIEWS (E46) ── */}
              {drawerTab === 'feedback' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Traveller Reflections & Reviews ({customerFeedbackList.length})
                    </span>
                  </div>

                  {customerFeedbackList.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
                      <Star size={28} className="mx-auto text-slate-300" />
                      <p className="text-xs font-bold uppercase text-slate-400">
                        No Feedback Submitted Yet
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Feedback is collected from travellers upon expedition completion via their private journey center.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerFeedbackList.map((booking) => {
                        const fb = booking.feedback!;
                        const isStoryCandidate = fb.overallRating >= 4;

                        return (
                          <div
                            key={booking.id}
                            className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                              <div>
                                <span className="font-bold text-xs text-slate-900 uppercase">
                                  {booking.itineraryTitle || booking.destination || 'Expedition'}
                                </span>
                                <p className="text-[10px] text-slate-500">
                                  Travel: {booking.travelDate || 'Completed'} &bull; Ref: {booking.bookingReference || booking.id}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded border ${
                                    fb.status === 'PUBLISHED'
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : fb.status === 'REVIEWED'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                                      : 'bg-amber-100 text-amber-900 border-amber-300'
                                  }`}
                                >
                                  {fb.status || 'SUBMITTED'}
                                </span>
                              </div>
                            </div>

                            {/* Overall Rating & Recommendation */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      size={16}
                                      className={
                                        i < fb.overallRating
                                          ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                                          : 'text-slate-300'
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-xs text-slate-900 ml-1">
                                  {fb.overallRating} / 5 Stars
                                </span>
                              </div>

                              {fb.wouldRecommend === 'YES' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  <ThumbsUp size={10} /> Recommends NO FIXED ADDRESS
                                </span>
                              )}
                              {fb.wouldRecommend === 'NO' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                                  <ThumbsDown size={10} /> Does Not Recommend
                                </span>
                              )}
                            </div>

                            {/* Written Comments */}
                            {fb.likedMost && (
                              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                                <span className="text-[10px] font-black uppercase text-emerald-800 block">
                                  What They Enjoyed Most:
                                </span>
                                <p className="text-slate-700 italic leading-relaxed">
                                  "{fb.likedMost}"
                                </p>
                              </div>
                            )}

                            {fb.improvements && (
                              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-500 block">
                                  Improvement Suggestions:
                                </span>
                                <p className="text-slate-700 italic leading-relaxed">
                                  "{fb.improvements}"
                                </p>
                              </div>
                            )}

                            {fb.testimonialText && (
                              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
                                <span className="text-[10px] font-black uppercase text-[#9E1B1D] block">
                                  Public Testimonial Quote:
                                </span>
                                <p className="text-slate-800 italic leading-relaxed">
                                  "{fb.testimonialText}"
                                </p>
                                <span className="text-[10px] text-slate-500 font-medium block pt-1">
                                  Consent: <strong>{fb.publicConsent ? 'Yes' : 'No'}</strong> &bull; Display: <strong>{fb.publicDisplayName || 'First Name'}</strong>
                                </span>
                              </div>
                            )}

                            {/* Public Review Live Status Card (E47) */}
                            {fb.status === 'PUBLISHED' && (
                              <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                                    <Globe size={12} className="text-emerald-700" /> LIVE PUBLIC REVIEW
                                  </span>
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                                    PUBLISHED
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-700">
                                  Attribution: <strong>{fb.publicDisplayName || 'Verified Explorer'}</strong> &bull; Rated: <strong>{fb.overallRating}★</strong>
                                </p>
                                <div className="flex items-center gap-2 pt-1 border-t border-emerald-200">
                                  <a
                                    href="/reviews"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold uppercase text-emerald-800 hover:underline inline-flex items-center gap-1"
                                  >
                                    View on Reviews Page <ExternalLink size={10} />
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Story Candidate Action */}
                            {isStoryCandidate && onOpenStory && (
                              <div className="pt-2 border-t border-slate-200 flex justify-end">
                                <button
                                  onClick={() => onOpenStory()}
                                  className="px-3 py-1.5 bg-purple-900 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Sparkles size={12} /> Craft Customer Story &rarr;
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
