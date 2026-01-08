"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon,
    PhotoIcon, PhoneIcon, EnvelopeIcon, MapPinIcon,
    CheckIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
    ArrowPathIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon,
    ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon,
    HomeIcon, CurrencyRupeeIcon, Square3Stack3DIcon,
    CalendarIcon, UserIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/axios';

// --- Type Definitions ---

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
    listing_type: string;
    furnishing_status: string;
    owner_details: {
        full_name: string;
        email: string;
        phone_number: string;
    };
    images: { id: string; image: string }[];
    floor_plans?: { id: string; image: string; order: number }[];
    video_url: string;
    doc_7_12: string | null;
    doc_mojani: string | null;
    building_commencement_certificate: string | null;
    building_completion_certificate: string | null;
    layout_sanction: string | null;
    layout_order: string | null;
    na_order_or_gunthewari: string | null;
    title_search_report: string | null;
    created_at: string;
};

type DocumentItem = {
    id: string;
    label: string;
    url: string | null;
    type: 'image' | 'pdf' | 'other';
    status: 'verified' | 'pending' | 'rejected' | 'missing';
    comments: string;
};

type Props = {
    propertyId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: () => void;
};

// --- Helper Functions ---

const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
};

const getFileType = (url: string | null): 'image' | 'pdf' | 'other' => {
    if (!url) return 'other';
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'other';
};

// --- Component ---

