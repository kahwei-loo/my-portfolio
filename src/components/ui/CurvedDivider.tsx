"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface CurvedDividerProps {
  fromColor?: string;
  toColor?: string;
  direction?: "up" | "down";
  className?: string;
}

export default function CurvedDivider({
  fromColor = "#0a0a0a",
  toColor = "#111111",
  direction = "down",
  className = "",
}: CurvedDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // Define the curved and flat path data
  const curvedPath =
    direction === "down"
      ? "M0,0 L0,60 Q720,120 1440,60 L1440,0 Z"
      : "M0,100 L0,40 Q720,-20 1440,40 L1440,100 Z";

  const flatPath =
    direction === "down"
      ? "M0,0 L0,100 Q720,100 1440,100 L1440,0 Z"
      : "M0,100 L0,0 Q720,0 1440,0 L1440,100 Z";

  useEffect(() => {
    const container = containerRef.current;
    const path = pathRef.current;

    if (!container || !path) return;

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(path, {
        attr: { d: curvedPath },
      });

      // Animate path on scroll
      gsap.to(path, {
        attr: { d: flatPath },
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 0.5,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [curvedPath, flatPath]);

  return (
    <div
      ref={containerRef}
      className={`relative h-[100px] w-full overflow-hidden ${className}`}
      style={{ backgroundColor: toColor }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path ref={pathRef} fill={fromColor} d={curvedPath} />
      </svg>
    </div>
  );
}
