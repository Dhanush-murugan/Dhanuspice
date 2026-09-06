"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiPackage,
  FiLogOut,
  FiEdit2,
  FiCheck,
  FiShield,
} from "react-icons/fi";
import { useStore } from "@/store/useStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, setIsAuthenticated, cartItems } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "Dhanush Kumar");
  const [phone, setPhone] = useState(user?.phone || "+91 9876543210");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setName(user.displayName || "Dhanush Kumar");
      setPhone(user.phone || "+91 9876543210");
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updated = {
        ...user,
        displayName: name,
        phone: phone,
      };
      setUser(updated);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("dhanuspice_current_user", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    }
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

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
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-500 to-amber-400 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {user?.displayName || "Dhanush Customer"}
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-full flex items-center gap-1">
                  <FiShield className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user?.email || "demo@dhanuspice.com"}
              </p>
              <p className="text-xs text-primary-500 font-semibold mt-0.5">
                {user?.phone || "+91 9876543210"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl text-xs font-bold transition"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Edit Form if active */}
        {isEditing && (
          <form
            onSubmit={handleSave}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-primary-300 dark:border-primary-700 mb-8 animate-fadeIn"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Edit Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white font-bold text-xs rounded-xl hover:bg-primary-600 transition"
            >
              <FiCheck className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/orders"
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-primary-500 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
              <FiPackage />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                Order History
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Track & reorder meals</p>
            </div>
          </Link>

          <Link
            href="/addresses"
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
              <FiMapPin />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                Saved Addresses
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Manage delivery spots</p>
            </div>
          </Link>

          <Link
            href="/cart"
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
              🛍️
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                Active Cart
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {cartItems.length} items waiting
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
