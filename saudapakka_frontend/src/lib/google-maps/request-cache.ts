import { requestMonitor } from './request-monitor';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiry: number;
}

class RequestCache {
    private cache: Map<string, CacheEntry<any>>;
    private maxEntries: number;
    private defaultTTL: number; // ms

    constructor(maxEntries = 50, defaultTTL = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxEntries = maxEntries;
        this.defaultTTL = defaultTTL;
    }

    public get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    public set<T>(key: string, data: T, ttl: number = this.defaultTTL) {
        // Evict oldest if full
        if (this.cache.size >= this.maxEntries) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey); // Should check undefined but Map iterator yields undefined only if empty
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry: Date.now() + ttl
        });
    }

    public clear() {
        this.cache.clear();
    }

    public size() {
        return this.cache.size;
    }
}

// Singleton instances for different services
export const autocompleteCache = new RequestCache(50, 5 * 60 * 1000); // 5 mins
export const reverseGeocodeCache = new RequestCache(100, 10 * 60 * 1000); // 10 mins
export const placesDetailsCache = new RequestCache(20, 30 * 60 * 1000); // 30 mins
export const geocodeCache = new RequestCache(50, 30 * 60 * 1000); // 30 mins
