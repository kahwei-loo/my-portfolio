"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with optimized settings
    lenisRef.current = new Lenis({
      duration: 0.8, // Reduced from 1.2 for less resistance
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5, // Reduced from 2 for better control
      wheelMultiplier: 1, // Normal wheel sensitivity
    });

    // Expose for external scroll lock (e.g., modals)
    (window as unknown as Record<string, unknown>).__lenis = lenisRef.current;

    // Properly integrate Lenis with GSAP ScrollTrigger
    lenisRef.current.on("scroll", ScrollTrigger.update);

    // Store the RAF function reference for cleanup
    const rafFunction = (time: number) => {
      lenisRef.current?.raf(time * 1000);
    };

    // Use GSAP ticker to drive Lenis
    gsap.ticker.add(rafFunction);

    // Disable lag smoothing for better sync with Lenis
    gsap.ticker.lagSmoothing(0);

    // Update ScrollTrigger when Lenis updates
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && lenisRef.current) {
          lenisRef.current.scrollTo(value as number, { immediate: true });
        }
        return lenisRef.current?.scroll || 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    // Refresh ScrollTrigger after Lenis initialization
    ScrollTrigger.refresh();

    return () => {
      // Remove the RAF function using the same reference
      gsap.ticker.remove(rafFunction);
      
      // Clean up global reference
      (window as unknown as Record<string, unknown>).__lenis = null;

      // Destroy Lenis instance
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
