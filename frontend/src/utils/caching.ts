// Caching utility for API responses
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // in milliseconds
}

export class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  // Set a value in cache with expiry time
  set<T>(key: string, data: T, expiryMs: number = 5 * 60 * 1000): void { // Default 5 minutes
    const timestamp = Date.now();
    const expiry = timestamp + expiryMs;
    this.cache.set(key, { data, timestamp, expiry });
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Check if a key exists in cache
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete a specific key from cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    this.cleanExpired();
    return this.cache.size;
  }
}

// Create a singleton instance
export const apiCache = new ApiCache();

// Cache key generator
export const generateCacheKey = (url: string, params?: Record<string, any>): string => {
  const paramString = params
    ? Object.keys(params)
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
    : '';

  return `${url}${paramString ? `?${paramString}` : ''}`;
};