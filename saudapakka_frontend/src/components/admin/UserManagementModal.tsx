import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/lib/axios";

interface UserManagementModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function UserManagementModal({ user, isOpen, onClose, onUpdate }: UserManagementModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isBroker, setIsBroker] = useState(user?.is_active_broker || false);
    const [isSeller, setIsSeller] = useState(user?.is_active_seller || false);

    const handleUpdateRoles = async () => {
        setIsLoading(true);
        try {
            await api.post(`/api/admin/users/${user.id}/action/`, {
                action: 'UPDATE_ROLE',
                is_active_broker: isBroker,
                is_active_seller: isSeller
            });
            onUpdate();
            onClose();
        } catch (error) {
            alert("Failed to update roles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockToggle = async () => {
        if (!confirm(`Are you sure you want to ${user.is_active ? 'block' : 'unblock'} this user?`)) return;

        setIsLoading(true);
        try {
            await api.post(`/api/admin/users/${user.id}/action/`, {
                action: user.is_active ? 'BLOCK' : 'UNBLOCK'
            });
            onUpdate();
            onClose();
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-bold">Manage User: {user?.full_name}</Dialog.Title>
                        <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-500" /></button>
                    </div>

                    <div className="space-y-6">
                        {/* Role Management */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Roles</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isBroker}
                                        onChange={(e) => setIsBroker(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="font-medium text-gray-900">Broker</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSeller}
                                        onChange={(e) => setIsSeller(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="font-medium text-gray-900">Seller</span>
                                </label>
                            </div>
                            <button
                                onClick={handleUpdateRoles}
                                disabled={isLoading}
                                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                                {isLoading ? 'Saving...' : 'Save Roles'}
                            </button>
                        </div>

                        <hr />

                        {/* Account Status */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase">Danger Zone</h3>
                            <button
                                onClick={handleBlockToggle}
                                disabled={isLoading}
                                className={`w-full py-2 rounded-lg font-medium text-sm border ${user?.is_active
                                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                                        : 'border-green-200 text-green-600 hover:bg-green-50'
                                    }`}
                            >
                                {user?.is_active ? 'Block Account' : 'Unblock Account'}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
