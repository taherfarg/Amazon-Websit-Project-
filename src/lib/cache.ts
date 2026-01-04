/**
 * Simple in-memory cache with TTL support
 * Reduces database calls for frequently accessed data
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private readonly defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set item in cache with optional TTL
     */
    set<T>(key: string, data: T, ttlMs?: number): void {
        const expiresAt = Date.now() + (ttlMs || this.defaultTTL);
        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Delete item from cache
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clear expired entries
     */
    cleanup(): void {
        const now = Date.now();
        const keys = Array.from(this.cache.keys());
        for (const key of keys) {
            const entry = this.cache.get(key);
            if (entry && now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get or set pattern - fetches from cache or executes fetcher
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMs?: number
    ): Promise<T> {
        const cached = this.get<T>(key);

        if (cached !== null) {
            return cached;
        }

        const data = await fetcher();
        this.set(key, data, ttlMs);
        return data;
    }

    /**
     * Generate cache key from object
     */
    static generateKey(prefix: string, params: Record<string, unknown>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${JSON.stringify(params[key])}`)
            .join('|');
        return `${prefix}:${sortedParams}`;
    }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache TTL constants
export const CACHE_TTL = {
    SHORT: 1 * 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000,     // 5 minutes
    LONG: 15 * 60 * 1000,      // 15 minutes
    SITE_STATS: 10 * 60 * 1000, // 10 minutes
    CATEGORIES: 30 * 60 * 1000, // 30 minutes
    FEATURED: 5 * 60 * 1000,    // 5 minutes
};

// Setup automatic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        cache.cleanup();
    }, 5 * 60 * 1000);
}
