"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiStar,
  FiClock,
  FiMapPin,
  FiPhone,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiShoppingCart,
} from "react-icons/fi";
import { subscribeToRestaurants, subscribeToFoods } from "@/lib/firestoreService";
import { RESTAURANTS_DATA, FOODS_DATA } from "@/utils/mockData";
import { Restaurant, Food } from "@/types";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const { cartItems, addToCart, removeFromCart, updateCartItemQuantity, cartTotal } = useStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterVeg, setFilterVeg] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubRestaurants = subscribeToRestaurants((rData) => {
      if (rData && rData.length > 0) {
        setRestaurants(rData);
      } else {
        setRestaurants(RESTAURANTS_DATA);
      }
    });

    const unsubFoods = subscribeToFoods((fData) => {
      if (fData && fData.length > 0) {
        setFoods(fData);
      } else {
        setFoods(FOODS_DATA);
      }
      setIsLoading(false);
    });

    return () => {
      unsubRestaurants();
      unsubFoods();
    };
  }, []);

  const restaurant =
    restaurants.find((r) => r.id === restaurantId) ||
    RESTAURANTS_DATA.find((r) => r.id === restaurantId) ||
    restaurants[0] ||
    RESTAURANTS_DATA[0];

  const menuItems = foods.filter(
    (f) => String(f.restaurantId) === String(restaurant?.id)
  );

  const displayItems =
    menuItems.length > 0
      ? menuItems
      : foods.slice(0, 8);

  const filteredItems = displayItems.filter((item) => {
    if (filterVeg === null) return true;
    return item.vegetarian === filterVeg;
  });

  const getItemQuantity = (foodId: string) => {
    const item = cartItems.find((i) => i.foodId === foodId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (food: Food) => {
    addToCart({
      id: `${food.id}-${Date.now()}`,
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: 1,
      image: food.image,
      restaurantId: restaurant?.id || "1",
    });
    toast.success(`Added ${food.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] pb-24 text-gray-100">
      {/* Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        <img
          src={restaurant.image || restaurant.banner}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-black/30" />
        <Link
          href="/restaurants"
          className="absolute top-6 left-6 p-2.5 bg-[#0B0F17]/80 hover:bg-black text-white rounded-full backdrop-blur-md shadow-lg border border-white/10 transition"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div className="absolute bottom-8 left-6 right-6 max-w-7xl mx-auto text-white">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {restaurant?.cuisines?.map((c) => (
              <span
                key={c}
                className="px-3 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold"
              >
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">{restaurant?.name || "Gourmet Kitchen"}</h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            {restaurant?.description}
          </p>
        </div>
      </div>

      {/* Info Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-[#141B28] rounded-3xl shadow-2xl p-6 border border-amber-500/20 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <FiStar className="w-5 h-5 fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {restaurant?.rating || 4.8} / 5.0
                </p>
                <p className="text-[11px] text-gray-400">{restaurant?.reviews || 120} Reviews</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {restaurant?.deliveryTime || 25} mins
                </p>
                <p className="text-[11px] text-gray-400">Delivery Time</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white truncate max-w-[200px]">
                  {restaurant?.address || "Downtown Kitchen"}
                </p>
                <p className="text-[11px] text-gray-400">Kitchen Location</p>
              </div>
            </div>
          </div>

          {restaurant?.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-2xl text-xs font-bold text-gray-300 hover:bg-white/5 transition"
            >
              <FiPhone className="w-3.5 h-3.5 text-amber-400" />
              {restaurant.phone}
            </a>
          )}
        </div>
      </div>

      {/* Menu Header & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">
              Menu & Chef's Special Creations
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Cooked to royal culinary standards & hygienically delivered
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterVeg(null)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterVeg === null
                  ? "bg-amber-500 text-black"
                  : "bg-[#141B28] text-gray-300 border border-white/10 hover:bg-white/5"
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setFilterVeg(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterVeg === true
                  ? "bg-emerald-500 text-white"
                  : "bg-[#141B28] text-emerald-400 border border-emerald-500/30"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Veg Only
            </button>
            <button
              onClick={() => setFilterVeg(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterVeg === false
                  ? "bg-red-500 text-white"
                  : "bg-[#141B28] text-red-400 border border-red-500/30"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#141B28] rounded-3xl p-5 border border-white/5 animate-pulse h-40"
              >
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-4" />
                <div className="h-6 bg-white/10 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((food) => {
              const qty = getItemQuantity(food.id);

            return (
              <div
                key={food.id}
                className="bg-[#141B28] rounded-3xl p-5 border border-white/5 hover:border-amber-500/30 shadow-md hover:shadow-xl transition-all flex justify-between gap-4 group"
              >
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${
                          food.vegetarian
                            ? "border-emerald-500"
                            : "border-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            food.vegetarian ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </span>
                      {food.bestseller && (
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-500/30">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                      {food.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-black text-white">
                      ₹{food.price}
                    </span>
                    {food.discount && (
                      <span className="text-xs text-emerald-400 font-bold">
                        {food.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Image & Action Button */}
                <div className="relative flex flex-col items-center justify-end w-32 shrink-0">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-28 h-24 object-cover rounded-2xl shadow-sm mb-2 group-hover:scale-105 transition-transform duration-500"
                  />

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAdd(food)}
                      className="w-full py-1.5 bg-[#0B0F17] border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black text-xs font-black rounded-xl shadow transition"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between bg-amber-500 text-black rounded-xl px-2 py-1 shadow font-bold text-xs">
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
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Floating Cart Bar if cart has items */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-xl mx-auto z-40 animate-slideDown">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold rounded-2xl p-4 shadow-[0_20px_50px_rgba(245,158,11,0.4)] flex items-center justify-between backdrop-blur-md">
            <div>
              <p className="text-[11px] uppercase tracking-wider opacity-90">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} Items In Your Cart
              </p>
              <p className="text-xl font-black text-black">₹{cartTotal}</p>
            </div>

            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-amber-300 font-extrabold text-xs rounded-xl shadow-lg hover:bg-gray-900 transition"
            >
              <FiShoppingCart className="w-4 h-4" />
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
