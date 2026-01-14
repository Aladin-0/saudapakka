'use client';

import React, { useRef, useEffect } from 'react';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { Loader2, MapPin } from 'lucide-react';

interface MapViewerProps {
    lat: number;
    lng: number;
    title?: string;
    address?: string;
    zoom?: number;
    className?: string;
}

export default function MapViewer({
    lat,
    lng,
    title = "Property Location",
    address,
    zoom = 15,
    className = ""
}: MapViewerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    const { map, isLoading, error } = useGoogleMap(mapRef, {
        initialCenter: { lat, lng },
        initialZoom: zoom,
        mapTypeControl: true,
        streetViewControl: true
    });

    // Update marker when map loads or props change
    useEffect(() => {
        if (!map) return;

        // Move map
        map.setCenter({ lat, lng });
        map.setZoom(zoom);

        // Update marker
        if (!markerRef.current) {
            markerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: title,
                animation: google.maps.Animation.DROP
            });

            // Add InfoWindow
            if (address) {
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 8px;">
                            <h3 style="font-weight: bold; margin-bottom: 4px;">${title}</h3>
                            <p style="font-size: 12px; color: #555;">${address}</p>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" style="display: inline-block; margin-top: 8px; color: #2D5F3F; text-decoration: none; font-size: 12px;">
                                Get Directions →
                            </a>
                        </div>
                    `
                });

                markerRef.current.addListener('click', () => {
                    infoWindow.open(map, markerRef.current);
                });
            }

        } else {
            markerRef.current.setPosition({ lat, lng });
        }

    }, [map, lat, lng, title, address, zoom]);

    if (!lat || !lng) {
        return (
            <div className={`w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 flex-col gap-2 border border-gray-200 ${className}`}>
                <MapPin className="w-8 h-8 text-gray-300" />
                <span className="text-sm font-medium">Location not available</span>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm ${className}`}>
            <div ref={mapRef} className="w-full h-full bg-gray-100" />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <span className="text-sm font-medium">Loading Map...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-20 p-4 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}
