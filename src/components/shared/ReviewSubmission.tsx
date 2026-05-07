import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { analytics } from '../../utils/analytics';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebaseService';

interface ReviewSubmissionProps {
  packageId: string;
  packageName: string;
  onSubmit?: (review: any) => void;
}

/**
 * ReviewSubmission Component
 * Form for users to submit reviews and ratings
 */
export const ReviewSubmission: React.FC<ReviewSubmissionProps> = ({
  packageId,
  packageName,
  onSubmit,
}) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !reviewText) return;
    
    setIsSubmitting(true);

    try {
      // Create Review Object
      const reviewPayload = {
        travelerName: name,
        role: role || 'Verified Explorer',
        content: reviewText,
        rating,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=121212&color=F4BF4B&font-weight=bold`,
        approved: false, // Requires Admin Approval
        verifiedPurchase: false,
        helpfulCount: 0,
        unhelpfulCount: 0,
        featured: false,
        isAnonymous: false,
        packageId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Write to Firebase Global Reviews Collection
      await addDoc(collection(db, 'global_reviews'), reviewPayload);

      // Track review submission
      try {
        analytics.trackReviewSubmitted(rating);
      } catch (e) {
        // ignore analytics error
      }

      setSubmitStatus("success");
      setIsSubmitting(false);

      // Reset form
      setTimeout(() => {
        setName("");
        setRole("");
        setReviewText("");
        setRating(5);
        setSubmitStatus("idle");
        onSubmit?.(reviewPayload);
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitStatus("error");
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  return (
    <div className="border-4 border-[#121212] p-8 bg-white shadow-[8px_8px_0_0_#121212] mb-8">
      <h3 className="font-brand font-black text-3xl uppercase text-[#121212] tracking-tighter mb-2">Share Data.</h3>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#121212]/50 mb-8 pb-4 border-b-2 border-gray-100">
        Leave a permanent record of your operational deployment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-[8px] font-black uppercase tracking-widest text-[#121212] mb-3">
            Operational Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? "fill-[#F4BF4B] text-[#F4BF4B]"
                      : "fill-gray-300 text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-4 font-brand font-black text-2xl text-[#121212] pt-1">
              {rating} <span className="text-gray-400 text-base">/ 5</span>
            </span>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-[8px] font-black uppercase tracking-widest text-[#121212] mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full p-4 border-2 border-[#121212] outline-none focus:border-[#F4BF4B] font-bold text-sm tracking-tight transition-colors"
            required
          />
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-[8px] font-black uppercase tracking-widest text-[#121212] mb-2">
            Your Role / Title
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Photographer"
            className="w-full p-4 border-2 border-[#121212] outline-none focus:border-[#F4BF4B] font-bold text-sm tracking-tight transition-colors"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-[8px] font-black uppercase tracking-widest text-[#121212] mb-2">
            Your Feedback *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={5}
            className="w-full p-4 border-2 border-[#121212] outline-none focus:border-[#F4BF4B] font-bold text-sm tracking-tight transition-colors resize-none"
            required
          />
          <p className="text-[10px] font-bold text-[#121212]/40 uppercase mt-2 text-right">
            {reviewText.length} / 500
          </p>
        </div>

        {submitStatus === "error" && (
          <div className="bg-red-50 text-red-700 p-4 border border-red-200 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
            <span>❌</span> Transmission Failed
          </div>
        )}

        {submitStatus === "success" && (
          <div className="bg-[#FCFBF7] text-[#121212] border-2 border-[#121212] p-4 shadow-[4px_4px_0_0_#121212] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
            <span>✨</span> Log Submitted for Review
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || submitStatus === "success" || !name.trim() || !reviewText.trim()}
          className={`w-full py-5 font-black uppercase text-xs tracking-widest transition-all gap-2 flex items-center justify-center border-2 border-[#121212] ${
            isSubmitting || submitStatus === "success" || !name.trim() || !reviewText.trim()
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#121212] text-[#F4BF4B] shadow-[4px_4px_0_0_#F4BF4B] hover:bg-[#9E1B1D] hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin text-xl">⏳</span> Transmitting...
            </span>
          ) : submitStatus === "success" ? (
            "Received"
          ) : (
            <span className="flex items-center gap-2">
              <Send size={16} /> Transmit Log
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
