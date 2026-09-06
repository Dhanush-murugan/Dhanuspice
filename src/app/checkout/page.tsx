"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiCreditCard,
  FiShield,
  FiTag,
  FiAlertCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import axios from "axios";
import {
  createOrderInFirestore,
  checkFirstTimeUserInFirestore,
  getNextSequentialOrderId,
} from "@/lib/firestoreService";

const CheckoutPage = () => {
  const router = useRouter();
  const {
    cartItems,
    user,
    isAuthenticated,
    clearCart,
    selectedAddress,
    appliedCoupon,
    setAppliedCoupon,
  } = useStore();

  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    phone: (user?.phone || "").replace(/\D/g, "").slice(-10),
    email: user?.email || "",
    address: selectedAddress?.fullAddress || "",
    landmark: selectedAddress?.landmark || "",
    pincode: (selectedAddress?.pincode || "").replace(/\D/g, "").slice(0, 6),
    paymentMethod: "upi",
  });

  const [phoneError, setPhoneError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Exact Financial Calculation Engine - directly computed from cartItems
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [cartItems]);

  const isFreeDeliveryQualified = subtotal >= 499 || appliedCoupon?.code === "FREEDEL";
  const deliveryCharge = subtotal > 0 ? (isFreeDeliveryQualified ? 0 : 35) : 0;
  const packagingFee = subtotal > 0 ? 15 : 0;
  const gst = Math.round(subtotal * 0.05);

  // Dynamic discount calculation
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === "DHANU50") {
      discount = Math.min(150, Math.round(subtotal * 0.5));
    } else if (appliedCoupon.code === "BIRYANI100") {
      discount = subtotal >= 349 ? 100 : 0;
    } else if (appliedCoupon.code === "PIZZAFEST") {
      discount = subtotal >= 499 ? 150 : 0;
    } else if (appliedCoupon.code === "WELCOME100") {
      discount = subtotal >= 299 ? 100 : 0;
    } else if (appliedCoupon.code === "SAVE50") {
      discount = subtotal >= 199 ? 50 : 0;
    } else if (appliedCoupon.code === "FREEDEL") {
      discount = 0; // Free delivery applied
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + deliveryCharge + packagingFee + gst);

  // Strictly enforce phone number: ONLY digits (0-9), exactly 10 digits
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys: Backspace, Delete, Arrows, Tab, Enter, Ctrl/Cmd shortcuts
    if (
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Strictly reject any non-digit character (letters, spaces, special chars)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setPhoneError("Letters and special characters are not allowed. Please enter 10-digit mobile number");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip out all non-digits immediately
    const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: cleanDigits }));

    if (cleanDigits.length === 0) {
      setPhoneError("Please enter mobile number");
    } else if (cleanDigits.length < 10) {
      setPhoneError("Please enter 10-digit mobile number");
    } else {
      setPhoneError("");
    }
  };

  const handlePhoneBlur = () => {
    if (!formData.phone) {
      setPhoneError("Please enter mobile number");
    } else if (formData.phone.length !== 10) {
      setPhoneError("Please enter 10-digit mobile number");
    } else {
      setPhoneError("");
    }
  };

  // Strictly enforce pincode: ONLY digits (0-9), exactly 6 digits
  const handlePincodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Enter",
      ].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      setPincodeError("Only numbers allowed (6 digits)");
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleanDigits }));

    if (cleanDigits.length === 0) {
      setPincodeError("Please enter pincode");
    } else if (cleanDigits.length < 6) {
      setPincodeError("Pincode must be 6 digits");
    } else {
      setPincodeError("");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Coupon application on checkout with STRICT first-time user check
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      // Check first-time status
      const isFirstTime = await checkFirstTimeUserInFirestore(
        formData.email || user?.email,
        formData.phone || user?.phone,
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict validation
    if (!formData.name.trim()) {
      toast.error("Please enter recipient name");
      return;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      setPhoneError("Please enter 10-digit mobile number");
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter complete street address");
      return;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      setPincodeError("Please enter 6-digit pincode");
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setIsLoading(true);

    try {
      // Re-verify first-time user coupon restriction before final submission
      if (appliedCoupon) {
        const isFirstTime = await checkFirstTimeUserInFirestore(
          formData.email,
          formData.phone,
          user?.uid
        );

        if (!isFirstTime) {
          toast.error("Coupon codes are only applicable for first-time users! Coupon has been removed.");
          setAppliedCoupon(null);
          setIsLoading(false);
          return;
        }
      }

      const generatedOrderId = await getNextSequentialOrderId();
      const orderPayload = {
        customerInfo: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          landmark: formData.landmark.trim(),
          pincode: formData.pincode.trim(),
        },
        orderInfo: {
          orderId: generatedOrderId,
          orderDate: new Date().toLocaleDateString(),
          restaurant: "Dhanuspice Gourmet Kitchens",
          paymentMethod: formData.paymentMethod,
        },
        items: cartItems,
        billing: {
          subtotal,
          deliveryCharge,
          packagingFee,
          gst,
          discount,
          couponCode: appliedCoupon?.code || null,
          grandTotal,
        },
      };

      let finalOrderId = generatedOrderId;

      try {
        const emailResponse = await axios.post("/api/send-order-email", orderPayload);
        if (emailResponse.data?.orderId) {
          finalOrderId = emailResponse.data.orderId;
        }
      } catch (emailErr: any) {
        console.warn("Email dispatch notification failed (order still placed):", emailErr?.message);
      }

      // Save order to Cloud Firestore
      try {
        await createOrderInFirestore({
          ...orderPayload,
          orderInfo: {
            ...orderPayload.orderInfo,
            orderId: finalOrderId,
          },
          status: "placed",
          userId: user?.uid || "guest",
        });
      } catch (firestoreErr: any) {
        console.warn("Firestore save fallback triggered:", firestoreErr?.message);
      }

      // Persist order locally for order history and tracking
      if (typeof window !== "undefined") {
        try {
          const storedOrders = JSON.parse(localStorage.getItem("dhanuspice_orders") || "[]");
          storedOrders.unshift({
            ...orderPayload,
            orderId: finalOrderId,
            status: "placed",
            timestamp: new Date().toISOString(),
          });
          localStorage.setItem("dhanuspice_orders", JSON.stringify(storedOrders));
        } catch {
          // ignore
        }
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/order-tracking/${finalOrderId}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-[#141B28] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <FiUser className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2 text-white">
            Please Login to Checkout
          </h1>
          <p className="text-xs text-gray-400 mb-6">
            Sign in to track orders, save delivery locations, and unlock members-only rewards.
          </p>
          <Link
            href="/login"
            className="btn-gold !py-3 !px-8 !text-xs !rounded-2xl inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-[#141B28] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-black mb-2 text-white">
            Your Cart is Empty
          </h1>
          <p className="text-xs text-gray-400 mb-6">
            Add your favorite dishes before proceeding to the checkout portal.
          </p>
          <Link
            href="/restaurants"
            className="btn-gold !py-3 !px-6 !text-xs !rounded-2xl inline-block"
          >
            Browse Gourmet Kitchens
          </Link>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { value: "upi", label: "Instant UPI", icon: "📱" },
    { value: "credit_card", label: "Credit Card", icon: "💳" },
    { value: "debit_card", label: "Debit Card", icon: "💳" },
    { value: "net_banking", label: "Net Banking", icon: "🏦" },
    { value: "cash", label: "Cash on Delivery", icon: "💵" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 bg-[#141B28] hover:bg-white/10 rounded-2xl border border-white/10 text-gray-300 hover:text-white transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Checkout &amp; Secure Payment
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete your details for priority 25-minute delivery
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <FiShield className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Delivery Address Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141B28] rounded-3xl p-6 border border-white/10 shadow-xl"
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
                  <FiMapPin className="text-amber-400" />
                  Delivery Address &amp; Contact
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Full Recipient Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Dhanush M"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-300">
                        Mobile Number (For Delivery OTP) *
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.phone.length === 10
                            ? "text-emerald-400 font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.phone.length}/10 digits
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center gap-1 text-amber-400 font-bold text-xs pointer-events-none pr-2.5 border-r border-white/10">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={formData.phone}
                        onKeyDown={handlePhoneKeyDown}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        placeholder="Enter 10-digit mobile number"
                        className={`w-full pl-20 pr-4 py-2.5 bg-[#0B0F17] border rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none font-mono tracking-wider transition ${
                          phoneError
                            ? "border-red-500/80 focus:border-red-500"
                            : formData.phone.length === 10
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : "border-white/10 focus:border-amber-500"
                        }`}
                        required
                      />
                    </div>
                    {phoneError ? (
                      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-500 mt-1">
                        Numbers only. Letters &amp; special characters are not allowed.
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Email Address (For Invoice) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2.5 bg-[#0B0F17] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Complete Street Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Flat No, Apartment / Building Name, Street Name"
                      className="w-full px-4 py-2.5 bg-[#0B0F17] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                      required
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Near City Tower, Opposite Park"
                      className="w-full px-4 py-2.5 bg-[#0B0F17] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-gray-300">
                        Pincode *
                      </label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.pincode.length === 6
                            ? "text-emerald-400 font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {formData.pincode.length}/6 digits
                      </span>
                    </div>
                    <input
                      type="text"
                      name="pincode"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={formData.pincode}
                      onKeyDown={handlePincodeKeyDown}
                      onChange={handlePincodeChange}
                      onBlur={() => {
                        if (!formData.pincode) {
                          setPincodeError("Please enter pincode");
                        } else if (formData.pincode.length !== 6) {
                          setPincodeError("Pincode must be 6 digits");
                        } else {
                          setPincodeError("");
                        }
                      }}
                      placeholder="600001"
                      className={`w-full px-4 py-2.5 bg-[#0B0F17] border rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none font-mono tracking-wider transition ${
                        pincodeError
                          ? "border-red-500/80 focus:border-red-500"
                          : formData.pincode.length === 6
                          ? "border-emerald-500/50 focus:border-emerald-500"
                          : "border-white/10 focus:border-amber-500"
                      }`}
                      required
                    />
                    {pincodeError && (
                      <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{pincodeError}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#141B28] rounded-3xl p-6 border border-white/10 shadow-xl"
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2 pb-3 border-b border-white/5">
                  <FiCreditCard className="text-amber-400" />
                  Select Payment Method
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                        formData.paymentMethod === method.value
                          ? "border-amber-500 bg-amber-500/10 text-amber-300"
                          : "border-white/5 bg-[#0B0F17] hover:border-amber-500/30 text-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={formData.paymentMethod === method.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-2xl mb-0.5">{method.icon}</span>
                      <span className="text-xs font-black">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full !py-4 !text-base !font-black !rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Confirming Order..." : `Place Order & Pay ₹${grandTotal}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#141B28] rounded-3xl p-6 border border-amber-500/20 shadow-2xl sticky top-24 space-y-6">
              <h2 className="text-xl font-black text-white pb-3 border-b border-white/10">
                Order Review ({cartItems.length} items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 pb-4 border-b border-white/10 max-h-56 overflow-y-auto scrollbar-none">
                {cartItems.map((item) => (
                  <div
                    key={item.foodId}
                    className="flex justify-between items-center text-xs text-gray-300"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="font-semibold text-white">{item.name}</span>
                      <span className="text-gray-400 text-[11px] block">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-white shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section on Checkout */}
              <div className="space-y-2.5 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <FiTag className="text-amber-400" />
                    Promo Code
                  </span>
                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    First Order Only
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <FiCheck className="w-3.5 h-3.5" />
                        Code '{appliedCoupon.code}' Applied
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {appliedCoupon.code === "FREEDEL"
                          ? "Delivery Fee Waived (Free)"
                          : `Saved ₹${discount} on this order`}
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
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplyingCoupon}
                      className="btn-gold !py-2 !px-4 !text-xs !rounded-xl shrink-0 disabled:opacity-50"
                    >
                      {isApplyingCoupon ? "Checking..." : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-white">₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-white">₹{deliveryCharge}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Standard Packaging</span>
                  <span className="font-bold text-white">₹{packagingFee}</span>
                </div>

                <div className="flex justify-between">
                  <span>Govt. GST (5%)</span>
                  <span className="font-bold text-white">₹{gst}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    <span className="flex items-center gap-1.5">
                      <FiTag className="w-3.5 h-3.5" />
                      Promo Applied ({appliedCoupon?.code})
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">
                    Amount Payable
                  </p>
                  <p className="text-2xl font-black text-amber-400">
                    ₹{grandTotal}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  Guaranteed Exact
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
