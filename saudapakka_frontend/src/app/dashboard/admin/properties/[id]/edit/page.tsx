"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter, useParams } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";

export default function AdminPropertyEditPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            fetchProperty();
        }
    }, [params.id]);

    const fetchProperty = async () => {
        try {
            const res = await api.get(`/api/properties/${params.id}/`);
            setInitialData(res.data);
        } catch (error) {
            console.error("Failed to load property", error);
            alert("Could not load property data.");
            router.push("/dashboard/admin/properties");
        }
    };

    const handleSubmit = async (formData: any, files: any) => {
        setLoading(true);
        try {
            const payload = new FormData();

            // Append Data
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    // @ts-ignore
                    payload.append(key, typeof value === 'boolean' ? (value ? 'true' : 'false') : value.toString());
                }
            });

            // Patch Property
            await api.patch(`/api/properties/${params.id}/`, payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Handle New Images if any
            if (files.galleryImages?.length > 0) {
                for (const img of files.galleryImages) {
                    const gData = new FormData();
                    gData.append('image', img);
                    await api.post(`/api/properties/${params.id}/upload_image/`, gData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    });
                }
            }

            alert("Property Updated!");
            router.push("/dashboard/admin/properties");

        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update property.");
        } finally {
            setLoading(false);
        }
    };

    if (!initialData) return <div className="p-10 text-center">Loading Property...</div>;

    return (
        <div className="max-w-5xl mx-auto p-8 pb-24">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Property</h1>
            <p className="text-gray-500 mb-8">Update property details and manage images.</p>
            <PropertyForm
                initialData={initialData}
                onSubmit={handleSubmit}
                loading={loading}
                isEditMode={true}
            />
        </div>
    );
}
