/**
 * Accessibility Utilities
 * Helper functions and utilities for WCAG 2.1 AA compliance
 */

import React from "react";

/**
 * Check color contrast ratio
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export const getContrastRatio = (
  color1: string,
  color2: string
): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const luminance1 = getRelativeLuminance(rgb1);
  const luminance2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate relative luminance
 */
const getRelativeLuminance = (rgb: {
  r: number;
  g: number;
  b: number;
}): number => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Check if text is readable on a background
 */
export const isTextReadable = (textColor: string, bgColor: string): boolean => {
  const ratio = getContrastRatio(textColor, bgColor);
  return ratio >= 4.5; // WCAG AA level
};

/**
 * Focus trap utility for modal dialogs
 */
export const useFocusTrap = (ref: React.RefObject<HTMLElement>) => {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    element.addEventListener("keydown", handleKeyDown);

    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref]);
};

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message: string, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority as any);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Skip to main content link (accessibility best practice)
 * Note: This should be rendered in a React component file, not here
 */
export const getSkipToMainLink = () => {
  const link = document.createElement("a");
  link.href = "#main";
  link.className =
    "sr-only focus:not-sr-only fixed top-0 left-0 z-[10000] bg-teal-700 text-white px-4 py-2 font-semibold";
  link.textContent = "Skip to main content";
  return link;
};

/**
 * Accessible button component with proper ARIA attributes
 * Note: This component is moved to AccessibleButton.tsx
 */
export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  loading?: boolean;
}

/**
 * Keyboard navigation hook
 */
export const useKeyboardNavigation = (
  items: any[],
  onSelect: (index: number) => void
) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = focusedIndex;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        newIndex = (focusedIndex + 1) % items.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        newIndex = focusedIndex === 0 ? items.length - 1 : focusedIndex - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect(focusedIndex);
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
  };

  return { focusedIndex, handleKeyDown };
};

// CSS for screen reader only elements
export const srOnlyCss = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .focus\\:not-sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
`;
