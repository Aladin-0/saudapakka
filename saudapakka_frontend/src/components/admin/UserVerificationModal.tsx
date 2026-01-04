"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '@/lib/axios';

type Documents = {
    name: string;
    dob: string;
    address: any;
    verified_at: string;
};

type Props = {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: () => void;
};

export default function UserVerificationModal({ userId, isOpen, onClose, onStatusChange }: Props) {
    const [docs, setDocs] = useState<Documents | null>(null);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/admin/users/${userId}/documents/`);
            setDocs(res.data.documents);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (action: 'APPROVE' | 'REJECT') => {
        try {
            setVerifying(true);
            await api.post(`/api/admin/users/${userId}/verify/`, { action });
            onStatusChange();
            onClose();
        } catch (error) {
            alert("Action failed. Please try again.");
        } finally {
            setVerifying(false);
        }
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
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                                    Verify User Documents
                                </Dialog.Title>

                                {loading ? (
                                    <div className="text-center py-10">Loading Documents...</div>
                                ) : !docs ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <button
                                            onClick={fetchDocuments}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Click to load documents
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Full Name (from KYC)</p>
                                            <p className="font-medium text-gray-900">{docs.name}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-900">{docs.dob}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <p className="text-sm text-gray-500">Address Data</p>
                                            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                                {JSON.stringify(docs.address, null, 2)}
                                            </pre>
                                        </div>

                                        <div className="pt-4 flex gap-3 justify-end border-t mt-6">
                                            <button
                                                type="button"
                                                disabled={verifying}
                                                onClick={() => handleVerify('REJECT')}
                                                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                                            >
                                                <XCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                                Reject
                                            </button>
                                            <button
                                                type="button"
                                                disabled={verifying}
                                                onClick={() => handleVerify('APPROVE')}
                                                className="inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                            >
                                                <CheckCircleIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                                Verify & Approve
                                            </button>
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
