"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { searchCatalog, SearchResultItem } from "@/lib/firestoreService";

const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Live real catalog search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCatalog(searchQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    setSearchQuery(item.name);
    setShowSuggestions(false);
    if (item.type === "restaurant") {
      router.push(`/restaurant/${item.id}`);
    } else if (item.restaurantId) {
      router.push(`/restaurant/${item.restaurantId}`);
    } else {
      router.push(`/restaurants?search=${encodeURIComponent(item.name)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-30">
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-3 bg-[#141B28]/95 border border-amber-500/25 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] px-5 py-3.5 backdrop-blur-xl transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20">
          <FiSearch className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            placeholder="Search real dishes, cuisines, or partner kitchens..."
            value={searchQuery}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
                setShowSuggestions(false);
              }
            }}
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Real Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#141B28] border border-amber-500/25 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                <span>Live Matching Results</span>
                {isSearching && <span className="animate-pulse">Searching...</span>}
              </div>

              {suggestions.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-gray-400">
                  No dishes or kitchens found for "{searchQuery}"
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.type}-${suggestion.id}`}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full px-3 py-2.5 text-left hover:bg-white/5 rounded-xl transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {suggestion.image ? (
                        <img
                          src={suggestion.image}
                          alt={suggestion.name}
                          className="w-9 h-9 rounded-lg object-cover bg-gray-800 shrink-0"
                          onError={(e: any) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs shrink-0">
                          {suggestion.type === "restaurant" ? "🍽️" : "🍛"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            {suggestion.name}
                          </p>
                          {suggestion.price && (
                            <span className="text-[11px] font-extrabold text-amber-400">
                              ₹{suggestion.price}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {suggestion.category} •{" "}
                          {suggestion.type === "restaurant"
                            ? "Partner Kitchen"
                            : suggestion.restaurantName || "Dish"}
                        </p>
                      </div>
                    </div>
                    <FiArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition -translate-x-1 group-hover:translate-x-0 shrink-0" />
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
