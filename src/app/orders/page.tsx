"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiPackage, FiClock, FiMapPin, FiArrowRight, FiCheckCircle } from "react-icons/fi";

interface StoredOrder {
  orderId: string;
  orderDate: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    pincode: string;
  };
  orderInfo: {
    restaurant?: string;
    paymentMethod?: string;
  };
  items: Array<{
    foodId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  billing: {
    subtotal: number;
    deliveryCharge: number;
    gst: number;
    grandTotal: number;
  };
  status?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dhanuspice_orders");
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <FiPackage className="text-primary-500" />
              My Orders
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View your past orders, delivery details, and track active deliveries.
            </p>
          </div>

          <Link
            href="/restaurants"
            className="hidden sm:flex items-center gap-2 text-xs font-bold text-primary-500 hover:text-primary-600 border border-primary-200 dark:border-primary-800 px-3.5 py-2 rounded-xl transition"
          >
            Order More Food
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders list */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <span className="text-6xl mb-4 block">🛍️</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              No orders placed yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6 max-w-sm mx-auto">
              Hungry? Browse our collection of top-rated restaurants and enjoy hot, fresh food delivered to your doorstep.
            </p>
            <Link
              href="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl shadow-md transition shadow-primary-500/20"
            >
              Explore Restaurants
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div
                key={order.orderId || idx}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition"
              >
                {/* Top status bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 dark:text-white text-base">
                        {order.orderId}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                        <FiCheckCircle className="w-3 h-3" />
                        {order.status || "Order Confirmed"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Placed on {order.orderDate}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/order-tracking/${order.orderId}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Track Live Order
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items */}
                <div className="py-4 space-y-2">
                  {order.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-gray-700 dark:text-gray-300"
                    >
                      <span className="font-medium">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Total & Address */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="text-primary-500 shrink-0" />
                    <span className="truncate max-w-xs">{order.customerInfo?.address}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Total Paid:</span>
                    <span className="text-base font-extrabold text-gray-900 dark:text-white">
                      ₹{order.billing?.grandTotal}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] uppercase font-semibold">
                      {order.orderInfo?.paymentMethod || "COD"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
