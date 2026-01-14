export const validateGoogleMapsSetup = () => {
    const results = {
        apiKey: false,
        scriptLoaded: false,
        placesLibrary: false,
        geocodingLibrary: false,
        errors: [] as string[]
    };

    // 1. Check API Key
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        results.apiKey = true;
    } else {
        results.errors.push("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables");
    }

    // 2. Client-side checks
    if (typeof window !== 'undefined') {
        if (window.google?.maps) {
            results.scriptLoaded = true;

            if (window.google.maps.places) {
                results.placesLibrary = true;
            } else {
                results.errors.push("Places library not loaded");
            }

            if (window.google.maps.Geocoder) {
                results.geocodingLibrary = true;
            } else {
                results.errors.push("Geocoder library not loaded");
            }
        } else {
            results.errors.push("Google Maps script not active on window object");
        }
    }

    return results;
};
