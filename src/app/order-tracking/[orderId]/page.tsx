"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FiMapPin, FiClock, FiPhone, FiArrowLeft, FiTruck, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import Link from "next/link";
import { subscribeToOrderById } from "@/lib/firestoreService";

const orderStatuses = [
  { id: 1, key: "placed", status: "Order Placed", icon: "✅" },
  { id: 2, key: "accepted", status: "Restaurant Accepted", icon: "🍽️" },
  { id: 3, key: "preparing", status: "Preparing Food", icon: "👨‍🍳" },
  { id: 4, key: "ready", status: "Ready for Pickup", icon: "📦" },
  { id: 5, key: "out_for_delivery", status: "Out for Delivery", icon: "🚴" },
  { id: 6, key: "near_you", status: "Near You", icon: "📍" },
  { id: 7, key: "delivered", status: "Delivered", icon: "🏠" },
];

function statusToStepIndex(status: string | undefined): number {
  if (!status) return 0;
  const s = status.toLowerCase().replace(/[\s-]/g, "_");
  if (s === "placed" || s === "order_placed") return 0;
  if (s === "accepted" || s === "restaurant_accepted") return 1;
  if (s === "preparing" || s === "preparing_food") return 2;
  if (s === "ready" || s === "ready_for_pickup") return 3;
  if (s === "out_for_delivery" || s === "on_the_way") return 4;
  if (s === "near_you") return 5;
  if (s === "delivered") return 6;
  return 0;
}

const OrderTrackingPage = () => {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any | null>(null);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [isCancelled, setIsCancelled] = useState(false);

  // Subscribe to live Firestore updates for this order
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = subscribeToOrderById(orderId, (liveOrder) => {
      if (liveOrder) {
        setOrder(liveOrder);
        const statusLower = (liveOrder.status || "").toLowerCase();
        if (statusLower === "cancelled") {
          setIsCancelled(true);
        } else {
          setIsCancelled(false);
          const step = statusToStepIndex(liveOrder.status);
          setCurrentStatus(step);
          // Adjust remaining time dynamically based on status
          if (step >= 6) setEstimatedTime(0);
          else if (step >= 4) setEstimatedTime(10);
          else if (step >= 2) setEstimatedTime(18);
          else setEstimatedTime(25);
        }
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  const mockRider = {
    name: "Raj Kumar",
    phone: "+91 9876543210",
    vehicle: "Bike",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  };

  const restaurantName =
    order?.orderInfo?.restaurant || order?.restaurantName || "Dhanuspice Kitchen";
  const customerAddress =
    order?.customerInfo?.address ||
    order?.deliveryAddress?.fullAddress ||
    "123 Spice Garden, MG Road, Bangalore";
  const customerLandmark = order?.customerInfo?.landmark || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition">
              <FiArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Live Order Tracking
              </h1>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Order ID: <span className="font-semibold text-amber-500">{orderId}</span>
            </p>
          </div>
        </div>

        {/* Cancelled Alert Banner if cancelled */}
        {isCancelled && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3 text-red-800 dark:text-red-300">
            <FiAlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">This order has been cancelled.</p>
              <p className="text-sm">Please contact support or browse our menu to place a new order.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Real-time Status
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500">
                  Synced with Firestore
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="relative h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStatus + 1) / orderStatuses.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  <span>Progress</span>
                  <span>
                    {(( (currentStatus + 1) / orderStatuses.length ) * 100).toFixed(0)}% Complete
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {orderStatuses.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3.5 rounded-xl transition ${
                      index <= currentStatus
                        ? "bg-amber-50/60 dark:bg-amber-950/20 border-l-4 border-amber-500"
                        : "bg-gray-50 dark:bg-gray-700/40 opacity-40"
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-sm ${
                          index <= currentStatus
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.status}
                      </p>
                      {index === currentStatus && !isCancelled && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                          ● Current Stage (Active)
                        </p>
                      )}
                      {index < currentStatus && (
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Completed
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Rider Information */}
            {currentStatus >= 4 && !isCancelled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FiTruck className="w-5 h-5" />
                  Delivery Partner Assigned
                </h3>

                <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={mockRider.image}
                      alt={mockRider.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                      <p className="font-bold text-lg">{mockRider.name}</p>
                      <p className="text-xs text-white/90">
                        {mockRider.vehicle} Delivery • Dhanuspice Fleet
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${mockRider.phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold rounded-lg py-2 hover:bg-gray-100 transition text-sm shadow-sm"
                  >
                    <FiPhone className="w-4 h-4 text-amber-600" />
                    Call Delivery Partner
                  </a>
                </div>
              </motion.div>
            )}

            {/* Ordered Items Summary */}
            {order?.items && order.items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Ordered Items ({order.items.length})
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {order.items.map((it: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-500">{it.quantity}x</span>
                        <span className="text-gray-800 dark:text-gray-200">{it.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{it.price * (it.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
                {order?.billing && (
                  <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-between items-center font-bold text-base text-gray-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-amber-500">₹{order.billing.grandTotal}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimated Delivery Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Estimated Arrival
                </h3>
              </div>
              <p className="text-4xl font-extrabold text-amber-500 mb-1">
                {currentStatus >= 6 ? "Delivered" : `${estimatedTime} mins`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentStatus >= 6
                  ? "Delivered to your doorstep"
                  : "Preparation & delivery in progress"}
              </p>
            </motion.div>

            {/* Restaurant Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Kitchen
              </h3>
              <p className="font-bold text-gray-900 dark:text-white text-base mb-1">
                {restaurantName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Fresh gourmet preparation
              </p>
              <button
                onClick={() => alert(`Contacting kitchen: ${restaurantName}`)}
                className="w-full flex items-center justify-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 py-2 rounded-xl hover:bg-amber-500/20 transition font-semibold text-xs"
              >
                <FiPhone className="w-3.5 h-3.5" />
                Contact Kitchen
              </button>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-amber-500" />
                Delivery Address
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {customerAddress}
              </p>
              {customerLandmark && (
                <p className="text-[11px] text-gray-500 mt-1">
                  Landmark: {customerLandmark}
                </p>
              )}
            </motion.div>

            {/* Delivered Celebratory Box */}
            {currentStatus === 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center shadow-sm"
              >
                <p className="text-4xl mb-2">🎉</p>
                <p className="font-bold text-gray-900 dark:text-white mb-1">
                  Order Delivered!
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
                  Thank you for dining with Dhanuspice!
                </p>
                <Link
                  href="/"
                  className="block bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition font-semibold text-xs"
                >
                  Order Again
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
