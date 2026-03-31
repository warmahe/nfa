import React from "react";

/**
 * SkipToMain Component
 * Provides accessible skip link for keyboard navigation
 */
export const SkipToMain: React.FC = () => (
  <a
    href="#main"
    className="sr-only focus:not-sr-only fixed top-0 left-0 z-[10000] bg-teal-700 text-white px-4 py-2 font-semibold"
  >
    Skip to main content
  </a>
);
