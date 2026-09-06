"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiStar,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiFilter,
  FiShoppingBag,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { subscribeToFoods, subscribeToRestaurants } from "@/lib/firestoreService";
import { FOODS_DATA, RESTAURANTS_DATA } from "@/utils/mockData";
import { Food, Restaurant } from "@/types";
import toast from "react-hot-toast";

const CATEGORIES = [
  { id: "all", label: "All Dishes", icon: "✨" },
  { id: "biryani", label: "Biryani", icon: "🍚" },
  { id: "pizza", label: "Pizza", icon: "🍕" },
  { id: "north indian", label: "North Indian", icon: "🍛" },
  { id: "snack", label: "Snacks & Starters", icon: "🍟" },
  { id: "juice", label: "Juices & Drinks", icon: "🍹" },
  { id: "ice cream", label: "Ice Cream", icon: "🍨" },
  { id: "dessert", label: "Desserts", icon: "🍰" },
];

export default function MenuPage() {
  const { cartItems, addToCart, updateCartItemQuantity } = useStore();
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDiet, setSelectedDiet] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "rating">("popular");

  // Subscribe to real-time Cloud Firestore menu catalog
  useEffect(() => {
    const unsubFoods = subscribeToFoods((fData) => {
      if (fData && fData.length > 0) {
        setFoods(fData);
      } else {
        setFoods(FOODS_DATA);
      }
      setIsLoading(false);
    });

    const unsubRestaurants = subscribeToRestaurants((rData) => {
      if (rData && rData.length > 0) {
        setRestaurants(rData);
      } else {
        setRestaurants(RESTAURANTS_DATA);
      }
    });

    return () => {
      unsubFoods();
      unsubRestaurants();
    };
  }, []);

  const getItemQuantity = (foodId: string) => {
    const item = cartItems.find((i) => i.foodId === foodId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (food: Food) => {
    const matchedRestaurant =
      restaurants.find((r) => String(r.id) === String(food.restaurantId)) ||
      RESTAURANTS_DATA.find((r) => String(r.id) === String(food.restaurantId)) ||
      restaurants[0] ||
      RESTAURANTS_DATA[0];

    addToCart({
      id: `${food.id}-${Date.now()}`,
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: 1,
      image: food.image,
      restaurantId: matchedRestaurant?.id || "1",
    });
    toast.success(`Added ${food.name} to cart!`);
  };

  // Filtered and Sorted Dishes
  const filteredDishes = useMemo(() => {
    return foods
      .filter((food) => {
        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = food.name.toLowerCase().includes(q);
          const matchesDesc = (food.description || "").toLowerCase().includes(q);
          const matchesCat = (food.category || "").toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        // Category Filter
        if (selectedCategory !== "all") {
          const cat = selectedCategory.toLowerCase();
          const fCat = (food.category || "").toLowerCase();
          const fName = food.name.toLowerCase();
          const fType = (food.foodType || "").toLowerCase();

          if (cat === "north indian") {
            const isNorth =
              fCat.includes("curries") ||
              fCat.includes("breads") ||
              fCat.includes("north") ||
              fType.includes("food");
            if (!isNorth) return false;
          } else if (cat === "juice") {
            const isJuice =
              fCat.includes("juice") ||
              fCat.includes("beverage") ||
              fType === "juice" ||
              fName.includes("juice");
            if (!isJuice) return false;
          } else if (cat === "snack") {
            const isSnack =
              fCat.includes("snack") ||
              fCat.includes("starter") ||
              fType === "snack" ||
              fName.includes("roll") ||
              fName.includes("tikka");
            if (!isSnack) return false;
          } else if (cat === "ice cream") {
            const isIceCream =
              fCat.includes("ice cream") ||
              fCat.includes("dessert") ||
              fType === "ice cream" ||
              fName.includes("ice cream") ||
              fName.includes("kulfi");
            if (!isIceCream) return false;
          } else {
            const matchesCategory =
              fCat.includes(cat) || fName.includes(cat) || fType === cat;
            if (!matchesCategory) return false;
          }
        }

        // Diet Filter
        if (selectedDiet === "veg" && !food.vegetarian) return false;
        if (selectedDiet === "non-veg" && food.vegetarian) return false;

        // Restaurant Filter
        if (selectedRestaurantId !== "all" && String(food.restaurantId) !== selectedRestaurantId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        // Default "popular": Prioritize admin-featured front dishes, then bestsellers
        if (a.featuredOnHome && !b.featuredOnHome) return -1;
        if (!a.featuredOnHome && b.featuredOnHome) return 1;
        if (a.bestseller && !b.bestseller) return -1;
        if (!a.bestseller && b.bestseller) return 1;
        return 0;
      });
  }, [foods, searchQuery, selectedCategory, selectedDiet, selectedRestaurantId, sortBy]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDiet("all");
    setSelectedRestaurantId("all");
    setSortBy("popular");
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-amber-500 selection:text-black">
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Breadcrumb & Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-amber-400 transition flex items-center gap-1">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-amber-300 font-bold">Full Menu Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Masterchef Catalog ({foods.length} Dishes)
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
                Explore <span className="text-gold-gradient">Gourmet Creations</span>
              </h1>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">
                Browse every dish prepared fresh across all our partner kitchens. Use filters to find your exact craving and add directly to your feast.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="px-4 py-2 rounded-2xl bg-[#141B28] border border-white/10 text-xs">
                <span className="text-gray-400">Kitchens:</span>{" "}
                <span className="font-extrabold text-amber-400">{restaurants.length}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-[#141B28] border border-white/10 text-xs">
                <span className="text-gray-400">Total Dishes:</span>{" "}
                <span className="font-extrabold text-amber-400">{foods.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Quick Controls Bar */}
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by dish name, flavors, cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#141B28] border border-white/10 text-white placeholder-gray-500 outline-none focus:border-amber-400 shadow-lg transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Kitchen Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                className="w-full py-3 px-3.5 text-xs rounded-2xl bg-[#141B28] border border-white/10 text-white font-bold outline-none focus:border-amber-400 shadow-lg cursor-pointer"
              >
                <option value="all">🏰 All Partner Kitchens</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-3 px-3.5 text-xs rounded-2xl bg-[#141B28] border border-white/10 text-white font-bold outline-none focus:border-amber-400 shadow-lg cursor-pointer"
              >
                <option value="popular">⭐ Most Popular & Featured</option>
                <option value="rating">🏆 Highest Rated First</option>
                <option value="price-asc">💵 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-md shadow-amber-500/20 font-black"
                      : "bg-[#141B28] text-gray-300 border border-white/10 hover:border-amber-500/30 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Diet Filters & Reset Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mr-1">
                <FiFilter className="w-3.5 h-3.5 text-amber-400" />
                Diet:
              </span>
              <button
                onClick={() => setSelectedDiet("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedDiet === "all"
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedDiet("veg")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedDiet === "veg"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold"
                    : "text-gray-400 hover:text-emerald-400"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Pure Veg
              </button>
              <button
                onClick={() => setSelectedDiet("non-veg")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  selectedDiet === "non-veg"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40 font-extrabold"
                    : "text-gray-400 hover:text-red-400"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Non-Veg
              </button>
            </div>

            {(searchQuery ||
              selectedCategory !== "all" ||
              selectedDiet !== "all" ||
              selectedRestaurantId !== "all" ||
              sortBy !== "popular") && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
              >
                <FiX className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Dishes Grid */}
        {isLoading ? (
          <div className="py-24 text-center text-sm text-gray-400 animate-pulse">
            Loading master culinary catalog from Cloud Firestore...
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="py-20 text-center bg-[#141B28] rounded-3xl border border-dashed border-white/10 p-8 space-y-4">
            <div className="text-4xl">🍲</div>
            <h3 className="text-lg font-bold text-white">No dishes matched your criteria</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              We couldn't find any dishes matching your current search or diet filter. Try resetting filters to explore all.
            </p>
            <button
              onClick={resetFilters}
              className="btn-gold !py-2 !px-5 !text-xs !rounded-xl font-black"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-4">
              Showing <span className="text-white font-bold">{filteredDishes.length}</span> delicacies
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDishes.map((food) => {
                  const qty = getItemQuantity(food.id);
                  const matchedRestaurant =
                    restaurants.find((r) => String(r.id) === String(food.restaurantId)) ||
                    RESTAURANTS_DATA.find((r) => String(r.id) === String(food.restaurantId));

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={food.id}
                      className="bg-[#141B28] rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                    >
                      <div>
                        {/* Food Image */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e: any) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141B28] via-transparent to-transparent opacity-80" />

                          {/* Badges Top Left */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {food.featuredOnHome && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-black shadow-md flex items-center gap-1">
                                <span>⭐</span> Front Feature
                              </span>
                            )}
                            {food.bestseller && !food.featuredOnHome && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md">
                                BESTSELLER
                              </span>
                            )}
                            {food.vegetarian ? (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                                Veg
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-500/40 backdrop-blur-md">
                                Non-Veg
                              </span>
                            )}
                          </div>

                          {/* Category Top Right */}
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-black/75 text-amber-300 border border-white/10 backdrop-blur-md uppercase tracking-wider">
                              {food.category}
                            </span>
                          </div>

                          {/* Price Tag Bottom Right */}
                          <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-md border border-amber-500/40 px-3 py-1 rounded-xl">
                            <span className="text-base font-black text-amber-400">
                              ₹{food.price}
                            </span>
                          </div>
                        </div>

                        {/* Dish Details */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-extrabold text-base text-white group-hover:text-amber-300 transition line-clamp-1">
                              {food.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-amber-400 font-black shrink-0">
                              <FiStar className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{food.rating || "4.8"}</span>
                            </div>
                          </div>

                          {/* Kitchen Name */}
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate font-medium">
                            <FiMapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{matchedRestaurant?.name || "Gourmet Partner Kitchen"}</span>
                          </p>

                          {/* Description */}
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                            {food.description ||
                              "Artisanal specialty hand-prepared fresh with secret spices and premium desi ghee."}
                          </p>
                        </div>
                      </div>

                      {/* Add to Cart Footer */}
                      <div className="px-5 pb-5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-gray-400">
                          {food.spicy ? "🌶️ Spicy Special" : "✨ Chef Curated"}
                        </div>

                        {qty === 0 ? (
                          <button
                            onClick={() => handleAdd(food)}
                            className="btn-gold !py-2 !px-4 !text-xs !rounded-xl font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                            Add to Feast
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5 bg-amber-500 text-black px-3 py-1.5 rounded-xl font-black text-xs shadow-md">
                            <button
                              onClick={() => updateCartItemQuantity(food.id, qty - 1)}
                              className="p-1 hover:bg-black/15 rounded transition"
                              title="Decrease"
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono font-bold text-sm px-1">{qty}</span>
                            <button
                              onClick={() => updateCartItemQuantity(food.id, qty + 1)}
                              className="p-1 hover:bg-black/15 rounded transition"
                              title="Increase"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Floating Cart Quick Bar if items present */}
        {totalCartCount > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
            <Link
              href="/cart"
              className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-2xl shadow-amber-500/40 hover:scale-[1.02] transition-transform font-black"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-amber-400 flex items-center justify-center font-bold">
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-black/80 font-bold">
                    {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"} in Cart
                  </p>
                  <p className="text-base font-black">₹{totalCartAmount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider bg-black/10 px-3.5 py-2 rounded-xl">
                <span>Review Cart & Checkout</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
