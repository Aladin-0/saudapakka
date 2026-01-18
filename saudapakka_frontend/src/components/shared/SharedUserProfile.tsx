"use client";

import { useRef, useState, useEffect } from "react";
import api from "@/lib/axios";
import { UserCircle, Mail, Phone, Shield, Briefcase, Star, CheckCircle, Camera, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SharedUserProfile() {
    const { user, refreshUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    // Camera Logic
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } }
            });
            streamRef.current = stream;
            // Short delay to ensure ref is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setShowCamera(false);
            alert("Could not access camera. Please allow camera permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const captureAndUpload = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob/file
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            // Convert blob to file
            const file = new File([blob], "profile_selfie.jpg", { type: "image/jpeg" });

            await uploadProfilePicture(file);
            stopCamera();

        }, 'image/jpeg', 0.8);
    };

    const uploadProfilePicture = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            alert("File size should be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("profile_picture", file);

            await api.patch("/api/user/me/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await refreshUser();
        } catch (error) {
            console.error("Failed to upload profile picture", error);
            alert("Failed to upload profile picture. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // If loading or not user (layout handles redirect, but safe check)
    if (!user) return <div className="p-8 text-center text-gray-500">Loading user profile...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">View and manage your account details and professional identity.</p>
            </div>

            {/* Profile Picture Section */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div
                            className="relative group cursor-pointer"
                            onClick={startCamera}
                        >
                            {user.profile_picture ? (
                                <img
                                    src={user.profile_picture}
                                    alt={user.full_name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 transition-opacity group-hover:opacity-75"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-blue-100 transition-opacity group-hover:opacity-75">
                                    <UserCircle className="w-16 h-16 text-blue-600" />
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-gray-700 drop-shadow-md" />
                            </div>

                            {/* Loading Overlay */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            )}

                            {user.is_kyc_verified && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white z-20">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                            <p className="text-gray-500 mt-1">{user.email}</p>
                            {user.is_kyc_verified && (
                                <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Verified Account
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Details Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <UserCircle className="w-5 h-5 text-accent-green" />
                            </div>
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Name */}
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Full Name</span>
                            <span className="text-lg font-medium text-gray-900">{user.full_name}</span>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email Amount</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-base">{user.email}</span>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone Number</span>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-base">{user.phone_number || "Not provided"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Status Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            Account Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Role */}
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current Role</span>
                            <div className="mt-1">
                                {user.is_staff || user.is_superuser ? (
                                    <Badge className="px-3 py-1 text-sm font-medium bg-red-600 hover:bg-red-700">
                                        Administrator
                                    </Badge>
                                ) : (
                                    user.role_category === 'BROKER' ? (
                                        <Badge variant='default' className="px-3 py-1 text-sm font-medium">
                                            Real Estate Agent
                                        </Badge>
                                    ) : (
                                        <Badge variant='secondary' className="px-3 py-1 text-sm font-medium">
                                            {user.role_category?.replace('_', ' ') || "USER"}
                                        </Badge>
                                    )
                                )}
                            </div>
                        </div>

                        {/* KYC Status - Hide for Admins */}
                        {!user.is_staff && !user.is_superuser && (
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">KYC Verification</span>
                                <div className="mt-1">
                                    {user.is_kyc_verified ? (
                                        <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
                                            <CheckCircle className="w-4 h-4" />
                                            Verified Identity
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-100">
                                            <Shield className="w-4 h-4" />
                                            Pending Verification
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Broker Specific Details (Conditional) */}
                {user.role_category === 'BROKER' && user.broker_profile && (
                    <Card className="md:col-span-2 shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                        Professional Details
                                    </CardTitle>
                                    <CardDescription className="text-blue-700/80">
                                        These details are visible to potential clients and partners.
                                    </CardDescription>
                                </div>
                                {user.broker_profile.is_verified && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700">Verified Agent</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                            {/* Experience */}
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Years of Experience</span>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-yellow-50 rounded-full">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{user.broker_profile.experience_years} <span className="text-base font-normal text-gray-500">Years</span></span>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Services Offered</span>
                                <div className="flex flex-wrap gap-2">
                                    {user.broker_profile.services_offered && user.broker_profile.services_offered.length > 0 ? (
                                        user.broker_profile.services_offered.map((service, idx) => (
                                            <Badge key={idx} variant="outline" className="bg-white text-gray-700 border-gray-200">
                                                {service}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">No specific services listed yet.</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full relative">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Take a Selfie</h3>
                            <button
                                onClick={stopCamera}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Video Feed */}
                        <div className="relative bg-black aspect-square md:aspect-video flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Footer / Controls */}
                        <div className="px-6 py-6 bg-gray-50 flex justify-center">
                            <button
                                onClick={captureAndUpload}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-200 transform hover:scale-105 transition-all"
                            >
                                <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-600" />
                                Capture & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
