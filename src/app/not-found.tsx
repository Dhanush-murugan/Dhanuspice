"use client";

import React from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { FiHome, FiCompass, FiShoppingCart, FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-center mb-5">
          <Logo size="lg" variant="mark" href={null} />
        </div>
        <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          Dish Not Found!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
          Oops! The page you're looking for seems to have been eaten or moved to another table.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-md shadow-primary-500/20 transition text-sm"
          >
            <FiHome className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/restaurants"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition text-sm"
          >
            <FiCompass className="w-4 h-4" />
            Restaurants
          </Link>
          <Link
            href="/offers"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold rounded-xl border border-amber-200 dark:border-amber-800 transition text-sm"
          >
            🔥 View Offers
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition text-sm"
          >
            <FiShoppingCart className="w-4 h-4" />
            View Cart
          </Link>
        </div>

        <button
          onClick={() => typeof window !== "undefined" && window.history.back()}
          className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-500 transition"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
