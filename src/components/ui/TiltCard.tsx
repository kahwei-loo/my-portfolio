"use client";

import { useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 15,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt;
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * maxTilt;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
      overwrite: "auto",
    });
  }, []);

  return (
    <div style={{ perspective: "1000px" }}>
      <div
        ref={cardRef}
        className={`rounded-[24px] border border-white/[0.06] bg-white/[0.03] backdrop-blur-[20px] transition-shadow duration-300 hover:border-white/[0.1] hover:shadow-[0_0_40px_rgba(41,151,255,0.08)] ${className}`}
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
}
