'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  className?: string;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 0.3,
  className = ''
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
  
      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
  
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    return undefined;
  }, []);

  const getVariants = () => {
    switch (type) {
      case 'slide':
        const directionVariants = {
          up: { y: 20 },
          down: { y: -20 },
          left: { x: 20 },
          right: { x: -20 },
        };
        return {
          initial: { opacity: 0, ...directionVariants[direction] },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...directionVariants[direction] },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: prefersReducedMotion ? 0 : duration,
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};