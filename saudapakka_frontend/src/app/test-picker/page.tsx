'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { requestMonitor } from '@/lib/google-maps/request-monitor';

const SmartLocationPicker = dynamic(() => import('@/components/maps/SmartLocationPicker'), { ssr: false });

export default function TestPickerPage() {
    const [selected, setSelected] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(requestMonitor.getMetrics());

    const handleSelect = (lat: number, lng: number, address: any) => {
        setSelected({ lat, lng, address });
        setMetrics({ ...requestMonitor.getMetrics() });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Smart Location Picker</h1>
                    <p className="text-gray-600 mb-6">
                        Test dragging, searching, and current location. Verify reverse geocoding limits.
                    </p>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <SmartLocationPicker onLocationSelect={handleSelect} />
                    </div>
                </div>

                {selected && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">Selected Location</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Coordinates</span>
                                <span className="font-mono">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Address</span>
                                <span>{selected.address.formatted_address}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block">JSON</span>
                                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(selected.address, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-900 text-white p-6 rounded-xl font-mono text-sm">
                    <h3 className="font-bold text-lg mb-4">Request Metrics</h3>
                    <pre>{JSON.stringify(metrics, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}
