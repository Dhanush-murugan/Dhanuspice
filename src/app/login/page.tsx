"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  auth,
  safeGetDoc,
  formatFirebaseAuthError,
} from "@/lib/firebase";
import { useStore } from "@/store/useStore";
import { User } from "@/types";

const LoginPage = () => {
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid registered email address.");
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSentSuccess(true);
      toast.success(`Password reset email sent to ${cleanEmail}!`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        toast.error("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Invalid email address format.");
      } else {
        toast.error(formatFirebaseAuthError(err) || "Failed to send reset email.");
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Attempt to retrieve profile from Firestore (with offline timeout fallback)
      let userData: User | null = await safeGetDoc("users", result.user.uid);

      if (!userData) {
        // Fallback user profile built from Firebase Auth metadata
        userData = {
          uid: result.user.uid,
          email: result.user.email || email,
          displayName: result.user.displayName || email.split("@")[0] || "Customer",
          phone: result.user.phoneNumber || "",
          addresses: [],
          savedRestaurants: [],
          createdAt: new Date(),
        };
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("dhanuspice_current_user", JSON.stringify(userData));
        } catch {
          // ignore
        }
      }

      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      toast.error(formatFirebaseAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      let userData: User | null = await safeGetDoc("users", result.user.uid);
      if (!userData) {
        userData = {
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "Google User",
          phone: "",
          addresses: [],
          savedRestaurants: [],
          createdAt: new Date(),
        };
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("dhanuspice_current_user", JSON.stringify(userData));
        } catch {
          // ignore
        }
      }

      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Login successful!");
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
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-5">
              <Logo size="md" subtitleText="Royal Gourmet Dining" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Login to your account to continue ordering
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setResetSentSuccess(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:text-amber-400 dark:hover:text-amber-300 transition"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 font-semibold"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              Sign in with Google
            </span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-500 font-semibold hover:text-primary-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#141B28] rounded-3xl shadow-2xl border border-amber-500/30 max-w-md w-full p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setIsForgotModalOpen(false);
                setResetSentSuccess(false);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition"
            >
              ✕
            </button>

            <div className="mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 mb-3 shadow-inner">
                🔑
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Reset Password
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Enter your account email address. We'll send you an official password reset link directly via Firebase Auth.
              </p>
            </div>

            {resetSentSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    <span>✓</span> Request Processed
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    A password reset link was dispatched for{" "}
                    <strong className="text-white font-mono">{forgotEmail}</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-gray-300 space-y-1.5 text-left">
                  <p className="font-bold text-amber-300">Didn't see it in your Gmail?</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-400">
                    <li>
                      Check your <strong>Spam / Junk</strong> folder or <strong>Promotions</strong> tab for emails from <span className="text-amber-300 font-mono">noreply@dhanushspice.firebaseapp.com</span>.
                    </li>
                    <li>
                      <strong>Google Sign-in:</strong> If you registered via Google OAuth, you don&apos;t have a password. Simply click <em>&quot;Continue with Google&quot;</em>.
                    </li>
                    <li>
                      <strong>Unregistered Email:</strong> Firebase Auth hides unregistered emails for security. If this email has not been signed up yet, please create an account on the <Link href="/signup" className="text-amber-400 underline font-bold" onClick={() => setIsForgotModalOpen(false)}>Sign Up page</Link>.
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="btn-gold w-full !py-2.5 !text-xs !rounded-xl font-black"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B0F17] border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-white bg-gray-100 dark:bg-white/5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 btn-gold !py-2.5 !text-xs !rounded-xl font-black shadow-md disabled:opacity-50"
                  >
                    {isSendingReset ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
