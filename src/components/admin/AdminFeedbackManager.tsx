import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Eye,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Archive,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  Compass,
  FileText,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import {
  Booking,
  BookingFeedback,
  FeedbackStatus,
  CustomerDocument,
  Review,
  Package,
  Destination,
} from '../../types/database';
import { useAdminDialog } from './AdminDialogContext';
import { TravellerReviewCard } from '../reviews/TravellerReviewCard';

interface AdminFeedbackManagerProps {
  bookings: Booking[];
  customers: CustomerDocument[];
  packages?: Package[];
  destinations?: Destination[];
  initialFilter?: string;
  onNavigateTab?: (tab: string, params?: any) => void;
}

export const AdminFeedbackManager: React.FC<AdminFeedbackManagerProps> = ({
  bookings,
  customers,
  packages = [],
  destinations = [],
  initialFilter = 'ALL',
  onNavigateTab,
}) => {
  const { confirm, toast } = useAdminDialog();

  // Filters and Selection State
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [savingAction, setSavingAction] = useState<boolean>(false);
  const [adminNotes, setAdminNotes] = useState<string>('');

  // E47 Public Social Proof Placement State
  const [globalReviews, setGlobalReviews] = useState<Review[]>([]);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editTestimonial, setEditTestimonial] = useState<string>('');
  const [editFeatured, setEditFeatured] = useState<boolean>(false);
  const [editDisplayOrder, setEditDisplayOrder] = useState<number>(10);
  const [editDestination, setEditDestination] = useState<string>('');
  const [editDestinationSlug, setEditDestinationSlug] = useState<string>('');
  const [editItineraryTitle, setEditItineraryTitle] = useState<string>('');
  const [editItinerarySlug, setEditItinerarySlug] = useState<string>('');
  const [editTravelYear, setEditTravelYear] = useState<number>(new Date().getFullYear());
  const [previewModalReview, setPreviewModalReview] = useState<Review | null>(null);

  // Subscribe to canonical global_reviews
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'global_reviews'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Review[];
        setGlobalReviews(list);
      },
      (err) => console.error('Error fetching global_reviews in admin feedback manager:', err)
    );
    return () => unsub();
  }, []);

  // Extract all bookings with feedback
  const feedbackItems = useMemo(() => {
    return bookings
      .filter((b) => !!b.feedback && b.feedback.submitted)
      .map((b) => {
        const cust = customers.find((c) => c.id === b.customerId || c.userId === b.userId);
        const fb = b.feedback!;
        const needsAttention =
          fb.overallRating <= 2 ||
          fb.wouldRecommend === 'NO' ||
          fb.wouldRecommend === false ||
          (!!fb.improvements && fb.improvements.trim().length > 30);
        const isPositive = fb.overallRating >= 4;

        const linkedReview = globalReviews.find(
          (r) =>
            (fb.publishedReviewId && r.id === fb.publishedReviewId) ||
            (r.bookingReference && r.bookingReference === (b.bookingReference || b.id))
        );

        return {
          booking: b,
          feedback: fb,
          customer: cust,
          needsAttention,
          isPositive,
          linkedReview,
        };
      });
  }, [bookings, customers, globalReviews]);

  // Derive KPIs
  const kpis = useMemo(() => {
    const total = feedbackItems.length;
    const awaitingReview = feedbackItems.filter(
      (item) => item.feedback.status === 'SUBMITTED' || !item.feedback.status
    ).length;
    const published = feedbackItems.filter(
      (item) => item.feedback.status === 'PUBLISHED'
    ).length;
    const needsAttentionCount = feedbackItems.filter((item) => item.needsAttention).length;

    const totalRatingsSum = feedbackItems.reduce(
      (sum, item) => sum + (item.feedback.overallRating || 0),
      0
    );
    const avgRating = total > 0 ? (totalRatingsSum / total).toFixed(1) : '—';

    return {
      total,
      awaitingReview,
      published,
      needsAttentionCount,
      avgRating,
    };
  }, [feedbackItems]);

  // Filter and Search
  const filteredItems = useMemo(() => {
    return feedbackItems.filter((item) => {
      const fb = item.feedback;
      const b = item.booking;
      const cust = item.customer;

      // Status filter
      if (statusFilter === 'AWAITING_REVIEW') {
        if (fb.status !== 'SUBMITTED' && fb.status !== undefined) return false;
      } else if (statusFilter === 'POSITIVE') {
        if (!item.isPositive) return false;
      } else if (statusFilter === 'NEEDS_ATTENTION') {
        if (!item.needsAttention) return false;
      } else if (statusFilter === 'PUBLISHED') {
        if (fb.status !== 'PUBLISHED') return false;
      } else if (statusFilter === 'ARCHIVED') {
        if (fb.status !== 'ARCHIVED') return false;
      }

      // Rating filter
      if (ratingFilter !== 'ALL') {
        const targetRating = parseInt(ratingFilter, 10);
        if (fb.overallRating !== targetRating) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const travellerName = `${b.primaryTraveler?.firstName || ''} ${b.primaryTraveler?.lastName || ''} ${cust?.name || ''}`.toLowerCase();
        const journey = (b.itineraryTitle || '').toLowerCase();
        const dest = (b.destination || '').toLowerCase();
        const ref = (b.bookingReference || b.id || '').toLowerCase();
        const custRef = (cust?.customerReference || '').toLowerCase();

        if (
          !travellerName.includes(q) &&
          !journey.includes(q) &&
          !dest.includes(q) &&
          !ref.includes(q) &&
          !custRef.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [feedbackItems, statusFilter, ratingFilter, searchQuery]);

  const handleOpenDrawer = (booking: Booking) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.feedback?.internalNotes || '');

    // Resolve linked review if already published
    const fb = booking.feedback!;
    const linkedReview = globalReviews.find(
      (r) =>
        (fb.publishedReviewId && r.id === fb.publishedReviewId) ||
        (r.bookingReference && r.bookingReference === (booking.bookingReference || booking.id))
    );

    // Derive display name
    let defaultDisplayName = fb.publicDisplayName || 'First Name';
    if (defaultDisplayName === 'Full Name') {
      defaultDisplayName = `${booking.primaryTraveler?.firstName || 'Explorer'} ${booking.primaryTraveler?.lastName || ''}`.trim();
    } else if (defaultDisplayName === 'First Name') {
      defaultDisplayName = booking.primaryTraveler?.firstName || 'Verified Explorer';
    } else if (defaultDisplayName === 'Anonymous') {
      defaultDisplayName = 'Verified Explorer';
    }

    setEditDisplayName(linkedReview?.travelerName || defaultDisplayName);
    setEditTestimonial(linkedReview?.content || fb.testimonialText || fb.likedMost || '');
    setEditFeatured(Boolean(linkedReview?.featured));
    setEditDisplayOrder(linkedReview?.displayOrder ?? 10);

    // Resolve destination & journey
    const dest = linkedReview?.destination || booking.destination || '';
    const matchedDest = destinations.find((d) => d.name.toLowerCase() === dest.toLowerCase() || d.slug === dest.toLowerCase());
    setEditDestination(dest);
    setEditDestinationSlug(linkedReview?.destinationSlug || matchedDest?.slug || dest.toLowerCase().replace(/\s+/g, '-'));

    const jTitle = linkedReview?.itineraryTitle || booking.itineraryTitle || '';
    const matchedPkg = packages.find((p) => p.id === booking.itineraryId || p.slug === booking.itineraryId || p.title === jTitle);
    setEditItineraryTitle(jTitle);
    setEditItinerarySlug(linkedReview?.itinerarySlug || matchedPkg?.slug || booking.itineraryId || '');

    const tYear = linkedReview?.travelYear
      ? Number(linkedReview.travelYear)
      : booking.travelDate
      ? new Date(booking.travelDate).getFullYear()
      : new Date().getFullYear();
    setEditTravelYear(tYear);
  };

  const handleCloseDrawer = () => {
    setSelectedBooking(null);
    setAdminNotes('');
  };

  // Action: Mark as Reviewed
  const handleMarkAsReviewed = async () => {
    if (!selectedBooking) return;
    setSavingAction(true);
    try {
      const bRef = doc(db, 'bookings', selectedBooking.id);
      const updatedFeedback: BookingFeedback = {
        ...selectedBooking.feedback!,
        status: 'REVIEWED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin',
        internalNotes: adminNotes,
      };

      await updateDoc(bRef, {
        feedback: updatedFeedback,
        updatedAt: serverTimestamp(),
      });

      toast('Feedback marked as reviewed.', 'success');
      setSelectedBooking({
        ...selectedBooking,
        feedback: updatedFeedback,
      });
    } catch (err: any) {
      console.error(err);
      toast('Failed to update status: ' + err.message, 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Approve & Publish Public Review
  const handleApprovePublication = async () => {
    if (!selectedBooking || !selectedBooking.feedback) return;
    const fb = selectedBooking.feedback;

    if (!fb.publicConsent) {
      toast('Traveller did not give consent for public publication.', 'error');
      return;
    }
    if (!editTestimonial.trim()) {
      toast('Public review requires testimonial text to publish.', 'error');
      return;
    }

    setSavingAction(true);
    try {
      let reviewId = fb.publishedReviewId;
      const reviewPayload: Partial<Review> = {
        travelerName: editDisplayName.trim() || 'Verified Explorer',
        role: editDestination ? `Explorer (${editDestination})` : 'Verified Explorer',
        content: editTestimonial.trim(),
        rating: fb.overallRating || 5,
        approved: true,
        featured: editFeatured,
        displayOrder: Number(editDisplayOrder) || 10,
        bookingId: selectedBooking.id,
        bookingReference: selectedBooking.bookingReference || selectedBooking.id,
        customerId: selectedBooking.customerId,
        itineraryId: selectedBooking.itineraryId || selectedBooking.packageId,
        itineraryTitle: editItineraryTitle.trim(),
        itinerarySlug: editItinerarySlug.trim(),
        destination: editDestination.trim(),
        destinationSlug: editDestinationSlug.trim(),
        travelDate: selectedBooking.travelDate,
        travelYear: editTravelYear,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        source: 'TRAVELLER_FEEDBACK',
        updatedAt: serverTimestamp() as any,
      };

      if (!reviewId) {
        const reviewDoc = await addDoc(collection(db, 'global_reviews'), {
          ...reviewPayload,
          createdAt: serverTimestamp(),
        });
        reviewId = reviewDoc.id;
      } else {
        await updateDoc(doc(db, 'global_reviews', reviewId), reviewPayload);
      }

      // Update booking document feedback
      const updatedFeedback: BookingFeedback = {
        ...fb,
        status: 'PUBLISHED',
        publishedReviewId: reviewId,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Admin',
        internalNotes: adminNotes,
      };

      await updateDoc(doc(db, 'bookings', selectedBooking.id), {
        feedback: updatedFeedback,
        updatedAt: serverTimestamp(),
      });

      toast('Feedback approved and published as public review.', 'success');
      setSelectedBooking({
        ...selectedBooking,
        feedback: updatedFeedback,
      });
    } catch (err: any) {
      console.error(err);
      toast('Failed to publish review: ' + err.message, 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Save Placement Changes to existing review
  const handleSavePlacementChanges = async () => {
    if (!selectedBooking?.feedback?.publishedReviewId) {
      handleApprovePublication();
      return;
    }

    setSavingAction(true);
    try {
      const reviewId = selectedBooking.feedback.publishedReviewId;
      await updateDoc(doc(db, 'global_reviews', reviewId), {
        travelerName: editDisplayName.trim() || 'Verified Explorer',
        content: editTestimonial.trim(),
        featured: editFeatured,
        displayOrder: Number(editDisplayOrder) || 10,
        itineraryTitle: editItineraryTitle.trim(),
        itinerarySlug: editItinerarySlug.trim(),
        destination: editDestination.trim(),
        destinationSlug: editDestinationSlug.trim(),
        travelYear: editTravelYear,
        status: 'PUBLISHED',
        approved: true,
        updatedAt: serverTimestamp(),
      });

      toast('Public review placement settings updated.', 'success');
    } catch (err: any) {
      console.error(err);
      toast('Failed to update placement: ' + err.message, 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Action: Unpublish / Archive Review
  const handleUnpublishReview = async () => {
    if (!selectedBooking || !selectedBooking.feedback) return;
    confirm({
      title: 'Unpublish / Archive Review',
      message:
        'This will immediately remove this review from all public pages. Are you sure?',
      confirmText: 'Unpublish Review',
      type: 'danger',
      onConfirm: async () => {
        setSavingAction(true);
        try {
          if (selectedBooking.feedback?.publishedReviewId) {
            await updateDoc(
              doc(db, 'global_reviews', selectedBooking.feedback.publishedReviewId),
              {
                status: 'ARCHIVED',
                approved: false,
                updatedAt: serverTimestamp(),
              }
            );
          }

          const updatedFeedback: BookingFeedback = {
            ...selectedBooking.feedback!,
            status: 'ARCHIVED',
            reviewedAt: new Date().toISOString(),
            reviewedBy: 'Admin',
            internalNotes: adminNotes,
          };

          await updateDoc(doc(db, 'bookings', selectedBooking.id), {
            feedback: updatedFeedback,
            updatedAt: serverTimestamp(),
          });

          toast('Review unpublished and moved to archived status.', 'success');
          setSelectedBooking({
            ...selectedBooking,
            feedback: updatedFeedback,
          });
        } catch (err) {
          console.error('Error archiving review:', err);
          toast('Failed to archive review.', 'error');
        } finally {
          setSavingAction(false);
        }
      },
    });
  };

  // Open Preview Modal
  const handleOpenPreview = () => {
    if (!selectedBooking || !selectedBooking.feedback) return;
    const fb = selectedBooking.feedback;

    const mockReview: Review = {
      id: fb.publishedReviewId || 'preview-id',
      travelerName: editDisplayName.trim() || 'Verified Explorer',
      role: editDestination ? `Explorer (${editDestination})` : 'Verified Explorer',
      content: editTestimonial.trim() || fb.testimonialText || fb.likedMost || 'An extraordinary journey.',
      rating: fb.overallRating || 5,
      approved: true,
      featured: editFeatured,
      displayOrder: editDisplayOrder,
      destination: editDestination.trim(),
      destinationSlug: editDestinationSlug.trim(),
      itineraryTitle: editItineraryTitle.trim(),
      itinerarySlug: editItinerarySlug.trim(),
      travelYear: editTravelYear,
      status: 'PUBLISHED',
      createdAt: null as any,
      updatedAt: null as any,
    };

    setPreviewModalReview(mockReview);
  };

  // Status badge renderer
  const renderStatusBadge = (status?: FeedbackStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded">
            <Sparkles size={11} className="text-emerald-700" /> PUBLISHED
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded">
            <Check size={11} className="text-blue-700" /> REVIEWED
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 rounded">
            <Archive size={11} className="text-slate-500" /> ARCHIVED
          </span>
        );
      case 'SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded">
            <Clock size={11} className="text-amber-700" /> AWAITING REVIEW
          </span>
        );
    }
  };

  const renderRecommendationBadge = (rec?: 'YES' | 'NOT_SURE' | 'NO' | boolean) => {
    if (rec === 'YES' || rec === true) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <ThumbsUp size={12} className="text-emerald-600" /> RECOMMENDS NFA
        </span>
      );
    }
    if (rec === 'NO' || rec === false) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
          <ThumbsDown size={12} className="text-rose-600" /> DOES NOT RECOMMEND
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
        <HelpCircle size={12} className="text-slate-400" /> UNSURE
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── 1. HEADER & KPI METRICS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9E1B1D]">
            POST-TRIP INSIGHT & SOCIAL PROOF
          </span>
          <h2 className="font-brand font-black text-2xl uppercase tracking-tight text-slate-900 flex items-center gap-2 mt-0.5">
            <Star size={22} className="text-[#F4BF4B] fill-[#F4BF4B]" />
            TRAVELLER FEEDBACK & REVIEWS
          </h2>
        </div>

        {/* Link to Public Reviews Page */}
        <a
          href="/reviews"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-colors shadow-xs w-fit cursor-pointer"
        >
          <Globe size={14} className="text-[#9E1B1D]" /> VIEW PUBLIC REVIEWS PAGE <ExternalLink size={12} />
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Feedback
          </span>
          <p className="font-black text-2xl text-slate-900 mt-1">{kpis.total}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Received from travellers</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Awaiting Review
          </span>
          <p className="font-black text-2xl text-amber-900 mt-1">{kpis.awaitingReview}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Pending moderation</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Published Reviews
          </span>
          <p className="font-black text-2xl text-emerald-800 mt-1">{kpis.published}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Live on public pages</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            Needs Attention
          </span>
          <p className="font-black text-2xl text-rose-800 mt-1">{kpis.needsAttentionCount}</p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Low rating or issue</p>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Average Rating
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="font-black text-2xl text-slate-900">{kpis.avgRating}</p>
            {kpis.avgRating !== '—' && <Star size={18} className="text-[#F4BF4B] fill-[#F4BF4B]" />}
          </div>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Calculated score</p>
        </div>
      </div>

      {/* ── 2. CONTROLS, SEARCH & FILTERS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'All Feedback' },
            { id: 'AWAITING_REVIEW', label: `Awaiting Review (${kpis.awaitingReview})` },
            { id: 'POSITIVE', label: 'Positive (4-5★)' },
            { id: 'NEEDS_ATTENTION', label: `Needs Attention (${kpis.needsAttentionCount})` },
            { id: 'PUBLISHED', label: `Published (${kpis.published})` },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-[#F4BF4B]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rating and Search */}
        <div className="flex items-center gap-2">
          {/* Star Filter Dropdown */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-600"
            />
          </div>
        </div>
      </div>

      {/* ── 3. FEEDBACK TABLE / QUEUE ── */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-3">
          <Star size={36} className="mx-auto text-slate-300" />
          <h3 className="font-brand font-black text-base uppercase text-slate-700">
            No Feedback Found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || ratingFilter !== 'ALL'
              ? 'No feedback entries match your current search or filter criteria.'
              : 'Feedback submitted by travellers after completing journeys will appear here for review and social proof moderation.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Traveller & Journey</th>
                  <th className="py-3.5 px-4">Overall Rating</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-4">Submitted Quote & Consent</th>
                  <th className="py-3.5 px-4">Status & Placement</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(({ booking, feedback, customer, needsAttention, isPositive, linkedReview }) => {
                  const travellerName = `${booking.primaryTraveler?.firstName || 'Traveller'} ${booking.primaryTraveler?.lastName || ''}`.trim();

                  return (
                    <tr
                      key={booking.id}
                      onClick={() => handleOpenDrawer(booking)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Traveller & Journey */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-[#9E1B1D] transition-colors">
                            {travellerName}
                          </span>
                          {customer?.isReturning && (
                            <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                              RETURNING
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {booking.itineraryTitle || booking.destination || 'Expedition'} &bull; Ref:{' '}
                          <span className="font-mono">{booking.bookingReference || booking.id}</span>
                        </p>
                      </td>

                      {/* Overall Rating */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i < feedback.overallRating
                                  ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="font-bold text-slate-800 ml-1">
                            {feedback.overallRating}.0
                          </span>
                        </div>
                      </td>

                      {/* Recommendation */}
                      <td className="py-4 px-4">
                        {renderRecommendationBadge(feedback.wouldRecommend)}
                      </td>

                      {/* Testimonial Quote & Consent */}
                      <td className="py-4 px-4 max-w-xs space-y-1">
                        <p className="text-slate-700 italic line-clamp-2">
                          "{feedback.testimonialText || feedback.likedMost || 'No written reflection'}"
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>
                            Consent: <strong className={feedback.publicConsent ? 'text-emerald-700' : 'text-slate-500'}>{feedback.publicConsent ? 'Yes' : 'No'}</strong>
                          </span>
                          {feedback.publicDisplayName && (
                            <span>&bull; Display: <strong>{feedback.publicDisplayName}</strong></span>
                          )}
                        </div>
                      </td>

                      {/* Status & Placement */}
                      <td className="py-4 px-4 space-y-1">
                        <div>{renderStatusBadge(feedback.status)}</div>
                        {linkedReview?.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Sparkles size={10} /> Featured Hero (Order {linkedReview.displayOrder ?? 10})
                          </span>
                        )}
                        {needsAttention && (
                          <span className="inline-block text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Needs Attention
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(booking);
                          }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-800 font-bold text-[10px] uppercase rounded-lg hover:bg-slate-900 hover:text-[#F4BF4B] transition-colors cursor-pointer"
                        >
                          Review & Placement &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. REVIEW DRAWER (WITH SOCIAL PROOF PLACEMENT CONTROLS) ── */}
      {selectedBooking && selectedBooking.feedback && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase text-[#F4BF4B] tracking-widest block">
                  TRAVELLER FEEDBACK & REVIEW DETAILS
                </span>
                <h3 className="font-brand font-black text-xl uppercase tracking-tight text-white mt-0.5">
                  {selectedBooking.primaryTraveler?.firstName} {selectedBooking.primaryTraveler?.lastName}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {selectedBooking.itineraryTitle || selectedBooking.destination} &bull; Ref: {selectedBooking.bookingReference || selectedBooking.id}
                </p>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs">
              
              {/* Status Banner */}
              <div className="p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 block">
                    CURRENT STATUS
                  </span>
                  <div className="pt-1">{renderStatusBadge(selectedBooking.feedback.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Submitted Date
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedBooking.feedback.submittedAt
                      ? new Date(selectedBooking.feedback.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Overall Rating & Recommendation */}
              <div className="p-5 bg-white border-2 border-[#121212] rounded-xl space-y-3 shadow-xs">
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                  OVERALL EXPERIENCE
                </span>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={`${
                            i < selectedBooking.feedback!.overallRating
                              ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-brand font-black text-lg text-slate-900 ml-2">
                      {selectedBooking.feedback.overallRating} / 5 Stars
                    </span>
                  </div>

                  {renderRecommendationBadge(selectedBooking.feedback.wouldRecommend)}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  DETAILED CATEGORY RATINGS
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Journey Planning
                    </span>
                    <div className="flex items-center gap-1 text-[#F4BF4B]">
                      {Array.from({ length: selectedBooking.feedback.journeyRating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-[#F4BF4B]" />
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Accommodations
                    </span>
                    <div className="flex items-center gap-1 text-[#F4BF4B]">
                      {Array.from({ length: selectedBooking.feedback.accommodationRating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-[#F4BF4B]" />
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Experiences & Activities
                    </span>
                    <div className="flex items-center gap-1 text-[#F4BF4B]">
                      {Array.from({ length: selectedBooking.feedback.experienceRating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-[#F4BF4B]" />
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Travel Team & Guides
                    </span>
                    <div className="flex items-center gap-1 text-[#F4BF4B]">
                      {Array.from({ length: selectedBooking.feedback.travelTeamRating || 5 }).map((_, i) => (
                        <Star key={i} size={14} className="fill-[#F4BF4B]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Written Responses */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                    WHAT THEY ENJOYED MOST
                  </span>
                  <div className="p-4 bg-[#FCFBF7] border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium">
                    {selectedBooking.feedback.likedMost || 'No written response provided.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                    WHAT COULD WE IMPROVE
                  </span>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium">
                    {selectedBooking.feedback.improvements || 'No suggestions provided.'}
                  </div>
                </div>
              </div>

              {/* ── E47 PUBLIC REVIEW PLACEMENT & MODERATION CONTROLS ── */}
              <div className="p-5 bg-amber-50/50 border-2 border-amber-300 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9E1B1D] block">
                      E47 SOCIAL PROOF MANAGEMENT
                    </span>
                    <h4 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
                      <Globe size={15} className="text-[#9E1B1D]" /> PUBLIC REVIEW CONTROLS
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="px-3 py-1.5 bg-slate-900 text-[#F4BF4B] font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} /> PREVIEW REVIEW
                  </button>
                </div>

                {/* Public Consent Status Alert */}
                <div className="flex items-center gap-3 p-3 bg-white border border-amber-200 rounded-xl">
                  <span className="text-xs font-bold text-slate-700 flex-1">
                    Traveller Public Consent:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded font-black text-[10px] uppercase ${
                      selectedBooking.feedback.publicConsent
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {selectedBooking.feedback.publicConsent ? 'GRANTED' : 'NOT GIVEN'}
                  </span>
                </div>

                {/* Display Name Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase block">
                    Public Display Name Attribution
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="e.g. Hemanth or Verified Explorer"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 italic">
                    This is the only name shown publicly. Email, phone, and booking ID will NEVER be exposed.
                  </p>
                </div>

                {/* Testimonial Content Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase block">
                    Public Testimonial Quote
                  </label>
                  <textarea
                    rows={3}
                    value={editTestimonial}
                    onChange={(e) => setEditTestimonial(e.target.value)}
                    placeholder="Approved testimonial text to be displayed across the website..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-900"
                  />
                </div>

                {/* Placement Options: Featured & Display Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase block">
                      Feature on Hero / Highlights
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={editFeatured}
                        onChange={(e) => setEditFeatured(e.target.checked)}
                        className="size-4 accent-[#9E1B1D] rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Mark as Featured Review
                      </span>
                    </label>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase block">
                      Display Order Priority
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editDisplayOrder}
                        onChange={(e) => setEditDisplayOrder(parseInt(e.target.value, 10) || 10)}
                        className="w-20 p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setEditDisplayOrder(Math.max(1, editDisplayOrder - 1))}
                        className="p-1.5 bg-slate-100 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Move Higher Priority"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditDisplayOrder(editDisplayOrder + 1)}
                        className="p-1.5 bg-slate-100 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Move Lower Priority"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Journey & Destination Relationships */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase block">
                      Associated Destination
                    </label>
                    <input
                      type="text"
                      value={editDestination}
                      onChange={(e) => setEditDestination(e.target.value)}
                      placeholder="e.g. Italy"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase block">
                      Associated Journey
                    </label>
                    <input
                      type="text"
                      value={editItineraryTitle}
                      onChange={(e) => setEditItineraryTitle(e.target.value)}
                      placeholder="e.g. Italian Lakes & Alps"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Review Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider block">
                  INTERNAL ADMIN NOTES
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record any internal observations, guide follow-ups, or story notes..."
                  rows={3}
                  className="w-full p-3.5 bg-[#FCFBF7] border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#121212]"
                />
              </div>

              {/* Story Opportunity Callout */}
              {selectedBooking.feedback.overallRating >= 4 && (
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-brand font-black text-xs uppercase text-purple-950 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-600" /> CUSTOMER STORY OPPORTUNITY
                    </span>
                    <p className="text-[11px] text-purple-800 font-medium">
                      This traveller shared high praise. Would you like to craft a featured editorial narrative?
                    </p>
                  </div>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('CUSTOMER_STORIES')}
                      className="px-3.5 py-2 bg-purple-900 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-purple-800 transition-colors shrink-0 cursor-pointer"
                    >
                      Create Story
                    </button>
                  )}
                </div>
              )}

              {/* Needs Attention Follow-up Callout */}
              {(selectedBooking.feedback.overallRating <= 2 || selectedBooking.feedback.wouldRecommend === 'NO') && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-brand font-black text-xs uppercase text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-[#9E1B1D]" /> MANUAL FOLLOW-UP RECOMMENDED
                    </span>
                    <p className="text-[11px] text-rose-800 font-medium">
                      Negative or cautionary feedback received. Connect with the traveller via Communications.
                    </p>
                  </div>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('COMMUNICATIONS')}
                      className="px-3.5 py-2 bg-[#9E1B1D] text-white font-bold text-[10px] uppercase rounded-lg hover:bg-rose-900 transition-colors shrink-0 cursor-pointer"
                    >
                      Open Comms
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={handleUnpublishReview}
                disabled={savingAction}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs uppercase rounded-xl hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Archive size={14} /> Unpublish / Archive
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkAsReviewed}
                  disabled={savingAction}
                  className="px-5 py-2.5 bg-white border-2 border-[#121212] text-[#121212] font-black text-xs uppercase rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={14} /> Mark Reviewed
                </button>

                {selectedBooking.feedback.publicConsent && (
                  <button
                    onClick={
                      selectedBooking.feedback.status === 'PUBLISHED'
                        ? handleSavePlacementChanges
                        : handleApprovePublication
                    }
                    disabled={savingAction}
                    className="px-6 py-2.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    {selectedBooking.feedback.status === 'PUBLISHED'
                      ? 'Update Placement Settings'
                      : 'Approve & Publish Review'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. PUBLIC REVIEW PREVIEW MODAL (E47) ── */}
      {previewModalReview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FCFBF7] rounded-2xl max-w-xl w-full border-4 border-[#121212] shadow-2xl p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9E1B1D] block">
                  PUBLIC PREVIEW
                </span>
                <h3 className="font-brand font-black text-lg uppercase text-slate-900">
                  How Review Appears to Visitors
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalReview(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Render Public Card Component */}
            <div className="py-2">
              <TravellerReviewCard review={previewModalReview} />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 italic">
                * Private fields (emails, phones, notes, booking IDs) are never shown.
              </p>
              <button
                onClick={() => setPreviewModalReview(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
