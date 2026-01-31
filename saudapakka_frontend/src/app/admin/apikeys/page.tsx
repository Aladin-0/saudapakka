"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { KeyIcon, TrashIcon, PlusIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

type APIKey = {
    id: number;
    user_id: string;
    user_email: string;
    user_name: string;
    name: string;
    key: string;
    is_active: boolean;
    created_at: string;
};

type User = {
    id: string;
    email: string;
    full_name: string;
    is_active_seller: boolean;
    is_active_broker: boolean;
};

export default function APIKeysPage() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [keyName, setKeyName] = useState("");
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
        fetchUsers();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await api.get('/api/admin/api-keys/');
            setKeys(res.data);
        } catch (error) {
            console.error("Failed to fetch API keys", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users/?role=ALL');
            // Filter to only show sellers and brokers
            const filtered = res.data.filter((u: User) => u.is_active_seller || u.is_active_broker);
            setUsers(filtered);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    const handleCreateKey = async () => {
        if (!selectedUserId || !keyName) {
            alert("Please select a user and enter a key name");
            return;
        }

        try {
            const res = await api.post('/api/admin/api-keys/', {
                user_id: selectedUserId,
                name: keyName
            });
            setKeys([res.data, ...keys]);
            setShowCreateModal(false);
            setSelectedUserId("");
            setKeyName("");
            alert("API Key created successfully!");
        } catch (error: any) {
            console.error("Failed to create API key", error);
            alert(error.response?.data?.error || "Failed to create API key");
        }
    };

    const handleDeleteKey = async (id: number) => {
        if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
            return;
        }

        try {
            await api.delete(`/api/admin/api-keys/${id}/`);
            setKeys(keys.filter(k => k.id !== id));
            alert("API Key deleted successfully");
        } catch (error) {
            console.error("Failed to delete API key", error);
            alert("Failed to delete API key");
        }
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">API Key Management</h1>
                    <p className="text-slate-500 mt-1">Manage external API keys for automation and integrations</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create API Key
                </button>
            </div>

            {/* API Keys List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {keys.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <KeyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No API keys yet</p>
                        <p className="text-sm mt-1">Create your first API key to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Key Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">API Key</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {keys.map((key) => (
                                    <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{key.user_name}</div>
                                                <div className="text-sm text-gray-500">{key.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">{key.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-gray-100 px-3 py-1.5 rounded font-mono text-gray-700">
                                                    {key.key.substring(0, 16)}...{key.key.substring(key.key.length - 8)}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(key.key)}
                                                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                                    title="Copy full key"
                                                >
                                                    {copiedKey === key.key ? (
                                                        <CheckIcon className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(key.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {key.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteKey(key.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New API Key</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select User
                                </label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Choose a user...</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Key Name
                                </label>
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="e.g., WhatsApp Bot"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setSelectedUserId("");
                                    setKeyName("");
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateKey}
                                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                            >
                                Create Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
