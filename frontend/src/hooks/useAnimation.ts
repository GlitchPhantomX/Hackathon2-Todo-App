'use client';

import { useState, useEffect } from 'react';

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

export const useAnimation = (duration: number = 0.3) => {
  const reducedMotion = useReducedMotion();

  return {
    duration: reducedMotion ? 0 : duration,
    transition: {
      duration: reducedMotion ? 0 : duration,
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  };
};