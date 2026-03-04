"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function ScrollBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradient1Ref = useRef<HTMLDivElement>(null);
  const gradient2Ref = useRef<HTMLDivElement>(null);
  const gradient3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create smooth gradient transitions based on scroll position

      // Hero to About section transition
      ScrollTrigger.create({
        trigger: "#about",
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
        onUpdate: (self) => {
          if (gradient1Ref.current) {
            gsap.set(gradient1Ref.current, {
              opacity: 0.08 + self.progress * 0.05,
              x: self.progress * 100,
            });
          }
        },
      });

      // About to Skills transition
      ScrollTrigger.create({
        trigger: "#skills",
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
        onUpdate: (self) => {
          if (gradient2Ref.current) {
            gsap.set(gradient2Ref.current, {
              opacity: self.progress * 0.1,
              scale: 1 + self.progress * 0.3,
            });
          }
        },
      });

      // Projects section
      ScrollTrigger.create({
        trigger: "#projects",
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        onUpdate: (self) => {
          if (gradient3Ref.current) {
            gsap.set(gradient3Ref.current, {
              opacity: Math.sin(self.progress * Math.PI) * 0.15,
              rotate: self.progress * 45,
            });
          }
        },
      });

      // Experience section
      ScrollTrigger.create({
        trigger: "#experience",
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
        onUpdate: (self) => {
          if (gradient1Ref.current) {
            gsap.set(gradient1Ref.current, {
              y: -self.progress * 200,
            });
          }
        },
      });

      // Contact section - bring gradients together
      ScrollTrigger.create({
        trigger: "#contact",
        start: "top 80%",
        end: "center center",
        scrub: 1,
        onUpdate: (self) => {
          if (gradient1Ref.current && gradient2Ref.current) {
            gsap.set(gradient1Ref.current, {
              x: (1 - self.progress) * 100 - 50,
              opacity: 0.1 + self.progress * 0.05,
            });
            gsap.set(gradient2Ref.current, {
              x: -(1 - self.progress) * 100 + 50,
              opacity: 0.1 + self.progress * 0.05,
            });
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Primary gradient - Walnut */}
      <div
        ref={gradient1Ref}
        className="absolute left-[-20%] top-[20%] h-[600px] w-[600px] rounded-full opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, rgba(139, 115, 85, 0.6) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Secondary gradient - Accent */}
      <div
        ref={gradient2Ref}
        className="absolute right-[-10%] top-[40%] h-[500px] w-[500px] rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(41, 151, 255, 0.5) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Tertiary gradient - Walnut Light */}
      <div
        ref={gradient3Ref}
        className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full opacity-0"
        style={{
          background: "radial-gradient(circle, rgba(212, 196, 176, 0.4) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
