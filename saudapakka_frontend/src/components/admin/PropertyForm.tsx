"use client";

import { PhotoIcon, DocumentTextIcon, MapPinIcon, CheckBadgeIcon, CurrencyRupeeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormInput, FormSelect, FormTextarea, FormCheckbox, FileUploadZone } from "@/components/ui/FormElements";

// Dynamic import for Map
const LocationPicker = dynamic(() => import("./LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">Initializing Map...</div>
});

// --- Types & Constants ---
type PropertyFormData = {
    title: string;
    description: string;
    listing_type: string;
    property_type: string;
    bhk_config: number;
    bathrooms: number;
    balconies: number;
    super_builtup_area: string;
    carpet_area: string;
    total_price: string;
    maintenance_charges: string;
    maintenance_interval: string;
    availability_status: string;
    furnishing_status: string;
    possession_date: string;
    age_of_construction: number;
    address_line: string;
    locality: string;
    city: string;
    pincode: string;
    latitude: number;
    longitude: number;
    video_url: string;
    [key: string]: any;
};

const INITIAL_STATE: PropertyFormData = {
    title: "", description: "", listing_type: "SALE", property_type: "FLAT",
    bhk_config: 1, bathrooms: 1, balconies: 0,
    super_builtup_area: "", carpet_area: "",
    total_price: "", maintenance_charges: "", maintenance_interval: "MONTHLY",
    availability_status: "READY", furnishing_status: "UNFURNISHED",
    possession_date: "", age_of_construction: 0,
    address_line: "", locality: "", city: "Mumbai", pincode: "",
    latitude: 19.0760, longitude: 72.8777, video_url: ""
};

type Props = {
    initialData?: Partial<PropertyFormData>;
    onSubmit: (data: PropertyFormData, files: { [key: string]: File | File[] | null }) => Promise<void>;
    loading: boolean;
    isEditMode?: boolean;
};

