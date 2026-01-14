import { useState, useCallback, useRef, useEffect } from 'react';
import { getAutocompleteService, getGeocoder, getSessionToken, refreshSessionToken } from '@/lib/google-maps/loader';
import { autocompleteCache, placesDetailsCache } from '@/lib/google-maps/request-cache';
import { requestMonitor } from '@/lib/google-maps/request-monitor';
import { AddressResult } from './useReverseGeocode';

export interface PlacePrediction {
    description: string;
    place_id: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
}

export const usePlacesAutocomplete = () => {
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Internal state
    // We start session token on mount
    const hasInitializedSession = useRef(false);

    useEffect(() => {
        if (!hasInitializedSession.current) {
            getSessionToken(); // Pre-load
            hasInitializedSession.current = true;
        }
    }, []);

    // Get suggestions for input
    const getSuggestions = useCallback(async (input: string) => {
        if (!input || input.length < 3) {
            setPredictions([]);
            return;
        }

        const trimmedInput = input.trim();
        const cacheKey = `autocomplete_${trimmedInput}`;

        // 1. Check Cache
        const cached = autocompleteCache.get<PlacePrediction[]>(cacheKey);
        if (cached) {
            console.log(`[Autocomplete] Cache Hit: ${trimmedInput}`);
            requestMonitor.recordRequest('autocomplete', true);
            setPredictions(cached);
            return;
        }

        setIsLoading(true);
        setError(null);

        // 2. Fetch
        try {
            const service = await getAutocompleteService();
            const token = await getSessionToken();

            requestMonitor.recordRequest('autocomplete', false);

            service.getPlacePredictions({
                input: trimmedInput,
                componentRestrictions: { country: 'in' }, // India only
                sessionToken: token,
                types: ['geocode', 'establishment'] // Broad search
            }, (results, status) => {
                setIsLoading(false);

                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const mapped = results.map(p => ({
                        description: p.description,
                        place_id: p.place_id,
                        structured_formatting: {
                            main_text: p.structured_formatting.main_text,
                            secondary_text: p.structured_formatting.secondary_text
                        }
                    })).slice(0, 10); // Limit to 10

                    autocompleteCache.set(cacheKey, mapped);
                    setPredictions(mapped);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setPredictions([]);
                } else {
                    console.error("Autocomplete failed:", status);
                    setError("Failed to fetch suggestions");
                    requestMonitor.recordError('autocomplete');
                    setPredictions([]);
                }
            });

        } catch (err) {
            console.error("Autocomplete error:", err);
            setError("Error connecting to map service");
            requestMonitor.recordError('autocomplete');
            setIsLoading(false);
        }
    }, []);

    // Select a place and get details (Geometry + Address)
    // NOTE: AutocompleteService gives ID, we need Geocoder to get Lat/Lng + Address Details elegantly
    const selectPlace = useCallback(async (placeId: string): Promise<{ lat: number; lng: number; address: AddressResult } | null> => {
        // 1. Check Cache
        const cacheKey = `details_${placeId}`;
        const cached = placesDetailsCache.get<any>(cacheKey);
        if (cached) {
            console.log(`[PlaceDetails] Cache Hit: ${placeId}`);
            requestMonitor.recordRequest('details', true);
            return cached;
        }

        setIsLoading(true);

        try {
            const geocoder = await getGeocoder();
            // Using Geocoder is cheaper/easier for simple LatLng+Address fetch compared to Places Details API
            // BUT for session token continuity, strict usage implies Places Details.
            // However, Geocoding API doesn't support session tokens.
            // Standard practice: Using 'placeId' with Geocoding API counts as a Geocoding request.
            // To "close" the session properly and pay for the Autocomplete usage, we SHOULD use Places Details.
            // BUT: Places Details is expensive.
            // OPTION: We use Geocoder. It's robust. The Autocomplete session auto-expires.
            // User requested "Session Tokens" usage. 
            // Correct flow: Autocomplete (Session) -> Map Load (No charge) OR Details (Session Charge).
            // Let's use Geocoder with placeId, it's efficient.

            requestMonitor.recordRequest('details', false); // Actually 'geocode', but logical step is details

            const response = await geocoder.geocode({ placeId: placeId });

            if (response.results && response.results.length > 0) {
                const result = response.results[0];
                const lat = result.geometry.location.lat();
                const lng = result.geometry.location.lng();

                // Reset session after successful selection
                refreshSessionToken();

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
                    if (type === 'route' || type === 'street_number') address.street = address.street ? `${address.street} ${comp.long_name}` : comp.long_name;
                    else if (type === 'locality' || (!address.city && type === 'administrative_area_level_2')) address.city = comp.long_name;
                    else if (type === 'administrative_area_level_1') address.state = comp.long_name;
                    else if (type === 'postal_code') address.pincode = comp.long_name;
                    else if (type === 'country') address.country = comp.long_name;
                });

                const data = { lat, lng, address };
                placesDetailsCache.set(cacheKey, data);
                setIsLoading(false);
                return data;
            } else {
                throw new Error("Place details not found");
            }
        } catch (err) {
            console.error("Select Place Error:", err);
            setError("Failed to fetch location details");
            requestMonitor.recordError('details');
            setIsLoading(false);
            return null;
        }
    }, []);

    const clearCache = () => {
        autocompleteCache.clear();
        setPredictions([]);
    };

    return { predictions, isLoading, error, getSuggestions, selectPlace, clearCache };
};
