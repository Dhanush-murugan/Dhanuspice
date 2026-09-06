"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCopy, FiCheck, FiTag, FiClock, FiArrowRight } from "react-icons/fi";
import { OFFERS_DATA } from "@/utils/mockData";
import toast from "react-hot-toast";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
            <FiTag className="w-3.5 h-3.5" />
            Exclusive Deals & Discounts
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white">
            Delicious Food, Big Savings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Apply these coupon codes at checkout to enjoy discounts, free deliveries, and exclusive cashback.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {OFFERS_DATA.map((offer) => {
            const isCopied = copiedCode === offer.code;

            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col sm:flex-row group"
              >
                {/* Image */}
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-primary-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                    {offer.discount}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-primary-500 uppercase tracking-wider">
                      {offer.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                      {offer.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                    {/* Code Chip */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/60 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs font-black tracking-widest text-gray-900 dark:text-white uppercase">
                        {offer.code}
                      </div>
                      <button
                        onClick={() => handleCopy(offer.code)}
                        className={`p-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                          isCopied
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 hover:text-primary-600 text-gray-700 dark:text-gray-300"
                        }`}
                        title="Copy Code"
                      >
                        {isCopied ? (
                          <>
                            <FiCheck className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">Min Order ₹{offer.minOrder}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <FiClock className="w-2.5 h-2.5" />
                        Expires: {offer.validTill}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Ready to use your coupon?
            </h2>
            <p className="text-white/90 text-sm mt-1 max-w-xl">
              Browse the best restaurants in town, add your favorite cravings to cart, and paste the code at checkout!
            </p>
          </div>

          <Link
            href="/restaurants"
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-primary-600 font-extrabold rounded-2xl shadow-lg hover:bg-gray-50 transition shrink-0 text-sm"
          >
            Order Food Now
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
