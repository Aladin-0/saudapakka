"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer">
            <h1 className="text-2xl font-bold text-primary-green">
              sauda<span className="text-accent-green">pakka.com</span>
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search?type=BUY" className="text-gray-700 hover:text-primary-green transition-colors font-medium">Buy</Link>
            <Link href="/search?type=SELL" className="text-gray-700 hover:text-primary-green transition-colors font-medium">Sell</Link>
            <Link href="/search?type=RENT" className="text-gray-700 hover:text-primary-green transition-colors font-medium">Rent</Link>
            
            {user ? (
               <Link href="/dashboard/overview">
                  <Button className="bg-primary-green hover:bg-dark-green text-white px-6 rounded-lg font-medium shadow-sm border-none">
                    Dashboard
                  </Button>
               </Link>
            ) : (
               <Link href="/login">
                  <Button className="bg-primary-green hover:bg-dark-green text-white px-6 rounded-lg font-medium shadow-sm border-none">
                    Login
                  </Button>
               </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}