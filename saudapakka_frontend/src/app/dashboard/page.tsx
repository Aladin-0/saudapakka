"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardRoot() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is not loaded yet (hydration), wait.
    // If user is not logged in, middleware or other guards should handle it, 
    // but safe to return here.
    if (!user) return;

    if (user.is_staff) {
      router.replace("/admin");
    } else {
      router.replace("/dashboard/overview");
    }
  }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      {/* Simple Loading Spinner while redirecting */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}