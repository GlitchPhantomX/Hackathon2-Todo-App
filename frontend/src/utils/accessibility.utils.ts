// Utility functions for accessibility

/**
 * Get focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  return Array.from(focusableElements).filter(el => {
    return !el.hasAttribute('disabled') &&
           !el.getAttribute('aria-hidden') &&
           el.offsetParent !== null;
  });
};

/**
 * Focus trap utility function
 */
export const focusTrap = (container: HTMLElement, firstElement?: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = firstElement || focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  };

  const focusFirst = () => {
    firstFocusable?.focus();
  };

  return {
    handleKeyDown,
    focusFirst,
    destroy: () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
};

/**
 * Check color contrast according to WCAG guidelines
 */
export const checkColorContrast = (color1: string, color2: string): { ratio: number; passAA: boolean; passAAA: boolean } => {
  // Convert hex to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate relative luminance
  const luminance = (r: number, g: number, b: number): number => {
    const RsRGB = r / 255;
    const GsRGB = g / 255;
    const BsRGB = b / 255;

    const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : Math.pow((RsRGB + 0.055) / 1.055, 2.4);
    const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : Math.pow((GsRGB + 0.055) / 1.055, 2.4);
    const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : Math.pow((BsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);

  // Calculate contrast ratio
  const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  // Check WCAG compliance
  const passAA = ratio >= 4.5; // Minimum for normal text
  const passAAA = ratio >= 7.0; // Enhanced contrast

  return { ratio: parseFloat(ratio.toFixed(2)), passAA, passAAA };
};

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  const id = 'aria-announcement-' + Date.now();
  announcement.setAttribute('id', id);
  announcement.setAttribute('aria-live', politeness);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      document.body.removeChild(element);
    }
  }, 1000);
};