"use client";

import { useRef } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "accent" | "walnut" | "none";
  padding?: "sm" | "md" | "lg";
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = "none",
  padding = "md",
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const paddingClass = {
    sm: "p-4",
    md: "p-6 lg:p-8",
    lg: "p-8 lg:p-12",
  }[padding];

  const glowClass = {
    accent: "hover:shadow-[0_0_40px_rgba(41,151,255,0.08)]",
    walnut: "hover:shadow-[0_0_40px_rgba(139,115,85,0.08)]",
    none: "",
  }[glow];

  return (
    <div
      ref={cardRef}
      className={`
        rounded-[20px] border border-white/[0.06] bg-white/[0.03]
        backdrop-blur-[20px]
        ${hover ? "transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]" : ""}
        ${glowClass}
        ${paddingClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