// --- Reusable Section Wrapper (Native Tailwind Transitions) ---
const FormSection = ({ title, subtitle, icon: Icon, children, colorClass }: any) => (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <div className="flex items-start gap-4 mb-8">
            <div className={`p-3 rounded-2xl ${colorClass} shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

export default function PropertyForm({ initialData, onSubmit, loading, isEditMode = false }: Props) {
    const router = useRouter();
    const [formData, setFormData] = useState<PropertyFormData>(INITIAL_STATE);
    const [files, setFiles] = useState<{ [key: string]: File | File[] | null }>({
        floorPlan: null, doc712: null, docMojani: null, galleryImages: []
    });

    useEffect(() => {
        if (initialData) setFormData(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFile = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList) return;
        setFiles(prev => ({
            ...prev,
            [key]: key === 'galleryImages' ? Array.from(fileList) : fileList[0]
        }));
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData, files); }} className="space-y-10 max-w-5xl mx-auto pb-24 px-4">

            {/* Page Header */}
            <div className="pt-8 pb-4">
                <nav className="flex mb-4 text-sm text-slate-400">
                    <span>Dashboard</span> <span className="mx-2">/</span> <span className="text-slate-900">New Listing</span>
                </nav>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {isEditMode ? "Edit Property" : "List Your Property"}
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Detailed listings get 3x more inquiries from verified buyers.</p>
            </div>

            {/* 1. Basic Info */}
            <FormSection
                title="Property Overview"
                subtitle="The most important details buyers look for first."
                icon={DocumentTextIcon}
                colorClass="bg-blue-50 text-blue-600"
            >
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="col-span-2">
                        <FormInput label="Listing Title" name="title" placeholder="e.g. 3BHK Sea View Penthouse in Worli" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="col-span-2">
                        <FormTextarea label="Tell us about the property" name="description" placeholder="Mention unique features, sunlight, society vibes..." value={formData.description} onChange={handleChange} rows={4} />
                    </div>
                    <FormSelect label="Property Category" name="property_type" value={formData.property_type} onChange={handleChange}
                        options={[
                            { label: '🏢 Flat/Apartment', value: 'FLAT' },
                            { label: '🏡 Villa/Bungalow', value: 'VILLA' },
                            { label: '🏞️ Plot/Land', value: 'LAND' },
                            { label: '💼 Office Space', value: 'OFFICE' }
                        ]}
                    />
                    <FormSelect label="Listing Intent" name="listing_type" value={formData.listing_type} onChange={handleChange}
                        options={[{ label: 'For Sale', value: 'SALE' }, { label: 'For Rent', value: 'RENT' }]}
                    />
                </div>
            </FormSection>

            {/* 2. Specs & Pricing */}
            <FormSection
                title="Pricing & Area"
                subtitle="Configure the financial details and space measurements."
                icon={CurrencyRupeeIcon}
                colorClass="bg-emerald-50 text-emerald-600"
            >
                <div className="grid md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <FormInput label="Expected Price (₹)" name="total_price" type="number" placeholder="Total price" value={formData.total_price} onChange={handleChange} required />
                    <FormInput label="Super Built-up (sq.ft)" name="super_builtup_area" type="number" value={formData.super_builtup_area} onChange={handleChange} required />
                    <FormInput label="Carpet Area (sq.ft)" name="carpet_area" type="number" value={formData.carpet_area} onChange={handleChange} required />
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <FormSelect label="BHK Type" name="bhk_config" value={formData.bhk_config} onChange={handleChange} options={[1, 2, 3, 4, 5].map(n => ({ label: `${n} BHK`, value: n }))} />
                    <FormInput label="Bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} />
                    <FormInput label="Maintenance (₹/mo)" name="maintenance_charges" type="number" value={formData.maintenance_charges} onChange={handleChange} />
                </div>
            </FormSection>

            {/* 3. Location Picker */}
            <FormSection
                title="Exact Location"
                subtitle="Help buyers find your property on the map."
                icon={MapPinIcon}
                colorClass="bg-purple-50 text-purple-600"
            >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <FormInput label="Building / Project Name" name="address_line" value={formData.address_line} onChange={handleChange} required />
                    <FormInput label="Locality" name="locality" placeholder="e.g. Bandra West" value={formData.locality} onChange={handleChange} />
                    <FormInput label="City" name="city" value={formData.city} onChange={handleChange} required />
                    <FormInput label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                </div>
                <div className="rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                    <LocationPicker
                        latitude={Number(formData.latitude)}
                        longitude={Number(formData.longitude)}
                        onLocationChange={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
                    />
                </div>
            </FormSection>

            {/* 4. Amenities Grid */}
            <FormSection
                title="Features & Amenities"
                subtitle="Select all that apply to boost property value."
                icon={SparklesIcon}
                colorClass="bg-orange-50 text-orange-600"
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 p-2">
                    {[
                        ['has_power_backup', '⚡ Power Backup'], ['has_lift', '🛗 Lift Access'],
                        ['has_swimming_pool', '🏊 Swimming Pool'], ['has_gym', '🏋️ Gymnasium'],
                        ['has_park', '🌳 Private Garden'], ['has_security', '🛡️ 24/7 Security'],
                        ['has_reserved_parking', '🚗 Parking Slot'], ['is_vastu_compliant', 'Vastu Compliant']
                    ].map(([key, label]) => (
                        <div key={key} className="flex items-center hover:bg-slate-50 p-2 rounded-lg transition-colors">
                            <FormCheckbox label={label} name={key} checked={!!formData[key]} onChange={handleChange} />
                        </div>
                    ))}
                </div>
            </FormSection>

            {/* 5. Media Upload */}
            <FormSection
                title="Photos & Docs"
                subtitle="High-quality photos increase visibility by 80%."
                icon={PhotoIcon}
                colorClass="bg-pink-50 text-pink-600"
            >
                <div className="space-y-8">
                    <FileUploadZone
                        label="Main Gallery (Max 10 photos)"
                        accept="image/*"
                        multiple
                        files={files.galleryImages}
                        onChange={(e) => handleFile('galleryImages', e)}
                    />
                    <div className="grid md:grid-cols-3 gap-6">
                        <FileUploadZone label="Floor Plan" accept="image/*" files={files.floorPlan} onChange={(e) => handleFile('floorPlan', e)} />
                        <FileUploadZone label="7/12 Extract" files={files.doc712} onChange={(e) => handleFile('doc712', e)} />
                        <FileUploadZone label="Mojani Map" files={files.docMojani} onChange={(e) => handleFile('docMojani', e)} />
                    </div>
                </div>
            </FormSection>

            {/* Action Bar (Sticky Glassmorphism) */}
            <div className="sticky bottom-6 left-0 right-0 z-50">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] p-5 rounded-3xl flex items-center justify-between max-w-5xl mx-auto">
                    <button type="button" onClick={() => router.back()} className="px-8 py-3 text-slate-600 font-semibold hover:text-slate-900 transition-colors">
                        Discard Draft
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden shadow-lg shadow-slate-200"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <span>{isEditMode ? "Update Listing" : "Publish Listing"}</span>
                                    <CheckBadgeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}