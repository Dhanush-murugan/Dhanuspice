"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Logo from "@/components/ui/Logo";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiMapPin,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setIsAuthenticated, cartItems } =
    useStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dhanuspice_demo_auth");
        localStorage.removeItem("dhanuspice_current_user");
      }
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      setUser(null);
      setIsAuthenticated(false);
      setIsProfileOpen(false);
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B0F17]/90 backdrop-blur-xl border-b border-amber-500/15 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]"
          : "bg-[#0B0F17]/75 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Logo size="sm" subtitleText="Gourmet Dining" />
          </div>


          {/* Right Action Icons & User */}
          <div className="flex items-center gap-3">
            {/* Search shortcut button */}
            <Link
              href="/menu"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-amber-400 transition"
              title="Search all dishes in menu"
            >
              <FiSearch className="w-4 h-4" />
            </Link>

            {/* Cart Button */}
            {(() => {
              const navSubtotal = cartItems.reduce(
                (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
                0
              );
              return (
                <Link
                  href="/cart"
                  className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 text-white transition group"
                >
                  <div className="relative">
                    <FiShoppingCart className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline text-amber-300">
                    {cartItems.length > 0 ? `₹${navSubtotal}` : "Cart"}
                  </span>
                </Link>
              );
            })()}

            {/* Auth Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-gradient-to-r from-white/5 to-white/10 border border-white/15 hover:border-amber-500/40 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                    {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold text-gray-200 hidden sm:inline max-w-[90px] truncate">
                    {user.displayName || "User"}
                  </span>
                  <FiChevronDown
                    className={`w-3 h-3 text-gray-400 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141B28] border border-amber-500/25 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">
                        {user.displayName || "Dhanuspice Guest"}
                      </p>
                      <p className="text-[11px] text-amber-400/80 truncate">
                        {user.email || "VIP Gourmet Member"}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                    >
                      <FiUser className="text-amber-400" />
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                    >
                      <span className="text-amber-400">🛍️</span>
                      Order History
                    </Link>

                    <Link
                      href="/addresses"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                    >
                      <FiMapPin className="text-amber-400" />
                      Saved Addresses
                    </Link>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl transition"
                    >
                      <FiLogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-gold !py-2 !px-4 !text-xs !rounded-xl"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slideout Nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-1.5 animate-fadeIn">
            <Link
              href="/menu"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl transition"
            >
              <span>🍛 Explore All Dishes</span>
              <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black">
                FULL MENU →
              </span>
            </Link>
            <Link
              href="/#cuisines"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl transition"
            >
              <span>🍽️ Gourmet Cuisines</span>
              <span className="text-[10px] text-amber-400 font-bold">8 Categories</span>
            </Link>
            <Link
              href="/#offers"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-amber-400 hover:bg-white/5 rounded-xl transition"
            >
              <span>🏷️ VIP Privileges</span>
              <span className="text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">
                50% OFF
              </span>
            </Link>
            <Link
              href="/#kitchens"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl transition"
            >
              👑 Popular Kitchens
            </Link>
            <Link
              href="/#dishes"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl transition"
            >
              🔥 Trending Haute Cravings
            </Link>
            <Link
              href="/#spotlight"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl transition"
            >
              ⭐ Chef's Spotlights
            </Link>
            <Link
              href="/restaurants"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition pt-2 border-t border-white/5"
            >
              <span>Full Kitchens Directory</span>
              <span className="text-amber-400 font-bold">→</span>
            </Link>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2 text-center text-xs font-bold text-gray-300 border border-white/15 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-gold !py-2 !text-xs text-center !rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
