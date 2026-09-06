"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiLinkedin,
  FiMail,
  FiShield,
  FiClock,
  FiHeadphones,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Thank you for subscribing to Dhanuspice Gourmet VIP!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#070A10] text-gray-400 border-t border-amber-500/15 mt-20 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Trust Guarantee Strip */}
      <div className="border-b border-white/5 py-8 bg-[#0B0F17]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  25-Min Delivery
                </h4>
                <p className="text-[11px] text-gray-400">Piped hot & fresh</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  100% Hygienic
                </h4>
                <p className="text-[11px] text-gray-400">Certified kitchens</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  256-Bit Secure
                </h4>
                <p className="text-[11px] text-gray-400">Encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FiHeadphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  VIP Concierge
                </h4>
                <p className="text-[11px] text-gray-400">24/7 dedicated support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" subtitleText="Royal Gourmet Dining" />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Dhanuspice connects discerning gourmets with world-class kitchens, delivering exquisite dum biryanis, artisanal pizzas, and rich regional feasts with utmost culinary care.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white mb-2">
                Join the Dhanuspice Epicurean Club
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2 bg-[#141B28] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-gold !py-2 !px-4 !text-xs !rounded-xl shrink-0"
                >
                  Join VIP
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/restaurants" className="hover:text-amber-400 transition">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-amber-400 transition">
                  Special Offers & Deals
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-400 transition">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition">
                  Active Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cuisines */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Cuisines
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/restaurants?search=Biryani" className="hover:text-amber-400 transition">
                  Hyderabadi Biryani
                </Link>
              </li>
              <li>
                <Link href="/restaurants?search=Pizza" className="hover:text-amber-400 transition">
                  Wood-Fired Pizza
                </Link>
              </li>
              <li>
                <Link href="/restaurants?search=North+Indian" className="hover:text-amber-400 transition">
                  Mughlai & Curries
                </Link>
              </li>
              <li>
                <Link href="/restaurants?search=South+Indian" className="hover:text-amber-400 transition">
                  Crispy Ghee Dosas
                </Link>
              </li>
              <li>
                <Link href="/restaurants?search=Desserts" className="hover:text-amber-400 transition">
                  Artisanal Desserts
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Connect With Us
            </h3>
            <div className="flex gap-2.5 mb-4">
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 flex items-center justify-center transition"
              >
                <FiInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 flex items-center justify-center transition"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 flex items-center justify-center transition"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 flex items-center justify-center transition"
              >
                <FiLinkedin className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-gray-500">
              Operating in Chennai, Bengaluru, Mumbai & Delhi NCR.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Dhanuspice Gourmet Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-gray-400">Accepted:</span>
            <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300 font-semibold">
              UPI
            </span>
            <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300 font-semibold">
              Razorpay
            </span>
            <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300 font-semibold">
              Cards
            </span>
            <span className="px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300 font-semibold">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
