"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function AdminPropertyCreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");

    const handleSubmit = async (formData: any, files: any) => {
        setLoading(true);
        setUploadProgress("Creating property record...");

        try {
            const payload = new FormData();

            // 1. Process and append data
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    // Send files/blobs as is, convert everything else to string
                    payload.append(key, value instanceof Blob ? value : String(value));
                }
            });

            // 2. Attach Primary Documents
            if (files.floorPlan) payload.append('floor_plan', files.floorPlan);
            if (files.doc712) payload.append('doc_7_12', files.doc712);
            if (files.docMojani) payload.append('doc_mojani', files.docMojani);

            // 3. Create initial property record
            const res = await api.post("/api/properties/", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const propertyId = res.data.id;

            // 4. Batch upload gallery images in parallel
            if (files.galleryImages?.length > 0) {
                setUploadProgress(`Uploading ${files.galleryImages.length} images...`);

                const uploadPromises = files.galleryImages.map((img: File) => {
                    const gData = new FormData();
                    gData.append('image', img);
                    return api.post(`/api/properties/${propertyId}/upload_image/`, gData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                });

                await Promise.all(uploadPromises);
            }

            alert("Property Created Successfully!");
            router.push("/dashboard/admin/properties");

        } catch (error: any) {
            console.error("Submission error:", error);
            // Show full error details from backend (e.g. {pincode: ["This field is required."]})
            const errorData = error.response?.data || error.message;
            alert(`Error: ${JSON.stringify(errorData, null, 2)}`);
        } finally {
            setLoading(false);
            setUploadProgress("");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/dashboard/admin/properties"
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Back to List
                    </Link>

                    {loading && (
                        <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                            <span className="text-sm font-semibold tracking-wide uppercase">{uploadProgress}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto py-12 px-4">
                <PropertyForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </main>
        </div>
    );
}