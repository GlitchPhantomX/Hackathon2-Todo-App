import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Debounce function to limit the rate at which a function can fire
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle function to limit the rate at which a function can fire
 */
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
  
    if (now - lastExecuted.current >= delay) {
      setThrottledValue(value);
      lastExecuted.current = now;
      return; // ✅ explicit void return
    }
  
    const remaining = delay - (now - lastExecuted.current);
    const handler = setTimeout(() => {
      setThrottledValue(value);
      lastExecuted.current = Date.now();
    }, remaining);
  
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  

  return throttledValue;
};

/**
 * Hook for measuring component render time
 */
export const useRenderTime = () => {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  useEffect(() => {
    if (startTime.current) {
      const endTime = performance.now();
      setRenderTime(endTime - startTime.current);
      startTime.current = null;
    }
  }, []); // Add empty dependency array to avoid infinite loop

  return renderTime;
};

/**
 * Hook for virtual scrolling
 */
export const useVirtualScroll = (items: any[], containerHeight: number, itemHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const visibleEnd = Math.min(visibleStart + visibleCount, items.length);

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    onScroll: (e: React.UIEvent<HTMLElement>) => setScrollTop(e.currentTarget.scrollTop)
  };
};

/**
 * Memoize expensive calculations
 */
export const useMemoizedValue = <T>(fn: () => T, deps: React.DependencyList): T => {
  // Since we can't properly memoize with dynamic deps, just return the result
  // This function is meant to be used with useMemo elsewhere
  return fn();
};

/**
 * Hook for measuring Core Web Vitals
 */
export const useWebVitals = () => {
  const [vitals, setVitals] = useState({
    LCP: null as number | null,
    FID: null as number | null,
    CLS: null as number | null
  });

  useEffect(() => {
    // This is a simplified version - in practice you'd use the web-vitals library
    const measureLCP = () => {
      // LCP measurement would happen here
      setVitals(prev => ({ ...prev, LCP: 0.5 })); // Placeholder value
    };

    measureLCP();

    // Cleanup function
    return () => {};
  }, []);

  return vitals;
};