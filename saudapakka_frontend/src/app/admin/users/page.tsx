"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import UserVerificationModal from "@/components/admin/UserVerificationModal";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    UserIcon,
    TrashIcon,
    PencilSquareIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import UserManagementModal from "@/components/admin/UserManagementModal";

type User = {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    is_active_seller: boolean;
    is_active_broker: boolean;
    kyc_status: string;
    verified_at?: string;
};

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    // Modal State
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    // Management Modal
    const [selectedUserForManagement, setSelectedUserForManagement] = useState<User | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    useEffect(() => {
        if (user?.is_staff) {
            fetchUsers();
        }
    }, [filter, user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/users/?role=${filter}`);
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyClick = (userId: string) => {
        setSelectedUserId(userId);
        setIsVerifyModalOpen(true);
    };

    const handleVerificationComplete = () => {
        fetchUsers(); // Refresh list to show new status
    };

    const handleManageClick = (user: User) => {
        setSelectedUserForManagement(user);
        setIsManageModalOpen(true);
    };

    const handleDeleteClick = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to PERMANENTLY delete ${userName}? This action cannot be undone.`)) return;

        try {
            setLoading(true); // Optimistic or block interaction
            await api.delete(`/api/admin/users/${userId}/`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (!user?.is_staff) {
        return <div className="p-10 text-center text-red-500 font-bold">⛔ Admin Access Required</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-1">Monitor users, verified badges, and KYC requests.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                    <button
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("BROKER")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'BROKER' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Brokers
                    </button>
                    <button
                        onClick={() => setFilter("SELLER")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'SELLER' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Sellers
                    </button>
                    <button
                        onClick={() => setFilter("LOGGED_IN")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'LOGGED_IN' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Recently Active
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading directory...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-400">No users found matching your criteria.</td></tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                                    {u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">{u.full_name || "Unnamed User"}</div>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1 items-start">
                                                {u.is_active_broker && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                        <ShieldCheckIcon className="w-3 h-3" /> Broker
                                                    </span>
                                                )}
                                                {u.is_active_seller && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <UserIcon className="w-3 h-3" /> Seller
                                                    </span>
                                                )}
                                                {!u.is_active_broker && !u.is_active_seller && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Consumer
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.kyc_status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                u.kyc_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${u.kyc_status === 'VERIFIED' ? 'bg-green-500' :
                                                    u.kyc_status === 'REJECTED' ? 'bg-red-500' :
                                                        'bg-yellow-500'
                                                    }`}></span>
                                                {u.kyc_status || 'NOT STARTED'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => handleVerifyClick(u.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline text-xs"
                                                >
                                                    Verify Docs
                                                </button>
                                                <button
                                                    onClick={() => handleManageClick(u)}
                                                    className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Manage Roles & Status"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(u.id, u.full_name)}
                                                    className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete User"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Verification Modal */}
            {isVerifyModalOpen && selectedUserId && (
                <UserVerificationModal
                    userId={selectedUserId}
                    isOpen={isVerifyModalOpen}
                    onClose={() => setIsVerifyModalOpen(false)}
                    onStatusChange={handleVerificationComplete}
                />
            )}

            {isManageModalOpen && selectedUserForManagement && (
                <UserManagementModal
                    user={selectedUserForManagement}
                    isOpen={isManageModalOpen}
                    onClose={() => setIsManageModalOpen(false)}
                    onUpdate={fetchUsers}
                />
            )}
        </div>
    );
}
