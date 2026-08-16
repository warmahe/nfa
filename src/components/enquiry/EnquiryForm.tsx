import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Send,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Compass,
  Sparkles,
  Heart,
  ChevronRight,
  Info,
} from 'lucide-react';
import { EnquiryTarget } from '../../context/EnquiryContext';
import { createEnquiryDocument, auth } from '../../services/firebaseService';
import { EnquiryFormData, EnquiryDocument } from '../../types/database';

interface EnquiryFormProps {
  target?: EnquiryTarget | null;
  onSuccess?: (enquiryId: string) => void;
  onClose?: () => void;
  isInline?: boolean;
}

const STEPS = [
  { step: 1, label: 'Dates & Route', title: '1. Your Journey & Dates' },
  { step: 2, label: 'Travellers & Style', title: "2. Who's Travelling & Preferences" },
  { step: 3, label: 'Contact & Details', title: '3. Your Contact & Budget' },
];

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  target,
  onSuccess,
  onClose,
  isInline = false,
}) => {
  // ── Step State (Progressive Disclosure) ──
  const [currentStep, setCurrentStep] = useState<number>(1);

  // ── Form State ──
  const [formData, setFormData] = useState<EnquiryFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    travelDate: target?.initialTravelDate || '',
    travelFlexibility: target?.initialTravelDate ? 'FIXED_DATES' : 'FIXED_DATES',
    preferredTravelDateFrom: target?.initialTravelDate || '',
    preferredTravelDateTo: '',
    numberOfDays: target?.duration ? parseInt(target.duration) || 7 : 7,
    adults: target?.initialTravellerCount || 2,
    children: 0,
    childAges: [],
    budget: target?.price ? String(target.price) : '',
    budgetCurrency: target?.currency || 'INR',
    preferences: '',
    travelStyle: [],
    accommodationStyle: '',
    interests: [],
    dietary: '',
    accessibility: '',
    specialOccasion: '',
    specialRequests: '',
    marketingConsent: false,
  });

  // ── Custom text inputs for "Other" selections ──
  const [customOccasion, setCustomOccasion] = useState('');
  const [customDietary, setCustomDietary] = useState('');

  // ── Submissions & Validation States ──
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatedEnquiryId, setGeneratedEnquiryId] = useState<string>('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // ── Admin WhatsApp Number State ──
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState<string>(() => {
    return localStorage.getItem('nfa_admin_whatsapp') || '';
  });

  // Check if user has entered meaningful data
  const hasEnteredData = Boolean(
    formData.name.trim() ||
    formData.email.trim() ||
    formData.phone.trim() ||
    formData.travelDate ||
    formData.preferredTravelDateFrom ||
    formData.specialRequests?.trim()
  );

  // ── Prefill from authenticated user profile & load Admin WhatsApp number ──
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phoneNumber || prev.phone,
      }));
    }

    const loadAdminPhone = async () => {
      try {
        const { getDocumentById } = await import('../../services/firebaseService');
        const contactDoc = await getDocumentById<any>('settings', 'contact-info');
        if (contactDoc?.whatsapp) {
          setAdminWhatsAppNumber(contactDoc.whatsapp);
          localStorage.setItem('nfa_admin_whatsapp', contactDoc.whatsapp);
          return;
        }

        const whatsappDoc = await getDocumentById<any>('settings', 'whatsapp');
        if (whatsappDoc?.number) {
          setAdminWhatsAppNumber(whatsappDoc.number);
          localStorage.setItem('nfa_admin_whatsapp', whatsappDoc.number);
          return;
        }
      } catch (e) {
        // Fallback to cache
      }

      const local = localStorage.getItem('nfa_admin_whatsapp');
      if (local && local.trim()) {
        setAdminWhatsAppNumber(local.trim());
      }
    };
    loadAdminPhone();
  }, []);

  // ── Sync duration / price when target changes ──
  useEffect(() => {
    if (target?.duration) {
      const daysMatch = target.duration.match(/(\d+)\s*days?/i);
      if (daysMatch) {
        setFormData(prev => ({ ...prev, numberOfDays: parseInt(daysMatch[1]) }));
      }
    }
    if (target?.price) {
      setFormData(prev => ({
        ...prev,
        budget: String(target.price),
        budgetCurrency: target.currency || 'INR',
      }));
    }
  }, [target]);

  // ── Handle Child Count Change ──
  const handleChildrenChange = (newCount: number) => {
    const count = Math.max(0, Math.min(10, newCount));
    const currentAges = [...formData.childAges];

    if (count > currentAges.length) {
      while (currentAges.length < count) {
        currentAges.push(6); // Default age 6
      }
    } else {
      currentAges.splice(count);
    }

    setFormData(prev => ({
      ...prev,
      children: count,
      childAges: currentAges,
    }));
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...formData.childAges];
    newAges[index] = Math.max(0, Math.min(11, age));
    setFormData(prev => ({ ...prev, childAges: newAges }));
  };

  // ── Toggle Travel Style Tag ──
  const toggleTravelStyle = (style: string) => {
    const current = formData.travelStyle || [];
    if (current.includes(style)) {
      setFormData(prev => ({ ...prev, travelStyle: current.filter(s => s !== style) }));
    } else {
      if (current.length >= 3) return; // Limit to 3 choices
      setFormData(prev => ({ ...prev, travelStyle: [...current, style] }));
    }
  };

  // ── Step Validation ──
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (formData.travelFlexibility === 'FIXED_DATES') {
        if (!formData.travelDate) {
          newErrors.travelDate = "Please tell us when you'd like to travel.";
        }
      } else if (formData.travelFlexibility === 'FLEXIBLE_DATES') {
        if (!formData.preferredTravelDateFrom) {
          newErrors.travelDate = 'Please select your preferred start date.';
        }
      }
    }

    if (stepNumber === 2) {
      if (formData.adults < 1) {
        newErrors.adults = 'Please add at least one adult traveller.';
      }
      if (formData.children > 0 && formData.childAges.length !== formData.children) {
        newErrors.children = 'Please provide ages for all children.';
      }
    }

    if (stepNumber === 3) {
      if (!formData.name.trim()) {
        newErrors.name = 'Please enter your full name.';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Please enter your WhatsApp / phone number.';
      } else if (formData.phone.replace(/\D/g, '').length < 7) {
        newErrors.phone = 'Please enter a valid contact phone number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // ── Build WhatsApp Message ──
  const buildWhatsAppUrl = (refIdOverride?: string): string => {
    const refId = refIdOverride || generatedEnquiryId || 'NFA-ENQUIRY';
    const tripName = target?.itineraryTitle || target?.pkg?.title;
    const dest = target?.destination || target?.pkg?.destinations?.[0];
    const totalTravellers = formData.adults + formData.children;

    const stylesText =
      formData.travelStyle && formData.travelStyle.length > 0
        ? formData.travelStyle.join(', ')
        : '';
    const occasionText =
      formData.specialOccasion === 'Other' ? customOccasion : formData.specialOccasion;

    let lines: string[] = [];

    if (tripName) {
      lines = [
        `Hello NO FIXED ADDRESS,`,
        ``,
        `I have just submitted a travel enquiry.`,
        ``,
        `Reference: ${refId}`,
        `Journey: ${tripName}`,
        dest ? `Destination: ${dest}` : '',
        formData.travelDate
          ? `Travel Date: ${formData.travelDate}`
          : formData.preferredTravelDateFrom
          ? `Travel Window: ${formData.preferredTravelDateFrom} to ${formData.preferredTravelDateTo || 'Flexible'}`
          : 'Travel Date: Flexible',
        `Travellers: ${totalTravellers} Pax (${formData.adults} Adults${formData.children > 0 ? `, ${formData.children} Children` : ''})`,
        stylesText ? `Travel Style: ${stylesText}` : '',
        formData.accommodationStyle ? `Accommodation: ${formData.accommodationStyle}` : '',
        occasionText ? `Special Occasion: ${occasionText}` : '',
        formData.budget
          ? `Approx Budget: ${formData.budgetCurrency || 'INR'} ${formData.budget}`
          : '',
        formData.specialRequests ? `Special Notes: ${formData.specialRequests}` : '',
        ``,
        `I would like to discuss the journey and possible customizations.`,
        ``,
        `Thank you.`,
      ].filter(Boolean);
    } else if (dest) {
      lines = [
        `Hello NO FIXED ADDRESS,`,
        ``,
        `I have just submitted an enquiry for ${dest}.`,
        ``,
        `Reference: ${refId}`,
        `Destination: ${dest}`,
        formData.travelDate
          ? `Travel Date: ${formData.travelDate}`
          : 'Travel Date: Flexible',
        `Travellers: ${totalTravellers} Pax`,
        stylesText ? `Travel Style: ${stylesText}` : '',
        formData.budget
          ? `Approx Budget: ${formData.budgetCurrency || 'INR'} ${formData.budget}`
          : '',
        formData.specialRequests ? `Special Notes: ${formData.specialRequests}` : '',
        ``,
        `I would like to discuss planning our expedition to ${dest}.`,
        ``,
        `Thank you.`,
      ].filter(Boolean);
    } else {
      lines = [
        `Hello NO FIXED ADDRESS,`,
        ``,
        `I have just submitted a travel enquiry.`,
        ``,
        `Reference: ${refId}`,
        formData.travelDate
          ? `Travel Date: ${formData.travelDate}`
          : 'Travel Date: Flexible',
        `Travellers: ${totalTravellers} Pax`,
        stylesText ? `Travel Style: ${stylesText}` : '',
        formData.budget
          ? `Approx Budget: ${formData.budgetCurrency || 'INR'} ${formData.budget}`
          : '',
        ``,
        `I would like to discuss planning my trip.`,
        ``,
        `Thank you.`,
      ].filter(Boolean);
    }

    const encoded = encodeURIComponent(lines.join('\n'));
    const targetPhone = (adminWhatsAppNumber || localStorage.getItem('nfa_admin_whatsapp') || '').replace(/\D/g, '');

    if (targetPhone) {
      return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encoded}`;
    }
    return `https://api.whatsapp.com/send?text=${encoded}`;
  };

  // ── Form Submission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (!validateStep(1)) setCurrentStep(1);
      else if (!validateStep(2)) setCurrentStep(2);
      else setCurrentStep(3);
      return;
    }

    if (submitting) return;
    setSubmitting(true);

    const refId = `NFA-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentUser = auth.currentUser;

    const resolvedOccasion =
      formData.specialOccasion === 'Other' ? customOccasion.trim() : formData.specialOccasion;
    const resolvedDietary =
      formData.dietary === 'Other' ? customDietary.trim() : formData.dietary;

    // Resolve accurate source
    let sourceVal = target?.source || 'ITINERARY';
    if (target?.storyTitle || target?.storyId) sourceVal = 'CUSTOMER_STORY';
    else if (target?.destination && !target?.itineraryTitle && !target?.pkg) sourceVal = 'DESTINATION';

    const enquiryPayload: Omit<EnquiryDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      enquiryId: refId,
      itineraryId: target?.itineraryId || target?.pkg?.id || '',
      itineraryTitle:
        target?.itineraryTitle ||
        target?.pkg?.title ||
        (target?.destination ? `Expedition to ${target.destination}` : 'General Expedition Enquiry'),
      itinerarySlug: target?.itinerarySlug || target?.pkg?.slug || '',
      destination: target?.destination || (target?.pkg?.destinations?.[0] || 'Worldwide'),
      duration: target?.duration || target?.pkg?.duration || `${formData.numberOfDays} Days`,
      pricing: {
        basePrice: target?.price || target?.pkg?.pricing?.basePrice || 0,
        currency: target?.currency || target?.pkg?.pricing?.currency || 'INR',
      },

      traveller: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || undefined,
        userId: currentUser?.uid || undefined,
      },

      trip: {
        travelDate: formData.travelDate || formData.preferredTravelDateFrom || 'Flexible',
        numberOfDays: formData.numberOfDays,
        adults: formData.adults,
        children: formData.children,
        childAges: formData.childAges,
        totalTravellers: formData.adults + formData.children,
      },

      preferences: {
        budget: formData.budget ? formData.budget.trim() : undefined,
        budgetCurrency: formData.budgetCurrency || 'INR',
        preferences: formData.preferences?.trim() || undefined,
        specialRequests: formData.specialRequests?.trim() || undefined,
        travelStyle:
          formData.travelStyle && formData.travelStyle.length > 0
            ? formData.travelStyle
            : undefined,
        accommodationStyle: formData.accommodationStyle?.trim() || undefined,
        interests:
          formData.interests && formData.interests.length > 0
            ? formData.interests
            : undefined,
        dietary: resolvedDietary || undefined,
        accessibility: formData.accessibility?.trim() || undefined,
        specialOccasion: resolvedOccasion || undefined,
      },

      travelFlexibility: formData.travelFlexibility,
      preferredTravelDateFrom: formData.preferredTravelDateFrom || undefined,
      preferredTravelDateTo: formData.preferredTravelDateTo || undefined,

      status: 'NEW',
      source: sourceVal,
      entryPoint: target?.entryPoint || 'DIRECT',
      sourceUrl: window.location.href,

      marketingConsent: formData.marketingConsent || false,
      emailStatus: formData.marketingConsent ? 'subscribed' : 'unsubscribed',
    };

    try {
      await createEnquiryDocument(enquiryPayload);
    } catch (err: any) {
      console.warn('Firestore write warning (saved locally on device):', err);
      try {
        const existingQueue = JSON.parse(localStorage.getItem('nfa_fallback_enquiries') || '[]');
        existingQueue.push({ ...enquiryPayload, savedLocallyAt: new Date().toISOString() });
        localStorage.setItem('nfa_fallback_enquiries', JSON.stringify(existingQueue));
      } catch (backupErr) {
        console.error('Local backup save error:', backupErr);
      }
    }

    setGeneratedEnquiryId(refId);
    setSubmitSuccess(true);
    setSubmitting(false);

    if (onSuccess) {
      onSuccess(refId);
    }
  };

  const handleContinueWhatsApp = () => {
    const url = buildWhatsAppUrl();
    window.open(url, '_blank');
  };

  const handleRequestClose = () => {
    if (hasEnteredData && !submitSuccess) {
      setShowCloseConfirm(true);
    } else if (onClose) {
      onClose();
    }
  };

  // ── SUCCESS RENDER ──
  if (submitSuccess) {
    const isUserLoggedIn = Boolean(auth.currentUser);

    return (
      <div className="p-6 md:p-10 text-center space-y-6 bg-white border-4 border-[#121212] shadow-[12px_12px_0px_0px_#F4BF4B]">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-4 border-[#121212] shadow-md animate-in zoom-in-50 duration-300">
          <CheckCircle size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9E1B1D]">
            ENQUIRY RECEIVED
          </span>
          <h3 className="font-brand font-black text-3xl md:text-4xl uppercase tracking-tight text-[#121212]">
            Thank You, {formData.name.split(' ')[0]}!
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-600 max-w-md mx-auto">
            We've received your travel plans. Our travel team will review your details and get in touch with you shortly.
          </p>
        </div>

        <div className="p-4 bg-[#FCFBF7] border-2 border-[#121212] inline-block max-w-xs mx-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#121212]/40 block mb-1">
            Enquiry Reference
          </span>
          <span className="font-brand font-black text-2xl text-[#121212] tracking-wider">
            {generatedEnquiryId}
          </span>
        </div>

        <div className="pt-2 space-y-3 max-w-md mx-auto">
          <button
            onClick={handleContinueWhatsApp}
            className="w-full bg-[#25D366] text-white py-4 px-6 font-black text-xs uppercase tracking-[0.25em] flex justify-center items-center gap-3 hover:bg-[#20bd5a] transition-all shadow-[6px_6px_0px_0px_#121212] active:translate-x-0.5 active:translate-y-0.5 border-2 border-[#121212] cursor-pointer"
          >
            <MessageSquare size={18} /> CONTINUE ON WHATSAPP
          </button>

          {isUserLoggedIn && (
            <a
              href="/dashboard"
              className="block w-full bg-[#121212] text-[#F4BF4B] py-3.5 px-6 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#9E1B1D] hover:text-white transition-colors border-2 border-[#121212] cursor-pointer text-center"
            >
              VIEW MY ENQUIRY &rarr;
            </a>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-800 py-2.5 px-6 font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-slate-200 transition-colors border border-slate-300 cursor-pointer"
            >
              Close Window
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
            Bespoke Travel Consultation • No Payment Required
          </span>
        </div>
      </div>
    );
  }

  const travelStylesList = [
    'Adventure',
    'Wildlife',
    'Culture',
    'Food & Wine',
    'Wellness',
    'Romantic',
    'Family',
    'Photography',
    'Luxury',
    'Slow Travel',
  ];

  return (
    <div className="relative text-left">
      {/* ── ACCIDENTAL CLOSE CONFIRMATION BANNER ── */}
      {showCloseConfirm && (
        <div className="mb-6 p-5 bg-amber-50 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-[#9E1B1D]">
            <AlertCircle size={18} />
            <h4 className="font-brand font-black text-base uppercase text-[#121212]">
              Leave this enquiry?
            </h4>
          </div>
          <p className="text-xs font-bold text-slate-700">
            Your travel details haven't been sent yet. If you leave now, you will lose the details you've entered.
          </p>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCloseConfirm(false)}
              className="bg-[#121212] text-[#F4BF4B] px-4 py-2 font-black text-[10px] uppercase tracking-widest border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
            >
              Continue Enquiry
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCloseConfirm(false);
                if (onClose) onClose();
              }}
              className="bg-white text-slate-700 px-4 py-2 font-black text-[10px] uppercase tracking-widest border-2 border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Leave
            </button>
          </div>
        </div>
      )}

      {/* ── CONTEXTUAL JOURNEY / DESTINATION HEADER BANNER ── */}
      {target && (target.itineraryTitle || target.pkg || target.destination || target.storyTitle) && (
        <div className="p-5 bg-[#121212] text-white border-2 border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B] mb-6 space-y-2">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#F4BF4B] block flex items-center gap-1.5">
            <Compass size={12} />
            {target.itineraryTitle || target.pkg
              ? 'Selected Expedition'
              : target.storyTitle
              ? 'Inspired By Story'
              : 'Destination Enquiry'}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-brand font-black text-xl uppercase tracking-tight text-white leading-tight">
                {target.itineraryTitle || target.pkg?.title || target.storyTitle || target.destination}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {target.destination || target.pkg?.destinations?.[0] || 'Expedition'}
                {target.duration ? ` • ${target.duration}` : ''}
              </p>
            </div>
            {target.price && target.price > 0 && (
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">
                  Starting From
                </span>
                <span className="font-brand font-black text-xl text-[#F4BF4B]">
                  {target.currency || 'INR'} {target.price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROGRESSIVE DISCLOSURE STEPPER TABS ── */}
      <div className="mb-8 border-b-2 border-[#121212]/10 pb-4">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, idx) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  if (isCompleted || validateStep(currentStep)) {
                    setCurrentStep(s.step);
                  }
                }}
                className={`flex-1 flex items-center gap-2 p-2.5 border-2 text-left transition-all ${
                  isActive
                    ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-[3px_3px_0px_0px_#9E1B1D]'
                    : isCompleted
                    ? 'bg-[#FCFBF7] text-[#121212] border-[#121212] hover:bg-[#F4BF4B]/10 cursor-pointer'
                    : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <div
                  className={`size-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                    isActive
                      ? 'bg-[#F4BF4B] text-[#121212]'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : s.step}
                </div>
                <div className="hidden sm:block truncate">
                  <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">
                    Step {s.step}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider truncate block">
                    {s.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FORM BODY ── */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Submit Error Banner */}
        {submitError && (
          <div className="p-4 bg-rose-50 border-2 border-rose-600 text-rose-800 text-xs font-bold flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{submitError}</p>
              <button
                type="button"
                onClick={() => setSubmitError(null)}
                className="text-[9px] font-black uppercase tracking-widest text-rose-700 underline mt-1 block"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 1: YOUR JOURNEY & DATES
            ══════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b-2 border-[#121212]/10 pb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block mb-1">
                Step 1 of 3
              </span>
              <h4 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                1. Your Journey & Dates
              </h4>
            </div>

            {/* Date Flexibility Selector */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-2 block">
                When would you like to travel? *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'FIXED_DATES', label: 'Specific Date' },
                  { id: 'FLEXIBLE_DATES', label: 'Date Range' },
                  { id: 'VERY_FLEXIBLE', label: "We're Flexible" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, travelFlexibility: item.id as any })
                    }
                    className={`py-3 px-2 text-[10px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                      formData.travelFlexibility === item.id
                        ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                        : 'bg-white text-[#121212] border-[#121212]/30 hover:border-[#121212]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Inputs based on flexibility */}
            {formData.travelFlexibility === 'FIXED_DATES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    value={formData.travelDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, travelDate: e.target.value })}
                    className={`w-full p-3.5 bg-white border-2 font-bold text-xs outline-none transition-colors cursor-pointer ${
                      errors.travelDate
                        ? 'border-rose-600 focus:bg-rose-50'
                        : 'border-[#121212] focus:bg-[#F4BF4B]/10'
                    }`}
                  />
                  {errors.travelDate && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                      {errors.travelDate}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.numberOfDays}
                    onChange={e =>
                      setFormData({ ...formData, numberOfDays: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors"
                  />
                </div>
              </div>
            )}

            {formData.travelFlexibility === 'FLEXIBLE_DATES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                    Earliest Departure *
                  </label>
                  <input
                    type="date"
                    value={formData.preferredTravelDateFrom || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e =>
                      setFormData({ ...formData, preferredTravelDateFrom: e.target.value })
                    }
                    className={`w-full p-3.5 bg-white border-2 font-bold text-xs outline-none transition-colors cursor-pointer ${
                      errors.travelDate
                        ? 'border-rose-600 focus:bg-rose-50'
                        : 'border-[#121212] focus:bg-[#F4BF4B]/10'
                    }`}
                  />
                  {errors.travelDate && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                      {errors.travelDate}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                    Latest Return
                  </label>
                  <input
                    type="date"
                    value={formData.preferredTravelDateTo || ''}
                    min={formData.preferredTravelDateFrom || new Date().toISOString().split('T')[0]}
                    onChange={e =>
                      setFormData({ ...formData, preferredTravelDateTo: e.target.value })
                    }
                    className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            )}

            {formData.travelFlexibility === 'VERY_FLEXIBLE' && (
              <div className="p-4 bg-[#FCFBF7] border-2 border-[#121212]/20 flex items-start gap-3">
                <Info size={16} className="text-[#9E1B1D] shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700 leading-relaxed">
                  That's perfect! Our travel team will suggest optimal departure windows, seasonal highlights, and weather windows for your journey.
                </p>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer"
              >
                Next: Travellers & Style <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2: WHO'S TRAVELLING & PREFERENCES
            ══════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b-2 border-[#121212]/10 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block mb-1">
                  Step 2 of 3
                </span>
                <h4 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                  2. Who's Travelling & Preferences
                </h4>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#121212] text-[#F4BF4B] px-3 py-1 hidden sm:inline-block">
                {formData.adults + formData.children} Travellers
              </span>
            </div>

            {/* Travellers Count Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adults Stepper */}
              <div className="p-4 bg-[#FCFBF7] border-2 border-[#121212]">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#9E1B1D] block mb-2">
                  Adults (12+ Yrs) *
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, adults: Math.max(1, formData.adults - 1) })
                    }
                    className="size-10 bg-[#121212] text-[#F4BF4B] font-black text-lg border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-brand font-black text-2xl text-[#121212]">
                    {formData.adults}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, adults: Math.min(20, formData.adults + 1) })
                    }
                    className="size-10 bg-[#121212] text-[#F4BF4B] font-black text-lg border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Stepper */}
              <div className="p-4 bg-[#FCFBF7] border-2 border-[#121212]">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 block mb-2">
                  Children (Under 12 Yrs)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleChildrenChange(formData.children - 1)}
                    className="size-10 bg-[#121212] text-[#F4BF4B] font-black text-lg border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-brand font-black text-2xl text-[#121212]">
                    {formData.children}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChildrenChange(formData.children + 1)}
                    className="size-10 bg-[#121212] text-[#F4BF4B] font-black text-lg border-2 border-[#121212] hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Child Ages */}
            {formData.children > 0 && (
              <div className="p-4 bg-[#F4BF4B]/10 border-2 border-[#121212] space-y-3">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212] block">
                  Children's Ages *
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formData.childAges.map((age, idx) => (
                    <div key={idx}>
                      <label className="text-[8px] font-black uppercase tracking-wider text-gray-500 block mb-1">
                        Child {idx + 1} Age
                      </label>
                      <select
                        value={age}
                        onChange={e => handleChildAgeChange(idx, parseInt(e.target.value) || 0)}
                        className="w-full p-2.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {i === 0 ? 'Under 1 yr' : `${i} yrs`}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                {errors.children && (
                  <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                    {errors.children}
                  </span>
                )}
              </div>
            )}

            {/* Travel Style Selector */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-2 flex items-center justify-between">
                <span>Travel Style (Choose up to 3)</span>
                <span className="text-[#9E1B1D]">
                  {(formData.travelStyle || []).length}/3 selected
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {travelStylesList.map(style => {
                  const isSelected = (formData.travelStyle || []).includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleTravelStyle(style)}
                      className={`py-2 px-3.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                          : 'bg-white text-[#121212]/80 border-[#121212]/30 hover:border-[#121212]'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accommodation Style */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                Preferred Accommodation Style
              </label>
              <select
                value={formData.accommodationStyle || ''}
                onChange={e => setFormData({ ...formData, accommodationStyle: e.target.value })}
                className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors cursor-pointer"
              >
                <option value="">— Select Preferred Stay Style —</option>
                <option value="Boutique & Heritage">Boutique & Heritage Stays</option>
                <option value="Ultra Luxury Resorts">Ultra Luxury Resorts</option>
                <option value="Private Villas & Estates">Private Villas & Estates</option>
                <option value="Safari Lodges & Camps">Safari Lodges & Wilderness Camps</option>
                <option value="Curated Mix of Stays">Curated Mix of Stays</option>
                <option value="Not sure yet">Not sure yet — surprise us!</option>
              </select>
            </div>

            {/* Special Occasion & Dietary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  Is there a Special Occasion?
                </label>
                <select
                  value={formData.specialOccasion || ''}
                  onChange={e => setFormData({ ...formData, specialOccasion: e.target.value })}
                  className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors cursor-pointer"
                >
                  <option value="">— No Special Occasion —</option>
                  <option value="Honeymoon">Honeymoon</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Family Celebration">Family Celebration</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Milestone Trip">Milestone Trip</option>
                  <option value="Other">Other Occasion</option>
                </select>

                {formData.specialOccasion === 'Other' && (
                  <input
                    type="text"
                    value={customOccasion}
                    onChange={e => setCustomOccasion(e.target.value)}
                    placeholder="Specify your occasion..."
                    className="w-full mt-2 p-3 bg-white border-2 border-[#121212] font-bold text-xs outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  Dietary Requirements
                </label>
                <select
                  value={formData.dietary || ''}
                  onChange={e => setFormData({ ...formData, dietary: e.target.value })}
                  className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors cursor-pointer"
                >
                  <option value="">— No Specific Requirements —</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Halal">Halal</option>
                  <option value="Gluten-free">Gluten-free</option>
                  <option value="Food Allergies">Food Allergies</option>
                  <option value="Other">Other Specific Needs</option>
                </select>

                {formData.dietary === 'Other' && (
                  <input
                    type="text"
                    value={customDietary}
                    onChange={e => setCustomDietary(e.target.value)}
                    placeholder="Specify dietary needs..."
                    className="w-full mt-2 p-3 bg-white border-2 border-[#121212] font-bold text-xs outline-none"
                  />
                )}
              </div>
            </div>

            {/* Accessibility */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                Accessibility Considerations (Optional)
              </label>
              <input
                type="text"
                value={formData.accessibility || ''}
                onChange={e => setFormData({ ...formData, accessibility: e.target.value })}
                placeholder="e.g. Ground floor rooms, minimal stairs..."
                className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors"
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-white text-[#121212] px-6 py-4 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-2 border-[#121212] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#121212] text-[#F4BF4B] px-8 py-4 font-black text-xs uppercase tracking-[0.25em] flex items-center gap-3 hover:bg-[#9E1B1D] hover:text-white transition-all border-2 border-[#121212] shadow-[4px_4px_0px_0px_#F4BF4B] cursor-pointer"
              >
                Next: Contact Details <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3: YOUR CONTACT & BUDGET
            ══════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border-b-2 border-[#121212]/10 pb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9E1B1D] block mb-1">
                Step 3 of 3
              </span>
              <h4 className="font-brand font-black text-2xl uppercase tracking-tight text-[#121212]">
                3. Your Contact Details & Budget
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hemanth Kumar"
                  className={`w-full p-3.5 bg-white border-2 font-bold text-xs outline-none transition-colors ${
                    errors.name
                      ? 'border-rose-600 focus:bg-rose-50'
                      : 'border-[#121212] focus:bg-[#F4BF4B]/10'
                  }`}
                />
                {errors.name && (
                  <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. hemanth@example.com"
                  className={`w-full p-3.5 bg-white border-2 font-bold text-xs outline-none transition-colors ${
                    errors.email
                      ? 'border-rose-600 focus:bg-rose-50'
                      : 'border-[#121212] focus:bg-[#F4BF4B]/10'
                  }`}
                />
                {errors.email && (
                  <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className={`w-full p-3.5 bg-white border-2 font-bold text-xs outline-none transition-colors ${
                    errors.phone
                      ? 'border-rose-600 focus:bg-rose-50'
                      : 'border-[#121212] focus:bg-[#F4BF4B]/10'
                  }`}
                />
                {errors.phone && (
                  <span className="text-[9px] font-bold text-rose-600 mt-1 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* City / Country */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                  City / Country
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors"
                />
              </div>
            </div>

            {/* Approximate Travel Budget */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                Approximate Travel Budget (Per Person)
              </label>
              <select
                value={formData.budget || ''}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors cursor-pointer"
              >
                <option value="">— Select Budget Range —</option>
                <option value="Under ₹1,00,000">Under ₹1L</option>
                <option value="₹1,00,000 – ₹2,50,000">₹1L – ₹2.5L</option>
                <option value="₹2,50,000 – ₹5,00,000">₹2.5L – ₹5L</option>
                <option value="₹5,00,000 – ₹10,00,000">₹5L – ₹10L</option>
                <option value="₹10,00,000+">₹10L+</option>
                <option value="Not sure yet">Not sure yet — open to recommendations</option>
              </select>
              <span className="text-[9px] font-bold text-gray-500 mt-1 block">
                ℹ This helps our travel team select appropriate stays and private experiences for you.
              </span>
            </div>

            {/* Special Requests */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#121212]/60 mb-1 block">
                Anything Else We Should Know?
              </label>
              <textarea
                rows={3}
                value={formData.specialRequests || ''}
                onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Tell us anything else you'd like us to consider while planning your journey..."
                className="w-full p-3.5 bg-white border-2 border-[#121212] font-bold text-xs outline-none focus:bg-[#F4BF4B]/10 transition-colors resize-y"
              />
            </div>

            {/* Marketing Consent */}
            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.marketingConsent}
                onChange={e => setFormData({ ...formData, marketingConsent: e.target.checked })}
                className="size-4 border-2 border-[#121212] accent-[#121212] rounded-none cursor-pointer"
              />
              <span className="text-[10px] font-bold text-[#121212]/70 uppercase tracking-wider">
                Keep me updated on private expedition drops and seasonal departures.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-white text-[#121212] px-6 py-4 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 border-2 border-[#121212] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 max-w-sm py-4 px-8 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all border-2 border-[#121212] shadow-[6px_6px_0px_0px_#F4BF4B] active:translate-x-0.5 active:translate-y-0.5 ${
                  submitting
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-[#9E1B1D] hover:text-white cursor-pointer'
                }`}
              >
                {submitting ? (
                  <>SUBMITTING ENQUIRY...</>
                ) : (
                  <>
                    <Send size={16} /> SUBMIT EXPEDITION ENQUIRY
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
