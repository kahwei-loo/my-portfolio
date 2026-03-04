"use client";

import { useEffect, useRef } from "react";

export default function HoloCard({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    const border = borderRef.current;
    if (!card || !glare || !border) return;

    let rafId = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 50;
    let mouseY = 50;
    let isHovering = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      currentRotX = lerp(currentRotX, targetRotX, 0.1);
      currentRotY = lerp(currentRotY, targetRotY, 0.1);

      const scale = isHovering ? 1.04 : 1.0;
      card.style.transform = `perspective(700px) rotateX(${currentRotX.toFixed(3)}deg) rotateY(${currentRotY.toFixed(3)}deg) scale(${scale})`;

      glare.style.background = `radial-gradient(
        circle at ${mouseX}% ${mouseY}%,
        rgba(255,255,255,0.18) 0%,
        rgba(255,255,255,0.05) 40%,
        transparent 65%
      )`;

      const angle = (mouseX / 100) * 360;
      border.style.background = `conic-gradient(
        from ${angle}deg at 50% 50%,
        transparent 0deg,
        rgba(41,151,255,0.12) 30deg,
        rgba(41,151,255,0.65) 60deg,
        rgba(160,130,255,0.45) 85deg,
        rgba(41,151,255,0.12) 115deg,
        transparent 165deg
      )`;

      card.style.boxShadow = isHovering
        ? "0 16px 64px rgba(0,0,0,0.65), 0 0 40px rgba(41,151,255,0.1), 0 1px 0 rgba(255,255,255,0.1) inset"
        : "0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset";

      rafId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / rect.width) * 100;
      mouseY = (y / rect.height) * 100;
      targetRotX = ((y / rect.height) - 0.5) * -14;
      targetRotY = ((x / rect.width) - 0.5) * 14;
    };

    const onMouseEnter = () => {
      isHovering = true;
      glare.style.opacity = "1";
      border.style.opacity = "1";
    };

    const onMouseLeave = () => {
      isHovering = false;
      targetRotX = 0;
      targetRotY = 0;
      mouseX = 50;
      mouseY = 50;
      glare.style.opacity = "0";
      border.style.opacity = "0";
    };

    rafId = requestAnimationFrame(tick);
    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseenter", onMouseEnter);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative cursor-pointer overflow-hidden rounded-2xl ${className}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset",
        transition: "transform 0.05s linear",
      }}
    >
      {/* Conic border glow (hover only) */}
      <div
        ref={borderRef}
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition-opacity duration-500"
        style={{
          padding: "1.5px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Spotlight glare */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{ mixBlendMode: "soft-light" }}
      />

      {/* Content slot */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
