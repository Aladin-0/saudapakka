"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import {
    UsersIcon,
    HomeModernIcon,
    DocumentCheckIcon,
    ShieldCheckIcon,
    CurrencyRupeeIcon,
    ArrowTrendingUpIcon,
    BuildingStorefrontIcon
} from "@heroicons/react/24/outline";

type DashboardStats = {
    users: {
        total: number;
        sellers: number;
        brokers: number;
        new_this_month: number;
        kyc_verified: number;
        kyc_pending: number;
    };
    properties: {
        total: number;
        pending_verification: number;
        live_verified: number;
        rejected: number;
    };
    market_insights: {
        avg_property_price: number;
    };
};

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/admin/dashboard/stats/');
                setStats(res.data);
            } catch (error: any) {
                console.error("Failed to fetch dashboard stats", error);
                if (error.response?.status === 401) {
                    // Redirect to login if unauthorized
                    window.location.href = '/login?redirect=/dashboard/admin';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
                <p className="text-slate-500 mt-1">Platform performance, pending tasks, and key insights.</p>
            </div>

            {/* Quick Actions (Pending Tasks) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <DocumentCheckIcon className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{stats.properties.pending_verification}</div>
                            <div className="text-sm font-medium text-orange-800">Pending Properties</div>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/admin/properties?status=PENDING"
                        className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl text-center transition-colors shadow-lg shadow-orange-600/20"
                    >
                        Review Listings
                    </Link>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{stats.users.kyc_pending}</div>
                            <div className="text-sm font-medium text-indigo-800">Pending KYC Requests</div>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/admin/users?role=ALL" // Ideally filter by KYC_PENDING if supported
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl text-center transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        Verify Users
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <UsersIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.users.total}</div>
                    <div className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <ArrowTrendingUpIcon className="w-3 h-3" /> +{stats.users.new_this_month} this month
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <HomeModernIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase">Total Properties</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.properties.total}</div>
                    <div className="text-xs text-gray-400">
                        {stats.properties.live_verified} Verified • {stats.properties.rejected} Rejected
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BuildingStorefrontIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase">Active Sellers</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.users.sellers}</div>
                    <div className="text-xs text-gray-400">
                        & {stats.users.brokers} Real Estate Agents
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-50 rounded-lg">
                            <CurrencyRupeeIcon className="w-5 h-5 text-rose-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 uppercase">Avg Property Price</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₹ {(stats.market_insights.avg_property_price / 100000).toFixed(1)} L
                    </div>
                    <div className="text-xs text-gray-400">Market Average</div>
                </div>
            </div>

            {/* Recent Activity / Visuals Placeholder */}
            {/* can be expanded later with chart.js or similar */}
            <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Admin Control Center</h3>
                    <p className="text-slate-400 max-w-2xl">
                        You have full access to manage users, verify properties, and oversee platform activity.
                        Use the sidebar to navigate to specific management sections.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <ShieldCheckIcon className="w-64 h-64 text-white" />
                </div>
            </div>
        </div>
    );
}
