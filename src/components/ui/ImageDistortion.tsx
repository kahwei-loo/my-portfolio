"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";

interface ImageDistortionProps {
  className?: string;
  color: string;
  children?: React.ReactNode;
}

export default function ImageDistortion({
  className = "",
  color,
  children,
}: ImageDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !overlayRef.current) return;

    if (isHovered) {
      // Create distortion effect with multiple layers
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      // Scale effect
      gsap.to(containerRef.current.querySelector(".distort-inner"), {
        scale: 1.05,
        duration: 0.6,
        ease: "power2.out",
      });

      // Glitch lines
      const glitchLines = containerRef.current.querySelectorAll(".glitch-line");
      glitchLines.forEach((line, i) => {
        gsap.to(line, {
          x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 10 + 5),
          opacity: 0.6,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          ease: "power1.inOut",
        });
      });
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });

      gsap.to(containerRef.current.querySelector(".distort-inner"), {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main content with scale effect */}
      <div className="distort-inner h-full w-full transition-transform duration-300">
        {children}
      </div>

      {/* Distortion overlay */}
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, transparent 50%, ${color}10 100%)`,
        }}
      />

      {/* Glitch effect lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="glitch-line absolute h-[2px] w-full opacity-0"
            style={{
              top: `${20 + i * 15}%`,
              background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
              mixBlendMode: "screen",
            }}
          />
        ))}
      </div>

      {/* Scan line effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 0.1 : 0,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${color}10 2px,
            ${color}10 4px
          )`,
        }}
      />

      {/* Corner highlights */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          backgroundColor: color,
          opacity: isHovered ? 0.2 : 0,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          backgroundColor: color,
          opacity: isHovered ? 0.15 : 0,
        }}
      />
    </div>
  );
}
