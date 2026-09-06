"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiTag, FiCopy, FiCheck, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const LUXURY_OFFERS = [
  {
    id: "off-1",
    code: "DHANU50",
    badge: "50% FLAT OFF",
    title: "Gourmet Welcome Feast",
    description: "Enjoy 50% discount up to ₹150 on your first 3 orders across all kitchens.",
    minOrder: "₹199",
    tag: "First 3 Orders",
  },
  {
    id: "off-2",
    code: "BIRYANI100",
    badge: "₹100 SAVINGS",
    title: "Royal Biryani Special",
    description: "Flat ₹100 instant cash discount on premium claypot & dum biryanis.",
    minOrder: "₹349",
    tag: "Trending",
  },
  {
    id: "off-3",
    code: "PIZZAFEST",
    badge: "BOGO FREE",
    title: "Artisanal Pizza Party",
    description: "Order any large sourdough pizza and receive a classic Margherita on us.",
    minOrder: "₹499",
    tag: "Weekend Special",
  },
];

const OffersSection = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Exclusive Privileges
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            VIP Gourmet Offers & Coupons
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Apply these limited codes during checkout to enjoy lavish meals at exceptional value.
          </p>
        </div>

        <Link
          href="/offers"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
        >
          View all 8 coupons
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LUXURY_OFFERS.map((offer) => {
          const isCopied = copiedCode === offer.code;

          return (
            <div
              key={offer.id}
              className="relative bg-[#141B28] rounded-3xl p-6 border border-amber-500/20 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    {offer.badge}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    Min {offer.minOrder}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition mb-1.5">
                  {offer.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-[#0B0F17] px-3 py-1.5 rounded-xl border border-dashed border-amber-500/40">
                  <FiTag className="text-amber-400 w-3.5 h-3.5" />
                  <span className="text-xs font-black tracking-wider text-amber-300">
                    {offer.code}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(offer.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCopied
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/20"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3 h-3" />
                      Apply Code
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OffersSection;
