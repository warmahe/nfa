import React from "react";
import { AccessibleButtonProps } from "../utils/accessibility";

/**
 * Accessible Button Component
 * Implements proper ARIA attributes and keyboard support
 */
export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      ariaLabel,
      ariaPressed,
      ariaExpanded,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-busy={loading}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </button>
  )
);

AccessibleButton.displayName = "AccessibleButton";