export default function PropertyVerificationModal({ propertyId, isOpen, onClose, onStatusChange }: Props) {
    // State
    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Document Verification State
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);

    // Viewer State
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    // Global Feedback
    const [overallComments, setOverallComments] = useState("");
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [showPropertyInfo, setShowPropertyInfo] = useState(true);

    // --- Effects ---

    useEffect(() => {
        if (isOpen && propertyId) {
            fetchPropertyDetails();
        } else {
            resetState();
        }
    }, [isOpen, propertyId]);

    const resetState = () => {
        setProperty(null);
        setDocuments([]);
        setCurrentDocIndex(0);
        setZoom(100);
        setRotation(0);
        setOverallComments("");
        setShowRejectConfirm(false);
        setShowPropertyInfo(true);
    };

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/properties/${propertyId}/`);
            const data = res.data;
            setProperty(data);

            // Transform data into normalized document list
            const initialDocs: DocumentItem[] = [
                { id: '7_12', label: '7/12 Extract or PR Card', url: getImageUrl(data.doc_7_12 || data.doc_7_12_or_pr_card), type: 'other', status: data.doc_7_12 || data.doc_7_12_or_pr_card ? 'pending' : 'missing', comments: '' },
                { id: 'mojani', label: 'Mojani / Nakasha', url: getImageUrl(data.doc_mojani || data.mojani_nakasha), type: 'other', status: data.doc_mojani || data.mojani_nakasha ? 'pending' : 'missing', comments: '' },
                { id: 'title_search', label: 'Title Search Report', url: getImageUrl(data.title_search_report), type: 'other', status: data.title_search_report ? 'pending' : 'missing', comments: '' },
                { id: 'completion', label: 'Completion Certificate', url: getImageUrl(data.building_completion_certificate), type: 'other', status: data.building_completion_certificate ? 'pending' : 'missing', comments: '' },
                { id: 'commencement', label: 'Commencement Certificate', url: getImageUrl(data.building_commencement_certificate), type: 'other', status: data.building_commencement_certificate ? 'pending' : 'missing', comments: '' },
                { id: 'layout_sanction', label: 'Layout Sanction', url: getImageUrl(data.layout_sanction), type: 'other', status: data.layout_sanction ? 'pending' : 'missing', comments: '' },
                { id: 'layout_order', label: 'Layout Order', url: getImageUrl(data.layout_order), type: 'other', status: data.layout_order ? 'pending' : 'missing', comments: '' },
                { id: 'na_order', label: 'NA Order / Gunthewari', url: getImageUrl(data.na_order_or_gunthewari), type: 'other', status: data.na_order_or_gunthewari ? 'pending' : 'missing', comments: '' },
                ...(data.images || []).map((img: any, idx: number) => ({
                    id: `img_${img.id}`, label: `Property Image ${idx + 1}`, url: getImageUrl(img.image), type: 'image' as const, status: 'pending' as const, comments: ''
                })),
                ...(data.floor_plans || []).map((fp: any, idx: number) => ({
                    id: `fp_${fp.id}`, label: `Floor Plan ${idx + 1}`, url: getImageUrl(fp.image), type: 'image' as const, status: 'pending' as const, comments: ''
                }))
            ];

            const processedDocs = initialDocs.map(doc => ({
                ...doc,
                type: getFileType(doc.url)
            }));

            setDocuments(processedDocs);

            const firstAvailable = processedDocs.findIndex(d => d.status !== 'missing');
            if (firstAvailable !== -1) setCurrentDocIndex(firstAvailable);

        } catch (error) {
            console.error("Failed to fetch property details", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Interactions ---

    const updateDocStatus = (index: number, status: DocumentItem['status']) => {
        setDocuments(prev => {
            const next = [...prev];
            next[index] = { ...next[index], status };
            return next;
        });
    };

    const verifyAllDocuments = () => {
        setDocuments(prev => prev.map(doc =>
            doc.status !== 'missing' ? { ...doc, status: 'verified' as const } : doc
        ));
    };

    const updateDocComments = (index: number, comments: string) => {
        setDocuments(prev => {
            const next = [...prev];
            next[index] = { ...next[index], comments };
            return next;
        });
    };

    const handleFinalAction = async (action: 'APPROVE' | 'REJECT') => {
        try {
            setSubmitting(true);

            let compiledReason = overallComments;

            if (action === 'REJECT') {
                const rejectedDocs = documents.filter(d => d.status === 'rejected');
                if (rejectedDocs.length > 0) {
                    compiledReason += "\n\nRejected Documents:\n" + rejectedDocs.map(d => `- ${d.label}: ${d.comments || 'Invalid'}`).join('\n');
                }
                if (!compiledReason.trim()) {
                    alert("Please provide a rejection reason or reject specific documents.");
                    setSubmitting(false);
                    return;
                }
            }

            await api.post(`/api/admin/properties/${propertyId}/action/`, {
                action,
                reason: compiledReason
            });

            onStatusChange();
            onClose();
        } catch (error) {
            alert("Action failed. Please try again.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render Helpers ---

    const currentDoc = documents[currentDocIndex];
    const verifiedCount = documents.filter(d => d.status === 'verified').length;
    const totalCount = documents.filter(d => d.status !== 'missing').length;
    const uploadedCount = documents.filter(d => d.status !== 'missing').length;
    const totalDocsCount = documents.length;

    const formatPrice = (price: number) => {
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
        return `₹${price.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full max-w-[95vw] h-[92vh] flex flex-col">

                                {/* HEADER */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {property?.owner_details.full_name?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                                                Property Verification
                                            </Dialog.Title>
                                            <p className="text-sm text-indigo-100 flex items-center gap-2 mt-0.5">
                                                <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">#{propertyId?.split('-')[0]}</span>
                                                • {uploadedCount} of {totalDocsCount} documents uploaded
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right mr-4 hidden sm:block bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                                            <p className="text-xs text-indigo-100 font-medium">Verification Progress</p>
                                            <p className="text-lg font-bold text-white">{verifiedCount} / {totalCount}</p>
                                        </div>
                                        <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 transition-colors">
                                            <XMarkIcon className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* BODY - SPLIT VIEW */}
                                {loading || !property ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center">
                                            <ArrowPathIcon className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                                            <p className="text-gray-500">Loading property details...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex overflow-hidden">

                                        {/* LEFT PANEL: Property Info + Document List */}
                                        <div className="w-[380px] border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">

                                            {/* Property Information Section */}
                                            <div className="border-b border-gray-200 bg-white">
                                                <button
                                                    onClick={() => setShowPropertyInfo(!showPropertyInfo)}
                                                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                >
                                                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                        <HomeIcon className="w-4 h-4" />
                                                        Property Details
                                                    </h4>
                                                    <ChevronRightIcon className={`w-4 h-4 text-gray-400 transition-transform ${showPropertyInfo ? 'rotate-90' : ''}`} />
                                                </button>

                                                {showPropertyInfo && (
                                                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                                                        {/* Title & Price */}
                                                        <div className="pt-3">
                                                            <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{property.title}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl font-bold text-green-600">{formatPrice(property.total_price)}</span>
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium uppercase">{property.listing_type}</span>
                                                            </div>
                                                        </div>

                                                        {/* Quick Stats Grid */}
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                                                                <p className="text-sm font-semibold text-gray-900">{property.property_type_display}</p>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-0.5">BHK</p>
                                                                <p className="text-sm font-semibold text-gray-900">{property.bhk_config || 'N/A'} BHK</p>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-0.5">Built-up</p>
                                                                <p className="text-sm font-semibold text-gray-900">{property.super_builtup_area} sqft</p>
                                                            </div>
                                                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-0.5">Carpet</p>
                                                                <p className="text-sm font-semibold text-gray-900">{property.carpet_area} sqft</p>
                                                            </div>
                                                        </div>

                                                        {/* Location */}
                                                        <div className="flex items-start gap-2 text-sm">
                                                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-gray-900 font-medium">{property.locality}, {property.city}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{property.address_line}</p>
                                                            </div>
                                                        </div>

                                                        {/* Owner Info */}
                                                        <div className="pt-2 border-t border-gray-200">
                                                            <p className="text-xs text-gray-500 mb-2 font-medium">Owner Information</p>
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-gray-900 font-medium">{property.owner_details.full_name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-gray-600">{property.owner_details.phone_number}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-gray-600 truncate">{property.owner_details.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Posted Date */}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                                                            <CalendarIcon className="w-4 h-4" />
                                                            Posted on {formatDate(property.created_at)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Documents Section */}
                                            <div className="flex-1 flex flex-col overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                                            <DocumentTextIcon className="w-4 h-4" />
                                                            Documents ({verifiedCount}/{totalCount})
                                                        </h4>
                                                        {totalCount > 0 && (
                                                            <button
                                                                onClick={verifyAllDocuments}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                                                            >
                                                                <CheckBadgeIcon className="w-4 h-4" />
                                                                Verify All
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
                                                            style={{ width: `${totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                                    {documents.map((doc, idx) => (
                                                        <button
                                                            key={doc.id}
                                                            onClick={() => {
                                                                if (doc.status !== 'missing') {
                                                                    setCurrentDocIndex(idx);
                                                                    setZoom(100);
                                                                    setRotation(0);
                                                                }
                                                            }}
                                                            disabled={doc.status === 'missing'}
                                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 group
                                                                ${currentDocIndex === idx ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-500 ring-offset-1' : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}
                                                                ${doc.status === 'missing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                            `}
                                                        >
                                                            <div className="mt-0.5">
                                                                {doc.status === 'verified' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                                                {doc.status === 'rejected' && <XCircleIcon className="w-5 h-5 text-red-500" />}
                                                                {doc.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-50" />}
                                                                {doc.status === 'missing' && <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${currentDocIndex === idx ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                                    {doc.label}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {doc.status === 'missing' ? 'Not Uploaded' : doc.type === 'pdf' ? 'PDF Document' : 'Image File'}
                                                                </p>
                                                                {doc.status === 'verified' && (
                                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                                        Verified
                                                                    </span>
                                                                )}
                                                                {doc.status === 'rejected' && (
                                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                                                        Rejected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT PANEL: Document Viewer */}
                                        <div className="flex-1 flex flex-col bg-gray-100 relative">
                                            {/* Viewer Toolbar */}
                                            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-gray-900">{currentDoc?.label}</span>
                                                    {currentDoc?.type === 'pdf' && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">PDF</span>
                                                    )}
                                                    {currentDoc?.type === 'image' && (
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">IMAGE</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {currentDoc?.type === 'image' && (
                                                        <>
                                                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2">
                                                                <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1.5 hover:bg-gray-200 rounded text-gray-600">
                                                                    <MagnifyingGlassMinusIcon className="w-4 h-4" />
                                                                </button>
                                                                <span className="text-xs text-gray-600 font-medium w-12 text-center">{zoom}%</span>
                                                                <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 hover:bg-gray-200 rounded text-gray-600">
                                                                    <MagnifyingGlassPlusIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="w-px h-6 bg-gray-300" />
                                                            <button
                                                                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-lg"
                                                                title="Rotate Left"
                                                            >
                                                                ↺
                                                            </button>
                                                            <button
                                                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-lg"
                                                                title="Rotate Right"
                                                            >
                                                                ↻
                                                            </button>
                                                        </>
                                                    )}
                                                    {currentDoc?.url && (
                                                        <>
                                                            <div className="w-px h-6 bg-gray-300" />
                                                            <a href={currentDoc.url} download className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Download">
                                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                            </a>
                                                            <a href={currentDoc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Open in New Tab">
                                                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                                            </a>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Viewer Content */}
                                            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                                                {currentDoc?.status === 'missing' ? (
                                                    <div className="text-center">
                                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                        <p className="text-lg font-semibold text-gray-600 mb-2">Document Not Uploaded</p>
                                                        <p className="text-sm text-gray-500">This document has not been provided by the owner</p>
                                                    </div>
                                                ) : currentDoc?.type === 'image' && currentDoc.url ? (
                                                    <div className="relative">
                                                        <img
                                                            src={currentDoc.url}
                                                            alt="preview"
                                                            style={{
                                                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                                                transition: 'transform 0.3s ease',
                                                                maxHeight: 'calc(90vh - 300px)',
                                                                maxWidth: '100%'
                                                            }}
                                                            className="shadow-2xl rounded-lg object-contain"
                                                        />
                                                    </div>
                                                ) : currentDoc?.type === 'pdf' && currentDoc.url ? (
                                                    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
                                                        <div className="flex-1 relative">
                                                            <iframe
                                                                src={`${currentDoc.url}#toolbar=1&navpanes=1&scrollbar=1`}
                                                                className="absolute inset-0 w-full h-full border-0"
                                                                title="PDF Viewer"
                                                            />
                                                        </div>
                                                        <div className="p-3 bg-gray-50 border-t text-center">
                                                            <p className="text-xs text-gray-500 mb-2">If PDF doesn't load, try opening in a new tab</p>
                                                            <a
                                                                href={currentDoc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                                            >
                                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                                                Open PDF in New Tab
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                                                        </div>
                                                        <p className="text-lg font-semibold text-gray-600 mb-2">Preview Not Available</p>
                                                        <p className="text-sm text-gray-500 mb-4">This file type cannot be previewed in browser</p>
                                                        {currentDoc?.url && (
                                                            <a
                                                                href={currentDoc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                            >
                                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                                Download File
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Floating Verification Controls */}
                                            {currentDoc?.status !== 'missing' && (
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                                                    <div className="bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl p-3 flex items-center gap-3">
                                                        {/* Navigation */}
                                                        <button
                                                            onClick={() => {
                                                                let prevIdx = currentDocIndex - 1;
                                                                while (prevIdx >= 0 && documents[prevIdx].status === 'missing') prevIdx--;
                                                                if (prevIdx >= 0) setCurrentDocIndex(prevIdx);
                                                            }}
                                                            disabled={currentDocIndex === 0 || documents.slice(0, currentDocIndex).every(d => d.status === 'missing')}
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Previous"
                                                        >
                                                            <ChevronLeftIcon className="w-5 h-5" />
                                                        </button>

                                                        <div className="px-3 py-1 bg-gray-100 rounded-lg">
                                                            <span className="text-xs font-bold text-gray-600">
                                                                {documents.filter((d, i) => i <= currentDocIndex && d.status !== 'missing').length} / {totalCount}
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                let nextIdx = currentDocIndex + 1;
                                                                while (nextIdx < documents.length && documents[nextIdx].status === 'missing') nextIdx++;
                                                                if (nextIdx < documents.length) setCurrentDocIndex(nextIdx);
                                                            }}
                                                            disabled={currentDocIndex === documents.length - 1 || documents.slice(currentDocIndex + 1).every(d => d.status === 'missing')}
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Next"
                                                        >
                                                            <ChevronRightIcon className="w-5 h-5" />
                                                        </button>

                                                        <div className="w-px h-8 bg-gray-300 mx-1" />

                                                        {/* Verify/Reject Buttons */}
                                                        <button
                                                            onClick={() => updateDocStatus(currentDocIndex, 'verified')}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${currentDoc?.status === 'verified'
                                                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                                                                }`}
                                                        >
                                                            <CheckIcon className="w-5 h-5" />
                                                            {currentDoc?.status === 'verified' ? 'Verified' : 'Verify'}
                                                        </button>

                                                        <button
                                                            onClick={() => updateDocStatus(currentDocIndex, 'rejected')}
                                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${currentDoc?.status === 'rejected'
                                                                ? 'bg-red-600 text-white shadow-lg scale-105'
                                                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
                                                                }`}
                                                        >
                                                            <XMarkIcon className="w-5 h-5" />
                                                            {currentDoc?.status === 'rejected' ? 'Rejected' : 'Reject'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* FOOTER */}
                                <div className="border-t border-gray-200 p-5 bg-white flex items-center justify-between gap-6">
                                    <div className="flex-1 max-w-2xl">
                                        <textarea
                                            value={overallComments}
                                            onChange={(e) => setOverallComments(e.target.value)}
                                            placeholder="Add overall verification comments or rejection reasons..."
                                            rows={2}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {showRejectConfirm ? (
                                            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                                                <span className="text-sm font-bold text-red-600">Confirm Rejection?</span>
                                                <button
                                                    onClick={() => handleFinalAction('REJECT')}
                                                    disabled={submitting}
                                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg disabled:opacity-50"
                                                >
                                                    Yes, Reject
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectConfirm(false)}
                                                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setShowRejectConfirm(true)}
                                                    className="px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors"
                                                >
                                                    Reject Property
                                                </button>
                                                <button
                                                    onClick={() => handleFinalAction('APPROVE')}
                                                    disabled={submitting || verifiedCount < totalCount}
                                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-bold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : verifiedCount < totalCount ? (
                                                        <>
                                                            <CheckBadgeIcon className="w-5 h-5" />
                                                            Verify Remaining ({totalCount - verifiedCount})
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckBadgeIcon className="w-5 h-5" />
                                                            Approve & Publish
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
