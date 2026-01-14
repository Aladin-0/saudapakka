import { useState, useCallback, useRef } from 'react';
import { getGeocoder } from '@/lib/google-maps/loader';
import { reverseGeocodeCache } from '@/lib/google-maps/request-cache';
import { requestMonitor } from '@/lib/google-maps/request-monitor';

export interface AddressResult {
    formatted_address: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    place_id: string;
}

export const useReverseGeocode = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // To cancel previous requests if map is dragged fast
    const abortControllerRef = useRef<AbortController | null>(null);

    const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<AddressResult | null> => {
        // Validate coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            return null;
        }

        const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`; // Precision ~11m is enough for cache

        // 1. Check Cache
        const cached = reverseGeocodeCache.get<AddressResult>(cacheKey);
        if (cached) {
            console.log(`[ReverseGeo] Cache Hit: ${cacheKey}`);
            requestMonitor.recordRequest('reverse-geocode', true);
            return cached;
        }

        // 2. Setup Loading & Abort
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // Cancel previous
        }
        abortControllerRef.current = new AbortController(); // Not actually used by Google Maps JS API but good practice/placeholder

        setIsLoading(true);
        setError(null);
        requestMonitor.recordRequest('reverse-geocode', false); // Cache Miss

        try {
            const geocoder = await getGeocoder();

            const response = await geocoder.geocode({
                location: { lat, lng }
            });

            if (response.results && response.results.length > 0) {
                const result = response.results[0];

                // Parse address components
                const address: AddressResult = {
                    formatted_address: result.formatted_address,
                    street: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: '',
                    place_id: result.place_id
                };

                result.address_components.forEach(comp => {
                    const type = comp.types[0];
                    if (type === 'route' || type === 'street_number') {
                        address.street = address.street ? `${address.street} ${comp.long_name}` : comp.long_name;
                    }
                    else if (type === 'locality' || type === 'administrative_area_level_2' || type === 'sublocality') {
                        // Prioritize locality then sublocality
                        if (type === 'locality' || !address.city) address.city = comp.long_name;
                    }
                    else if (type === 'administrative_area_level_1') {
                        address.state = comp.long_name;
                    }
                    else if (type === 'postal_code') {
                        address.pincode = comp.long_name;
                    }
                    else if (type === 'country') {
                        address.country = comp.long_name;
                    }
                });

                // Cache result
                reverseGeocodeCache.set(cacheKey, address);
                setIsLoading(false);
                return address;
            } else {
                throw new Error("No address found for this location");
            }

        } catch (err: any) {
            console.error("Reverse Geocoding Error:", err);

            // Specific error handling
            if (err.code === 'REQUEST_DENIED' || err.message?.includes('REQUEST_DENIED')) {
                setError("Geocoding API not enabled or restricted. Please enable 'Geocoding API' in Google Cloud Console.");
            } else if (err.code === 'ZERO_RESULTS') {
                setError("No address details found for this location.");
            } else {
                setError("Failed to fetch address details. Please try again.");
            }

            requestMonitor.recordError('reverse-geocode');
            setIsLoading(false);
            return null;
        }
    }, []);

    return { reverseGeocode, isLoading, error };
};
