"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiStar, FiClock, FiMapPin, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { subscribeToRestaurants } from "@/lib/firestoreService";
import { RESTAURANTS_DATA } from "@/utils/mockData";
import { Restaurant } from "@/types";

const FeaturedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToRestaurants((data) => {
      if (data && data.length > 0) {
        setRestaurants(data);
      } else {
        setRestaurants(RESTAURANTS_DATA);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const displayRestaurants = restaurants.slice(0, 4);

  return (
    <section id="spotlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-12 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Handpicked Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Featured Culinary Spotlights
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Signature destination restaurants renowned for gourmet mastercraft and impeccable standards.
          </p>
        </div>

        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
        >
          View all {restaurants.length} kitchens
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-[#141B28] rounded-3xl p-6 border border-white/5 animate-pulse h-80"
            >
              <div className="w-full h-48 bg-white/5 rounded-2xl mb-4" />
              <div className="h-5 bg-white/10 rounded w-1/2 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="group bg-[#141B28] rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)] flex flex-col"
            >
              {/* Banner with overlay */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={restaurant.image || restaurant.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141B28] via-black/40 to-transparent" />

                {/* Verified Pill */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-1.5 border border-emerald-500/30">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Gourmet Kitchen</span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-300 flex items-center gap-1 border border-amber-500/30">
                  <FiStar className="fill-current w-3.5 h-3.5" />
                  <span>{restaurant.rating || 4.8}</span>
                  <span className="text-[10px] text-gray-400">({restaurant.reviews || 120})</span>
                </div>

                {/* Fast Delivery Pill */}
                <div className="absolute bottom-4 left-4 bg-[#0B0F17]/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                  <FiClock className="text-amber-400 w-3.5 h-3.5" />
                  <span>{restaurant.deliveryTime || 25} mins delivery</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {restaurant.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {restaurant.cuisines?.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 bg-white/5 border border-white/5 text-gray-300 text-xs font-medium rounded-lg"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiMapPin className="text-amber-400 w-3.5 h-3.5" />
                    <span>{restaurant.address}</span>
                  </div>

                  <Link
                    href={`/restaurant/${restaurant.id}`}
                    className="btn-gold !py-2 !px-4 !text-xs !rounded-xl"
                  >
                    View Full Menu
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedRestaurants;
