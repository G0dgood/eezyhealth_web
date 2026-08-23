import React from "react";
import Image from "next/image";

interface PageLoaderProps {
  className?: string;
  /** Optional message shown under the loader. */
  label?: string;
}

/**
 * Full-page loading state: the EezyHealth mark sits still while a brand-green
 * arc orbits it. The logo is deliberately NOT rotated — spinning the mark itself
 * reads as a glitch, whereas a ring travelling around it reads as progress.
 */
export default function PageLoader({
  className = "",
  label,
}: PageLoaderProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        {/* Sized in px, not rem: this app sets a reduced root font-size, which
            would otherwise shrink the loader to 75% of its intended size. */}
        <div className="relative mx-auto h-[96px] w-[96px]">
          {/* Track: the full circle the arc travels along */}
          <div className="absolute inset-0 rounded-full border-4 border-[#44CE2D]/15" />

          {/* Orbiting arc — two adjacent borders give a ~quarter sweep */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#44CE2D] border-r-[#44CE2D] animate-spin"
            style={{ animationDuration: "1.1s" }}
          />

          {/* Counter-rotating inner arc, slower and lighter, for depth */}
          <div
            className="absolute inset-[9px] rounded-full border-2 border-transparent border-b-[#44CE2D]/40 animate-spin"
            style={{ animationDuration: "1.8s", animationDirection: "reverse" }}
          />

          {/* The mark itself: centred and stationary */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/halflogo.png"
              alt="EezyHealth"
              width={370}
              height={377}
              priority
              className="h-[46px] w-[46px] object-contain"
            />
          </div>
        </div>

        {label ? (
          <p className="mt-4 text-[13px] text-gray-500">{label}</p>
        ) : (
          <span className="sr-only">Loading</span>
        )}
      </div>
    </div>
  );
}
