import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
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
  CheckSquare,
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
} from '../../services/firebaseService';
import { EnquiryDocument, InternalNote, EnquiryActivity } from '../../types/database';

export const AdminEnquiriesManager: React.FC = () => {
  const { user } = useAuth();
  const currentAdminName = user?.displayName || user?.email?.split('@')[0] || 'Admin User';
  const currentAdminId = user?.uid || 'admin_user';

  // ── Realtime Enquiries State ──
  const [enquiries, setEnquiries] = useState<EnquiryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryDocument | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [realtimeToast, setRealtimeToast] = useState<string | null>(null);

  // ── Detail Workspace Subcollection Realtime States (C2) ──
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [activities, setActivities] = useState<EnquiryActivity[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'workspace' | 'notes' | 'timeline'>('workspace');
  const [showUnsavedNoteWarning, setShowUnsavedNoteWarning] = useState(false);

  // ── Lead Management Workspace Form States (C2) ──
  const [editingFollowUp, setEditingFollowUp] = useState('');
  const [editingNextAction, setEditingNextAction] = useState('');
  const [savingLeadDetails, setSavingLeadDetails] = useState(false);

  // ── Search & Filter States ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [dateFilterType, setDateFilterType] = useState<'created' | 'travel'>('created');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');
  const [followUpFilter, setFollowUpFilter] = useState<string>('ALL');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // ── E11 Sales Workflow States ──
  const [showClosedReasonModal, setShowClosedReasonModal] = useState(false);
  const [closingEnquiryId, setClosingEnquiryId] = useState<string | null>(null);
  const [selectedClosedReason, setSelectedClosedReason] = useState<string>('TRAVELLER NOT INTERESTED');
  const [closedReasonDetailsText, setClosedReasonDetailsText] = useState('');

  // Qualification & Proposal Form States
  const [editingPriority, setEditingPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [editingIntent, setEditingIntent] = useState<string>('EXPLORING');
  const [editingFlexibility, setEditingFlexibility] = useState<string>('FIXED_DATES');
  const [editingEstValue, setEditingEstValue] = useState<string>('');
  const [editingProposalStatus, setEditingProposalStatus] = useState<string>('NOT_PREPARED');
  const [editingProposalRef, setEditingProposalRef] = useState<string>('');
  const [savingQualification, setSavingQualification] = useState(false);

  // ── 1. FIRESTORE REALTIME ENQUIRIES LISTENER ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    let isInitialLoad = true;

    try {
      const enquiriesRef = collection(db, 'Enquiries');
      const q = query(enquiriesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: EnquiryDocument[] = [];
          snapshot.forEach((doc) => {
            loaded.push({
              id: doc.id,
              ...(doc.data() as Omit<EnquiryDocument, 'id'>),
            });
          });

          if (!isInitialLoad && loaded.length > enquiries.length) {
            const newest = loaded[0];
            if (newest?.enquiryId) {
              setRealtimeToast(`New enquiry received: ${newest.enquiryId} (${newest.traveller?.name || 'Explorer'})`);
              setTimeout(() => setRealtimeToast(null), 6000);
            }
          }

          isInitialLoad = false;
          setEnquiries(loaded);
          setLoading(false);
        },
        (err) => {
          console.error('Realtime Enquiries listener error:', err);
          setError('Couldn\'t load enquiries. Please check your connection and try again.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up onSnapshot listener:', err);
      setError('Couldn\'t connect to updates. Please try again.');
      setLoading(false);
    }
  }, []);

  // ── 2. SUBCOLLECTION REALTIME LISTENERS (Notes & Activities for Selected Enquiry) ──
  useEffect(() => {
    if (!selectedEnquiry || !selectedEnquiry.id) {
      setNotes([]);
      setActivities([]);
      setNewNoteText('');
      setEditingNextAction('');
      setEditingFollowUp('');
      return;
    }

    // Populate editing form states from selected enquiry
    setEditingNextAction(selectedEnquiry.nextAction || '');
    setEditingPriority(selectedEnquiry.priority || 'NORMAL');
    setEditingIntent(selectedEnquiry.travellerIntent || 'EXPLORING');
    setEditingFlexibility(selectedEnquiry.travelFlexibility || 'FIXED_DATES');
    setEditingEstValue(selectedEnquiry.estimatedBookingValue ? String(selectedEnquiry.estimatedBookingValue) : '');
    setEditingProposalStatus(selectedEnquiry.proposalStatus || 'NOT_PREPARED');
    setEditingProposalRef(selectedEnquiry.proposalReference || '');
    if (selectedEnquiry.followUpAt) {
      try {
        const d = (selectedEnquiry.followUpAt as any)?.toDate
          ? (selectedEnquiry.followUpAt as any).toDate()
          : new Date(selectedEnquiry.followUpAt as any);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DDThh:mm for datetime-local input
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

    // Subscribe to internal notes
    const unsubNotes = subscribeToInternalNotes(
      selectedEnquiry.id,
      (loadedNotes) => setNotes(loadedNotes),
      (err) => console.warn('Notes subscription notice:', err)
    );

    // Subscribe to activity audit timeline
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

  // Keep selectedEnquiry synced with main dataset updates
  useEffect(() => {
    if (selectedEnquiry && selectedEnquiry.id) {
      const updated = enquiries.find((e) => e.id === selectedEnquiry.id);
      if (updated) {
        setSelectedEnquiry(updated);
      }
    }
  }, [enquiries]);

  // ── 3. DYNAMIC SUMMARY STATS COUNTERS & CONVERSION RATE ──
  const stats = useMemo(() => {
    const total = enquiries.length;
    const countNew = enquiries.filter((e) => e.status === 'NEW').length;
    const countContacted = enquiries.filter((e) => e.status === 'CONTACTED').length;
    const countInDiscussion = enquiries.filter((e) => e.status === 'IN_DISCUSSION').length;
    const countCustomization = enquiries.filter((e) => e.status === 'CUSTOMIZATION').length;
    const countProposalSent = enquiries.filter((e) => e.status === 'PROPOSAL_SENT').length;
    const countReadyToBook = enquiries.filter((e) => e.status === 'READY_TO_BOOK').length;
    const countConverted = enquiries.filter((e) => e.status === 'CONVERTED').length;
    const countClosed = enquiries.filter((e) => e.status === 'CLOSED').length;

    // Follow-up stats
    const now = new Date();
    let countOverdue = 0;
    let countToday = 0;

    enquiries.forEach((e) => {
      if (e.status === 'CLOSED' || e.status === 'CONVERTED' || !e.followUpAt) return;
      try {
        const d = (e.followUpAt as any)?.toDate ? (e.followUpAt as any).toDate() : new Date(e.followUpAt as any);
        if (isNaN(d.getTime())) return;
        if (d < now) {
          countOverdue++;
        } else if (d.toDateString() === now.toDateString()) {
          countToday++;
        }
      } catch {
        // ignore invalid dates
      }
    });

    const eligible = total - countClosed;
    const conversionRate = eligible > 0 ? ((countConverted / eligible) * 100).toFixed(1) : '0';

    return {
      total,
      new: countNew,
      contacted: countContacted,
      inDiscussion: countInDiscussion,
      customization: countCustomization,
      proposalSent: countProposalSent,
      readyToBook: countReadyToBook,
      converted: countConverted,
      closed: countClosed,
      overdue: countOverdue,
      today: countToday,
      conversionRate,
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

  // ── 5. FILTERED ENQUIRIES LIST ──
  const filteredEnquiries = useMemo(() => {
    const now = new Date();

    return enquiries
      .filter((item) => {
        // Status Filter
        if (statusFilter !== 'ALL' && item.status !== statusFilter) {
          return false;
        }

        // Priority Filter
        if (priorityFilter !== 'ALL') {
          const itemPriority = item.priority || 'NORMAL';
          if (itemPriority !== priorityFilter) return false;
        }

        // Source / EntryPoint Filter
        if (sourceFilter !== 'ALL') {
          if (sourceFilter === 'ITINERARY' && item.source !== 'ITINERARY') return false;
          if (sourceFilter === 'CONTACT_PAGE' && item.source !== 'CONTACT_PAGE') return false;
          if (sourceFilter === 'HERO' && item.entryPoint !== 'HERO') return false;
          if (sourceFilter === 'STICKY_CARD' && item.entryPoint !== 'STICKY_CARD') return false;
          if (sourceFilter === 'MOBILE_STICKY' && item.entryPoint !== 'MOBILE_STICKY') return false;
        }

        // Assignment Filter
        if (assignmentFilter !== 'ALL') {
          if (assignmentFilter === 'UNASSIGNED' && item.assignedTo) return false;
          if (assignmentFilter === 'ME' && item.assignedTo !== currentAdminId) return false;
        }

        // Follow-up Filter
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

        // Search Query
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

        // Date Range Filter
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

  // ── 6. REALTIME STATUS UPDATE ACTION ──
  const handleStatusChange = async (docId: string, newStatus: EnquiryDocument['status']) => {
    if (!docId) return;
    if (newStatus === 'CLOSED') {
      setClosingEnquiryId(docId);
      setShowClosedReasonModal(true);
      return;
    }

    const previousStatus = enquiries.find((e) => e.id === docId)?.status || 'NEW';
    setStatusUpdatingId(docId);
    setError(null);

    // Optimistic local update
    setEnquiries((prev) => prev.map((e) => (e.id === docId ? { ...e, status: newStatus } : e)));

    try {
      await updateDocument('Enquiries', docId, {
        status: newStatus,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: currentAdminName,
        updatedAt: Timestamp.now(),
      });

      // Record activity audit trail
      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'STATUS_CHANGED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { from: previousStatus, to: newStatus },
      });

      setActionSuccess(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating enquiry status:', err);
      setError('Unable to update enquiry status in Firestore.');
      // Rollback optimistic update
      setEnquiries((prev) => prev.map((e) => (e.id === docId ? { ...e, status: previousStatus } : e)));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ── E11 CLOSED REASON ACTION ──
  const handleConfirmCloseLead = async () => {
    if (!closingEnquiryId) return;
    const docId = closingEnquiryId;
    const previousStatus = enquiries.find((e) => e.id === docId)?.status || 'NEW';

    try {
      await updateDocument('Enquiries', docId, {
        status: 'CLOSED',
        closedReason: selectedClosedReason,
        closedReasonDetails: closedReasonDetailsText.trim() || null,
        closedAt: Timestamp.now(),
        closedBy: currentAdminName,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: currentAdminName,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'LEAD_CLOSED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { from: previousStatus, reason: selectedClosedReason, details: closedReasonDetailsText.trim() },
      });

      setActionSuccess('Lead marked as CLOSED');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error closing lead:', err);
      setError('Unable to close lead.');
    } finally {
      setShowClosedReasonModal(false);
      setClosingEnquiryId(null);
      setClosedReasonDetailsText('');
    }
  };

  // ── E11 REOPEN CLOSED LEAD ACTION ──
  const handleReopenLead = async (docId: string, targetStatus: EnquiryDocument['status'] = 'IN_DISCUSSION') => {
    if (!docId) return;

    try {
      await updateDocument('Enquiries', docId, {
        status: targetStatus,
        closedReason: null,
        closedReasonDetails: null,
        closedAt: null,
        closedBy: null,
        statusChangedAt: Timestamp.now(),
        statusChangedBy: currentAdminName,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'LEAD_REOPENED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { to: targetStatus },
      });

      setActionSuccess(`Lead reopened in ${targetStatus.replace(/_/g, ' ')} stage.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error reopening lead:', err);
      setError('Unable to reopen lead.');
    }
  };

  // ── E11 PRIORITY ACTION ──
  const handlePriorityChange = async (docId: string, newPriority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => {
    if (!docId) return;

    try {
      await updateDocument('Enquiries', docId, {
        priority: newPriority,
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(docId, {
        enquiryId: docId,
        type: 'LEAD_PRIORITY_CHANGED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { priority: newPriority },
      });

      setActionSuccess(`Priority set to ${newPriority}`);
      setTimeout(() => setActionSuccess(null), 2000);
    } catch (err) {
      console.error('Error updating priority:', err);
      setError('Unable to update priority.');
    }
  };

  // ── E11 QUALIFICATION & PROPOSAL SAVE ──
  const handleSaveQualification = async () => {
    if (!selectedEnquiry?.id) return;
    setSavingQualification(true);

    try {
      const numericEst = editingEstValue ? parseFloat(editingEstValue) : null;
      const isPropSent = editingProposalStatus === 'SENT';

      await updateDocument('Enquiries', selectedEnquiry.id, {
        priority: editingPriority,
        travellerIntent: editingIntent,
        travelFlexibility: editingFlexibility,
        estimatedBookingValue: isNaN(numericEst as number) ? null : numericEst,
        proposalStatus: editingProposalStatus,
        proposalReference: editingProposalRef.trim() || null,
        proposalSentAt: isPropSent ? Timestamp.now() : (selectedEnquiry.proposalSentAt || null),
        proposalSentBy: isPropSent ? currentAdminName : (selectedEnquiry.proposalSentBy || null),
        updatedAt: Timestamp.now(),
      });

      await addEnquiryActivity(selectedEnquiry.id, {
        enquiryId: selectedEnquiry.id,
        type: 'LEAD_QUALIFIED',
        actorId: currentAdminId,
        actorName: currentAdminName,
        metadata: { priority: editingPriority, intent: editingIntent, estValue: String(numericEst) },
      });

      setActionSuccess('Lead qualification and proposal details saved.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving qualification:', err);
      setError('Unable to save qualification details.');
    } finally {
      setSavingQualification(false);
    }
  };

  // ── 7. ASSIGNMENT ACTION ──
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
      console.error('Error updating lead assignment:', err);
      setError('Failed to update lead assignment.');
    } finally {
      setSavingLeadDetails(false);
    }
  };

  // ── 8. SAVE FOLLOW-UP DATE & TIME ──
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
        metadata: {
          followUpAt: timestampValue ? isoValue.replace('T', ' ') : 'Cleared',
        },
      });

      setActionSuccess(timestampValue ? 'Follow-up date scheduled' : 'Follow-up date cleared');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving follow-up date:', err);
      setError('Failed to update follow-up date.');
    } finally {
      setSavingLeadDetails(false);
    }
  };

  // ── 9. SAVE NEXT ACTION ──
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

  // ── 10. MARK CONTACTED & ACTION TRIGGERS ──
  const handleMarkContacted = async (docId: string, channel: 'WHATSAPP' | 'EMAIL' | 'PHONE') => {
    if (!docId) return;

    try {
      await updateDocument('Enquiries', docId, {
        lastContactedAt: Timestamp.now(),
        lastContactedBy: currentAdminName,
        lastContactedChannel: channel,
        updatedAt: Timestamp.now(),
      });

      const actType =
        channel === 'WHATSAPP'
          ? 'WHATSAPP_OPENED'
          : channel === 'EMAIL'
          ? 'EMAIL_OPENED'
          : 'PHONE_INITIATED';

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
      console.warn('Notice recording contact action:', err);
    }
  };

  // ── 11. ADD INTERNAL NOTE ──
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
      console.error('Error adding internal note:', err);
      setError('Failed to save internal note.');
    } finally {
      setSavingNote(false);
    }
  };

  // ── 12. DELETE ENQUIRY ACTION ──
  const handleDeleteEnquiry = async (docId: string) => {
    if (!docId) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteDocument('Enquiries', docId);
      setActionSuccess('Enquiry deleted successfully.');
      setDeleteConfirmId(null);
      if (selectedEnquiry?.id === docId) {
        setSelectedEnquiry(null);
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting enquiry:', err);
      setError('Failed to delete enquiry document.');
    } finally {
      setDeleting(false);
    }
  };

  // ── 13. DRAWER CLOSE WITH UNSAVED NOTE CHECK ──
  const handleAttemptCloseDrawer = () => {
    if (newNoteText.trim().length > 0) {
      setShowUnsavedNoteWarning(true);
    } else {
      setSelectedEnquiry(null);
    }
  };

  // ── 14. FORMATTING HELPERS ──
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
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
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
    const ref = enquiry.enquiryId || 'NFA-DOSSIER';
    const trip = enquiry.itineraryTitle || 'Expedition';
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

      {/* Header & Live Connection Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans font-bold text-xl text-slate-900 tracking-tight">Lead & Expedition Intelligence</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping"></span> Live • Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time lead management workspace, follow-up scheduler, internal notes, and activity timeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500">
            {filteredEnquiries.length} of {enquiries.length} Leads
          </span>
        </div>
      </div>

      {/* ── 2. DYNAMIC STATS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* Total */}
        <div 
          onClick={() => { setStatusFilter('ALL'); setFollowUpFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL' && followUpFilter === 'ALL' ? 'bg-[#121212] text-white border-[#121212] shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Enquiries</span>
          <span className="font-brand font-black text-xl tracking-tight">{stats.total}</span>
        </div>

        {/* NEW */}
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

        {/* OVERDUE FOLLOW-UPS */}
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

        {/* DUE TODAY */}
        <div 
          onClick={() => { setFollowUpFilter('DUE_TODAY'); setStatusFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${followUpFilter === 'DUE_TODAY' ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md' : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-900/70 block mb-1">Due Today</span>
          <span className="font-brand font-black text-xl text-amber-950 tracking-tight">{stats.today}</span>
        </div>

        {/* CONTACTED */}
        <div 
          onClick={() => { setStatusFilter('CONTACTED'); setFollowUpFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONTACTED' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-900/70 block mb-1">Contacted</span>
          <span className="font-brand font-black text-xl text-blue-950 tracking-tight">{stats.contacted}</span>
        </div>

        {/* IN DISCUSSION */}
        <div 
          onClick={() => { setStatusFilter('IN_DISCUSSION'); setFollowUpFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'IN_DISCUSSION' ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-900/70 block mb-1">In Discussion</span>
          <span className="font-brand font-black text-xl text-purple-950 tracking-tight">{stats.inDiscussion}</span>
        </div>

        {/* CONVERTED */}
        <div 
          onClick={() => { setStatusFilter('CONVERTED'); setFollowUpFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CONVERTED' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-900/70 block mb-1">Converted</span>
          <span className="font-brand font-black text-xl text-emerald-950 tracking-tight">{stats.converted}</span>
        </div>

        {/* CLOSED */}
        <div 
          onClick={() => { setStatusFilter('CLOSED'); setFollowUpFilter('ALL'); }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${statusFilter === 'CLOSED' ? 'bg-slate-800 text-white border-slate-900 shadow-md' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Closed</span>
          <span className="font-brand font-black text-xl text-slate-800 tracking-tight">{stats.closed}</span>
        </div>
      </div>

      {/* ── 3. SEARCH & CONTROLS BAR ── */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
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

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
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

            {/* Follow-up Filter (C2) */}
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

            {/* Assignment Filter (C2) */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="ALL">Assignee: All</option>
              <option value="ME">Assigned to Me</option>
              <option value="UNASSIGNED">Unassigned</option>
            </select>

            {/* Source / Entry Point Filter */}
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

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer shrink-0"
              title="Toggle sort order"
            >
              {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. MAIN ENQUIRIES TABLE & MOBILE CARDS ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="animate-spin text-slate-400 mx-auto" size={28} />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Loading leads workspace...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-xl border border-slate-200 p-8">
          <div className="size-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass size={28} />
          </div>
          <div>
            <h4 className="font-brand font-black text-lg uppercase text-slate-800">No Leads Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No expedition leads match your active search or filter criteria.
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
          {/* Desktop/Tablet Table */}
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
                        {/* Reference ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200 group-hover:border-slate-400">
                            {enquiry.enquiryId || 'NFA-REF'}
                          </span>
                          <span className="block text-[9px] text-slate-400 font-normal mt-1">
                            {formatDate(enquiry.createdAt)}
                          </span>
                        </td>

                        {/* Traveller Info */}
                        <td className="py-3.5 px-4 max-w-[180px]">
                          <div className="font-bold text-slate-900 truncate">{enquiry.traveller?.name || 'Explorer'}</div>
                          <div className="text-[11px] text-slate-500 truncate">{enquiry.traveller?.email}</div>
                          {enquiry.traveller?.phone && (
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">{enquiry.traveller.phone}</div>
                          )}
                        </td>

                        {/* Itinerary & Destination */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <div className="font-bold text-slate-900 truncate" title={enquiry.itineraryTitle}>
                            {enquiry.itineraryTitle || 'General Expedition'}
                          </div>
                          <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mt-0.5">
                            <span>📍 {enquiry.destination || 'Global'}</span>
                            <span className="text-slate-400">• {enquiry.trip?.travelDate || 'TBD'}</span>
                          </div>
                        </td>

                        {/* Follow-up / Next Action (C2) */}
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

                        {/* Staff Assignee (C2) */}
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

                        {/* Status Dropdown */}
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

                        {/* Budget */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {enquiry.preferences?.budget
                            ? formatCurrency(enquiry.preferences.budget, enquiry.preferences.budgetCurrency || 'INR')
                            : <span className="text-slate-400 text-[11px] font-normal">On Request</span>}
                        </td>

                        {/* Actions */}
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

      {/* ── 5. LEAD MANAGEMENT WORKSPACE SLIDE-OVER DRAWER (C2) ── */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleAttemptCloseDrawer();
          }}
        >
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in slide-in-from-right duration-300 border-l border-slate-200 flex flex-col">
            
            {/* Drawer Top Header & Quick Actions */}
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

                  {/* Derived Follow-up Badge */}
                  {(() => {
                    const fInfo = getFollowUpStatusInfo(selectedEnquiry.followUpAt, selectedEnquiry.status);
                    if (!fInfo) return null;
                    return (
                      <span className={`px-2.5 py-1 rounded-md text-xs border ${fInfo.color}`}>
                        {fInfo.label}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Logged on {formatDateTime(selectedEnquiry.createdAt)}
                </span>
              </div>

              <button
                onClick={handleAttemptCloseDrawer}
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

            {/* Navigation Tabs (Workspace vs Notes vs Activity Timeline) */}
            <div className="flex border-b border-slate-200 shrink-0">
              <button
                onClick={() => setActiveDrawerTab('workspace')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all ${
                  activeDrawerTab === 'workspace'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Lead Workspace
              </button>
              <button
                onClick={() => setActiveDrawerTab('notes')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeDrawerTab === 'notes'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Internal Notes {notes.length > 0 && <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[10px] rounded-full">{notes.length}</span>}
              </button>
              <button
                onClick={() => setActiveDrawerTab('timeline')}
                className={`px-4 py-2 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeDrawerTab === 'timeline'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                Audit Timeline {activities.length > 0 && <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] rounded-full">{activities.length}</span>}
              </button>
            </div>

            {/* TAB CONTENT 1: LEAD WORKSPACE */}
            {activeDrawerTab === 'workspace' && (() => {
              // E23 Lead Qualification & Completeness Calculation
              const pref = selectedEnquiry.preferences || {};
              const trip = selectedEnquiry.trip || ({} as any);
              
              const checks = [
                Boolean(selectedEnquiry.itineraryTitle || selectedEnquiry.destination),
                Boolean(trip.travelDate || selectedEnquiry.preferredTravelDateFrom),
                Boolean(trip.totalTravellers && trip.totalTravellers > 0),
                Boolean(pref.budget),
                Boolean(pref.travelStyle?.length || pref.preferences),
                Boolean(pref.accommodationStyle),
                Boolean(pref.dietary || pref.specialOccasion),
                Boolean(pref.specialRequests),
                Boolean(selectedEnquiry.traveller?.phone),
                Boolean(selectedEnquiry.traveller?.email),
              ];
              const score = checks.filter(Boolean).length;

              const nextQuestions: string[] = [];
              if (!trip.travelDate || trip.travelDate === 'Flexible') nextQuestions.push('Confirm exact travel dates & flexibility window');
              if (!pref.accommodationStyle) nextQuestions.push('Ask preferred accommodation style (Boutique, Luxury, Lodges)');
              if (!pref.budget) nextQuestions.push('Ask approximate travel budget per person');
              if (!pref.travelStyle || pref.travelStyle.length === 0) nextQuestions.push('Confirm travel pace & style preferences');
              if (trip.children > 0 && (!trip.childAges || trip.childAges.length === 0)) nextQuestions.push('Confirm children ages for rooming & permits');

              return (
                <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                  
                  {/* ── E23 EXECUTIVE TRAVEL REQUEST SUMMARY CARD ── */}
                  <div className="p-4 bg-[#121212] text-white rounded-xl border border-slate-900 space-y-4 shadow-md">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F4BF4B] block">
                          Travel Request Summary
                        </span>
                        <h4 className="font-brand font-black text-base uppercase tracking-tight text-white mt-0.5">
                          {selectedEnquiry.itineraryTitle || selectedEnquiry.destination || 'Custom Expedition'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                          Travel Plan Details
                        </span>
                        <span className="text-xs font-black text-[#F4BF4B] bg-white/10 px-2 py-0.5 rounded border border-white/20 inline-block mt-0.5">
                          {score} / 10 Provided
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white/5 rounded border border-white/10 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Travel Dates</span>
                        <span className="font-bold text-white block">
                          {selectedEnquiry.travelFlexibility === 'FLEXIBLE_DATES'
                            ? `Range: ${selectedEnquiry.preferredTravelDateFrom || 'TBD'} to ${selectedEnquiry.preferredTravelDateTo || 'TBD'}`
                            : selectedEnquiry.travelFlexibility === 'VERY_FLEXIBLE'
                            ? 'Dates Very Flexible'
                            : trip.travelDate || 'TBD'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white/5 rounded border border-white/10 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Expedition Party</span>
                        <span className="font-bold text-white block">
                          {trip.totalTravellers || 2} Pax ({trip.adults || 2} Adults{trip.children > 0 ? `, ${trip.children} Children` : ''})
                        </span>
                        {trip.children > 0 && trip.childAges && (
                          <span className="text-[10px] text-amber-300 block">Ages: {trip.childAges.join(', ')}</span>
                        )}
                      </div>

                      <div className="p-2.5 bg-white/5 rounded border border-white/10 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Travel Style</span>
                        <span className="font-bold text-white block">
                          {pref.travelStyle?.length ? pref.travelStyle.join(' • ') : (pref.preferences || 'Standard Pace')}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white/5 rounded border border-white/10 space-y-1">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Accommodation</span>
                        <span className="font-bold text-white block">
                          {pref.accommodationStyle || 'Boutique / Standard'}
                        </span>
                      </div>
                    </div>

                    {(pref.specialOccasion || pref.dietary || pref.accessibility) && (
                      <div className="p-3 bg-[#F4BF4B]/10 border border-[#F4BF4B]/30 rounded text-xs space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#F4BF4B] block">Preferences & Notes</span>
                        <div className="flex flex-wrap gap-2 text-white text-[11px] font-semibold">
                          {pref.specialOccasion && <span>🎉 Occasion: <strong>{pref.specialOccasion}</strong></span>}
                          {pref.dietary && <span>🥗 Dietary: <strong>{pref.dietary}</strong></span>}
                          {pref.accessibility && <span>♿ Accessibility: <strong>{pref.accessibility}</strong></span>}
                        </div>
                      </div>
                    )}

                    {nextQuestions.length > 0 && (
                      <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded text-xs space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-300 block">Suggested Next Questions for Traveller</span>
                        <ul className="list-disc list-inside text-rose-200 text-[11px] space-y-0.5">
                          {nextQuestions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                
                {/* ── C2 CONTROL PANEL: ASSIGNMENT, FOLLOW-UP, NEXT ACTION ── */}
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <SlidersHorizontal size={14} /> Lead Management Parameters
                    </span>
                    {savingLeadDetails && <span className="text-[10px] text-amber-800 animate-pulse font-bold">Saving...</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Staff Assignment */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">
                        Assigned Admin Staff
                      </label>
                      <div className="flex items-center gap-2">
                        {selectedEnquiry.assignedTo ? (
                          <div className="flex items-center justify-between w-full p-2 bg-white rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <UserCheck size={14} className="text-emerald-600" />
                              {selectedEnquiry.assignedToName || 'Admin Staff'}
                            </span>
                            <button
                              onClick={() => handleAssignmentChange(selectedEnquiry.id!, false)}
                              className="text-[10px] font-bold text-rose-700 hover:underline"
                            >
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
                    </div>

                    {/* Next Follow-up Date & Time Picker */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                          Next Follow-up Date & Time
                        </label>
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

                    {/* Next Action Field & Quick Suggestion Chips */}
                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-600 block uppercase">
                        Planned Next Action
                      </label>
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

                      {/* Suggestion Chips */}
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

                  {/* Last Contacted Metadata */}
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

                {/* Explorer Profile */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                    1. Explorer Profile
                  </h4>
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
                  </div>
                </div>

                {/* Selected Expedition */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      2. Selected Expedition
                    </h4>
                    {selectedEnquiry.itineraryId && (
                      <a
                        href={`/itinerary/${selectedEnquiry.itinerarySlug || selectedEnquiry.itineraryId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                      >
                        View Public Page <ExternalLink size={12} />
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
                    </div>
                  </div>
                </div>

                {/* Party & Commercials */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                    3. Party & Commercials
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Traveller Target Budget</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {selectedEnquiry.preferences?.budget
                          ? formatCurrency(selectedEnquiry.preferences.budget, selectedEnquiry.preferences.budgetCurrency)
                          : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Party Composition</span>
                      <span className="font-bold text-slate-900">
                        {selectedEnquiry.trip?.totalTravellers || 1} Travellers ({selectedEnquiry.trip?.adults || 1} Adults
                        {selectedEnquiry.trip?.children ? `, ${selectedEnquiry.trip.children} Children` : ''})
                      </span>
                    </div>
                  </div>

                  {selectedEnquiry.preferences?.specialRequests && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Special Requests / Notes</span>
                      <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                        {selectedEnquiry.preferences.specialRequests}
                      </div>
                    </div>
                  )}
                </div>

                {/* Source & Marketing Taxonomy */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                    4. Source Taxonomy & Marketing
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Primary Source</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.source || 'ITINERARY'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Entry Point</span>
                      <span className="font-bold text-slate-900">{selectedEnquiry.entryPoint || 'DIRECT'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Marketing Opt-In</span>
                      <span className={`font-bold ${selectedEnquiry.marketingConsent ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {selectedEnquiry.marketingConsent ? '✓ Consented' : '✗ Not Opted In'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Status</span>
                      <span className="font-bold text-slate-900 capitalize">{selectedEnquiry.emailStatus || 'unsubscribed'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT 2: INTERNAL NOTES (C2) */}
            {activeDrawerTab === 'notes' && (
              <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Note Input Box */}
                <form onSubmit={handleAddNote} className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileText size={14} /> Add Internal Note (Admin-Only)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {newNoteText.length} chars
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type internal notes regarding traveller preferences, custom itinerary changes, pricing notes..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500 resize-y"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 italic">
                      Notes are strictly internal and never shown to travellers.
                    </span>
                    <button
                      type="submit"
                      disabled={savingNote || !newNoteText.trim()}
                      className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingNote ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />} Add Note
                    </button>
                  </div>
                </form>

                {/* Notes History Stream */}
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
                            <span className="font-mono text-slate-400 text-[10px]">
                              {formatDateTime(note.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: AUDIT TIMELINE (C2) */}
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
                    {activities.map((act) => {
                      let icon = <Clock size={12} />;
                      let color = 'bg-slate-100 text-slate-600';

                      if (act.type === 'ENQUIRY_RECEIVED') {
                        icon = <Sparkles size={12} />;
                        color = 'bg-amber-100 text-amber-900';
                      } else if (act.type === 'STATUS_CHANGED') {
                        icon = <CheckCircle2 size={12} />;
                        color = 'bg-blue-100 text-blue-900';
                      } else if (act.type === 'NOTE_ADDED') {
                        icon = <FileText size={12} />;
                        color = 'bg-purple-100 text-purple-900';
                      } else if (act.type === 'FOLLOW_UP_SET' || act.type === 'FOLLOW_UP_CLEARED') {
                        icon = <Calendar size={12} />;
                        color = 'bg-emerald-100 text-emerald-900';
                      } else if (act.type === 'ASSIGNED') {
                        icon = <UserCheck size={12} />;
                        color = 'bg-indigo-100 text-indigo-900';
                      } else if (act.type === 'WHATSAPP_OPENED' || act.type === 'EMAIL_OPENED' || act.type === 'PHONE_INITIATED') {
                        icon = <MessageSquare size={12} />;
                        color = 'bg-emerald-500 text-white';
                      }

                      return (
                        <div key={act.id} className="relative group text-left">
                          {/* Timeline dot */}
                          <div className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${color}`}>
                            {icon}
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900 uppercase">
                                {act.type.replace(/_/g, ' ')}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {formatDateTime(act.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              By <strong>{act.actorName || 'System'}</strong>
                              {act.metadata?.from && act.metadata?.to && (
                                <span> • Status changed from <span className="font-bold">{act.metadata.from}</span> to <span className="font-bold">{act.metadata.to}</span></span>
                              )}
                              {act.metadata?.noteSnippet && (
                                <span> • "{act.metadata.noteSnippet}"</span>
                              )}
                              {act.metadata?.assignedToName && (
                                <span> • Assigned to <span className="font-bold">{act.metadata.assignedToName}</span></span>
                              )}
                              {act.metadata?.followUpAt && (
                                <span> • Follow-up set to <span className="font-mono font-bold">{act.metadata.followUpAt}</span></span>
                              )}
                              {act.metadata?.nextAction && (
                                <span> • Next action set to "<span className="font-bold">{act.metadata.nextAction}</span>"</span>
                              )}
                              {act.metadata?.channel && (
                                <span> • Action triggered via <span className="font-bold uppercase">{act.metadata.channel}</span></span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
                <Trash2 size={14} /> Delete Enquiry
              </button>
              <button
                onClick={handleAttemptCloseDrawer}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. UNSAVED NOTE WARNING DIALOG ── */}
      {showUnsavedNoteWarning && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertTriangle size={24} />
              <h3 className="font-brand font-black text-lg uppercase">Unsaved Note Draft</h3>
            </div>
            <p className="text-xs text-slate-600">
              You have typed an internal note that has not been saved yet. Are you sure you want to close without saving your note draft?
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

      {/* ── 7. DELETE CONFIRMATION DIALOG ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-5 text-left">
            <div className="size-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-brand font-black text-xl uppercase text-slate-900">Delete Expedition Lead?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete this enquiry? This action will permanently remove the record from Firestore and cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEnquiry(deleteConfirmId)}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. E11 CLOSED REASON MODAL ── */}
      {showClosedReasonModal && (
        <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-2 text-slate-900">
              <AlertTriangle size={20} className="text-amber-600" />
              <h3 className="font-brand font-black text-lg uppercase">Select Reason for Closing Lead</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Primary Reason</label>
                <select
                  value={selectedClosedReason}
                  onChange={(e) => setSelectedClosedReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 outline-none"
                >
                  <option value="TRAVELLER NOT INTERESTED">TRAVELLER NOT INTERESTED</option>
                  <option value="DATES NOT SUITABLE">DATES NOT SUITABLE</option>
                  <option value="BUDGET NOT SUITABLE">BUDGET NOT SUITABLE</option>
                  <option value="DESTINATION CHANGED">DESTINATION CHANGED</option>
                  <option value="CHOSE ANOTHER PROVIDER">CHOSE ANOTHER PROVIDER</option>
                  <option value="NO RESPONSE">NO RESPONSE</option>
                  <option value="TRIP POSTPONED">TRIP POSTPONED</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block uppercase mb-1">Additional Explanation (Optional)</label>
                <textarea
                  rows={2}
                  value={closedReasonDetailsText}
                  onChange={(e) => setClosedReasonDetailsText(e.target.value)}
                  placeholder="e.g. Traveller decided to postpone trip to next year due to personal scheduling conflict."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 outline-none resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowClosedReasonModal(false);
                  setClosingEnquiryId(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseLead}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Close Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
