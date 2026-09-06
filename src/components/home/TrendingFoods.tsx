"use client";

import React, { useState, useEffect } from "react";
import { FiStar, FiPlus, FiMinus, FiArrowRight, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { subscribeToFoods, subscribeToRestaurants } from "@/lib/firestoreService";
import { FOODS_DATA, RESTAURANTS_DATA } from "@/utils/mockData";
import { Food, Restaurant } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

interface TrendingFoodsProps {
  selectedCategory?: string | null;
  onClearCategory?: () => void;
}

const TrendingFoods: React.FC<TrendingFoodsProps> = ({
  selectedCategory,
  onClearCategory,
}) => {
  const { cartItems, addToCart, removeFromCart, updateCartItemQuantity } = useStore();
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Filter foods: prioritize admin-featured front dishes (up to 9 items) or filter by category
  const displayFoods = React.useMemo(() => {
    if (!selectedCategory) {
      // Dishes marked by admin with featuredOnHome === true
      const featured = foods.filter((f) => f.featuredOnHome === true);
      const nonFeatured = foods.filter((f) => !f.featuredOnHome);

      if (featured.length >= 9) {
        // If 9 or more selected by admin, show 9
        return featured.slice(0, 9);
      } else {
        // If fewer than 9 selected, fill remaining slots up to 9 with bestsellers / other foods
        const needed = 9 - featured.length;
        return [...featured, ...nonFeatured.slice(0, needed)];
      }
    }
    const cat = selectedCategory.toLowerCase().trim();
    const matches = foods.filter((food) => {
      const foodCat = (food.category || "").toLowerCase();
      const foodName = (food.name || "").toLowerCase();
      const foodType = (food.foodType || "").toLowerCase();

      if (cat === "north indian") {
        return (
          foodCat.includes("curries") ||
          foodCat.includes("breads") ||
          foodCat.includes("north") ||
          foodType.includes("food")
        );
      }
      if (cat === "juice" || cat === "juce") {
        return (
          foodCat.includes("juice") ||
          foodCat.includes("beverage") ||
          foodType === "juice" ||
          foodName.includes("juice")
        );
      }
      if (cat === "snack" || cat === "snacks") {
        return (
          foodCat.includes("snack") ||
          foodCat.includes("starter") ||
          foodType === "snack" ||
          foodName.includes("roll") ||
          foodName.includes("tikka")
        );
      }
      if (cat === "ice cream" || cat === "ice creme") {
        return (
          foodCat.includes("ice cream") ||
          foodCat.includes("dessert") ||
          foodType === "ice cream" ||
          foodName.includes("ice cream") ||
          foodName.includes("kulfi")
        );
      }

      return (
        foodCat.includes(cat) ||
        foodName.includes(cat) ||
        foodType === cat
      );
    });

    return matches.length > 0 ? matches : foods.slice(0, 6);
  }, [foods, selectedCategory]);

  return (
    <section id="dishes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">
            Chef's Recommended Creations
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Trending <span className="text-gold-gradient">Gourmet Cravings</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Top ordered dishes across master kitchens, prepared hot with pure desi ghee and artisanal ingredients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCategory && (
            <button
              onClick={onClearCategory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition"
            >
              <FiX className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            Explore all {foods.length} dishes
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Filter Pill Bar */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6 px-4 py-2.5 rounded-2xl bg-[#141B28] border border-amber-500/30 flex items-center justify-between text-xs text-amber-300"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold text-gray-300">Filtered by Cuisine:</span>
            <span className="font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/20">
              {selectedCategory}
            </span>
            <span className="text-gray-400">({displayFoods.length} dishes available)</span>
          </div>

          <button
            onClick={onClearCategory}
            className="text-amber-400 hover:text-white font-extrabold flex items-center gap-1"
          >
            Show All Dishes
            <FiX className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Dishes Grid with Framer Motion transitions */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-[#141B28] rounded-3xl p-5 border border-white/5 animate-pulse h-40"
            >
              <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
              <div className="h-6 bg-white/10 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayFoods.map((food) => {
              const qty = getItemQuantity(food.id);
              const originalPrice = Math.round(food.price * 1.25);

            return (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-[#141B28] rounded-3xl p-5 border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.12)] flex justify-between gap-4 group"
              >
                {/* Left Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {/* Veg / Non-Veg Indicator */}
                      <span
                        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${
                          food.vegetarian ? "border-emerald-500" : "border-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            food.vegetarian ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </span>

                      {food.bestseller && (
                        <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase rounded-full">
                          Bestseller
                        </span>
                      )}

                      <span className="text-[10px] text-gray-400 font-semibold">
                        {food.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                      {food.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-base font-black text-white">
                      ₹{food.price}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{originalPrice}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold ml-auto">
                      <FiStar className="fill-current w-3 h-3" />
                      <span>{food.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Right Image & Add Button */}
                <div className="relative flex flex-col items-center justify-end w-28 sm:w-32 shrink-0">
                  <div className="w-full h-24 rounded-2xl overflow-hidden mb-2 bg-gray-900 border border-white/5">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(food)}
                      className="w-full py-1.5 bg-[#0B0F17] hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      <FiPlus className="w-3 h-3" />
                      ADD
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-amber-500 text-black rounded-xl px-2 py-1 shadow-lg font-black text-xs">
                      <button
                        onClick={() => {
                          if (qty === 1) removeFromCart(food.id);
                          else updateCartItemQuantity(food.id, qty - 1);
                        }}
                        className="p-1 hover:bg-black/10 rounded transition"
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <span>{qty}</span>
                      <button
                        onClick={() => updateCartItemQuantity(food.id, qty + 1)}
                        className="p-1 hover:bg-black/10 rounded transition"
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Bottom CTA to View Complete Catalog */}
      <div className="mt-12 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:-translate-y-0.5"
        >
          <span>Explore Complete Menu Catalog ({foods.length} Dishes)</span>
          <FiArrowRight className="w-4 h-4 stroke-[2.5]" />
        </Link>
      </div>
    </section>
  );
};

export default TrendingFoods;
