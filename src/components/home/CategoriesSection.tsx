"use client";

import React from "react";
import { FiArrowRight, FiCheck, FiX } from "react-icons/fi";
import { motion } from "framer-motion";

export interface CategoryItem {
  id: string;
  name: string;
  filterKey: string;
  tag: string;
  count: string;
  image: string;
  accent: string;
  symbol: string;
}

export const GOURMET_CATEGORIES: CategoryItem[] = [
  {
    id: "1",
    name: "Royal Dum Biryani",
    filterKey: "Biryani",
    tag: "Claypot Dum",
    count: "18+ dishes",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=320&h=320&fit=crop",
    accent: "from-amber-500 to-orange-600",
    symbol: "🍚",
  },
  {
    id: "2",
    name: "Artisan Pizza",
    filterKey: "Pizza",
    tag: "Wood-Fired",
    count: "12+ dishes",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=320&h=320&fit=crop",
    accent: "from-red-500 to-amber-500",
    symbol: "🍕",
  },
  {
    id: "3",
    name: "North Indian",
    filterKey: "North Indian",
    tag: "Rich Gravies",
    count: "24+ dishes",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=320&h=320&fit=crop",
    accent: "from-orange-500 to-amber-600",
    symbol: "🥘",
  },
  {
    id: "4",
    name: "South Indian",
    filterKey: "South Indian",
    tag: "Ghee Roast",
    count: "15+ dishes",
    image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=320&h=320&fit=crop",
    accent: "from-yellow-500 to-amber-500",
    symbol: "🥞",
  },
  {
    id: "5",
    name: "Gourmet Cakes",
    filterKey: "Desserts",
    tag: "Artisanal",
    count: "10+ cakes",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=320&h=320&fit=crop",
    accent: "from-pink-500 to-rose-600",
    symbol: "🍰",
  },
  {
    id: "6",
    name: "Pan-Asian",
    filterKey: "Chinese",
    tag: "Wok & Dimsum",
    count: "16+ dishes",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=320&h=320&fit=crop",
    accent: "from-emerald-500 to-teal-600",
    symbol: "🍜",
  },
  {
    id: "7",
    name: "Tandoor Grill",
    filterKey: "Starters",
    tag: "Charcoal Hot",
    count: "14+ dishes",
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=320&h=320&fit=crop",
    accent: "from-rose-500 to-orange-600",
    symbol: "🍢",
  },
  {
    id: "8",
    name: "Artisan Desserts",
    filterKey: "Desserts",
    tag: "Sweet Indulgence",
    count: "9+ treats",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=320&h=320&fit=crop",
    accent: "from-purple-500 to-amber-500",
    symbol: "🍨",
  },
];

interface CategoriesSectionProps {
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const handleCategoryClick = (filterKey: string) => {
    if (onSelectCategory) {
      if (selectedCategory?.toLowerCase() === filterKey.toLowerCase()) {
        onSelectCategory(null);
      } else {
        onSelectCategory(filterKey);
        // Smoothly scroll down to dishes section
        const target = document.getElementById("dishes");
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
      }
    }
  };

  return (
    <section id="cuisines" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <span>✨ Haute Gastronomy</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Browse by <span className="text-gold-gradient">Gourmet Category</span>
          </h2>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Click any signature category below to instantly filter handcrafted gourmet dishes directly on this page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory && onSelectCategory(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-extrabold transition animate-fadeIn"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Clear Filter: {selectedCategory}</span>
            </button>
          )}

          <a
            href="#dishes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            Explore dishes
            <FiArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid of Luxury Image Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5 sm:gap-4">
        {GOURMET_CATEGORIES.map((category, idx) => {
          const isSelected =
            selectedCategory?.toLowerCase() === category.filterKey.toLowerCase();

          return (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category.filterKey)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative rounded-3xl p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-all duration-300 cursor-pointer overflow-hidden border ${
                isSelected
                  ? "bg-gradient-to-b from-amber-500/20 via-[#1A2334] to-[#141B28] border-amber-400 shadow-[0_15px_35px_-5px_rgba(245,158,11,0.35),0_0_20px_rgba(245,158,11,0.2)] ring-2 ring-amber-400/50"
                  : "bg-[#141B28]/85 hover:bg-[#1A2334] border-white/10 hover:border-amber-500/40 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.18)]"
              }`}
            >
              {/* Selected Badge Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center text-[10px] font-black shadow-md z-20 animate-scaleIn">
                  <FiCheck className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Premium Jewel Image Icon Frame */}
              <div className="relative mb-3 mt-1 gourmet-icon-glow">
                <div
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr ${category.accent} shadow-lg shadow-black/60 transition-transform duration-500 group-hover:scale-105 sheen-effect`}
                >
                  {/* Outer Gold Ring */}
                  <div className="w-full h-full rounded-full overflow-hidden relative border-2 border-[#0B0F17] bg-[#0B0F17]">
                    <img
                      src={category.image}
                      alt={category.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=320&h=320&fit=crop";
                      }}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700 filter brightness-105 contrast-105"
                      loading="lazy"
                    />
                    {/* Subtle Dark Vignette & Gold Tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                  </div>

                  {/* Floating Micro Symbol Pill */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F141F] border border-amber-500/40 flex items-center justify-center text-xs shadow-md group-hover:rotate-12 transition-transform">
                    <span>{category.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div className="w-full flex-1 flex flex-col justify-between items-center">
                <span
                  className={`text-xs font-extrabold leading-tight transition-colors line-clamp-1 ${
                    isSelected
                      ? "text-amber-300 font-black"
                      : "text-gray-100 group-hover:text-amber-300"
                  }`}
                >
                  {category.name}
                </span>

                {/* Tag & Count */}
                <div className="mt-1.5 flex flex-col items-center gap-0.5">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors ${
                      isSelected
                        ? "bg-amber-400 text-black"
                        : "bg-white/5 border border-white/10 text-amber-400/90 group-hover:border-amber-500/30"
                    }`}
                  >
                    {category.tag}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {category.count}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
