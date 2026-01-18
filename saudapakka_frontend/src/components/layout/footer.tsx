import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#1B3A2C] text-white overflow-hidden">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B3A2C] via-[#244A38] to-[#2D5F3F] opacity-90 z-0" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

      {/* Glassmorphism Circles for ambient effect */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#4A9B6D] rounded-full blur-[100px] opacity-20 z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[200px] h-[200px] bg-[#E8F5E9] rounded-full blur-[80px] opacity-10 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

          {/* 1. Company Info */}
          <div className="space-y-6">
            <h3 className="text-3xl font-extrabold tracking-tight">
              Sauda<span className="text-[#86EFAC]">pakka</span>
            </h3>
            <p className="text-gray-300 leading-relaxed max-w-sm text-base">
              Your trusted partner for 100% verified premium real estate listings. Experience transparency and trust like never before.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/saudapakka/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#4A9B6D] hover:border-[#4A9B6D] hover:scale-110 transition-all duration-300 group shadow-lg"
              >
                <Facebook className="w-5 h-5 text-white group-hover:fill-current" />
              </a>
              <a
                href="https://www.instagram.com/saudapakka?igsh=MW8zZ3pkaHkzbmRybg=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center hover:bg-[#E1306C] hover:border-[#E1306C] hover:scale-110 transition-all duration-300 group shadow-lg"
              >
                <Instagram className="w-5 h-5 text-white group-hover:fill-current" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-[#86EFAC] uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-8 h-px bg-[#86EFAC]"></span>
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/search?type=BUY" className="group flex items-center text-gray-300 hover:text-white transition-colors gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#86EFAC] transition-colors" />
                  Buy Property
                </Link>
              </li>
              <li>
                <Link href="/search?type=SELL" className="group flex items-center text-gray-300 hover:text-white transition-colors gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#86EFAC] transition-colors" />
                  Sell Property
                </Link>
              </li>
              <li>
                <Link href="/search?type=RENT" className="group flex items-center text-gray-300 hover:text-white transition-colors gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-[#86EFAC] transition-colors" />
                  Rent Property
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Contact (Moved to 3rd column since Resources is removed) */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-[#86EFAC] uppercase tracking-widest text-xs flex items-center gap-2">
              <span className="w-8 h-px bg-[#86EFAC]"></span>
              Contact Us
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-lg group-hover:bg-[#86EFAC]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Call Us</span>
                  <span className="text-white font-medium hover:text-[#86EFAC] transition-colors cursor-pointer">+91 80555 44644</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-lg group-hover:bg-[#86EFAC]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Email Us</span>
                  <span className="text-white font-medium hover:text-[#86EFAC] transition-colors cursor-pointer">sampark@saudapakka.com</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-lg group-hover:bg-[#86EFAC]/20 transition-colors">
                  <MapPin className="w-5 h-5 text-[#86EFAC]" />
                </div>
                <div>
                  <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Visit Us</span>
                  <span className="text-gray-300 leading-snug">Chhatrapati Sambhajinagar,<br />Maharashtra, India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2025 SaudaPakka. All rights reserved.</p>
            <span className="hidden md:block text-white/20">|</span>
            <a
              href="https://zaikron.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/5"
            >
              Designed by <span className="font-semibold text-[#86EFAC]">Zaikron</span>
            </a>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-white transition-colors relative group">
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#86EFAC] transition-all group-hover:w-full" />
            </Link>
            <Link href="/" className="hover:text-white transition-colors relative group">
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#86EFAC] transition-all group-hover:w-full" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}