"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, Heart, ShieldCheck, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path for active state

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Helper for active links
  const NavLink = ({ href, icon: Icon, label }: any) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? "bg-primary-green text-white shadow-md" 
            : "text-gray-400 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-dark-green text-white p-6 flex flex-col fixed h-full shadow-2xl z-20">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-bold">sauda<span className="text-accent-green">pakka</span></h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavLink href="/dashboard/overview" icon={LayoutDashboard} label="Overview" />
          
          {user?.is_active_seller && (
            <NavLink href="/dashboard/my-listings" icon={Building2} label="My Listings" />
          )}

          <NavLink href="/dashboard/saved" icon={Heart} label="Saved Properties" />
          <NavLink href="/dashboard/kyc" icon={ShieldCheck} label="Verification / KYC" />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
             <div className="w-10 h-10 rounded-full bg-accent-green flex items-center justify-center text-lg font-bold">
                {user?.full_name?.[0] || "U"}
             </div>
             <div>
                <div className="text-sm font-semibold">{user?.full_name}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.is_active_seller ? "Seller Account" : "Buyer Account"}</div>
             </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-gray-300 py-3 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}