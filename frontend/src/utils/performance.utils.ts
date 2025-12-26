import { useState, useEffect, useRef } from 'react';

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
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastExecuted.current >= delay) {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }
    }, delay - (Date.now() - lastExecuted.current));

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
  });

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
  const ref = useRef<{ deps: React.DependencyList; value: T } | null>(null);

  if (ref.current && ref.current.deps.length === deps.length &&
      deps.every((dep, i) => Object.is(dep, ref.current?.deps[i]))) {
    return ref.current.value;
  }

  const value = fn();
  ref.current = { deps, value };
  return value;
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