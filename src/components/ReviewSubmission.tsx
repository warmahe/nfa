import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { analytics } from "../utils/analytics";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const review = {
        id: `review_${Date.now()}`,
        packageId,
        author: name,
        role,
        content: reviewText,
        rating,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=0D8ABC&color=fff`,
        timestamp: new Date().toISOString(),
      };

      // Track review submission
      analytics.trackReviewSubmitted(rating);

      setSubmitStatus("success");
      setIsSubmitting(false);

      // Reset form
      setTimeout(() => {
        setName("");
        setRole("");
        setReviewText("");
        setRating(5);
        setSubmitStatus("idle");
        onSubmit?.(review);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-8 bg-gradient-to-br from-teal-50 to-blue-50 mb-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
      <p className="text-gray-600 mb-6">
        Have you completed this expedition? We'd love to hear about your adventure!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-125"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-4 text-lg font-semibold text-gray-900">
              {rating} / 5
            </span>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-200 transition-all"
            required
          />
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Role / Title
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="CEO, Adventure Enthusiast, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-200 transition-all"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Review *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience... What made this expedition special? What would you tell others?"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-200 transition-all resize-none"
            required
          />
          <p className="text-xs text-gray-600 mt-2">
            {reviewText.length} / 500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !reviewText.trim() ||
              submitStatus === "success"
            }
            className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Send size={18} />
            {isSubmitting
              ? "Submitting..."
              : submitStatus === "success"
              ? "Thank You!"
              : "Submit Review"}
          </button>

          {submitStatus === "success" && (
            <div className="flex items-center text-green-600 font-semibold">
              ✓ Review submitted successfully!
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600">
          Your review will be moderated and published on our website. Thank you
          for your feedback!
        </p>
      </form>
    </div>
  );
};
