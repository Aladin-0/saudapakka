"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import {
    ArrowLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    HomeIcon,
    ShieldCheckIcon,
    ClockIcon,
    CheckBadgeIcon,
    BuildingOfficeIcon,
    CurrencyRupeeIcon,
    ChevronLeftIcon
} from "@heroicons/react/24/outline";

type UserDetail = {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture: string | null;
    role_category: string;
    is_staff: boolean;
    is_active_seller: boolean;
    is_active_broker: boolean;
    kyc_status: string;
    is_kyc_verified: boolean;
    date_joined: string;
    last_login: string | null;
    properties_count: number;
    kyc_details?: {
        status: string;
        verified_at: string | null;
        verified_by: string;
        verification_method: string;
    };
    recent_properties?: Array<{
        id: string;
        title: string;
        total_price: string;
        verification_status: string;
        created_at: string;
        views_count: number;
    }>;
};

export default function UserProfilePage() {
    const params = useParams();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchUserDetails(params.id as string);
        }
    }, [params.id]);

    const fetchUserDetails = async (userId: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/users/${userId}/`);
            setUser(res.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200 -m-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 -m-8">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800">User not found</h2>
                    <p className="text-gray-500 mt-2">The user you are looking for does not exist or has been deleted.</p>
                    <Link href="/admin/users" className="mt-6 inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to User Management
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'VERIFIED': return 'bg-green-50 text-green-700 border-green-200';
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getRoleBadge = () => {
        const baseClass = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm";
        if (user.is_staff) return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Administrator</span>;
        if (user.role_category === 'BROKER' || user.is_active_broker) return <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>Broker</span>;
        if (user.role_category === 'SELLER' || user.is_active_seller) return <span className={`${baseClass} bg-purple-50 text-purple-700 border-purple-200`}>Seller</span>;
        if (user.role_category === 'BUILDER') return <span className={`${baseClass} bg-orange-50 text-orange-700 border-orange-200`}>Builder</span>;
        return <span className={`${baseClass} bg-teal-50 text-teal-700 border-teal-200`}>Buyer</span>;
    };

    const formatMethod = (method: string | undefined) => {
        if (!method) return "N/A";
        if (method === 'AUTO_UPLOAD') return "By User";
        if (method === 'DIGILOCKER') return "DigiLocker";
        if (method === 'ADMIN_MANUAL') return "By Admin";
        return method;
    };

    return (
        // Changed bg to bg-gray-100 (a bit darker than slate-50/100) to distinct from white cards.
        <div className="min-h-screen bg-gray-200 -m-8 pb-12 font-sans relative">

            {/* 1. Hero Banner*/}
            <div className="h-72 w-full bg-gradient-to-br from-[#1B3A2C] via-[#2D5F3F] to-[#4A9B6D] relative overflow-hidden rounded-b-[3rem] shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-400 opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-8 pt-8 flex items-start justify-between relative z-10 w-full">
                    <div>
                        <Link href="/admin/users" className="group inline-flex items-center text-white/90 hover:text-white transition-all bg-white/10 px-4 py-2.5 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-lg hover:-translate-x-1">
                            <ChevronLeftIcon className="w-5 h-5 mr-1" />
                            <span className="font-medium text-sm">Back to Users</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 2. Left Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Info Card - Added border-gray-200 ensures visibility even on light bg */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden">
                            <div className="p-8 text-center relative">
                                <div className="relative inline-block mb-4 group cursor-pointer">
                                    <div className="p-1.5 bg-white rounded-full shadow-lg transition-transform transform group-hover:scale-105 ring-4 ring-gray-50">
                                        {user.profile_picture ? (
                                            <img
                                                src={user.profile_picture}
                                                alt={user.full_name}
                                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-4xl text-blue-500 font-bold border-4 border-white shadow-sm">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {user.is_kyc_verified && (
                                        <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-md transform translate-x-1/4 translate-y-1/4 ring-2 ring-green-50" title="Verified User">
                                            <CheckBadgeIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                                    {user.full_name || "Mystery User"}
                                </h1>
                                <div className="mb-8 scale-110">{getRoleBadge()}</div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center p-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all hover:bg-blue-50/50 hover:border-blue-100">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4 flex-shrink-0">
                                            <EnvelopeIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left overflow-hidden">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-800 truncate" title={user.email}>{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all hover:bg-green-50/50 hover:border-green-100">
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4 flex-shrink-0">
                                            <PhoneIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-800">{user.phone_number || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-3.5 rounded-2xl bg-gray-50 border border-gray-200 transition-all hover:bg-purple-50/50 hover:border-purple-100">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4 flex-shrink-0">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Joined On</p>
                                            <p className="text-sm font-semibold text-gray-800">{formatDate(user.date_joined)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Right Column */}
                    <div className="lg:col-span-8 space-y-8 pb-10">

                        {/* Status Overview Cards - Added Borders */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* KYC Card */}
                            <div className="bg-white rounded-[2rem] p-7 shadow-xl shadow-gray-200 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-125"></div>

                                <div className="flex items-center justify-between relative z-10 mb-6">
                                    <h3 className="text-gray-900 font-bold text-lg flex items-center">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                                            <ShieldCheckIcon className="w-5 h-5" />
                                        </div>
                                        KYC Verification
                                    </h3>
                                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide border ${getStatusColor(user.kyc_status)}`}>
                                        {user.kyc_status}
                                    </span>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                                        <span className="text-gray-500 font-medium">Method</span>
                                        <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                                            {formatMethod(user.kyc_details?.verification_method)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Verified On</span>
                                        <span className="font-bold text-gray-900">{formatDate(user.kyc_details?.verified_at || null)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Engagement Card */}
                            <div className="bg-white rounded-[2rem] p-7 shadow-xl shadow-gray-200 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-125"></div>

                                <div className="flex items-center justify-between relative z-10 mb-6">
                                    <h3 className="text-gray-900 font-bold text-lg flex items-center">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3">
                                            <ClockIcon className="w-5 h-5" />
                                        </div>
                                        Platform Activity
                                    </h3>
                                </div>
                                <div className="flex items-end space-x-2 relative z-10 mt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Last Logged In</p>
                                        <p className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
                                            {formatDate(user.last_login)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Listings */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200 border border-gray-200 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                        <div className="p-2 bg-gray-900 text-white rounded-lg mr-3 shadow-md">
                                            <HomeIcon className="w-5 h-5" />
                                        </div>
                                        Property Portfolio
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 ml-12">
                                        Total <span className="font-bold text-gray-900">{user.properties_count}</span> properties listed
                                    </p>
                                </div>
                                {user.properties_count > 5 && (
                                    <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                                        Showing last 5
                                    </span>
                                )}
                            </div>

                            {user.recent_properties && user.recent_properties.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/80 text-[11px] text-gray-400 font-bold uppercase tracking-wider text-left border-b border-gray-200">
                                            <tr>
                                                <th className="px-8 py-5">Property Details</th>
                                                <th className="px-6 py-5">Price</th>
                                                <th className="px-6 py-5 text-center">Status</th>
                                                <th className="px-8 py-5 text-right">Views</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {user.recent_properties.slice(0, 5).map((property, idx) => (
                                                <tr key={property.id} className="hover:bg-blue-50/30 transition-colors group cursor-default">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-start">
                                                            <div className="bg-gray-100 text-gray-400 rounded-xl w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                                <BuildingOfficeIcon className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 mb-1">
                                                                    {property.title}
                                                                </p>
                                                                <p className="text-xs text-gray-500 flex items-center">
                                                                    <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                                                                    Listed {new Date(property.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center text-sm font-bold text-gray-900 bg-gray-50 w-fit px-3 py-1 rounded-lg border border-gray-100">
                                                            <CurrencyRupeeIcon className="w-4 h-4 text-gray-400 mr-1" />
                                                            {Number(property.total_price).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(property.verification_status)}`}>
                                                            {property.verification_status === 'VERIFIED' ? 'Live' : property.verification_status.charAt(0) + property.verification_status.slice(1).toLowerCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className="text-sm font-bold text-gray-700">
                                                            {property.views_count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <HomeIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-lg mb-2">No Properties Listed</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto">This user hasn't listed any properties yet.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
