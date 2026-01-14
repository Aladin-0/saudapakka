import { useState, useCallback, useRef } from 'react';
import { requestMonitor } from '@/lib/google-maps/request-monitor';

interface Location {
    latitude: number;
    longitude: number;
    accuracy?: number;
}

interface GeolocationResult {
    location: Location | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<Location | null>;
}

export const useGeolocation = (): GeolocationResult => {
    const [location, setLocation] = useState<Location | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Rate limiting & duplicate request prevention
    const pendingRequest = useRef<Promise<Location | null> | null>(null);
    const lastRequestTime = useRef<number>(0);
    const COOLDOWN_MS = 5000; // 5 seconds cooldown

    const requestLocation = useCallback(async (): Promise<Location | null> => {
        // 1. Check if allow: cooldown
        const now = Date.now();
        if (now - lastRequestTime.current < COOLDOWN_MS) {
            console.warn(`[Geolocation] Ignored request: Cooldown active (${((COOLDOWN_MS - (now - lastRequestTime.current)) / 1000).toFixed(1)}s left)`);
            return location; // Return cached/current state
        }

        // 2. Check if pending: de-duplicate
        if (pendingRequest.current) {
            console.log("[Geolocation] Request already in progress, returning promise.");
            return pendingRequest.current;
        }

        setIsLoading(true);
        setError(null);
        lastRequestTime.current = Date.now();
        requestMonitor.recordRequest('geolocation', false); // Can't really cache this API easily without staleness issues

        // Create promise
        pendingRequest.current = new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const err = "Geolocation is not supported by your browser";
                setError(err);
                setIsLoading(false);
                pendingRequest.current = null;
                requestMonitor.recordError('geolocation');
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setLocation(loc);
                    setIsLoading(false);
                    pendingRequest.current = null;
                    resolve(loc);
                },
                (err) => {
                    let errorMessage = "Failed to get location";
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage = "Location permission denied. Please enable it in browser settings.";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case err.TIMEOUT:
                            errorMessage = "Location request timed out.";
                            break;
                    }
                    setError(errorMessage);
                    setIsLoading(false);
                    requestMonitor.recordError('geolocation');
                    pendingRequest.current = null;
                    resolve(null); // Resolve with null instead of reject to avoid unhandled promise rejections in UI
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000 // Cache for 30s at browser level
                }
            );
        });

        return pendingRequest.current;
    }, [location]);

    return { location, isLoading, error, requestLocation };
};
