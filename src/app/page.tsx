"use client";

import React, { useState } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import PopularRestaurants from "@/components/home/PopularRestaurants";
import OffersSection from "@/components/home/OffersSection";
import TrendingFoods from "@/components/home/TrendingFoods";
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative flex flex-col gap-10 sm:gap-14 pb-16">
      {/* Hero Section with Trust Pillars & Direct CTAs */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <HeroBanner />
      </motion.div>

      {/* Exclusive Royal Offers & Coupons */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionVariants}
      >
        <OffersSection />
      </motion.div>

      {/* Most Popular Gourmet Kitchens */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionVariants}
      >
        <PopularRestaurants />
      </motion.div>

      {/* Trending Haute Creations with Dynamic Category Filtering */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionVariants}
      >
        <TrendingFoods
          selectedCategory={selectedCategory}
          onClearCategory={() => setSelectedCategory(null)}
        />
      </motion.div>

      {/* Michelin & Epicurean Spotlights */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={sectionVariants}
      >
        <FeaturedRestaurants />
      </motion.div>
    </div>
  );
}
