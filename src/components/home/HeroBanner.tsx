"use client";

import React from "react";
import Link from "next/link";
import {
  FiClock,
  FiStar,
  FiShield,
  FiTag,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";

const HeroBanner = () => {
  return (
    <div id="hero" className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-16 bg-[#0B0F17] scroll-mt-24">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-amber-500/15 via-orange-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Spacious, User-Friendly & Conversion-Focused */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Status & Quality Eyebrow */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 font-bold backdrop-blur-md shadow-sm">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-extrabold text-white">Live in Chennai</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="tracking-wide">Chef-Curated Gourmet Dining</span>
              <span className="text-white/30 hidden sm:inline">•</span>
              <span className="text-amber-400 font-extrabold hidden sm:inline">25-Min Delivery Guarantee</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Savor Masterchef Dishes,{" "}
              <span className="text-gold-gradient block mt-1">
                Handcrafted & Delivered Hot.
              </span>
            </h1>

            {/* Subtitle with generous line-height */}
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Order authentic royal dum biryanis, artisanal wood-fired pizzas, and gourmet creations from premier kitchens with zero markup and luxury insulated packaging.
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm tracking-wide shadow-[0_10px_25px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(245,158,11,0.6)] transition-all duration-300 transform active:scale-98 flex items-center gap-2"
              >
                <span>Explore Full Menu</span>
                <FiArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <a
                href="#kitchens"
                className="px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-amber-500/40 text-white hover:text-amber-300 font-extrabold text-sm tracking-wide transition-all duration-300 flex items-center gap-2 backdrop-blur-md"
              >
                <span>View Premier Kitchens</span>
              </a>
            </div>
          </div>

          {/* Right Column: Floating Luxury Food Presentation */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Glowing Aura Circle */}
            <div className="w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/25 via-orange-500/15 to-transparent absolute blur-2xl pointer-events-none" />

            {/* Central Luxury Platter Frame */}
            <div className="relative w-72 sm:w-96 h-72 sm:h-96 rounded-3xl overflow-hidden p-1.5 bg-gradient-to-b from-amber-400/40 via-amber-500/20 to-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
              <div className="w-full h-full rounded-[22px] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&h=900&fit=crop"
                  alt="Gourmet Dum Biryani Platter"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/85 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase rounded-full">
                    Signature Creation
                  </span>
                  <p className="text-base font-extrabold text-white mt-1">
                    Royal Hyderabadi Dum Biryani
                  </p>
                  <p className="text-xs text-amber-300/90 font-medium">
                    Slow-cooked in sealed claypot with Kashmiri saffron
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Live Badge 1: 50% Off Offer */}
            <div className="absolute -top-3 -left-2 sm:left-2 bg-[#141B28]/95 border border-amber-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                <FiTag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-white">Flat 50% OFF</p>
                <p className="text-[10px] text-amber-400 font-semibold">Code: DHANU50</p>
              </div>
            </div>

            {/* Floating Live Badge 2: Live Kitchen */}
            <div className="absolute -bottom-3 -right-2 sm:right-4 bg-[#141B28]/95 border border-amber-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                ⚡
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-xs font-extrabold text-white">Live Kitchens</p>
                </div>
                <p className="text-[10px] text-gray-400">Order Hot & Fresh Now</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Trust & Website Exclusivity - Extended Horizontal Full Page */}
        <div className="mt-10 lg:mt-14 pt-8 border-t border-white/10 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {/* Trust Pillar 1: Delivery Time */}
            <div className="p-4 rounded-2xl bg-[#141B28]/90 border border-white/5 hover:border-amber-500/30 transition-all duration-300 text-left flex items-center gap-4 hover:bg-[#141B28] hover:-translate-y-0.5 hover:shadow-lg shadow-black/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <FiClock className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-white tracking-tight">25 Mins</p>
                <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">Average Delivery</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">Hot Guarantee</p>
              </div>
            </div>

            {/* Trust Pillar 2: Customer Rating */}
            <div className="p-4 rounded-2xl bg-[#141B28]/90 border border-white/5 hover:border-amber-500/30 transition-all duration-300 text-left flex items-center gap-4 hover:bg-[#141B28] hover:-translate-y-0.5 hover:shadow-lg shadow-black/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <FiStar className="w-6 h-6 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-white tracking-tight">4.9 / 5.0</p>
                <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">Customer Rating</p>
                <p className="text-[10px] text-amber-400 font-bold mt-1">50,000+ Reviews</p>
              </div>
            </div>

            {/* Trust Pillar 3: Hygiene Certified */}
            <div className="p-4 rounded-2xl bg-[#141B28]/90 border border-white/5 hover:border-amber-500/30 transition-all duration-300 text-left flex items-center gap-4 hover:bg-[#141B28] hover:-translate-y-0.5 hover:shadow-lg shadow-black/40">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <FiShield className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-white tracking-tight">100% Safe</p>
                <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">Hygiene Certified</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">Triple-Sealed Box</p>
              </div>
            </div>

            {/* Trust Pillar 4: Website Exclusivity */}
            <div className="p-4 rounded-2xl bg-[#141B28]/90 border border-white/5 hover:border-amber-500/30 transition-all duration-300 text-left flex items-center gap-4 hover:bg-[#141B28] hover:-translate-y-0.5 hover:shadow-lg shadow-black/40">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <FiAward className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-white tracking-tight">Best Price</p>
                <p className="text-xs text-gray-400 font-medium leading-tight mt-0.5">Zero Markup</p>
                <p className="text-[10px] text-amber-400 font-bold mt-1">Save ₹120+ Direct</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
