"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface GradientBlobProps {
  className?: string;
}

export default function GradientBlob({ className = "" }: GradientBlobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/tablet devices for performance optimization
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 1024px)").matches;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Simpler animations for mobile/tablet
      const animationConfig = isMobile
        ? {
            duration: 20, // Slower for smoother performance
            scale: { min: 0.9, max: 1.1 },
            movement: { x: 40, y: 40 },
          }
        : {
            duration: 15,
            scale: { min: 0.8, max: 1.2 },
            movement: { x: 80, y: 80 },
          };

      // Blob 1 - Main walnut blob
      gsap.to(blob1Ref.current, {
        x: `random(-${animationConfig.movement.x}, ${animationConfig.movement.x})`,
        y: `random(-${animationConfig.movement.y}, ${animationConfig.movement.y})`,
        scale: `random(${animationConfig.scale.min}, ${animationConfig.scale.max})`,
        rotation: isMobile ? 0 : "random(-15, 15)",
        duration: animationConfig.duration,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Blob 2 - Accent blue blob
      gsap.to(blob2Ref.current, {
        x: `random(-${animationConfig.movement.x}, ${animationConfig.movement.x})`,
        y: `random(-${animationConfig.movement.y}, ${animationConfig.movement.y})`,
        scale: `random(${animationConfig.scale.min}, ${animationConfig.scale.max})`,
        rotation: isMobile ? 0 : "random(-20, 20)",
        duration: animationConfig.duration + 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });

      // Blob 3 - Skip on mobile for better performance
      if (!isMobile && blob3Ref.current) {
        gsap.to(blob3Ref.current, {
          x: "random(-60, 60)",
          y: "random(-100, 100)",
          scale: "random(0.9, 1.1)",
          rotation: "random(-10, 10)",
          duration: 22,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 4,
        });

        // Morphing effect - only on desktop
        gsap.to(blob3Ref.current, {
          borderRadius: "40% 60% 60% 40% / 70% 30% 60% 40%",
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Simplified morphing for main blobs
      if (!isMobile) {
        gsap.to(blob1Ref.current, {
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(blob2Ref.current, {
          borderRadius: "50% 50% 40% 60% / 40% 50% 60% 50%",
          duration: 14,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Performance optimization: reduce blur on mobile/tablet — desktop gets cinematic 120px blur
  const blurAmount = isMobile ? 50 : 120;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Main walnut blob — larger for cinematic atmosphere */}
      <div
        ref={blob1Ref}
        className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `
            radial-gradient(
              ellipse at 30% 30%,
              rgba(139, 115, 85, 0.2) 0%,
              rgba(139, 115, 85, 0.08) 40%,
              transparent 70%
            )
          `,
          filter: `blur(${blurAmount}px)`,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          willChange: "transform",
        }}
      />

      {/* Accent blue blob — larger */}
      <div
        ref={blob2Ref}
        className="absolute left-[60%] top-[40%] h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: `
            radial-gradient(
              ellipse at 60% 40%,
              rgba(41, 151, 255, 0.15) 0%,
              rgba(41, 151, 255, 0.06) 40%,
              transparent 70%
            )
          `,
          filter: `blur(${blurAmount + 20}px)`,
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          willChange: "transform",
        }}
      />

      {/* Secondary walnut blob - hidden on mobile for performance */}
      {!isMobile && (
        <div
          ref={blob3Ref}
          className="absolute left-[35%] top-[60%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `
              radial-gradient(
                ellipse at 40% 60%,
                rgba(212, 196, 176, 0.1) 0%,
                rgba(139, 115, 85, 0.05) 50%,
                transparent 70%
              )
            `,
            filter: "blur(100px)",
            borderRadius: "40% 60% 60% 40% / 70% 30% 60% 40%",
            willChange: "transform",
          }}
        />
      )}

      {/* Subtle overlay grain for texture - skip on mobile */}
      {!isMobile && (
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}
