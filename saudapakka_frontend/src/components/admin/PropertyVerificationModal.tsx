"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon,
    PhotoIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
    HomeIcon, BanknotesIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/axios';

// Helper to fix image URLs
const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
};

type PropertyDetails = {
    id: string;
    title: string;
    description: string;
    project_name: string;
    city: string;
    locality: string;
    address_line: string;
    property_type: string;
    property_type_display: string;
    bhk_config: number;
    total_price: number;
    verification_status: string;
    super_builtup_area: string;
    carpet_area: string;
    owner_details: {
        full_name: string;
        email: string;
        phone_number: string;
    };
    images: { id: string; image: string }[];
    video_url: string;
    doc_7_12: string | null;
    doc_mojani: string | null;
    created_at: string;
};

type Props = {
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: () => void;
};

export default function PropertyVerificationModal({ propertyId, isOpen, onClose, onStatusChange }: Props) {
    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && propertyId) {
            fetchPropertyDetails();
        } else {
            setProperty(null);
            setSelectedImage(null);
        }
    }, [isOpen, propertyId]);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/properties/${propertyId}/`);
            setProperty(res.data);
            if (res.data.images?.length > 0) {
                setSelectedImage(getImageUrl(res.data.images[0].image));
            }
        } catch (error) {
            console.error("Failed to fetch property details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
        if (action === 'REJECT' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        try {
            setVerifying(true);
            await api.post(`/api/admin/properties/${propertyId}/action/`, {
                action,
                reason: action === 'REJECT' ? rejectionReason : undefined
            });
            onStatusChange();
            onClose();
            setShowRejectInput(false);
            setRejectionReason("");
        } catch (error) {
            alert("Action failed. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
        return `₹ ${(price / 100000).toFixed(2)} L`;
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-6xl h-[85vh] flex flex-col">

                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
                                    <div>
                                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-slate-900">
                                            Verification Console
                                        </Dialog.Title>
                                        <p className="mt-1 text-xs text-slate-500 font-mono uppercase tracking-wider">
                                            ID: {propertyId?.split('-')?.[0]}...
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {loading || !property ? (
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
                                        <p className="text-slate-500 animate-pulse">Loading property data...</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex overflow-hidden">

                                        {/* LEFT COLUMN: Media Gallery */}
                                        <div className="w-5/12 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
                                            <div className="p-4 space-y-4">
                                                {/* Main Preview */}
                                                <div className="aspect-[4/3] w-full bg-slate-200 rounded-xl overflow-hidden shadow-sm relative group">
                                                    {selectedImage ? (
                                                        <img
                                                            src={selectedImage}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <PhotoIcon className="w-12 h-12 opacity-50" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnails */}
                                                <div className="grid grid-cols-4 gap-2">
                                                    {property.images?.map((img) => {
                                                        const url = getImageUrl(img.image);
                                                        return (
                                                            <button
                                                                key={img.id}
                                                                onClick={() => url && setSelectedImage(url)}
                                                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === url ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                            >
                                                                <img src={url!} alt="" className="w-full h-full object-cover" />
                                                            </button>
                                                        )
                                                    })}
                                                </div>

                                                {/* Documents Preview Section */}
                                                <div className="mt-8">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Proof Documents</h4>
                                                    <div className="space-y-3">
                                                        {[
                                                            { label: '7/12 Extract', doc: property.doc_7_12 },
                                                            { label: 'Mojani / Map', doc: property.doc_mojani }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${item.doc ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <DocumentTextIcon className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                                                                        <p className="text-xs text-slate-500">{item.doc ? 'Available' : 'Missing'}</p>
                                                                    </div>
                                                                </div>
                                                                {item.doc ? (
                                                                    <a
                                                                        href={getImageUrl(item.doc)!}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                                                    >
                                                                        Open
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md">Required</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: Details & Actions */}
                                        <div className="w-7/12 flex flex-col bg-white">
                                            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

                                                {/* 1. Header Details */}
                                                <div>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
                                                                {property.property_type_display}
                                                            </span>
                                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{property.title}</h2>
                                                            <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm">
                                                                <MapPinIcon className="w-4 h-4" />
                                                                {property.locality}, {property.city}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatPrice(property.total_price)}</p>
                                                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Asking Price</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Key Stats Grid */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <p className="text-xs text-slate-400 font-medium uppercase">Config</p>
                                                        <p className="text-lg font-semibold text-slate-900 mt-0.5">{property.bhk_config} BHK</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <p className="text-xs text-slate-400 font-medium uppercase">Carpet Area</p>
                                                        <p className="text-lg font-semibold text-slate-900 mt-0.5">{property.carpet_area} <span className="text-sm font-normal text-slate-500">sq.ft</span></p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                        <p className="text-xs text-slate-400 font-medium uppercase">Date Added</p>
                                                        <p className="text-lg font-semibold text-slate-900 mt-0.5">
                                                            {new Date(property.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* 3. Owner Card (Improved) */}
                                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                                        <UserIcon className="w-4 h-4" />
                                                        Seller Information
                                                    </h4>

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                        {/* Avatar */}
                                                        <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-white">
                                                            {property.owner_details.full_name?.charAt(0) || 'U'}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 space-y-3 w-full">
                                                            <div>
                                                                <p className="text-xl font-bold text-slate-900 leading-none">
                                                                    {property.owner_details.full_name}
                                                                </p>
                                                                <p className="text-sm text-slate-500 mt-1">Property Owner</p>
                                                            </div>

                                                            <div className="flex flex-col gap-2">
                                                                {/* Phone Number - High Visibility */}
                                                                {property.owner_details.phone_number ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 group-hover:border-indigo-200 transition-colors">
                                                                            <PhoneIcon className="w-5 h-5 text-indigo-600" />
                                                                            <span className="text-lg font-bold text-slate-900 font-mono tracking-tight">
                                                                                {property.owner_details.phone_number}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(property.owner_details.phone_number);
                                                                                // You might want to add a toast here, but simple alert for now is fine for admin
                                                                            }}
                                                                            title="Copy Number"
                                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-red-500 text-sm font-medium flex items-center gap-2">
                                                                        <XCircleIcon className="w-4 h-4" /> No Phone Number
                                                                    </span>
                                                                )}

                                                                {/* Email */}
                                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                    <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                                                                    {property.owner_details.email}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2 min-w-[120px]">
                                                            {property.owner_details.phone_number && (
                                                                <a
                                                                    href={`https://wa.me/${property.owner_details.phone_number?.replace(/\D/g, '')}?text=Hi, verifying your property listing: ${property.title}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95"
                                                                >
                                                                    WhatsApp
                                                                </a>
                                                            )}
                                                            <a
                                                                href={`tel:${property.owner_details.phone_number}`}
                                                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all active:scale-95"
                                                            >
                                                                Call Now
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 4. Description */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        {property.description || "No description provided."}
                                                    </p>
                                                </div>

                                            </div>

                                            {/* Action Footer */}
                                            <div className="border-t border-slate-200 p-6 bg-white flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    Current Status:
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${property.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                        property.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {property.verification_status}
                                                    </span>
                                                </div>

                                                <div className="flex gap-3">
                                                    {showRejectInput ? (
                                                        <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl animate-in slide-in-from-right-4 fade-in">
                                                            <input
                                                                type="text"
                                                                placeholder="Reason for rejection..."
                                                                className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500 w-64 text-slate-700"
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleVerify('REJECT')}
                                                                disabled={!rejectionReason || verifying}
                                                                className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm disabled:opacity-50"
                                                            >
                                                                Confirm Reject
                                                            </button>
                                                            <button
                                                                onClick={() => setShowRejectInput(false)}
                                                                className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                            >
                                                                <XMarkIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={verifying}
                                                                onClick={() => handleVerify('REJECT')}
                                                                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2"
                                                            >
                                                                <XCircleIcon className="w-5 h-5" />
                                                                Reject Property
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={verifying}
                                                                onClick={() => handleVerify('APPROVE')}
                                                                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-black shadow-lg shadow-slate-200 hover:shadow-xl transition-all flex items-center gap-2"
                                                            >
                                                                <CheckCircleIcon className="w-5 h-5" />
                                                                Verify & Approve
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
