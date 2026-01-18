import { startOfDay } from 'date-fns';

type RequestType = 'autocomplete' | 'details' | 'geocode' | 'reverse-geocode' | 'geolocation';

interface RequestMetrics {
    total: number;
    byType: Record<RequestType, number>;
    cacheHits: number;
    cacheMisses: number;
    errors: number;
    lastRequestTime: number;
}

const METRICS_KEY = 'google_maps_metrics';

class RequestMonitor {
    private metrics: RequestMetrics;

    constructor() {
        this.metrics = this.loadMetrics();
    }

    private loadMetrics(): RequestMetrics {
        if (typeof window === 'undefined') {
            return this.getEmptyMetrics();
        }

        try {
            const stored = localStorage.getItem(METRICS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Reset if it's a new day
                if (new Date(parsed.lastRequestTime).getDate() !== new Date().getDate()) {
                    return this.getEmptyMetrics();
                }
                return parsed;
            }
        } catch (e) {
            console.error('Failed to load metrics', e);
        }
        return this.getEmptyMetrics();
    }

    private getEmptyMetrics(): RequestMetrics {
        return {
            total: 0,
            byType: {
                'autocomplete': 0,
                'details': 0,
                'geocode': 0,
                'reverse-geocode': 0,
                'geolocation': 0
            },
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            lastRequestTime: Date.now()
        };
    }

    private saveMetrics() {
        if (typeof window === 'undefined') return;
        this.metrics.lastRequestTime = Date.now();
        localStorage.setItem(METRICS_KEY, JSON.stringify(this.metrics));
    }

    public recordRequest(type: RequestType, isCacheHit: boolean) {
        this.metrics.total++;
        this.metrics.byType[type]++;

        if (isCacheHit) {
            this.metrics.cacheHits++;
        } else {
            this.metrics.cacheMisses++;
        }

        // Warn if hitting limits (simple heuristic)
        if (this.metrics.total > 100 && this.metrics.total % 50 === 0) {
}

        this.saveMetrics();
    }

    public recordError(type: RequestType) {
        this.metrics.errors++;
        console.error(`[Google Maps Monitor] Error in ${type} request`);
        this.saveMetrics();
    }

    public getMetrics() {
        return this.metrics;
    }

    public reset() {
        this.metrics = this.getEmptyMetrics();
        this.saveMetrics();
    }
}

export const requestMonitor = new RequestMonitor();

