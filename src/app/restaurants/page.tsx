"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiStar, FiClock, FiMapPin, FiSearch, FiSliders } from "react-icons/fi";
import { subscribeToRestaurants } from "@/lib/firestoreService";
import { RESTAURANTS_DATA } from "@/utils/mockData";
import { Restaurant } from "@/types";

const CUISINE_FILTERS = [
  "All",
  "Biryani",
  "Pizza",
  "North Indian",
  "South Indian",
  "Chinese",
  "Desserts",
  "Juice",
  "Snacks",
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "time">("rating");

  useEffect(() => {
    const unsubscribe = subscribeToRestaurants((data) => {
      if (data && data.length > 0) {
        setRestaurants(data);
      } else {
        // Fallback to seed mock data if collection is brand new
        setRestaurants(RESTAURANTS_DATA);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.cuisines.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCuisine =
          selectedCuisine === "All" ||
          r.cuisines.some(
            (c) => c.toLowerCase().includes(selectedCuisine.toLowerCase())
          );

        return matchesSearch && matchesCuisine;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "time") return (a.deliveryTime || 0) - (b.deliveryTime || 0);
        return 0;
      });
  }, [restaurants, searchTerm, selectedCuisine, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0F17] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-amber-400 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-amber-300 font-semibold">Restaurants</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Explore Gourmet Kitchens
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Discover {restaurants.length} certified gourmet dining spots delivering hot in 25 minutes.
          </p>
        </div>

        {/* Search & Filters Controls */}
        <div className="bg-[#141B28] p-4 rounded-3xl border border-amber-500/20 shadow-xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by kitchen, dish, or cuisine..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/10 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <FiSliders className="text-amber-400 w-4 h-4" />
            <span className="text-xs text-gray-300 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rating" | "time")}
              className="bg-[#0B0F17] border border-white/10 text-xs font-bold rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-500"
            >
              <option value="rating">Top Rated (Highest First)</option>
              <option value="time">Fastest Delivery (Under 25m)</option>
            </select>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CUISINE_FILTERS.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
                selectedCuisine === cuisine
                  ? "bg-amber-500 text-black shadow-amber-500/20"
                  : "bg-[#141B28] text-gray-300 border border-white/5 hover:border-amber-500/30 hover:text-white"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-[#141B28] rounded-3xl overflow-hidden border border-white/5 p-4 animate-pulse h-80"
              >
                <div className="w-full h-48 bg-white/5 rounded-2xl mb-4" />
                <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-8 bg-white/10 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20 bg-[#141B28] rounded-3xl border border-white/5 p-8">
            <span className="text-5xl mb-3 block">🔍</span>
            <h3 className="text-xl font-bold text-white">
              No restaurants match your search
            </h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">
              Try clearing your search query or selecting "All" cuisines.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCuisine("All");
              }}
              className="btn-gold !py-2 !px-4 !text-xs !rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-[#141B28] rounded-3xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)] flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={restaurant.image || restaurant.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141B28] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 bg-[#0B0F17]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5 border border-amber-500/30 shadow-md">
                    <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{restaurant.rating || 4.8}</span>
                    <span className="text-[10px] text-gray-400">({restaurant.reviews || 120})</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#0B0F17]/80 backdrop-blur-md text-gray-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border border-white/10">
                    <FiClock className="w-3 h-3 text-amber-400" />
                    <span>{restaurant.deliveryTime || 25} mins</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
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
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FiMapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{restaurant.address}</span>
                    </div>

                    <Link
                      href={`/restaurant/${restaurant.id}`}
                      className="btn-gold !py-1.5 !px-3.5 !text-xs !rounded-xl"
                    >
                      View Menu
                    </Link>
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
