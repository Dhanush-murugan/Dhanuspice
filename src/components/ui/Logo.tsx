"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  variant?: "full" | "mark" | "horizontal";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSubtitle?: boolean;
  subtitleText?: string;
  href?: string | null;
  className?: string;
}

const sizeMap = {
  xs: {
    iconSize: 28,
    iconClass: "w-7 h-7 rounded-lg",
    titleClass: "text-sm",
    subtitleClass: "text-[8px]",
  },
  sm: {
    iconSize: 42,
    iconClass: "w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl",
    titleClass: "text-lg sm:text-xl",
    subtitleClass: "text-[9px] sm:text-[10px]",
  },
  md: {
    iconSize: 52,
    iconClass: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
    titleClass: "text-xl sm:text-2xl",
    subtitleClass: "text-[10px] sm:text-xs",
  },
  lg: {
    iconSize: 68,
    iconClass: "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl",
    titleClass: "text-2xl sm:text-3xl",
    subtitleClass: "text-xs sm:text-sm",
  },
  xl: {
    iconSize: 96,
    iconClass: "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl",
    titleClass: "text-3xl sm:text-4xl",
    subtitleClass: "text-sm sm:text-base",
  },
};

export default function Logo({
  variant = "full",
  size = "sm",
  showSubtitle = true,
  subtitleText = "Royal Gourmet Dining",
  href = "/",
  className = "",
}: LogoProps) {
  const currentSize = sizeMap[size] || sizeMap.sm;

  const content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Medallion Icon Container */}
      <div
        className={`relative ${currentSize.iconClass} p-[1.5px] bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 group-hover:scale-105 transition-all duration-300 flex-shrink-0`}
      >
        <div className="w-full h-full bg-[#090D15] rounded-[inherit] overflow-hidden relative flex items-center justify-center">
          {/* Real High-Resolution Brand Asset */}
          <Image
            src="/brand/logo.png"
            alt="Dhanuspice Royal Gourmet Emblem"
            width={currentSize.iconSize * 2}
            height={currentSize.iconSize * 2}
            className="w-full h-full object-cover rounded-[inherit] transform group-hover:scale-110 transition-transform duration-500"
            priority={size === "sm" || size === "lg"}
          />
          {/* Subtle Ambient Golden Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-400/10 pointer-events-none" />
        </div>
      </div>

      {/* Typography Lockup */}
      {variant !== "mark" && (
        <div className="flex flex-col justify-center">
          <div
            className={`font-black tracking-tight text-white flex items-center gap-0.5 leading-none ${currentSize.titleClass}`}
          >
            <span className="tracking-wide">DHANU</span>
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm font-extrabold">
              SPICE
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`font-semibold tracking-[0.2em] text-amber-400/90 uppercase mt-0.5 sm:mt-1 ${currentSize.subtitleClass}`}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
