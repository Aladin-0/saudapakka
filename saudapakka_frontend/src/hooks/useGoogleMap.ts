import { useEffect, useRef, useState, useCallback } from 'react';
import { waitForGoogleMaps } from '../lib/google-maps/loader';
import { requestMonitor } from '../lib/google-maps/request-monitor';

interface GoogleMapOptions extends google.maps.MapOptions {
    initialCenter?: { lat: number; lng: number };
    initialZoom?: number;
}

export const useGoogleMap = (
    mapRef: React.RefObject<HTMLDivElement | null>,
    options: GoogleMapOptions = {}
) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Store instance to prevent recreation
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        const initMap = async () => {
            if (!mapRef.current) return;
            if (mapInstanceRef.current) {
                setMap(mapInstanceRef.current);
                setIsLoading(false);
                return;
            }

            try {
                // Ensure API is loaded
                await waitForGoogleMaps();

                if (!isMounted.current) return;

                const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India

                // Initialize map
                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: options.initialCenter || defaultCenter,
                    zoom: options.initialZoom || 5,
                    mapTypeControl: options.mapTypeControl ?? false,
                    fullscreenControl: options.fullscreenControl ?? false,
                    streetViewControl: options.streetViewControl ?? false,
                    zoomControl: options.zoomControl ?? true,
                    ...options
                });

                mapInstanceRef.current = mapInstance;
                setMap(mapInstance);
                setIsLoading(false);

                // Log initialization
                // requestMonitor.recordRequest('map-init', true); 

            } catch (err: any) {
                if (isMounted.current) {
                    console.error("Error initializing Google Map:", err);
                    setError(err.message || "Failed to load map");
                    setIsLoading(false);
                }
            }
        };

        initMap();

        return () => {
            isMounted.current = false;
            // Map instance cleanup if needed (Google Maps usually handles this)
            // But we keep the ref alive if user component remounts quickly? 
            // Actually better to let it be Garbage Collected if component unmounts.
            // But we keep mapInstanceRef for valid lifecycle within the same component instance.
        };
    }, [options.initialCenter?.lat, options.initialCenter?.lng, options.initialZoom]);
    // Careful with deps - we don't want re-init on every prop change.
    // Usually we use refs for options or only init once.
    // But here we allow re-init if initial params strictly change.

    return { map, isLoading, error };
};
