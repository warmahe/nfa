import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';
import { Booking, BookingFeedback } from '../../types/database';

interface TravellerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onSuccess?: () => void;
}

export const TravellerFeedbackModal: React.FC<TravellerFeedbackModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const existingFeedback = booking.feedback;

  // Form State
  const [overallRating, setOverallRating] = useState<number>(
    existingFeedback?.overallRating || 5
  );
  const [journeyRating, setJourneyRating] = useState<number>(
    existingFeedback?.journeyRating || 5
  );
  const [accommodationRating, setAccommodationRating] = useState<number>(
    existingFeedback?.accommodationRating || 5
  );
  const [experienceRating, setExperienceRating] = useState<number>(
    existingFeedback?.experienceRating || 5
  );
  const [travelTeamRating, setTravelTeamRating] = useState<number>(
    existingFeedback?.travelTeamRating || 5
  );

  const [likedMost, setLikedMost] = useState<string>(
    existingFeedback?.likedMost || ''
  );
  const [improvements, setImprovements] = useState<string>(
    existingFeedback?.improvements || ''
  );
  const [wouldRecommend, setWouldRecommend] = useState<'YES' | 'NOT_SURE' | 'NO'>(
    (existingFeedback?.wouldRecommend as any) || 'YES'
  );

  const [testimonialText, setTestimonialText] = useState<string>(
    existingFeedback?.testimonialText || ''
  );
  const [publicConsent, setPublicConsent] = useState<boolean>(
    existingFeedback?.publicConsent !== false
  );
  const [publicDisplayName, setPublicDisplayName] = useState<string>(
    existingFeedback?.publicDisplayName || 'First Name'
  );

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      setErrorMessage('Please provide an overall rating for your journey.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const feedbackPayload: BookingFeedback = {
        submitted: true,
        submittedAt: new Date().toISOString(),
        overallRating,
        journeyRating,
        accommodationRating,
        experienceRating,
        travelTeamRating,
        likedMost: likedMost.trim(),
        improvements: improvements.trim(),
        wouldRecommend,
        testimonialText: testimonialText.trim(),
        publicConsent,
        publicDisplayName,
        status: existingFeedback?.status === 'PUBLISHED' ? 'PUBLISHED' : 'SUBMITTED',
        reviewedAt: existingFeedback?.reviewedAt,
        reviewedBy: existingFeedback?.reviewedBy,
        publishedReviewId: existingFeedback?.publishedReviewId,
      };

      const bRef = doc(db, 'bookings', booking.id);
      await updateDoc(bRef, {
        feedback: feedbackPayload,
        updatedAt: serverTimestamp(),
      });

      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setErrorMessage(
        'Unable to submit your feedback. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Star Rating Picker Component
  const renderStarRating = (
    value: number,
    onChange: (val: number) => void,
    size = 22
  ) => {
    return (
      <div className="flex items-center gap-1.5" role="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`${star <= value
                  ? 'fill-[#F4BF4B] text-[#F4BF4B]'
                  : 'text-slate-300 hover:text-amber-200'
                } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto text-left">
      <div className="bg-white border-4 border-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-[12px_12px_0px_0px_#F4BF4B] animate-in fade-in zoom-in duration-150">

        {/* Modal Header */}
        <div className="p-6 bg-[#121212] text-white flex items-start justify-between border-b-4 border-[#F4BF4B] shrink-0">
          <div className="space-y-1">
            <span className="font-brand font-black text-[10px] uppercase tracking-[0.3em] text-[#F4BF4B] block">
              EXPEDITION REFLECTIONS
            </span>
            <h3 className="font-brand font-black text-2xl uppercase tracking-tight text-white">
              HOW WAS YOUR JOURNEY?
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              {booking.itineraryTitle || booking.destination || 'Expedition'} &bull; Ref: {booking.bookingReference || booking.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="size-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="font-brand font-black text-2xl uppercase text-[#121212]">
                  THANK YOU FOR SHARING
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                  Your reflections have been received by our travel team. Your feedback helps us shape future journeys and celebrate our local guides.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer shadow-md"
              >
                RETURN TO JOURNEY
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMessage && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Overall Rating */}
              <div className="p-6 bg-[#FCFBF7] border-2 border-[#121212] rounded-xl space-y-3 shadow-xs">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  1. Overall Expedition Rating <span className="text-[#9E1B1D]">*</span>
                </label>
                <p className="text-xs text-slate-600 font-medium">
                  How would you rate your overall experience with NO FIXED ADDRESS?
                </p>
                <div className="pt-1 flex items-center gap-3">
                  {renderStarRating(overallRating, setOverallRating, 32)}
                  <span className="font-brand font-black text-lg text-slate-900">
                    {overallRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Step 2: Individual Category Ratings */}
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  2. Specific Experience Ratings
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-700 block">
                      Journey Planning & Curation
                    </span>
                    {renderStarRating(journeyRating, setJourneyRating, 18)}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-700 block">
                      Accommodations & Stays
                    </span>
                    {renderStarRating(accommodationRating, setAccommodationRating, 18)}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-700 block">
                      Daily Experiences & Activities
                    </span>
                    {renderStarRating(experienceRating, setExperienceRating, 18)}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold uppercase text-slate-700 block">
                      Travel Team & Local Guides
                    </span>
                    {renderStarRating(travelTeamRating, setTravelTeamRating, 18)}
                  </div>
                </div>
              </div>

              {/* Step 3: What did you enjoy most? */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  3. What Did You Enjoy Most?
                </label>
                <textarea
                  value={likedMost}
                  onChange={(e) => setLikedMost(e.target.value)}
                  placeholder="The unforgettable sunrise over the valley, our fantastic local guide, the seamless logistics..."
                  rows={3}
                  className="w-full p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#121212] transition-colors leading-relaxed"
                />
              </div>

              {/* Step 4: What could we improve? */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  4. What Could We Improve?
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Any timing adjustments, luggage recommendations, or suggestions for next time..."
                  rows={3}
                  className="w-full p-4 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#121212] transition-colors leading-relaxed"
                />
              </div>

              {/* Step 5: Would you recommend us? */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                  5. Would You Recommend NO FIXED ADDRESS to Friends & Family?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'YES', label: 'Yes, Absolutely', icon: ThumbsUp, color: 'hover:border-emerald-500' },
                    { id: 'NOT_SURE', label: 'Not Sure', icon: HelpCircle, color: 'hover:border-amber-500' },
                    { id: 'NO', label: 'No', icon: ThumbsDown, color: 'hover:border-rose-500' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = wouldRecommend === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setWouldRecommend(opt.id as any)}
                        className={`p-3.5 rounded-xl border-2 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${isSelected
                            ? 'bg-[#121212] text-[#F4BF4B] border-[#121212] shadow-sm'
                            : `bg-slate-50 text-slate-700 border-slate-200 ${opt.color}`
                          }`}
                      >
                        <Icon size={14} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 6: Public Testimonial & Consent */}
              <div className="p-6 bg-[#FCFBF7] border-2 border-slate-200 rounded-xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#9E1B1D] tracking-widest block">
                    PUBLIC TRAVELLER REVIEW (OPTIONAL)
                  </span>
                  <h4 className="font-brand font-black text-sm uppercase text-slate-900">
                    Share a Public Testimonial
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Would you like to share a brief testimonial for future explorers considering this journey?
                  </p>
                </div>

                <textarea
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  placeholder="Share a short quote or highlight about your trip..."
                  rows={3}
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#121212] transition-colors"
                />

                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publicConsent}
                      onChange={(e) => setPublicConsent(e.target.checked)}
                      className="mt-0.5 size-4 accent-[#9E1B1D] rounded"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Yes, I'd like NO FIXED ADDRESS to consider this feedback for publication as a traveller review.
                    </span>
                  </label>

                  {publicConsent && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        Display Name on Public Website:
                      </span>
                      <div className="flex items-center gap-2">
                        {['First Name', 'Full Name', 'Anonymous'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setPublicDisplayName(opt)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${publicDisplayName === opt
                                ? 'bg-[#121212] text-[#F4BF4B] border-[#121212]'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 bg-slate-100 text-slate-700 font-bold text-xs uppercase rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#121212] text-[#F4BF4B] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#9E1B1D] hover:text-white transition-colors cursor-pointer disabled:opacity-50 shadow-md flex items-center gap-2"
                >
                  {submitting ? 'SUBMITTING FEEDBACK...' : 'SUBMIT FEEDBACK'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
