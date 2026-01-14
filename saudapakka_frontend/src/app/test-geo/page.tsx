'use client';

import React, { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { requestMonitor } from '@/lib/google-maps/request-monitor';
import { Loader2 } from 'lucide-react';

export default function TestGeoPage() {
    const { location, isLoading, error, requestLocation } = useGeolocation();
    const [metrics, setMetrics] = useState<any>(requestMonitor.getMetrics());

    const handleGetLocation = async () => {
        await requestLocation();
        setMetrics({ ...requestMonitor.getMetrics() });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Geolocation</h1>
                    <p className="text-gray-600 mb-6">
                        Click "Get Location". Then click again immediately to test cooldown (check console).
                    </p>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center gap-4">
                        <button
                            onClick={handleGetLocation}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Get Location
                        </button>

                        {error && (
                            <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {location && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Accuracy: ~{location.accuracy}m
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-900 text-white p-6 rounded-xl font-mono text-sm">
                    <h3 className="font-bold text-lg mb-4">Request Metrics</h3>
                    <pre>{JSON.stringify(metrics, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
