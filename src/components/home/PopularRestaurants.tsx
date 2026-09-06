"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiStar, FiClock, FiMapPin, FiArrowRight } from "react-icons/fi";
import { subscribeToRestaurants } from "@/lib/firestoreService";
import { RESTAURANTS_DATA } from "@/utils/mockData";
import { Restaurant } from "@/types";

const PopularRestaurants = () => {
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
    <section id="kitchens" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Top Rated Dining
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Most Popular Gourmet Kitchens
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Celebrated culinary spots with exceptional ratings, prompt service, and unforgettable flavours.
          </p>
        </div>

        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
        >
          Explore all restaurants
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-[#141B28] rounded-3xl p-4 border border-white/5 animate-pulse h-72"
            >
              <div className="w-full h-36 bg-white/5 rounded-2xl mb-4" />
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="group bg-[#141B28] rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)] flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={restaurant.image || restaurant.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop"}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141B28] via-transparent to-transparent opacity-80" />

                {/* Rating badge */}
                <div className="absolute top-3 left-3 bg-[#0B0F17]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-amber-500/30 shadow-lg">
                  <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{restaurant.rating || 4.8}</span>
                  <span className="text-[10px] text-gray-400">({restaurant.reviews || 120})</span>
                </div>

                {/* Delivery time */}
                <div className="absolute bottom-3 right-3 bg-[#0B0F17]/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-200 flex items-center gap-1 border border-white/10">
                  <FiClock className="w-3 h-3 text-amber-400" />
                  <span>{restaurant.deliveryTime || 25} mins</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {restaurant.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                    {restaurant.cuisines?.slice(0, 3).map((cuisine) => (
                      <span
                        key={cuisine}
                        className="px-2 py-0.5 bg-white/5 border border-white/5 text-gray-300 text-[10px] font-medium rounded-md"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <FiMapPin className="text-amber-400 w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[110px]">{restaurant.address}</span>
                  </div>

                  <Link
                    href={`/restaurant/${restaurant.id}`}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-xs rounded-xl border border-amber-500/30 transition-all shadow-sm"
                  >
                    View Menu
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

export default PopularRestaurants;
