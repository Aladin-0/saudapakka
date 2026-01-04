"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, setPosition, onSelect }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void, onSelect: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : <Marker position={position} />;
}

// Helper to control map center programmatically
function MapController({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    // Default center: Pune/Aurangabad region (User preference)
    const defaultCenter = { lat: 19.8762, lng: 75.3433 };

    // Controlled state derived from props
    const [position, setPosition] = useState<L.LatLng | null>(
        (latitude && longitude) ? new L.LatLng(latitude, longitude) : null
    );
    const [center, setCenter] = useState<L.LatLngExpression>(
        (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCenter
    );

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Sync local state if props change externally
    useEffect(() => {
        if (latitude && longitude) {
            const newPos = new L.LatLng(latitude, longitude);
            setPosition(newPos);
            // We usually don't move center automatically on prop change to avoid jumping, 
            // but for initial load it's handled by useState init.
        }
    }, [latitude, longitude]);


    const handleSearch = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (result: any) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const newPos = new L.LatLng(lat, lon);

        setCenter(newPos);
        setPosition(newPos);
        onLocationChange(lat, lon);

        setSearchResults([]);
        setSearchQuery("");
    };

    const handleCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = new L.LatLng(latitude, longitude);
                setCenter(newPos);
                setPosition(newPos);
                onLocationChange(latitude, longitude);
            }, (err) => {
                console.error("Geolocation error:", err);
                alert("Could not get current location");
            });
        } else {
            alert("Geolocation is not supported by your browser");
        }
    };

    return (
        <div className="relative h-[300px] w-full rounded-md overflow-hidden border border-gray-300 z-0">
            {/* Search Bar Overlay */}
            <div className="absolute top-4 left-4 right-16 z-[1000] max-w-xs sm:max-w-md">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border-0 focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                    <button
                        type="button"
                        onClick={(e) => handleSearch(e)}
                        className="hidden"
                    >
                        Search
                    </button>

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                            {searchResults.map((result, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectLocation(result)}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm truncate"
                                >
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Current Location Button */}
            <button
                type="button"
                onClick={handleCurrentLocation}
                className="absolute top-4 right-4 z-[1000] p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-gray-50 text-blue-600"
                title="Use Current Location"
            >
                <MapPinIcon className="w-5 h-5" />
            </button>

            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={center} />
                <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationChange} />
            </MapContainer>
        </div>
    );
}
