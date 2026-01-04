"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Building2, Heart, ShieldCheck, LogOut,
  Menu, X, User, ChevronRight
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, checkUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Redirect Admins to Admin Dashboard
  const isAdminRoute = pathname?.startsWith("/dashboard/admin");

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      await checkUser();
      setCheckingAuth(false);
    };
    initAuth();
  }, []);

  // Redirect Logic
  useEffect(() => {
    if (!checkingAuth) {
      if (!user) {
        router.replace("/login");
      } else if (user.is_staff && !pathname?.startsWith("/dashboard/admin")) {
        router.replace("/dashboard/admin");
      }
    }
  }, [user, checkingAuth, pathname, router]);


  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E8F5E9] border-t-[#4A9B6D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect via useEffect

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Helper for active links
  const NavLink = ({ href, icon: Icon, label }: any) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={closeSidebar}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
          ? "bg-[#2D5F3F] text-white shadow-md"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    );
  };

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <h2 className="text-xl font-bold text-[#2D5F3F]">
          sauda<span className="text-[#4A9B6D]">pakka</span>
        </h2>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-[#1B3A2C] text-white p-6 flex flex-col shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button - Mobile only */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-bold">
            sauda<span className="text-[#4A9B6D]">pakka</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <NavLink href="/dashboard/overview" icon={LayoutDashboard} label="Overview" />

          {user?.is_active_seller && (
            <NavLink href="/dashboard/my-listings" icon={Building2} label="My Listings" />
          )}

          {/* <NavLink href="/dashboard/saved" icon={Heart} label="Saved Properties" /> */}
          <NavLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification / KYC" />
        </nav>

        {/* User Profile & Logout */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-[#4A9B6D] flex items-center justify-center text-lg font-bold flex-shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.full_name}</div>
              <div className="text-xs text-gray-400 capitalize truncate">
                {user?.is_active_seller ? "Seller Account" : "Buyer Account"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              handleLogout();
              closeSidebar();
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 py-3 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
