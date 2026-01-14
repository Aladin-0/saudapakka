'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { usePlacesAutocomplete } from '@/hooks/usePlacesAutocomplete';
import { MapPin, Crosshair, Loader2, Search } from 'lucide-react';
import SearchPlacesAutocomplete from '@/components/maps/SearchPlacesAutocomplete';

interface AddressDetails {
    formatted_address: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

interface SmartLocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number, address: AddressDetails) => void;
    showSearch?: boolean;
    showCurrentLocation?: boolean;
    className?: string;
}

export default function SmartLocationPicker({
    initialLat = 20.5937,
    initialLng = 78.9629,
    onLocationSelect,
    showSearch = true,
    showCurrentLocation = true,
    className = ""
}: SmartLocationPickerProps) {
    // Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    // Hooks
    const { map, isLoading: isMapLoading } = useGoogleMap(mapContainerRef, {
        initialCenter: { lat: initialLat, lng: initialLng },
        initialZoom: initialLat === 20.5937 ? 5 : 15 // Zoom out if default india, zoom in if provided
    });

    const { location: userLocation, requestLocation, isLoading: isGeoLoading, error: geoError } = useGeolocation();
    const { reverseGeocode, isLoading: isRevGeoLoading } = useReverseGeocode();
    const { selectPlace } = usePlacesAutocomplete();

    // Local State
    const [currentPos, setCurrentPos] = useState({ lat: initialLat, lng: initialLng });
    const [isPinning, setIsPinning] = useState(false);

    // Update Marker Position
    const updateMarker = useCallback((lat: number, lng: number) => {
        if (!map) return;

        if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }
            });

            // Drag End Listener
            markerRef.current.addListener('dragend', async (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    const newLat = e.latLng.lat();
                    const newLng = e.latLng.lng();
                    handleLocationChange(newLat, newLng);
                }
            });
        } else {
            markerRef.current.setPosition({ lat, lng });
        }

        setCurrentPos({ lat, lng });
    }, [map]);

    // Handle Location Change (Drag or Click or Select)
    const handleLocationChange = useCallback(async (lat: number, lng: number, skipFlyTo = false) => {
        setCurrentPos({ lat, lng });
        updateMarker(lat, lng);

        if (map && !skipFlyTo) {
            map.panTo({ lat, lng });
            map.setZoom(17);
        }

        setIsPinning(true);
        const address = await reverseGeocode(lat, lng);
        setIsPinning(false);

        if (address) {
            onLocationSelect(lat, lng, address);
        }
    }, [map, updateMarker, reverseGeocode, onLocationSelect]);

    // Initialize Click Listener
    useEffect(() => {
        if (!map) return;

        const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                handleLocationChange(e.latLng.lat(), e.latLng.lng());
            }
        });

        // Initialize marker if needed
        if (initialLat && initialLng) {
            updateMarker(initialLat, initialLng);
        }

        return () => {
            google.maps.event.removeListener(clickListener);
        };
    }, [map, initialLat, initialLng, updateMarker, handleLocationChange]);

    // Handle Current Location Click
    const handleUseCurrentLocation = async () => {
        const loc = await requestLocation();
        if (loc) {
            handleLocationChange(loc.latitude, loc.longitude);
        }
    };

    // Handle Search Selection
    const handlePlaceSelect = async (placeId: string) => {
        const result = await selectPlace(placeId);
        if (result) {
            handleLocationChange(result.lat, result.lng);
        }
    };

    return (
        <div className={`relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />

            {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <span className="text-sm font-medium">Loading Map...</span>
                    </div>
                </div>
            )}

            {/* Overlays */}
            {!isMapLoading && (
                <>
                    {/* Search Bar */}
                    {showSearch && (
                        <div className="absolute top-4 left-4 right-16 z-[1] max-w-sm">
                            <SearchPlacesAutocomplete
                                onPlaceSelected={handlePlaceSelect}
                                placeholder="Search for area, locality..."
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="absolute top-4 right-4 z-[1] flex flex-col gap-2">
                        {showCurrentLocation && (
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={isGeoLoading}
                                title="Use Current Location"
                                className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                            >
                                {isGeoLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                ) : (
                                    <Crosshair className="w-5 h-5" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Bottom Status Panel */}
                    {(isRevGeoLoading || isPinning) && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                            {isPinning ? "Fetching address..." : "Updating location..."}
                        </div>
                    )}

                    {/* Geolocation Error Toast */}
                    {geoError && (
                        <div className="absolute top-20 right-4 z-[1] bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 shadow-sm max-w-[200px]">
                            {geoError}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
