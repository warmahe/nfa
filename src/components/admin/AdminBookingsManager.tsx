import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  addDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Search,
  Filter,
  Calendar,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Compass,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
  Tag,
  Sparkles,
  ChevronRight,
  UserCheck,
  UserPlus,
  Send,
  FileText,
  History,
  AlertTriangle,
  Download,
  DollarSign,
  SlidersHorizontal,
  ChevronDown,
  Upload,
  Pencil,
  Plus,
  Save,
  Loader2,
  Star,
} from 'lucide-react';
import {
  db,
  updateDocument,
  deleteDocument,
  useAuth,
  addInternalNote,
  subscribeToInternalNotes,
  addEnquiryActivity,
  subscribeToEnquiryActivities,
  uploadBookingDocument,
  deleteBookingDocumentFile,
} from '../../services/firebaseService';
import { BookingDocument, BookingDocumentCategory } from '../../types/database';
interface AdminBookingsManagerProps {
  onOpenEnquiry?: (enquiryId: string) => void;
  onOpenCustomer?: (customerId: string) => void;
  onOpenCommunication?: () => void;
}

export const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = ({
  onOpenEnquiry,
  onOpenCustomer,
  onOpenCommunication,
}) => {
  const { user } = useAuth();
  const currentAdminName = user?.displayName || user?.email?.split('@')[0] || 'Admin Staff';
  const currentAdminId = user?.uid || 'admin_user';

  // ── Unified Navigation Section: Enquiries/Leads vs Direct Bookings ──
  const [activeSection, setActiveSection] = useState<'leads' | 'bookings'>('leads');

  // ── Selected Booking Drawer (E7) ──
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ── Realtime Data States ──
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  // ── Lead Management Workspace States ──
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryDocument | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // ── Subcollections (Notes & Activities for selected lead) ──
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [activities, setActivities] = useState<EnquiryActivity[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'workspace' | 'notes' | 'timeline'>('workspace');
  const [showUnsavedNoteWarning, setShowUnsavedNoteWarning] = useState(false);

  // ── Lead Form States ──
  const [editingFollowUp, setEditingFollowUp] = useState('');
  const [editingNextAction, setEditingNextAction] = useState('');
  const [savingLeadDetails, setSavingLeadDetails] = useState(false);

  // ── E6 Booking Lifecycle Creation States ──
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false);
  const [createBookingTarget, setCreateBookingTarget] = useState<EnquiryDocument | null>(null);
  const [agreedPriceInput, setAgreedPriceInput] = useState<string>('');
  const [initialBookingStatus, setInitialBookingStatus] = useState<'DRAFT' | 'PENDING_CONFIRMATION' | 'CONFIRMED'>('PENDING_CONFIRMATION');
  const [creatingBooking, setCreatingBooking] = useState(false);

  // ── E8 Traveller-Safe Trip Information States ──
  const [editingTravellerNotes, setEditingTravellerNotes] = useState('');
  const [editingTripInstructions, setEditingTripInstructions] = useState('');
  const [editingAccommodationPref, setEditingAccommodationPref] = useState('');
  const [editingDietaryPref, setEditingDietaryPref] = useState('');
  const [editingAccessibilityPref, setEditingAccessibilityPref] = useState('');
  const [editingInterestsPref, setEditingInterestsPref] = useState('');
  const [savingTripInfo, setSavingTripInfo] = useState(false);

  // ── Search & Filters for Leads ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [dateFilterType, setDateFilterType] = useState<'created' | 'travel'>('created');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [followUpFilter, setFollowUpFilter] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // ── Direct Bookings Section States ──
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [bookingNoteInput, setBookingNoteInput] = useState('');
  const [bookingUpdatingId, setBookingUpdatingId] = useState<string | null>(null);
  const [bookingFilters, setBookingFilters] = useState({
    paymentStatus: 'all',
    bookingStatus: 'all',
    bookingType: 'all',
  });

  const [packages, setPackages] = useState<any[]>([]);

  // ── E12 Travel Documents States ──
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [docPanelMode, setDocPanelMode] = useState<'upload' | 'edit'>('upload');
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docCategory, setDocCategory] = useState<BookingDocumentCategory>('ITINERARY');
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docVisible, setDocVisible] = useState(true);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState<string | null>(null);
  const [deleteDocConfirmId, setDeleteDocConfirmId] = useState<string | null>(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  // ── 1. FIRESTORE REALTIME LISTENERS ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    let isInitialLoad = true;

    // Listener A: Enquiries
    const unsubEnquiries = onSnapshot(
      collection(db, 'Enquiries'),
      (snapshot) => {
        const loaded: EnquiryDocument[] = [];
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...(d.data() as Omit<EnquiryDocument, 'id'>) });
        });

        // Client-side sort by createdAt desc
        loaded.sort((a, b) => {
          const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
          const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
          const vA = isNaN(tA) ? 0 : tA;
          const vB = isNaN(tB) ? 0 : tB;
          return vB - vA;
        });

        if (!isInitialLoad && loaded.length > enquiries.length) {
          const newest = loaded[0];
          if (newest?.enquiryId) {
            setRealtimeToast(`New lead received: ${newest.enquiryId} (${newest.traveller?.name || 'Explorer'})`);
            setTimeout(() => setRealtimeToast(null), 6000);
          }
        }

        isInitialLoad = false;
        setEnquiries(loaded);
        setLoading(false);
      },
      (err) => {
        console.error('Enquiries listener error:', err);
        setError('Unable to load enquiries in real-time.');
        setLoading(false);
      }
    );

    // Listener B: Direct Bookings
    const unsubBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const loadedB = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        loadedB.sort((a, b) => {
          const tA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
          const tB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
          const vA = isNaN(tA) ? 0 : tA;
          const vB = isNaN(tB) ? 0 : tB;
          return vB - vA;
        });
        setBookings(loadedB);
      },
      (err) => console.error('Bookings listener error:', err)
    );

    // Listener C: Packages for Title Lookup
    const unsubPackages = onSnapshot(
      collection(db, 'packages'),
      (snapshot) => {
        const loadedP = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPackages(loadedP);
      },
      (err) => console.error('Packages listener error:', err)
    );

    return () => {
      unsubEnquiries();
      unsubBookings();
      unsubPackages();
    };
  }, []);

  useEffect(() => {
    if (selectedBooking?.id) {
      const updated = bookings.find((b) => b.id === selectedBooking.id);
      if (updated) {
        setSelectedBooking(updated);
      }
    }
  }, [bookings]);

  useEffect(() => {
    if (selectedBooking) {
      setEditingTravellerNotes(selectedBooking.travellerNotes || '');
      setEditingTripInstructions(selectedBooking.tripInstructions || '');
      setEditingAccommodationPref(selectedBooking.travelPreferences?.accommodation || '');
      setEditingDietaryPref(selectedBooking.travelPreferences?.dietary || '');
      setEditingAccessibilityPref(selectedBooking.travelPreferences?.accessibility || '');
      setEditingInterestsPref(selectedBooking.travelPreferences?.interests || '');
    }
    // Reset doc panel on booking change
    setShowDocPanel(false);
    setDocPanelMode('upload');
    setEditingDocId(null);
    setDocError(null);
    setDocSuccess(null);
    setDeleteDocConfirmId(null);
  }, [selectedBooking?.id]);

  // ── 2. SUBCOLLECTION REALTIME LISTENERS FOR SELECTED ENQUIRY ──
  useEffect(() => {
    if (!selectedEnquiry || !selectedEnquiry.id) {
      setNotes([]);
      setActivities([]);
      setNewNoteText('');
      setEditingNextAction('');
      setEditingFollowUp('');
      return;
    }

    setEditingNextAction(selectedEnquiry.nextAction || '');
    if (selectedEnquiry.followUpAt) {
      try {
        const d = (selectedEnquiry.followUpAt as any)?.toDate
          ? (selectedEnquiry.followUpAt as any).toDate()
          : new Date(selectedEnquiry.followUpAt as any);
        if (!isNaN(d.getTime())) {
          const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setEditingFollowUp(iso);
        } else {
          setEditingFollowUp('');
        }
      } catch {
        setEditingFollowUp('');
      }
    } else {
      setEditingFollowUp('');
    }

    const unsubNotes = subscribeToInternalNotes(
      selectedEnquiry.id,
      (loadedNotes) => setNotes(loadedNotes),
      (err) => console.warn('Notes subscription notice:', err)
    );

    const unsubActivities = subscribeToEnquiryActivities(
      selectedEnquiry.id,
      (loadedActivities) => setActivities(loadedActivities),
      (err) => console.warn('Activities subscription notice:', err)
    );

    return () => {
      unsubNotes();
      unsubActivities();
    };
  }, [selectedEnquiry?.id]);

  useEffect(() => {
    if (selectedEnquiry && selectedEnquiry.id) {
      const updated = enquiries.find((e) => e.id === selectedEnquiry.id);
      if (updated) {
        setSelectedEnquiry(updated);
      }
    }
  }, [enquiries]);

  // ── 3. DYNAMIC SUMMARY STATS ──
  const stats = useMemo(() => {
    const total = enquiries.length;
    const countNew = enquiries.filter((e) => e.status === 'NEW').length;
    const countContacted = enquiries.filter((e) => e.status === 'CONTACTED').length;
    const countInDiscussion = enquiries.filter((e) => e.status === 'IN_DISCUSSION').length;
    const countConverted = enquiries.filter((e) => e.status === 'CONVERTED').length;
    const countClosed = enquiries.filter((e) => e.status === 'CLOSED').length;

    const now = new Date();
    let countOverdue = 0;
    let countToday = 0;

    enquiries.forEach((e) => {
      if (e.status === 'CLOSED' || e.status === 'CONVERTED' || !e.followUpAt) return;
      try {
        const d = (e.followUpAt as any)?.toDate ? (e.followUpAt as any).toDate() : new Date(e.followUpAt as any);
        if (isNaN(d.getTime())) return;
        if (d < now) countOverdue++;
        else if (d.toDateString() === now.toDateString()) countToday++;
      } catch {
        // ignore
      }
    });

    return {
      total,
      new: countNew,
      contacted: countContacted,
      inDiscussion: countInDiscussion,
      converted: countConverted,
      closed: countClosed,
      overdue: countOverdue,
      today: countToday,
    };
  }, [enquiries]);

  // ── 4. DERIVED FOLLOW-UP STATUS CALCULATOR ──
  const getFollowUpStatusInfo = (followUpAt?: any, status?: string) => {
    if (!followUpAt) return null;
    if (status === 'CLOSED' || status === 'CONVERTED') {
      return { type: 'COMPLETED', label: 'Follow-up Set', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }

    try {
      const targetDate = followUpAt.toDate ? followUpAt.toDate() : new Date(followUpAt);
      if (isNaN(targetDate.getTime())) return null;

      const now = new Date();
      const todayStr = now.toDateString();
      const targetStr = targetDate.toDateString();

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toDateString();

      if (targetDate < now && targetStr !== todayStr) {
        return { type: 'OVERDUE', label: 'OVERDUE', color: 'bg-rose-100 text-rose-900 border-rose-300 font-black animate-pulse' };
      }
      if (targetStr === todayStr) {
        return { type: 'TODAY', label: 'DUE TODAY', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' };
      }
      if (targetStr === tomorrowStr) {
        return { type: 'TOMORROW', label: 'DUE TOMORROW', color: 'bg-blue-50 text-blue-800 border-blue-200 font-semibold' };
      }

      return {
        type: 'UPCOMING',
        label: targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    } catch {
      return null;
    }
  };

  // ── 5. FILTERED LEADS ──
  const filteredEnquiries = useMemo(() => {
    const now = new Date();

    return enquiries
      .filter((item) => {
        if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

        if (sourceFilter !== 'ALL') {
          if (sourceFilter === 'ITINERARY' && item.source !== 'ITINERARY') return false;
          if (sourceFilter === 'CONTACT_PAGE' && item.source !== 'CONTACT_PAGE') return false;
          if (sourceFilter === 'HERO' && item.entryPoint !== 'HERO') return false;
          if (sourceFilter === 'STICKY_CARD' && item.entryPoint !== 'STICKY_CARD') return false;
          if (sourceFilter === 'MOBILE_STICKY' && item.entryPoint !== 'MOBILE_STICKY') return false;
        }

        if (assignmentFilter !== 'ALL') {
          if (assignmentFilter === 'UNASSIGNED' && item.assignedTo) return false;
          if (assignmentFilter === 'ME' && item.assignedTo !== currentAdminId) return false;
        }

        if (followUpFilter !== 'ALL') {
          if (followUpFilter === 'UNSCHEDULED' && item.followUpAt) return false;
          if (followUpFilter !== 'UNSCHEDULED' && !item.followUpAt) return false;

          if (item.followUpAt) {
            const fDate = (item.followUpAt as any)?.toDate ? (item.followUpAt as any).toDate() : new Date(item.followUpAt as any);
            if (!isNaN(fDate.getTime())) {
              const isClosedOrConverted = item.status === 'CLOSED' || item.status === 'CONVERTED';
              if (followUpFilter === 'OVERDUE' && (fDate >= now || isClosedOrConverted)) return false;
              if (followUpFilter === 'DUE_TODAY' && fDate.toDateString() !== now.toDateString()) return false;
              if (followUpFilter === 'UPCOMING' && (fDate <= now || isClosedOrConverted)) return false;
            }
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchRef = item.enquiryId?.toLowerCase().includes(q);
          const matchName = item.traveller?.name?.toLowerCase().includes(q);
          const matchEmail = item.traveller?.email?.toLowerCase().includes(q);
          const matchPhone = item.traveller?.phone?.toLowerCase().includes(q);
          const matchTitle = item.itineraryTitle?.toLowerCase().includes(q);
          const matchDest = item.destination?.toLowerCase().includes(q);
          const matchAssignee = item.assignedToName?.toLowerCase().includes(q);
          const matchNextAction = item.nextAction?.toLowerCase().includes(q);

          if (!matchRef && !matchName && !matchEmail && !matchPhone && !matchTitle && !matchDest && !matchAssignee && !matchNextAction) {
            return false;
          }
        }

        if (dateRangeFilter !== 'ALL') {
          let targetDate: Date | null = null;
          if (dateFilterType === 'created' && item.createdAt) {
            targetDate = (item.createdAt as any)?.toDate ? (item.createdAt as any).toDate() : new Date(item.createdAt as any);
          } else if (dateFilterType === 'travel' && item.trip?.travelDate) {
            targetDate = new Date(item.trip.travelDate);
          }

          if (targetDate && !isNaN(targetDate.getTime())) {
            const diffDays = (now.getTime() - targetDate.getTime()) / (1000 * 3600 * 24);
            if (dateRangeFilter === 'TODAY' && diffDays > 1) return false;
            if (dateRangeFilter === 'LAST_7' && (diffDays > 7 || diffDays < 0)) return false;
            if (dateRangeFilter === 'LAST_30' && (diffDays > 30 || diffDays < 0)) return false;
            if (dateRangeFilter === 'FUTURE' && targetDate < now) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date((a.createdAt as any) || 0).getTime();
        const timeB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date((b.createdAt as any) || 0).getTime();
        const validA = isNaN(timeA) ? 0 : timeA;
        const validB = isNaN(timeB) ? 0 : timeB;
        return sortOrder === 'newest' ? validB - validA : validA - validB;
      });
  }, [enquiries, statusFilter, sourceFilter, assignmentFilter, followUpFilter, searchQuery, dateFilterType, dateRangeFilter, sortOrder, currentAdminId]);

  // ── 6. FILTERED DIRECT BOOKINGS ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingFilters.paymentStatus !== 'all' && b.payment?.status !== bookingFilters.paymentStatus) return false;
      if (bookingFilters.bookingStatus !== 'all' && b.bookingStatus !== bookingFilters.bookingStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const traveler = `${b.primaryTraveler?.firstName || ''} ${b.primaryTraveler?.lastName || ''}`.toLowerCase();
        const matchEmail = b.primaryTraveler?.email?.toLowerCase().includes(q);
        const matchPhone = b.primaryTraveler?.phone?.toLowerCase().includes(q);
        const matchId = b.id?.toLowerCase().includes(q);
        const matchPkg = b.packageId?.toLowerCase().includes(q);

        if (!traveler.includes(q) && !matchEmail && !matchPhone && !matchId && !matchPkg) return false;
      }

      return true;
    });
  }, [bookings, bookingFilters, searchQuery]);

  // ── 7. ACTIONS (Leads) ──
  const handleStatusChange = async (docId: string, newStatus: EnquiryDocument['status']) => {
    if (!docId) return;
    const previousStatus = enquiries.find((e) => e.id === docId)?.status || 'NEW';
    setStatusUpdatingId(docId);
    setError(null);

    setEnquiries((prev) => prev.map((e) => (e.id === docId ? { ...e, status: newStatus } : e)));

    try {
      await updateDocument('Enquiries', docId, {
        status: newStatus,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: currentAdminName,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'STATUS_CHANGED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { from: previousStatus, to: newStatus },
      });

      setActionSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Failed to update status.');
      setEnquiries((prev) => prev.map((e) => (e.id === docId ? { ...e, status: previousStatus } : e)));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleAssignmentChange = async (docId: string, assigned: boolean) => {
    if (!docId) return;
    setSavingLeadDetails(true);

    const newAssignedTo = assigned ? currentAdminId : undefined;
    const newAssignedName = assigned ? currentAdminName : undefined;

    try {
      await updateDocument('Enquiries', docId, {
        assignedTo: newAssignedTo || null,
        assignedToName: newAssignedName || null,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'ASSIGNED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { assignedToName: newAssignedName || 'Unassigned' },
      });

      setActionSuccess(assigned ? `Assigned lead to ${currentAdminName}` : 'Lead unassigned');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setError('Failed to update assignment.');
    } finally {
      setSavingLeadDetails(false);
    }
  };

  const handleSaveFollowUp = async (docId: string, isoValue: string) => {
    if (!docId) return;
    setSavingLeadDetails(true);

    let timestampValue: Timestamp | null = null;
    if (isoValue) {
      const date = new Date(isoValue);
      if (!isNaN(date.getTime())) {
        timestampValue = Timestamp.fromDate(date);
      }
    }

    try {
      await updateDocument('Enquiries', docId, {
        followUpAt: timestampValue || null,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: timestampValue ? 'FOLLOW_UP_SET' : 'FOLLOW_UP_CLEARED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { followUpAt: timestampValue ? isoValue.replace('T', ' ') : 'Cleared' },
      });

      setActionSuccess(timestampValue ? 'Follow-up scheduled' : 'Follow-up cleared');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving follow-up:', err);
      setError('Failed to update follow-up date.');
    } finally {
      setSavingLeadDetails(false);
    }
  };

  const handleSaveNextAction = async (docId: string, actionText: string) => {
    if (!docId) return;
    setSavingLeadDetails(true);

    try {
      await updateDocument('Enquiries', docId, {
        nextAction: actionText.trim() || null,
        updatedAt: Timestamp.now(),
      });

      if (actionText.trim()) {
        await addEnquiryActivity(docId, {
          enquiryId: docId,
          type: 'FOLLOW_UP_SET',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { nextAction: actionText.trim() },
        });
      }

      setActionSuccess('Next action saved');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving next action:', err);
      setError('Failed to save next action.');
    } finally {
      setSavingLeadDetails(false);
    }
  };

  const handleMarkContacted = async (docId: string, channel: 'WHATSAPP' | 'EMAIL' | 'PHONE') => {
    if (!docId) return;

    try {
      await updateDocument('Enquiries', docId, {
        lastContactedAt: Timestamp.now(),
        lastContactedBy: currentAdminName,
        lastContactedChannel: channel,
        updatedAt: Timestamp.now(),
      });

      const actType = channel === 'WHATSAPP' ? 'WHATSAPP_OPENED' : channel === 'EMAIL' ? 'EMAIL_OPENED' : 'PHONE_INITIATED';

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: actType,
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { channel },
      });

      setActionSuccess(`Recorded contact via ${channel}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.warn('Notice recording contact:', err);
    }
  };

  // ── E6 Booking Creation & Lifecycle Handlers ──
  const handleOpenCreateBookingModal = (enquiry: EnquiryDocument) => {
    const existing = bookings.find(b => b.enquiryId === enquiry.id || b.id === enquiry.bookingId || b.bookingReference === enquiry.bookingId);
    if (existing || enquiry.bookingId) {
      setError(`Booking already exists for this enquiry (${existing?.bookingReference || enquiry.bookingId}).`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    setCreateBookingTarget(enquiry);
    setAgreedPriceInput(enquiry.pricing?.basePrice ? String(enquiry.pricing.basePrice) : '');
    setInitialBookingStatus('PENDING_CONFIRMATION');
    setIsCreateBookingModalOpen(true);
  };

  const handleCreateBookingFromEnquiry = async () => {
    if (!createBookingTarget || !createBookingTarget.id) return;
    
    const existing = bookings.find(b => b.enquiryId === createBookingTarget.id || b.id === createBookingTarget.bookingId);
    if (existing || createBookingTarget.bookingId) {
      setError('A booking already exists for this enquiry.');
      setIsCreateBookingModalOpen(false);
      return;
    }

    setCreatingBooking(true);
    const bookingRef = `NFA-B-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const parsedAgreedPrice = parseFloat(agreedPriceInput) || createBookingTarget.pricing?.basePrice || 0;

      const bookingPayload: Omit<Booking, 'id'> = {
        bookingReference: bookingRef,
        customerId: createBookingTarget.customerId || createBookingTarget.traveller?.userId,
        enquiryId: createBookingTarget.id,
        itineraryId: createBookingTarget.itineraryId,
        itineraryTitle: createBookingTarget.itineraryTitle || createBookingTarget.destination || 'Expedition Journey',
        itinerarySlug: createBookingTarget.itinerarySlug,
        destination: createBookingTarget.destination || 'Global',
        travelDate: createBookingTarget.trip?.travelDate || 'TBD',
        duration: String(createBookingTarget.trip?.numberOfDays || createBookingTarget.duration || 'Flexible'),
        status: initialBookingStatus,
        bookingStatus: initialBookingStatus === 'CONFIRMED' ? 'confirmed' : 'pending',
        agreedPrice: parsedAgreedPrice,
        userId: createBookingTarget.traveller?.userId || createBookingTarget.customerId,
        primaryTraveler: {
          firstName: createBookingTarget.traveller?.name?.split(' ')[0] || 'Explorer',
          lastName: createBookingTarget.traveller?.name?.split(' ').slice(1).join(' ') || '',
          email: createBookingTarget.traveller?.email || '',
          phone: createBookingTarget.traveller?.phone || '',
        },
        numberOfTravelers: createBookingTarget.trip?.totalTravellers || 1,
        confirmationEmailSent: false,
        itineraryEmailSent: false,
        voucherSent: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingPayload);

      await updateDocument('Enquiries', createBookingTarget.id, {
        bookingId: docRef.id,
        status: 'CONVERTED',
        statusChangedAt: Timestamp.now(),
        statusChangedBy: currentAdminName,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(createBookingTarget.id, {
        enquiryId: createBookingTarget.id,
        type: 'STATUS_CHANGED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { from: createBookingTarget.status, to: 'CONVERTED', bookingReference: bookingRef },
      });

      setActionSuccess(`Booking ${bookingRef} created successfully!`);
      setTimeout(() => setActionSuccess(null), 4000);
      setIsCreateBookingModalOpen(false);
      setCreateBookingTarget(null);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking document.');
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleUpdateBookingStatusLifecycle = async (bookingId: string, newStatus: string) => {
    try {
      const bRef = doc(db, 'bookings', bookingId);
      await updateDoc(bRef, {
        status: newStatus,
        bookingStatus: newStatus === 'CONFIRMED' ? 'confirmed' : newStatus === 'COMPLETED' ? 'completed' : newStatus === 'CANCELLED' ? 'cancelled' : 'pending',
        updatedAt: serverTimestamp(),
      });
      setActionSuccess(`Booking status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status.');
    }
  };

  const handleSaveTripInformation = async () => {
    if (!selectedBooking?.id) return;
    setSavingTripInfo(true);

    try {
      const bRef = doc(db, 'bookings', selectedBooking.id);
      const updatedData = {
        travellerNotes: editingTravellerNotes.trim(),
        tripInstructions: editingTripInstructions.trim(),
        travelPreferences: {
          accommodation: editingAccommodationPref.trim(),
          dietary: editingDietaryPref.trim(),
          accessibility: editingAccessibilityPref.trim(),
          interests: editingInterestsPref.trim(),
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(bRef, updatedData);

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'TRIP_INFORMATION_UPDATED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { noteSnippet: editingTravellerNotes.slice(0, 50) },
        });
      }

      setActionSuccess('Trip information updated.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving trip information:', err);
      setError('Unable to update trip information.');
    } finally {
      setSavingTripInfo(false);
    }
  };

  // ── E10 Trip Operations Handlers ──
  const handleUpdateOperationalStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bRef = doc(db, 'bookings', bookingId);
      await updateDoc(bRef, {
        operationalStatus: newStatus,
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking?.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'OPERATIONAL_STATUS_CHANGED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { to: newStatus },
        });
      }

      setActionSuccess(`Operational status updated to ${newStatus.replace(/_/g, ' ')}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating operational status:', err);
      setError('Unable to update preparation status.');
    }
  };

  const handleToggleChecklist = async (bookingId: string, fieldKey: string, currentValue: boolean) => {
    try {
      const bRef = doc(db, 'bookings', bookingId);
      await updateDoc(bRef, {
        [`operationalChecklist.${fieldKey}`]: !currentValue,
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking?.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'CHECKLIST_UPDATED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { field: fieldKey, value: String(!currentValue) },
        });
      }

      setActionSuccess('Checklist item updated.');
      setTimeout(() => setActionSuccess(null), 2000);
    } catch (err) {
      console.error('Error toggling checklist:', err);
      setError('Unable to update the checklist.');
    }
  };

  const handleUpdateAccommodationReadiness = async (bookingId: string, newStatus: string) => {
    try {
      const bRef = doc(db, 'bookings', bookingId);
      await updateDoc(bRef, {
        accommodationReadiness: newStatus,
        updatedAt: serverTimestamp(),
      });
      setActionSuccess(`Accommodation status set to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 2000);
    } catch (err) {
      console.error('Error updating accommodation readiness:', err);
      setError('Unable to update accommodation status.');
    }
  };

  const handleMarkTravellerBriefed = async () => {
    if (!selectedBooking?.id) return;
    try {
      const bRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bRef, {
        operationalStatus: 'TRAVELLER_BRIEFED',
        'operationalChecklist.travellerBriefed': true,
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'TRAVELLER_BRIEFED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { bookingReference: selectedBooking.bookingReference },
        });
      }

      setActionSuccess('Traveller marked briefed.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error marking traveller briefed:', err);
      setError('Unable to update briefing status.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry?.id || !newNoteText.trim()) return;

    setSavingNote(true);
    const textToSave = newNoteText.trim();

    try {
      await addInternalNote(selectedEnquiry.id, {
        enquiryId: selectedEnquiry.id,
        text: textToSave,
        authorId: currentAdminId,
        authorName: currentAdminName,
      });

      setNewNoteText('');
      setActionSuccess('Internal note added');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteEnquiry = async (docId: string) => {
    if (!docId) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteDocument('Enquiries', docId);
      setActionSuccess('Enquiry deleted successfully.');
      setDeleteConfirmId(null);
      if (selectedEnquiry?.id === docId) setSelectedEnquiry(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting enquiry:', err);
      setError('Failed to delete enquiry.');
    } finally {
      setDeleting(false);
    }
  };

  // ── E12 Travel Document Handlers ──

  const DOC_CATEGORY_LABELS: Record<BookingDocumentCategory, string> = {
    ITINERARY: 'Itinerary PDF',
    BOOKING_CONFIRMATION: 'Booking Confirmation',
    TRAVEL_VOUCHER: 'Travel Voucher',
    ADDITIONAL: 'Additional Document',
  };

  const getDefaultDocTitle = (cat: BookingDocumentCategory): string =>
    DOC_CATEGORY_LABELS[cat] || 'Travel Document';

  const resetDocPanel = () => {
    setShowDocPanel(false);
    setDocPanelMode('upload');
    setEditingDocId(null);
    setDocCategory('ITINERARY');
    setDocTitle('');
    setDocDescription('');
    setDocVisible(true);
    setDocFile(null);
    setDocError(null);
  };

  const handleOpenUploadPanel = () => {
    resetDocPanel();
    setDocTitle(getDefaultDocTitle('ITINERARY'));
    setShowDocPanel(true);
    setDocPanelMode('upload');
  };

  const handleOpenEditPanel = (d: BookingDocument) => {
    setDocPanelMode('edit');
    setEditingDocId(d.id);
    setDocCategory(d.category);
    setDocTitle(d.title);
    setDocDescription(d.description || '');
    setDocVisible(d.visibleToTraveller);
    setDocFile(null);
    setDocError(null);
    setShowDocPanel(true);
  };

  const handleUploadDocument = async () => {
    if (!selectedBooking?.id) return;
    if (!docFile) { setDocError('Please select a file.'); return; }
    if (!docTitle.trim()) { setDocError('Please enter a document title.'); return; }

    setDocUploading(true);
    setDocError(null);

    const newDocId = `doc_${Date.now()}`;

    try {
      const { fileUrl, storagePath } = await uploadBookingDocument(docFile, selectedBooking.id, newDocId);

      const newDoc: BookingDocument = {
        id: newDocId,
        category: docCategory,
        title: docTitle.trim(),
        description: docDescription.trim() || undefined,
        fileName: docFile.name,
        fileUrl,
        storagePath,
        fileType: docFile.type,
        fileSize: docFile.size,
        uploadedAt: Timestamp.now(),
        uploadedBy: currentAdminName,
        visibleToTraveller: docVisible,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const existingDocs: BookingDocument[] = selectedBooking.documents || [];
      const bRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bRef, {
        documents: [...existingDocs, newDoc],
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'DOCUMENT_UPLOADED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { noteSnippet: `${DOC_CATEGORY_LABELS[docCategory]}: ${docTitle.trim()}` },
        });
      }

      setDocSuccess('Document uploaded.');
      setTimeout(() => setDocSuccess(null), 3000);
      resetDocPanel();
    } catch (err: any) {
      setDocError(err.message || "Couldn't upload the document. Please try again.");
    } finally {
      setDocUploading(false);
    }
  };

  const handleSaveDocMetadata = async () => {
    if (!selectedBooking?.id || !editingDocId) return;
    setDocUploading(true);
    setDocError(null);

    try {
      const existingDocs: BookingDocument[] = selectedBooking.documents || [];
      const updatedDocs = existingDocs.map((d) => {
        if (d.id !== editingDocId) return d;
        return {
          ...d,
          category: docCategory,
          title: docTitle.trim(),
          description: docDescription.trim() || undefined,
          visibleToTraveller: docVisible,
          updatedAt: Timestamp.now(),
        };
      });

      const bRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bRef, {
        documents: updatedDocs,
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'DOCUMENT_UPDATED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { noteSnippet: docTitle.trim() },
        });
      }

      setDocSuccess('Document details updated.');
      setTimeout(() => setDocSuccess(null), 3000);
      resetDocPanel();
    } catch (err: any) {
      setDocError("Couldn't update document details. Please try again.");
    } finally {
      setDocUploading(false);
    }
  };

  const handleToggleDocVisibility = async (d: BookingDocument) => {
    if (!selectedBooking?.id) return;

    try {
      const existingDocs: BookingDocument[] = selectedBooking.documents || [];
      const updatedDocs = existingDocs.map((existing) =>
        existing.id === d.id
          ? { ...existing, visibleToTraveller: !existing.visibleToTraveller, updatedAt: Timestamp.now() }
          : existing
      );

      const bRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bRef, {
        documents: updatedDocs,
        updatedAt: serverTimestamp(),
      });

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'DOCUMENT_VISIBILITY_CHANGED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { noteSnippet: `${d.title} — ${!d.visibleToTraveller ? 'visible' : 'hidden'}` },
        });
      }
    } catch (err) {
      console.error('Error toggling document visibility:', err);
      setError('Unable to change document visibility.');
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedBooking?.id || !deleteDocConfirmId) return;
    setDeletingDoc(true);

    try {
      const docToDelete = (selectedBooking.documents || []).find((d) => d.id === deleteDocConfirmId);

      const updatedDocs = (selectedBooking.documents || []).filter((d) => d.id !== deleteDocConfirmId);
      const bRef = doc(db, 'bookings', selectedBooking.id);
      await updateDoc(bRef, {
        documents: updatedDocs,
        updatedAt: serverTimestamp(),
      });

      // Attempt to delete storage file (safe — won't throw if missing)
      if (docToDelete?.storagePath) {
        await deleteBookingDocumentFile(docToDelete.storagePath);
      }

      if (selectedBooking.enquiryId) {
        await addEnquiryActivity(selectedBooking.enquiryId, {
          enquiryId: selectedBooking.enquiryId,
          type: 'DOCUMENT_REMOVED',
          actorId: currentAdminId,
          actorName: currentAdminName,
          metadata: { noteSnippet: docToDelete?.title || 'Document' },
        });
      }

      setDocSuccess('Document removed.');
      setTimeout(() => setDocSuccess(null), 3000);
      setDeleteDocConfirmId(null);
    } catch (err) {
      console.error('Error removing document:', err);
      setError('Unable to remove the document. Please try again.');
    } finally {
      setDeletingDoc(false);
    }
  };

  // ── 8. ACTIONS (Direct Bookings) ──
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    setBookingUpdatingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        'payment.status': newStatus,
        updatedAt: serverTimestamp(),
      });
      setActionSuccess(`Booking payment status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking status.');
    } finally {
      setBookingUpdatingId(null);
    }
  };

  const handleAddBookingInternalNote = async (booking: Booking) => {
    if (!bookingNoteInput.trim()) return;
    setBookingUpdatingId(booking.id);
    try {
      const updated = booking.internalNotes ? `${booking.internalNotes}\n---\n${bookingNoteInput.trim()}` : bookingNoteInput.trim();
      await updateDoc(doc(db, 'bookings', booking.id), {
        internalNotes: updated,
        updatedAt: serverTimestamp(),
      });
      setBookingNoteInput('');
      setActionSuccess('Booking note added');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error adding note:', error);
    } finally {
      setBookingUpdatingId(null);
    }
  };

  const handleExportBooking = (booking: Booking) => {
    const dataStr = JSON.stringify(booking, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `booking-${booking.id}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ── FORMATTING HELPERS ──
  const formatDate = (ts: any): string => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (ts: any): string => {
    if (!ts) return 'N/A';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (val?: number | string, curr = 'INR'): string => {
    if (!val) return 'N/A';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    return `${curr} ${num.toLocaleString('en-IN')}`;
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-black animate-pulse';
      case 'CONTACTED':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case 'IN_DISCUSSION':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case 'CONVERTED':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const buildAdminWhatsAppUrl = (enquiry: EnquiryDocument): string => {
    const phone = enquiry.traveller?.phone?.replace(/\D/g, '') || '';
    if (!phone) return '';

    const name = enquiry.traveller?.name || 'Explorer';
    const ref = enquiry.enquiryId || 'NFA-ENQUIRY';
    const trip = enquiry.itineraryTitle || 'Journey';
    const date = enquiry.trip?.travelDate || 'TBD';
    const pax = enquiry.trip?.totalTravellers || 1;

    const message = [
      `Hello ${name},`,
      ``,
      `This is No Fixed Address Operations regarding your expedition enquiry:`,
      `Reference: ${ref}`,
      `Trip: ${trip}`,
      `Travel Date: ${date}`,
      `Travellers: ${pax} Pax`,
      ``,
      `We would be happy to help plan your journey. When is a good time to connect?`,
      ``,
      `Regards,`,
      `No Fixed Address Operations`
    ].join('\n');

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 text-left selection:bg-[#F4BF4B] selection:text-[#121212]">
      
      {/* Real-time Arrival Banner */}
      {realtimeToast && (
        <div className="p-4 bg-[#121212] text-[#F4BF4B] border-2 border-[#F4BF4B] shadow-[6px_6px_0px_0px_#121212] flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <Sparkles className="animate-spin text-[#F4BF4B]" size={20} />
            <span className="font-brand font-black text-sm uppercase tracking-wide text-white">
              {realtimeToast}
            </span>
          </div>
          <button onClick={() => setRealtimeToast(null)} className="text-[#F4BF4B] hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Action Success Toast */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 text-rose-900 text-xs font-bold flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 underline text-[10px] font-black uppercase">
            Dismiss
          </button>
        </div>
      )}

      {/* Unified Section Workspace Selector (Leads vs Direct Bookings) */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">Bookings & Expedition Leads</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live • Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unified management of expedition leads, follow-ups, internal notes, WhatsApp actions & direct package bookings
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSection('leads')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'leads'
                ? 'bg-[#121212] text-[#F4BF4B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass size={15} /> Expedition Leads ({enquiries.length})
            {stats.new > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-[#121212] text-[10px] font-black">
                {stats.new} NEW
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('bookings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSection === 'bookings'
                ? 'bg-[#121212] text-[#F4BF4B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={15} /> Direct Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {/* ── SECTION A: EXPEDITION ENQUIRIES & LEADS WORKSPACE ── */}
      {activeSection === 'leads' && (
        <div className="space-y-6">
          {/* Dynamic Stats Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            <div 
              onClick={() => { setStatusFilter('ALL'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL' && followUpFilter === 'ALL' ? 'bg-[#121212] text-white border-[#121212] shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Leads</span>
              <span className="font-brand font-black text-xl tracking-tight">{stats.total}</span>
            </div>

            <div 
              onClick={() => { setStatusFilter('NEW'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'NEW' ? 'bg-amber-500 text-[#121212] border-amber-600 font-bold shadow-md' : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-900/80">New Leads</span>
                {stats.new > 0 && <span className="size-2 rounded-full bg-amber-600 animate-ping"></span>}
              </div>
              <span className="font-brand font-black text-xl text-amber-950 tracking-tight">{stats.new}</span>
            </div>

            <div 
              onClick={() => { setFollowUpFilter('OVERDUE'); setStatusFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${followUpFilter === 'OVERDUE' ? 'bg-rose-600 text-white border-rose-700 shadow-md' : 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-900/80">Overdue</span>
                {stats.overdue > 0 && <span className="size-2 rounded-full bg-rose-600 animate-ping"></span>}
              </div>
              <span className="font-brand font-black text-xl text-rose-950 tracking-tight">{stats.overdue}</span>
            </div>

            <div 
              onClick={() => { setFollowUpFilter('DUE_TODAY'); setStatusFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${followUpFilter === 'DUE_TODAY' ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md' : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900/70 block mb-1">Due Today</span>
              <span className="font-brand font-black text-xl text-amber-950 tracking-tight">{stats.today}</span>
            </div>

            <div 
              onClick={() => { setStatusFilter('CONTACTED'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONTACTED' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-900/70 block mb-1">Contacted</span>
              <span className="font-brand font-black text-xl text-blue-950 tracking-tight">{stats.contacted}</span>
            </div>

            <div 
              onClick={() => { setStatusFilter('IN_DISCUSSION'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'IN_DISCUSSION' ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-900/70 block mb-1">In Discussion</span>
              <span className="font-brand font-black text-xl text-purple-950 tracking-tight">{stats.inDiscussion}</span>
            </div>

            <div 
              onClick={() => { setStatusFilter('CONVERTED'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONVERTED' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-900/70 block mb-1">Converted</span>
              <span className="font-brand font-black text-xl text-emerald-950 tracking-tight">{stats.converted}</span>
            </div>

            <div 
              onClick={() => { setStatusFilter('CLOSED'); setFollowUpFilter('ALL'); }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CLOSED' ? 'bg-slate-800 text-white border-slate-900 shadow-md' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Closed</span>
              <span className="font-brand font-black text-xl text-slate-800 tracking-tight">{stats.closed}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Traveller, Ref ID, Itinerary, Destination, Staff Assignee, Next Action..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Status: All</option>
                  <option value="NEW">Status: New</option>
                  <option value="CONTACTED">Status: Contacted</option>
                  <option value="IN_DISCUSSION">Status: In discussion</option>
                  <option value="CUSTOMIZATION">Status: Journey being customized</option>
                  <option value="PROPOSAL_SENT">Status: Proposal sent</option>
                  <option value="READY_TO_BOOK">Status: Ready to book</option>
                  <option value="CONVERTED">Status: Booked</option>
                  <option value="CLOSED">Status: Closed</option>
                </select>

                <select
                  value={followUpFilter}
                  onChange={(e) => setFollowUpFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Follow-up: All</option>
                  <option value="OVERDUE">⚠️ Overdue</option>
                  <option value="DUE_TODAY">⭐ Due Today</option>
                  <option value="UPCOMING">🗓️ Upcoming</option>
                  <option value="UNSCHEDULED">Unscheduled</option>
                </select>

                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Assignee: All</option>
                  <option value="ME">Assigned to Me</option>
                  <option value="UNASSIGNED">Unassigned</option>
                </select>

                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="ALL">Source: All</option>
                  <option value="ITINERARY">Source: Itinerary</option>
                  <option value="CONTACT_PAGE">Source: Contact Page</option>
                  <option value="HERO">Entry: Hero CTA</option>
                  <option value="STICKY_CARD">Entry: Desktop Sticky</option>
                  <option value="MOBILE_STICKY">Entry: Mobile Sticky</option>
                </select>

                <button
                  onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer shrink-0"
                >
                  {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
                </button>
              </div>
            </div>
          </div>

          {/* Table / Mobile Cards View */}
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
              <RefreshCw className="animate-spin text-slate-400 mx-auto" size={28} />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading expedition leads...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-slate-200 p-8">
              <div className="size-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Compass size={28} />
              </div>
              <div>
                <h4 className="font-brand font-black text-lg uppercase text-slate-800">No Expedition Leads Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No leads match your current search or active filter parameters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setSourceFilter('ALL');
                  setFollowUpFilter('ALL');
                  setAssignmentFilter('ALL');
                  setDateRangeFilter('ALL');
                }}
                className="px-4 py-2 bg-slate-900 text-amber-400 font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-slate-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Reference</th>
                        <th className="py-3.5 px-4">Traveller</th>
                        <th className="py-3.5 px-4">Itinerary & Destination</th>
                        <th className="py-3.5 px-4">Follow-up / Action</th>
                        <th className="py-3.5 px-4">Assignee</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Budget</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredEnquiries.map((enquiry) => {
                        const waUrl = buildAdminWhatsAppUrl(enquiry);
                        const followUpInfo = getFollowUpStatusInfo(enquiry.followUpAt, enquiry.status);

                        return (
                          <tr
                            key={enquiry.id}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                            onClick={() => setSelectedEnquiry(enquiry)}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                              <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 group-hover:border-slate-400">
                                {enquiry.enquiryId || 'NFA-REF'}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-normal mt-1">
                                {formatDate(enquiry.createdAt)}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 max-w-[180px]">
                              <div className="font-bold text-slate-900 truncate">{enquiry.traveller?.name || 'Explorer'}</div>
                              <div className="text-[11px] text-slate-500 truncate">{enquiry.traveller?.email}</div>
                              {enquiry.traveller?.phone && (
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{enquiry.traveller.phone}</div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 max-w-[200px]">
                              <div className="font-bold text-slate-900 truncate" title={enquiry.itineraryTitle}>
                                {enquiry.itineraryTitle || 'General Expedition'}
                              </div>
                              <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                                <span>📍 {enquiry.destination || 'Global'}</span>
                                <span className="text-slate-400">• {enquiry.trip?.travelDate || 'TBD'}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 max-w-[160px]">
                              {followUpInfo ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] border ${followUpInfo.color}`}>
                                  {followUpInfo.label}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No follow-up set</span>
                              )}
                              {enquiry.nextAction && (
                                <div className="text-[11px] font-medium text-slate-700 truncate mt-1" title={enquiry.nextAction}>
                                  ➜ {enquiry.nextAction}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {enquiry.assignedToName ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  <UserCheck size={12} className="text-emerald-600" />
                                  {enquiry.assignedToName}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={enquiry.status || 'NEW'}
                                disabled={statusUpdatingId === enquiry.id}
                                onChange={(e) => handleStatusChange(enquiry.id!, e.target.value as EnquiryDocument['status'])}
                                className={`px-2.5 py-1 rounded-md text-[10px] border outline-none cursor-pointer ${getStatusBadgeStyle(enquiry.status)}`}
                              >
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="IN_DISCUSSION">In discussion</option>
                                <option value="CUSTOMIZATION">Journey being customized</option>
                                <option value="PROPOSAL_SENT">Proposal sent</option>
                                <option value="READY_TO_BOOK">Ready to book</option>
                                <option value="CONVERTED">Booked</option>
                                <option value="CLOSED">Closed</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                              {enquiry.preferences?.budget
                                ? formatCurrency(enquiry.preferences.budget, enquiry.preferences.budgetCurrency || 'INR')
                                : <span className="text-slate-400 text-[11px] font-normal">On Request</span>}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedEnquiry(enquiry)}
                                  className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800 transition-colors"
                                >
                                  Workspace
                                </button>

                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => handleMarkContacted(enquiry.id!, 'WHATSAPP')}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                                    title="Contact via WhatsApp"
                                  >
                                    <MessageSquare size={15} />
                                  </a>
                                )}

                                <button
                                  onClick={() => setDeleteConfirmId(enquiry.id!)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete Enquiry"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredEnquiries.map((enquiry) => {
                  const waUrl = buildAdminWhatsAppUrl(enquiry);
                  const followUpInfo = getFollowUpStatusInfo(enquiry.followUpAt, enquiry.status);

                  return (
                    <div
                      key={enquiry.id}
                      onClick={() => setSelectedEnquiry(enquiry)}
                      className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs text-left active:bg-slate-50"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {enquiry.enquiryId || 'NFA-REF'}
                        </span>
                        <select
                          value={enquiry.status || 'NEW'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(enquiry.id!, e.target.value as EnquiryDocument['status'])}
                          className={`px-2 py-0.5 rounded text-[10px] border outline-none ${getStatusBadgeStyle(enquiry.status)}`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="IN_DISCUSSION">In discussion</option>
                          <option value="CUSTOMIZATION">Journey being customized</option>
                          <option value="PROPOSAL_SENT">Proposal sent</option>
                          <option value="READY_TO_BOOK">Ready to book</option>
                          <option value="CONVERTED">Booked</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{enquiry.traveller?.name || 'Explorer'}</h4>
                        <p className="text-xs text-slate-500">{enquiry.traveller?.email} • {enquiry.traveller?.phone}</p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                        <div className="font-bold text-slate-900 truncate">{enquiry.itineraryTitle || 'General Expedition'}</div>
                        <div className="text-[11px] font-semibold text-amber-800">
                          📍 {enquiry.destination || 'Global'} • Travel: {enquiry.trip?.travelDate || 'TBD'}
                        </div>

                        {followUpInfo && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Follow-up:</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] border ${followUpInfo.color}`}>
                              {followUpInfo.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-bold text-slate-900">
                          Budget: {enquiry.preferences?.budget ? formatCurrency(enquiry.preferences.budget, enquiry.preferences.budgetCurrency) : 'On Request'}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleMarkContacted(enquiry.id!, 'WHATSAPP')}
                              className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1"
                            >
                              <MessageSquare size={12} /> WhatsApp
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedEnquiry(enquiry)}
                            className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold"
                          >
                            Workspace
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SECTION B: DIRECT PACKAGE BOOKINGS WORKSPACE ── */}
      {activeSection === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Traveler Name, Email, Phone, Booking ID, Package..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bookingFilters.paymentStatus}
                onChange={(e) => setBookingFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="all">Payment: All</option>
                <option value="captured">Captured (Paid)</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={bookingFilters.bookingStatus}
                onChange={(e) => setBookingFilters(prev => ({ ...prev, bookingStatus: e.target.value }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="all">Status: All</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-xl p-8 space-y-3">
              <Calendar size={28} className="text-slate-400 mx-auto" />
              <h4 className="font-brand font-black text-lg uppercase text-slate-800">No Direct Bookings Recorded</h4>
              <p className="text-xs text-slate-500">No direct package booking records match the filter criteria.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Primary Traveler</th>
                      <th className="py-3.5 px-4">Journey / Destination</th>
                      <th className="py-3.5 px-4">Agreed Price</th>
                      <th className="py-3.5 px-4">Booking Status</th>
                      <th className="py-3.5 px-4">Travel Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredBookings.map((b) => (
                      <React.Fragment key={b.id}>
                        <tr
                          onClick={() => setSelectedBooking(b)}
                          className="hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            <span className="px-2 py-1 bg-slate-900 text-[#F4BF4B] rounded border border-slate-900 font-bold">
                              {b.bookingReference || b.id?.slice(0, 10) || 'NFA-BK'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.primaryTraveler?.firstName || 'Explorer'} {b.primaryTraveler?.lastName || ''}
                            <div className="text-[11px] font-normal text-slate-500">{b.primaryTraveler?.email || 'No email'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {b.itineraryTitle || packages.find((p) => p.id === b.packageId)?.title || b.destination || 'Expedition Package'}
                            <div className="text-[10px] text-slate-400 font-normal">📍 {b.destination || 'Global'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {b.agreedPrice ? `₹${b.agreedPrice.toLocaleString()}` : formatCurrency(b.pricing?.total, b.pricing?.currency || 'USD')}
                          </td>
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={b.status || (b.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION')}
                              disabled={bookingUpdatingId === b.id}
                              onChange={(e) => handleUpdateBookingStatusLifecycle(b.id, e.target.value)}
                              className="px-2.5 py-1 rounded text-[10px] font-bold border-2 border-slate-300 outline-none cursor-pointer bg-white text-slate-900"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="PENDING_CONFIRMATION">PENDING CONFIRMATION</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {b.travelDate || 'Date not specified'}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedBooking(b)}
                                className="px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-bold hover:bg-slate-800"
                              >
                                Workspace
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Booking Row */}
                        {expandedBookingId === b.id && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={7} className="p-5">
                              <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Traveler Contact</span>
                                    <p className="font-bold text-slate-900">{b.primaryTraveler?.phone || 'No phone'}</p>
                                    <p className="text-slate-600">{b.primaryTraveler?.city || ''}, {b.primaryTraveler?.country || ''}</p>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Details</span>
                                    <p className="font-bold text-slate-900">
                                      Paid: {formatCurrency(b.payment?.amount, b.payment?.currency || 'USD')}
                                    </p>
                                    <p className="text-slate-600">Method: {b.payment?.method || 'Card'}</p>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Guests</span>
                                    <p className="font-bold text-slate-900">
                                      {b.travelers?.length || 1} Guest(s)
                                    </p>
                                  </div>
                                </div>

                                {b.internalNotes && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Internal Notes</span>
                                    <div className="p-3 bg-white border border-slate-200 rounded-lg whitespace-pre-wrap font-mono text-xs text-slate-800">
                                      {b.internalNotes}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <input
                                    type="text"
                                    value={bookingNoteInput}
                                    onChange={(e) => setBookingNoteInput(e.target.value)}
                                    placeholder="Add an internal booking note..."
                                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                                  />
                                  <button
                                    onClick={() => handleAddBookingInternalNote(b)}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                                  >
                                    Add Note
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DETAILED LEAD WORKSPACE SLIDE-OVER DRAWER ── */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              if (newNoteText.trim().length > 0) setShowUnsavedNoteWarning(true);
              else setSelectedEnquiry(null);
            }
          }}
        >
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col text-left">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-black text-lg bg-slate-100 text-slate-900 px-3 py-1 rounded border border-slate-300">
                    {selectedEnquiry.enquiryId || 'NFA-ENQUIRY'}
                  </span>
                  <select
                    value={selectedEnquiry.status || 'NEW'}
                    onChange={(e) => handleStatusChange(selectedEnquiry.id!, e.target.value as EnquiryDocument['status'])}
                    className={`px-3 py-1 rounded-md text-xs font-bold border outline-none ${getStatusBadgeStyle(selectedEnquiry.status)}`}
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_DISCUSSION">In discussion</option>
                    <option value="CUSTOMIZATION">Journey being customized</option>
                    <option value="PROPOSAL_SENT">Proposal sent</option>
                    <option value="READY_TO_BOOK">Ready to book</option>
                    <option value="CONVERTED">Booked</option>
                    <option value="CLOSED">Closed</option>
                  </select>

                  {(() => {
                    const fInfo = getFollowUpStatusInfo(selectedEnquiry.followUpAt, selectedEnquiry.status);
                    if (!fInfo) return null;
                    return <span className={`px-2.5 py-1 rounded-md text-xs border ${fInfo.color}`}>{fInfo.label}</span>;
                  })()}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Logged on {formatDateTime(selectedEnquiry.createdAt)}
                </span>
              </div>

              <button
                onClick={() => {
                  if (newNoteText.trim().length > 0) setShowUnsavedNoteWarning(true);
                  else setSelectedEnquiry(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Contact Bar */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {selectedEnquiry.traveller?.phone ? (
                <a
                  href={buildAdminWhatsAppUrl(selectedEnquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMarkContacted(selectedEnquiry.id!, 'WHATSAPP')}
                  className="p-2.5 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-xs"
                >
                  <MessageSquare size={15} /> WhatsApp
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Phone
                </button>
              )}

              {selectedEnquiry.traveller?.email ? (
                <a
                  href={`mailto:${selectedEnquiry.traveller.email}?subject=${encodeURIComponent(`NFA Travel Itinerary [${selectedEnquiry.enquiryId || 'NFA-ENQUIRY'}]`)}`}
                  onClick={() => handleMarkContacted(selectedEnquiry.id!, 'EMAIL')}
                  className="p-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Mail size={15} /> Direct Email
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Email
                </button>
              )}

              {selectedEnquiry.traveller?.phone ? (
                <a
                  href={`tel:${selectedEnquiry.traveller.phone}`}
                  onClick={() => handleMarkContacted(selectedEnquiry.id!, 'PHONE')}
                  className="p-2.5 bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Phone size={15} /> Call Phone
                </a>
              ) : (
                <button disabled className="p-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase cursor-not-allowed">
                  No Phone
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 shrink-0">
              <button
                onClick={() => setActiveDrawerTab('workspace')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                  activeDrawerTab === 'workspace' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Lead Workspace
              </button>
              <button
                onClick={() => setActiveDrawerTab('notes')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeDrawerTab === 'notes' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Internal Notes {notes.length > 0 && <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] rounded-full">{notes.length}</span>}
              </button>
              <button
                onClick={() => setActiveDrawerTab('timeline')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeDrawerTab === 'timeline' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Audit Timeline {activities.length > 0 && <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded-full">{activities.length}</span>}
              </button>
            </div>

            {/* TAB CONTENT 1: WORKSPACE */}
            {activeDrawerTab === 'workspace' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <SlidersHorizontal size={14} /> Lead Management Parameters
                    </span>
                    {savingLeadDetails && <span className="text-[10px] text-amber-800 animate-pulse font-bold">Saving...</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Assigned Admin Staff</label>
                      {selectedEnquiry.assignedTo ? (
                        <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck size={14} className="text-emerald-600" />
                            {selectedEnquiry.assignedToName || 'Admin Staff'}
                          </span>
                          <button onClick={() => handleAssignmentChange(selectedEnquiry.id!, false)} className="text-[10px] font-bold text-rose-700 hover:underline">
                            Unassign
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAssignmentChange(selectedEnquiry.id!, true)}
                          className="w-full py-2 px-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                        >
                          <UserPlus size={14} /> Assign to Me ({currentAdminName})
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">Next Follow-up Date & Time</label>
                        {selectedEnquiry.followUpAt && (
                          <button
                            onClick={() => {
                              setEditingFollowUp('');
                              handleSaveFollowUp(selectedEnquiry.id!, '');
                            }}
                            className="text-[10px] font-bold text-rose-700 hover:underline"
                          >
                            Clear Date
                          </button>
                        )}
                      </div>
                      <input
                        type="datetime-local"
                        value={editingFollowUp}
                        onChange={(e) => {
                          setEditingFollowUp(e.target.value);
                          handleSaveFollowUp(selectedEnquiry.id!, e.target.value);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 block uppercase">Planned Next Action</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingNextAction}
                          onChange={(e) => setEditingNextAction(e.target.value)}
                          placeholder="e.g. Call traveller, Send hotel options, Confirm budget..."
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-amber-500 font-medium"
                        />
                        <button
                          onClick={() => handleSaveNextAction(selectedEnquiry.id!, editingNextAction)}
                          className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs hover:bg-slate-800"
                        >
                          Save Action
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['Call traveller', 'Send hotel options', 'Send itinerary revision', 'Confirm availability', 'Wait for response'].map((chip) => (
                          <button
                            key={chip}
                            onClick={() => {
                              setEditingNextAction(chip);
                              handleSaveNextAction(selectedEnquiry.id!, chip);
                            }}
                            className="px-2 py-0.5 bg-white border border-slate-200 hover:border-amber-400 rounded text-[10px] text-slate-700 font-medium cursor-pointer"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedEnquiry.lastContactedAt && (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        Last contacted on <strong>{formatDateTime(selectedEnquiry.lastContactedAt)}</strong> via{' '}
                        <strong className="uppercase">{selectedEnquiry.lastContactedChannel || 'DIRECT'}</strong> by{' '}
                        <strong>{selectedEnquiry.lastContactedBy || 'Admin'}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* E6 BOOKING LIFECYCLE SECTION */}
                {(() => {
                  const linkedBooking = bookings.find(
                    (b) => b.enquiryId === selectedEnquiry.id || b.id === selectedEnquiry.bookingId || b.bookingReference === selectedEnquiry.bookingId
                  );

                  return (
                    <div className="space-y-3 p-4 bg-slate-900 text-white rounded-xl border-2 border-slate-900 shadow-md">
                      <div className="flex items-center justify-between border-b border-white/20 pb-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-[#F4BF4B] flex items-center gap-1.5">
                          <Calendar size={15} /> Booking Lifecycle Status (E6)
                        </span>
                        {linkedBooking ? (
                          <span className="font-mono font-bold text-xs bg-emerald-900 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500">
                            {linkedBooking.bookingReference || linkedBooking.id}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                            No Booking Created
                          </span>
                        )}
                      </div>

                      {linkedBooking ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Booking Status</label>
                            <select
                              value={linkedBooking.status || (linkedBooking.bookingStatus === 'confirmed' ? 'CONFIRMED' : 'PENDING_CONFIRMATION')}
                              onChange={(e) => handleUpdateBookingStatusLifecycle(linkedBooking.id!, e.target.value)}
                              className="w-full px-3 py-2 bg-white text-slate-900 rounded font-bold border-2 border-[#121212] outline-none cursor-pointer"
                            >
                              <option value="DRAFT">DRAFT</option>
                              <option value="PENDING_CONFIRMATION">PENDING CONFIRMATION</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="CANCELLED">CANCELLED</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Agreed Trip Investment</label>
                            <div className="p-2 bg-white/10 rounded font-bold text-emerald-400 text-sm border border-white/10">
                              {linkedBooking.agreedPrice ? `₹${linkedBooking.agreedPrice.toLocaleString()}` : 'Standard Package Price'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Lead is in discussion. Click below to establish an official booking record for this expedition.
                          </p>
                          <button
                            onClick={() => handleOpenCreateBookingModal(selectedEnquiry)}
                            className="px-5 py-2.5 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase tracking-wider rounded-lg hover:bg-amber-400 transition-all shrink-0 border border-[#F4BF4B]"
                          >
                            + CREATE BOOKING
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Explorer Profile */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">1. Explorer Profile & Contact Details</h4>
                    {selectedEnquiry.traveller?.userId || selectedEnquiry.customerId ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Linked Customer Account
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Guest Traveller
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Full Name</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedEnquiry.traveller?.name || 'Explorer'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Address</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.traveller?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Phone</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.traveller?.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">City / Address</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.traveller?.address || 'Not specified'}</span>
                    </div>
                    <div className="sm:col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Marketing Consent:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedEnquiry.marketingConsent ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {selectedEnquiry.marketingConsent ? '✓ Opted In' : 'No Marketing Consent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Expedition */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">2. Selected Expedition & Origin</h4>
                    {selectedEnquiry.itineraryId && (
                      <a
                        href={`/itinerary/${selectedEnquiry.itinerarySlug || selectedEnquiry.itineraryId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                      >
                        View Public Itinerary Page <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Itinerary Title</span>
                      <span className="font-brand font-black text-base text-slate-900 uppercase">
                        {selectedEnquiry.itineraryTitle || 'General Expedition'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Destination</span>
                        <span className="font-bold text-slate-900">📍 {selectedEnquiry.destination || 'Global'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Intended Travel Date</span>
                        <span className="font-bold text-slate-900">{selectedEnquiry.trip?.travelDate || 'TBD'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                        <span className="font-bold text-slate-900">{selectedEnquiry.trip?.numberOfDays || selectedEnquiry.duration || 'Custom'} Days</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Package Base Price</span>
                        <span className="font-bold text-slate-900">
                          {selectedEnquiry.pricing?.basePrice ? formatCurrency(selectedEnquiry.pricing.basePrice, selectedEnquiry.pricing.currency) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Enquiry Source</span>
                        <span className="font-bold text-slate-800">{selectedEnquiry.source || 'ITINERARY'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">CTA Entry Point</span>
                        <span className="font-bold text-slate-800">{selectedEnquiry.entryPoint || 'DIRECT'}</span>
                      </div>
                    </div>

                    {selectedEnquiry.sourceUrl && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Source Page URL</span>
                        <a
                          href={selectedEnquiry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-amber-800 hover:underline truncate block"
                        >
                          {selectedEnquiry.sourceUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Party & Commercials */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">3. Party Composition & Commercials</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Target Budget</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {selectedEnquiry.preferences?.budget
                          ? formatCurrency(selectedEnquiry.preferences.budget, selectedEnquiry.preferences.budgetCurrency)
                          : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Travellers</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedEnquiry.trip?.totalTravellers || 1} Person(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Adults Count</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.trip?.adults || 1} Adults</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Children Count</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.trip?.children || 0} Children</span>
                    </div>
                  </div>

                  {/* Child Ages Breakdown */}
                  {selectedEnquiry.trip?.childAges && selectedEnquiry.trip.childAges.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Child Ages Breakdown</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEnquiry.trip.childAges.map((age, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-800">
                            Child {idx + 1}: {age} yrs old
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferences & Special Demands */}
                {(selectedEnquiry.preferences?.preferences || selectedEnquiry.preferences?.specialRequests) && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">4. Travel Preferences & Special Demands</h4>
                    
                    {selectedEnquiry.preferences?.preferences && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Travel / Accommodation Preferences</span>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-medium">
                          {selectedEnquiry.preferences.preferences}
                        </div>
                      </div>
                    )}

                    {selectedEnquiry.preferences?.specialRequests && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Special Requests / Custom Notes</span>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                          {selectedEnquiry.preferences.specialRequests}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: NOTES */}
            {activeDrawerTab === 'notes' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText size={14} /> Add Internal Note (Admin-Only)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">{newNoteText.length} chars</span>
                  </div>

                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type internal notes regarding traveller preferences, custom itinerary changes, pricing notes..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-amber-500 resize-y"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 italic">Notes are strictly internal.</span>
                    <button
                      type="submit"
                      disabled={savingNote || !newNoteText.trim()}
                      className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingNote ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />} Add Note
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <History size={14} /> Note History ({notes.length})
                  </h4>

                  {notes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                      No internal notes recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-100 pb-1.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck size={13} className="text-amber-700" />
                              {note.authorName || 'Admin'}
                            </span>
                            <span className="font-mono text-slate-400 text-[10px]">{formatDateTime(note.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: TIMELINE */}
            {activeDrawerTab === 'timeline' && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                  <History size={14} /> Realtime Activity Audit Stream ({activities.length})
                </h4>

                {activities.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                    No activity logs recorded yet.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {activities.map((act) => (
                      <div key={act.id} className="relative group text-left">
                        <div className="absolute -left-6 top-0.5 size-5 rounded-full bg-slate-100 text-slate-700 border-2 border-white flex items-center justify-center shadow-xs">
                          <Clock size={12} />
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-900 uppercase">{act.type.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-[10px] text-slate-400">{formatDateTime(act.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">
                            By <strong>{act.actorName || 'System'}</strong>
                            {act.metadata?.from && act.metadata?.to && (
                              <span> • Status changed from <span className="font-bold">{act.metadata.from}</span> to <span className="font-bold">{act.metadata.to}</span></span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setDeleteConfirmId(selectedEnquiry.id!)}
                className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete Lead
              </button>
              <button
                onClick={() => {
                  if (newNoteText.trim().length > 0) setShowUnsavedNoteWarning(true);
                  else setSelectedEnquiry(null);
                }}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Note Warning Modal */}
      {showUnsavedNoteWarning && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase">Unsaved Note Draft</h3>
            </div>
            <p className="text-xs text-slate-600">
              You have typed an internal note that has not been saved yet. Are you sure you want to close without saving?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUnsavedNoteWarning(false)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowUnsavedNoteWarning(false);
                  setNewNoteText('');
                  setSelectedEnquiry(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="size-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-brand font-black text-xl uppercase text-slate-900">Delete Expedition Lead?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete this record? This action will permanently remove the document from Firestore.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEnquiry(deleteConfirmId)}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Modal (E6) */}
      {isCreateBookingModalOpen && createBookingTarget && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full border-2 border-slate-200 shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">E6 LIFECYCLE FOUNDATION</span>
                <h3 className="font-brand font-black text-2xl uppercase text-slate-900">CREATE EXPEDITION BOOKING</h3>
              </div>
              <button
                onClick={() => setIsCreateBookingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Enquiry Source Lead</span>
                <span className="font-mono font-bold text-slate-900">{createBookingTarget.enquiryId || createBookingTarget.id}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Traveller Name & Contact</span>
                <span className="font-bold text-slate-900">{createBookingTarget.traveller?.name} ({createBookingTarget.traveller?.email})</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Expedition</span>
                <span className="font-brand font-black text-slate-900 uppercase">{createBookingTarget.itineraryTitle || createBookingTarget.destination}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Initial Booking Status</label>
                <select
                  value={initialBookingStatus}
                  onChange={(e) => setInitialBookingStatus(e.target.value as any)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-xs outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING_CONFIRMATION">PENDING CONFIRMATION</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Agreed Price (₹)</label>
                <input
                  type="number"
                  value={agreedPriceInput}
                  onChange={(e) => setAgreedPriceInput(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg font-bold text-sm outline-none focus:border-amber-500"
                />
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                  Snapshot of agreed price. Package price changes later will not alter this booking snapshot.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsCreateBookingModalOpen(false)}
                disabled={creatingBooking}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBookingFromEnquiry}
                disabled={creatingBooking}
                className="px-6 py-2.5 bg-slate-900 text-[#F4BF4B] rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2"
              >
                {creatingBooking ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                {creatingBooking ? 'Creating Booking...' : 'CREATE BOOKING DOCUMENT'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── E7 ADMIN BOOKING DETAIL WORKSPACE SLIDE-OVER DRAWER ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 text-left"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null);
          }}
        >
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-black text-lg bg-slate-900 text-[#F4BF4B] px-3 py-1 rounded border border-slate-900">
                    {selectedBooking.bookingReference || selectedBooking.id}
                  </span>
                  <select
                    value={selectedBooking.status || 'PENDING_CONFIRMATION'}
                    onChange={(e) => handleUpdateBookingStatusLifecycle(selectedBooking.id!, e.target.value)}
                    className="px-3 py-1 rounded-md text-xs font-bold bg-white text-slate-900 border-2 border-slate-300 outline-none cursor-pointer"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_CONFIRMATION">PENDING CONFIRMATION</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Created on {formatDateTime(selectedBooking.createdAt)}
                </span>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* 1. CUSTOMER SECTION */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users size={14} /> Customer Profile
                </h4>
                {(selectedBooking.customerId || selectedBooking.userId) && (
                  <button
                    onClick={() => {
                      if (onOpenCustomer) {
                        onOpenCustomer(selectedBooking.customerId || selectedBooking.userId!);
                      }
                    }}
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    [ OPEN CUSTOMER 360 ] <ChevronRight size={12} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedBooking.primaryTraveler?.firstName} {selectedBooking.primaryTraveler?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email</span>
                  <span className="font-bold text-slate-900">{selectedBooking.primaryTraveler?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                  <span className="font-bold text-slate-900">{selectedBooking.primaryTraveler?.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Customer Reference</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBooking.customerId || selectedBooking.userId || 'NFA-C-GUEST'}</span>
                </div>
              </div>

              {/* Quick Contact Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                {selectedBooking.primaryTraveler?.phone ? (
                  <a
                    href={`https://wa.me/${selectedBooking.primaryTraveler.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#25D366] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#20bd5a] transition-colors"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                ) : (
                  <button disabled className="p-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-[11px] uppercase cursor-not-allowed">
                    No Phone
                  </button>
                )}

                {selectedBooking.primaryTraveler?.email ? (
                  <a
                    href={`mailto:${selectedBooking.primaryTraveler.email}?subject=${encodeURIComponent(`Expedition Booking Details [${selectedBooking.bookingReference || selectedBooking.id}]`)}`}
                    className="p-2 bg-slate-900 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors"
                  >
                    <Mail size={14} /> Direct Email
                  </a>
                ) : (
                  <button disabled className="p-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-[11px] uppercase cursor-not-allowed">
                    No Email
                  </button>
                )}

                {selectedBooking.primaryTraveler?.phone ? (
                  <a
                    href={`tel:${selectedBooking.primaryTraveler.phone}`}
                    className="p-2 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
                  >
                    <Phone size={14} /> Call Phone
                  </a>
                ) : (
                  <button disabled className="p-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-[11px] uppercase cursor-not-allowed">
                    No Phone
                  </button>
                )}
              </div>
            </div>

            {/* 2. JOURNEY SECTION */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Compass size={14} /> Expedition Journey & Destination
                </h4>
                {selectedBooking.itineraryId && (
                  <a
                    href={`/itinerary/${selectedBooking.itinerarySlug || selectedBooking.itineraryId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                  >
                    [ VIEW ITINERARY ] <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-brand font-black text-xl uppercase text-slate-900">
                  {selectedBooking.itineraryTitle || selectedBooking.destination || 'Expedition Journey'}
                </h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Destination</span>
                    <span className="font-bold text-slate-900">📍 {selectedBooking.destination || 'Global'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Travel Date</span>
                    <span className="font-bold text-slate-900">{selectedBooking.travelDate || 'Date not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Duration</span>
                    <span className="font-bold text-slate-900">{selectedBooking.duration ? `${selectedBooking.duration} Days` : 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TRAVELLERS SNAPSHOT SECTION */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                Travellers Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Travellers</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedBooking.numberOfTravelers || 1} Person(s)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Traveller</span>
                  <span className="font-bold text-slate-900">{selectedBooking.primaryTraveler?.firstName || 'Explorer'} {selectedBooking.primaryTraveler?.lastName || ''}</span>
                </div>
              </div>
            </div>

            {/* 4. PRICING SNAPSHOT SECTION */}
            <div className="space-y-3 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 border-b border-amber-200/80 pb-2">
                Pricing Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Base Package Price</span>
                  <span className="font-bold text-slate-700">
                    {selectedBooking.pricing?.total ? formatCurrency(selectedBooking.pricing.total, selectedBooking.pricing.currency) : 'Standard Package Rate'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-900 block uppercase">Agreed Price Snapshot</span>
                  <span className="font-brand font-black text-lg text-emerald-700">
                    {selectedBooking.agreedPrice ? `₹${selectedBooking.agreedPrice.toLocaleString()}` : 'Standard Rate'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-500 italic block pt-1 border-t border-amber-200/60">
                This is a fixed historical pricing snapshot. Future package price updates will not alter this booking value.
              </span>
            </div>

            {/* 4.5. E8 TRAVELLER-SAFE TRIP INFORMATION SECTION */}
            <div className="space-y-4 p-4 bg-emerald-50/70 border-2 border-emerald-300/80 rounded-xl">
              <div className="flex items-center justify-between border-b border-emerald-300/80 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                  <FileText size={15} className="text-emerald-700" /> Trip Information (Shared with Traveller)
                </span>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded border border-emerald-400">
                  ✓ VISIBLE ON MY TRIP
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">
                    Traveller Notes (Shared with Guest)
                  </label>
                  <textarea
                    rows={2}
                    value={editingTravellerNotes}
                    onChange={(e) => setEditingTravellerNotes(e.target.value)}
                    placeholder="e.g. Guest prefers early morning departures and quiet room location."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600 resize-y"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">
                    Trip Instructions / Arrival Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={editingTripInstructions}
                    onChange={(e) => setEditingTripInstructions(e.target.value)}
                    placeholder="e.g. Please arrive at the terminal 2 hours before departure. Private driver will hold NFA placard."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Accommodation Preference</label>
                    <input
                      type="text"
                      value={editingAccommodationPref}
                      onChange={(e) => setEditingAccommodationPref(e.target.value)}
                      placeholder="e.g. Boutique Eco Lodges"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Dietary Requirements</label>
                    <input
                      type="text"
                      value={editingDietaryPref}
                      onChange={(e) => setEditingDietaryPref(e.target.value)}
                      placeholder="e.g. Vegetarian / Gluten-Free"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Accessibility Needs</label>
                    <input
                      type="text"
                      value={editingAccessibilityPref}
                      onChange={(e) => setEditingAccessibilityPref(e.target.value)}
                      placeholder="e.g. Ground floor room preferred"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">Special Interests</label>
                    <input
                      type="text"
                      value={editingInterestsPref}
                      onChange={(e) => setEditingInterestsPref(e.target.value)}
                      placeholder="e.g. Photography, Culinary tours"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-300/60">
                  <span className="text-[10px] text-slate-500 italic">
                    Note: For internal ops team notes, use C2 Internal Notes instead.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveTripInformation}
                    disabled={savingTripInfo}
                    className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-lg text-xs hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {savingTripInfo ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {savingTripInfo ? 'Saving...' : 'SAVE TRIP INFORMATION'}
                  </button>
                </div>
              </div>
            </div>

            {/* 4.6. E10 TRIP OPERATIONS (ADMIN INTERNAL ONLY) */}
            <div className="space-y-4 p-5 bg-slate-900 text-white rounded-xl border-2 border-slate-900 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#F4BF4B] tracking-widest block">
                    ADMIN INTERNAL ONLY
                  </span>
                  <h4 className="font-brand font-black text-lg uppercase text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#F4BF4B]" /> TRIP OPERATIONS & READINESS
                  </h4>
                </div>

                {/* Operational Status Selector */}
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Preparation Status</span>
                  <select
                    value={selectedBooking.operationalStatus || 'NOT_STARTED'}
                    onChange={(e) => handleUpdateOperationalStatus(selectedBooking.id!, e.target.value)}
                    className="px-3 py-1 bg-slate-800 text-[#F4BF4B] border border-slate-700 rounded text-xs font-black outline-none cursor-pointer"
                  >
                    <option value="NOT_STARTED">NOT STARTED</option>
                    <option value="IN_PREPARATION">IN PREPARATION</option>
                    <option value="READY">READY</option>
                    <option value="TRAVELLER_BRIEFED">TRAVELLER BRIEFED</option>
                    <option value="TRIP_IN_PROGRESS">TRIP IN PROGRESS</option>
                    <option value="TRIP_COMPLETED">TRIP COMPLETED</option>
                  </select>
                </div>
              </div>

              {/* Derived Readiness Banner */}
              {(() => {
                const checklist = selectedBooking.operationalChecklist || {};
                const keys = [
                  'travellerDetailsVerified',
                  'travelDatesVerified',
                  'itineraryReviewed',
                  'accommodationReviewed',
                  'specialRequirementsReviewed',
                  'travellerInstructionsPrepared',
                  'documentsReady',
                  'travellerBriefed',
                  'finalConfirmationCompleted',
                ];
                const completedCount = keys.filter((k) => checklist[k as keyof typeof checklist]).length;
                const isAllComplete = completedCount === keys.length;
                const isConfirmed = selectedBooking.status === 'CONFIRMED';

                if (isConfirmed && isAllComplete) {
                  return (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2 font-black uppercase tracking-wider">
                        <CheckCircle2 size={16} className="text-emerald-400" /> READY FOR TRAVELLER
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                        {completedCount} / {keys.length} VERIFIED
                      </span>
                    </div>
                  );
                }

                if (!isConfirmed) {
                  return (
                    <div className="p-3 bg-amber-950/80 border border-amber-500 text-amber-300 rounded-lg text-xs font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
                        ⚠️ BOOKING NOT YET CONFIRMED
                      </span>
                      <span className="text-[10px] opacity-80">Final readiness pending confirmation</span>
                    </div>
                  );
                }

                return (
                  <div className="p-3 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-lg text-xs flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      PREPARATION IN PROGRESS
                    </span>
                    <span className="text-[10px] font-mono text-[#F4BF4B]">
                      {completedCount} / {keys.length} COMPLETED
                    </span>
                  </div>
                );
              })()}

              {/* Interactive Operational Checklist (9 items) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Operational Checklist
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {
                      [
                        'travellerDetailsVerified',
                        'travelDatesVerified',
                        'itineraryReviewed',
                        'accommodationReviewed',
                        'specialRequirementsReviewed',
                        'travellerInstructionsPrepared',
                        'documentsReady',
                        'travellerBriefed',
                        'finalConfirmationCompleted',
                      ].filter((k) => selectedBooking.operationalChecklist?.[k as keyof typeof selectedBooking.operationalChecklist]).length
                    } / 9 Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'travellerDetailsVerified', label: 'Traveller details verified' },
                    { key: 'travelDatesVerified', label: 'Travel dates verified' },
                    { key: 'itineraryReviewed', label: 'Itinerary reviewed' },
                    { key: 'accommodationReviewed', label: 'Accommodation reviewed' },
                    { key: 'specialRequirementsReviewed', label: 'Special requirements reviewed' },
                    { key: 'travellerInstructionsPrepared', label: 'Traveller instructions prepared' },
                    { key: 'documentsReady', label: 'Documents ready' },
                    { key: 'travellerBriefed', label: 'Traveller briefed' },
                    { key: 'finalConfirmationCompleted', label: 'Final confirmation completed' },
                  ].map((item) => {
                    const isChecked = !!selectedBooking.operationalChecklist?.[item.key as keyof typeof selectedBooking.operationalChecklist];
                    return (
                      <label
                        key={item.key}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-800 border-emerald-500/50 text-white'
                            : 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChecklist(selectedBooking.id!, item.key, isChecked)}
                          className="w-4 h-4 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold ${isChecked ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Accommodation Readiness Review */}
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] uppercase text-slate-400">Accommodation Readiness</span>
                  <select
                    value={selectedBooking.accommodationReadiness || 'NOT_REVIEWED'}
                    onChange={(e) => handleUpdateAccommodationReadiness(selectedBooking.id!, e.target.value)}
                    className="px-2 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded text-[10px] font-bold outline-none cursor-pointer"
                  >
                    <option value="NOT_REVIEWED">NOT REVIEWED</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="READY">READY</option>
                  </select>
                </div>
              </div>

              {/* Manual Communication CTAs */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="font-bold text-[10px] uppercase text-slate-400 block">
                  Traveller Communication Actions (Manual)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={(() => {
                      const phone = selectedBooking.primaryTraveler?.phone || '';
                      const cleanPhone = phone.replace(/[^0-9]/g, '');
                      const name = `${selectedBooking.primaryTraveler?.firstName || ''} ${selectedBooking.primaryTraveler?.lastName || ''}`.trim() || 'Explorer';
                      const ref = selectedBooking.bookingReference || selectedBooking.id || '';
                      const trip = selectedBooking.itineraryTitle || selectedBooking.destination || 'Expedition Journey';
                      const date = selectedBooking.travelDate || 'TBD';
                      const msg = `Hello ${name},\n\nThis is No Fixed Address regarding your upcoming journey:\n\nBooking Reference: ${ref}\nTrip: ${trip}\nTravel Date: ${date}\n\nWe are reaching out to confirm your trip details before departure. Please let us know if you need any assistance.\n\nRegards,\nNo Fixed Address Operations`;
                      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors"
                  >
                    WhatsApp Traveller
                  </a>

                  <a
                    href={(() => {
                      const email = selectedBooking.primaryTraveler?.email || '';
                      const name = `${selectedBooking.primaryTraveler?.firstName || ''} ${selectedBooking.primaryTraveler?.lastName || ''}`.trim() || 'Explorer';
                      const ref = selectedBooking.bookingReference || selectedBooking.id || '';
                      const trip = selectedBooking.itineraryTitle || selectedBooking.destination || 'Expedition Journey';
                      const date = selectedBooking.travelDate || 'TBD';
                      const subject = `Your No Fixed Address Journey — ${ref}`;
                      const body = `Hello ${name},\n\nThis is No Fixed Address regarding your upcoming journey:\n\nBooking Reference: ${ref}\nTrip: ${trip}\nTravel Date: ${date}\n\nWe are reaching out to confirm your trip details before departure. Please reply if you have any questions.\n\nRegards,\nNo Fixed Address Operations`;
                      return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    })()}
                    className="p-2.5 bg-blue-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-colors"
                  >
                    Email Traveller
                  </a>

                  <a
                    href={`tel:${selectedBooking.primaryTraveler?.phone || ''}`}
                    className="p-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-700 transition-colors"
                  >
                    Call Phone
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleMarkTravellerBriefed}
                  className="w-full py-2.5 bg-[#F4BF4B] text-[#121212] font-black text-xs uppercase tracking-widest rounded-lg border border-[#121212] hover:bg-white transition-colors cursor-pointer"
                >
                  [ MARK TRAVELLER BRIEFED ]
                </button>
              </div>
            </div>

            {/* 5. LINKED ENQUIRY SECTION */}
            {selectedBooking.enquiryId && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Linked Source Enquiry</h4>
                  <button
                    onClick={() => {
                      const linkedEnq = enquiries.find((e) => e.id === selectedBooking.enquiryId);
                      if (linkedEnq) {
                        setSelectedEnquiry(linkedEnq);
                        setActiveDrawerTab('workspace');
                        setSelectedBooking(null);
                      } else if (onOpenEnquiry) {
                        onOpenEnquiry(selectedBooking.enquiryId!);
                        setSelectedBooking(null);
                      }
                    }}
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    [ OPEN LEAD WORKSPACE ] <ChevronRight size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{selectedBooking.enquiryId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                    CONVERTED
                  </span>
                </div>
              </div>
            )}

            {/* 6. TRAVEL DOCUMENTS SECTION (E12) */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText size={14} /> Travel Documents
                  </h4>
                  {(() => {
                    const count = (selectedBooking.documents || []).length;
                    return count > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-full">
                        {count}
                      </span>
                    ) : null;
                  })()}
                </div>
                {!showDocPanel && (
                  <button
                    onClick={handleOpenUploadPanel}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-[#F4BF4B] rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
                  >
                    <Plus size={12} /> Upload Document
                  </button>
                )}
              </div>

              {/* Document Success Toast */}
              {docSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 rounded-lg">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> {docSuccess}
                </div>
              )}

              {/* Upload / Edit Panel */}
              {showDocPanel && (
                <div className="p-4 bg-white border-2 border-slate-900 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      {docPanelMode === 'upload' ? 'Upload New Document' : 'Edit Document Details'}
                    </span>
                    <button onClick={resetDocPanel} className="p-1 text-slate-400 hover:text-slate-700 rounded">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Document Type</label>
                    <select
                      value={docCategory}
                      onChange={(e) => {
                        const cat = e.target.value as BookingDocumentCategory;
                        setDocCategory(cat);
                        if (!docTitle || Object.values(DOC_CATEGORY_LABELS).includes(docTitle)) {
                          setDocTitle(DOC_CATEGORY_LABELS[cat]);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="ITINERARY">Itinerary PDF</option>
                      <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                      <option value="TRAVEL_VOUCHER">Travel Voucher</option>
                      <option value="ADDITIONAL">Additional Document</option>
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Document Title</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      placeholder="e.g. Italy Journey — Itinerary PDF"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      placeholder="e.g. Your complete day-by-day travel plan."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-slate-500"
                    />
                  </div>

                  {/* File (upload mode only) */}
                  {docPanelMode === 'upload' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
                        File (PDF, JPG, PNG · Max 20 MB)
                      </label>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png"
                        onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-[#F4BF4B] hover:file:bg-slate-800 cursor-pointer"
                      />
                      {docFile && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          Selected: {docFile.name} ({(docFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Visibility toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDocVisible(!docVisible)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${docVisible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${docVisible ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-xs font-bold text-slate-700">
                      {docVisible ? 'Visible to Traveller' : 'Admin Only (Hidden from Traveller)'}
                    </span>
                  </div>

                  {docError && (
                    <div className="p-2 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2">
                      <AlertCircle size={13} className="shrink-0" /> {docError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={docPanelMode === 'upload' ? handleUploadDocument : handleSaveDocMetadata}
                      disabled={docUploading}
                      className="flex-1 py-2 bg-slate-900 text-[#F4BF4B] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {docUploading ? <RefreshCw size={13} className="animate-spin" /> : docPanelMode === 'upload' ? <Upload size={13} /> : <Pencil size={13} />}
                      {docUploading ? 'Uploading...' : docPanelMode === 'upload' ? 'Upload' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={resetDocPanel} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Document List */}
              {(() => {
                const bookingDocs = selectedBooking.documents || [];
                const linkedPkg = packages.find((p: any) => p.id === selectedBooking.itineraryId || p.id === selectedBooking.packageId);
                const hasBookingItinerary = bookingDocs.some((d) => d.category === 'ITINERARY');
                const showPkgFallback = !hasBookingItinerary && linkedPkg?.itineraryPDF;

                if (bookingDocs.length === 0 && !showPkgFallback) {
                  return (
                    <div className="py-6 text-center border border-dashed border-slate-300 rounded-xl text-xs text-slate-400 font-medium">
                      No travel documents uploaded yet.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {/* Package-level itinerary PDF fallback */}
                    {showPkgFallback && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={16} className="text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-blue-900 truncate">Itinerary PDF</p>
                            <p className="text-[10px] text-blue-600">From package (fallback)</p>
                          </div>
                        </div>
                        <a
                          href={linkedPkg.itineraryPDF}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3 py-1.5 bg-blue-700 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-blue-800"
                        >
                          <Download size={11} /> View
                        </a>
                      </div>
                    )}

                    {/* Booking-specific documents */}
                    {bookingDocs.map((d) => (
                      <div key={d.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={16} className={`shrink-0 ${d.visibleToTraveller ? 'text-slate-700' : 'text-slate-400'}`} />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-slate-900 truncate">{d.title}</p>
                              <p className="text-[10px] text-slate-500">{DOC_CATEGORY_LABELS[d.category as BookingDocumentCategory] || d.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Visibility badge */}
                            <button
                              onClick={() => handleToggleDocVisibility(d)}
                              title={d.visibleToTraveller ? 'Visible to traveller — click to hide' : 'Hidden from traveller — click to show'}
                              className={`p-1.5 rounded ${d.visibleToTraveller ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                            >
                              {d.visibleToTraveller ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEditPanel(d)}
                              className="p-1.5 rounded text-blue-600 bg-blue-50 hover:bg-blue-100"
                              title="Edit details"
                            >
                              <Pencil size={12} />
                            </button>
                            {/* View */}
                            <a
                              href={d.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded text-slate-600 bg-slate-100 hover:bg-slate-200"
                              title="View / Download"
                            >
                              <Download size={12} />
                            </a>
                            {/* Delete */}
                            <button
                              onClick={() => setDeleteDocConfirmId(d.id)}
                              className="p-1.5 rounded text-rose-600 bg-rose-50 hover:bg-rose-100"
                              title="Remove document"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {d.description && (
                          <p className="text-[10px] text-slate-500 pl-6 leading-relaxed">{d.description}</p>
                        )}

                        <div className="pl-6 flex items-center gap-4 text-[10px] text-slate-400">
                          <span>Uploaded by {d.uploadedBy || 'Admin'}</span>
                          {d.fileSize && <span>{(d.fileSize / 1024 / 1024).toFixed(1)} MB</span>}
                          {!d.visibleToTraveller && (
                            <span className="text-amber-700 font-bold flex items-center gap-0.5">
                              <EyeOff size={10} /> Admin only
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* 5. TRAVELLER FEEDBACK & REVIEW (E46) */}
            {selectedBooking.feedback?.submitted ? (
              <div className="space-y-3 p-5 bg-[#FCFBF7] rounded-xl border-2 border-slate-900 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                      POST-TRIP EXPERIENCE
                    </span>
                    <h4 className="font-brand font-black text-sm uppercase text-slate-900 flex items-center gap-1.5">
                      <Star size={14} className="fill-[#F4BF4B] text-[#F4BF4B]" /> TRAVELLER FEEDBACK
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded font-black text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {selectedBooking.feedback.status || 'SUBMITTED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < selectedBooking.feedback!.overallRating
                            ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                            : 'text-slate-200'
                        }
                      />
                    ))}
                    <span className="font-bold text-xs text-slate-900 ml-1.5">
                      {selectedBooking.feedback.overallRating} / 5 Stars
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium">
                    Submitted {selectedBooking.feedback.submittedAt ? new Date(selectedBooking.feedback.submittedAt).toLocaleDateString('en-GB') : ''}
                  </span>
                </div>

                {selectedBooking.feedback.likedMost && (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">What they enjoyed:</span>
                    <p className="text-slate-700 italic">"{selectedBooking.feedback.likedMost}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Traveller Feedback</span>
                <span className="text-slate-400 font-bold uppercase text-[10px]">NOT SHARED</span>
              </div>
            )}

            {/* 6. LINKED ENQUIRY SECTION */}
            {selectedBooking.enquiryId && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Linked Source Enquiry</h4>
                  <button
                    onClick={() => {
                      const linkedEnq = enquiries.find((e) => e.id === selectedBooking.enquiryId);
                      if (linkedEnq) {
                        setSelectedEnquiry(linkedEnq);
                        setActiveDrawerTab('workspace');
                        setSelectedBooking(null);
                      } else if (onOpenEnquiry) {
                        onOpenEnquiry(selectedBooking.enquiryId!);
                        setSelectedBooking(null);
                      }
                    }}
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    [ OPEN LEAD WORKSPACE ] <ChevronRight size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-slate-900">{selectedBooking.enquiryId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                    CONVERTED
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DOCUMENT DELETE CONFIRMATION MODAL (E12) ── */}
      {deleteDocConfirmId && (
        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border-2 border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-rose-700">
              <Trash2 size={20} />
              <h3 className="font-brand font-black text-base uppercase">Remove this document?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Customers will no longer be able to access this document. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteDocConfirmId(null)}
                disabled={deletingDoc}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={deletingDoc}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deletingDoc ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {deletingDoc ? 'Removing...' : 'Remove Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

