"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiArrowLeft,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiTag,
  FiCheck,
  FiShield,
  FiX,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useStore } from "@/store/useStore";
import { checkFirstTimeUserInFirestore } from "@/lib/firestoreService";

const CartPage = () => {
  const router = useRouter();
  const {
    cartItems,
    user,
    removeFromCart,
    updateCartItemQuantity,
    isAuthenticated,
    appliedCoupon,
    setAppliedCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Exact Financial Calculation Engine - directly derived from cartItems
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [cartItems]);

  const isFreeDeliveryQualified = subtotal >= 499 || appliedCoupon?.code === "FREEDEL";
  const deliveryFee = subtotal > 0 ? (isFreeDeliveryQualified ? 0 : 35) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const gst = Math.round(subtotal * 0.05);

  // Compute discount safely based on current subtotal and appliedCoupon
  let currentDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === "DHANU50") {
      currentDiscount = Math.min(150, Math.round(subtotal * 0.5));
    } else if (appliedCoupon.code === "BIRYANI100") {
      currentDiscount = subtotal >= 349 ? 100 : 0;
    } else if (appliedCoupon.code === "PIZZAFEST") {
      currentDiscount = subtotal >= 499 ? 150 : 0;
    } else if (appliedCoupon.code === "WELCOME100") {
      currentDiscount = subtotal >= 299 ? 100 : 0;
    } else if (appliedCoupon.code === "SAVE50") {
      currentDiscount = subtotal >= 199 ? 50 : 0;
    } else if (appliedCoupon.code === "FREEDEL") {
      currentDiscount = 0; // Handled via deliveryFee = 0
    }
  }

  // Update store discount if it changed
  useEffect(() => {
    if (appliedCoupon && currentDiscount !== appliedCoupon.discount) {
      setAppliedCoupon({ code: appliedCoupon.code, discount: currentDiscount });
    }
  }, [appliedCoupon, currentDiscount, setAppliedCoupon]);

  const grandTotal = Math.max(0, subtotal - currentDiscount + deliveryFee + packagingFee + gst);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      // STRICT RULE: Coupons are exclusively valid for first-time users only
      const isFirstTime = await checkFirstTimeUserInFirestore(
        user?.email,
        user?.phone,
        user?.uid
      );

      if (!isFirstTime) {
        toast.error("Coupon codes are only applicable for first-time users!");
        return;
      }

      if (code === "DHANU50") {
        if (subtotal < 199) {
          toast.error("DHANU50 requires a minimum order of ₹199");
          return;
        }
        const disc = Math.min(150, Math.round(subtotal * 0.5));
        setAppliedCoupon({ code: "DHANU50", discount: disc });
        toast.success(`DHANU50 applied! Saved ₹${disc} (50% Off First Order)`);
      } else if (code === "BIRYANI100") {
        if (subtotal < 349) {
          toast.error("BIRYANI100 requires a minimum order of ₹349");
          return;
        }
        setAppliedCoupon({ code: "BIRYANI100", discount: 100 });
        toast.success("BIRYANI100 applied! Saved ₹100");
      } else if (code === "PIZZAFEST") {
        if (subtotal < 499) {
          toast.error("PIZZAFEST requires a minimum order of ₹499");
          return;
        }
        setAppliedCoupon({ code: "PIZZAFEST", discount: 150 });
        toast.success("PIZZAFEST applied! Saved ₹150");
      } else if (code === "WELCOME100") {
        if (subtotal < 299) {
          toast.error("WELCOME100 requires a minimum order of ₹299");
          return;
        }
        setAppliedCoupon({ code: "WELCOME100", discount: 100 });
        toast.success("WELCOME100 applied! Saved ₹100");
      } else if (code === "SAVE50") {
        if (subtotal < 199) {
          toast.error("SAVE50 requires a minimum order of ₹199");
          return;
        }
        setAppliedCoupon({ code: "SAVE50", discount: 50 });
        toast.success("SAVE50 applied! Saved ₹50");
      } else if (code === "FREEDEL") {
        if (subtotal < 199) {
          toast.error("FREEDEL requires a minimum order of ₹199");
          return;
        }
        setAppliedCoupon({ code: "FREEDEL", discount: 0 });
        toast.success("FREEDEL applied! Delivery fee waived");
      } else {
        toast.error("Invalid coupon code. Try DHANU50, WELCOME100, or FREEDEL");
        return;
      }

      setCouponInput("");
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center px-4 py-20 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md bg-[#141B28] p-8 rounded-3xl border border-white/10 shadow-2xl"
        >
          <div className="w-20 h-20 bg-amber-500/15 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <FiShoppingCart className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Explore authentic royal dum biryanis, artisan pizzas, and chef specials cooked fresh for you.
          </p>
          <Link
            href="/restaurants"
            className="btn-gold !py-3 !px-6 !text-xs !rounded-2xl inline-flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Explore Kitchens & Dishes
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              href="/restaurants"
              className="p-2.5 bg-[#141B28] hover:bg-white/10 rounded-2xl border border-white/10 text-gray-300 hover:text-white transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Gourmet Cart
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} handcrafted items ready for delivery
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <FiShield className="w-3.5 h-3.5" />
            <span>100% Hygienic Delivery Guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.foodId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#141B28] rounded-3xl p-5 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row gap-4 items-center justify-between"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-black mt-1">
                      ₹{item.price} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Price */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {/* Plus/Minus counter */}
                  <div className="flex items-center bg-[#0B0F17] border border-amber-500/30 rounded-xl px-2 py-1 gap-3">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) removeFromCart(item.foodId);
                        else updateCartItemQuantity(item.foodId, item.quantity - 1);
                      }}
                      className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-amber-400 transition"
                    >
                      <FiMinus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-amber-300 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQuantity(item.foodId, item.quantity + 1)}
                      className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-amber-400 transition"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total item price */}
                  <div className="text-right min-w-[70px]">
                    <p className="text-base font-black text-white">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      removeFromCart(item.foodId);
                      toast.success(`Removed ${item.name}`);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Remove item"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Delivery Alert / Progress */}
            {subtotal < 499 ? (
              <div className="bg-[#141B28] p-4 rounded-2xl border border-amber-500/20 text-xs flex items-center justify-between">
                <span className="text-gray-300">
                  Add <strong className="text-amber-300">₹{499 - subtotal}</strong> more to unlock <strong className="text-emerald-400">FREE Delivery</strong>
                </span>
                <Link href="/restaurants" className="text-amber-400 hover:underline font-bold">
                  + Add Dishes
                </Link>
              </div>
            ) : (
              <div className="bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 font-bold">
                <FiCheck className="w-4 h-4 shrink-0" />
                <span>Congratulations! Your order qualifies for FREE Express Delivery!</span>
              </div>
            )}
          </div>

          {/* Order Summary & Billing */}
          <div className="lg:col-span-1">
            <div className="bg-[#141B28] rounded-3xl p-6 border border-amber-500/20 shadow-2xl sticky top-24 space-y-6">
              <h2 className="text-xl font-black text-white pb-3 border-b border-white/10">
                Order Bill Summary
              </h2>

              {/* Coupon Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <FiTag className="text-amber-400" />
                    Have a Promo Code?
                  </label>
                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    First Order Only
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5" />
                        Code '{appliedCoupon.code}' Applied (First Order Special)
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {appliedCoupon.code === "FREEDEL"
                          ? "Delivery Fee Waived (Free)"
                          : `Saved ₹${currentDiscount} on this order`}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition"
                      title="Remove coupon"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. DHANU50"
                      className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 font-mono tracking-wider uppercase"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon}
                      className="btn-gold !py-2 !px-4 !text-xs !rounded-xl shrink-0 disabled:opacity-50"
                    >
                      {isApplyingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                )}

                {/* Quick Coupon Chips */}
                {!appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => handleApplyCoupon("DHANU50")}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-black transition"
                    >
                      DHANU50 (50% Off)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon("WELCOME100")}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-[10px] font-bold transition"
                    >
                      WELCOME100 (₹100 Off)
                    </button>
                    <button
                      onClick={() => handleApplyCoupon("FREEDEL")}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-[10px] font-bold transition"
                    >
                      FREEDEL (Free Delivery)
                    </button>
                  </div>
                )}
              </div>

              {/* Exact Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-white">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Standard Packaging</span>
                  <span className="font-bold text-white">₹{packagingFee}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Govt. GST (5%)</span>
                  <span className="font-bold text-white">₹{gst}</span>
                </div>

                {currentDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <span className="flex items-center gap-1.5">
                      <FiTag className="w-3.5 h-3.5" />
                      Promo Discount ({appliedCoupon?.code})
                    </span>
                    <span>-₹{currentDiscount}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">
                    Grand Total
                  </p>
                  <p className="text-2xl font-black text-amber-400">
                    ₹{grandTotal}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  All taxes included
                </span>
              </div>

              {/* Checkout Action */}
              {isAuthenticated ? (
                <button
                  onClick={() => router.push("/checkout")}
                  className="btn-gold w-full !py-3.5 !text-sm !font-black !rounded-2xl shadow-xl flex items-center justify-center gap-2"
                >
                  Proceed to Checkout (₹{grandTotal})
                </button>
              ) : (
                <Link
                  href="/login"
                  className="btn-gold w-full !py-3.5 !text-sm !font-black !rounded-2xl text-center block shadow-xl"
                >
                  Login to Checkout (₹{grandTotal})
                </Link>
              )}

              <Link
                href="/restaurants"
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl text-center block transition border border-white/10"
              >
                + Add More Gourmet Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
