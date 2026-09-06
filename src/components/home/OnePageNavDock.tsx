"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Overview", icon: "✨" },
  { id: "cuisines", label: "Cuisines", icon: "🍽️" },
  { id: "offers", label: "Privileges", icon: "🏷️", badge: "50%" },
  { id: "kitchens", label: "Kitchens", icon: "👑" },
  { id: "dishes", label: "Trending", icon: "🔥" },
  { id: "spotlight", label: "Spotlight", icon: "⭐" },
];

const OnePageNavDock = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // Show dock when scrolled past initial hero section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 280);

      // ScrollSpy logic to detect active section
      const sectionElements = NAV_ITEMS.map((item) => ({
        id: item.id,
        el: item.id === "hero" ? document.body : document.getElementById(item.id),
      })).filter((item) => item.el !== null);

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.id === "hero") {
          if (scrollY < 350) {
            setActiveSection("hero");
            break;
          }
        } else if (item.el) {
          const rect = item.el.getBoundingClientRect();
          // If top of section is near or above upper viewport threshold
          if (rect.top <= 200) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]"
        >
          <div className="relative flex items-center gap-1 sm:gap-1.5 p-1.5 bg-[#0F141F]/90 backdrop-blur-2xl border border-amber-500/25 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.18)]">
            {/* Subtle luminous ambient aura inside pill dock */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/5 via-orange-500/10 to-amber-500/5 pointer-events-none" />

            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? "text-black font-black"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Active animated pill background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDockIndicator"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/40"
                    />
                  )}

                  <span className="relative z-10 text-sm">{item.icon}</span>
                  <span className="relative z-10 hidden sm:inline tracking-tight">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span
                      className={`relative z-10 text-[9px] font-black px-1.5 py-0.2 rounded-full transition-colors ${
                        isActive
                          ? "bg-black text-amber-300"
                          : "bg-red-500/90 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnePageNavDock;
