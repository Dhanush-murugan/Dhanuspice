"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useRouter } from "next/navigation";
import {
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiAlertCircle,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, safeSetDoc, formatFirebaseAuthError } from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { User } from "@/types";

const SignUpPage = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      setPhoneError("Letters and special characters are not allowed. Please enter 10-digit mobile number");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length !== 10) {
      setPhoneError("Please enter 10-digit mobile number");
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      toast.error("Please accept terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      try {
        await updateProfile(result.user, {
          displayName: formData.fullName,
        });
      } catch {
        // Continue even if updateProfile fails
      }

      const userData: User = {
        uid: result.user.uid,
        email: formData.email,
        displayName: formData.fullName,
        phone: formData.phone,
        addresses: [],
        savedRestaurants: [],
        createdAt: new Date(),
      };

      // Resiliently save to Firestore / localStorage
      await safeSetDoc("users", result.user.uid, userData);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("dhanuspice_current_user", JSON.stringify(userData));
        } catch {
          // ignore
        }
      }

      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const userData: User = {
        uid: result.user.uid,
        email: result.user.email || "",
        displayName: result.user.displayName || "User",
        phone: "",
        addresses: [],
        savedRestaurants: [],
        createdAt: new Date(),
      };

      await safeSetDoc("users", result.user.uid, userData);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("dhanuspice_current_user", JSON.stringify(userData));
        } catch {
          // ignore
        }
      }

      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-5">
              <Logo size="md" subtitleText="Royal Gourmet Dining" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join us and start ordering delicious food
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Dhanush"
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <span
                  className={`text-xs font-mono ${
                    formData.phone.length === 10
                      ? "text-emerald-500 font-bold"
                      : "text-gray-400"
                  }`}
                >
                  {formData.phone.length}/10 digits
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-amber-500 font-bold text-xs pointer-events-none pr-2 border-r border-gray-300 dark:border-white/10">
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
                  onBlur={() => {
                    if (!formData.phone) {
                      setPhoneError("Please enter mobile number");
                    } else if (formData.phone.length !== 10) {
                      setPhoneError("Please enter 10-digit mobile number");
                    } else {
                      setPhoneError("");
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className={`input-field !pl-20 font-mono tracking-wider ${
                    phoneError ? "!border-red-500" : ""
                  }`}
                  required
                />
              </div>
              {phoneError ? (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  Digits only. Letters &amp; special characters are strictly blocked.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link href="#" className="text-primary-500 hover:text-primary-600">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary-500 hover:text-primary-600">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 mt-6"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Sign up with Google
            </span>
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-500 font-semibold hover:text-primary-600"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
